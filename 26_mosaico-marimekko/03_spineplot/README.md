# Spineplot, spinograma e double decker

## O que é

Caso especial do mosaico em que uma variável explicativa divide a largura e um desfecho binário divide a altura: a largura de cada coluna é a participação do grupo no total e a altura da parte de baixo é a taxa do desfecho dentro dele. O olho lê duas coisas de uma vez, se a taxa muda ao longo de x e quanto pesa cada x. A parte de interesse fica na base, a única com linha de base comum entre colunas, e a taxa global atravessa o gráfico quando a comparação com ela é a pergunta. O modelo absorve o spinograma, com x contínuo cortado em faixas de limites declarados, e o double decker, com duas variáveis aninhadas na largura. O Recharts não tem barra de largura variável, então a geometria sai de uma função pura em TypeScript e o desenho é SVG puro em React.

## Quando usar

* Taxa de um desfecho binário, como ganho ou qualificação, ao longo de 3 a 8 categorias de x com pesos diferentes, como a faixa de porte da conta (`v1`).
* x contínuo que o negócio já corta em faixas, como as horas até o primeiro contato, com os limites escritos no eixo e o prazo da regra marcado (`v2`, spinograma).
* Desfecho ao longo de duas variáveis combinadas, até 12 colunas finais, com as colunas abaixo de 4 px agregadas (`v3`, double decker).
* Leitura honesta de cobertura e de amostra: coluna de categoria desconhecida, faixa de poucos casos e faixa sem ganho (`v4`).

## Quando evitar

* Categorias de x com peso parecido, em que a largura não informa: colunas empilhadas 100% (`03_colunas-verticais/04_colunas-empilhadas-100`).
* Desfecho com mais de 3 estados: marimekko 100% (modelo `01` desta família).
* Distribuição de x sem desfecho: histograma (`16_distribuicoes/01`).
* Passagem dos casos entre etapas ou estados: parallel sets (`11_fluxo-sankey/04_parallel-sets`).
* Mais de três variáveis explicativas ou colunas finais abaixo de 4 px: tabela cruzada com totais marginais (`14_tabelas-visuais/06`).

## Anatomia

1. **Função de layout** pura no topo do arquivo: `spine()` na `v1`, `v2` e `v4`, `layoutColumns()` na `v3`. Recebe os totais por coluna e uma caixa e devolve `x`, `w` e a altura de cada parte. Os vãos saem antes da partilha de largura e de altura, então a área fica proporcional à célula (GEO-16).
2. **Colunas encostadas** com vão de 1 px, 4 px entre plataformas na `v3` e 6 px antes da coluna desconhecida na `v4`; o vão entre as duas partes é de 2 px.
3. **Parte de interesse na base** em `--chart-1`, o complemento acima em `--line-strong` (ou `--surface-sunken` na `v3`, onde a cor é carregada pela comparação com a taxa global).
4. **Taxa sobre cada coluna** por `formatRateWithVolume`, partida no ` (` em duas linhas para caber na largura; a que não cabe vai para um rótulo escalonado com fio conector, e o selo de amostra pequena fica nele.
5. **Eixo de coluna**: nome em até duas linhas por palavra inteira, participação em `formatPercent`, e os limites numéricos por `formatHours` no spinograma.
6. **Linha da taxa global** em tracejado 3 3 de `--text-muted`, com fio de `--surface-raised` por baixo, rótulo na margem direita e a distância em p.p. na `v2` (`formatDecimal` com o sinal tipográfico escrito).
7. **Ausência e exceção**: sem veiculação como linha fina de 2 px com o rótulo sem anúncio (`v3`), porte desconhecido como coluna hachurada fora da taxa global (`v4`), zero medido como fio de ciano na base com a taxa escrita (`v4`).
8. **Linha de leitura** calculada do dado, legenda em HTML e frase acessível de 100 a 250 caracteres na raiz, com o SVG em `aria-hidden`; a dica (`title`) acrescenta a contagem.

## Versões

* [`v1_ganho-por-faixa-de-porte`](./v1_ganho-por-faixa-de-porte/) ([preview](./v1_ganho-por-faixa-de-porte/preview.svg)): oportunidades encerradas de 2026 por faixa de porte. Demonstra as colunas de 1 px com largura pelas oportunidades, o ganho na base, a ordem natural do porte, a taxa com volume sobre cada coluna e o desfecho nomeado à direita.
* [`v2_qualificacao-por-tempo-ate-contato`](./v2_qualificacao-por-tempo-ate-contato/) ([preview](./v2_qualificacao-por-tempo-ate-contato/preview.svg)): leads de 2026-08 por tempo até o primeiro contato. Demonstra o spinograma com limites no eixo, a faixa do SLA com fundo de poço, a linha da taxa global e a queda em p.p. na última faixa.
* [`v3_qualificado-por-plataforma-e-formato`](./v3_qualificado-por-plataforma-e-formato/) ([preview](./v3_qualificado-por-plataforma-e-formato/preview.svg)): leads de 2026-T3 por plataforma e formato. Demonstra o double decker com layout recursivo, o eixo em duas linhas, a cor pela comparação com a taxa global, a combinação sem veiculação e a agregação em outros formatos.
* [`v4_porte-desconhecido-e-amostra-pequena`](./v4_porte-desconhecido-e-amostra-pequena/) ([preview](./v4_porte-desconhecido-e-amostra-pequena/preview.svg)): oportunidades de 2026 com 30% sem porte. Demonstra a coluna desconhecida hachurada, a cobertura no subtítulo, o selo de amostra pequena, a faixa sem ganho com 0,0% escrito e a taxa global só com porte informado.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para a pasta do visual na página e troque o `import` do `./data` pelo seletor real, passando `data` (e `slaHours` na `v2`) pela prop.
2. Entregue as faixas já na ordem do eixo: o componente não reordena. Na `v4` a coluna de porte desconhecido leva `unknown: true` e vai para o fim sozinha.
3. Reserve a altura do cartão pela conta do `notes` de cada `meta.json`: o SVG tem `viewBox` do tamanho do corpo, e num pai mais baixo ele encolhe por inteiro, texto incluído (GEO-18).
4. Na `v2`, `slaHours` vem da regra de SLA do painel; as faixas que terminam nele ficam dentro do SLA, e a regra e as faixas precisam ser a mesma fonte.
5. Na `v3`, `MIN_COL_W` (4 px) decide a agregação em outros formatos e `MIN_BEST_LEADS` decide quem pode ser a melhor combinação; combinação sem veiculação chega com `aired: false`, nunca com zero.
6. Na `v4`, `SMALL_SAMPLE` (10 casos) liga o selo de amostra pequena. A taxa global só soma as faixas conhecidas, e a legenda diz isso.
7. No celular a forma pede layout horizontal; estas versões não fazem a troca, então abaixo de 480 px de largura prefira a tabela cruzada.
8. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

* [Data Visualisation Catalogue, mosaic plot](https://datavizcatalogue.com/methods/mosaic_plot.html): largura pela frequência de x e altura pela proporção do desfecho.
* [Wikipedia, mosaic plot](https://en.wikipedia.org/wiki/Mosaic_plot): spineplot e double decker como casos do mosaico (Hartigan e Kleiner, 1981; Friendly, 1994).
* Estudo da família: `_estudo/familias/26_mosaico-marimekko.md`.
* Farol: `app/src/styles/tokens.css` (tokens de cor) e `app/src/lib/format.ts` (formatadores); não há wrapper de spineplot em `app/src/components/visuals/charts/`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada, as quatro versões (`sem_revisao`): `v1`, `v2`, `v3` e `v4` reprovadas, com o parecer em `validation/revisao_26_mosaico-marimekko__03_spineplot_2026-10-13.md`. O que reprova está lá; aqui fica só o que não reprova. `check`: 0 com erro e 3 avisos de `CONTRASTE-MARCA`, todos do `--line-strong` como preenchimento e como amostra. Medido no `preview.svg`: área de ladrilho proporcional à contagem nas quatro, `viewBox` em escala 1, preview contra página de 0,01% a 0,18% de pixels diferentes nos oito pares.

* `v1`, participação sem base: o `14%` sob o nome da faixa não diz de quê; só a linha de leitura fala em largura e em 502 oportunidades. Em Micro, `14%` divide a coluna com `(14 de 72)`. As irmãs do modelo `01` escrevem `do total` na primeira coluna. Vale também para a `v2` e a `v4`.
* `v1`, par ganho e perdido: `lostText` arredonda por conta própria (`Chart.tsx:144`) e fecha 100,0 nas cinco colunas por coincidência do dado; o mesmo cálculo imprime 100,1 na `v4`. Vale também para a `v2`.
* `v1`, TIP-1: o `502` da linha de leitura sai em Manrope sem algarismo tabular.
* `v1`, taxa do total: `35,5% no total` só existe na frase acessível; o corpo não escreve a taxa global.
* `v1`, ramos fora do dado padrão: faixa sem oportunidade é descartada em silêncio (linha 124); nome que não cabe em duas linhas é impresso inteiro, sem guarda de largura (linha 205); a lista `Sem rótulo no desenho` não foi renderizada.
* `v2`, três anotações: faixa do SLA com rótulo, linha da taxa global e queda em p.p. A ANO-1 fala em duas e o catálogo pede as três; nenhuma encosta na outra.
* `v2`, fio sob a linha global: os 4 px de `--surface-raised` cobrem 2 px para cada lado. `1 a 4 h` (36,4%) mostra 0,7 px de ciano acima dele e `4 a 24 h` (31,8%) encosta por baixo, então as duas colunas parecem terminar na linha. Os números do topo desfazem a dúvida. Na `v3` a coluna mais próxima fica a 3,8 px da linha e nada se perde. Na `v4`, Pequena (28,0%), Muito grande (25,0%) e porte desconhecido (26,3%) ficam a até 2,2 px da linha de 26,6%: o fio cobre o topo do ganho de Pequena e de porte desconhecido, e Muito grande encosta nele por baixo, então as três parecem terminar na linha.
* `v2`, NUM-4: a base da queda (`da taxa global`) vai na linha de baixo do `−13,9 p.p.`, não na mesma linha.
* `v2`, TIP-1: os limites do eixo (`1 a 4 h`, `4 a 24 h`) saem em Manrope sem algarismo tabular.
* `v2`, `data.ts`: o comentário diz `from` incluso e `to` incluso; um lead contatado em exatamente 1 h caberia em duas faixas.
* `v2`, legenda: segue a pilha da base para o topo, e a ROT-4 fala em pilha lida de cima para baixo. Vale para a `v3` e a `v4`.
* `v3`, parte não qualificada sem número: nenhum dos oito ladrilhos de cima traz o percentual, que sai por subtração de `38,9% (70 de 180)`. As irmãs escrevem o complemento no ladrilho; sobre `--surface-sunken`, `--text-secondary` mede 9,36:1 e 7,04:1.
* `v3`, ramo fora do dado padrão: `hasWidth` (`Chart.tsx:90`) junta `aired: false` com a combinação veiculada que não gerou lead, e o rótulo escalonado escreve `sem anúncio` para as duas (linha 293). O próprio `data.ts` diz que não são a mesma coisa.
* `v3`, `notes` e canvas: o `notes` conta o caso de uso em duas linhas e 265 px de corpo. No preset largo ele cabe em uma, o corpo mede 281,5 px e o SVG de 217 px fica centrado numa caixa de 233,5 px, com 8,25 px de sobra em cima e embaixo. Sem consequência no texto, que segue em escala 1.
* `v3`, linha de sem anúncio: no dado padrão Carrossel é o último formato de Busca paga, e a linha de 2 px com o fio conector cai na fronteira entre plataformas, onde lê como divisória. O mesmo acontece com o fio de Outros formatos.
* `v3`, `Outros formatos`: o rótulo dá a taxa e o volume, mas não diz que agregou 3 formatos (COR-4).
* `v3`, COR-2: as colunas acima da taxa global não mudam o peso do rótulo; o segundo canal da cor é a posição contra a linha tracejada.
* `v4`, zero medido: Grande leva um fio de 2 px em `--chart-1` na base. O catálogo diz que a faixa sem ganho desenha só a parte perdida, e a DAD-2 pede neutro fora da rampa para o zero. O `0,0% (0 de 11)` está escrito.
* `v4`, coluna de porte desconhecido: as duas partes levam a mesma hachura, e a divisão (26,3%) cai a 0,4 px da linha global (26,6%), dentro do fio de 4 px. No dado padrão não se vê que a coluna é dividida.
* `v4`, Muito grande: a coluna mede 3,84 px, abaixo dos 4 px que este README e a `v3` usam como piso de coluna. Vê-se nos dois temas.
* `v4`, total: os 521 só existem na frase acessível; o corpo não escreve o total.
* `v4`, selo: `amostra pequena` fica do outro lado do fio conector, sob a coluna de porte desconhecido.
* `v4`, rótulo da linha: diz só `global`; a palavra taxa está na legenda.

Revisão de 2026-10-13, segunda passada, as quatro versões (`revisao_desatualizada`), julgadas pelo `Chart.tsx` das 15:04 e 15:05 e pelos PNGs das 15:05: `v1`, `v2`, `v3` e `v4` aprovadas. Conferido no arquivo de hoje o que reprovava na primeira passada: participações pelo maior resto somando 100 na `v1` (14, 30, 25, 18 e 13), na `v2` (26, 33, 27 e 14) e na `v4` (18, 29, 20, 2, 1 e 30, com o subtítulo de 70% igual à soma das conhecidas); Micro da `v4` fechando 18,8% e 81,2%; participação escrita nos dois rótulos escalonados da `v4`; valor ao lado das três amostras da `v3` (190, 125 e 669, que somam os 984); contorno em `--text-muted` (5,21:1 e 5,37:1) na amostra de Perdido da `v4`. `check`: 0 com erro e 3 avisos de `CONTRASTE-MARCA`, os mesmos do `--line-strong` com o valor escrito. Medido no `preview.svg`: área por caso constante em cada versão (119,95, 80,06, 80,29 e 133,4 px²), `viewBox` em escala 1, preview contra página de 0,00% a 0,06% de pixels diferentes nos oito pares. Da lista da primeira passada saiu só o ramo `hasWidth` da `v3`, que agora escreve `sem lead` para a combinação veiculada sem lead; o resto continua valendo. O que é novo ou mudou:

* `v1` e `v2`, par de taxa e complemento: a saída da `v4` (complemento tirado da taxa já arredondada) não foi levada às duas; `lostText` segue arredondando à parte (`v1` linha 161, `v2` linha 177) e fecha 100,0 no dado padrão por coincidência.
* `v2` e `v3`, TIP-4: o total da legenda (`730` e `984`) vai em `kpi-number` sem peso declarado e herda 400, que a Space Grotesk não carrega; o navegador cai no 500 e nada muda no preview.
* `v2`, `v3` e `v4`, ANO-2: o nome da linha global vai em `--text-secondary` e o valor em `--text-primary`, e a queda da `v2` em 12 px; a regra fala em 11 px e `--text-muted`. O contraste fica acima do pedido e nada colide.
* `v3`, parte não qualificada: a legenda passou a dar o total (669), mas os ladrilhos de cima seguem sem número por coluna.
* `v3`, legenda: `190`, `125` e `669` vão sem substantivo ao lado; a unidade está no `de 984 leads` do fim da linha (NUM-6).
* `v4`, selo de amostra pequena fora do dado padrão: o selo fica do lado oposto ao texto do rótulo escalonado (`Chart.tsx:307`). Com o texto à direita do fio (`toLeft` falso) e a coluna a menos de 108 px da borda esquerda, o selo nasce em x negativo e é cortado pelo `viewBox`; e quando a faixa selada não é a última escalonada, o fio da seguinte atravessa o selo. No dado padrão a selada é a última, à direita, e nada disso aparece.
* `v4`, complemento das faixas escalonadas: Grande e Muito grande não escrevem o percentual perdido, que sai de `0 de 11` e `1 de 4`.
* `v4`, linha global sobre Pequena: o topo do ganho (28,0%) fica a 1,98 px da linha de 26,6% e some inteiro sob o fio de 4 px, então a coluna parece terminar logo abaixo da linha estando 1,4 ponto acima dela. Os dois números estão escritos. É o custo da saída da TOK-10 em colunas coladas, já descrito na primeira passada.
