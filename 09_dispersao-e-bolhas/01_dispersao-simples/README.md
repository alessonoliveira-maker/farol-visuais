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
- `v4_tempo-de-contato-em-escala-log`: 1.800 leads por tempo até o primeiro contato contra tentativas até a agenda. Demonstra `XAxis` com `scale="log"`, domínio positivo e marcas em unidade humana de 1 min a 7 dias, o aviso de escala escrito no rótulo do eixo, ponto de raio 2 com opacidade 0,35 para volume alto, e os três estados do dado com tratamento distinto: minuto positivo no plano, zero medido na faixa da borda com contagem, e ausência de horário fora do plano, no rodapé.

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
- `v4_tempo-de-contato-em-escala-log`: a opacidade de 0,35 do ponto é a que a especificação da versão pede para 1.697 marcas, e ela compõe com o cartão abaixo do piso de 3:1 que a ACE-5 cobra de marca. A guarda `CONTRASTE-MARCA` não acusa, porque julga só os tokens que o contrato proíbe como marca e a cor composta não é um token, mas a tensão é real: volume alto e contraste de marca não são satisfazíveis ao mesmo tempo com opacidade. A saída que a ACE-5 sugere, contorno na cor da superfície, custaria 1.697 traços num ponto de 2 px de raio, o que come a própria marca.
- `v4_tempo-de-contato-em-escala-log`: o eixo vertical conta tentativas, que é inteiro de 1 a 9, e com 1.697 pontos a nuvem se organiza em faixas horizontais em vez de nuvem. A leitura continua honesta, porque a faixa é o dado, e a variação de tinta ao longo do eixo logarítmico continua contando onde a massa está; quem quiser a nuvem espalhada precisa de deslocamento derivado do próprio registro, que é técnica da família 16, distribuição, e não deste modelo.
- `v4_tempo-de-contato-em-escala-log`: o `data.ts` guarda cada lead como tupla nomeada e não como objeto, pelo volume: 1.800 registros com id e nome de campo seriam dezenas de KB num arquivo cuja função é ser lido por humano. É divergência de forma em relação ao exemplo da seção 3 do CONTRATO, que mostra objeto com `id`.

