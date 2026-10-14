# Slope chart

## O que é

Duas colunas verticais, uma por momento ou por grupo, e uma reta por categoria ligando os dois valores numa escala única. A inclinação carrega a magnitude da mudança e o cruzamento carrega a inversão de posição. É SVG puro com geometria calculada em TypeScript, porque o problema real é a colisão de rótulo: a função `afastarRotulos` (`spreadLabels` no código) move só o texto, em blocos centrados no próprio grupo, e as retas ficam no valor real. Quando o rótulo sai mais de 8 px do ponto, um traço guia o liga de volta.

## Quando usar

- Dois momentos ou dois grupos nas mesmas categorias, com 3 a 10 retas num plano (`v1` com 6, `v2` com 7, `v4` com 9).
- História de antes e depois em que a troca de posição é a notícia (`v2`).
- Muitas categorias em pequenos múltiplos, uma reta por painel e escala comum (`v3`, 14 painéis).
- Peça ao lado de uma tabela com os dois valores e o delta, como colega da tabela.

## Quando evitar

- Três ou mais momentos: bump chart (04/08) para posição, linha da família 04 para valor.
- Mais de cerca de 10 retas cruzadas num só plano: painéis (`v3`) ou dumbbell (17/03).
- Colunas com escalas diferentes: o gráfico mente, a escala é sempre única.
- O valor de cada ponto é a pergunta e não a mudança: dot plot (17/01).
- Várias medidas por entidade em eixos paralelos: coordenadas paralelas (18/06).

## Anatomia

1. `viewBox` com o tamanho exato do corpo do canvas e escala 1, para o texto de 12 px chegar a 12 px (GEO-18).
2. Escala linear única calculada em TypeScript: domínio de zero ao teto arredondado (`v1`, `v3`, `v4`) ou do piso ao teto arredondados (`v2`).
3. Uma reta por categoria entre as duas colunas, com ponto de 3,5 a 4,5 px e contorno `--surface-raised` (COR-5).
4. Cor por slot fixo do dado, na ordem 1, 3, 6, 5, 2, 4 (`v1`); destaque em `--chart-1` e `--chart-3` com 2,5 px contra cinza `--text-muted` de 1,5 px (`v2`, `v4`).
5. Cabeçalho de coluna com o momento (`font-display`, peso 600).
6. Rótulo e valor nas duas pontas, alinhados para fora: nome na ponta externa, valor junto ao ponto, `formatPercentFromScale100`, `formatPercent` ou `formatCurrencyCompact`.
7. `afastarRotulos` com folga de 15 a 17 px e traço guia em `--text-muted` acima de 8 px de deslocamento.
8. Linha de leitura calculada do dado no topo (ANO-5) e frase acessível com o mesmo formatador.
9. Anotação do cruzamento em 11 px com halo (`v2`); delta com sinal à mão no rótulo da direita (`v2`).
10. Grade de painéis em Tailwind com micro slope reaproveitável e reta tracejada da média (`v3`).
11. Ponto vazado só na coluna direita, "indisponível" na esquerda e rodapé que conta empates e ausências (`v4`).

## Versões

- `v1_participacao-por-canal-entre-anos`: 6 canais, participação nos leads qualificados de 2025 para 2026. Demonstra a escala única, os rótulos nas duas pontas e o afastamento só do texto.
- `v2_plataformas-que-trocaram-de-posicao`: 7 plataformas, CPL qualificado de T1 para T2/2026. Demonstra as duas retas cruzadas em cor, a anotação, a polaridade declarada e o delta com sinal.
- `v3_win-rate-por-executivo-em-paineis`: 14 executivos, win rate do 1º para o 2º semestre. Demonstra a grade de micro slopes na mesma escala, a média da empresa em cada painel e a ordem pela variação em p.p.
- `v4_empate-e-entrada-no-meio-do-ano`: 9 executivos, dois empatados nos dois semestres e um que entrou em julho. Demonstra retas sobrepostas, traço guia, ponto só na direita e rodapé de empates e ausências.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual na página.
2. Troque o `import` do `./data` pelos dados reais; os rótulos de momento (`periodBefore`, `periodAfter`) vêm da métrica, não do `data.ts`.
3. O `viewBox` é do tamanho do corpo do canvas indicado no `meta.json`. Em corpo de outro tamanho, mude `VIEW_W` e `VIEW_H` juntos com as posições das colunas; não deixe o SVG esticar, porque o texto encolhe.
4. Mais retas pedem mais altura: cada rótulo ocupa `LABEL_GAP` px, então `retas × LABEL_GAP` precisa caber entre `PLOT_TOP` e `PLOT_BOTTOM`.
5. Na `v3`, `MicroSlope` não lê nada fora das props e pode ir sozinho para um cartão de KPI; a escala comum (`domainMax`) vem do recorte inteiro.
6. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- Tufte, E. *The Visual Display of Quantitative Information*: o slope graph como tabela desenhada.
- Estudo da família: `_estudo/familias/17_comparacao-de-pontos.md`.
- Referência no Farol: `app/src/lib/format.ts` (formatadores) e `app/src/styles/tokens.css` (tokens).

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, as quatro versões julgadas pela primeira vez e aprovadas. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

- `v1`: a peça mostra só a participação. O total de leads qualificados de cada ano (1.000 e 1.000 no dado padrão) não está escrito, e a DAD-7 lembra que redistribuição e queda de volume desenham igual. O total junto do cabeçalho de cada coluna fecha o caso.
- `v1`: os nomes das pontas vão na cor da série, e a ROT-3 dá `--text-secondary` com marcador na cor para linha de até 4 séries. Os seis slots medem de 5,34:1 a 9,50:1 contra o cartão, então o texto passa o piso de 4,5:1 nos dois temas.
- `v1`: a linha de leitura traz "12%" e "27%" em Manrope sem `tabular-nums` (TIP-1). Sem consequência visível, porque não há coluna a alinhar.
- `v1`: com o dado padrão nenhum traço guia é desenhado: os rótulos de 15% e 14% se afastam 2,8 px cada, abaixo do limiar de 8 px. O afastamento está demonstrado; o guia só aparece na `v4`.
- `v2`: a coluna do delta não tem cabeçalho nem nomeia a base (NUM-4); a base é o valor de T1/2026 na outra ponta da reta. Um cabeçalho "contra T1" fecha.
- `v2`: na ponta direita o rótulo de Rede profissional fica 7,9 px acima do ponto e o de Marketplace 6,9 px abaixo, os dois sem traço guia porque o limiar é 8 px, e o ponto de Rede profissional acaba mais perto da tinta de "R$ 190" que da de "R$ 196". A ordem dos rótulos segue a dos pontos e a leitura fecha; um limiar perto de 5 px daria guia aos dois.
- `v2`: valores e deltas da direita são alinhados à esquerda, e a TIP-6 pede número à direita em coluna: "−R$ 8" e "−R$ 14" não alinham pelo último algarismo. Sem colisão.
- `v2`: "Rede profissional" começa a 4,5 px da borda esquerda do corpo. Um nome mais longo que esse é cortado pelo `overflow: hidden` do SVG.
- `v2`: `findCrossing` devolve só o primeiro par que cruza. Com dois cruzamentos no recorte, o segundo fica cinza e a linha de leitura cita um par só; no dado padrão há um cruzamento.
- `v2`: o `demonstrates` do `meta.json` troca a letra do catálogo (`chart-1` e `chart-2`, demais em `line-strong` a 0,4) por `chart-1` e `chart-3` com neutras em `--text-muted` opaco, e dá o motivo nas notas (COR-8, ACE-5, ACE-6). O desvio é o certo; o catálogo é que ficou para trás.
- `v2` e `v3`: a conta do `meta.json` parte de caso de uso em duas linhas (corpo de 225 px e de 265 px). No render o caso de uso ocupa uma linha e o corpo mede 241,5 px e cerca de 282 px; na `v2` o desenho fica centrado com 8 px de sobra em cima e embaixo. A escala continua 1.
- `v3`: o delta sai sempre com uma casa ("+22,0 p.p.") ao lado de taxas inteiras, e a NUM-1 pede variação inteira a partir de 10. No dado padrão todo delta é inteiro e a casa não informa nada.
- `v3`: o volume aparece só como faixa no rodapé ("de 20 a 50 oportunidades por semestre") e a taxa vai sem casa decimal, onde a NUM-1 pede uma casa e o volume. O `data.ts` declara contagens (DAD-1), então o par de cada executivo sai com `formatRateWithVolume` quando houver lugar para ele.
- `v3`: o rodapé chama de "média da empresa" a razão das somas (ganhas ÷ decididas de todos). "Win rate da empresa" diz o que o número é (NUM-5).
- `v3`: a linha de base do micro slope é `--line-subtle`, e a 17.2 dá `--line-strong` sólido à linha do zero. Os valores estão escritos e nada se perde.
- `v3`: executivo sem oportunidade decidida em um dos semestres sai da grade sem aviso. No dado padrão não acontece; a `v4` mostra o tratamento.
- `v3`: linha de leitura e rodapé trazem números em Manrope sem `tabular-nums` (TIP-1); "1º" e "2º" em `font-display` sem peso declarado caem no 400, que a TIP-4 não lista para Space Grotesk; o volume do rodapé passa por `String()` e não por `formatInt`. Sem consequência visível.
- `v4`: o win rate de oito executivos vai sem volume em todo o cartão; só a entrante tem "45% (9 de 20)". As bases são pequenas, de 20 a 40 decididas, e o empate anunciado é entre 12 de 30 e 16 de 40. A faixa de volume no rodapé, como na `v3`, é a primeira coisa a alinhar (NUM-1, DAD-1).
- `v4`: "Iara Q. indisponível" ocupa, na coluna esquerda, a altura de 45%, onde posição vertical é valor, e parece classificada entre 50% e 40%. Não há ponto nem reta e a palavra desfaz a leitura; abaixo do último rótulo a ausência não pegaria carona na escala.
- `v4`: a EST-2 pede o ícone `Unplug` junto de `formatUnavailable()`; a versão escreve só a palavra, em `--text-muted`.
- `v4`: o anel vazado marca um valor medido e completo (45% no 2º semestre), e no contrato a forma vazada é de ausência ou de período parcial (ACE-2, EIX-10). O rodapé explica o caso.
- `v4`: os dois rodapés trazem números em Manrope sem `tabular-nums` (TIP-1), e "1 sem dado no 1º semestre" conta sem substantivo (NUM-6).
- `v4`: com três ou mais empatados a linha de leitura cita só os dois primeiros e a contagem de pares arredonda para baixo; com duas ausências o rodapé nomeia só a primeira. No dado padrão há um par e uma ausência.
- README: o item 2 da Anatomia diz que `v1` e `v4` têm domínio de zero ao teto. As duas começam no degrau abaixo do menor valor (de 5% a 35% e de 20% a 70%), como o `meta.json` de cada uma declara; só a `v3` parte do zero.
