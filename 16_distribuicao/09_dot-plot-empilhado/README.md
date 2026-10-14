# Dot plot empilhado e quantile dotplot

## O que é

Histograma de unidades: cada observação é um ponto empilhado no seu intervalo, e o diâmetro do ponto é a largura do intervalo em pixels. A pilha já é a contagem, então o eixo de valor some e o n vai na legenda. A grade é fixa, diferente do agrupamento original de Wilkinson, para a régua não mudar entre filtros. O modelo absorve o quantile dotplot, em que os 20 pontos são desfechos simulados igualmente prováveis (quantis de 2,5% a 97,5%) e a leitura é por contagem contra um limiar, com k fixo em 20 no produto inteiro.

## Quando usar

- Amostra pequena, até umas 150 observações, em que contar unidade importa (46 oportunidades, 140 leads).
- Métrica discreta com poucos valores, como o número de tentativas até a agenda, de 1 a 12.
- Comunicar incerteza de previsão a público não técnico: 20 desfechos contados contra a meta ou o teto.
- Codificar desfecho no próprio ponto, com forma cheia ou vazada além da cor.
- Contagem grande demais para um ponto por unidade, com a unidade escrita e o resto como ponto parcial.

## Quando evitar

- Acima de 150 casos sem agregar: histograma (01), ou ponto valendo várias unidades com a unidade escrita (v4).
- Risco de cauda abaixo de 2,5% ou acima de 97,5%: 20 quantis não mostram; use ECDF (04) ou meia-olho (12).
- Ponto como unidade de contagem sem distribuição por trás: família 22, de unidades e waffle.
- Valor contínuo em que o valor exato importa: strip ou wheat plot (03).

## Anatomia

1. **Ponto opaco** em `--chart-1`, com contorno de 1 px em `--surface-raised` que separa pontos colados sem opacidade (ACE-5). Em `v3`, `--negative` para o desfecho acima do teto, sempre com a contagem escrita.
2. **Grade fixa**: faixa de 2 dias na `v1`, uma pilha por valor na `v2`, colunas ancoradas no teto na `v3`. O diâmetro vem da largura medida do corpo, por `ResizeObserver`, com `viewBox` do tamanho do corpo (escala 1, sem encolher texto: GEO-18).
3. **Eixo calmo** só com linha de base em `--line-strong` e tiques em `--text-muted`, números por `formatInt` e `formatDays`.
4. **Forma além da cor** na `v2`: ponto vazado com contorno de 1,5 px em `--text-muted` para lead sem agenda, contado na legenda.
5. **Fundo de destaque** `--surface-sunken` na fila de revisão (`v2`), com rótulo e contagem; nunca `--surface-overlay`.
6. **Teto de capacidade** em linha tracejada com rótulo fora das marcas e contagem de cada lado (`v3`).
7. **Ponto parcial** de área proporcional ao resto, sem piso, com o número ao lado (`v4`); unidade escrita na legenda e conferida contra a altura.
8. **Linha de leitura** calculada do dado, e legenda com o n, a unidade e a grade, todos por `@/lib/format`.

## Versões

- `v1_dias-ate-primeira-reuniao`: função de empilhar com grade fixa de 2 dias; ponto do tamanho do intervalo depois de medir a largura; sem eixo Y.
- `v2_tentativas-ate-a-agenda-com-fila-de-revisao`: uma pilha por número de tentativas; cheio contra vazado; fundo de fila de revisão; título nativo com o código do lead.
- `v3_quantile-dotplot-de-cenarios-de-midia`: 20 quantis por cenário na mesma régua; teto como linha e contagem de cada lado.
- `v4_cada-ponto-vale-dez-leads`: unidade escrita, resto como ponto parcial, altura conferida antes de aceitar a unidade e nota de ponte com a família 22.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão e troque `data` pelo dado do recorte, mantendo o tipo exportado.
2. Cada versão mede o corpo com `ResizeObserver` e precisa de um pai com altura: dê ao `VisualCard` uma altura fixa ou passe `height`.
3. Troque o estado vazio inline por `EmptyState` e confira que a legenda não passa de 30% do corpo.
4. A `v3` espera amostras do simulador em `samples`; o k de 20 e o teto ficam em `data.ts` e não mudam entre telas.
5. Na `v4`, mantenha a unidade em uma constante da página, não por filtro: a unidade que muda entre telas desfaz a comparação.

## Referências

- Wilkinson, L. (1999). Dot plots. The American Statistician, 53(3).
- Kay, M., Kola, T., Hullman, J., Munson, S. (2016). When (ish) is my bus? Quantile dotplots, CHI 2016.
- Fernandes, M. et al. (2018). Uncertainty displays using quantile dotplots or CDFs improve transit decision making.
- Molde de SVG puro com geometria em TypeScript: `_render/exemplos/22_unidades-waffle-e-pictograma/01_waffle-10x10`.
- Medição de largura por `ResizeObserver`: `02_barras-horizontais/10_corrida-de-barras/v1_origens-mes-a-mes`.

## Observações da revisão (não bloqueantes)

**Revisão de 2026-10-05.** O bloqueante da `v3` está em
`validation/revisao_16_distribuicao__09_dot-plot-empilhado_2026-10-05.md`. O que segue não reprova.

- v1: o eixo rotula uma borda a cada duas faixas (de 4 em 4 dias), então metade das faixas não tem rótulo próprio e se lê pela legenda "grade fixa de 2 dias".
- v1: oportunidade com exatamente 28 dias cai fora da régua e entra no texto "passaram de 28 dias", que para ela não é verdade; valor negativo cai no mesmo contador.
- v1: o `demonstrates` diz "n no subtítulo", e o n calculado está na linha de leitura e na legenda, não no subtítulo.
- v2: os tiques de 1 a 12 e a contagem sobre cada pilha saem sem unidade (NUM-6); a unidade está escrita uma vez na legenda, que faz o papel de título do eixo.
- v2: a legenda lista "com agenda" antes de "sem agenda", e na pilha o vazado fica em cima (ROT-4 pede a ordem visual); a forma diferente impede a troca.
- v2: o rótulo da fila de revisão (linha de base em 16 px) e a contagem da pilha de 7 tentativas dividiriam cerca de 4 px de tinta se a pilha mais alta estivesse dentro da fila; não acontece com o dado padrão.
- v2: o contorno do ponto cheio é `--surface-raised`, e sobre o fundo `--surface-sunken` da fila ele aparece como um anel mais claro no tema escuro.
- v2: a dica é o `<title>` nativo do SVG, não `ChartTooltip` (DIC-2); está declarado no `notes` e nada essencial vive só nela.
- v3: os tiques de 40 a 200 e o rótulo "teto de capacidade: 120" saem sem unidade (NUM-6); a unidade está na linha de leitura e na legenda.
- v3: quantil fora da régua de 40 a 200 é desenhado fora da área útil, sobre a coluna das contagens, sem corte nem aviso; o dado padrão tem amostra de 201 e só não mostra o caso porque o quantil de 97,5% dá 188,3.
- v3: o nome do cenário traz número ("Mais 30% de mídia") e o `<text>` dele não tem `tabular-nums` (TIP-1).
- v3: a linha de simulação ausente escreve `formatUnavailable()` sem o ícone `Unplug` (EST-2).
- v4: o contorno de 1 px na cor do cartão tira meio pixel de raio de todo ponto, e o parcial pequeno paga mais (GEO-16). Medido no `preview.svg`: o resto de 2 tem raio 3,25 e raio visível 2,75 contra 6,77 do ponto inteiro, ou 16,5% da área onde o valor pede 20%; resto de 3 mostra 26,5% contra 30%. O número está escrito ao lado, por isso não reprova; o ponto parcial não encosta em vizinho e pode sair sem contorno.
- v4: a legenda ocupa três linhas (ROT-4 fala em até duas); mede 56 px de 318 do corpo, abaixo dos 30%.
- v4: a nota "o pictograma da família 22 serve melhor" fala com quem monta a tela, não com quem lê; ao colar no Farol ela sai do cartão.
- v4: a última faixa vai de 90 a 100 e tem 11 pontos de pontuação, uma a mais que as outras, com a mesma largura no desenho.
- v4: com todas as faixas em zero o total é 0 e a linha de leitura divide por ele; falta a guarda nesse ramo.

**Revisão de 2026-10-05, segunda passada, só a `v3` depois da correção.** O bloqueante da primeira passada foi resolvido: `over` é `number | null`, o cenário sem amostra vai para o fim sem contagem, e a frase acessível e a linha de leitura saem só dos cenários simulados. A `v3` está aprovada. O que segue não reprova.

- v3: continuam valendo as quatro observações da primeira passada (tiques e rótulo do teto sem unidade, quantil fora da régua de 40 a 200 desenhado sobre a coluna das contagens, nome do cenário sem `tabular-nums`, ausência sem o ícone `Unplug`); nenhuma aparece no preview com o dado padrão.
- v3: com cenário sem amostra, a frase acessível diz quantos ficaram "sem simulação, fora da ordem" mas não diz qual; o nome só está no desenho, que é `aria-hidden`.
- v3: a mesma frase escreve "cenário" no singular para qualquer quantidade ("2 cenário sem simulação") e abre com o total de cenários "em 20 desfechos simulados cada", contando também os que não têm desfecho.
- v3: com todos os cenários sem amostra, o corpo ainda desenha a régua, o teto e uma linha `simulação indisponível` por cenário, em vez de um estado único no lugar do gráfico.
