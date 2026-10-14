# Dumbbell e arrow plot

## O que é

Dois pontos por categoria ligados por um conector sobre um eixo comum: o conector transforma dois valores numa distância, e a leitura passa de quanto para quanto mudou. No arrow plot a ponta final vira cabeça de seta e aponta do momento mais antigo para o mais recente; no connected dot plot entram até três marcadores por linha. Em todas as versões deste modelo a faixa é um `Bar` do Recharts que chega como menor e maior, com `shape` própria que desenha conector e marcadores, e quem é o antes sai do dado, nunca da posição.

## Quando usar

- Mudança entre dois momentos ou duas condições do mesmo objeto, em 6 a 25 categorias (a `v2` mostra 22 linhas em 16 px de passo).
- Ênfase na direção da mudança: arrow plot, com a seta do período antigo para o novo.
- Trajetória curta com marco intermediário, como meta, forecast e realizado, no máximo três pontos.
- Ranking de melhora ou piora, ordenado pelo delta.
- Antes e depois de uma métrica por linha dentro de um cartão de KPI, em micro haltere.

## Quando evitar

- Mais de três momentos: use linha (família 04) ou bump chart (04/08).
- Os dois pontos não são o mesmo objeto, como duas populações: use dot plot agrupado sem conector (17/01).
- Mudanças minúsculas numa escala larga, com cabeça maior que a haste: use tabela com ícone direcional (família 14).
- A distância entre dois extremos importa mais que a mudança: use range plot (17/04).
- Poucas categorias em que a troca de posição é a notícia: use slope chart (17/06).
- Duas medidas quantitativas ligadas num plano: use dispersão de antes e depois com setas (09/06).

## Anatomia

1. `Bar` de faixa com `dataKey` função que devolve `[menor, maior]` e `shape` própria; o domínio do eixo X é fixo e escrito no topo do arquivo.
2. Cabeça do mês antigo vazada em `--chart-3` e a do novo cheia em `--chart-1`, com legenda de ponta (`v1`, `v4`).
3. Conector colorido pela polaridade declarada no `data.ts` (`goodDirection`): custo e minutos que caem são `--positive`, os que sobem são `--negative`, sem mudança é `--text-secondary` (COR-6).
4. Cabeça de seta em path calculado, sem `marker-end`, com o sentido imposto no código: cauda na escala do mês antigo, ponta na do novo (`v2`).
5. Limiar em inteiros (`|ago − jul| × 100 > 15 × jul`) e neutro em `--text-muted`, que mede 3:1 como dado; `--line-strong` mede 1,79:1 e fica fora (ACE-6).
6. Haste curta vira marcador neutro; cabeças coladas viram marcador meio a meio, julho vazado e agosto cheio, com vão de 3 px (`v2`, `v4`).
7. Três marcadores convertidos por regra de três dentro da faixa, com forma e tamanho crescentes: losango, triângulo, círculo (`v3`).
8. Rótulo direto do delta na ponta livre, com sinal à mão e `formatCurrencyCompact`, `formatInt` ou `formatPercent` (NUM-3).
9. Tabela irmã desenhada por um segundo eixo Y na mesma banda de cada linha (`v3`).
10. Micro haltere em SVG de viewBox fixo por linha, escala comum calculada do dado e declarada no rodapé; ponta ausente fica solta, sem conector (`v4`).
11. Dica com o que o corpo não escreve (os dois valores, ou os três), `isAnimationActive={false}` e `ChartTooltip`.

## Versões

- `v1_sla-por-sdr-semana-anterior-e-atual`: 8 SDRs, minutos de SLA da semana passada para a atual. Demonstra a shape com conector e duas cabeças, o sentido lido do payload, a polaridade no conector e o delta com sinal.
- `v2_cpl-por-campanha-em-setas-com-limiar`: 22 campanhas, CPL de jul/26 para ago/26. Demonstra a seta em path calculado, a cor só acima de 15%, a haste curta em marcador e a anotação "9 de 22".
- `v3_meta-forecast-e-realizado-por-executivo`: 14 executivos com três marcadores por linha. Demonstra a regra de três, a forma crescente, a ordem pela distância, os três valores iguais em marcador único e a tabela irmã.
- `v4_micro-halteres-de-cpl-com-mes-ausente`: quatro plataformas em cartão de KPI. Demonstra o micro haltere em viewBox fixo, a ponta ausente solta, o marcador bipartido e a escala comum.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual na página.
2. Troque o `import` do `./data` pelos dados reais; `goodDirection`, os meses e o limiar vêm da métrica, não do `data.ts`.
3. Ajuste o domínio fixo (`X_DOMAIN` e `X_TICKS`) para a faixa real da métrica; domínio automático faria a mesma posição valer números diferentes em cada filtro.
4. Mais linhas pedem mais altura: cada versão declara `ROW_STEP`, e o corpo precisa de `linhas × ROW_STEP` mais o eixo.
5. Na `v4`, a escala comum vem do recorte inteiro; não calcule uma por linha.
6. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Observable Plot, arrow](https://observablehq.com/plot/marks/arrow): duas observações ligadas por seta, com recuo da ponta.
- [Recharts, Bar com valor em faixa](https://recharts.github.io/en-US/api/Bar/): `dataKey` que devolve `[menor, maior]` e `shape` própria.
- Estudo da família: `_estudo/familias/17_comparacao-de-pontos.md`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, as quatro versões julgadas pela primeira vez. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

- `v1`: os rótulos `−2 min` e `sem mudança` atravessam uma linha de grade sem halo (ROT-7). A grade é `--line-subtle` e o texto continua legível nos dois temas; o halo fecha o caso para qualquer recorte.
- `v1`: no tema claro a cabeça cheia (`--chart-1`) e o conector de melhora (`--positive`) medem 1,13:1 entre si. Separam se pela forma (disco contra traço), então não há perda de leitura, mas a cabeça parece continuação do conector.
- `v2`: sete rótulos de delta atravessam linhas de grade sem halo (ROT-7), entre eles `sem mudança`, `+15,9%` e `−12,7%`. Legíveis nos dois temas.
- `v2`: a amostra de `Caiu, melhor` na legenda aponta para a direita, e toda seta de queda no corpo aponta para a esquerda. A amostra na forma da marca (ROT-4) pediria a seta virada.
- `v2`: a haste curta vira marcador em `--text-muted` mesmo que a mudança passe do limiar (CPL baixo, de R$ 10 para R$ 12, por exemplo). No dado padrão não acontece; se acontecer, o rótulo sai colorido e a marca neutra, e o "9 de 22" deixa de bater com a contagem de marcas coloridas.
- `v2`: delta com uma casa acima de 10% contraria a NUM-1 e está declarado no `meta.json` com motivo (ler 14,8% contra 15,0%). Limiar discutível, aceito.
- `v3`: o cabeçalho `Delta` não nomeia a base na própria coluna (NUM-4); a base só aparece na linha de leitura. `Realizado − meta` cabe nos 84 px.
- `v3`: a linha de Heitor L. desenha só o círculo do realizado, e nada na legenda diz que marcador único significa três valores iguais; quem resolve é a tabela irmã.
- `v3`: `ROW_STEP = 15` foge dos múltiplos de 2 px da ESP-1, e a coluna do delta termina 16 px antes da borda direita do corpo, onde a legenda termina. Sem colisão nem corte.
- `v3`: a linha de leitura tem `truncate` e a cauda dela carrega a declaração da ordem, que não está na frase acessível (TIP-7). No canvas `largo` cabe com folga.
- `v4`: observações desta versão estão no parecer de reprovação em `validation/revisao_17_comparacao-de-pontos__03_dumbbell_2026-10-05.md`, junto dos bloqueantes, para saírem na mesma rodada.
- README: a frase "Em todas as versões deste modelo a faixa é um `Bar` do Recharts" não vale para a `v4`, que é SVG puro sem Recharts, como o catálogo pede.

Segunda revisão de 2026-10-05, só a `v4`, julgada de novo depois da correção. Os dois bloqueantes do parecer anterior foram resolvidos (cartão próprio na raiz, marcador bipartido com julho vazado, agosto cheio e vão entre as metades) e a versão foi aprovada. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

- `v4`: nenhum CPL absoluto está escrito no cartão, só o delta e os extremos da escala no rodapé, e a peça não tem dica. Na linha `Display` o ponto solto de julho vale R$ 45 e isso não se lê em lugar nenhum. O valor de julho junto do texto "sem veiculação em ago/26" fecharia o caso, e o delta ganharia a base que a NUM-4 pede na mesma linha.
- `v4`: o rodapé "de R$ 31 a R$ 86 por lead" e o "ago/26" de "sem veiculação em ago/26" são número em Manrope sem `tabular-nums` (TIP-1). Sem consequência visível.
- `v4`: a legenda fica abaixo do desenho, e a ROT-4 pede acima ou ao lado. Sem colisão nem corte.
- `v4`: no tema claro a cabeça cheia (`--chart-1`) e o conector de melhora (`--positive`) medem 1,13:1 entre si, como na `v1`. Separam se pela forma, disco contra traço.
- `v4`: no marcador bipartido a metade vazada soma o contorno de 1,5 px e parece um pouco maior que a metade cheia. As duas se leem nos dois temas em tamanho real.
- `v4`: a amostra bipartida da legenda tem a geometria escrita à mão no JSX (`M3.5,1.5 A3.5,3.5 …`), fora das constantes nomeadas do topo. Sem consequência visível.
- `v4`: o texto "sem veiculação em ago/26" quebra em duas linhas na coluna de 96 px e cabe na linha de 32 px com 2 px de sobra de cada lado; um rótulo de mês mais longo pediria coluna maior.
