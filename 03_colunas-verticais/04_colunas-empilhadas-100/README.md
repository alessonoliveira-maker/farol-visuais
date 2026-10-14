# Colunas empilhadas 100%

## O que é

Cada coluna é normalizada para a mesma altura, então o que se lê é o **mix** de cada período, não
o tamanho. O ganho é uma segunda base de comparação no topo, além da do zero: os componentes das
pontas da pilha, base e topo, ficam com referência comum entre colunas. O custo é esconder o
volume, um mês com 12 leads e outro com 900 ficam idênticos, então o `n` de cada período precisa
estar sempre escrito perto da coluna.

## Quando usar

* O mix por período é a pergunta, em até 6 componentes coloridos e até 12 períodos.
* Os componentes das pontas, encostados na base e no topo, são os que o leitor precisa acompanhar
  entre colunas.
* Um componente cruza um limiar de participação e o momento da virada é a mensagem.
* Volumes por período bem diferentes, desde que o `n` de cada período esteja escrito.

## Quando evitar

* O tamanho absoluto importa para a decisão: colunas empilhadas com total (modelo 03).
* Um único período sem série de tempo: barra 100% (`02_barras-horizontais/04`) ou waffle (22).
* Componentes do meio cuja evolução é a pergunta: small multiples (modelo 08).
* Série dominada por períodos com amostra muito pequena: agregar o período ou mostrar taxa com
  volume, nunca desenhar 100% de uma base que não sustenta leitura (v4).
* Sem o `n` disponível: o gráfico vira decorativo; não publicar.

## Anatomia

1. **Segmentos empilhados** (`Bar` com o mesmo `stackId`, `stackOffset="expand"` no `BarChart`
   para o Recharts normalizar a partir do valor absoluto): a cor pertence à categoria por chave
   fixa, nos slots 1, 3, 6, 5, 2, 4 (COR-8), nunca à posição no array.
2. **As duas pontas da pilha** (base e topo) são os únicos segmentos com referência comum entre
   colunas; o componente que a página precisa comparar mês a mês vai numa delas.
3. **O `n` do período**, sempre visível: acima da coluna por `LabelList` (v1, v2) ou na linha
   abaixo do eixo de categoria (v3, v4). Sem ele o 100% mente; nenhuma versão deixa o `n` só na
   dica (correção de 2026-09-18, que fechou a divergência entre esta seção e a de "Quando usar").
4. **Percentual inteiro por `largestRemainder`**, nunca `Math.round` solto: a soma tem que fechar
   em 100 mesmo com muitas categorias.
5. **Rótulo dentro do segmento só acima do piso de 18 px** (texto de 12 px mais 6 px, decisão do
   dono de 2026-09-17): abaixo disso o percentual sai para fora da marca, nunca cortado.
6. **Contorno entre segmentos** (`stroke="var(--surface-raised)"`, 1,5 px) separa vizinhos que não
   contrastam entre si (COR-5); a categoria de ausência ("Sem motivo registrado") sai vazada, com
   contorno `--text-muted`, sempre por último e nunca somada a "Outros". Na legenda, essa ordem de
   pilha é lida de cima para baixo (ROT-4): em v3 e v4 o item do topo da pilha vem primeiro.
7. **Eixo de percentual** em `[0, 0,5, 1]` via `formatPercent`, sem grade vertical.
8. **Estado abaixo do piso de amostra** (v4): contorno tracejado e a palavra escrita, nunca
   opacidade sobre a marca colorida, porque opacidade reduz o contraste abaixo do piso da ACE-3
   sem precisar.

## Versões

* **[v1_mix-de-origem-com-n](v1_mix-de-origem-com-n/)**: caso básico com três origens de lead em
  6 meses, `n` de cada mês escrito acima da coluna com o substantivo e o percentual do último mês
  na legenda, porque nenhum dos três segmentos tem espaço garantido para o texto entrar dentro
  dele. Mídia paga e indicação nas pontas; orgânico no meio, com um mês de valor quase zero.
  Preview: [escuro](v1_mix-de-origem-com-n/preview.svg) ·
  [claro](v1_mix-de-origem-com-n/preview-claro.svg).
* **[v2_origem-paga-passa-de-70](v2_origem-paga-passa-de-70/)**: mídia paga na base, em chart-1,
  contra as demais origens em `--line-strong`; `ReferenceLine` em 70% com rótulo de limiar na
  margem e anotação curta no mês em que o segmento cruza o limiar, numa segunda linha acima do `n`
  para não repetir a frase de leitura. O `n` de cada mês vai acima da coluna, como em v1. O
  primeiro mês tem fatia paga de só 7%, abaixo do piso de 18 px do rótulo interno, e o percentual
  sai para cima da marca com halo. Preview: [escuro](v2_origem-paga-passa-de-70/preview.svg) ·
  [claro](v2_origem-paga-passa-de-70/preview-claro.svg).
* **[v3_perdas-por-motivo-por-trimestre](v3_perdas-por-motivo-por-trimestre/)**: caso denso do
  Farol, com motivos de perda em 8 trimestres. Ordem da pilha fixada uma vez pelo peso do motivo
  no trimestre mais recente (concorrência cresce de menor para maior ao longo da série e ainda
  assim mantém a posição fixa), três motivos menores em "Outros (3 motivos)", `n` de perdas com o
  substantivo abaixo do eixo em cada trimestre, legenda lateral larga o bastante para nenhum nome
  cortar (com o percentual do último trimestre alinhado à direita) e dica com `itemSorter` na
  ordem da pilha. Preview: [escuro](v3_perdas-por-motivo-por-trimestre/preview.svg) ·
  [claro](v3_perdas-por-motivo-por-trimestre/preview-claro.svg).
* **[v4_amostra-pequena-e-sem-registro](v4_amostra-pequena-e-sem-registro/)**: caso limite com um
  trimestre de 4 perdas (abaixo do piso nomeado `SAMPLE_FLOOR = 10`) e um trimestre com zero
  perdas. O primeiro ganha contorno tracejado e a palavra "amostra pequena" via `ReferenceArea`,
  nunca opacidade sobre a marca; o segundo fica vazio com a palavra "sem perda" dentro da coluna e
  "0 perdas" no `n` abaixo do eixo, porque é zero medido (EST-3) e não indisponibilidade de coleta
  (EST-2), nunca uma coluna cheia. A legenda lê de cima para baixo, como a pilha. A dica troca o
  valor absoluto por `formatRateWithVolume`. Preview:
  [escuro](v4_amostra-pequena-e-sem-registro/preview.svg) ·
  [claro](v4_amostra-pequena-e-sem-registro/preview-claro.svg).

## Como colar no Farol

1. Decida a ordem da pilha antes de copiar: os dois componentes com referência comum entre
   colunas (base e topo) são os que a página precisa comparar mês a mês, não um ranking do dado
   do momento; em `v3`, calcule a ordem uma vez a partir do período mais recente e reutilize para
   toda a série, nunca reordene coluna a coluna.
2. Ligue `data` ao seletor da página; o `n` de cada período é recalculado no próprio Chart a
   partir dos componentes brutos (`stackOffset="expand"` cuida da geometria), nunca recebido já
   normalizado, para o rótulo e o desenho nunca divergirem.
3. Ao ligar dado real, defina o piso de amostra (`SAMPLE_FLOOR` em `v4`) com o time de negócio
   antes de publicar: é ele que decide quando o mix vira ruído.
4. Se a página tem mais de 6 categorias coloridas, agrupe em "Outros (n=X)" **antes** de passar
   `data`; o Chart não decide sozinho o que entra na cauda, só desenha a categoria já agregada.
5. Confira, com o dado real, se algum período cai abaixo do piso de amostra ou fica com total
   zero: os dois estados de `v4` são o que impede o 100% de fingir confiança que o dado não tem.

## Referências

* Catálogo: [Vega Lite, Normalized (Percentage) Stacked Bar Chart](https://vega.github.io/vega-lite/examples/stacked_bar_normalize.html)
  e a [versão com rótulos](https://vega.github.io/vega-lite/examples/stacked_bar_h_normalized_labeled.html).
  Observar `stack: "normalize"` e o rótulo centrado no segmento.
* Catálogo: [Highcharts, Stacked Percentage Column](https://www.highcharts.com/demo/highcharts/column-stacked-percent).
  Observar a legenda e a dica mostrando valor absoluto e percentual juntos.
* Catálogo: [Datawrapper Academy, o que considerar em colunas empilhadas](https://www.datawrapper.de/academy/what-to-consider-when-creating-stacked-column-charts).
  Observar que o 100% cria uma segunda base de comparação no topo do gráfico.
* Praticante: [Storytelling with Data, sobre 100% empilhado](https://www.storytellingwithdata.com/blog/2016/1/12/is-there-a-single-right-answer).
  Observar que não existe resposta única e a escolha depende da pergunta.
* Implementação: [Tremor, BarChart](https://www.tremor.so/docs/visualizations/bar-chart). Observar
  o `type="percent"`, o equivalente do `stackOffset="expand"` do Recharts usado aqui.
* Farol: `_render/exemplos/02_barras-horizontais/01_simples-ordenada/v1_ranking-com-destaque`
  (molde de acabamento em Recharts nativo) e `02_barras-horizontais/04_barras-empilhadas-100`
  (o mesmo modelo na horizontal, fonte do piso de rótulo interno e do padrão de estado de n
  baixo revisto aqui sem opacidade sobre a marca).

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18._

* **v1**: a legenda imprime o percentual de set/26 sem dizer de que mês ele é; quem compara a
  legenda com a coluna de abr/26 lê uma divergência que não existe.
* **v1**: o estado vazio traz só a frase, sem o ícone `Filter` de 16 px que a EST-1 descreve.
* **v1**: a legenda corre da base para o topo da pilha; a ROT-4 pede a ordem de leitura de cima
  para baixo. Corrigido em v4 nesta rodada; v1 já estava aprovada e não foi tocada.
* **Modelo**: nenhuma das quatro versões passa de 8 períodos, então o teto de 12 períodos que o
  "Quando usar" declara segue sem peça que o exercite.

_Segunda leitura de 2026-09-18, revisor independente._

* **v1**: a dica não declara `itemSorter`, então a ordem dos itens não acompanha a pilha, que é o
  que a DIC-4 pede. Corrigido em v3 nesta rodada; v1 já estava aprovada e não foi tocada.

_Terceira leitura de 2026-09-18, revisor independente (rodada de correção deste modelo)._

Todos os itens abaixo foram corrigidos nesta rodada, na causa apontada:

* **v2**: o `n` de cada mês não aparecia no desenho (só na dica), contra o que a seção "O que é" e
  o caso de uso pedem; agora vai acima da coluna, como em v1.
* **v3**: a legenda cortava "Sem retorno do cont..." em reticência (TIP-7) e o nome completo não
  estava na frase acessível; `LEGEND_WIDTH` subiu de 168 para 216 px, largura suficiente para o
  rótulo mais longo sem cortar.
* **v4**: faltava o `n` por trimestre no desenho (só na dica), a mesma causa de v2; agora vai numa
  linha abaixo do eixo, como em v3.
* **v2**: a linha de leitura e a anotação sobre a coluna repetiam a mesma frase; a anotação virou
  "cruza 70% aqui", curta e sem o mês, que já está na linha de leitura.
* **v2**: o rótulo da `ReferenceLine` dizia "meta 70%" para um caso de uso de limiar de
  participação; agora diz "limiar 70%".
* **v3**: "n = 80" não trazia o substantivo (NUM-6) e colidia em sentido com "Outros (n=3)"; agora
  o eixo escreve "80 perdas" e a categoria residual virou "Outros (3 motivos)".
* **v3**: a linha de leitura arredondava a concorrência do primeiro e do último trimestre com
  `Math.round`, e a legenda usa o maior resto; os dois agora leem a mesma conta.
* **v3**: a dica não declarava `itemSorter`; agora segue a ordem visual da pilha.
* **v4**: "sem registro" não separava o trimestre sem perda medida (EST-3) do trimestre sem coleta
  (EST-2); agora a coluna diz "sem perda" e o `n` abaixo do eixo escreve "0 perdas", explícito.
* **v4**: a legenda corria da base para o topo da pilha, contra a ROT-4; agora lê do topo para a
  base, como a legenda lateral de v3.

_Quarta leitura de 2026-09-18, revisor independente (nenhum bloqueante nas quatro versões)._

* **v2**: o percentual de abr/26 (7%), por sair da marca para cima, fica desenhado dentro do
  segmento neutro vizinho; o leitor apressado pode atribuir os 7% a "Outras origens" em vez de à
  mídia paga. Um conector curto até a fatia, ou o rótulo abaixo da base, fecharia a atribuição.
* **v2**: o rótulo interno de percentual vai em peso 700 nas seis colunas, e a TIP-3 reserva o 700
  para no máximo dois elementos por visual; 500 no corpo e 700 só na coluna que cruza o limiar
  resolveria sem perder ênfase.
* **v2**: o "22%" de mai/26 encosta na borda direita da marca, com folga zero medida no PNG dos
  dois temas; ainda lê limpo, mas não sobra espaço para percentual de três dígitos.
* **v3**: a legenda lateral imprime o percentual do último trimestre sem nomear T4/26, o mesmo
  ponto já anotado em v1.
* **v3**: "Outros (3 motivos)" usa o slot 2 e "Concorrência" o slot 6, par que a COR-8 mede em
  ΔE 4,1 no tema claro sob deuteranopia; aqui a ordem fixa da pilha e a legenda na mesma ordem
  suprem a distinção, mas não há rótulo em cada marca, que é o que a regra pede para esse par.
* **v4**: `small` e `empty` usam `rows.find`, então só o primeiro trimestre abaixo do piso e o
  primeiro sem perda ganham marca e palavra; com dois trimestres no mesmo estado, o segundo passa
  calado no desenho e na frase acessível.
* **v4**: o catálogo pede a marca abaixo do piso "em opacidade reduzida" e a palavra "sem
  registro"; a versão entrega contorno tracejado e "sem perda", divergência deliberada e explicada
  no `meta.json` e na Anatomia. A entrada do catálogo é que precisa acompanhar.
* **v4**: a dica descarta motivos com valor zero, então um motivo que zerou no trimestre some da
  lista em vez de aparecer com 0.

## Pendências conhecidas

* **v2**: o halo atrás do percentual de 7% (abaixo do piso de 18 px) abre um entalhe visível no
  segmento neutro vizinho, nos dois temas. É o comportamento descrito na própria ROT-7 (o halo é
  obrigatório ao cruzar outra marca, e sua tinta apaga o que está por baixo); não é um bug de
  implementação e não foi alterado nesta rodada. Corrigir de fato pede um token de halo por
  superfície, que a seção 17.4 já lista como pendência aberta do catálogo (candidata a proposta).
* **v2**: o segmento "Outras origens" (neutro, `--line-strong`) não traz percentual escrito em
  cada coluna, só a legenda do último mês o declara; a COR-2 liga esse token à exigência de valor
  escrito junto da marca. Não implementado nesta rodada: a versão só precisa que o leitor acompanhe
  a origem paga (item 2 da Anatomia), e um segundo rótulo por coluna competiria por espaço com o
  `n` e a anotação de limiar sem head room testado. Fica como decisão de desenho pendente de
  validação com quem mantém o catálogo, não como defeito corrigido às pressas.
* **v1** (fora do escopo desta rodada, versão já aprovada): legenda lê da base para o topo da
  pilha (ROT-4), dica sem `itemSorter` (DIC-4), estado vazio sem o ícone `Filter` (EST-1) e
  percentual da legenda sem indicar o mês. Ver "Observações da revisão" acima.
* **Modelo**: nenhuma das quatro versões passa de 8 períodos; o teto de 12 períodos do "Quando
  usar" segue sem peça de teste que o exercite.
