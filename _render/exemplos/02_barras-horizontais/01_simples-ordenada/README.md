# Barras horizontais simples ordenadas

## O que é

Uma série de valores por categoria, desenhada em barras horizontais ordenadas do maior para o menor. O valor fica escrito na ponta de cada barra, a posição fica escrita ao lado do nome, e uma categoria pode ficar acesa na cor de destaque enquanto as demais recuam para o neutro. A média do grupo entra como linha de referência.

## Quando usar

- Mostrar onde uma pessoa, campanha ou canal está no ranking sem perder a escala do grupo inteiro.
- Até uns 15 itens com nome longo, quando a grandeza exata importa (o rótulo direto dispensa eixo e grade).
- Cartões de página em que o leitor precisa responder "quem está na frente e por quanto".

## Quando evitar

- Série temporal: a ordem do tempo some quando o componente ordena pela grandeza.
- Mais de 15 a 20 categorias: agrupe a cauda em "demais" ou use tabela ordenável.
- Valores negativos ou mistos: a barra que nasce do zero para os dois lados pede o modelo divergente.
- Parte de um todo: a soma não aparece na barra; use waffle, rosca ou barra 100%.

## Anatomia

1. Linha de leitura no topo, calculada do dado: posição do destaque e distância para o primeiro lugar (CONTRATO, ANO-5).
2. Posição (1, 2, 3...) em Space Grotesk, na cor de destaque só na linha acesa.
3. Nome da categoria em Manrope 12 px, alinhado à esquerda num eixo de largura fixa; peso 700 só no destaque.
4. Barra com raio só na ponta e vão de 34%; destaque em `--chart-1`, demais em `--line-strong`, permitido porque toda barra tem o valor escrito (COR-2).
5. Rótulo direto de valor na ponta, em moeda compacta pt-BR (`formatCurrencyCompact`), com halo na cor do cartão onde cruza a linha de referência (ROT-7).
6. Média do time como `ReferenceLine` tracejada em `--text-muted`, com `ifOverflow="extendDomain"` e rótulo "média" com o valor (ANO-3).
7. Sem eixo de valor e sem grade: o rótulo direto é a régua. Sem linhas, o componente troca o gráfico por um estado vazio.

## Versões

- `v1_ranking-com-destaque`: receita nova do trimestre por executivo, com a pessoa que abriu o painel em destaque. Demonstra Recharts nativo em layout vertical, ordenação no componente, uma cor de destaque sobre neutro, linha de leitura calculada, média anotada com halo nos rótulos e estado vazio.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para uma pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/RankingBars/`.
2. Troque o `import` do `./data` pelo dado real da página e passe `data` e `highlightId` pelas props; o default do `data.ts` só serve para o catálogo.
3. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-64">`) ou passe `height`.
4. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- Cleveland, W. S.; McGill, R. (1984). Graphical Perception: comprimento sobre escala comum é a leitura mais precisa.
- Recharts 3, `BarChart` com `layout="vertical"`, `LabelList` e `Cell`: https://recharts.github.io/
- Farol: `app/src/components/visuals/charts/BarsChart.tsx` (orientação horizontal e destaque por `highlightKeys`).
