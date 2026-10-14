# Marcador em trilho

## O que é

Trilho horizontal que representa uma faixa conhecida e um único marcador onde o valor atual cai. Não há barra crescendo do zero: a leitura é posição, não quantidade. O mesmo desenho responde três perguntas conforme o que o trilho representa: de 0 a 100 dá percentual, do mínimo ao máximo histórico dá posição relativa, e a faixa aceitável dá julgamento; por isso os limites do trilho são texto visível, com a fonte deles. É HTML com Tailwind: contêiner `relative`, faixa de referência em `div` absoluto com `left` e `width` percentuais calculados em TypeScript e marcador posicionado por `left` percentual, centrado sobre o ponto. O valor atual vem escrito fora do trilho. Valor fora da faixa fica na borda com chevron para fora e o número escrito, nunca preso em silêncio.

## Quando usar

- Onde o valor de hoje cai entre o mínimo e o máximo dos últimos 12 meses, quando não há meta definida (v1).
- Julgar se o valor está dentro de uma faixa aceitável com fonte declarada, como o SLA contratado (v2).
- Participação própria entre concorrentes de um perímetro declarado, uma linha por segmento, até cerca de 8 linhas no canvas `alto` (v3).
- Coluna de tabela com a posição relativa de cada linha dentro da própria faixa, com a escala declarada no cabeçalho (v3 e v4); a v4 aguenta 5 linhas no canvas `card`.
- Card estreito em que uma barra de progresso mentiria por não existir total fixo.

## Quando evitar

- Existe meta a atingir: use o bullet chart (`13_progresso-meta-e-gauge/02_bullet-chart`) ou a barra de progresso (`13_progresso-meta-e-gauge/01_barra-de-progresso-linear`).
- Vários pontos por linha com eixo: use o dot plot de Cleveland (`17_comparacao-de-pontos/01_dot-plot-de-cleveland`).
- A trajetória até o valor importa: use o sparkline com faixa de normalidade (`24_microvisuais-sparklines/01_sparkline-de-linha`).
- Dois instantes, antes e depois: use o dumbbell (`17_comparacao-de-pontos/03_dumbbell`).
- Faixa sem definição de fonte: o trilho vira julgamento inventado; mostre só o número.
- Distribuição completa das observações: use o strip plot (`16_distribuicao/03_strip-plot-e-beeswarm`).

## Anatomia

1. **Trilho:** `div` de 6 px (`h-1.5`) em `bg-line-strong`, com traço de 1 px em `bg-text-muted` em cada ponta. Não usa `--surface-overlay`, que no tema claro é o branco do cartão.
2. **Faixa de referência (v2):** bloco de 16 px em `bg-surface-sunken` com bordas de 1 px, `left` e `width` percentuais; a faixa aceitável também vai escrita por extenso, com a fonte.
3. **Marcador:** círculo de 12 px (`size-3`) em `bg-chart-1`, `left` calculado em TypeScript menos o raio de 6 px.
4. **Valor atual:** acima do marcador, por `formatCurrencyCompact` ou por inteiro com unidade, preso às pontas por `clamp()` para não vazar do trilho.
5. **Limites:** mínimo e máximo escritos em 11 px com o mês ou a fonte de cada extremo; limite do meio sai quando não cabe sem colidir (v2).
6. **Mediana (v3):** traço de 1 px em `bg-text-muted` dentro do trilho, mais alto que ele para se ver.
7. **Fora da faixa e ausência (v4):** `ChevronRight` ou `ChevronLeft` para fora, distância por `formatPercent` com sinal à mão, `faixa sem histórico suficiente` abaixo de 6 meses e `formatUnavailable()` com `Unplug`, sem marcador no zero.
8. **Frase acessível:** `role="img"` com `aria-label` calculado do dado: posição, extremos e distância.

## Versões

- `v1_cpl-do-mes-na-faixa-de-12-meses`: CPL de set/26 entre o menor e o maior dos 12 meses, com mês sem coleta ignorado e máximo repetido desempatado pelo mais recente.
- `v2_tempo-de-resposta-com-faixa-aceitavel`: mediana de primeira resposta contra o SLA contratado de 5 a 30 minutos, com `fora do SLA` escrito e limite do meio omitido por colisão.
- `v3_participacao-por-segmento-com-perimetro`: 8 segmentos em escala comum de 0% ao maior máximo, mediana do perímetro, participação com uma casa e posição ordinal.
- `v4_valor-fora-da-faixa-e-sem-historico`: marcador preso na borda com chevron, origem com menos de 6 meses sem trilho e origem sem CPL no mês.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ligue `data` à seleção real; o default é só amostra.
2. A moldura é `card`: embrulhe em `VisualCard`. A v1 e a v2 pedem altura de cerca de 155 px no corpo; a v3, cerca de 425 px.
3. Os limites do trilho (histórico, SLA, perímetro) são decisão de negócio: passe-os pelo dado com a fonte, nunca fixos no componente.
4. Confira o trilho nos dois temas: ele depende de `--line-strong` e de `--text-muted`, e a faixa de `--surface-sunken` é discreta no claro.
5. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/` e abra a página a 390 px de largura: os rótulos de limite assumem um trilho de cerca de 280 px.

## Referências

- [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf): faixa qualitativa e marca de valor contra uma escala linear, base do trilho com faixa aceitável.
- [Edward Tufte, Beautiful Evidence](https://www.edwardtufte.com/): sparkline com faixa de normalidade, a ideia de posição dentro de uma faixa conhecida.
- Pedido ao Farol: não existe formatador de minutos em `@/lib/format`; a v2 compõe `formatInt` com a unidade `min` dentro do próprio `Chart.tsx`.
- Arquivo do Farol de referência: `app/src/components/visuals` e `app/src/lib/format.ts`.
- [CONTRATO.md](../../CONTRATO.md): seção 17, em especial EST-1b, EST-2, ROT-9 e ANO-5.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, primeira passada das quatro versões, todas aprovadas. `npm run check`: 0 com erro e 4 avisos de `CONTRASTE-MARCA`, aceitos pela primeira linha abaixo. As posições foram medidas nos PNGs dos dois temas contra o `data.ts`: marcador, faixa do SLA, trilho e mediana caem onde a conta manda, com erro de até 1 px. O que segue não reprova.

- v1 a v4, `CONTRASTE-MARCA`: o trilho em `--line-strong` mede 1,79:1 no escuro e 1,83:1 no claro e vive da isenção do valor escrito da 17.2, com mínimo e máximo nas pontas ou na coluna Faixa da v3. O marcador mede 5,32:1 e 3,27:1 contra o trilho. Na v3, a amostra do trilho na legenda não tem valor ao lado (pendência E5 do contrato) e a guia de 1 px em `--line-subtle` é estrutura.
- v1 e v4, pergunta 21: a diferença entre o SVG e a página mede 0,62% e 0,69% na v1 e 0,63% e 0,72% na v4 (escuro e claro, tolerância de 48 níveis), acima dos 0,5% da pergunta e abaixo dos 2% em que o render reprova. Está no texto que vem depois da palavra CPL, deslocado de 1 a 2 px na horizontal; na v1, toda no subtítulo da moldura. Nenhuma marca diverge. É o mesmo efeito anotado em `17_comparacao-de-pontos/04_range-plot`.
- v1, v3 e v4, TIP-1: três textos com algarismo ficam sem `tabular-nums`: "CPL de set/26" na v1, a linha do perímetro com "2026 T3" na v3 e o cabeçalho "Origem, CPL de set/26" na v4. Sem consequência visível, porque nenhum deles está em coluna.
- v1, EIX-10: a janela escrita, de out/25 a set/26, tem 12 meses e 11 medidos (jan/26 sem coleta). O corpo não diz, e a frase acessível fala em "máximo dos 12 meses".
- v1 e v2, ANO-5: a linha de leitura (a posição na faixa na v1, o veredito do SLA na v2) fica no pé do corpo; a regra pede no topo.
- v2, NUM-5: o corpo escreve "Primeira resposta, semana de 28/09/2026" e não diz que os 38 min são a mediana; só a frase acessível e o caso de uso dizem. Na frase, "tempo mediano de primeira resposta" está escrito à mão, sem usar o `label` do dado.
- v2, fonte do limite: `endLabel` chama de "da semana" toda ponta do trilho que não vem do histórico. Se a ponta for o piso ou o teto do SLA (piso abaixo do mínimo histórico, por exemplo), o rótulo erra a fonte. Mora no ramo, não no preview.
- v3, ACE-1 e TIP-7: o perímetro, que o catálogo manda declarar, não entra na frase acessível, e a linha dele leva `truncate`; no preview cabe com cerca de 200 px de folga. Com 8 segmentos a frase cai na forma curta, com contagens (5 acima e 2 abaixo) e sem dizer que um deles está em cima da mediana; os nomes só entram quando cabem em 240 caracteres.
- v3, ROT-4 e tabela 17.1: a legenda fica abaixo da tabela, em 11 px e `--text-muted`; a regra pede acima ou ao lado, e a tabela pede 12 px e `--text-secondary`.
- v3, mediana sob o marcador: o círculo é desenhado por cima do traço da mediana. Em Seminovos premium (própria igual à mediana), Sedãs compactos (a 3 px) e Peças e acessórios (a 5 px) sobram de 2 a 5 px de traço acima e abaixo do círculo. É legível nos dois temas, mas a mediana não tem valor escrito por linha.
- v4, respiro vertical: a linha tem 32 px para 30 px de conteúdo, e o rótulo de valor fica a 4,5 px do marcador da linha de cima e a 5 px do próprio. Não colide; a associação se apoia na ordem de leitura e no nome centrado entre os dois.
- v4, NUM-1 e ramo: a distância usa `formatPercent(x, 0)` sempre, e abaixo de 10% a regra pede uma casa; histórico com mínimo igual ao máximo divide por zero em `ratio`. Nenhum dos dois aparece no dado padrão.
- v4, DAD-9: o caso de uso fala em máximo de 12 meses e o corpo diz só "meses anteriores"; os históricos do dado têm 12, 12, 12 e 8 meses.
- README, Anatomia: os traços de 1 px nas pontas do trilho só existem na v1 e na v4.
