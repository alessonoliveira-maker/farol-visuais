# Waffle 10x10

## O que é

Grade de 10 por 10 quadrados em que cada quadrado vale 1% do total, pintados em sequência por categoria, com legenda ao lado (ou abaixo, no espaço estreito) trazendo percentual e contagem. A geometria é SVG puro calculado em TypeScript.

## Quando usar

- Mostrar a composição de um total em poucas categorias (até seis) quando a proporção é a mensagem.
- Destacar que existe uma parcela "sem origem" ou "sem dado", sem escondê-la em "outros".
- Cartões em que a rosca seria a alternativa: o waffle troca ângulo por contagem, que se lê com mais precisão.

## Quando evitar

- Categoria abaixo de 1% que precisa aparecer: ela some na grade (fica só na legenda).
- Mais de seis categorias: as cores deixam de ser distinguíveis; use barras ordenadas.
- Comparação de composição entre grupos ou no tempo: use barra 100% empilhada.
- Quando o volume absoluto é a mensagem: o waffle normaliza para 100.

## Anatomia

1. Grade 10x10 em `viewBox` 0 a 100, com vão fixo e raio pequeno.
2. Distribuição dos 100 quadrados pelo maior resto, para a soma dar sempre 100.
3. Cor presa à categoria pelo campo `slot` (1 a 6, que vira `--chart-1` a `--chart-6`), nunca pela posição depois da ordenação (CONTRATO, COR-3). O dicionário distribui na ordem 1, 3, 6, 5, 2, 4, para que 2 e 4, que repetem cor semântica, só entrem a partir da quinta categoria (COR-8).
4. Categoria de ausência (sem origem) em quadrado vazado com contorno `--text-muted`, sempre por último: a diferença é de forma, não só de cor (ACE-2).
5. Total em Space Grotesk e a frase "cada quadrado é 1% do total".
6. Legenda com amostra na forma da célula, nome em 12 px, percentual igual à contagem de quadrados (soma sempre 100) e contagem absoluta em coluna alinhada à direita.
7. Layout por container query: lado a lado a partir de 24rem de largura, empilhado abaixo disso. Sem oportunidades, o componente troca a grade por um estado vazio.

## Versões

- `v1_composicao-por-origem`: 153 oportunidades do trimestre por canal de origem, com "Sem origem declarada" visível em quadrado vazado. Demonstra SVG puro em React, cor por slot fixo, maior resto com legenda igual à grade e container query.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página.
2. Passe as fatias reais pela prop `data`, com o `slot` de cada canal vindo do dicionário da página (o mesmo canal tem o mesmo slot em todo o Farol); marque `neutral: true` na fatia de ausência de dado e passe `caption` com o que o total conta e o período.
3. Coloque no corpo de um `VisualCard` com altura definida no pai; a grade se ajusta ao menor lado.
4. A frase acessível já soma o total e lista as fatias; se o `VisualCard` tiver título, ele não precisa ser repetido aqui.

## Referências

- Financial Times, Visual Vocabulary: o waffle aparece na categoria "parte de um todo", ao lado da rosca e da barra 100%.
- Método do maior resto (Hamilton) para distribuir inteiros que somam um total fixo.
- Farol: `app/src/components/visuals/charts/DonutChart.tsx` (a fatia sem origem é categoria de primeira classe).
