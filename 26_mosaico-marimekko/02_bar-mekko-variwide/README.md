# Bar mekko (variwide)

## O que é

Colunas encostadas de largura variável com altura em valor absoluto de uma métrica, sem normalizar para 100%. A largura carrega a métrica A, a altura carrega a métrica B, e a área de cada coluna é o produto das duas. O modelo só vale quando esse produto é uma grandeza real: leads vezes CPL é investimento, vitórias vezes ticket médio é receita. Algumas bibliotecas chamam a forma de variwide. O Recharts não tem barra de largura variável, então o desenho é SVG puro em React: o x é acumulado pela métrica A, a altura sai de uma escala linear que começa em zero, e os tiques de passo bonito (1, 2, 2,5 ou 5 vezes potência de 10) são calculados em TypeScript por uma função pura.

## Quando usar

* Taxa por grupo com o peso do grupo à vista, de 3 a 10 colunas, quando largura vezes altura é uma grandeza de negócio.
* CPL por plataforma com a largura nos leads, em que a área de cada coluna é o investimento do período (`v1`).
* Quanto do investimento foi pago acima de um CPL alvo, lido como a área de cada coluna acima de uma linha de referência (`v2`).
* Ticket médio por origem com a largura nas vitórias, em que a área de cada coluna é a receita (`v3`).
* Grupo com custo e sem volume, em que a taxa é indefinida e precisa aparecer sem divisão por zero (`v4`).

## Quando evitar

* Largura vezes altura sem significado de negócio: dispersão simples (`09/01`) ou bolhas (`09/03`).
* Composição de cada grupo em partes: marimekko 100% (modelo `01` desta família).
* Grupos de peso parecido, em que a largura não informa: colunas simples (`03/01`).
* Métrica de altura que pode ser negativa: colunas positivo e negativo (`03/05`).
* Mais de 10 grupos, com colunas abaixo de 4 px de largura: tabela com barras inline (`14/01`).

## Anatomia

1. **Função de layout** `barMekko()` no topo do arquivo: recebe as linhas já ordenadas, a largura e a altura da plotagem e o topo da escala, e devolve x, w, y e h de cada coluna. Os vãos de 2 px saem antes da partilha de largura (GEO-16), então a área é exatamente proporcional ao produto.
2. **Escala de altura** linear a partir do zero, com `niceTicks()`: de 2 a 4 ou 5 intervalos de passo 1, 2, 2,5 ou 5 vezes potência de 10, terminando na primeira linha acima do maior valor. Tique em `formatCurrencyAxis`, grade só na horizontal em `--line-subtle`.
3. **Colunas** por altura decrescente, ordenadas no componente: a mais importante em `--chart-1` e as demais em `--line-strong` (COR-1). A `v2` divide cada coluna na linha do alvo, com a parte acima em `--chart-1`.
4. **Rótulo da coluna** com o valor escrito por `formatCurrencyCompact`, dentro da coluna quando ela tem 18 px de altura ou mais e acima dela quando não, com halo da cor do cartão (ROT-7). Coluna fina demais para o texto vira rótulo puxado para cima com linha guia e o nome junto (`v3`).
5. **Eixo X acumulado**: nome em até duas linhas por palavra inteira, a contagem da largura (`formatInt`) abaixo da coluna, um tique por fronteira de coluna e o total escrito no fim do rodapé.
6. **Linha de referência** (alvo na `v2`, ticket médio na `v3`) em `--text-muted`, só por fora das colunas que ela atravessaria (TOK-10), com o rótulo à direita, em margem reservada.
7. **Ausência e exceção** (`v4`): custo zero medido em faixa sólida com o R$ 0 escrito, custo não coletado em vaga tracejada e oca com `formatUnavailable()`, e zero lead com investimento em marcador numa zona à direita, com divisor e base tracejada porque está fora da escala de altura.
8. **Linha de leitura** calculada do dado, em HTML acima do SVG; frase acessível de 100 a 250 caracteres na raiz, com o SVG em `aria-hidden`; a dica é o `title` de cada coluna, com leads, valor e participação.

## Versões

* [`v1_cpl-por-plataforma`](./v1_cpl-por-plataforma/) ([preview](./v1_cpl-por-plataforma/preview.svg)): CPL e investimento de 2026-08 por plataforma de mídia paga. Demonstra a largura em leads e a altura em CPL a partir de zero, os tiques de passo bonito, o rótulo com CPL e investimento por `formatCurrencyCompact` e o total do mês no fim do eixo X.
* [`v2_investimento-acima-do-cpl-alvo`](./v2_investimento-acima-do-cpl-alvo/) ([preview](./v2_investimento-acima-do-cpl-alvo/preview.svg)): o mesmo mês contra um CPL alvo de R$ 180. Demonstra a linha do alvo com rótulo à direita, a parte acima do alvo em `--chart-1`, o excedente anotado na coluna de maior área acima e a soma dele na linha de leitura.
* [`v3_ticket-medio-e-receita-por-origem`](./v3_ticket-medio-e-receita-por-origem/) ([preview](./v3_ticket-medio-e-receita-por-origem/preview.svg)): ticket médio e receita por origem de 2026 até agosto, em canvas largo. Demonstra a coluna alta e estreita com anotação, os rótulos das colunas finas puxados para cima com linha guia sem sobreposição e a linha do ticket médio em tracejado 3 3.
* [`v4_investimento-sem-lead`](./v4_investimento-sem-lead/) ([preview](./v4_investimento-sem-lead/preview.svg)): plataforma que gastou R$ 8 mil e não gerou lead. Demonstra o CPL indefinido como marcador fora da escala, o custo não coletado separado do zero medido e o domínio do eixo Y só com os CPL definidos.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para a pasta do visual na página e troque o `import` do `./data` pelo seletor real, passando `data` pela prop (e `target` na `v2`).
2. Entregue as linhas em qualquer ordem: o componente ordena por altura decrescente. Na `v4`, entregue `spend` como `null` para custo não coletado e `leads` como zero para plataforma sem lead; nunca troque um pelo outro.
3. Reserve a altura do cartão pela conta do `notes` de cada `meta.json`: o SVG tem `viewBox` do tamanho do corpo e, num pai mais baixo, encolhe por inteiro, texto incluído (GEO-18). Num cartão mais largo ele cresce na mesma proporção.
4. Confira que a área é mesmo uma grandeza de negócio na página (investimento, receita) antes de colar: sem isso o modelo é dispersão e o produto engana.
5. A etiqueta de procedência do total (por exemplo, MEDIDO na receita da `v3`) é do `VisualCard`, não do Chart (ANO-6).
6. No celular a forma pede coluna mais estreita que o nome; abaixo de 480 px de largura prefira a tabela com barras inline.
7. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

* [Data Visualisation Catalogue, marimekko chart](https://datavizcatalogue.com/methods/marimekko_chart.html): largura e altura como duas métricas e o limite de poucos segmentos.
* [Highcharts, variwide](https://www.highcharts.com/docs/chart-and-series-types/variwide): nome da forma e a regra de que a área só informa quando o produto tem sentido.
* [Wikipedia, mosaic plot](https://en.wikipedia.org/wiki/Mosaic_plot): origem da área proporcional por retângulos encostados.
* Arquivos do Farol usados como referência: `app/src/lib/format.ts` (formatadores) e `app/src/styles/tokens.css` (tokens de cor).

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada, as quatro versões (`sem_revisao`): `v1`, `v2`, `v3` e `v4` aprovadas, sem bloqueante, e por isso sem parecer em `validation/`. `check`: 0 com erro e 4 avisos de `CONTRASTE-MARCA`, todos do `--line-strong` como neutro de dado (1,79:1 e 1,83:1 contra o cartão) com o valor escrito na coluna ou junto dela. Medido no `preview.svg`: área de cada coluna contra o investimento (`v1`, `v2`, `v4`), contra o excedente (`v2`) e contra a receita (`v3`), e largura contra leads e vitórias, com desvio de 0,0000 p.p. nas quatro; `viewBox` igual à caixa (escala 1); corpo em 12 e 11 px, pesos até 600, nenhum 700. Contraste calculado dos dois previews: texto de 5,21:1 para cima, destaque contra neutro em 5,32:1 no escuro e 3,27:1 no claro, marcador da `v4` em 5,50:1 e 6,36:1. O estado vazio das quatro não foi renderizado; o que se diz dele é leitura do código.

* `v1`, fidelidade (pergunta 21): preview contra página em 0,51% no escuro e 0,56% no claro, acima do 0,5% e abaixo dos 2% que reprovam no render. Perto de 60% da diferença está no subtítulo da moldura, depois de `CPL`; dentro do Chart ficam 0,21% e 0,23%, na linha de leitura e no total do rodapé. É kerning da ferramenta, não do desenho. As outras três medem de 0,09% a 0,37%.
* `v1`, eixo X acumulado: os tiques marcam as fronteiras do acumulado, mas o valor acumulado não é escrito; cada coluna traz a própria contagem e o total fica no rodapé. O campo `cumulative` de `barMekko()` é calculado e não é usado, na `v1` e na `v2`.
* `v1`, último tique: cai em x = 575, fora do `viewBox` de 574, e não se desenha; nas outras três ele aparece.
* `v1`, rótulo interno: a escolha entre dentro e acima olha só a altura (36 px). Coluna alta e estreita transborda; a `v3` tem o ramo que trata (`isPulled`).
* `v1`, dois valores em R$ por coluna: CPL e investimento se separam só pelo tamanho e pela chave do rodapé (altura CPL, área investimento).
* `v1`, `notes`: fala em cerca de 117 px de plotagem; a conta do arquivo e o preview dão 121.
* `v2`, excedente por plataforma: o caso de uso pergunta quanto em cada plataforma, e só Vídeo curto tem o número escrito (R$ 30,4 mil). Busca patrocinada (R$ 10,5 mil) e Mídia social (R$ 2,3 mil) se leem pela área e pela dica. É o que o catálogo pede, anotação só na coluna de maior área; há altura livre para uma segunda linha acima do CPL dessas duas.
* `v2`, linha do alvo: sólida de 1,5 px. A 17.2 dá referência em tracejado 3 3 de 1 px; a `v3` traceja, também em 1,5 px.
* `v2`, `R$ 175` acima da linha: o rótulo de Rede de display sobe para cima da linha do alvo, com a coluna 2 px abaixo dela. Os dois números desfazem a dúvida.
* `v2`, anotação: some sem aviso quando a parte acima do alvo tem menos de 30 px de altura ou a coluna não comporta `acima do alvo`.
* `v2`, halo: o do `R$ 260` abre um vão de 5 px na linha de grade de R$ 300, nos dois temas, onde o cifrão sobe além da altura das letras. A grade é estrutura, não marca.
* `v2`, `notes`: anuncia três desvios e lista quatro.
* `v3`, TIP-1: `ticket alto, R$ 21,6 mil` sai em Manrope sem algarismo tabular (`font-sans` na linha inteira). É o número que responde à primeira metade do caso de uso.
* `v3`, rótulo acima da linha: `R$ 281,7 mil` e `R$ 203,6 mil` ficam acima da linha do ticket médio, a 14 e 16 px do topo das próprias colunas, com o tracejado no meio. `aboveY` sobe sempre para cima da linha, a qualquer distância.
* `v3`, rótulo da linha: diz `ticket médio`, o mesmo termo da altura de cada coluna; o catálogo fala em ticket médio geral.
* `v3`, grade sob o rótulo: `Evento`, `Prospecção ativa` e `R$ 151,2 mil em 7 vitórias` caem em cima das linhas de 10, 15 e 25 mil. O halo resolve nos dois temas.
* `v3`, período: `de jan/26 a ago/26` só existe na frase acessível e no subtítulo da moldura; o rodapé diz `Total` (DAD-9). Nas outras três, `Total do mês` sem o nome do mês.
* `v3`, rótulos puxados: `placeCallouts` sobe cada rótulo uma vez por vizinho e não confere de novo os anteriores; com três, que é o dado padrão, não encosta.
* `v3`, constantes: `HALO` e `INSIDE_MIN_HEIGHT` declaradas no meio do arquivo, depois das funções.
* `v4`, destaque: `--chart-1` vai para Vídeo curto, a coluna de maior CPL, que a linha de leitura não cita; o assunto do cartão é Vídeo longo, no marcador, e os dois nomes se parecem. O rótulo do destaque tem o mesmo peso dos demais e não leva anotação (COR-2); o que sobra de segundo canal é a posição, a primeira e a mais alta. Colunas todas em neutro deixariam o marcador sozinho como a marca que carrega a mensagem (17.2).
* `v4`, EST-2: a vaga escreve `formatUnavailable()` em minúsculas e sem o ícone `Unplug`.
* `v4`, faixa do zero: preenchida com `--text-secondary`, token de texto fora da tabela 17.2; mede 8,16:1 e 8,13:1 contra o cartão.
* `v4`, divisor da zona: linha vertical em `--line-subtle`. A ESP-5 proíbe divisória; aqui ela marca a quebra de escala. A base tracejada da zona, em `--line-strong`, fica fraca nos dois temas.
* `v4`, investimento por coluna: o rodapé diz área investimento, e o único investimento escrito é o de Vídeo longo; os das colunas só estão na dica.
* `v4`, `R$ 180` em cima da grade: o rótulo de Busca patrocinada cai exatamente sobre a linha de R$ 200 (y 55,80 contra 55,67). Legível pelo halo.
* `v4`, zona: o nome não quebra e a zona tem 100 px; cada plataforma sem lead a mais sobe 44 px, e a terceira passa do topo.
* `v4`, vazio: com zero plataforma com lead, o estado vazio esconde também o investimento de quem não gerou lead.
* `v4`, `notes`: fala em cinco colunas e em 44 px para a menor no canvas `card`; são seis vagas e a conta dá 54 px. A conclusão vale, porque Afiliados pede 61.
* `v1`, `v2` e `v3`, linha sem lead ou sem vitória: o filtro do `ratio` descarta a linha em silêncio, e o total do rodapé e a participação da linha de leitura deixam de contar o valor dela. Com dado real o desenho certo é o da `v4`; o passo 2 de Como colar não avisa.
* `v1`, `v2` e `v4`, EIX-6: `Y_AXIS_W` de 44 px, abaixo dos 48. `R$ 300` começa a 1,5 px da borda esquerda do SVG, sem corte.
* `v1` a `v4`, TIP-4: o tique do eixo Y não declara peso e pede Space Grotesk 400, que não é carregado; o navegador desenha com o 500.
* `v1` a `v4`, constantes soltas no JSX: os deslocamentos de rótulo (12, 26, 24, 9, 7, 11, 40) e o recuo de 6 px do tique não têm nome no topo, e 9, 7 e 11 não são múltiplos de 2 (ESP-1).
* Anatomia deste README, item 4: os 18 px valem para a `v3`. A `v1` usa 36 px, para duas linhas, e a `v2` e a `v4` escrevem o CPL sempre acima da coluna.
* Catálogo: o verbete pede a linha do alvo em `--line-strong` e a soma no subtítulo (`v2`) e a etiqueta `--prov-medido` no Chart (`v3`). As versões desviaram pelo contrato (ACE-6, ANO-5 e ANO-6) e declararam no `notes`. O catálogo precisa de emenda.
