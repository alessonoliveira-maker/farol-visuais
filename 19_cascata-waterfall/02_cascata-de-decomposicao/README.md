# Cascata de decomposição

## O que é

Uma ponte com um único estoque: parte de um total e o consome parte a parte até zero ou até o gap da meta, ou constrói o total a partir do zero. Cada coluna é uma faixa `[baixo, alto]` de um `Bar` do Recharts com `shape` próprio, que desenha o retângulo, o rótulo com valor e participação e o conector até a coluna seguinte. Lê-se da esquerda para a direita: o nível onde o conector sai é onde a parte seguinte começa. Responde de que partes se compõe o total, ou para onde foi cada unidade.

## Quando usar

* Total quebrado em 4 a 10 partes com ordem defensável (tamanho, bloco de negócio ou sequência de decisão), com ao menos uma parte negativa.
* Ponte até a meta: realizado, contratado e pipeline ponderado consumindo a meta, com o gap restante como último passo.
* Da entrada bruta ao desfecho, subtraindo cada perda em degraus, quando a pergunta é para onde foi cada unidade.
* Total medido cujo detalhamento está incompleto, com a parte sem detalhamento declarada.

## Quando evitar

* Partes todas positivas e total secundário: barras da família 02 ou rosca da família 07.
* Partes sem ordem de leitura: a mesma decomposição conta histórias diferentes; ordenar ou trocar de forma.
* Muitas partes abaixo de 2% do total: agrupar em Demais com desdobramento, nunca deixar fiapo sem rótulo.
* Taxa de passagem entre etapas: funil com taxa, família 10.
* Só importa quanto falta para a meta: progresso e meta, família 13.

## Anatomia

1. **Coluna de total ou de meta**: ancorada no zero, `--chart-1`, rótulo em `--text-primary` por `formatCurrencyAxis` (ou `formatInt` em contagem).
2. **Parte flutuante**: faixa `[baixo, alto]` por função pura (`buildRows`), em `--text-secondary` quando a métrica não declara polaridade; parte que reduz custo leva `--positive` com o sinal `−`.
3. **Rótulo de duas linhas** no próprio shape: valor e participação inteira, que soma 100% pelo maior resto (`wholeShares`, NUM-2); a v3 troca a participação pelo substantivo da contagem.
4. **Conector**: traço de 1 px em `--line-strong` do fim de uma coluna ao começo da seguinte; a banda vem de `usePlotArea`.
5. **Nome da coluna** desenhado pelo shape em até duas linhas (`wrapName`), porque o tique do Recharts não quebra o nome e os vizinhos se tocam.
6. **Marca de exceção**: gap em `--warning` com sinal e palavra (v2); lacuna hachurada com contorno `--text-muted` (v4); em andamento vazado (v3).
7. **Linha de leitura** (`aria-hidden`, 12 px), **dica** com o que o rótulo não traz (valor exato, acumulado, linhas sem retorno) e **frase acessível** calculada do dado.

## Versões

* `v1_custo-marginal-liquido-do-mes`: construção do zero com cinco partes ordenadas, desconto negativo por último e uma coluna de total.
* `v2_ponte-ate-a-meta-anual`: meta como coluna cheia, partes consumindo e gap em `--warning`, com `ReferenceLine` da meta e data de corte escrita.
* `v3_entradas-do-mes-ate-os-ganhos`: decomposição em contagem até 11 ganhos, em andamento como passo próprio e cauda estreita com rótulo externo e halo.
* `v4_custo-total-com-parte-sem-detalhamento`: total medido com a parte sem detalhamento hachurada, derivada por diferença e escrita em 19% do total.

## Como colar no Farol

1. Copiar `Chart.tsx` e `data.ts` da versão e trocar o `data` pelo retorno da métrica; os tipos vêm do `data.ts`.
2. Entregar o dado sem o total: o componente o soma (v1) ou o obtém por diferença (v2, v4). Na v3 o dado traz as duas colunas de total, e o componente confere o fechamento.
3. Embrulhar num `VisualCard` e trocar o estado vazio inline por `EmptyState`; título e procedência são do cartão.
4. Conferir no preview que nenhum nome de coluna passa de duas linhas na largura do cartão: `NAME_CHAR_WIDTH` assume 12 px de Manrope.

## Referências

* Método: a ponte (bridge) de Gene Zelazny, em "Say It With Charts", usada com um único estoque; participação inteira pelo maior resto.
* Recharts 3.10.1: `Bar` com `dataKey` devolvendo faixa e `shape` próprio, `usePlotArea`, `ReferenceLine` com `ifOverflow="extendDomain"`.
* Farol: `app/src/components/visuals/charts/ChartTooltip.tsx` e `app/src/lib/format.ts`.
* Pedido ao Farol: nenhum formatador escreve o sinal `+` nem quebra nome de eixo em duas linhas; cada versão faz à mão.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, as quatro versões julgadas pela primeira vez e aprovadas. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

* `v1`, `v2`, `v3` e `v4`: o conector é um traço de 1 px em `--line-strong`, medido no preview em 1,79:1 no escuro e 1,83:1 no claro. Foi lido como referência pela ACE-6: tapado o traço, o nível de cada parte continua na posição da barra e o valor continua escrito. Se o conector passar a dizer algo que a barra não diz, ele precisa de token de dado.
* `v1`, `v2`, `v3` e `v4`: o bloco de vazio traz só a frase, sem o ícone `Filter` de 16 px da EST-1. Não aparece no preview.
* `v1`, `v2`, `v3` e `v4`: os números da linha de leitura ficam em Manrope sem `tabular-nums` (TIP-1). Sem consequência visível.
* `v1`, `v2` e `v3`: o rótulo da parte que desce fica acima do topo da barra, onde a parte começa, e não na ponta livre (ROT-2). Não há sobreposição, e cada rótulo se lê com a barra dele.
* `v1`, `v2` e `v4`: o rótulo direto sai de `formatCurrencyAxis`, e a NUM-1 pede `formatCurrencyCompact`. Com o dado fixo, todo em milhar redondo, a única diferença seria o `,0`; com dado real a parte perde a casa decimal do milhar, e a soma lida nos rótulos pode não fechar com o total escrito.
* `v1`, `v2` e `v4`: o nome da coluna sai em `--text-muted` com peso 400, e a tabela 17.1 pede rótulo de categoria em `--text-secondary` com peso 500; o rótulo da coluna de total ou de meta sai em peso 600, e a 17.1 e a COR-2 citam 700. O nome mede 5,21:1 e 5,37:1 e se lê; o segundo canal do destaque existe (peso, `--text-primary`, nome e `100%`).
* `v1`, `v2` e `v4`: com total ou meta igual a zero, a participação, que é indefinida, sai escrita como `0%`. A `v3` já devolve vazio no mesmo ramo. Não aparece no preview.
* `v1` e `v2`: a linha de leitura cola o artigo fixo "o" antes de um nome que vem do dado ("e o desconto de fornecedor", "contando o pipeline ponderado"). Com nome feminino o texto sai errado em silêncio.
* `v1` e `v4`: a linha de leitura abre com o total (`R$ 152 mil`, `R$ 390 mil`), que já está escrito sobre a coluna de total; a conclusão vem só depois (ANO-5).
* `v2`: a `ReferenceLine` da meta usa `--line-strong` tracejado `4 4`, e a tabela 17.2 pede referência em `--text-muted` tracejado `3 3`. A linha aparece nos dois temas e tem nome e valor escritos.
* `v2`: o rótulo "meta R$ 6,4 mi" fica em `insideTopRight`, preso à altura da linha e não a uma faixa reservada (ANO-3, REC-4). Com o dado fixo sobram cerca de 80 px até o rótulo do gap. Pela geometria do corpo de 138 px, gap acima de cerca de 65% da meta leva o rótulo do gap para cima do rótulo da meta, e realizado entre cerca de 3% e 21% da meta põe o rótulo da parte seguinte em cima do tracejado, sem halo (ROT-7). É o retrato do começo do ano, e a ponte muda a cada dia.
* `v2`: o valor da meta sai escrito duas vezes no corpo, sobre a coluna e no rótulo da linha. O catálogo pede as duas marcas; o rótulo da linha pode ficar só com o nome se a coluna já traz o valor.
* `v2`: o rótulo "falta · 9%" usa ponto médio como separador, e a seção 9 lista ponto, vírgula, dois pontos e ponto e vírgula.
* `v2`: o catálogo escreve o gap como R$ 0,6 mi e a tela imprime `−R$ 600 mil`, pelo formatador. O `meta.json` já explica; falta alinhar a linha do catálogo, decisão do dono.
* `v3`: o período não está no dado nem no corpo, e a frase acessível diz "do mês" sem dizer qual (DAD-9). Hoje ele depende do título e do subtítulo do `VisualCard`.
* `v3`: cinza (descarte) e vermelho (perda) separam dois grupos que nenhuma palavra da tela nomeia. Cada coluna tem nome próprio, então nenhuma marca fica sem identificação, mas o agrupamento vive só na cor e no comentário do `data.ts`.
* `v3`: "com 214", na linha de leitura e na frase acessível, sai sem substantivo (NUM-6); o nome da saída vem logo antes.
* `v4`: o caso de uso pergunta também quanto tem linha detalhada (R$ 314 mil, 81% do total), e esse número só existe na dica da coluna de total; na tela ele sai por subtração (DIC-1). Cabe na linha de leitura.
