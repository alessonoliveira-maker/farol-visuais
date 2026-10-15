# Dispersão simples

## O que é

Cada ponto é uma entidade posicionada por duas medidas quantitativas, uma em cada eixo. É a forma de entrada da família de dispersão e bolhas: responde se existe relação entre X e Y, quem foge do padrão e onde há aglomerados. A leitura é de posição, não de comprimento ou de área, então o eixo não precisa começar no zero.

## Quando usar

- Relação entre duas medidas de um conjunto de entidades, como ticket contra ciclo de oportunidades ganhas.
- Achar quem foge do padrão e dar nome a poucos pontos, até cerca de 8 rótulos diretos.
- Comparar a nuvem de 2 a 5 grupos no mesmo plano, com forma e cor por grupo.
- Medidas que variam em ordens de grandeza, com eixo em escala logarítmica e marcas em unidades humanas.
- Até cerca de 500 pontos com opacidade moderada; até cerca de 3.000 com ponto pequeno e opacidade 0,35.

## Quando evitar

- Uma das medidas é categoria ou tempo: use barras (família 02) ou linhas (família 04).
- Acima de cerca de 3.000 pontos: use densidade 2D (modelo 09 da família) ou declare a amostra no rodapé.
- Mais de 5 grupos no mesmo plano: use pequenos múltiplos (modelo 11 da família).
- Leitura por quadrante com cortes de meta: use a família 25, matriz e quadrantes.
- Registro sem X ou sem Y não pode virar ponto no zero: ele sai do plano e entra na contagem do rodapé.

## Anatomia

1. Dois eixos numéricos com nome, tique formatado por `formatCurrencyAxis` (ticket) e por dias inteiros (ciclo), domínio explícito e estável (CONTRATO, EIX-4, EIX-6).
2. Grade nos dois sentidos com `CartesianGrid`, porque a leitura da dispersão é a posição conjunta nos dois eixos, não uma direção só.
3. Pontos com opacidade abaixo de 1 (`fillOpacity`), para pontos empilhados se revelarem pela tinta mais forte.
4. Dica própria (`ChartTooltip` com `payload` remapeado) trazendo o nome da entidade e os dois valores já formatados na unidade certa (CONTRATO, DIC-2).
5. Linha de leitura acima do gráfico, calculada do dado: quantos pontos aparecem (ANO-5).
6. Rodapé abaixo do gráfico com o número de registros sem as duas medidas, que saem do plano em vez de virarem zero (regra 8 da família).
7. Rótulo direto em poucos pontos, com anticolisão em TypeScript: a posição sai de 8 candidatas ao redor da marca, e a escolhida é a primeira que não invade outra marca, outro rótulo nem a borda do plano (`v2`).
8. Anel na marca destacada, segundo canal do destaque para a cor não ser a única pista (`v2`, CONTRATO, ACE-2).
9. Envoltória por grupo: casco convexo calculado em pixels sobre o miolo da nuvem, entre P5 e P95 dos dois eixos, com preenchimento de 0,15 e contorno revestido pela cor do cartão onde dois territórios se cruzam (`v3`, CONTRATO, TOK-4).
10. Legenda com amostra na forma da marca, contagem e percentual de composição pelo maior resto, quando há mais de um grupo no plano (`v3`, CONTRATO, ROT-4 e ROT-5).
11. Escala logarítmica no eixo que atravessa ordens de grandeza, com marcas em unidade humana e o aviso escrito no rótulo do eixo (`v4`, CONTRATO, EIX-4 e REC-21).
12. Faixa de borda para o zero medido que a escala log não representa, com a contagem escrita ao lado e um tracejado separando a faixa do plano (`v4`, CONTRATO, EST-3).
13. `ZAxis` com as duas pontas iguais em toda versão: sem ele o raio do ponto varia e passa a codificar o que ninguém quis codificar (ARMADILHAS, REC-15).

## Versões

- `v1_ticket-contra-ciclo`: ticket em reais contra ciclo de venda em dias, das oportunidades ganhas nos últimos 12 meses. Demonstra `ScatterChart` com eixos numéricos e domínio explícito, dica própria com o nome da oportunidade e os dois valores formatados, opacidade abaixo de 1 revelando dois pontos empilhados e o rodapé com o total exibido e o total sem dado.
- `v2_extremos-rotulados-com-destaque`: ticket médio contra win rate de 18 executivos. Demonstra nuvem em neutro com os extremos por cima, rótulo direto só nos 3 maiores e nos 3 menores, posição do rótulo escolhida entre 8 candidatas por anticolisão em pixels e destaque com segundo canal, anel na marca e peso 700 nos dois extremos absolutos. O win rate nasce do par `ganhas` sobre `oportunidades`, e quem não fechou oportunidade sai do plano em vez de cair em 0%.
- `v3_origens-com-envoltoria`: 420 leads de três origens por minutos até o contato e interações. Demonstra um `Scatter` por origem com cor de slot fixo no dado e forma própria, casco convexo por grupo calculado em pixels sobre o miolo entre P5 e P95, preenchimento de 0,15 com revestimento na cor do cartão sob o contorno e o grupo maior desenhado primeiro para não cobrir o menor.
- `v4_tempo-de-contato-em-escala-log`: 1.800 leads por tempo até o primeiro contato contra tentativas até a agenda. Demonstra `XAxis` com `scale="log"`, domínio positivo e marcas em unidade humana de 1 min a 7 dias, o aviso de escala escrito no rótulo do eixo, ponto de raio 2 com opacidade 0,7 para volume alto, e os três estados do dado com tratamento distinto: minuto positivo no plano, zero medido na faixa da borda como uma barra por linha de tentativas com a contagem escrita, e ausência de horário fora do plano, no rodapé.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/WonOpportunityScatter/`.
2. Troque o `import` do `./data` pelo dado real da página, filtrado sem os registros incompletos antes de chegar ao componente ou já filtrado dentro dele, como no catálogo.
3. Ajuste `DOMAIN_X`, `TICKS_X`, `DOMAIN_Y` e `TICKS_Y` para a faixa real da métrica; um domínio fixo evita que a nuvem mude de forma a cada filtro.
4. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-64">`) ou passe `height`.
5. Nas versões com camada própria (`v2`, `v3` e `v4`), a camada é um componente local que só funciona **dentro** do `ScatterChart`, porque depende de `usePlotArea`, `useXAxisScale` e `useYAxisScale`. Mantenha a ordem dos filhos: envoltória e faixa de borda antes dos `Scatter`, rótulo e anel depois deles.
6. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Data Visualisation Catalogue, scatterplot](https://datavizcatalogue.com/methods/scatterplot.html): uso para dados pareados, a tendência opcional e o aviso de que correlação não é causa.
- [Recharts, Simple Scatter Chart](https://recharts.github.io/en-US/examples/SimpleScatterChart/): `type="number"` nos eixos e `unit` alimentando a dica.
- [Storytelling with Data, what is a scatterplot](https://www.storytellingwithdata.com/blog/2020/5/27/what-is-a-scatterplot): transparência nos sobrepostos, eixo sem zero e o alerta de leitura errada.
- [Recharts, hooks de escala](https://recharts.github.io/en-US/api/hooks): `usePlotArea`, `useXAxisScale` e `useYAxisScale`, que dão à camada própria os pixels de todos os pontos ao mesmo tempo; é o que o `content` do `LabelList` não entrega, porque recebe um rótulo por vez.
- Casco convexo por varredura monótona, de Andrew, em `O(n log n)`: a implementação é local, em `v3/Chart.tsx`, porque a lista de imports do CONTRATO não tem biblioteca de geometria e a seção 6 manda virar SVG puro com geometria em TypeScript.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19. Nenhum bloqueante; os pontos abaixo são de melhoria._

- `v1_ticket-contra-ciclo`: a nuvem é quase perfeitamente monotônica, quase um degrau contínuo do menor ao maior ticket. A versão demonstra a forma, mas não exercita o que a dispersão serve para revelar (aglomerado, dispersão vertical, ponto fora do padrão); duas ou três oportunidades fora da tendência deixariam a leitura mais próxima do dado real.
- `v1_ticket-contra-ciclo`: a anatomia deste README e o estudo da família falam em "dois eixos numéricos com nome e unidade", mas o nome do eixo só existe no `name` do `XAxis` e do `YAxis`, que o Recharts usa na dica. Na tela quem nomeia as medidas é o subtítulo do cartão; os tiques trazem só a unidade (`R$` e `d`).
- `v1_ticket-contra-ciclo`: o `useCase` do `meta.json` diz "ticket em reais" e o catálogo diz "ticket em mil reais"; o eixo imprime `R$ 100 mil`, então o texto do catálogo descreve melhor o que se lê.
- `v1_ticket-contra-ciclo`: o catálogo lista "rodapé com o número de pontos exibidos", e na versão esse número vive na linha de leitura acima do gráfico, enquanto o rodapé traz os 3 registros sem ticket ou sem ciclo. A divisão é boa, mas divergente do texto do catálogo.
- `v1_ticket-contra-ciclo`: dois nomes do `data.ts` chegam perto de marca existente ("Supermercado Bom Preço Sul" e "Farmácia Popular Santa Rita", esta última ecoando um programa federal). Nada real é reproduzido e a guarda do check passa, mas nomes mais neutros evitariam a dúvida.

_Notas do produtor da leva de 2026-09-28, quando as três irmãs entraram. Nenhuma é bloqueante; são tensões declaradas, não defeitos escondidos._

- `v2_extremos-rotulados-com-destaque`: a especificação do catálogo pede "rótulo em peso 700" para o destaque, e a TIP-3 do CONTRATO dá teto de dois elementos em peso 700 por visual. Com seis rótulos de destaque as duas regras não cabem juntas. A versão resolve pelo peso da regra estrutural: os dois extremos absolutos, o maior e o menor win rate, saem em 700, os outros quatro em 600, e o anel na marca é o segundo canal de todos os seis. Quem revisar decide se o catálogo ajusta a redação da versão ou se a TIP-3 ganha uma exceção escrita para nuvem com extremos rotulados.
- `v2_extremos-rotulados-com-destaque`: o win rate de cada executivo aparece com o volume na dica e na frase acessível, mas a linha de leitura traz só a faixa de taxas e o volume total de oportunidades fechadas, porque os dois pares completos não cabem em uma linha de 12 px. A DAD-1 pede taxa com volume; aqui o volume está na linha, agregado, e o par individual está a um passe de mouse.
- `v3_origens-com-envoltoria`: a envoltória recorta o miolo entre P5 e P95 de **cada eixo separadamente**, não a região de maior densidade conjunta. É o recorte que o catálogo especifica e ele é honesto para dizer onde a origem mora, mas não é um contorno de densidade: um ponto dentro das duas faixas e longe do centro da nuvem continua puxando o casco.
- `v4_tempo-de-contato-em-escala-log`: a opacidade subiu para 0,7 para o ponto isolado da cauda passar do piso de 3:1 da ACE-5; o custo é que a nuvem densa satura mais, e a leitura da densidade fica por conta da mediana escrita na linha de leitura.
- `v4_tempo-de-contato-em-escala-log`: o eixo vertical conta tentativas, que é inteiro de 1 a 9, e com 1.697 pontos a nuvem se organiza em faixas horizontais em vez de nuvem. A leitura continua honesta, porque a faixa é o dado, e a variação de tinta ao longo do eixo logarítmico continua contando onde a massa está; quem quiser a nuvem espalhada precisa de deslocamento derivado do próprio registro, que é técnica da família 16, distribuição, e não deste modelo.
- `v4_tempo-de-contato-em-escala-log`: o `data.ts` guarda cada lead como tupla nomeada e não como objeto, pelo volume: 1.800 registros com id e nome de campo seriam dezenas de KB num arquivo cuja função é ser lido por humano. É divergência de forma em relação ao exemplo da seção 3 do CONTRATO, que mostra objeto com `id`.

_Revisão de 2026-10-14 das versões `v2`, `v3` e `v4`. A `v3` foi aprovada; a `v2` e a `v4` foram reprovadas, e os bloqueantes estão em `validation/revisao_09_dispersao-e-bolhas__01_dispersao-simples_2026-10-14.md`. Os pontos abaixo não bloqueiam._

- `v2`, `v3` e `v4`: os dois eixos espalham `AXIS_PROPS` sem `axisLine={false}` (EIX-5, EIX-3b; dívida conhecida da guarda EIXO-CALMO). A linha de eixo cai sobre a linha de grade da borda do domínio, na mesma cor, então o preview não mostra diferença; alinhar quando o arquivo for tocado.
- `v2_extremos-rotulados-com-destaque`: os rótulos dos extremos saem em 11 px, e a 17.1 dá 12 px a rótulo direto. Estão legíveis e não colidem com nada.
- `v2_extremos-rotulados-com-destaque`: os deslocamentos das 8 candidatas (13, 19, 11, 17 px) e o `LABEL_PAD` de 3 px não são múltiplos de 2 (ESP-1). Sem consequência no preview.
- `v2_extremos-rotulados-com-destaque`: a linha de leitura escreve a faixa de win rate (12,1% a 61,9%) sem o volume de cada ponta (DAD-1); o volume total vai na mesma linha e os pares completos estão na frase acessível e na dica. Tensão já declarada pelo produtor.
- `v3_origens-com-envoltoria`: minuto e interação são inteiros e o ponto é opaco, então 106 dos 420 leads caem exatamente atrás de outro da mesma origem, a maioria no Inbound. A nuvem do Inbound parece menor do que os 210 leads que a legenda escreve; o volume está escrito, mas um contorno de 1 px na cor da superfície ou uma opacidade de 0,66 ou mais deixaria a massa visível.
- `v3_origens-com-envoltoria`: o eixo vertical imprime números soltos de 0 a 12, e "interações" só aparece no subtítulo do cartão e na dica (NUM-6). A `v4` resolve com "Eixo vertical: …" no rodapé, e a mesma frase cabe aqui.
- `v3_origens-com-envoltoria`: o rodapé que explica a envoltória ("sem as caudas de 5%") só aparece quando há lead sem contato; com dado completo a explicação do recorte some junto com a contagem.
- `v3_origens-com-envoltoria`: a frase acessível dá a mediana de minutos por origem, mas não diz a outra metade da conclusão, que o Outbound pede mais interações (6 a 10) que o Inbound (3 a 6) e a Indicação (1 a 4).
- `v3_origens-com-envoltoria`: o preenchimento da envoltória a 0,15 compõe de 1,22 a 1,38:1 contra o cartão. Passa na pergunta 30 porque o território é carregado pelo contorno opaco, de 5,39 a 9,50:1 nos dois temas; o preenchimento é tinta de agrupamento, como a faixa da ANO-4.
- `v4_tempo-de-contato-em-escala-log`: "acima de 1 dia, 6" sai sem o substantivo (NUM-6), e as duas faixas comparadas não dizem quantos leads têm (899 até 1 h, 55 acima de 1 dia).
- `v4_tempo-de-contato-em-escala-log`: a frase acessível termina em "41 em 0 min na borda e 62 sem horário não aparecem", o que lê como se os 41 também não aparecessem.
- `v4_tempo-de-contato-em-escala-log`: a mediana "contatados em até 1 h" exclui os 41 contatos imediatos, que também são até 1 h. Com eles a mediana continua 3 (940 leads), então não muda o número publicado, só a definição.

_Segunda passada de 2026-10-14, depois da rodada de correção da `v2` e da `v4`. A `v2` foi aprovada; a `v4` foi reprovada de novo, e o bloqueante está no fim de `validation/revisao_09_dispersao-e-bolhas__01_dispersao-simples_2026-10-14.md`. Os pontos abaixo não bloqueiam._

- `v2_extremos-rotulados-com-destaque`: o `<ZAxis range>` não chega ao desenho. Os 18 pontos saem com 4,514 px de raio, que é o padrão de 64 px² do Recharts, e não com o `POINT_RADIUS` de 4,5; a diferença é de 0,014 px e não aparece, mas a constante é morta, e trocar o raio aqui não mudaria nada (mesma causa do bloqueante da `v4`).
- `v2_extremos-rotulados-com-destaque`: a linha de leitura abre com "18 executivos", que o subtítulo do cartão já escreve (ANO-5). O que ela acrescenta é o resto: 473 oportunidades fechadas e a faixa de 12,1% a 61,9%.
- `v4_tempo-de-contato-em-escala-log`: as contagens da faixa do zero ("19", "13", "7" e "2") saem sem `font-display` (TIP-1), ao contrário do "41 em 0 min" logo acima; e nem elas nem o "41 em 0 min" escrevem "leads" (NUM-6).
- `v4_tempo-de-contato-em-escala-log`: a faixa do zero usa escala fixa de 0,8 px por lead (`ZERO_BAR_PER_LEAD`). Com o dado padrão a maior linha, de 19, mede 15,2 px e cabe com o número nos 36 px da faixa; num recorte com mais de cerca de 30 zeros na mesma linha, barra e número passam do tracejado e caem sobre os pontos de 1 min (ESP-6). Derivar a escala da maior linha resolve.
- `v4_tempo-de-contato-em-escala-log`: a barra da linha de 2 leads mede 1,6 por 5 px e lê como tique; é o número escrito ao lado que carrega a leitura.
- `v3_origens-com-envoltoria` (fora desta passada, notado ao medir a `v4`): o `POINT_RADIUS` de 3,2 px também não chega ao desenho, e os círculos do Inbound saem com 4,514 px no `preview.svg`. A versão segue aprovada; alinhar quando o arquivo for tocado.

