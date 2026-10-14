# Ranking com variação de posição

## O que é

Tabela ordenada por uma métrica que mostra, além da posição e do valor, quanto cada item andou desde o período anterior: ícone de seta com o número de posições, selo de entrada nova para quem não tinha posição anterior e linha à parte para quem saiu do topo. A posição anterior é calculada fora do componente, no seletor de dados; a célula só recebe posição, posição anterior, valor e valor anterior já prontos, e a regra de empate e a direção da métrica (menor ou maior é melhor) ficam declaradas no dado e na legenda.

## Quando usar

- Top 10 a 25 de uma métrica em que a mudança de posição contra o período anterior é a notícia, não só o valor absoluto.
- Entradas e saídas do topo que precisam aparecer sem abrir outra tela, com o último valor conhecido de quem saiu.
- Ranking em que valor, variação absoluta e variação percentual da mesma linha cabem lado a lado.
- Métrica em que menor é melhor (ciclo de venda em dias, CPL), desde que a ordem invertida esteja escrita na legenda.

## Quando evitar

- Poucos itens com valores quase iguais: a posição oscila por ruído de uma linha para outra; mostre o valor com barra (modelo 01 desta família) em vez da posição.
- Trajetória de posições em muitos períodos: um bump chart ou slope lê melhor (família 17, comparação de pontos).
- Top N de uma métrica em espaço estreito e sem variação contra período anterior: uma lista de barras simples é suficiente (família 02, modelo 09).
- Item sem período anterior tratado como "subiu 999": ele é novo, e o componente precisa dizer isso, nunca inventar uma posição de origem.

## Anatomia

1. Coluna de posição: ordinal com "º" (`1º`, `2º`); posição empatada leva o sufixo `=` (`4º=`), da competição padrão 1, 2, 2, 4.
2. Coluna de variação de posição: ícone `ArrowUp`, `ArrowDown` ou `Minus` do lucide, sempre acompanhado do número de posições e das duas posições por extenso; a seta nunca aparece sozinha.
3. Entrada nova: selo de texto ("novo no top 10") no lugar da seta, nunca um número de salto inventado.
4. Saída do topo: linha à parte, fora da contagem de posições, com a última posição e o último valor conhecidos escritos.
5. Nome do item, em `text-text-primary`, com o destaque em peso 700 quando a versão tiver um item selecionado.
6. Valor atual por `formatCurrencyCompact`, `formatInt` ou `formatDays` conforme a unidade, com algarismo tabular; barra inline opcional usa domínio comum a todas as linhas.
7. Variação do valor: sinal tipográfico, cor pela polaridade da métrica (nunca pelo sinal do número) e a base do período anterior nomeada na mesma linha.
8. Cabeçalho de coluna nomeia o período de comparação ("desde 2026-T2", "vs 2026-08"), porque a variação de posição só faz sentido dizendo contra quando.
9. Trajetória opcional em SVG (micrográfico de posições, eixo invertido, domínio comum às linhas), decorativa e `aria-hidden`, porque a coluna de variação já diz a mesma coisa em texto.

## Versões

- `v1_receita-do-trimestre`: ranking de receita reconhecida por executivo, 2026-T3 contra 2026-T2, todos os oito já presentes no trimestre anterior. Demonstra a coluna de variação de posição com ícone, número de posições e as duas posições escritos, e o caso em que posição e valor mudam em direções diferentes (rank estável com valor em queda, rank em alta com valor estável).
- `v2_top-10-origens-com-entrada-e-saida`: top 10 de origens por leads qualificados, 2026-09 contra 2026-08. Demonstra o selo de entrada nova, a linha de saída fora da contagem de posições com o último valor conhecido, e a comparação sem base quando não há valor anterior medido.
- `v3_executivos-com-tres-variacoes`: ranking denso de 6 executivos com posição, receita, variação em reais, variação percentual e trajetória de 6 meses. Demonstra as três variações em colunas separadas, a barra inline com domínio comum e o micrográfico de posições com eixo invertido.
- `v4_empate-e-menor-e-melhor`: ranking de ciclo médio de venda, em que menor é melhor, com duas posições empatadas em "4=". Demonstra a competição padrão de empate, a legenda visível dizendo a ordem invertida e a cor da variação seguindo a polaridade da métrica, não o sinal do número.

Previews de cada versão: [`v1`](./v1_receita-do-trimestre/preview.svg), [`v2`](./v2_top-10-origens-com-entrada-e-saida/preview.svg), [`v3`](./v3_executivos-com-tres-variacoes/preview.svg), [`v4`](./v4_empate-e-menor-e-melhor/preview.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para a pasta do visual na página.
2. O cálculo de posição anterior, da regra de empate e de quem entrou ou saiu do recorte pertence ao seletor de dados da página, não ao componente: ele só recebe as linhas já prontas com `pos`, `posAnterior`, `value` e `valueAnterior`.
3. Para a métrica em que menor é melhor, mantenha a constante `goodDirection` no `data.ts` e use-a para decidir a cor da variação, nunca o sinal do número isolado.
4. Ao ligar dado real, mantenha o teto do `FORCED_TICK_LIMIT` implícito da tabela: acima de 25 linhas, pagine ou corte para o top N declarado no título, porque o modelo foi pensado para esse tamanho.
5. Embrulhe no `VisualCard` do Farol se a tabela for um cartão entre outros; para tela dedicada de ranking, a tabela pode ir direto no corpo da página, sem moldura.

## Referências

- [Storytelling with Data, o que é uma tabela](https://www.storytellingwithdata.com/blog/2020/9/24/what-is-a-table): ordenação estratégica de linhas e colunas como o próprio operador de leitura do ranking.
- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): categoria Ranking como alternativa fora da tabela quando a trajetória de posições, e não a variação pontual, é a pergunta.
- [Tremor, BarList](https://www.tremor.so/docs/visualizations/barlist): `sortOrder` e rótulo dentro da barra como referência da barra inline de valor usada na v3.
- [Behance, Data Table Web Desktop](https://www.behance.net/gallery/246319147/Data-Table-Web-Desktop): densidade de linha e hierarquia de colunas; a página abriu só com metadados em texto, referência de acabamento para a v3.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19; segunda passada no mesmo dia, depois da correção da posição anterior da v1._

- `v1_receita-do-trimestre`: o `meta.json` promete "posição estável com valor em queda", e nenhuma linha faz isso: as duas que mantêm a posição (Renan A. e Priscila T.) sobem de valor. A outra metade da frase, posição em alta com valor estável, aparece em Heitor Wanderley M.
- `v1_receita-do-trimestre`: no texto "contra R$ 401,3 mil" o número fica em `text-text-muted` sem `tabular-nums`, então é o único número da tabela fora do algarismo tabular da TIP-1. O mesmo vale para o "contra" da v2 e da v4.
- `v3_executivos-com-tres-variacoes`: o micrográfico das linhas sem destaque é desenhado em `--line-strong`, que mede 1,79:1 e 1,83:1 contra o cartão, e ali não há valor escrito na marca; a leitura se sustenta porque a coluna de variação repete a informação em texto e o SVG é `aria-hidden`.
- `v3_executivos-com-tres-variacoes`: `TRACK_MAX_POS` é fixo em 6, igual ao número de linhas do dado; com outra quantidade de executivos a trajetória sai fora de escala. Vale derivar o domínio do próprio `data`.
- `v3_executivos-com-tres-variacoes`: o `meta.json` diz que as três variações ficam "alinhadas à direita", mas a coluna de Δ posição é alinhada à esquerda por causa do ícone.
- `v1_receita-do-trimestre`: a coluna "Variação vs 2026-T2" é estreita e a unidade "mil" cai sozinha na segunda linha em quase todas as linhas; a leitura se mantém, mas a primeira linha fica com o número sem unidade.
- `v1_receita-do-trimestre`: o período "2026-T3" é escrito à mão no `data.ts`, sem formatador de trimestre em `@/lib/format`; vale registrar o pedido na seção Referências se o Farol passar a ter um.
- `v2_top-10-origens-com-entrada-e-saida`: na linha de entrada nova, a coluna de variação de valor diz "sem posição anterior medida para comparar"; o que falta ali é o valor do mês anterior, e a EST-4 sugere a forma "sem mês anterior medido para comparar".
- `v2_top-10-origens-com-entrada-e-saida`: o canvas de 760 px de altura deixa cerca de 30% de faixa vazia abaixo da última linha de saída; cabe encolher a altura declarada nas `notes`.
- `v3_executivos-com-tres-variacoes`: nos quatro meses mais antigos da trajetória há posição repetida entre executivos e número de posição sem dono (dois em 3º e ninguém em 1º, por exemplo); o micrográfico é decorativo e `aria-hidden`, então nada disso se lê na tela, mas o dado fixo fica implausível para quem copiar o arquivo.
- `v3_executivos-com-tres-variacoes`: o eixo invertido da trajetória (1º no topo) não é sinalizado no cabeçalho da coluna; uma palavra em "Trajetória, 6 meses" diria para que lado é melhor.
- `v3_executivos-com-tres-variacoes`: a coluna "Δ R$" nomeia a base em valor ("contra R$ 452,3 mil") sem repetir o mês na mesma linha; o mês aparece só nos cabeçalhos vizinhos.
- `v3_executivos-com-tres-variacoes`: a barra inline fica na borda esquerda da célula e o número na borda direita, com um vão largo entre os dois; aproximar os dois encurtaria o caminho do olho.
- `v4_empate-e-menor-e-melhor`: na última linha, "contra 34 dias" quebra e deixa "dias" sozinho na segunda linha; é a mesma estreiteza de coluna da v1.
- `v4_empate-e-menor-e-melhor`: o canvas `alto` sobra cerca de um quarto da altura abaixo da última linha, com seis linhas apenas.
