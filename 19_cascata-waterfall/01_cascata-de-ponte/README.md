# Cascata de ponte

## O que é

A forma canônica da família: uma coluna de início ancorada no eixo, passos flutuantes de aumento e queda, cada um começando onde o anterior terminou, e uma coluna de fim ancorada. Cada passo é uma faixa `[baixo, alto]` de um `Bar` do Recharts com `shape` próprio, que desenha o retângulo, o rótulo e o conector até a coluna seguinte. Lê-se da esquerda para a direita (ou de cima para baixo, na ponte deitada): o nível onde o conector sai é o nível onde o passo seguinte começa, e o sinal e a cor dizem se o passo soma ou subtrai. Responde como um valor virou outro.

## Quando usar

* Explicar a passagem entre dois valores do mesmo indicador, com 3 a 12 passos de sinais opostos, como a receita de um trimestre para o seguinte.
* Blocos lógicos com parciais que alguém usa, como o custo em três camadas, com o subtotal acumulado declarado no rótulo.
* Diferença entre dois períodos decomposta em efeitos calculados (volume, custo, mix), com o resíduo explícito quando o modelo não fecha.
* Nomes de passo longos: deitar a ponte, com a leitura descendo de cima para baixo.
* A mesma ponte repetida por linha de tabela, com até 8 passos e escala comum, na versão micro.

## Quando evitar

* Mais de 12 passos sem agrupar a cauda: agrupar em "Demais (n)" ou usar a tabela visual da família 14.
* Partes todas positivas em que o total não interessa: barras simples das famílias 02 ou 03.
* Queda etapa a etapa de um mesmo conjunto que só perde: funil com taxa de passo, família 10.
* Variações minúsculas diante de totais grandes: tirar as colunas de total e mostrar só os efeitos (v3 e v4 fazem isso), nunca quebrar o eixo.
* Ordem cronológica em ponte deitada: manter a vertical, com o tempo correndo da esquerda para a direita.

## Anatomia

1. **Coluna de total** (início, fim ou subtotal): ancorada no zero, `--chart-1`, rótulo em `--text-primary` por `formatCurrencyAxis`.
2. **Passo flutuante**: faixa `[baixo, alto]` calculada por função pura (`buildRows`), cor por papel (`--positive` aumento, `--negative` queda; na v3 a polaridade se inverte porque CPL que sobe é o ruim) e rótulo com sinal à mão sobre o valor absoluto (`+` ou `−`, NUM-3).
3. **Conector**: traço de 1 px em `--line-strong` desenhado pelo próprio shape, do fim de uma coluna ao começo da seguinte; a largura da banda vem de `usePlotArea`, chamado dentro de um componente de shape.
4. **Passo zero**: traço de 2 px em `--text-secondary` com o rótulo `R$ 0`; zero medido não some (REC-11).
5. **Fechamento verificado no dado**: função que devolve `number | null` com a diferença entre a soma dos passos e fim menos início; só aparece na linha de leitura se houver erro.
6. **Linha de leitura** (`aria-hidden`, 12 px) com a variação e a base, e **dica** (`ChartTooltip`) com o valor exato e o acumulado, que o rótulo não traz.
7. **Frase acessível** calculada do dado, com os nomes dos passos em minúscula.

## Versões

* `v1_ponte-da-receita-do-trimestre`: ponte vertical da receita de 2026-T2 a 2026-T3, com passo zero em traço de 2 px e fechamento verificado.
* `v2_custo-em-tres-camadas-deitado-com-subtotais`: ponte deitada com subtotais ancorados, linha espaçadora entre blocos e conector vertical que atravessa o vão.
* `v3_cpl-por-efeito-com-residual-nao-explicado`: variação do CPL por efeito, resíduo hachurado como passo próprio e polaridade invertida.
* `v4_cascata-micro-da-carteira-por-executivo`: dez cascatas de SVG puro numa tabela, mesma escala em todas as linhas, passo zero em traço fino e linha sem dado.

## Como colar no Farol

1. Copiar `Chart.tsx` e `data.ts` da versão para o diretório do visual e trocar o `data` pelo retorno da métrica; os tipos (`BridgeItem` e afins) vêm do `data.ts`.
2. Entregar o dado já na ordem da ponte, com o fim declarado: o componente confere a soma e escreve na linha de leitura quando a ponte não fecha.
3. Embrulhar num `VisualCard` e trocar o estado vazio inline por `EmptyState`; o título e a procedência são do cartão.
4. Na v4, a coluna de valores e a dica por linha (`<title>` do SVG) são do componente; se o Farol quiser dica rica, o padrão é a dica do Recharts na versão grande.

## Referências

* Método: a ponte (bridge) de Gene Zelazny, em "Say It With Charts"; o princípio de ancorar totais no zero e deixar só os passos flutuarem.
* Recharts 3.10.1: `Bar` com `dataKey` devolvendo faixa e `shape` próprio, `usePlotArea`.
* Farol: `app/src/components/visuals/charts/ChartTooltip.tsx` e `app/src/lib/format.ts`.
* Pedido ao Farol: nenhum formatador escreve o sinal `+` em moeda, então cada versão o escreve à mão sobre o valor absoluto.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, as quatro versões julgadas pela primeira vez e aprovadas. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

* `v1`, `v2`, `v3` e `v4`: o conector é um traço de 1 px em `--line-strong`, medido em 1,79:1 no escuro e 1,83:1 no claro. Foi lido como referência pela ACE-6: tapado o traço, o nível de cada passo continua na posição das barras e o valor continua escrito. Se o conector passar a dizer algo que a barra não diz, ele precisa de token de dado.
* `v1`, `v2`, `v3` e `v4`: o bloco de vazio traz só a frase, sem o ícone `Filter` de 16 px da EST-1. Não aparece no preview.
* `v1`, `v2`, `v3` e `v4`: os números da linha de leitura ficam em Manrope sem `tabular-nums` (TIP-1). Sem consequência visível.
* `v1`, `v2` e `v4`: o rótulo direto sai de `formatCurrencyAxis`, e a NUM-1 pede `formatCurrencyCompact`. Com o dado fixo, todo em milhar redondo, a única diferença seria o `,0`; com dado real o passo perde a casa decimal do milhar.
* `v1`: os totais saem como `R$ 1,7 mi` e `R$ 1,9 mi`, e a diferença lida nos dois rótulos (R$ 0,2 mi) não bate com os `+R$ 172 mil` da linha de leitura. É o arredondamento do milhão a uma casa diante de passos de R$ 96 mil; o desenho está na escala certa e o valor exato está na dica. Cabe um pedido ao Farol de moeda compacta com duas casas no milhão.
* `v1` e `v3`: o rótulo do passo de queda fica acima do topo da barra, onde o passo começa, e não na ponta livre (ROT-2). Na `v3` o rótulo de Volume fica do outro lado da linha do zero. Não há sobreposição, e cada rótulo se lê com a barra dele.
* `v1`: o título do `meta.json` ("Ponte da receita do trimestre") encurta o do catálogo ("Ponte da receita reconhecida do trimestre").
* `v2`: o período (`ago/26`) só existe na frase acessível; título, subtítulo e linha de leitura não dizem de quando é o custo (DAD-9).
* `v2`: a linha de leitura quebra em duas linhas no canvas `alto`, e a ANO-5 pede uma. Não há corte nem sobreposição, e a conta do corpo já desconta as duas linhas.
* `v2`: passo neutro contra subtotal mede 1,16:1 no escuro e 1,35:1 no claro (TOK-9). A separação vive do matiz, do peso 600 do rótulo, do nome da camada no eixo e da âncora no zero; o `notes` não traz o número.
* `v3`: fidelidade do preview de 0,58% no escuro e 0,63% no claro, acima de 0,5% e abaixo do teto de 2%. A diferença está toda no subtítulo da moldura, depois do par `P` e `L` de "CPL", defeito de fonte que o próprio `render` anuncia, com conserto em `app/src/main.tsx`. O corpo do Chart não difere.
* `v3`: a linha de leitura e a frase acessível escrevem `2026-07` e `2026-08` crus, e a NUM-7 pede `formatMonthShort` (`jul/26`), como a `v2` já faz. `v1` e `v4` escrevem `2026-T2` e `2026-T3`, e o Farol não tem formatador de trimestre.
* `v3`: a linha do zero é pintada por cima das marcas e risca com 1 px a barra de Custo, que cruza o zero. A barra continua se lendo como uma só; pintar a referência por baixo fecha o caso.
* `v3`: na linha de leitura, `R$ 5 (18%)` não diz 18% de quê (a frase acessível diz "da diferença"), e `R$ 184` e `R$ 5` saem sem o "por lead" que a versão existe para demonstrar (NUM-6).
* `v3`: o catálogo diz "unidade no rótulo e no tique", e a versão não tem tique de valor, pela ROT-2. O `meta.json` já tirou o "e no tique"; falta alinhar a linha do catálogo, decisão do dono.
* `v3`: com `from` igual a zero a linha de leitura divide por zero. A `v1` trata o mesmo caso com "sem base medida".
* `v4`: a coluna `Carteira` não diz o período (é o saldo de 2026-T3) e a coluna `Variação` não nomeia a base na própria linha (NUM-4, NUM-5). Os dois períodos estão na linha de leitura, logo acima.
* `v4`: a frase que identifica os cinco espaços ("Da esquerda para a direita: ...") e o "em quatro passos" da frase acessível são texto fixo, e `COLUMNS = 5` é constante. Com outro conjunto de passos, o texto e a largura do espaço ficam errados em silêncio; derivar dos `label` e de `items.length`.
* `v4`: `STEP_MIN` e `ZERO_MARK` valem 2 px, então o passo medido pequeno (Davi R., cancelamentos de −R$ 20 mil, 1,93 px) sai com a espessura do traço do zero e se separa dele só pela cor. O comentário de `STEP_MIN` está com a frase quebrada.
* `v4`: as linhas seguem a ordem do dado, sem critério declarado no cartão, e a linha sem dado fica no meio da tabela.
