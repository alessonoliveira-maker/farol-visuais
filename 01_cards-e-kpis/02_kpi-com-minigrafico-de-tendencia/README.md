# KPI com minigráfico de tendência

## O que é

Um número em destaque acompanhado de um minigráfico subordinado que responde uma pergunta só: qual é a forma recente da série. A sparkline não substitui o gráfico grande da tela; ela é do tamanho de uma palavra e existe para dizer, de relance, se a curva é subida firme, queda ou serra. O modelo absorve a sparkline de linha, a sparkbar de colunas, a sparkline comparativa contra o mesmo período do ano anterior e a fita de estado por dia; linha e coluna saem do Recharts dentro de um contêiner de altura fixa, a fita sai em HTML com Tailwind.

## Quando usar

* A forma da série recente muda a conclusão: subida firme, queda ou serra, não só o valor do último ponto.
* Série com cadência fixa e pelo menos 5 pontos, legível em cerca de 32 px de altura.
* Contagem discreta por dia útil, semana ou campanha, em que a altura de cada coluna importa mais que a trajetória contínua.
* Série sazonal comparada com o mesmo período do ano anterior, com peso visual menor na referência.
* Cumprimento diário de SLA ou de coleta, em que importa saber se as falhas vieram em bloco ou espalhadas.

## Quando evitar

* Menos de 5 pontos ou série sem cadência fixa: KPI simples com variação (modelo 01).
* A sparkline seria o visual inteiro de uma célula de tabela: microvisuais e sparklines (família 24).
* O leitor precisa julgar nível absoluto com escala livre: ou fixa o domínio no zero, ou escreve a faixa por extenso.
* Mais de duas séries dentro do mesmo minigráfico: linhas (família 04).
* Fita com mais de cerca de 90 células: mapa de calor e calendário (família 15).
* Muitos cartões comparáveis entre si na mesma tela: grade de scorecards com escala comum (modelo 07).

## Anatomia

1. **Rótulo** da métrica, truncado se necessário, em `text-text-secondary`.
2. **Número** em `kpi-number text-3xl font-semibold text-text-primary`, formatado por `@/lib/format` conforme a unidade.
3. **Minigráfico** sem eixo, sem grade e sem dica, em contêiner de altura fixa (`min-h-8`). Linha e coluna usam `recharts-nativo`; a fita de estado usa `html-tailwind` com `flex gap-px`.
4. **Ponto ou coluna final** destacado em `--chart-1`, ligado por cor ao número acima.
5. **Variação ou rótulo direto** com sinal tipográfico, ícone do `lucide-react` e cor pela polaridade declarada em `goodDirection`; base sempre nomeada na mesma linha.
6. **Âncora temporal** no rodapé: datas de início e fim por `formatDate` ou `formatMonthShort`, ou o critério de alinhamento quando há duas séries.
7. **Ausência tratada por regra própria:** mês sem coleta quebra a linha (`null`, sem `connectNulls`); dia sem coleta na fita ganha contorno tracejado neutro; fim de semana sai do denominador.
8. **Frase acessível** na raiz (`role="group"`, `aria-label`), calculada do dado, com o minigráfico em `aria-hidden` porque a frase já traz a tendência.

## Versões

* **[`v1_cpl-qualificado-com-sparkline-de-12-meses`](v1_cpl-qualificado-com-sparkline-de-12-meses/)**: sparkline de linha em Recharts sem eixo nem grade, ponto final aceso em `--chart-1`, polaridade menor melhor na variação e um mês sem coleta que quebra a linha em vez de interpolar.
* **[`v2_entradas-no-handoff-contra-o-teto-diario`](v2_entradas-no-handoff-contra-o-teto-diario/)**: sparkbar em Recharts com domínio a partir do zero, `ReferenceLine` tracejada no teto diário e as colunas que estouram o teto acesas em `--negative`, com a contagem de dias fora do teto escrita no número.
* **[`v3_leads-diarios-contra-o-mesmo-periodo-de-2025`](v3_leads-diarios-contra-o-mesmo-periodo-de-2025/)**: sparkline comparativa com a série anterior neutra e tracejada atrás da atual, domínio comum às duas séries e o pico isolado de campanha na série anterior anotado em vez de recortar a escala.
* **[`v4_sla-de-primeiro-contato-em-fita-com-lacunas`](v4_sla-de-primeiro-contato-em-fita-com-lacunas/)**: fita de 60 dias em HTML com quatro estados por célula, fim de semana e o maior vão sem coleta fora do denominador, e o percentual escrito com o par de dias válidos.

## Como colar no Farol

1. Escolha `v1` ou `v3` quando o minigráfico for uma linha contínua; `v2` quando for contagem discreta por dia; `v4` quando a pergunta for cumprimento de régua, não tendência de valor.
2. Ao ligar o dado real, mantenha a mesma forma do tipo exportado por `data.ts` (`series`, `days` ou `current`/`previous`); o seletor da página monta esse objeto a partir do registry de métricas.
3. O contêiner do minigráfico exige altura mínima explícita (`min-h-8` ou maior) no pai; sem isso o `ResponsiveContainer` do Recharts desenha zero.
4. Para grades de vários cartões (caso denso do 1.4, 1.5, 1.19 e 1.31 no estudo), calcule o domínio do eixo sobre o conjunto inteiro antes de passar `data` a cada cartão, para a comparação entre cartões ser legítima (EIX-9).
5. A fita da v4 não usa `ChartTooltip`: a dica por célula é o atributo `title` nativo, mais barato e mais acessível que montar tooltip do Recharts para 60 barras iguais.

## Referências

* Praticante: [Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/). Ponto final ligado ao número e proporção de leitura da forma.
* Implementação: [Recharts, TinyLineChart](https://recharts.github.io/en-US/examples/TinyLineChart/) e [TinyBarChart](https://recharts.github.io/en-US/examples/TinyBarChart/). Esqueleto sem eixos usado nas versões 1 e 2.
* Implementação: [Tremor, spark chart](https://www.tremor.so/docs/visualizations/spark-chart) e [Tremor, componente Tracker](https://www.tremor.so/docs/visualizations/tracker). Dimensionamento do minigráfico e anatomia da fita de estado da versão 4.
* Implementação: [shadcn/ui, código do Line Chart Multiple](https://raw.githubusercontent.com/shadcn-ui/ui/main/apps/v4/registry/new-york-v4/charts/chart-line-multiple.tsx). Esqueleto de duas séries adaptado na versão 3, com o peso visual invertido entre atual e anterior.
* Praticante: [Edward Tufte, Overlapping data graphics to make comparisons](https://www.edwardtufte.com/notebook/overlapping-data-graphics-to-make-comparisons/). Sobreposição de séries como método de comparação, base da versão 3.
* Catálogo: [Data Viz Project, Sparkline](https://datavizproject.com/data-type/sparkline/) e [Column Sparkline](https://datavizproject.com/data-type/column-sparkline/). Definição e distinção de uso entre linha e coluna.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-09-18, com `npm run check` em `0 com erro` (2 avisos, nenhum de erro) e os dois PNGs de conferência olhados nas quatro versões. As quatro estão aprovadas; nenhum item abaixo reprova. A pendência de 2026-09-17 sobre a contagem de dias do cabeçalho da `v3` saiu da lista porque já está em `formatInt` com algarismo tabular._

* `v1`: a frase acessível termina sempre em "com um mês sem coleta no meio", mesmo quando o `data` recebido não traz nenhum `value: null`; o trecho poderia sair do dado, como o resto da frase.
* `v1`: o render mede diferença acima de 0,5% entre o SVG sozinho e a página nos dois temas, e a diferença está no subtítulo da moldura, não no Chart. É deslocamento de subpixel do texto da ferramenta compartilhada `_render`; a versão em si sai idêntica.
* `v2`: a `ReferenceLine` do teto não leva rótulo com nome e valor (ANO-2); o número só aparece na linha de texto acima do minigráfico, que já resolve a leitura.
* `v2`: a linha de referência usa `--line-strong`, enquanto a tabela 17.2 reserva `--text-muted` para o papel de referência; a leitura não muda, mas o token diverge do papel. A seção 7 lista `--line-strong` como linha de referência, então a divergência é do contrato consigo mesmo.
* `v2`: o `meta.json` diz que a contagem de dias fora do teto está escrita no rodapé; ela está no número grande, junto do percentual.
* `v3`: o anel que marca o pico de campanha não tem rótulo próprio; quem identifica o anel é a nota do rodapé, o que funciona mas deixa a anotação dependente do texto.
* `v3`: o campo `alignment` do `data.ts` não é lido pelo componente; o rodapé escreve "alinhado por dia da semana" em texto fixo.
* `v4`: "até 4 h" sai por interpolação direta do número, sem `formatHours` e sem classe de algarismo tabular (TIP-1).
* `v4`: a célula de fim de semana em `--surface-sunken` mede cerca de 1,14:1 contra o cartão no tema escuro e quase desaparece, junto com a amostra dela na legenda. Nada essencial depende só dessa cor: o denominador vem escrito no número e "sem coleta" tem contorno próprio.
* `v4`: a frase acessível cita só o maior vão sem coleta, de 5 dias; a série tem dois vãos de 5 dias, e o `useCase` fala em duas semanas.
* `v4`: o `useCase` de 122 caracteres é cortado pela moldura do render, que para em duas linhas, e o preview perde o final "no meio?". O defeito é da ferramenta compartilhada `_render`, e o contorno dentro da pasta é encurtar o `useCase`.
* `v4`: a legenda fica abaixo da fita, enquanto a ROT-4 pede acima ou ao lado; a ordem das amostras segue a leitura das células e o entendimento não muda.
* `v1` e `v3`: com `data` de série vazia o cartão não troca o corpo por um bloco `role="status"` como a EST-1 pede e como a `v2` e a `v4` fazem; a `v1` escreve indisponível e mantém o contêiner do gráfico vazio, e a `v3` imprime total zero com a nota de que falta base para comparar. O dado fixo do preview nunca cai nesse caminho.
* `v2`: a marca semântica `--negative` vive no corpo do minigráfico, o que está correto porque a leitura não depende só dela (o par escrito e a linha de teto repetem a informação) e nenhuma cor categórica 2 ou 4 aparece junto, como a COR-8 exige.
