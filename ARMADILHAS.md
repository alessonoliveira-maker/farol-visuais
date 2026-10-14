# Armadilhas da stack

Memória de produção do catálogo. Cada entrada aqui custou pelo menos um render errado, e quase
nenhuma delas é pega pelo `npm run check`: são defeitos de leitura, não de código, então o programa
passa verde e o desenho mente.

**Como ler, agora que são 69 entradas.** Não leia de ponta a ponta: são 1170 linhas e a sua peça não
esbarra em todas. Leia o **Índice** logo abaixo, inteiro, que cabe numa tela e traz o sintoma de cada
entrada; depois abra só as entradas que o seu visual pode tocar. As dez perguntas de **Antes de
entregar**, no fim, essas sim você responde sempre, uma por uma, contra o PNG que você gerou.

Quem descobre uma armadilha nova acrescenta aqui, com o sintoma na tela, a causa e a saída. Sintoma
primeiro, porque é por ele que a próxima pessoa vai procurar. Fato que vale para qualquer peça vem
para cá **no mesmo turno em que aparece**; nota no `meta.json` ou no README do modelo serve para desvio
específico daquela peça, e ninguém depois lê. A regra existe porque a alternativa está medida: um fato
deste arquivo foi redescoberto de forma independente por 33 modelos diferentes.

Este arquivo é sobre a ferramenta. As regras de desenho moram no [CONTRATO.md](CONTRATO.md) e a
revisão em [CHECKLIST_REVISAO.md](CHECKLIST_REVISAO.md); nenhum dos três substitui os outros.

Cada entrada tem um **código estável** por seção, no idioma que o `CONTRATO.md` já usa com `TIP-3`
e `ACE-5`: `REC` para Recharts, `GEO` para geometria e leitura, `TOK` para tokens e contraste, `DAD`
para dado. **Cite sempre pelo código.** O código nunca é reatribuído: entrada nova recebe o próximo
número livre da sua seção e entrada removida deixa o código vago, então uma referência escrita hoje
continua valendo depois. A numeração corrida que existia aqui até 2026-09-28 fazia o contrário: inserir
um fato no meio deslocava tudo abaixo, e um briefing de família chegou a herdar a contagem velha e
deixar uma entrada inteira de fora.

O número entre parênteses ao lado de cada título é em quantos MODELOS distintos o mesmo fato foi
redescoberto de forma independente, ou em quantos a contramedida já está aplicada. Serve para priorizar
a leitura: o que aparece em dezenas de modelos você vai encontrar na sua peça também.
---

## Índice

São 69 entradas, mais os avisos de fluxo. Varra por sintoma, leia só a que se parece com o seu, e
cite pelo código.

**Recharts**

- **REC-1** A meta desaparece justamente no mês em que ela é passada (33 modelos)
- **REC-2** O rótulo do eixo quebra em três linhas e desloca o grupo inteiro (15 modelos)
- **REC-3** O eixo de categoria empilha de baixo para cima (10 modelos)
- **REC-4** Rótulo de `ReferenceLine` dentro da área colide com a primeira faixa (7 modelos)
- **REC-5** O rótulo escreve o valor de uma categoria na posição de outra (5 modelos)
- **REC-6** A dica não consegue dizer duas coisas de formatos diferentes (5 modelos)
- **REC-7** O texto do centro do anel sai nulo ou no canto superior esquerdo (4 modelos)
- **REC-8** As saídas empilham por cima das entradas em vez de descer do zero (4 modelos)
- **REC-9** A faixa aparece cheia num período em que não houve nada (4 modelos)
- **REC-10** `tick` customizado desaparece de metade das categorias (4 modelos)
- **REC-11** O zero medido não desenha e leva o rótulo embora (3 modelos)
- **REC-12** A pilha não reordena por período, e a ordem é a dos filhos (3 modelos)
- **REC-13** Quem é pintado por último cobre o vizinho (3 modelos)
- **REC-14** `Scatter` sobre eixo de categoria abre uma banda por ponto (3 modelos)
- **REC-15** `ZAxis` ausente deixa o raio do ponto variar (3 modelos)
- **REC-16** Dois painéis alinhados nascem deslocados dezenas de pixels (2 modelos)
- **REC-17** O corpo dos painéis de cima fica maior que o dos de baixo (2 modelos)
- **REC-18** A perda vai toda para a última coluna do Sankey (2 modelos)
- **REC-19** Duas séries de `Bar` repartem a banda, e o histograma deixa de encostar (2 modelos)
- **REC-20** `ErrorBar` mede a distância a partir do valor da ponta, não de cada lado da caixa (2 modelos)
- **REC-21** O passo automático do eixo esconde o limiar, repete um mês ou pula outro (2 modelos)
- **REC-22** Cinco colunas ganham a tampa de excedente que só uma deveria ter (1 modelo)
- **REC-23** O último ponto e o rótulo final não aparecem em nenhum recorte (1 modelo)
- **REC-24** A marcação de um único período some em linha e área, e cobre a banda inteira em barras (1 modelo)
- **REC-25** O Treemap pinta os filhos depois do grupo e cobre o selo dele (1 modelo)
- **REC-26** O segundo grupo de um histograma não cabe no `shape` do primeiro (1 modelo)
- **REC-27** O `shape` da `ReferenceArea` é o único lugar que sabe onde duas referências caíram (1 modelo)
- **REC-28** O painel sai em branco e em silêncio, e o `shape` da `ReferenceArea` não recebe retângulo (1 modelo)
- **REC-29** O eixo descarta tique em corpo curto e leva a grade junto (2 modelos)
- **REC-30** O `axisLine` do `AXIS_PROPS` vem ligado, e a ordem do espalhamento decide (20 modelos)
- **REC-31** O `range` do `ZAxis` é área em px², e a `shape` própria nunca recebe raio (1 render perdido)
- **REC-32** Com `allowDuplicatedCategory={false}` o `dataKey` do `Bar` é avaliado nas linhas do `Scatter` (render sem preview)
- **REC-33** Nó de Sankey desequilibrado encolhe o diagrama inteiro, em silêncio (1 caso no acervo)
- **REC-34** Com marca `Line`, o `LabelList` entrega caixa de tamanho zero e `position` não posiciona nada (confirmado no pacote)

**Geometria e leitura**

- **GEO-1** Nenhum preset de canvas fecha o cartão depois que ele ganha linhas escritas (31 modelos)
- **GEO-2** Texto truncado na célula (30 modelos)
- **GEO-3** A fatia com um quinto do valor desenha um terço da área (11 modelos)
- **GEO-4** O halo do rótulo apaga justamente a marca que ele deveria deixar ver (4 modelos)
- **GEO-5** O anel de fora parece maior com o mesmo percentual (3 modelos)
- **GEO-6** A marca sai mais fina do que o `maxBarSize` declarado (2 modelos)
- **GEO-7** Rótulo de coluna mais largo que a célula (2 modelos)
- **GEO-8** A caixa do rótulo é medida com a fonte errada e guarda o erro para sempre (1 modelo)
- **GEO-9** Contorno fechado de região vira diagonal cruzando a grade (1 modelo)
- **GEO-10** Sobra de largura no canvas `faixa` (1 modelo)
- **GEO-11** "Pilha mais escura" não vale nos dois temas (1 modelo)
- **GEO-12** A ordem das faixas é por métrica, e nada no cartão declara (3 modelos)
- **GEO-13** A matriz triangular deixa a primeira medida sem nome (1 modelo)
- **GEO-14** A linha de rodapé que explica o desenho encolhe o próprio desenho (1 modelo)
- **GEO-15** No topo de um visual radial, o rótulo do setor nasce colado ao rótulo da escala (1 modelo)
- **GEO-16** Respiro em medida absoluta quebra codificação por área, e a célula pequena paga tudo (erro de 87% medido)
- **GEO-17** O glifo em linha de texto engorda a linha no preview, e só no preview (medido em 2026-09-29)
- **GEO-18** O `<svg>` esticado encolhe o texto, e o piso de 11 px passa a valer só no papel (14 peças medidas)
- **GEO-19** Na borda curva, a âncora fora da marca reentra pelo canto de baixo (medido em 2026-09-29)

**Tokens e contraste**

- **TOK-1** A marca desaparece contra o cartão, e a tabela do contrato mandava usá-la assim (18 modelos)
- **TOK-2** Dois degraus da rampa sequencial não têm texto legível nos dois temas (7 modelos)
- **TOK-3** Não existe rampa divergente nos tokens (4 modelos)
- **TOK-4** Duas marcas de cores diferentes se fundem onde se sobrepõem (3 modelos)
- **TOK-5** `--line-strong` não se vê como marca, e com opacidade desaparece (3 modelos)
- **TOK-6** `fillOpacity` derruba a marca abaixo do piso no tema claro (2 modelos)
- **TOK-7** Degrau do meio da rampa sequencial usado como cor categórica (1 modelo)
- **TOK-8** A rampa sequencial não tem quatro degraus úteis para carregar ordem (famílias 15 e 23)
- **TOK-9** Ninguém mede marca contra marca, e é ali que o destaque morre (medido em 2026-09-28)
- **TOK-10** Guia que atravessa marca preenchida não tem token que sirva (medido em 2026-09-28)

**Dado**

- **DAD-1** Taxa escrita sem o volume (38 modelos)
- **DAD-2** Ausência virando zero (38 modelos)
- **DAD-3** Dado gerado sem semente fixa, ou lido do relógio (8 modelos)
- **DAD-4** O ponto percentual sai escrito como percentual (4 modelos)
- **DAD-5** O corpo do cartão e a frase acessível dizem o mesmo número de dois jeitos (8 peças)
- **DAD-6** A guarda de vazio testa a lista vizinha, e a mediana nasce zero (9 modelos)
- **DAD-7** A composição melhora, o volume despenca, e a peça só mostra a composição (3 modelos)
- **DAD-8** Nome real de produto ou plataforma (0 modelos, pego pelo guarda)
- **DAD-9** O recorte de período só existe na frase acessível (1 modelo)
- **DAD-10** O comentário do topo promete um rótulo que o desenho não desenha (1 modelo)

## Recharts

### REC-1. A meta desaparece justamente no mês em que ela é passada [33 modelos]

- **Sintoma.** A linha de meta, o teto ou a faixa de referência desenham normalmente por meses, e
  somem sem aviso no recorte em que o realizado ultrapassa o próprio limite. Parece dado faltando.
- **Causa.** O padrão de `ifOverflow` em `ReferenceLine` e `ReferenceArea` é `discard`: o valor que
  cai fora do domínio calculado não é desenhado, e o domínio vem do dado, não da referência.
- **Saída.** `ifOverflow="extendDomain"` em toda referência, sempre, mais o valor dela escrito em
  texto (ANO-3). A regra está escrita uma vez, em `13_progresso-meta-e-gauge/README.md`, e a
  contramedida já aparece em 33 modelos; quem esquece descobre no primeiro recorte em que a meta é
  batida, que é exatamente o recorte que interessa.

### REC-2. O rótulo do eixo quebra em três linhas e desloca o grupo inteiro [15 modelos]

- **Sintoma.** Um tique como "R$ 700 mil" ou "−R$ 50 mil" aparece em duas ou três linhas, e o grupo
  inteiro do eixo se desloca, deixando o corpo do gráfico fora do centro do cartão.
- **Causa.** O `<Text>` padrão do Recharts quebra o rótulo quando ele não cabe na largura reservada
  ao eixo, e a largura reservada é a que foi declarada, não a que o texto pede.
- **Saída.** Reservar a largura do rótulo mais longo numa linha só, medida em 56 px para moeda em
  milhares, e conferir no `preview.svg`, nunca só na constante. Quando a largura não pode crescer, o
  que muda é a unidade do rótulo, nunca o número de linhas. Visto em
  `03_colunas-verticais/06_colunas-contra-meta-ou-limiar/v1` e `05_areas/07_area-de-diferenca/v1`.
- **Emenda de 2026-10-02 (F0.5c): o negativo mudou de texto e ficou mais largo, e os 56 px desta entrada
  não se confirmam.** Desde o F0.5b a moeda negativa sai com o U+2212 antes do símbolo (`−R$ 50 mil`, e
  não mais `R$ -50 mil` nem `R$ −50 mil`). Medido numa bancada fora do acervo, com o tique padrão do
  Recharts e o eixo de 46 a 90 px, de 1 em 1, o menor eixo que mantém o tique em uma linha é **62 px**
  em `R$ 60 mil`, **70 px** em `R$ 700 mil`, **72 px** em `−R$ 50 mil` e **81 px** em `−R$ 200 mil`; o
  mesmo valor com o texto antigo, `R$ -200 mil`, pedia 76. A tabela inteira e o motivo estão na `EIX-6`
  do contrato. O que a entrada manda continua valendo e é o que decide: **conferir no `preview.svg`,
  nunca só na constante**, e com mais razão em peça que já reservava a largura para o texto antigo.

### REC-3. O eixo de categoria empilha de baixo para cima [10 modelos]

- **Sintoma.** A peça ordenada por mediana, ranking ou volume sai com o melhor caso no rodapé do
  cartão, que é o último lugar onde alguém olha.
- **Causa.** Numa peça de categoria na vertical, o primeiro item do array vai para a base.
- **Saída.** Ordenar **decrescente** quando se quer o melhor caso no topo, e escrever o porquê em
  comentário: quem vier depois vai achar que a ordenação está invertida por engano. Visto em
  `16_distribuicao/03_strip-plot-e-beeswarm/v1` e `02_barras-horizontais/07_butterfly-piramide/v1`.
- **Emenda de 2026-09-29: o sentido não é um só, e esta entrada era incompleta, não errada.** Ela descreve
  o `ScatterChart` com `<YAxis type="category">`, em que o primeiro item do array vai para a **base**, e
  isso continua valendo nos 10 modelos citados. Mas no `BarChart` com **`layout="vertical"`** foi medido o
  oposto: o primeiro item nasce **no alto**, e sem `reversed` uma distribuição sai com cara de funil. Ou
  seja **o sentido depende do componente e de como o eixo de categoria é declarado**, e as duas afirmações
  são verdadeiras em contextos diferentes.
- **Por isso a regra aqui é de teste e não de valor:** não confie em nenhuma das duas afirmações de
  memória; **renderize uma vez e olhe onde caiu o primeiro item do array**, e escreva no comentário qual
  foi o sentido observado naquele componente, com o nome dele. Custa um render e evita inverter a
  ordenação inteira. A tentativa de guardar "o Recharts empilha de baixo para cima" como fato único é o que
  produziu esta emenda, e inverter a frase produziria o erro simétrico.

### REC-4. Rótulo de `ReferenceLine` dentro da área colide com a primeira faixa [7 modelos]

- **Sintoma.** "SLA 30 min" escrito por cima da caixa ou dos pontos da primeira categoria.
- **Saída.** `position: 'top'` joga o rótulo para fora da área de plotagem; sobe a margem superior
  para uns 20 px. Em canvas alto dá para trazer de volta para dentro. O rótulo fica preso à faixa
  reservada no topo do corpo, nunca à altura da própria linha de referência: com a meta perto do
  valor de um mês, a altura da linha cai em cima do rótulo daquela coluna e as duas legendas colidem.
  Fixo acima da grade mais alta, o rótulo nunca compete com o valor de nenhuma coluna, qualquer que
  seja o recorte. Visto em `03_colunas-verticais/06_colunas-contra-meta-ou-limiar/v1` e
  `05_areas/01_area-simples/v2`.

### REC-5. O rótulo escreve o valor de uma categoria na posição de outra [5 modelos]

- **Sintoma.** Um único "+3" aparece onde deveriam aparecer cinco, ou o texto "indisponível" nasce
  uma linha abaixo da categoria que não tem dado. O número está certo e o lugar está errado.
- **Causa.** Duas coisas ao mesmo tempo. O `content` de um `LabelList` recebe só as props que são
  atributos SVG válidos (`svgPropertiesAndEvents`), e `payload` não é uma delas, então o rótulo não
  vê a linha do dado. E o `index` que chega conta os retângulos que a série realmente desenhou, não
  as linhas do array: numa pilha, o mês sem segmento não entra na contagem.
- **Saída.** Um `dataKey` próprio para o texto do rótulo, calculado junto com o dado; o Recharts lê
  esse campo do `payload` da própria linha por `getValueByDataKey`, e o texto chega sempre certo para
  aquele retângulo, sem precisar de índice. A outra saída é desenhar o rótulo dentro do `shape` do
  `Bar`, que recebe o `payload` inteiro. Visto em `02_barras-horizontais/02_barras-agrupadas/v3`,
  `03_barras-empilhadas/v1`, `04_barras-empilhadas-100/v2`,
  `03_colunas-verticais/06_colunas-contra-meta-ou-limiar/v2` e `07_realizado-e-projecao/v2`.

### REC-6. A dica não consegue dizer duas coisas de formatos diferentes [5 modelos]

- **Sintoma.** A taxa aparece formatada como moeda, ou o valor derivado de duas séries não aparece,
  ou o TypeScript recusa o `payload` nativo.
- **Causa.** O `ChartTooltip` do Farol é fixo: um formatador por dica, sem valor derivado de duas
  séries, e tipado para número puro (`Payload<number, string>`), mais estreito que o `ValueType` da
  biblioteca, que admite array.
- **Saída.** O essencial vai escrito no desenho, não na dica (DIC-1). Quando a dica precisa mesmo de
  uma linha derivada, montar o mesmo desenho à mão, com o mesmo fundo, borda e algarismo tabular, e
  buscar o valor na própria linha do dado, nunca no `payload` que o Recharts devolve. Visto em
  `02_barras-horizontais/05_barras-contra-meta/v3`, `03_colunas-verticais/02_colunas-agrupadas/v1` e
  `08_combinados-e-eixo-duplo/06_real-contra-referencia-com-painel-de-variacao/v1`.

### REC-7. O texto do centro do anel sai nulo ou no canto superior esquerdo [4 modelos]

- **Sintoma.** O total central de uma rosca não aparece, ou nasce em (0,0), fora do furo.
- **Causa.** O Recharts resolve o `viewBox` de `<Label position="center">` pelo contexto cartesiano,
  que uma `Pie` ou um `RadialBarChart` não publicam. O mesmo tipo fraco aparece em tempo de
  compilação: o `label` de `RadialBar` declara `viewBox` como `{x, y, width, height}`, e o formato
  polar real não tem nome em comum com ele, então a interseção é recusada.
- **Saída.** Não passar `position="center"`: sem a prop, o Label lê o `viewBox` polar (`cx`, `cy`)
  que a `Pie` já publica por contexto. Quando o centro precisa ser recalculado, um hook chamado de
  dentro da árvore do gráfico refaz a mesma conta de `cx` e `cy`; fora dessa árvore ele não funciona.
  Campos `x` e `y` inertes podem ser necessários só para o tipo fechar, e nunca são lidos. Visto em
  `07_rosca-e-radial/01_rosca-com-total-central`, `02_semi-rosca`, `04_barra-radial` e
  `13_progresso-meta-e-gauge/05_gauge-de-arco-preenchido`.

### REC-8. As saídas empilham por cima das entradas em vez de descer do zero [4 modelos]

- **Sintoma.** Uma coluna de saldo lê como se tudo fosse positivo, e os segmentos de saída cobrem os
  de entrada. Num empilhamento com sinal, o valor zero também desaparece e desalinha o rótulo.
- **Causa.** Sem `stackOffset="sign"` o Recharts empilha o valor negativo em cima do positivo já
  desenhado, em vez de descer a partir do zero. E o ponto de valor 0 é descartado da série antes da
  numeração dos retângulos.
- **Saída.** `stackOffset="sign"` é obrigatório em qualquer pilha com sinal, e o zero precisa de
  `shape` próprio para continuar existindo. Na barra simples negativa, o `y` do retângulo é o menor
  dos dois pixels, nunca o `y` cru, senão a marca nasce invertida. Visto em
  `03_colunas-verticais/05_colunas-positivo-e-negativo/v3` e `10_funil/04_funil-comparativo/v4`.

### REC-9. A faixa aparece cheia num período em que não houve nada [4 modelos]

- **Sintoma.** Numa pilha de 100%, a semana ou o mês de total zero sai como uma faixa inteira de uma
  categoria só, ou some com tudo, ou imprime `NaN%`.
- **Causa.** `stackOffset="expand"` normaliza dividindo pelo total da linha, e com total zero isso é
  divisão por zero. O `payload` continua absoluto, então o percentual escrito não vem do desenho.
- **Saída.** O período de total zero vira lacuna, com valores `null`, antes do render, e uma faixa
  nomeando o motivo; nunca uma pilha cheia inventada nem um 0% que o período não tem. Quando a pilha
  precisa existir, um valor de apoio no primeiro segmento evita a divisão, e o `shape` ignora o número
  e escreve o estado. O percentual de cada camada é calculado no dado, pelo maior resto (NUM-2), nunca
  lido do desenho normalizado. Visto em `05_areas/03_area-100/v4` e
  `02_barras-horizontais/04_barras-empilhadas-100/v4`.

### REC-10. `tick` customizado desaparece de metade das categorias [4 modelos]

- **Sintoma.** Só três dos seis rótulos aparecem, alternados. No eixo com `ticks` explícito, a grade
  sai em 0, 20 mil e 60 mil, com o último vão maior que os outros, e a mesma medida perde tiques
  diferentes em X e em Y.
- **Causa.** O eixo calcula o intervalo de ticks pela altura estimada do rótulo, e um tick
  customizado de duas linhas é alto o bastante para o eixo pular um sim, um não. A estimativa de
  colisão roda **mesmo com o eixo em `hide`**, isto é, mesmo sem desenhar rótulo nenhum, e a
  `CartesianGrid` lê os ticks do eixo, então herda o descarte. Acima de um teto de contagem
  (`FORCED_TICK_LIMIT` do Farol) o eixo volta a descartar de qualquer jeito.
- **Saída.** `interval={0}` no eixo, e rótulo em **uma** linha. Nome e `n` na mesma linha resolvem
  os dois problemas de uma vez: em duas linhas o `n` de uma faixa encosta no nome da faixa de baixo,
  e o piso de 11 px da TIP-2 não deixa encolher para caber. `interval={0}` vale também em todo eixo
  oculto com `ticks` explícito. Quando a grade precisa ser idêntica entre painéis, calcular as
  coordenadas direto do domínio e da área útil (`offset`), não dos tiques. Visto em
  `09_dispersao-e-bolhas/10_matriz-de-dispersao/v1`,
  `08_combinados-e-eixo-duplo/02_eixo-duplo-com-dominios-calculados/v1` e `03_paineis-alinhados/v1`.

### REC-11. O zero medido não desenha e leva o rótulo embora [3 modelos]

- **Sintoma.** Uma categoria com zero medido não aparece, e o rótulo que devia dizer "0" ou
  "indisponível" nasce na linha seguinte.
- **Causa.** O Recharts descarta cedo qualquer retângulo de dimensão zero, pelo filtro "Filter out
  0-dimension rectangles" em `cartesian/Bar.js`, e a lista de retângulos é a mesma que numera o
  `LabelList`.
- **Saída.** Declarar `shape` na série: com forma customizada o Recharts para de descartar, o
  retângulo de zero passa a existir e o índice volta a bater com a linha. Ausência continua `null` e
  segue fora da lista, com ou sem forma própria, que é exatamente a distinção que se quer (EST-3).
  **A isenção da forma própria cobre a dimensão zero, e só ela** (conferido no `recharts 3.10.1` em
  2026-10-02): o comentário "Bars with a custom shape are not filtered out" está em
  `cartesian/Bar.js:664` e a condição, em `:667`, é `!hasCustomShape && (width === 0 || height === 0)`.
  O valor `null` sai antes disso, em `:606-607` na coluna e em `:635-636` na barra deitada, porque a
  escala devolve indefinido para `null` e o item volta nulo: o `shape` **não é chamado**, e quem
  contava com ele para desenhar a ausência não desenha nada.
  Visto em `03_colunas-verticais/02_colunas-agrupadas/v4`,
  `02_barras-horizontais/02_barras-agrupadas/v1` e `03_barras-empilhadas/v1`.

### REC-12. A pilha não reordena por período, e a ordem é a dos filhos [3 modelos]

- **Sintoma.** Num streamgraph ou alluvial, a camada que cresceu não sobe de posição, e num período o
  vizinho de classificação cai na ponta oposta da faixa.
- **Causa.** O Recharts empilha na ordem dos filhos declarados, uma vez, e não reordena a pilha por
  período. O Sankey, ao contrário, reordena o nó por tamanho.
- **Saída.** Quando a ordem por período é a afirmação da peça, a geometria sai do Recharts e vira SVG
  puro, com a posição de cada bloco calculada pela soma acumulada na ordem fixa das categorias. Visto
  em `05_areas/08_streamgraph/v3` e `11_fluxo-sankey/03_alluvial/v1`.

### REC-13. Quem é pintado por último cobre o vizinho [3 modelos]

- **Sintoma.** As bolhas pequenas desaparecem sob as grandes; a série em destaque fica por baixo das
  neutras no cruzamento; o selo do grupo de um treemap é coberto pelos filhos.
- **Causa.** A ordem de pintura é a ordem de entrada do array, e num treemap o Recharts sempre pinta
  os filhos depois do grupo, em `renderNode` de `Treemap.js`.
- **Saída.** Ordenar o array pelo papel de desenho, não pelo valor: maiores primeiro nas bolhas,
  destaque por último nas linhas e faixas. Visto em `09_dispersao-e-bolhas/03_bolhas/v1`,
  `05_areas/10_area-bump/v2` e `12_hierarquia/02_treemap-aninhado/v1`.
- **Emenda de 2026-09-29: "a ordem do array" vale DENTRO de um tipo de marca, não ENTRE tipos.** Entre
  tipos diferentes o Recharts pinta por **zIndex em portal**, e a ordem de declaração no JSX não muda
  nada. Os padrões estão em `recharts/es6/zIndex/DefaultZIndexes.js`: **grade −100**, fundo de barra
  −50, **área 100**, retângulo do cursor 200, **barra 300**, **linha 400**, **eixo 500**, **dispersão
  600**, barra ativa 1000, linha do cursor 1100, ponto ativo 1200. Consequências que um produtor mediu
  num combinado: uma `Line` pinta **sobre** qualquer `Bar`, dê a ordem que você der no JSX; o eixo pinta
  sobre a barra e sobre a linha; e a dispersão pinta sobre todos eles. Então num `ComposedChart` a
  pergunta "quem cobre quem" **não se responde reordenando o JSX**: ou se aceita a ordem do zIndex, ou
  se passa `zIndex` explícito no componente. A régua do array continua valendo para as fatias de um
  `Pie`, os pontos de um `Scatter` e os nós de um `Treemap`, que são um tipo só.

### REC-14. `Scatter` sobre eixo de categoria abre uma banda por ponto [3 modelos]

- **Sintoma.** Categorias e pontos descolados das linhas, rótulos espremidos no topo, o gráfico
  inteiro empurrado para um canto. Parece problema de margem, e não é.
- **Causa.** Com `allowDuplicatedCategory` ligado, que é o padrão, cada linha do `data` do `Scatter`
  abre uma banda nova no eixo de categoria. Quatro faixas com 114 pontos viram 118 bandas.
- **Saída.** `allowDuplicatedCategory={false}` no eixo de categoria. Visto em
  `16_distribuicao/02_box-plot/v1` e `03_strip-plot-e-beeswarm/v1`.

### REC-15. `ZAxis` ausente deixa o raio do ponto variar [3 modelos]

- **Sintoma.** Pontos de tamanhos diferentes num strip ou dispersão em que o tamanho não codifica
  nada.
- **Saída.** `<ZAxis range={[n, n]} />` com o mesmo valor nas duas pontas quando o raio é fixo.

### REC-16. Dois painéis alinhados nascem deslocados dezenas de pixels [2 modelos]

- **Sintoma.** Um histograma marginal e o plano que ele acompanha não batem pixel a pixel; a
  diferença chega a 60 px na horizontal e 30 px na vertical.
- **Causa.** O Recharts soma a reserva do eixo, isto é, a largura do rótulo de Y e a altura do rótulo
  de X, à margem só do painel que tem esse eixo. O painel vizinho, sem eixo, não recebe a mesma
  reserva.
- **Saída.** Somar a mesma reserva à margem do painel vizinho, do lado que precisa alinhar (EIX-12).
  No marginal de Y, o eixo de categoria precisa de `reversed`: o eixo de valor do plano cresce para
  cima, e o `BarChart` vertical lista a categoria de cima para baixo. Visto em
  `09_dispersao-e-bolhas/08_dispersao-com-marginais/v1` e `10_matriz-de-dispersao/v1`.

### REC-17. O corpo dos painéis de cima fica maior que o dos de baixo [2 modelos]

- **Sintoma.** Numa grade de pequenos múltiplos com a mesma escala, a marca do painel de cima mede
  22 px e a do painel de baixo mede 12 px para o mesmo valor.
- **Causa.** O Recharts só reserva altura de eixo para os eixos que não estão escondidos, então
  `hide` nos painéis sem rótulo devolve essa altura ao corpo do gráfico daquele painel.
- **Saída.** Nunca `hide`. O eixo fica sempre presente e só o tique some, com `tick={false}`, que
  zera o texto sem zerar o espaço reservado (EIX-9). Vale para `XAxis` e `YAxis`. Visto em
  `03_colunas-verticais/08_colunas-em-small-multiples` e `04_linhas/09_pequenos-multiplos-de-linha`.

### REC-18. A perda vai toda para a última coluna do Sankey [2 modelos]

- **Sintoma.** Os nós de perda de todas as etapas se acumulam na coluna final, longe da etapa onde a
  perda aconteceu, e o rótulo de um nó cai sobre a ligação de um vizinho da mesma coluna.
- **Causa.** O Sankey do Recharts empurra o nó terminal para a última coluna e reordena o nó por
  tamanho, e a ligação começa a curvar logo na saída do nó, por cima da faixa de rótulo.
- **Saída.** `align="left"` mantém a perda logo depois da etapa dela. Para o rótulo, cada coluna
  reserva uma faixa própria, do tamanho do maior rótulo daquela etapa, e a ligação atravessa essa
  faixa num trecho reto, com o mesmo `y` do nó, antes de qualquer curva abrir leque. Visto em
  `11_fluxo-sankey/02_sankey-multietapa/v1`.
- **Emenda de 2026-09-29, e ela tem duas partes medidas.** **A primeira: a faixa de rótulo não é a
  saída para o transbordo da borda externa, e alargá-la piora.** Com faixa de 154 px o resíduo era de
  cerca de 35 px e parecia caso de folga; com faixa de **260 px** o rótulo de **3 nós** caiu sobre a
  própria faixa e o halo recortou caixas escuras dentro dela. A causa não é largura: é desenhar a
  ligação como **traço grosso**, cuja espessura se espalha para os dois lados do caminho. Desenhe a
  ligação como **região fechada**, um polígono de duas bordas, e a borda externa passa a ser uma
  aresta que você controla. **A segunda: quando todas as colunas alcançam o mesmo desfecho, a regra de
  saída antecipada desta entrada não discrimina nada.** Ali "alvo mais de uma coluna à frente" marca
  quase todo mundo: medido, **203 de 318** casos foram para o corredor de salto e o corpo transbordou
  em 3 elementos nos dois temas. Separe **salto de duas colunas ou mais**, que vai ao corredor, de
  **salto de uma coluna**, que é nó de passagem comum; com a separação o corredor caiu para **99**.

### REC-19. Duas séries de `Bar` repartem a banda, e o histograma deixa de encostar [2 modelos]

- **Sintoma.** Barras com vão entre elas num histograma, mesmo com `barCategoryGap={0}`. O desenho
  vira gráfico de colunas, que é outra coisa: o vão diz "categorias separadas" quando o eixo é
  contínuo.
- **Causa.** A largura da barra sai da banda dividida pelo número de séries. Uma segunda série de
  `Bar`, mesmo invisível ou de altura zero, consome metade da banda.
- **Saída.** Uma série só, com tudo o que a peça precisa desenhado dentro do `shape`: barra cheia,
  marca da faixa vazia, o que for. Visto em `16_distribuicao/01_histograma/v1`.

### REC-20. `ErrorBar` mede a distância a partir do valor da ponta, não de cada lado da caixa [2 modelos]

- **Sintoma.** Num box plot, uma linha atravessa a caixa por dentro e parece uma segunda mediana.
- **Causa.** O `dataKey` do `ErrorBar` é distância, e num `Bar` de par `[q1, q3]` ela é medida a
  partir de q3. A perna de baixo então percorre a caixa inteira.
- **Saída.** Desenhar os bigodes no próprio `shape`, junto da caixa e das tampas. Caixa opaca não
  resolve: o `ErrorBar` é filho do `Bar` e desenha **por cima** dele.

### REC-21. O passo automático do eixo esconde o limiar, repete um mês ou pula outro [2 modelos]

- **Sintoma.** Eixo com marcas de 90 em 90 minutos e uma guia de SLA em 30, sem nenhuma âncora
  próxima para o leitor localizar. Em eixo de data, o mesmo mês escrito em dois tiques seguidos numa
  janela curta, ou um mês que não aparece numa série mais longa.
- **Causa.** O passo automático é calculado na unidade crua do eixo, em minutos ou em dias, sem saber
  do limiar nem da fronteira de mês.
- **Saída.** `ticks` explícito, num passo que contenha o limiar. Em eixo de data, um tique por mês
  presente no dado, ancorado na primeira data daquele mês. Visto em `04_linhas/03_step-degrau/v2` e
  `v3`.

### REC-22. Cinco colunas ganham a tampa de excedente que só uma deveria ter [1 modelo]

- **Sintoma.** Dez das doze colunas aparecem com a marca de excedente no topo, contra os cinco meses
  que a linha de leitura conta.
- **Causa.** Numa série empilhada, o Recharts chama `minPointSize` com o `value[1]` do par
  `[base, topo]` que o `stackId` montou para aquele retângulo, ou seja, o topo acumulado, não o valor
  da própria série. Filtrar por `value > 0` mede o topo, que é positivo em todo mês com demanda.
- **Saída.** Ler o valor da própria série na linha do dado, pelo `index`, e só aplicar a tampa quando
  o excedente em si for maior que zero. Visto em
  `03_colunas-verticais/06_colunas-contra-meta-ou-limiar/v4`.

### REC-23. O último ponto e o rótulo final não aparecem em nenhum recorte [1 modelo]

- **Sintoma.** Com um `Brush` no gráfico, a média móvel perde o ponto e o rótulo finais em qualquer
  janela escolhida.
- **Causa.** O `Brush` reindexa: `dot` e `LabelList` de cada `Line` recebem `index` relativo à fatia
  visível em tela, começando em zero, não ao array completo passado em `data`.
- **Saída.** Comparar o índice com o tamanho da fatia visível, nunca com o do array de origem. Visto
  em `04_linhas/01_linha-simples/v3`.

### REC-24. A marcação de um único período some em linha e área, e cobre a banda inteira em barras [1 modelo]

- **Sintoma.** A `ReferenceArea` com `x1` igual a `x2`, que deveria nomear a semana sem base, é
  invisível num gráfico de linha ou de área. A mesma escrita num gráfico com `<Bar>` pinta a
  categoria inteira, de borda a borda da banda.
- **Causa.** Quem decide é a **escala** do eixo de categoria, e não o fato de ele ser categórico. A
  redação desta entrada até 2026-10-02 dizia que `x1` igual a `x2` "não produz retângulo nenhum" em
  eixo categórico, e isso só vale para a escala de pontos. Conferido no `recharts 3.10.1` instalado:
  `cartesian/ReferenceArea.js:45-46` mapeia `x1` com `position: 'start'` e `:53-54` mapeia `x2` com
  `position: 'end'`; `util/scale/RechartsScale.js:55-56` soma `bandwidth()` no caso `'end'`. Em
  escala `band` isso dá **uma banda**: medido **77,75 px**, que são 622 px de plano em 8 categorias.
  Em escala `point` o `bandwidth()` vale zero, a largura sai zero e `shape/Rectangle.js:143` devolve
  nulo. E a escala sai de `state/selectors/combiners/combineRealScaleType.js:16-20`: `point` em
  `LineChart`, em `AreaChart` e em `ComposedChart` sem `<Bar>`; `band` em todo o resto.
- **Saída.** Olhe o tipo do gráfico antes de escrever as bordas. Com `<Bar>` na peça, ou com
  `scale="band"` declarado no eixo, `x1` igual a `x2` basta e cobre exatamente aquela categoria. Sem
  `<Bar>`, usar a categoria anterior e a seguinte como bordas, cobrindo dois passos do eixo, e
  escrever o texto no centro do vão dizendo qual das duas é a que não tem base. Visto em
  `05_areas/03_area-100/v4`, que é `ComposedChart` só com `Area`, logo escala de pontos.

### REC-25. O Treemap pinta os filhos depois do grupo e cobre o selo dele [1 modelo]

- **Sintoma.** O selo com o nome do grupo desaparece atrás dos retângulos dos filhos.
- **Causa.** O `nodeInset` do Recharts recua os filhos por igual nos quatro lados, e não reserva
  faixa só no topo; se o recuo for menor que a margem mais a altura do selo, os filhos, pintados
  depois, cobrem o selo.
- **Saída.** Dimensionar o `nodeInset` pela altura do selo mais folga, aceitando o preço de recuar os
  outros três lados na mesma medida. Visto em `12_hierarquia/02_treemap-aninhado/v1`.

### REC-26. O segundo grupo de um histograma não cabe no `shape` do primeiro [1 modelo]

- **Sintoma.** Depois de descobrir que duas séries de `Bar` quebram o histograma, a saída óbvia é
  desenhar os dois grupos dentro do `shape` da série única. Aí falta a conta: o `shape` recebe `x`,
  `y`, `width` e `height` **do valor daquela série**, e nada que permita converter a contagem do
  outro grupo em pixel. Derivar a escala de `height / valor` quebra no primeiro bin de valor zero.
- **Causa.** O `shape` é por marca, não por painel: ele não vê o eixo, só o retângulo que lhe coube.
- **Saída.** O segundo grupo entra como `Line` num `ComposedChart`, com `type="step"`, `dot={false}`
  e a mesma `dataKey` de bin. Série de linha não disputa a banda com a barra, então as barras
  continuam encostadas, e `type="step"` põe a transição no limite do bin, que é exatamente o contorno
  do histograma. De quebra resolve a ACE-5: contorno não precisa de `fillOpacity` para deixar ver o
  que está atrás. Visto em `16_distribuicao/05_histograma-comparativo/v1`.

### REC-27. O `shape` da `ReferenceArea` é o único lugar que sabe onde duas referências caíram [1 modelo]

- **Sintoma.** Uma anotação que liga dois pontos do eixo (seta entre duas medianas, faixa entre dois
  limiares) sai desencontrada das linhas que ela deveria ligar, porque a seta foi posicionada por
  conta própria e as linhas pelo Recharts.
- **Causa.** Três elementos separados refazem a mesma conta de escala três vezes, e qualquer
  divergência aparece como desalinhamento.
- **Saída.** Uma `ReferenceArea` com `x1` e `x2` nos dois valores e um `shape` próprio: ele recebe
  `x`, `y`, `width` e `height` já em pixel, e é ali que se desenham as duas verticais, a seta e o
  rótulo, de uma vez. O `shape` **pode desenhar fora da área de plotagem**, dentro da margem, sem ser
  recortado: é onde o rótulo da anotação deve morar (ANO-3), com `MARGIN.top` dimensionado para
  caber a tinta do texto. Visto em `16_distribuicao/05_histograma-comparativo/v1`.

---

### REC-28. O painel sai em branco e em silêncio, e o `shape` da `ReferenceArea` não recebe retângulo [1 modelo]

- **Sintoma.** Um painel inteiro vazio, sem barra, sem erro, sem aviso. O `check` fica verde e o
  desenho não existe. Em pequenos múltiplos é pior, porque os outros sete painéis parecem normais e o
  vazio lê como "este grupo não tem dado".
- **Causa.** A `ReferenceArea` declarada só com `x1` e `x2` não devolve `width` e `height` em pixel
  para o `shape`. Sem `y1` e `y2` o retângulo fica indefinido, e o `shape` desenha nada em vez de
  falhar.
- **Saída.** Declarar `y1` e `y2` sempre que o `shape` for usar a geometria, mesmo quando eles forem o
  topo e a base do domínio. Visto em `16_distribuicao/01_histograma/v3`.

### REC-29. O eixo descarta tique em corpo curto e leva a grade junto [2 modelos]

- **Sintoma.** Metade dos tiques some num painel baixo ou estreito, e as linhas de grade
  correspondentes somem com eles. Em pequenos múltiplos, painéis vizinhos ficam com grades diferentes
  e a comparação que justifica a peça deixa de valer.
- **Causa.** O eixo calcula o intervalo de tiques pelo espaço disponível e descarta em silêncio; a
  `CartesianGrid` herda os tiques do eixo, então a grade segue o descarte.
- **Saída.** `interval={0}` no eixo. Se com isso os rótulos colidirem, o que muda é o passo declarado
  em `ticks`, não o intervalo. Visto em `16_distribuicao/01_histograma` v3 e v4.

### REC-30. O `axisLine` do `AXIS_PROPS` vem ligado, e a ordem do espalhamento decide [20 modelos]

- **Sintoma.** O eixo tem uma linha de base que o desenho não pediu, e ela concorre com a linha de
  grade do zero, que está logo ali na mesma altura. Em dispersão o efeito é pior: a moldura parcial que
  as duas linhas formam sugere um quadrante que não existe.
- **Causa.** `AXIS_PROPS`, em `app/src/components/visuals/charts/chartTheme.ts`, traz `tickLine: false`
  mas `axisLine: { stroke: GRID_COLOR }`, isto é **linha de eixo ligada por padrão**. A `EIX-5` do
  CONTRATO manda desligar e **nomeia o `AXIS_PROPS` explicitamente**, mas quem espalha o objeto e não
  sobrepõe herda o padrão sem perceber. Medido em 2026-09-28: **85 dos 104 chamadores sobrepõem**, ou
  82%, e 20 peças não. Padrão que a maioria de quem chama desfaz é padrão errado.
- **Efeito colateral.** Três formas de errar que a leitura do arquivo não revela. A **ordem** manda:
  `{...AXIS_PROPS} axisLine={false}` desliga e `axisLine={false} {...AXIS_PROPS}` **não** desliga, e as
  duas linhas parecem iguais. Sobrepor **num eixo não cobre o outro**, e foi assim que três versões de
  `03_colunas-verticais/05` passaram batido numa varredura por busca de texto: o arquivo contém a
  palavra `axisLine`, só que no eixo errado. E `axisLine={{ stroke: ... }}` é sobreposição sintática que
  continua ligada.
- **Saída.** `axisLine={false}` **depois** do espalhamento, num eixo por vez, ou um objeto local
  derivado com `{ ...AXIS_PROPS, axisLine: false }`. A guarda `EIXO-CALMO` (criada em 2026-09-28,
  `_render/scripts/lib/eixo.mjs`) resolve o valor efetivo por AST e acusa peça nova; ela **lê o padrão
  do `chartTheme.ts` em vez de codificá-lo**, então no dia do conserto na raiz ela emudece sozinha em
  vez de acusar o acervo por uma verdade vencida. O conserto na raiz é uma linha, e depende da emenda
  do `sourceHash`: módulo compartilhado não entra no carimbo do preview, então mexer nele envelhece
  centenas de previews em silêncio com o `check` verde.

### REC-31. O `range` do `ZAxis` é área em px², e a `shape` própria nunca recebe raio [1 render perdido]

- **Sintoma.** A peça passa `range={[46, 46]}` esperando um ponto de 46 px e sai um ponto minúsculo; ou
  passa `range` e o ponto sai com um tamanho que não é nenhum dos dois números, sempre o mesmo.
- **Causa.** `range` fixa a **área** do símbolo em px², nunca o raio, e o raio é `√(área/π)`. O padrão
  `range=[64,64]` dá exatamente **4,514 px** de raio, que é `√(64/π)`, e é esse número que aparece quando
  alguém acha que o `range` foi ignorado. Para um raio `r` se passa `πr²`: raio 4 pede 50,27, não 4.
  Conferido no pacote instalado `recharts 3.10.1`, em `Scatter.js:457` e `:458` e `Symbols.js:66`
  (`sizeType = 'area'`), não na documentação.
- **Efeito colateral.** **Há duas condições em que o `range` de fato não chega**, e as duas devolvem aos
  64 do padrão: `<ZAxis>` que não está registrado para o `zAxisId` do `<Scatter>`, que cai no
  `implicitZAxis` (`Scatter.js:401`); e peça com **`shape` própria**, porque a forma recebe `size` (área),
  `width` e `height` (que valem 2 × raio) e **nunca um `r`**. Quem desenha a própria forma e espera um
  raio no payload não acha, e conclui que a prop não funciona.
- **Saída.** Nomeie a constante pelo que ela é, `AREA_MIN` e `AREA_MAX` e não `RAIO`, que é o que o
  acervo já faz em 11 das 12 peças com `ZAxis`. Com `shape` própria, derive o raio de `size` com
  `Math.sqrt(size / Math.PI)` ou de `width / 2`, e escreva a conta em comentário. E lembre que bolha
  codifica valor por **área** e não por raio, então passar área ao `range` é o comportamento **certo**,
  não um contorno: é a `GEO-3` acontecendo de graça.

### REC-32. Com `allowDuplicatedCategory={false}` o `dataKey` do `Bar` é avaliado nas linhas do `Scatter` [render sem preview]

- **Sintoma.** O `render` **quebra ao montar** e não grava preview nenhum, com erro do tipo
  `Cannot read properties of undefined (reading 'q1')`. Não é aviso nem peça feia: é ausência total de
  saída, e o `check` seguinte acusa `preview.svg ausente`, o que manda o diagnóstico para o lugar errado.
- **Causa.** Com `allowDuplicatedCategory={false}` o Recharts unifica o eixo de categoria entre as séries
  e passa a avaliar o `dataKey` de **cada** série sobre o conjunto unificado de linhas. Então o `dataKey`
  de um `<Bar>` que lê `row.box.q1` roda também sobre as linhas do `<Scatter>` ao lado, que não têm `box`,
  e lança. A `REC-14` fala do mesmo `allowDuplicatedCategory`, mas sobre a **banda do eixo**; este alcance
  sobre as linhas das outras séries é outro efeito da mesma prop.
- **Efeito colateral.** Escapa por acaso quando os campos moram no **primeiro nível** da linha, porque aí
  o acesso devolve `undefined` em vez de lançar. Foi assim que uma v1 do acervo passou e a irmã dela
  quebrou com o mesmo desenho: a diferença estava só na profundidade do objeto, não na lógica.
- **Saída.** Leia o campo com acesso que tolera a linha da outra série, retornando ausência em vez de
  lançar, e **escreva no comentário por que a guarda existe**, senão a próxima pessoa a simplifica. Duas
  séries que precisam de formas de linha muito diferentes são sinal de que o par `dataKey` merece uma
  função própria, com nome, em vez de um acesso encadeado dentro do JSX.

### REC-33. Nó de Sankey desequilibrado encolhe o diagrama inteiro, em silêncio [1 caso no acervo]

- **Sintoma.** O diagrama fica menor do que o canvas permite, com folga inexplicada de um lado, e o nó
  desenha mais alto que a soma das faixas que chegam nele. A frase acessível declara um total e a soma das
  faixas dá outro. Nenhuma guarda acusa, porque nada estoura e nada colide.
- **Causa.** `getNodesTree` define o valor do nó como `Math.max(soma das entradas, soma das saídas)`, e não
  exige que as duas somas batam. Então um nó com 412 de entrada e 338 de saída recebe altura 412 enquanto
  as faixas que saem dele somam 338, e o vão de 74 aparece como espaço morto dentro do nó. Pior: o
  `updateYOfTree` toma a escala da coluna de **soma maior**, então o desequilíbrio de um nó **reescala o
  diagrama inteiro** e todas as faixas ficam mais finas do que deveriam.
- **Efeito colateral.** É a forma exata do caso do acervo em que uma peça declarava **412 repasses e somava
  338**, que estava registrado como defeito sem mecanismo explicado. O desequilíbrio pode nascer de dado
  mal montado, de arredondamento por faixa ou de um nó terminal que ninguém somou, e em todos os casos o
  desenho continua plausível: não há sinal visual de que a escala mudou.
- **Saída.** **Feche a soma no dado, não no desenho**, e confira por script: some `value` por `source` e por
  `target` e exija que as duas somas batam com o total, nó por nó. É conta de três linhas e é a única forma
  de pegar isso, porque o Recharts não reclama e o `check` não tem como saber qual era o total pretendido.
  Um produtor fez isso em 2026-09-28 nas três versões que entregou e publicou os números no README; é o
  padrão a seguir.

### REC-34. Com marca `Line`, o `LabelList` entrega caixa de tamanho zero e `position` não posiciona nada [confirmado no pacote]

- **Sintoma.** Um `content` próprio dentro de `LabelList` desenha o rótulo colado ao ponto, ignorando
  `position` e `offset`, e nenhum ajuste nas duas props muda o resultado. Em `Bar` o mesmo código
  funciona, o que faz o produtor procurar o defeito no próprio componente.
- **Causa.** Está no pacote e é declarada lá. Em `recharts/es6/cartesian/Line.js`, na montagem das
  entradas do `LabelList`, o `viewBox` de cada ponto sai com **`width: 0`, `lowerWidth: 0`,
  `upperWidth: 0` e `height: 0`**, e `parentViewBox` vai como `undefined`, com um comentário do próprio
  pacote dizendo que os rótulos podem escapar e que isso "parece um defeito". `Label` posiciona
  **contra a caixa**, então com caixa de área zero `position` e `offset` não têm contra o que medir: o
  ponto é a caixa inteira. Em `Bar` a caixa é o retângulo da barra, e por isso ali funciona.
- **Saída.** Com `Line`, desenhe o rótulo **pela coordenada do ponto**, não pela posição relativa: leia
  `x` e `y` do `viewBox` (que são corretos) e aplique o seu próprio deslocamento em números, do jeito
  que a `17.7` já pede para o rótulo de cruzamento. Não gaste rodada ajustando `position`, e não alargue
  nada para compensar. Se o rótulo precisa ficar contido no gráfico, a contenção é sua: o pacote não
  passa `parentViewBox` nesse caminho, então ninguém vai recortar por você.

## Geometria e leitura

### GEO-1. Nenhum preset de canvas fecha o cartão depois que ele ganha linhas escritas [31 modelos]

- **Sintoma.** O rótulo da meta é cortado no topo, a última linha da legenda encosta no padding
  inferior, a lista de identificação some abaixo da borda, o valor de uma coluna sai truncado pela
  moldura. O `check` passa, porque o corpo tem `overflow` escondido e o que não cabe apenas desaparece.
- **Causa.** Os presets (`kpi` 360x180, `kpi-alto` 360x280, `faixa` 960x260, `card` 640x360,
  `alto` 640x560, `largo` 960x400) foram dimensionados para o desenho, não para o desenho mais o que
  o contrato obriga a escrever ao lado dele: caso de uso em duas linhas, nota de método, denominador,
  procedência, legenda com amostra, lista de identificação, frase de estado. Cada exigência escrita
  come corpo de gráfico.
- **Saída.** Some as linhas reais do cartão mais a moldura do palco **antes** de escolher o canvas, e
  escreva essa conta na nota do `meta.json`. O que a conta devolve decide **como** declarar, e são três
  casos, porque esta armadilha só cobre o primeiro: quando a conta não cabe em nenhum preset, o canvas
  vai por número; quando cabe num preset com sobra, vale o nome do preset; e quando cai **exatamente**
  em cima de um preset, escreva o **nome**, nunca o número, porque `_render/scripts/lib/meta.mjs:113`
  avisa que o número mede o preset e o nome se lê de primeira. Medido no acervo em 2026-09-29: das 445
  versões com `meta.json`, **303 declaram por nome e 142 por número, e só uma** tem número coincidindo
  com preset, isto é o terceiro caso é raro e não havia por que ele ficar ambíguo. Atenção a um vão de
  cobertura: a ferramenta **só cobra a nota quando o canvas é por número**, então com preset nomeado a
  conta depende de você escrevê-la, e é ela que sobrevive à próxima pessoa que mexer no cartão.
  A régua é a da ESP-2, e ela só tem um sentido:
  **quem cede é a altura do canvas, nunca a espessura da marca nem o piso de 11 px do texto.** Vale
  também o inverso: quando a categoria corre no eixo horizontal, quem cede é a largura. Dos 31
  modelos, 6 declaram que nenhum preset serve, em vez de escolher o menos ruim. Visto em
  `01_cards-e-kpis/08_card-de-excecao/v1`, `12_hierarquia/06_icicle/v1` e
  `08_combinados-e-eixo-duplo/06_real-contra-referencia-com-painel-de-variacao/v1`.

### GEO-2. Texto truncado na célula [30 modelos]

- **Sintoma.** "feria..." dentro de um dia de calendário.
- **Saída.** Literal curto na célula e o nome inteiro na frase acessível. O que não cabe não encolhe,
  muda de lugar. Em marca desenhada a reticência é proibida pela TIP-7, então a alternativa é a
  quebra em até duas linhas **por palavra inteira**, nunca por caractere, com o corte mais
  equilibrado que caiba nos dois lados; e quando nem isso cabe, o nó fica sem texto e entra numa
  lista de identificação fora do desenho (ROT-10), que não depende do tamanho que o layout lhe deu.

### GEO-3. A fatia com um quinto do valor desenha um terço da área [11 modelos]

- **Sintoma.** Num visual radial ou de bolha, o segundo lugar parece muito mais perto do primeiro do
  que ele é, ou muito mais longe.
- **Causa.** A área cresce com o quadrado do raio. Raio proporcional ao valor faz o dobro parecer
  quatro vezes. E existe uma segunda armadilha, mais silenciosa: com raio mínimo diferente de zero,
  `rMin + (rMax − rMin) * Math.sqrt(v / topo)` **também** não entrega área proporcional, porque a
  área do setor vale `r² − rMin²` e não `r²`. Medido em
  `07_rosca-e-radial/07_rosa-de-nightingale/v1`, antes do conserto de 2026-09-28: um mês de R$ 8,4
  mil desenhava 32,7% da área de um mês de R$ 42,9 mil, quando a proporção real é 19,6%, com desvio
  de até 2,16 pontos percentuais no setor de pico. A meia correção é a mais perigosa das duas,
  porque tem a raiz quadrada escrita no código e passa por conserto feito.
- **Saída.** Raio pela raiz quadrada do valor sempre, e com raio mínimo, a forma que fecha a conta é
  `Math.sqrt(rMin² + (rMax² − rMin²) * v / topo)`. Confira somando a área desenhada de cada marca e
  comparando com a participação de cada valor: com a forma certa as duas listas batem na casa dos
  centésimos de ponto, e qualquer desvio maior que isso é a fórmula, não o arredondamento. Em bolha,
  área em px² com piso e teto declarados, nunca raio bruto. Visto nas quatro versões de
  `07_rosca-e-radial/07_rosa-de-nightingale` e em `09_dispersao-e-bolhas/03_bolhas/v1`.
- **O circle packing entra por outro motivo, e a citação antiga desta entrada estava errada.** Medido
  no `preview.svg` de `12_hierarquia/08_circle-packing/v1` em 2026-10-02, contra o `data.ts`: as **14
  folhas estão exatas**, com `r/√v` uniforme em 3,391 e desvio máximo de **0,0008 p.p.** entre a
  participação em área e a participação em valor. O desvio está nos **4 anéis de campanha**, de −2,21
  a +2,36 p.p. entre a área do anel e o total da campanha, e a causa não é a fórmula do raio: o raio
  do pai nasce do **empacotamento** dos filhos, isto é do círculo que os contém mais a margem, e não
  da soma deles. Em hierarquia empacotada a conferência de área contra valor se faz nas folhas; no
  anel ela acusa um desvio que nenhuma raiz quadrada conserta, e o total do grupo se lê no texto.
- **Guarda, desde 2026-10-02: `RAIO-CONTRA-AREA` no `npm run check`. Peso: bloqueia.** Ela faz a
  conferência da Saída no `preview.svg` contra o `data.ts`: junta a fatia, o anel, o setor e a bolha
  em grupos, casa cada marca com o valor pelo posto e procura a lei que o desenho segue. Raio em
  linha com o valor e meia correção são **erro** em peça nova e **aviso** na peça que já está na fila
  de dívida. A tolerância é de **0,01 ponto percentual** de participação, e é medida: nas 60 leituras
  de grupo do acervo em que a lei certa cabe, o maior desvio é 0,0007 p.p. (`09/03 v4`), e a lei
  errada mais discreta, as 365 marcas de `07_rosca-e-radial/06_coluna-radial/v3`, desvia 0,038 p.p.
  Em marca sem furo (a bolha e a fatia de raio variável) a área com piso declarado passa. No dia em
  que entrou, ela acusou **uma** peça em 491: `06_pizza/05_pizza-de-raio-variavel/v1`, que usa a meia
  correção com piso de 32% e desenha 54,57% da área acima do piso para 62,50% do valor, desvio de 7,93
  p.p.; o README do modelo já dizia isso, e dizia também que nenhuma guarda media. As rosas `v1`, `v2`
  e `v4` de `07_rosa-de-nightingale` passam com desvio de 0,0000 p.p.
- **O que a guarda não mede continua sendo seu, e sai contado na cobertura do `check`.** Três casos.
  `valor_nao_casado`: o valor da marca não está no `data.ts` como está no desenho, porque nasce de
  conta no `Chart.tsx`, de recorte por filtro ou de marca cortada no teto da escala; são 40 versões
  no acervo, entre elas a rosa empilhada `07_rosa-de-nightingale/v3`, em que 35 dos 36 setores fecham
  em 0,2474 px² por real e o de julho está cortado no teto de R$ 80 mil, como a peça declara.
  `comprimento_radial`: grupo com furo de mais de meio raio, que é coluna radial e se lê por
  comprimento, pela GEO-5; a guarda não o acusa, e sem essa saída reprovaria
  `06_coluna-radial/v1`, que desvia 0,60 p.p. e está certa pela régua dela. E o raio arredondado ao
  pixel pelo layout: em `06_pizzas-proporcionais-ao-total/v1` a margem padrão do `PieChart` tira 5 px
  do raio de cada pizza, a menor fica com 39% da área da maior em vez de 42%, e os quatro raios não
  fecham em lei nenhuma, então a guarda mede as fatias e deixa os discos sem veredito.

### GEO-4. O halo do rótulo apaga justamente a marca que ele deveria deixar ver [4 modelos]

- **Sintoma.** A seta, a aresta ou a faixa fina somem por baixo do texto. Medido em
  `05_areas/10_area-bump/v2`: a faixa em destaque passa de 19 px para 5 px de tinta visível sob o
  rótulo, em cada um dos 8 períodos.
- **Causa.** O halo troca o fundo local pela cor da superfície, para o texto ter par de contraste
  aprovado. Numa marca de 18 px ou mais isso é invisível; num traço de 1,5 px, o halo cobre a marca
  inteira. E a espessura, em vários modelos, é a codificação secundária do valor.
- **Saída.** Em marca fina, quem sai do lugar é o texto, nunca a marca. Anticolisão em TypeScript,
  com o rótulo tentando direções e raios crescentes ao redor do próprio ponto, e uma pista reservada
  fora do plano, com linha de chamada, quando nenhuma posição serve. Nenhum desses rótulos leva halo:
  é a exceção da marca fina prevista na ROT-7. Visto em
  `09_dispersao-e-bolhas/06_antes-e-depois-com-setas/v1`, `11_fluxo-sankey/02_sankey-multietapa/v1` e
  `12_hierarquia/07_arvore-e-dendrograma/v1`.

### GEO-5. O anel de fora parece maior com o mesmo percentual [3 modelos]

- **Sintoma.** Dois anéis concêntricos com a mesma fração, e o externo lê como se fosse mais. Numa
  coluna radial, duas colunas do mesmo valor desenham arcos de comprimentos diferentes.
- **Causa.** Para o mesmo ângulo, o arco é mais longo e a área é maior quanto mais longe do centro.
- **Saída.** O número vem sempre escrito, na legenda, na lista ao lado ou na ponta do arco, e a peça
  declara que os anéis não se comparam entre si. Em coluna radial, o círculo interno ocupa mais da
  metade do raio, o que contém o efeito, e a leitura exata sai da escala escrita nos anéis de grade.
  Visto em `07_rosca-e-radial/03_aneis-concentricos-de-dois-periodos/v1`, `06_coluna-radial/v1` e
  `13_progresso-meta-e-gauge/04_aneis-concentricos/v1`.

### GEO-6. A marca sai mais fina do que o `maxBarSize` declarado [2 modelos]

- **Sintoma.** `maxBarSize` em 14 px e a marca medindo 5 px no `preview.svg`. Em butterfly com duas
  séries por faixa, 3 px.
- **Causa.** `maxBarSize` é teto, não promessa: a espessura real sai da banda disponível dividida
  pelo número de séries, descontados o `barGap` e o `barCategoryGap`. Corpo de gráfico curto entrega
  menos que o declarado, em silêncio.
- **Saída.** Calcular o passo pela conta invertida da ESP-6, e não o contrário:
  `passo = (BAR_MAX × séries + BAR_GAP × emendas) / (1 − 2 × vão)`. O corpo do gráfico pede
  `passo × número de categorias`, e é a altura do canvas que se ajusta a isso. Conferir no
  `preview.svg`, nunca só na constante declarada. A conta do passo aparece em 26 modelos; os dois que
  mediram o defeito são `02_barras-horizontais/02_barras-agrupadas/v1` e
  `07_butterfly-piramide/v1`.

### GEO-7. Rótulo de coluna mais largo que a célula [2 modelos]

- **Sintoma.** Cabeçalhos colidindo, ou a tentação de descer a fonte abaixo de 11 px.
- **Saída.** Escalonar em duas alturas, com linha conectora até a coluna. Nunca encolher abaixo do
  piso da TIP-2. Visto em `15_mapa-de-calor-e-calendario/07_*/v1`.

### GEO-8. A caixa do rótulo é medida com a fonte errada e guarda o erro para sempre [1 modelo]

- **Sintoma.** O texto vaza do selo para cima da cor do grupo, com contraste abaixo do piso, mesmo
  depois de trocar a estimativa por medição real.
- **Causa.** No primeiro render, antes de `document.fonts` terminar de carregar a fonte da marca,
  `ctx.font` cai para a fonte do sistema, mais estreita, e o cache de largura guarda esse número.
  Nada força um novo render quando a fonte troca: o SVG repinta o glifo largo, e a caixa do selo já
  foi desenhada pela medida estreita.
- **Saída.** Medir com Canvas 2D usando a fonte, o peso e o tamanho reais, e só confiar nessa medida
  quando `document.fonts.check` confirmar que a face exata já carregou; cachear só depois disso. Até
  então vale a heurística de largura por caractere, que superestima de propósito, porque errar para o
  lado de sobrar espaço não quebra nada. Visto em `12_hierarquia/02_treemap-aninhado/v1`.

### GEO-9. Contorno fechado de região vira diagonal cruzando a grade [1 modelo]

- **Sintoma.** Uma diagonal atravessando o calendário ao separar meses.
- **Causa.** Caminho fechado com `Z`, que liga o fim ao início.
- **Saída.** Separador **aberto**, em degrau, desenhado a partir do primeiro dia de cada mês. Visto
  em `15_mapa-de-calor-e-calendario/04_*/v1`.

### GEO-10. Sobra de largura no canvas `faixa` [1 modelo]

- **Sintoma.** Um terço do cartão vazio à direita do gráfico.
- **Saída.** Painel de leitura em `<dl>` ao lado, com duas ou três leituras derivadas do mesmo dado,
  em vez de esticar o gráfico. Visto em `15_mapa-de-calor-e-calendario/04_*/v1`.

### GEO-11. "Pilha mais escura" não vale nos dois temas [1 modelo]

- **Sintoma.** A legenda diz que a sobreposição escurece, e no tema escuro ela clareia.
- **Saída.** Escrever "cor mais forte", que é verdade nos dois. Vale para toda frase de legenda que
  descreva direção de cor.

---

### GEO-12. A ordem das faixas é por métrica, e nada no cartão declara [3 modelos]

- **Sintoma.** Os rótulos do eixo de categoria leem como lista arbitrária. No pior caso leem como erro
  de digitação: num painel de pequenos múltiplos a sequência saiu "A, B, C, E" na primeira linha e
  "D, F, G, H" na segunda, e a primeira reação de quem olha é procurar o engano.
- **Causa.** Ordenar por mediana, por total ou por taxa é quase sempre a decisão certa, e o comentário
  do código explica bem por quê. O comentário não aparece na tela. Alfabética seria pior, mas é a
  única ordem que o leitor reconhece sem ajuda, então qualquer outra precisa se apresentar.
- **Discriminador.** Nem toda ordem precisa de frase. Se **o valor que ordena está escrito em cada item**,
  a ordem se explica sozinha e a frase é dispensável: é o caso de `10_funil/04/v3`, onde cada painel
  escreve a própria taxa, e de qualquer ordem alfabética, que o leitor reconhece sem ajuda. A frase é
  obrigatória quando o critério de ordenação **não aparece em lugar nenhum do cartão**, que é o caso
  do box plot e do strip plot, onde a mediana ordena e não está escrita.
- **Saída.** Uma frase curta no rodapé dizendo qual é a ordem. Se a regra joga um grupo para o fim por
  outro motivo, amostra abaixo de um piso, por exemplo, isso entra na mesma frase. Resolvido em
  `16_distribuicao/01_histograma/v3`, que declara a ordem e o critério do piso; ainda aberto em
  `16_distribuicao/02_box-plot/v1` e `16_distribuicao/03_strip-plot-e-beeswarm/v1`.

### GEO-13. A matriz triangular deixa a primeira medida sem nome [1 modelo]

- **Sintoma.** Uma matriz de correlação de seis medidas nomeia cinco. As linhas vão da segunda à sexta,
  as colunas saem rotuladas só por número, e a medida 1 não tem nome em lugar nenhum do cartão.
- **Causa.** O triângulo inferior descarta a primeira linha e a última coluna. Rotular as linhas pelo
  nome e as colunas pelo índice parece econômico, e funciona para todas as medidas menos uma: a que só
  existe como coluna. A medida órfã costuma ser justamente a mais importante, porque a matriz foi
  montada para responder sobre ela.
- **Saída.** Nomear os dois eixos, ou escrever a correspondência de índice para nome no rodapé. É o
  mesmo princípio da ROT-10: toda parte se nomeia no desenho parado. Visto em
  `15_mapa-de-calor-e-calendario/08_heatmap-de-correlacao/v1`.

### GEO-14. A linha de rodapé que explica o desenho encolhe o próprio desenho [1 modelo]

- **Sintoma.** Nada é cortado, nada transborda, o `check` não acusa erro, e ainda assim os rótulos do
  perímetro chegam mais perto uns dos outros do que estavam antes de o cartão ganhar uma frase de
  rodapé. Em visual radial, a rosa inteira encolhe sem que nenhuma constante do arquivo mude.
- **Causa.** O corpo do cartão é retangular e o visual é travado em `aspect-square`, então ele mede
  `min(largura, altura)`. Cada linha escrita acima ou abaixo tira altura, e a altura já era o lado
  curto: a perda **vira raio**, e o raio é o que separa os rótulos do perímetro, que se espalham por
  um círculo de comprimento `2πr`. Numa peça de eixo cartesiano a mesma linha só espreme a marca;
  aqui ela espreme a marca **e** a distância entre todos os textos de fora.
- **Medido em 2026-09-28**, em `07_rosca-e-radial/07_rosa-de-nightingale/v4`, canvas `quadrado`: com
  três frases o rodapé quebrou em duas linhas e o par "nov/26" e "a realizar" caiu para **3,54 px**
  de tinta a tinta, dentro da faixa de aviso da guarda `COLISAO-TEXTO`; com duas frases o rodapé
  coube numa linha só e o par voltou a folgar. As três frases somavam cerca de 107 caracteres em
  11 px, contra os cerca de 414 px de largura do corpo.
- **Saída.** Contar as linhas de texto **antes** de escolher o canvas, como manda a GEO-1, e cortar a
  frase que repete o que o desenho já diz ao lado da marca (na v4, o contorno tracejado já se explica
  no perímetro de cada mês sem dado). Escrever o rodapé em frases curtas o bastante para caberem numa
  linha na largura do corpo, e conferir a contagem de linhas no PNG, não no código: o `flex-wrap`
  decide a quebra na largura de render e não avisa.

### GEO-15. No topo de um visual radial, o rótulo do setor nasce colado ao rótulo da escala [1 modelo]

- **Sintoma.** Dois números diferentes aparecem lado a lado na mesma linha, um do valor de um setor e
  outro do anel de escala, e leem como um par ou como um número só. Nenhuma guarda reprova, porque a
  distância entre eles está muito acima do piso da ROT-9.
- **Causa.** O rótulo da escala mora no ângulo do topo, que é onde ele não disputa com os rótulos de
  categoria do perímetro, distribuídos em volta. A exceção é o setor que passa pelo topo: o rótulo
  dele sai na mesma faixa de altura, a poucos pixels. O problema aparece quando esse setor ganha uma
  segunda linha de texto, como o valor real de uma marca cortada.
- **Medido em 2026-09-28**, em `07_rosca-e-radial/07_rosa-de-nightingale/v3`: com o mês cortado em
  dezembro, o `R$ 94,2 mil` do valor real ficou a cerca de **14 px** do `R$ 80,0 mil` do anel de
  escala, na mesma linha. Nenhum aviso do `check`, leitura confusa no PNG.
- **Saída.** Pôr o caso que precisa de duas linhas de texto na metade oposta ao rótulo da escala, e
  preferir os ângulos próximos da vertical, onde sobra largura para o texto horizontal: perto da
  horizontal o rótulo cresce para fora e estoura o `viewBox`. Quando o dado escolhe o setor, e não o
  autor, o rótulo da escala é que muda de ângulo.

### GEO-16. Respiro em medida absoluta quebra codificação por área, e a célula pequena paga tudo [erro de 87% medido]

- **Sintoma.** Num treemap, mosaico ou waffle, as células grandes parecem proporcionais e as pequenas
  parecem menores do que o valor delas. A menor de todas quase desaparece, e quem confere as grandes conclui
  que o desenho está certo.
- **Causa.** O respiro entre células, ou a borda, ou o `nodeGap`, é aplicado em **pixels absolutos**, e a
  área que ele consome é a mesma em toda célula; mas a área **disponível** varia com o valor. Então o
  respiro é uma fração desprezível da célula grande e uma fração dominante da pequena. Medido em
  2026-09-28: uma camada de **0,2% do custo**, com 7 px de largura, com respiro de 3 px por lado, desenhou
  **54 px² onde a área do valor pedia 420**, erro de **87%**. No primeiro nível do treemap do Recharts o
  `nodeGap` produz o mesmo efeito em escala menor, com desvio medido de até **4,40%** entre participação de
  área e participação de valor.
- **Efeito colateral.** É invisível à conferência usual, que soma ou olha as células grandes: nos 63
  retângulos de um modelo o desvio por folha deu **0,000%** onde o componente reescalava o resto a cada
  faixa, e o desvio ficou todo concentrado no nível em que o respiro era absoluto. Ou seja a mesma peça pode
  estar exata num nível e mentir 87% em outro, e o número que prova isso não aparece somando o total.
- **Saída.** Três, em ordem de preferência. **Piso de área declarado:** uma constante que garante área
  mínima útil à menor célula, com o desvio que ela introduz escrito no `notes`, que foi a saída usada em
  2026-09-28. **Respiro proporcional** ao lado da célula em vez de absoluto, quando o componente permitir.
  Ou **agregar a cauda** num "outros" acima do piso, que é a saída honesta quando a célula é tão pequena que
  nenhuma área a representa com fidelidade. E confira do jeito que pega: **compare a participação da área
  de cada célula com a participação do valor dela**, célula por célula, lendo os `<rect>` do `preview.svg`;
  somar o total não acha nada.

### GEO-17. O glifo em linha de texto engorda a linha no preview, e só no preview [medido em 2026-09-29]

- **Sintoma.** A peça fecha na página e transborda no arquivo. O preview tem linhas mais altas que a
  página, a divergência de fidelidade sobe acima do limiar, e a diferença **cresce com o número de
  linhas**. Medido em `06_pizza/03_pizza-de-fracao-unica/v3`, numa tabela de 7 linhas: **5,42% de
  divergência**, deriva de **6,5 px por linha**, linha de **36,0 px na página contra 42,5 px no
  arquivo**. O `check` não acusa nada, porque o transbordo é geométrico e nasce no serializador.
- **Causa.** Está na ferramenta, não na peça. Um elemento que **não contém** svg gráfico é serializado
  como ilha (`_render/page/serialize.ts:635`), e dentro da ilha cada `<svg>` é remontado por
  `cloneSvgElement`, cujo estilo sai de `svgStyle` e **não inclui `display`**. Na página o preflight do
  Tailwind dá `svg { display: block }`, e por isso o glifo não participa do fluxo de texto; no arquivo
  ele volta a ser elemento inline e ganha o espaço reservado ao descendente da linha. É a mesma classe
  da ilha de `table-cell` e da divergência de fonte: hipótese do serializador que vale na página e não
  vale no SVG.
- **Saída.** Enquanto a causa raiz não for consertada, **tire o glifo do fluxo de texto**: ponha o
  `<svg>` dentro de um contêiner `flex` com `items-center`, que é o que o molde de tabela com
  microvisual já faz sem dizer por quê. **Não** resolve escrever `display:block` no atributo `style` do
  próprio `<svg>`: o clone descarta o atributo e reescreve o estilo por `svgStyle`. E confira pela
  divergência que o `render` imprime, nunca pelo olho: a deriva por linha passa desapercebida em duas
  linhas e é fatal em sete.

### GEO-18. O `<svg>` esticado encolhe o texto, e o piso de 11 px passa a valer só no papel [14 peças medidas]

- **Sintoma.** O código declara 11 px, o `check` fica verde, e o texto do preview está visivelmente
  menor que o texto de outra peça no mesmo tamanho. Em 2026-09-29 a pior do acervo escrevia a
  **7,23 px** com 11 px no código, e as 14 tinham preview aprovado.
- **Causa.** Um `<svg>` aninhado cujo `viewBox` é maior que a própria caixa encolhe **tudo** o que está
  dentro, texto incluído, e o tamanho declarado deixa de ser o tamanho que chega à tela. O fator não é
  a razão de largura: sem `preserveAspectRatio` o padrão do SVG é `xMidYMid meet`, que escala pela
  **menor** das duas razões e centraliza o resto. Em `07_rosca-e-radial/06_coluna-radial/v2` o
  `viewBox` de 480x480 numa caixa de 422x315,5 dá 0,8792 em largura e **0,6573** em altura, e é a de
  altura que manda. Com `preserveAspectRatio="none"` a escala é anisotrópica e quem governa a altura do
  glifo também é a razão de altura.
- **Efeito colateral, e é o que torna a armadilha silenciosa.** A `COLISAO-TEXTO`, a `CONTRASTE-TEXTO`
  e a `TEXTO-NA-MARCA` **desistem** da peça escalada, com o motivo `preview_com_escala`, porque a
  posição delas fica fora de escala. Então a peça esticada perde três guardas de uma vez e o silêncio
  se parece com aprovação.
- **Saída.** Desenhe no `viewBox` do **tamanho do corpo medido**, para a escala sair 1: é o conserto
  único, porque devolve as três guardas junto com o tamanho. Se por algum motivo a escala tiver de
  existir, divida o tamanho declarado por ela, de modo que o que chega à tela fique em 11 px, e escreva
  a conta no `notes`. A `TAMANHO-TEXTO` mede isso desde 2026-09-29, e as 14 peças do acervo estão na
  fila de dívida, uma chave por peça: quitar é remover a chave, nunca a linha.
- **O caso inverso é seguro para o piso, e só para ele** (escrito em 2026-10-02, com prova no
  `selftest`). `viewBox` **menor** que a caixa nos dois eixos amplia em vez de encolher: o fator é a
  menor das duas razões e as duas passam de 1, então os 11 px declarados chegam maiores. Medido na
  guarda: `viewBox` de 480x240 numa caixa de 600x300 entrega 13,75 px e a `TAMANHO-TEXTO` cala. Duas
  ressalvas. O caso **misto** não é o inverso: `viewBox` menor num eixo e maior no outro encolhe,
  porque manda a menor razão (480x400 na mesma caixa dá 0,75 e o texto chega a 8,25 px, com erro). E
  a ampliação **não devolve** as três guardas de posição: `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e
  `TEXTO-NA-MARCA` desistem com `preview_com_escala` em qualquer escala diferente de 1, para cima
  também. O conserto único continua sendo a escala 1.

### GEO-19. Na borda curva, a âncora fora da marca reentra pelo canto de baixo [medido em 2026-09-29]

- **Sintoma.** O rótulo é ancorado claramente fora do arco, a conta horizontal fecha, e a
  `CONTRASTE-TEXTO` acusa de 1% a 2% da tinta sobre a marca, com 1,00:1 a 1,13:1. Quem confere o
  desenho olhando o meio do rótulo não vê nada: o que encosta é o **canto inferior** da caixa.
- **Causa.** A conta de raia de rótulo do contrato é **horizontal**: tinta por glifo mais respiro. Numa
  borda curva isso não basta, porque a caixa do texto é um retângulo e o arco se afasta do centro à
  medida que sobe; uma âncora radialmente fora da marca pode ter o canto de baixo **dentro** dela, e o
  efeito cresce com a altura da caixa, logo piora com rótulo de duas linhas. Vale para rosca, pizza de
  raio variável, coluna radial, rosa e chord.
- **Saída.** Reserve o afastamento radial contra a **altura da caixa**, não contra a linha de base:
  medido em `11_fluxo-sankey/05_chord-direcional-de-fluxo`, `R_OUTER + 10` acusou nas três versões e
  `R_OUTER + 18`, mais 6 px de recuo horizontal, deixou folga de 4,5, 7,8 e 8,2 px e as três saíram
  limpas. Confira lendo a caixa de tinta do preview contra o raio externo, **pelos quatro cantos**, e
  não pela âncora. Quando o rótulo tem duas linhas, o canto que decide é sempre o de baixo do lado do
  centro.
- **A altura da caixa, que esta entrada mandava reservar e não fornecia** (2026-10-02). A caixa que
  a `CONTRASTE-TEXTO` e a `COLISAO-TEXTO` usam é a do leitor `_render/scripts/lib/colisao.mjs`:
  `ASCENDENTE = 0.72` em acima da linha de base e `DESCENDENTE = 0.10` em abaixo. Em texto de
  **11 px são 9,02 px** (7,92 acima e 1,10 abaixo da linha de base) e em 12 px são 9,84 px. Com
  `dominant-baseline="central"` a linha de base cai 0,26 em abaixo da âncora (`CENTRAL_DESLOCA`),
  então a 11 px a caixa vai de 5,06 px acima da âncora a 3,96 px abaixo dela. Essa caixa subestima de
  propósito a descendente: a tinta medida no acervo tem ascendente mediana de 0,750 em e descendente
  de 0,273 em no p95 (`g`, `ç`), o que em 11 px dá **11,25 px** de tinta real. Reserve os 9,02 px
  para passar na guarda e os 11,25 px quando o rótulo tem letra que desce; em rótulo de duas linhas,
  some a altura de linha uma vez e a caixa uma vez, não duas caixas.

## Tokens e contraste

Cinco das seis entradas desta seção são de medição de contraste, não de geometria nem de dado, e
nenhuma delas é pega pelo `check`. Todas se resolvem medindo os **dois** temas antes de fechar: o
acervo tem caso de token que passa no escuro e reprova no claro, e caso de régua que se inverte
entre eles.

### TOK-1. A marca desaparece contra o cartão, e a tabela do contrato mandava usá-la assim [18 modelos]

- **Sintoma.** O trilho da barra de progresso, a moldura do selo ou a faixa de período não existem no
  tema claro. O ponto do valor fica sem escala por trás, e a peça lê como se o trilho nunca tivesse
  sido desenhado.
- **Causa.** `--surface-overlay` como marca mede **1,00:1 no tema claro e 1,10:1 no escuro**, porque
  no claro ele é exatamente o mesmo branco de `--surface-raised`, que é o fundo do cartão. A
  armadilha vale nos **dois** temas, e o acervo inteiro só registrou o claro: quem conferiu só um
  tema achou que tinha escapado. E a origem não foi desatenção de quem produziu: a tabela de tokens
  de estrutura do `CONTRATO.md` listava "trilho de barra" como uso legítimo do token, contradizendo a
  nota logo abaixo dela e a ANO-4. Os 18 modelos que redescobriram o defeito estavam obedecendo à
  tabela. A linha 253 foi corrigida em 2026-09-25, e desde então a tabela diz **nunca trilho, moldura
  nem faixa**.
- **Saída.** `--surface-overlay` só como fundo atrás de texto: dica, selo neutro, fundo de destaque
  de linha. Estrutura que precisa ser vista usa `--surface-sunken`, o poço rebaixado, ou
  `--line-subtle`. Quando dois estados de ausência precisam ficar distintos no mesmo desenho, um
  ganha chip de `--surface-sunken` e o outro contorno de `--line-strong`, nunca os dois no mesmo
  token. Visto em `01_cards-e-kpis/03_kpi-com-regua-de-meta/v1`,
  `13_progresso-meta-e-gauge/04_aneis-concentricos/v1` e
  `14_tabelas-visuais/09_matriz-de-comparacao-com-status/v4`.

### TOK-2. Dois degraus da rampa sequencial não têm texto legível nos dois temas [7 modelos]

- **Sintoma.** O número dentro da célula do heatmap fica ilegível no tema claro, ou no escuro, nunca
  nos dois ao mesmo tempo.
- **Causa.** Medido contra os dois tokens de texto disponíveis, nem `--text-primary` nem
  `--accent-cyan-contrast` alcançam 4,5:1 contra `--seq-4` e `--seq-5` simultaneamente no claro e no
  escuro. O melhor caso mede 4,29:1, e `--seq-5` inverte a régua entre os temas: o par que passa no
  escuro reprova no claro.
- **Saída.** Escala de 5 degraus, não de 7: `--seq-1` a `--seq-3` e `--seq-6` a `--seq-7`. Os dois do
  meio ficam fora, em vez de entrar com número ilegível. Visto em
  `15_mapa-de-calor-e-calendario/01_heatmap-dia-da-semana-por-hora/v1` e
  `14_tabelas-visuais/02_tabela-com-heatmap-nas-celulas/v1`.

### TOK-3. Não existe rampa divergente nos tokens [4 modelos]

- **Sintoma.** Uma correlação de −0,71 parece mais fraca que uma de 0,44, porque as duas saem no
  mesmo matiz.
- **Causa.** O Farol não tem tokens `--div-*`. Correlação, desvio contra meta, escala de concordância
  e régua de SLA todos precisam de sinal, e a rampa sequencial não carrega sinal.
- **Saída.** Duas alternativas, ambas declaradas em texto na peça. Emprestar slots categóricos
  opostos para os polos, por exemplo slots 5 e 6 de um lado e 3 e 1 do outro; ou compor a cor com
  `color-mix` entre `--negative`, `--surface-overlay` e `--positive`. Nos dois casos a função de cor
  mora num lugar só, para que quando os tokens divergentes existirem ela troque de corpo e mais nada.
  Visto em `15_mapa-de-calor-e-calendario/08_heatmap-de-correlacao/v1`, `06_lasagna/v1` e
  `02_barras-horizontais/08_divergente-empilhada-likert/v1`.

### TOK-4. Duas marcas de cores diferentes se fundem onde se sobrepõem [3 modelos]

- **Sintoma.** A silhueta de um grupo desaparece por cima da barra do outro no tema escuro, e trocar
  o token não resolve.
- **Causa.** Os 8 tokens categóricos são calibrados **contra o cartão**, não umas contra as outras.
  Medidos pela fórmula da WCAG, nenhum par chega perto de 3:1 entre si: o melhor é `--chart-8`, com
  1,30, e `--chart-3` fica em 1,47 no escuro e 1,03 no claro contra `--chart-1`.
- **Saída.** Quem entrega a separação é um revestimento de `--surface-raised` por baixo do traço, que
  mede 9,50 contra `--chart-1` no escuro e 6,00 no claro. O contorno da cor da superfície é o que a
  COR-5 autoriza entre vizinhos que não contrastam. A mesma régua vale para o degradê de luminosidade
  dentro de um grupo: medido em `12_hierarquia/02_treemap-aninhado/v1`, abaixo de 78% de mistura da
  cor do grupo o par mais fraco do tema claro cai abaixo de 3:1. Visto também em
  `16_distribuicao/05_histograma-comparativo/v1`.

### TOK-5. `--line-strong` não se vê como marca, e com opacidade desaparece [3 modelos]

- **Sintoma.** A coluna neutra, o teto de referência ou a amostra da legenda ficam quase invisíveis
  sobre o cartão.
- **Causa.** `--line-strong` opaco mede **1,79:1 no tema escuro e 1,83:1 no claro** contra o cartão,
  muito abaixo do piso de 3:1. Com a opacidade de 0,15 a 0,4 que vários estudos de família pedem para
  faixa e amostra, ele cai para **entre 1,07:1 e 1,25:1**, isto é, some. A isenção da seção 17.2 vale
  para neutro de dado **com o valor escrito ao lado**, e amostra de legenda não tem valor escrito. A
  origem, como no `--surface-overlay`, é indicação de token: os estudos previam `--line-strong` para
  teto e trilho, e quem produziu obedeceu.
- **Saída.** `--line-strong` só como neutro de contexto e sempre com o número escrito. Onde ele é a
  única marca, a cor é `--chart-1` em série única e `--text-muted` no papel de referência: medido em
  `01_cards-e-kpis/03_kpi-com-regua-de-meta/v3`, `--text-muted` é quem sobrevive por cima das faixas.
  Visto também em `09_dispersao-e-bolhas/08_dispersao-com-marginais/v1` e
  `12_hierarquia/07_arvore-e-dendrograma/v1`.

### TOK-6. `fillOpacity` derruba a marca abaixo do piso no tema claro [2 modelos]

- **Sintoma.** A sobreposição clássica de duas distribuições, ou a fita de um alluvial, fica pálida
  demais para ser lida como marca.
- **Causa.** `fillOpacity` compõe a cor da marca com a do cartão. Medido: 0,55 derruba abaixo de 3:1
  no tema claro, e a fita de um alluvial mede de 2,27 a 2,57:1 no claro.
- **Saída.** Cor cheia mais contorno de `--surface-raised`, que separa sem tocar no contraste do
  preenchimento. Quando a sobreposição é o assunto, um grupo é marca preenchida e o outro é silhueta
  em degrau, desenhada como `Line` de tipo `step`. Opacidade continua vedada em texto e no contêiner
  que o contém (ACE-4): quando a marca perde opacidade para sinalizar amostra pequena, o percentual
  dentro dela sai do desenho, porque nenhum texto passa o piso sobre a marca apagada. Visto em
  `11_fluxo-sankey/03_alluvial/v1` e `16_distribuicao/05_histograma-comparativo/v1`.

---

### TOK-7. Degrau do meio da rampa sequencial usado como cor categórica [1 modelo]

- **Sintoma.** Num mapa de calor de faixas, a faixa mais frequente quase some contra o fundo do
  cartão, e a metade de baixo do desenho parece não ter dado nenhum, quando na verdade tem o pior
  desempenho.
- **Causa.** Os degraus `--seq-*` são feitos para receber texto por cima **dentro de uma célula**, não
  para contrastar com a superfície do cartão. Medido contra `--surface-raised`: `--seq-3` dá 2,29:1 no
  escuro e 1,92:1 no claro, enquanto `--positive`, `--warning` e `--negative` ficam entre 5,3:1 e
  8,4:1 nos dois temas. É a entrada vizinha desta seção, sobre texto ilegível nos degraus do meio, de
  cabeça para baixo: aquela mede o texto contra a célula, esta mede a célula contra o cartão.
- **Efeito colateral.** A ordem de luminância quebra. No tema claro a faixa do meio mede 0,497 entre
  vizinhas de 0,143 e 0,133: o miolo da escala vira o ponto mais claro dela, e a escala deixa de
  ordenar.
- **Saída.** Cor categórica de marca sai das cores de papel, nunca da rampa sequencial. Se a escala
  precisa mesmo de um tom intermediário, conferir a **luminância** dos degraus nos dois temas antes de
  fechar, e não só o contraste. Visto em `15_mapa-de-calor-e-calendario/06_lasagna/v1`.
### TOK-8. A rampa sequencial não tem quatro degraus úteis para carregar ordem [famílias 15 e 23]

- **Sintoma.** Uma escala ordinal de quatro ou mais faixas é desenhada nos degraus de baixo da rampa, e
  as duas ou três primeiras faixas ficam indistinguíveis do fundo do cartão. Quem olha conclui que
  aquelas faixas estão vazias.
- **Causa.** Medido contra `--surface-raised` em 2026-09-28, a rampa inteira: no escuro 1,14 / 1,58 /
  2,29 / 3,38 / 4,89 / 6,96 / 10,12 e no claro 1,21 / 1,49 / 1,92 / 2,60 / 3,72 / 5,45 / 8,29. **Só
  `--seq-5`, `--seq-6` e `--seq-7` passam de 3:1 nos dois temas.** São três degraus úteis, não sete, e a
  razão é estrutural: as cores de papel invertem de luminância entre os temas, então o degrau que
  contrasta bem no escuro é justamente o que some no claro. É a `TOK-7` generalizada, de uma cor para a
  escala inteira.
- **Efeito colateral.** Escrever a contagem dentro do bloco **não** salva a leitura: o melhor par de
  texto sobre `--seq-4` mede 4,29:1 no tema escuro com `--text-primary`, abaixo do piso de 4,5:1 da
  `ACE-3`, embora no claro o mesmo par meça 6,91. Quem reprova aqui é o escuro, ao contrário da
  intuição, porque na maioria das medições de marca é o claro que reprova.
- **Saída, e ela é mais fraca do que esta entrada dizia na primeira redação.** Com até três faixas, use
  `--seq-5`, `6` e `7`. Com quatro ou mais, **a ordem não pode morar na cor**: carregue-a pela posição
  fixa, pelo nome da faixa escrito e, quando houver, pela seta ou pelo número, e declare no README que a
  cor não ordena. Isso é contorno, não conserto: **é lacuna de paleta do Farol**, irmã da outra lacuna
  medida no mesmo dia, em que nenhum neutro alcança 3:1 contra o cartão (`--surface-overlay` 1,10 e
  1,00, `--surface-sunken` 1,15 e 1,15, `--line-subtle` 1,25 e 1,29, `--line-strong` 1,79 e 1,83).
- **Os três degraus úteis não entregam nível nenhum pela cor** (medido em 2026-09-28, e esta é a terceira
  redação deste ponto, cada uma mais honesta que a anterior). Degrau contra degrau: `--seq-5` contra
  `--seq-6` **1,42:1**, `--seq-6` contra `--seq-7` **1,45:1**, `--seq-5` contra `--seq-7` **2,07:1**.
  **Nenhum dos três pares chega a 3:1**, então a cor não separa par nenhum, e a primeira redação desta
  entrada, que dizia "dois níveis", era generosa: os dois níveis **só existem porque a legenda escreve o
  intervalo de cada faixa**. Quem carrega a ordem é o texto, não o degrau. É **a saída desta entrada
  passando no teste que ela própria aplica e reprovando no teste vizinho**: os degraus se separam do fundo
  e não se separam entre si. Numa rampa de cinco degraus medida em produção, o único par que chega a 3:1
  é o salto `--seq-3` para `--seq-6`, com 3,03:1 no escuro e 2,84 no claro, isto é reprovando no claro. E camada de destaque sobre a rampa **não existe nesta paleta**:
  nenhuma das oito categóricas passa de 1,16:1 contra os três degraus (melhor `--chart-7` 1,16, pior
  `--chart-6` 1,01), então o que torna a marca visível é o anel de `--surface-raised`, não a cor.
- **Por que aqui a razão entre marcas vale e na `TOK-9` não vale, e a distinção não é detalhe.** Na
  `TOK-9` está escrito que razão entre marcas **não** é exigência, porque em paleta **categórica** o
  matiz carrega a identidade e luminância pareada é deliberada. Numa rampa **sequencial** é o oposto: a
  luminância **é** a informação, o degrau ordena por ela, e distinguir o degrau 5 do 6 é a leitura
  inteira. Então **separação entre vizinhos é exigência para rampa e não é para categórica**, e quem
  citar uma das duas entradas para justificar a outra está trocando encoding ordinal por nominal.
- **A saída de três degraus colide com a matriz de pares, e a condição que resolve é o número na célula.**
  Esta entrada manda usar `--seq-5`, `6` e `7`; a matriz de texto sobre preenchimento diz que **`--seq-4` e
  `--seq-5` não aceitam texto nenhum** (o melhor par sobre `--seq-5` mede 3,72:1, abaixo do piso de 4,5:1).
  Como esta mesma entrada recomenda **escrever o número** para carregar a ordem, as duas instruções se
  anulavam. A leitura correta, medida em produção em 2026-09-28, separa dois regimes: **com número escrito
  em toda célula**, vale a isenção da 17.2 e a rampa pode usar mais degraus, porque a informação não depende
  da cor e a cor vira apoio de varredura; **sem número na célula**, que é o caso de pequenos múltiplos e de
  radial, você fica nos três degraus e a peça afirma **dois níveis**, e chamar isso de escala de cinco
  degraus seria mentira de desenho. Uma peça de 2026-09-28 usou cinco faixas com texto legível em todas, e
  as irmãs sem espaço para número usaram três.
- **O pedido de paleta, em forma executável, e refinado por quem sofreu com ele.** A primeira redação pedia
  **3:1 entre vizinhos**, que é exigente demais para uma rampa. O pedido que resolve os casos reais é mais
  modesto e mais preciso: **quatro degraus com 3:1 contra o cartão nos dois temas e 2:1 entre vizinhos**,
  porque na rampa a posição também ordena e 2:1 basta para separar degraus adjacentes. Mais **um token de
  guia que alcance 3:1 contra o cartão e contra os quatro degraus**, sem o qual contorno de janela dentro da
  grade é impossível: um produtor teve de tirar o contorno para fora da grade, abrindo um canal de 6 px de
  propósito. Sem isso, mapa de calor, calendário e densidade 2D ficam limitados a dois níveis onde não cabe
  número, e as famílias 15 e 23 nascem comprometidas no canal principal. Espera decisão do dono da paleta.
- **O limitado é o canal de cor, não o modelo**, e a distinção é de quem produziu: onde cabe número dentro
  da célula o heatmap entrega a leitura inteira e lê bem nos dois temas; onde não cabe, ele afirma dois
  níveis. Não é o modelo que está comprometido, é o que ele pode dizer **pela cor**.

### TOK-9. Ninguém mede marca contra marca, e é ali que o destaque morre [medido em 2026-09-28]

- **Sintoma.** Uma série está em destaque e as outras em neutro. No tema escuro a diferença se vê; no
  claro as duas linhas parecem a mesma coisa, e o leitor não sabe qual delas é o assunto do cartão.
- **Causa.** Toda guarda de contraste do `check` mede **marca contra fundo**, que é o piso da WCAG
  1.4.11, e a `ACE-3` e a `ACE-8` também. Nenhuma mede **marca contra marca**, que é a pergunta real do
  destaque: não interessa que as duas séries se separem do cartão se elas não se separam **entre si**.
  Medido numa dispersão conectada: aceso `--chart-1` contra neutro `--text-muted` dá **1,82:1 no escuro
  e 1,12:1 no claro**, embora cada um deles, contra o cartão, passe folgado (9,50 e 6,00; 5,21 e 5,37).
- **Efeito colateral.** O defeito é invisível ao portão e ao olho de quem revisa no tema escuro, que é o
  padrão do Farol. Só aparece trocando o tema, e é por isso que a `ACE-7` manda conferir os dois. É a
  mesma assimetria da `TOK-8` vista de outro ângulo: as cores de papel invertem de luminância entre os
  temas, então par que se separa num tema converge no outro.
- **Saída.** Destaque **nunca** mora só na cor, e isso não é preferência: é consequência medida da
  paleta. Some espessura, forma (anel vazado contra ponto cheio), rótulo próprio e peso, que é o que a
  `ACE-2` já pede como "cor nunca é o único canal", e meça o par marca contra marca **à mão nos dois
  temas**, escrevendo o número no `notes`, porque nenhuma guarda faz isso por você.
- **Correção da primeira redação desta entrada, no mesmo dia.** Ela dizia que guarda de razão entre
  marcas era "candidata declarada", e **isso está errado e seria destrutivo**. Razão de contraste mede
  **luminância**, e duas cores de matiz bem diferente podem ter luminância quase igual: medido,
  `--chart-1` contra `--chart-5` dá **1,61:1 no escuro e 1,04:1 no claro**. Paleta categórica de
  luminância pareada é **prática deliberada e correta**, e a WCAG 1.4.11 pede 3:1 de objeto contra
  **fundo**, nunca de objeto contra objeto. Quem cobre distinguir categoria é a 1.4.1, "não depender de
  cor", isto é a `ACE-2`. Uma guarda que exigisse 3:1 entre marcas reprovaria a paleta inteira e
  empurraria o catálogo para cores de luminância espalhada, que é pior para quem vê cor e não ajuda quem
  não vê. **O que a medição serve para provar é que o segundo canal é obrigatório**, não que a paleta
  está quebrada; se guarda houver, ela verifica a **presença do segundo canal**, não a razão.

### TOK-10. Guia que atravessa marca preenchida não tem token que sirva [medido em 2026-09-28]

- **Sintoma.** Uma guia de referência, linha de limiar ou marca de meta cruza o plano e passa por cima de
  barras ou de área preenchida. Ela se vê no fundo do cartão e **desaparece dentro da barra**, ou o
  contrário: se vê na barra e desaparece no cartão. Trocar a cor resolve uma metade e quebra a outra.
- **Causa.** Medido: **nenhum token do Farol alcança 3:1 contra o cartão e contra uma marca de dado ao
  mesmo tempo.** `--text-muted` dá 5,21:1 e 5,37:1 contra `--surface-raised`, e **1,82:1 e 1,12:1** contra
  `--chart-1`. `--line-strong` dá 5,32:1 e 3,27:1 contra a coluna, e **1,79:1 e 1,83:1** contra o cartão.
  O problema é estrutural e não de escolha: a guia precisa contrastar com **dois fundos de luminância
  oposta**, e um token só tem uma luminância.
- **Efeito colateral.** É a terceira face da mesma lacuna. A `TOK-8` mede degrau contra degrau numa rampa,
  a `TOK-9` mede marca contra marca numa paleta categórica, e esta mede **marca contra área preenchida de
  outra marca**. As guardas do `check` medem marca contra **cartão**, então todas as três passam verdes.
- **Saída.** Não procure a cor certa, porque ela não existe: dê à guia **um segundo fundo próprio**. As
  duas saídas medidas no acervo são o **anel ou halo na cor da superfície** em volta da marca da guia, que
  é a `COR-5` e a `ROT-7` aplicadas a marca em vez de a texto, e **quebrar a guia em trechos**, deixando-a
  passar por fora da barra em vez de atravessá-la. A segunda é mais honesta quando a guia é um limiar e a
  barra é o dado, porque a guia interrompida não sugere que o valor dela vale dentro da barra.
- **O pedido de paleta.** Um token de guia que alcance 3:1 contra `--surface-raised` **e** contra as oito
  `--chart-*` nos dois temas, ou a decisão explícita de que guia sempre carrega halo. Espera o dono da
  paleta, junto com os pedidos da `TOK-8`.

## Dado

### DAD-1. Taxa escrita sem o volume [38 modelos]

- **Sintoma.** Célula com "67%" e nada mais, sobre amostras que vão de 3 a 31 casos.
- **Saída.** O `data.ts` declara **contagens**, não a taxa. Assim é impossível o percentual escrito
  divergir do volume escrito, e a peça não depende de disciplina de quem cola. Regra NUM-1.

### DAD-2. Ausência virando zero [38 modelos]

- **Sintoma.** Um dia sem expediente contado na média; um lead sem contato entrando como zero minuto.
- **Saída.** Ausência sai da amostra e é contada no rodapé, sempre. Zero medido e ausência precisam
  de tratamentos visuais distintos: zero fica no neutro fora da rampa, ausência é hachurada ou
  contornada.

### DAD-3. Dado gerado sem semente fixa, ou lido do relógio [8 modelos]

- **Sintoma.** O preview muda a cada render e o `check` acusa preview desatualizado sem ninguém ter
  editado nada. Na peça de calendário, a diagonal do cohort ou o corte do mês parcial muda de lugar
  de um dia para o outro.
- **Causa.** Duas fontes de não determinismo, e a segunda é a mais fácil de deixar passar:
  `Math.random()` em tempo de render, e `new Date()` sem argumento, ou dias decorridos lidos do
  navegador, que colocam o relógio da máquina dentro do desenho.
- **Saída.** Todo dado nasce de gerador determinístico, e o array final vai **escrito** no `data.ts`.
  Nada de `Math.random()` em tempo de render, nem para jitter: ruído vem de hash do id do registro. E
  tudo o que depende de "hoje" entra por prop ou por constante do `data.ts`, isto é, mês corrente,
  dias decorridos, dias no mês, data de corte. O preview e o teste precisam desenhar a mesma coisa em
  qualquer data. Visto em `15_mapa-de-calor-e-calendario/03_cohort-em-triangulo/v1` e
  `03_colunas-verticais/07_realizado-e-projecao/v2`.

### DAD-4. O ponto percentual sai escrito como percentual [4 modelos]

- **Sintoma.** Uma variação de 9,2 pontos percentuais aparece como "9,2%", e quem lê entende que a
  taxa é de 9,2%.
- **Causa.** `formatPercentPoints` do Farol imprime o número com o sinal de porcentagem, não com a
  unidade de ponto percentual. Desde 2026-10-01 a mesma função tem o nome honesto
  `formatPercentFromScale100`, que é o que a versão nova importa (seção 8 do contrato); o nome antigo
  segue exportado e liberado, e os dois devolvem o mesmo texto. Trocar o nome não muda a causa: nenhum
  dos dois escreve ponto percentual.
- **Saída.** `formatDecimal` com a unidade `p.p.` escrita ao lado. O pedido de um formatador próprio
  fica registrado no README, em Referências, nunca contornado por dentro do componente. Visto em
  `01_cards-e-kpis/06_par-de-indicadores/v2`,
  `07_rosca-e-radial/03_aneis-concentricos-de-dois-periodos/v2` e
  `13_progresso-meta-e-gauge/03_progresso-radial-de-anel-unico/v2`.

### DAD-5. O corpo do cartão e a frase acessível dizem o mesmo número de dois jeitos [8 peças]

- **Sintoma.** A tela mostra "+12%" e o leitor de tela lê "Alta de 12,4%". Ou o corpo escreve
  "54,8% (23 de 42)" e a frase acessível só "54,8%". Ou o corpo diz "+30% acima" e a frase "130% da
  meta", que é o mesmo número em duas unidades.
- **Causa.** Os dois textos nascem em momentos diferentes e ninguém os compara depois. O corpo costuma
  usar os dígitos adaptativos da NUM-1 e a frase fixa uma casa decimal; e a guarda de caso especial
  entra no corpo e é esquecida na frase, que continua chamando a função crua.
- **Saída.** Calcule o texto **uma vez** e use nos dois lugares, como faz `01_cards-e-kpis/01_kpi-simples/v3`.
  Onde não der, compare formatador a formatador antes de entregar. Numa auditoria de 22 peças, 5 classes
  divergiam em 8 peças, e 4 delas pelo mesmo motivo, os dígitos. Visto em `01_cards-e-kpis/01_kpi-simples`
  v1, v2, v3 e v4, `01_cards-e-kpis/02_kpi-com-minigrafico-de-tendencia/v1`,
  `01_cards-e-kpis/07_grade-e-tira-de-kpis/v4`, `02_barras-horizontais/02_barras-agrupadas/v2` e
  `02_barras-horizontais/05_barras-contra-meta/v4`.

### DAD-6. A guarda de vazio testa a lista vizinha, e a mediana nasce zero [9 modelos]

- **Sintoma.** O cartão escreve "mediana da equipe 0%" ou planta o traço tracejado da mediana colado na
  base, num recorte em que ninguém tem base de cálculo.
- **Causa.** A agregação roda sobre uma lista filtrada, `withQuota`, `qualifying`, um `flatMap`, e a
  guarda de vazio testa **outra** lista, quase sempre a de cima: `data.length`, `executives.length`.
  Quando a filtrada esvazia e a vizinha não, a guarda não dispara. Doze de quinze implementações de
  mediana do acervo devolvem `0` para lista vazia, e esse zero vira medição na tela.
- **Saída.** A guarda testa **a lista que alimenta a conta**, nunca a vizinha, e a função de agregação
  devolve `null` em vez de `0`. Assim o caso vazio vira `formatUnavailable()` e o traço deixa de ser
  desenhado, em vez de plantar zero medido onde não houve medição. Visto em
  `13_progresso-meta-e-gauge/01_barra-de-progresso-linear/v3` e em
  `01_cards-e-kpis/07_grade-e-tira-de-kpis` v3 e v4.
- **A conta vizinha herda o mesmo zero, e uma delas devolve infinito** (medido em 2026-09-28, no lote
  que consertou seis peças). Onde há mediana de lista vazia costuma haver mais: média escrita como
  `values.length === 0 ? 0 : soma / n`, taxa escrita como `base > 0 ? parte / base : 0`, percentual de
  etapa zerado por falta de denominador. E, no mesmo `map` da mediana, `Math.min(...[])` e
  `Math.max(...[])` devolvem `Infinity` e `-Infinity`, que não são zero mas também não são medida, e
  chegam ao eixo e à dica como número. Consertar só a mediana deixa a peça meio consertada: as
  medidas que saem da mesma lista viram `null` juntas.
- **Onde a guarda cai, o desenho tem que cair junto.** Não basta a frase acessível dizer
  `formatUnavailable()`: a marca da medida ausente (traço de mediana, `ReferenceLine`, ponto de
  rótulo) não é desenhada, e a linha de referência que atravessa o vazio leva `connectNulls={false}`
  pela EIX-10. Quando a quebra é discreta demais para se explicar sozinha, uma nota curta em
  `--text-muted` diz quantos recortes ficaram sem medida.
- **Seis peças passaram a ter esta forma em 2026-09-28**, com o `null` aplicado a toda conta da mesma
  lista: `04_linhas/02_multiplas-series/v4`, `04_linhas/09_pequenos-multiplos-de-linha/v2`,
  `09_dispersao-e-bolhas/11_pequenos-multiplos-de-dispersao/v1`, `10_funil/04_funil-comparativo/v3`,
  `16_distribuicao/01_histograma/v1` e `16_distribuicao/03_strip-plot-e-beeswarm/v1`. Em todas o dado
  publicado é completo, então o desenho não mudou: **o defeito estava no ramo e não na foto**, que é
  o motivo de nenhuma revisão por PNG o ter pego.

### DAD-7. A composição melhora, o volume despenca, e a peça só mostra a composição [3 modelos]

- **Sintoma.** Uma pilha de 100% mostra a ausência de origem caindo, e o leitor conclui que a base
  melhorou, quando o total de leads caiu junto.
- **Causa.** `stackOffset="expand"` normaliza cada período, então a altura deixa de carregar volume.
  Redistribuição de peso e queda de volume desenham igual.
- **Saída.** Toda peça da família escreve o total absoluto em algum lugar: na linha de leitura, no
  `n` acima de cada coluna, ou num painel de total sincronizado abaixo. Decisão do dono, e vale para
  área 100%, coluna 100% e funil por composição. Visto em `05_areas/03_area-100/v3` e
  `03_colunas-verticais/04_colunas-empilhadas-100/v1`.

### DAD-8. Nome real de produto ou plataforma [0 modelos, pego pelo guarda]

- **Sintoma.** O `check` reprova com `MARCA-REAL`, às vezes só no segundo render.
- **Saída.** Nomear pelo **tipo**, não pelo fornecedor: "Mensageria" em vez do app, "Social" e
  "Busca paga" em vez das plataformas. Além de passar no guarda, é o recorte que sobrevive à troca de
  fornecedor. A lista está em `_render/scripts/lib/marcas-bloqueadas.mjs`.

---

### DAD-9. O recorte de período só existe na frase acessível [1 modelo]

- **Sintoma.** O cartão diz "374 fechamentos no ano" e o título diz "em 2026", enquanto o dado termina
  em setembro. Quem usa leitor de tela recebe o recorte certo e quem enxerga não.
- **Causa.** A frase do `aria-label` é **calculada do dado**, então ela carrega o último dia medido
  sozinha. O número em destaque e o rodapé são escritos à mão e ficam com a redação do ano inteiro. A
  divergência nasce dessa assimetria entre texto calculado e texto escrito, e nenhum guarda a mede.
- **Saída.** O qualificador de período aparece onde o número aparece. É a inversão do princípio já
  conhecido de não deixar nada essencial só na dica: aqui o essencial ficou só no que não se vê. Visto
  em `15_mapa-de-calor-e-calendario/04_calendario-estilo-contribuicoes/v1`, e resolvido por uma vizinha
  da mesma família, `15_mapa-de-calor-e-calendario/03_cohort-em-triangulo/v1`, que marca com tracejado
  o período em curso e diz isso na legenda.
### DAD-10. O comentário do topo promete um rótulo que o desenho não desenha [1 modelo]

- **Sintoma.** O comentário de abertura afirma que cada ponto além da cerca carrega o código do lead,
  "que é o que transforma a peça de curiosidade em fila de trabalho", e nenhum código chega à tela.
- **Causa.** O tipo do ponto carrega o campo, o `Scatter` recebe os dados e desenha só a forma. A
  promessa sobrevive à revisão porque quem lê o código acredita nela e quem olha o PNG não sabe que
  ela existe. Costuma nascer de uma intenção real que não coube: com dezenove pontos o rótulo não
  entra.
- **Saída.** Revisar contra o PNG, nunca contra o comentário, e tratar toda afirmação do comentário
  como algo a conferir na tela. Quando o rótulo não cabe, quem muda é o comentário. Visto em
  `16_distribuicao/02_box-plot/v1`.
## Fluxo

- `npm run render` e `npm run check` rodam **de dentro de `_render/`**, com caminho relativo à raiz
  de VISUAIS (`16_distribuicao/01_histograma`), nunca com `../`.
- O `check` compara um sha de `Chart.tsx`, `data.ts` e `meta.json` com o do preview. Qualquer edição
  depois do render reprova com "preview desatualizado": render por último, sempre.
- Heredoc de Bash quebra em `Chart.tsx` por causa dos template literals com crase. Componente vai
  pela ferramenta de escrita; heredoc serve para `data.ts`, `meta.json` e README.
- `demonstrates` do `meta.json` aceita itens de 3 a 90 caracteres. Item longo reprova.
- Quem produz ou conserta **não roda** `npm run revisao`.
- O aviso `ESPESSURA-MARCA` é esperado em histograma denso e em minigráfico: ali a marca fina é a
  forma certa. Ele avisa e não reprova; registrar o motivo em "Pendências conhecidas" do README do
  modelo.
- Quando a `ESPESSURA-MARCA` não mede, os dois motivos de marca querem dizer coisas diferentes.
  `sem_marca_de_barra`, o que mais sai, diz que o leitor não achou no `preview.svg` nenhum `<rect>`
  ou `<path>` preenchido com caixa própria: é a peça de círculo, de arco ou de linha.
  `marca_fora_do_bar` não é "peça sem `<Bar>`": é marca desenhada à mão **sem rótulo dentro dela**,
  e com o rótulo dentro a mesma peça é medida pelo piso do rótulo interno (texto mais 6 px) e reprova.
- A medição por trás do aviso acima, de 2026-10-02: no acervo saem 191 `sem_marca_de_barra` e 52
  `marca_fora_do_bar` em 491 versões; uma peça de SVG puro sem `<Bar>` nenhum foi medida nas quatro
  versões e uma delas reprovou com 16 px contra o piso de 17; e os dois motivos aparecem dentro do
  mesmo modelo, então a versão vizinha não prevê o da sua. As condições estão em
  `guardaEspessuraMarca`, em `_render/scripts/lib/guardas.mjs`, e as duas têm prova no `selftest`.
- O guarda `CONTRASTE-TEXTO` mede a tinta por um estimador próprio, mais grosso que a medição por
  Canvas 2D, e acusa 1 a 2 px de tinta na borda do glifo num rótulo que cabe inteiro. A folga extra
  vai só no desenho do selo, nunca na decisão de caber, que continua contra a largura útil real. Visto
  em 8 modelos, entre eles `12_hierarquia/02_treemap-aninhado/v1`.

---

## Antes de entregar

Dez perguntas contra o PNG que você mesmo acabou de gerar, nos dois temas. Elas existem porque cada
uma corresponde a uma classe de defeito que passou no `check` e morreu na revisão humana: nenhuma se
mede, e todas se veem. Pergunta fechada, resposta sim ou não; não é convite a olhar com carinho.

1. **Anotação sem dono.** Tape a legenda com a mão. A anotação, sozinha, diz qual número é de qual
   grupo? E a ordem em que ela cita os grupos é a mesma em que a legenda os lista, de cima para baixo
   ou da esquerda para a direita? Se as duas ordens divergem, escreva a anotação na ordem da legenda
   ou nomeie o grupo dentro do número.
2. **Mensagem no rodapé.** Qual item carrega a mensagem da peça? Ele está na primeira linha que o
   olho encontra, ou no rodapé do cartão? Num eixo de categoria vertical, o primeiro item do array
   vai para a base.
3. **Zero e ausência lendo igual.** Varra a coluna de marcas com o olho, sem ler texto. A fila com
   zero medido e a fila sem coleta parecem duas coisas diferentes, ou duas linhas vazias iguais? Se
   só a palavra as separa, a EST-2 está cumprida e a leitura não.
4. **Buraco desenhado num grupo e não no outro.** Onde a linha ou a silhueta encosta no zero, um
   leitor distingue "medi e deu zero" de "não medi"? Se a barra tem marca de faixa vazia e a linha
   não, os dois grupos não contam a mesma história.
5. **Dica que repete o rótulo.** Abra a dica. Ela acrescenta um número que não está escrito no corpo?
   Se repete o rótulo, ela não justifica o cursor.
6. **Rótulo ancorado na base.** A barra cresce para os dois lados ou pode ter valor negativo? Então o
   rótulo está em `x + width` e não em `x`: o Recharts devolve `x` no pixel da base, e um valor
   negativo cola o número em cima da própria barra.
7. **Maiúscula no meio da frase acessível.** Leia a frase em voz alta. Algum `label` reusado do dado
   entrou com maiúscula no meio da oração?
8. **Marca de exceção discreta demais.** A marca da faixa vazia, do zero ou da ausência ainda se vê
   no PNG no tamanho em que o cartão vai ser colado, ou ela só existe porque você sabe onde procurar?
9. **Conserto sem comentário.** Este arquivo tem uma linha que só está certa por causa de uma
   armadilha do Recharts? Você deixou o comentário de uma linha que impede a próxima cópia de
   desfazer o conserto?
10. **Frase que arredonda o regime.** A linha de leitura afirma um regime ("abaixo da meta até
    mai/26"). Olhe o desenho período a período: existe um que contradiz a frase? Se a inversão vier no
    outro sentido, a frase inverte o sujeito?
