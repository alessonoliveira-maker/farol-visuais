# Histograma comparativo entre grupos

## O que é

Duas a quatro distribuições da mesma métrica na mesma régua de bins, em três arranjos: sobrepostas,
espelhadas costas com costas (pirâmide) ou empilhadas por categoria. Cada arranjo responde uma
pergunta diferente. O sobreposto mede o deslocamento entre os grupos; o espelhado mede o confronto
binário faixa a faixa; o empilhado diz de que grupo é feito o volume de cada faixa. O que dá sentido
aos três é a régua comum, então bin, domínio e ordem de desenho ficam fixos entre filtros: régua que
se ajusta ao recorte apaga justamente o deslocamento que a peça existe para mostrar.

É o modelo 01 com um grupo a mais, e a diferença toda está no que a comparação exige do desenho.

## Quando usar

- Comparar 2 ou 3 grupos na mesma régua: negócio novo contra cliente da casa, mídia paga contra
  indicação, este trimestre contra o mesmo trimestre do ano passado.
- Confronto binário forte por faixa, como ganhos contra perdas por faixa de ticket, em pirâmide.
- Saber de que grupo vem o volume de cada faixa quando o total manda, com até 4 grupos empilhados.
- Grupos com pelo menos umas 30 observações cada, e de tamanho parecido; com tamanhos muito
  diferentes, percentual dentro do grupo em vez de contagem.

## Quando evitar

- Quatro grupos ou mais sobrepostos: pequenos múltiplos de histograma (01) ou ridgeline (08). A
  terceira silhueta ainda se lê; a quarta vira borrão.
- Comparar a forma de cada grupo no empilhado: só a camada de base tem linha comum, as de cima
  flutuam sobre as de baixo. Para comparar forma, sobreposto ou facetas.
- Mais de dois grupos na pirâmide: ela tem dois lados e só dois.
- Composição a 100% por faixa: deixa de ser distribuição; barras da família 02 ou mosaico da 26.
- Formas suaves de grupos grandes: densidades sobrepostas (06), que é o mesmo modelo sem a serrilha
  do bin.
- Um grupo só: histograma (01), e sem legenda.

## Anatomia

1. **Régua única**, com bin e domínio vindos da métrica, escritos no rodapé ("faixas de 7 dias para
   os dois grupos") e iguais para todos os grupos.
2. **Eixo Y de contagem, com nome** ("oportunidades ganhas"), ou de percentual dentro do grupo quando
   os tamanhos diferem, e aí o nome do eixo diz qual dos dois é.
3. **Um papel de desenho por grupo**, fixado pela pergunta e não pelo `n`: barra preenchida para o
   grupo que carrega a mensagem, silhueta em degrau para o de comparação. Filtro que inverta os
   tamanhos não pode mudar a aparência da peça.
4. **Barras encostadas**, sem vão entre elas. Duas séries de `Bar` independentes repartem a banda do
   bin e o histograma vira gráfico de colunas, então só há dois caminhos: **uma série de barra só**,
   com o resto do desenho dentro do `shape` dela, ou **várias séries dividindo um `stackId`**, que
   ocupam uma posição de pilha só e deixam a banda inteira para a faixa. O espelhado da v2 usa o
   `stackId` com sinal, o empilhado da v3 usa o `stackId` com três camadas, e o sobreposto da v1 e da
   v4 usa a série única mais uma linha em degrau.
5. **Legenda com a forma da marca, o nome do grupo e o `n` de cada um.** Amostra quadrada promete
   barra preenchida; a silhueta pede amostra em degrau.
6. **A distância medida, escrita.** O par de medianas com seta entre elas e o valor da diferença, em
   margem reservada fora da área de plotagem.
7. **Ausência contada por grupo** no rodapé, nunca somada num total só: falha de cadastro não é igual
   nas duas carteiras, e o total esconderia isso.
8. **Tooltip por faixa com os dois grupos**, no formato "42 a 49 dias, negócio novo 12, cliente da
   casa 20".

## Versões

- `v1_ciclo-novo-contra-cliente-da-casa`: 167 oportunidades ganhas de negócio novo contra 143 de
  cliente da casa, ciclo em dias, bin de 7, domínio fixo de 0 a 210. A mediana do negócio novo sai em
  73 dias contra 39 do cliente da casa, **34 dias de diferença**, e a cauda é o que separa os dois:
  36% do negócio novo passa de 90 dias, contra 3% do cliente da casa. As faixas vazias dentro da
  amostra da barra, de 175 a 196 dias, levam a marca de base; 18 ganhas sem data de criação ficaram
  fora, 11 de um grupo e 7 do outro.
- `v2_ganhos-contra-perdas-por-faixa-de-ticket`: o arranjo espelhado. 84 ganhas contra 93 perdidas em
  faixas de R$ 25 mil, os dois lados num `stackId` só com `stackOffset="sign"`, domínio simétrico de
  24 oportunidades de cada lado calculado sobre o maior lado, `Math.abs` no tique, na dica e na
  conclusão. **A virada é na faixa de R$ 100 mil**, com 14 ganhas contra 9 perdidas, e ela leva fundo
  `--surface-sunken` e o nome escrito na própria faixa. O rótulo do eixo de ticket foi encurtado para
  o número em milhares pela REC-2, porque `R$ 175 mil` pede 77 px de eixo contra o teto de 64 da
  EIX-6.
- `v3_ciclo-empilhado-por-origem-em-foco`: o arranjo empilhado. 278 negócios de três origens em
  faixas de 14 dias, um `stackId` só, mídia paga na base por ser a maior e indicação por cima em
  `--chart-1`, as outras duas em neutro. **Indicação pesa 50,0% (6 de 12) na faixa de 0 a 14 dias** e
  22,3% do total, e a peça **recusa** o empilhamento acima de quatro origens, indicando pequenos
  múltiplos no lugar do gráfico. A separação entre camadas sai do `shape`, no topo de cada segmento,
  e não de um contorno de `<Bar>`.
- `v4_grupos-de-tamanho-desigual`: o sobreposto com grupos de tamanho muito diferente. 640 leads de
  mídia paga contra 38 de indicação, em percentual **dentro do próprio canal**, com a escala escrita
  no nome do eixo e o `n` bruto de cada canal na legenda. **Indicação chega a 34,2% (13 de 38) na
  faixa de 3 a 6 dias, contra 20,9% de mídia paga**, e o rodapé escreve que um único lead de
  indicação vale 2,6% do canal, que é o que a divisão esconde por construção. O alternador entre
  percentual e contagem é a prop `scale`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/CycleComparisonHistogram/`.
2. O `data` é **uma observação por oportunidade, por grupo**, não os bins contados. Quem bina, conta
   e mede a mediana é o componente, com a mesma régua para os dois; seletor que devolva bins já
   agregados por grupo é o jeito mais discreto de tornar a comparação impossível, porque cada grupo
   pode ter vindo de uma régua diferente sem ninguém perceber.
3. `binWidth` e `domainMax` vêm do registry da métrica, nunca do máximo observado, e valem para os
   dois grupos. Régua por grupo é o defeito que este modelo precisa recusar.
4. A ordem da tupla `groups` é a ordem de desenho e o papel de cada grupo: o primeiro é a barra
   preenchida, o segundo é a silhueta. Quem define isso é a pergunta da página, uma vez, e não o `n`
   do recorte.
5. `withoutCycle` é obrigatório em cada grupo: registro sem a medida não vira bin zero, sai da amostra
   e é contado no rodapé, por grupo. Página que não sabe informar esse número deveria dizer isso.
6. Com grupos de tamanhos muito diferentes, troque contagem por percentual dentro do grupo e escreva
   a troca no nome do eixo Y, como a v4 vai fazer. A peça não faz isso sozinha de propósito: a decisão
   é da página, que sabe se a pergunta é volume ou forma.
7. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
8. No espelhado da v2 o sinal é **geometria, não medida**: o seletor entrega contagem positiva nos
   dois desfechos e quem inverte um dos lados é o componente. Página que já mandar o lado negativo
   pronto vai fazer o `Math.abs` do tique mentir no dia em que alguém trocar a ordem da tupla.
9. No empilhado da v3, o `tone` de cada origem vem do dado e é o mapa fixo de categoria para papel da
   COR-3. Quem define qual origem está em foco é a pergunta da página, uma vez, e não o tamanho do
   recorte; a ordem da lista é a ordem da pilha e não se reordena por faixa.
10. Na v4 a prop `scale` decide entre percentual dentro do canal e contagem bruta, e a escolha aparece
    escrita no nome do eixo nas duas posições. Trocar a escala sem trocar o texto do eixo é a maneira
    mais silenciosa de trocar a pergunta da peça.
11. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Pendências conhecidas

- **A opacidade que o catálogo pedia não foi usada, e a substituição tem um custo.** A especificação
  da v1 pedia dois `Bar` sem `stackId`, `barGap` negativo e `fillOpacity` de 0,55. As duas metades
  disso já tinham sido medidas e reprovadas no acervo: duas séries de `Bar` repartem a banda do bin e
  as barras deixam de encostar (armadilha registrada em `16/01 v1`), e opacidade de 0,55 derrubou uma
  marca para 2,43:1 no tema claro, abaixo do piso de 3:1 (ACE-5, medida em `09/04`). A saída, barra
  preenchida contra silhueta em degrau, resolve os dois, e o preço é que os dois grupos deixam de ter
  a mesma forma de marca: o olho compara uma área com um contorno, o que favorece levemente o grupo
  preenchido. A legenda mostra as duas formas para o leitor saber o que está comparando. Se a
  simetria entre os grupos for o ponto da página, o arranjo certo passa a ser o espelhado da v2, em
  que os dois lados têm a mesma marca.
- **A silhueta não tem marca de faixa vazia, e a barra tem.** A barra preenchida distingue três
  coisas: faixa com caso, faixa vazia dentro da amostra (marca de base de 2 px) e depois do último
  caso (nada). A silhueta distingue duas: onde há amostra ela desenha, e depois do último caso ela
  para, o que resolveu o trecho em que a linha corria deitada no zero por um terço do eixo. O que
  sobra é o meio: o cliente da casa não tem nenhum caso entre 91 e 105 dias nem entre 126 e 147, e
  ali a linha simplesmente encosta no zero, o que se parece com uma contagem muito baixa. O buraco
  está desenhado, mas não está declarado como buraco. A saída provável é uma marca de base também
  para a silhueta, e ela não entrou aqui porque nenhuma outra peça do acervo mediu esse tratamento
  sobre linha. **Conferido na v4 e ainda em aberto:** a marca de base da silhueta cairia em cima da
  barra preenchida, onde `--chart-3` mede 1,47:1 no tema escuro e 1,03:1 no claro contra `--chart-1`,
  então ela precisaria de revestimento próprio e de mais 2 px de tinta dentro da marca. O que reduz o
  dano na v4 é a escala: com percentual dentro do canal, um lead do canal de 38 vale 2,6% e ocupa
  cerca de 12 px do plano, longe de se confundir com zero.
- **A silhueta em degrau começa e termina meio bin para dentro, e o motivo é a curva e não o dado**
  (medido na v4, vale igualmente para a v1). O `type="step"` do Recharts é a curva de degrau do d3,
  que troca de patamar no **ponto médio entre dois pontos** da série; como os pontos estão no centro
  do bin, o degrau cai exatamente no limite do bin, que é o que se quer. Nas pontas não há vizinho,
  então a linha nasce no centro do primeiro bin e morre no centro do último com caso, e o primeiro e
  o último meio bin ficam sem contorno. Na v4 isso são 1,5 dia de 30 em cada ponta. A correção seria
  desenhar a silhueta em SVG puro com a escala do eixo, e nenhuma versão precisou disso ainda.
- **Contorno de `<Bar>` separa camada, e separa faixa junto** (medido na v3, no primeiro render). O
  caminho óbvio para cumprir a COR-5 numa pilha é `stroke` no `<Bar>`, e ele contorna os quatro lados
  do retângulo: os dois lados verticais abrem um vão entre faixas vizinhas, e vão entre faixas afirma
  categoria separada, que é justamente o que o histograma não pode dizer. A separação precisa sair do
  `shape`, como um traço no topo do segmento. Sobra uma costura de meio pixel entre bins, que é o
  arredondamento da banda do Recharts e aparece em todo o acervo.
- **Num eixo de categoria deitado o primeiro item nasce no alto** (medido na v2). A REC-3 descreve o
  caso vertical, em que o primeiro item vai para a base; com `layout="vertical"` acontece o contrário,
  e a régua de ticket descia. A distribuição saía larga em cima e estreita embaixo, que é a silhueta
  de um funil e não de uma distribuição. Quem devolve o sentido de um histograma girado é o
  `reversed` do `YAxis`, e a conta de qualquer desenho ancorado na banda muda junto.
- **A linha de nomes é mais larga do que a seta que ela nomeia.** O texto tem cerca de 280 px e a
  seta entre as duas medianas tem cerca de 90 px. Ele ancora na ponta esquerda da seta e cresce para
  a direita, onde há espaço, e por isso no canvas `card` sobra folgado dentro da área; mas duas
  medianas muito à direita, ou um canvas mais estreito, empurrariam o fim do texto para fora. Não há
  reposicionamento automático, e o componente não mede o texto antes de desenhar: quem colar a peça
  numa moldura menor confere isso à mão.
- **A separação entre os dois grupos não vem do par de cores, vem do revestimento.** Medidas as 7
  categóricas contra `--chart-1`, nenhuma passa de 1,47 no tema escuro nem de 1,33 no claro: os
  tokens são calibrados contra o cartão, não uns contra os outros, então qualquer par de categóricas
  se confunde quando uma marca cruza a outra. O que resolve é o traço de `--surface-raised` por
  baixo da silhueta (9,50 e 6,00 contra `--chart-1`), e é dele que a peça depende. Enquanto a P7 das
  emendas em estudo não entregar um token de dado com contraste garantido, todo modelo desta família
  que sobreponha marcas vai precisar do mesmo recurso.
- **A distância está medida entre medianas, e só entre elas.** Duas distribuições podem ter a mesma
  mediana e espalhamentos muito diferentes, e essa peça não diz nada sobre isso. Quando a pergunta
  for o espalhamento, e não o deslocamento, o cartão irmão é o box plot (13) ou a faixa de percentis
  (29) da mesma métrica.

## Referências

- Catálogo: [FT, Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): observar a entrada *population pyramid*, descrita como histogramas costas com costas, dentro da coluna Distribution.
- Catálogo: [Vega-Lite, histogram from binned data](https://vega.github.io/vega-lite/examples/bar_binned_data.html): observar o caso em que os bins já vêm calculados, que é o contrário do que este modelo faz de propósito.
- Praticante: [Claus Wilke, histograms and density plots](https://clauswilke.com/dataviz/histograms-density-plots.html): observar a crítica ao empilhamento quando a pergunta é comparar formas, que é o limite entre a v1 e a v3.
- Praticante: [From Data to Viz, ridgeline](https://www.data-to-viz.com/graph/ridgeline.html): observar a recomendação de trocar sobreposição por faixas deslocadas quando os grupos passam de meia dúzia.
- Portal de design: [SetProduct, distribution chart patterns](https://setproduct.com/charts/patterns/distribution): observar o tratamento de duas séries de distribuição em tema claro e escuro, com legenda e anotação.
