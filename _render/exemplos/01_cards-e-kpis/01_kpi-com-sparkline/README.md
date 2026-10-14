# KPI com sparkline

## O que é

Cartão com o número do período em destaque, a variação contra o período anterior num selo colorido pelo sentido do "bom", o valor de comparação escrito por extenso e uma sparkline dos últimos meses com o ponto atual marcado.

## Quando usar

- Abrir a leitura do mês com um número que só faz sentido junto da comparação e da tendência.
- Linha de KPIs no topo de uma página, em cartões de largura parecida.
- Métrica com sentido claro de melhora (receita sobe é bom, custo desce é bom).

## Quando evitar

- Métrica sem sentido de melhora (volume de fila, por exemplo): o verde e o vermelho mentem; use `goodDirection` neutro num modelo próprio.
- Taxa com volume pequeno: 70% de três casos não é desempenho; o cartão precisa mostrar o par volume e taxa.
- Quando o leitor precisa dos valores de cada mês: a sparkline mostra forma, não número; use linhas.
- Métrica indisponível: não desenhe zero; o componente mostra "indisponível".

## Anatomia

1. Rótulo da métrica em Manrope e o mês do período à direita.
2. Número grande em Space Grotesk com algarismo tabular (`kpi-number`), moeda compacta pt-BR.
3. Linha de variação: ícone lucide, sinal de mais ou sinal de menos tipográfico e percentual (inteiro a partir de 10%) em `text-positive` ou `text-negative` direto sobre o cartão, sem fundo tingido (CONTRATO, COR-7), seguidos da base em `--text-muted`: "contra R$ 162,9 mil em jul/26".
4. Sparkline em SVG com `preserveAspectRatio="none"` e traço que não engorda (`vector-effect`), sem área preenchida, porque a escala vai do menor ao maior valor e não do zero (EIX-2).
5. Ponto do mês de comparação vazado e ponto do mês atual cheio, os dois em HTML para não distorcer: ligam a variação escrita à forma da linha.
6. Mês sem medição (`value: null`) quebra a linha; mês atual sem medição imprime "indisponível" com o ícone `Unplug`.
7. Primeiro e último mês sob a sparkline, em 11 px.

## Versões

- `v1_variacao-contra-periodo-anterior`: receita recorrente nova de 12 meses, variação de agosto contra julho. Demonstra HTML com Tailwind e tokens, variação com sinal, ícone e base nomeada, sparkline sem área com ponto de comparação vazado e o caso sem medição.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página.
2. Passe a série real pela prop `data`; mantenha o formato `{ label, goodDirection, series: [{ month: 'YYYY-MM', value }] }` ou adapte o tipo em `data.ts`.
3. O cartão já é a moldura: use-o direto na grade de KPIs, sem `VisualCard` em volta, dentro de uma célula com altura (`h-44` ou a da linha).
4. Se a métrica existir no registry, prefira o `KpiCard` do Farol para procedência e régua, e traga só a sparkline deste modelo.

## Referências

- Tufte, E. (2006). Beautiful Evidence, capítulo sobre sparklines: gráfico do tamanho de uma palavra, sem eixo.
- Farol: `app/src/components/visuals/KpiCard.tsx` (variação com ícone, cor pelo sentido do bom, ausência nunca vira zero).
- lucide-react: ícones `ArrowUpRight`, `ArrowDownRight` e `ArrowRight`.
