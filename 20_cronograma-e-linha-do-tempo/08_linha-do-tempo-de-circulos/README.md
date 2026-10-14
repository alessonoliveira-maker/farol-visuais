# Linha do tempo de círculos

## O que é

Eventos discretos sobre um eixo de tempo contínuo, uma faixa por categoria, com círculo de área proporcional à magnitude. A posição horizontal diz quando o evento aconteceu, a faixa diz de quem ou de que produto ele é, e a área diz o tamanho. Lê-se da esquerda para a direita; o que a forma entrega é ritmo e concentração, não o valor exato, que fica na dica e nos rótulos dos casos que pedem número escrito. A área parte de zero e não tem piso: o círculo com metade do valor tem metade da área.

## Quando usar

- Eventos com magnitude em 2 a 6 categorias, de 10 a cerca de 150 pontos no período.
- Fechamentos por executivo ao longo do trimestre, em que valor e data contam juntos.
- Receita ou volume por produto mês a mês, lido como ritmo e concentração.
- Régua de eventos sob um sparkline, para situar o degrau da série no tempo.

## Quando evitar

- A leitura precisa de valor exato: use colunas (família 03) ou barras (família 02).
- Série contínua amostrada no tempo: use linhas (família 04).
- Eventos sem magnitude: use a linha do tempo de marcos (20/02).
- Muitos eventos no mesmo dia se sobrepondo: agregue por semana ou use o mapa de calor (família 15).
- Eventos explicando uma métrica com eixo e rótulos: marque sobre a série (04/01).

## Anatomia

1. `ScatterChart` com `XAxis` numérico em milissegundos UTC, domínio de mês cheio e ticks gerados em TypeScript por `Date.UTC`, escritos por `formatMonthShort` (EIX-4).
2. `YAxis` numérico com a faixa no índice e o tique escrito pelo nome, nunca de categoria: `Scatter` sobre categoria abre uma banda por ponto (REC-14). Na `v3` o eixo some (`hide`).
3. `ZAxis` com `dataKey` do valor, `domain` de zero ao máximo declarado e `range` de zero à área máxima em px² (REC-31). Sem `ZAxis` registrado a marca volta aos 64 px² (REC-15).
4. Círculos em `--chart-N` com `fillOpacity` de pelo menos o mínimo da cor (ACE-5), contorno `--surface-raised` e ordem do maior para o menor (REC-13).
5. Grade nos dois sentidos, em `--line-subtle`, porque tempo e faixa são lidos por posição (EIX-3b).
6. Régua de tamanho com três círculos, o último é o maior valor observado, calculado do dado (ROT-5b), com `formatCurrencyCompact`.
7. Linha de leitura calculada do dado (ANO-5) e frase acessível de 100 a 250 caracteres na raiz (ACE-1).
8. Estado vazio com `Filter` e frase (EST-1); toda agregação sobre lista devolve `number | null` ou `null` (EST-1b).

## Versões

- `v1_fechamentos-por-executivo`: 27 fechamentos de cinco executivos no terceiro trimestre de 2026. Demonstra `ScatterChart` com tempo numérico, área por `ZAxis` de zero ao máximo, ordem do maior para o menor e régua de tamanho que termina no máximo do recorte.
- `v2_receita-por-produto-com-maior-mes`: receita de quatro produtos em 24 meses. Demonstra o mesmo domínio de `ZAxis` em todas as faixas, cor fixa por produto, maior círculo anotado por `LabelList` com `content` e total do período escrito à direita da faixa.
- `v3_regua-micro-de-eventos-sob-sparkline`: oito eventos de mídia de 2026 sob o CPL qualificado semanal. Demonstra régua sem eixo com o mesmo domínio do sparkline, forma por tipo de evento e agrupamento por pixel numa marca com contador e lista na dica.
- `v4_estornos-e-meses-sem-coleta`: receita de três produtos com estornos e dois meses sem coleta. Demonstra estorno como contorno vazado de área absoluta, faixa de ausência neutra com `formatUnavailable` e zero medido com ponto próprio.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/<NomeDoComponente>/`.
2. Troque o `import` do `./data` pelo dado real. Datas em `YYYY-MM-DD` ou `YYYY-MM`; o domínio, os ticks e a ordem das faixas se recalculam sozinhos.
3. Ajuste `AREA_MAX` à altura da faixa: o diâmetro do maior círculo não deve passar da altura de uma faixa. Com mais faixas ou corpo mais baixo, reduza a área, e a régua de tamanho acompanha.
4. Na `v2`, mantenha o `slot` de cor por produto vindo do dado (COR-3) e ajuste `MARGIN.right` se o total ficar mais largo que `R$ 99,9 mi`.
5. Na `v3`, o sparkline e a régua precisam da mesma `MARGIN` e do mesmo domínio; o agrupamento mede a largura real por `ResizeObserver`, então vale em qualquer largura de cartão.
6. Na `v4`, mês sem coleta entra com `revenue: null`; não troque por zero. Zero medido entra com `revenue: 0`.
7. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-64">`) ou passe `height`.
8. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Recharts, Scatter Chart](https://recharts.github.io/en-US/examples/): `Scatter`, `ZAxis`, `ReferenceArea` e `LabelList`.
- Hooks `useYAxisScale` e `usePlotArea` do Recharts 3.10.1, usados na `v2` para escrever o total à direita de cada faixa.
- Tufte, E. *The Visual Display of Quantitative Information*: micro eventos em linha, sem moldura, junto da série que eles situam.
- Arquivos do Farol de referência: `app/src/components/visuals/charts/chartTheme.ts` (eixo, animação) e `ChartTooltip.tsx` (dica).
- Pedido ao Farol: nenhum formatador de intervalo entre datas em `@/lib/format`; a distância em dias sai de milissegundos UTC dentro do componente.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-12, primeira passada das quatro versões. Medido nos `preview.svg` e nos PNGs de `_render/.qa/` (2 px de imagem por px de CSS). `v1`, `v2` e `v4` aprovadas; o que reprovou a `v3` está em `validation/revisao_20_cronograma-e-linha-do-tempo__08_linha-do-tempo-de-circulos_2026-10-12.md`, não aqui.

- `v1`, `v2`, `v4`: a grade corre nos dois sentidos apoiada na EIX-3b, mas o eixo Y é faixa, isto é, categoria com índice numérico por causa da REC-14, e a exceção pede os dois eixos quantitativos. Pela letra vale a EIX-3, e as irmãs da família 20 (gantt, marcos, jornada) usam `horizontal={false}`. As linhas horizontais servem de trilho da faixa e não colidem com nada, por isso não reprova; quem tocar o arquivo alinha a grade ou declara a divergência, inclusive no item 5 da Anatomia.
- `v1`, `v2`, `v4`: o contorno de 1 px em `--surface-raised` cobre 0,5 px do raio de toda bolha, e a menor paga mais. Pela conta do traço centrado, na `v1` o fechamento de R$ 9,8 mil perde cerca de 27% da área visível contra 7% do maior, e na `v2` o mês de R$ 40 mil perde cerca de 36%. O caminho está exato (áreas de 36,87 a 700,00 px² na `v1`, de 20,00 a 600,02 na `v2` e de 33,33 a 1.500,00 na `v4`, lidas no `preview.svg`) e o contorno é a convenção da família 09; fica o tamanho do desvio, na linha da GEO-16.
- `v1`: o título diz "por semana" e cada círculo é um fechamento na data exata, sem agregação semanal. A legenda ("Valor do fechamento") e a linha de leitura desfazem a dúvida; o título vem do catálogo e a troca é decisão do dono.
- `v1`, `v2`: fechamento ou mês de valor zero ou negativo sai do desenho e do total pelo filtro `> 0`, sem aviso na tela. O dado padrão não tem nenhum; quem cola com dado que tem zero ou estorno usa a `v4`, que dá marca própria aos dois.
- `v2`: "Total em 24 meses" é texto escrito à mão. O componente recalcula domínio, tiques e faixas do dado, e esse cabeçalho envelhece no primeiro recorte com outro número de meses; vale contar os meses do dado e escrever por `formatInt`.
- `v2`: os totais à direita das faixas estão alinhados à esquerda, e a TIP-6 pede número à direita em coluna. Sem consequência de leitura com quatro valores.
- `v2`: o último círculo do Plano Plus (set/26, raio de 13,0 px) tangencia a borda direita da grade, porque a folga de 15 dias vale 12,9 px; no PNG ele termina no pixel anterior à linha. Nada é cortado. Uma folga derivada do raio máximo devolve o respiro.
- `v2`: `--chart-6` a 0,72 mede 3,10:1 contra o cartão no tema claro, com 0,10 de folga sobre o piso; a opacidade não pode descer.
- `v2`: o `useCase` do `meta.json` escreve o período como "2024-10 e 2026-09" e vira subtítulo do cartão; a NUM-7 reserva esse formato ao dado e ao documento.
- `v4`: o anel do estorno fica por cima da bolha de receita do mesmo mês e mede 1,01:1 contra ela no tema escuro e 1,86:1 no claro. Quem separa é a matiz (em simulação de protanopia a diferença de cor cai para ΔE 21 no escuro, ainda visível), e o valor vem escrito com sinal logo abaixo, que é a isenção da ACE-3. A saída da TOK-10 é um revestimento de `--surface-raised` sob o traço do anel.
- `v4`: o tique "Módulo de dados" quebra em duas linhas com `Y_AXIS_WIDTH` de 116 (REC-2); fica inteiro e centrado na faixa. A `v2` escreve o mesmo nome numa linha com 128.
- `v4`: o rótulo "−R$ 21,5 mil" (Plano Base, jun/26) fica a 4 px da bolha de cima e a 6 px da bolha de baixo. Com duas bolhas grandes em faixas vizinhas no mesmo mês ele encosta na de baixo.
- `v4`: a faixa de mês sem coleta mede 1,08:1 no escuro e 1,07:1 no claro contra o cartão. É o token que a ANO-4 manda e a lacuna conhecida dos neutros, compensada pela palavra na faixa, pelo tique do mês e pela linha de leitura.
- `v4`: a terceira frase do texto acessível começa em minúscula ("mar/26 e jul/26 sem coleta").
- `v3`: os nomes dos três eventos agrupados só existem na dica; a tela parada diz quantos ficam perto da queda, não quais. É o que o catálogo especifica ("lista na dica") e fica no limite da DIC-1.
- `v3`: o limiar de agrupamento de 10 px é menor que a soma dos raios quando o vizinho é a marca agrupada (8 px mais 4,5 px) ou outro triângulo (6,1 px de meia base cada). No dado padrão a menor distância entre centros é de 22 px e nada se toca.
- As quatro: a legenda fica abaixo do gráfico e a ROT-4 escreve "acima ou ao lado"; é a convenção de legenda de tamanho já registrada em `09_dispersao-e-bolhas/04_bolhas-em-grade-categorica`.
- As quatro: o aviso `AGREGACAO-ZERO` do `check` foi conferido. O zero do ramo sem denominador (`radiusOf` nas `v1`, `v2` e `v4`, `pxOf` na `v3`) só vira geometria e não chega a texto.
- Onde as guardas se calaram: `ESPESSURA-MARCA` e `CONTRASTE-MARCA` não medem nenhuma das quatro (`preview_com_transform`). Medido à mão nos PNGs, escuro e claro: `--chart-1` a 0,72 dá 5,55:1 e 3,42:1; na `v2`, `--chart-3` 4,00:1 e 3,45:1, `--chart-6` 4,45:1 e 3,10:1, `--chart-5` 3,65:1 e 3,62:1; na `v3`, `--chart-1` opaco 9,50:1 e 6,00:1. A diferença entre página e arquivo ficou em no máximo 0,07% dos pixels.

Revisão de 2026-10-12, segunda passada, só a `v3`, depois da rodada única de correção. Julgado o arquivo de hoje, com `npm run check` em 0 erros e 4 avisos. `v3` aprovada. Os dois pedidos da primeira passada conferem no desenho: a amostra de "Agrupados" é o disco de 8 px de raio com algarismo dentro (14 px de tinta na legenda e na régua, contra 8 px da amostra de "Verba", nos dois temas), e o `ZAxis` com `dataKey` e `domain` entrega os 70 px² declarados (círculo com raio de 4,72 px, triângulo e losango com 70,0 px² no caminho do `preview.svg`).

- `v3`: o algarismo da amostra de "Agrupados" é um 2 fixo, escrito no JSX, e a única marca agrupada do dado padrão mostra 3. Lê-se como exemplo de contador, mas ao lado da palavra pode passar por contagem. Vale tirar o algarismo do dado (o menor grupo do recorte, por `formatInt`) ou nomear o 2 numa constante como o menor grupo possível.
- `v3`: a amostra de "Canal" é um losango quadrado (9 por 9 px de tinta) e a marca na régua é o losango estreito do Recharts (6,5 por 12 px de tinta, 8,99 por 15,57 px no caminho). Nenhuma outra forma é losango e a identificação não se perde; quem tocar o arquivo desenha a amostra na proporção da marca.
- `v3`: o limiar de agrupamento continua em 10 px depois que a área subiu de 64 para 70 px², e a primeira passada pediu a conta refeita. A meia base do triângulo passou a 6,36 px e o raio do círculo a 4,72 px: dois triângulos entre 10 e 12,7 px de distância se sobrepõem, e a marca agrupada, que fica no ponto médio do grupo enquanto o limiar mede do primeiro evento, pode cobrir o vizinho seguinte em até 7,7 px. No dado padrão o menor vão entre marcas é de 7,8 px (o criativo de 16/03 e a marca agrupada) e nada se toca. Atualiza os números da linha de mesmo assunto acima.
- `v3`: a marca agrupada tem 16 px de diâmetro (14 px de tinta) para um algarismo de 11 px, abaixo dos 17 px que a folga da ESP-2 daria a rótulo dentro de marca; a regra foi escrita para barra e a `ESPESSURA-MARCA` não mede esta peça. No recorte o algarismo fica inteiro, com cerca de 3 px da marca em volta. Contador de dois dígitos, dez eventos ou mais no mesmo ponto, encostaria na borda do disco.
- `v3`: a linha de leitura escreve números (R$ 120, 06/04/2026, 3 e 14) sem `tabular-nums`; o `preview.svg` traz `font-variant-numeric: normal` no parágrafo, e a TIP-1 pede a classe em todo número de tela. Em frase corrida não há coluna a alinhar e nada muda no render. A linha de leitura das irmãs usa a mesma classe de parágrafo.
- `v3`: a frase acessível diz que 3 eventos caem juntos em 1 marca e não diz que eles ficam a até 14 dias da maior queda, que é o que a linha de leitura (`aria-hidden`) conclui e o que o caso de uso pergunta. Cabe: a frase tem 217 caracteres.
- `v3`: a legenda lista os quatro itens mesmo quando o recorte não tem aquele tipo nem marca agrupada, e continua no cartão sob a frase "Nenhum evento de mídia neste recorte.". O dado padrão tem os quatro.
- `v3`: o comentário do topo do `data.ts` diz que os três eventos de abril ficam "a menos de um pixel de régua um do outro"; em 286 px de plotagem eles ocupam 4,7 px (1,2 px de 02/04 a 03/04 e 3,5 px de 03/04 a 06/04). Quem agrupa é o limiar de 10 px, não o pixel (DAD-10).
- `v3`, onde as guardas se calaram (`ESPESSURA-MARCA` e `CONTRASTE-MARCA` por `preview_com_transform`, `COLISAO-TEXTO` por `texto_em_html`, `RAIO-CONTRA-AREA` por `valor_nao_casado`), medido à mão nesta passada, escuro e claro: marca contra o cartão 9,50:1 e 6,00:1; algarismo sobre a marca 10,06:1 e 6,00:1; texto de 11 px 5,21:1 e 5,37:1; linha de leitura 8,16:1 e 8,13:1. Os 36 pontos do sparkline e as seis marcas da régua caem na mesma escala, com desvio abaixo de 0,001 px no `preview.svg` (EIX-12). A tinta da legenda vai de 39 a 297 px em x e de 274 a 289 px em y, dentro do corpo, que vai de 29 a 331 px e termina em 291 px. Página contra arquivo: 0,078% e 0,075% dos pixels.
