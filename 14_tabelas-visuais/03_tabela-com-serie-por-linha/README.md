# Tabela com sparkline ou tracker por linha

## O que é

Uma coluna de largura fixa com um micrográfico por linha da tabela: uma sparkline de linha com a
trajetória recente, ou uma fileira de blocos com o status de cada dia (tracker). O último ponto da
sparkline é marcado na cor de destaque e fica ao lado do número da coluna vizinha; o tracker traz um
resumo em texto que não depende da cor. O caminho de cada sparkline é calculado em TypeScript puro,
sem uma instância de gráfico por linha, e o cabeçalho da tabela diz sempre qual escala foi usada,
porque é ela que decide o que se pode comparar entre as linhas.

## Quando usar

* Mostrar a trajetória de 8 a 50 entidades ao lado do valor atual, em 8 a 26 períodos.
* Uma série com faixa aceitável comum a todas as linhas (SLA, taxa mínima), com os pontos fora dela
  destacados.
* Status diário ou semanal recente por entidade, com o resumo em texto ("26 de 30 dias no SLA").
* Uma tabela de acompanhamento em que a forma da série e o número atual precisam ficar lado a lado,
  sem abrir um gráfico à parte.

## Quando evitar

* **Pergunta sobre o valor de um ponto específico da série:** a sparkline não tem eixo nem grade;
  use a tabela de meses ou o heatmap (modelo 02 desta família).
* **Escala própria por linha quando a pergunta é magnitude entre linhas:** o modelo mente por omissão
  se não avisar. Ou a escala vira comum a partir do zero (versão 2), ou o cabeçalho diz em letras
  que a linha só mostra a forma daquela entidade, nunca serve para comparar volume com a vizinha
  (versões 1 e 4).
* **Série com menos de 3 pontos:** vira número com comparação (família 01), não sparkline.
* **Blocos de tracker abaixo de 4 px de largura:** agregue por semana antes de desenhar.
* **Micrográfico isolado, fora de tabela, em cartão ou texto corrido:** é a família 24.

## Anatomia

1. **Coluna de rótulo,** largura fixa, nome da entidade sem truncar (TIP-7): a coluna precisa caber o
   nome mais longo do recorte.
2. **Coluna do micrográfico,** largura fixa em pixel (`SPARK_WIDTH` ou blocos de `BLOCK_SIZE`), nunca
   responsiva a container query: a escala do desenho depende do pixel absoluto.
3. **Path da sparkline,** `M`/`L` calculado por função pura a partir do array de valores; sem área
   preenchida quando a escala não parte do zero (EIX-2).
4. **Último ponto,** círculo cheio em `var(--chart-1)`, sempre a mesma cor da linha (COR-1: uma série,
   uma cor).
5. **Banda de faixa aceitável (quando existe),** `rect` em `var(--surface-sunken)` atrás da linha,
   nas mesmas coordenadas de escala comum a todas as linhas.
6. **Ponto fora da faixa,** círculo em `var(--warning)`, nunca a única pista: o resumo da linha
   também conta quantas semanas ficaram fora.
7. **Blocos do tracker,** `div` de largura e altura fixas, vão de 2 px, cor por
   `var(--positive)`/`var(--warning)`/`var(--negative)` conforme o status do dia.
8. **Marca de lacuna e de calendário irregular,** círculo vazado em `var(--text-muted)` para semana
   sem carga de dado; traço tracejado na mesma cor para um período de recesso comum a todas as
   linhas; nenhum bloco desenhado para o período anterior à admissão da entidade.
9. **Coluna do valor atual ou do resumo,** número em `kpi-number`, alinhado à direita, com a unidade
   por `@/lib/format` (`formatInt`, `formatDecimal`).
10. **Nota de escala,** parágrafo de 11 a 12 px em `text-text-muted` acima da tabela, dizendo se a
    escala é própria por linha (leitura de forma) ou comum (leitura de magnitude).

## Versões

* **[`v1_agendas-semanais-por-sdr`](./v1_agendas-semanais-por-sdr/):** sparkline básica de 12 semanas
  por SDR, escala própria por linha declarada no cabeçalho como leitura de forma; último ponto ligado
  ao número da semana atual.
* **[`v2_sla-de-primeiro-contato-com-faixa`](./v2_sla-de-primeiro-contato-com-faixa/):** sparkline com
  escala fixa comum de 0 a 30 minutos e faixa aceitável de 0 a 15 sombreada em todas as linhas, com a
  contagem de semanas fora da faixa ao lado.
* **[`v3_tracker-de-sla-por-fila`](./v3_tracker-de-sla-por-fila/):** tracker de 30 dias por fila, com
  legenda de status, resumo em texto que não depende da cor e ordenação pela fila mais crítica.
* **[`v4_serie-curta-buraco-e-calendario-irregular`](./v4_serie-curta-buraco-e-calendario-irregular/):**
  caso limite com SDR recém admitido (sem traço antes da admissão), semana de recesso comum a todas
  as linhas e lacuna individual de dado, cada uma com marca própria e resumo com denominador ajustado.

Previews de cada versão: `v1_agendas-semanais-por-sdr/preview.svg` (e `preview-claro.svg`),
`v2_sla-de-primeiro-contato-com-faixa/preview.svg`, `v3_tracker-de-sla-por-fila/preview.svg`,
`v4_serie-curta-buraco-e-calendario-irregular/preview.svg`.

## Como colar no Farol

1. O `DataTable.tsx` do Farol já resolve ordenação, filtro e paginação da tabela em torno do dado:
   este modelo entra como o renderizador de uma célula ou de uma coluna inteira dentro dele, não como
   tabela nova (decisão da família, item 6).
2. A coluna do micrográfico usa largura fixa em pixel: ao colar, mantenha `SPARK_WIDTH` ou
   `BLOCK_SIZE` como constante do arquivo, e ajuste o valor à largura real da coluna no layout de
   destino, nunca a `width: '100%'`.
3. Quando a escala for própria por linha (versões 1 e 4), mantenha a frase de aviso acima da tabela:
   ela não é decoração, é a diferença entre o visual informar e o visual enganar.
4. Quando a escala for comum (versão 2) ou o tracker tiver status (versão 3), a legenda de cor entra
   uma vez para a tabela inteira, nunca linha a linha.
5. Ligue `data` ao seletor real da página (agendas por SDR, SLA por fila) mantendo o tipo exportado
   pelo `data.ts` da versão escolhida.

## Referências

* [Edward Tufte, sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/):
  último ponto marcado, faixa normal e proporção que deixa a inclinação legível; base das versões 1,
  2 e 4.
* [Stephen Few, escala de sparklines em dashboards](https://www.perceptualedge.com/articles/visual_business_intelligence/best_practices_for_scaling_sparklines.pdf):
  os cinco métodos de escala com o mesmo dado, origem da distinção entre escala própria (forma) e
  escala comum (magnitude) que este modelo obriga a declarar.
* [Recharts, Tiny Line Chart](https://recharts.github.io/en-US/examples/TinyLineChart/): o `LineChart`
  mínimo com `dot={false}`, referência de geometria para a versão sem gráfico dedicado.
* [Tremor, Spark Chart](https://www.tremor.so/docs/visualizations/spark-chart): `minValue`, `maxValue`
  e `connectNulls` expostos no micrográfico, base da lacuna individual da versão 4.
* [Tremor, Tracker](https://www.tremor.so/docs/visualizations/tracker): cor e recorte por bloco de
  status, base da versão 3.
* [Datawrapper Academy, tabelas com atualização contínua](https://www.datawrapper.de/academy/how-to-create-live-updating-tables):
  mini colunas, sparklines e heatmaps na mesma tabela.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19, sobre os PNGs de conferência dos dois temas. Nenhum destes pontos reprovou
uma versão; todos são acabamento ou oportunidade de melhoria._

* **v1, v2 e v4:** o ponto da última semana cai exatamente em `x = SPARK_WIDTH`, que é a borda do
  `viewBox`, então o círculo sai cortado ao meio e lê como um pequeno traço vertical. Vale também
  para o primeiro ponto fora da faixa da v2, em `x = 0`. Cabe reservar o raio do marcador nas duas
  pontas antes de distribuir o passo horizontal (ESP-3, nada encostado na borda).
* **v1:** o `aria-label` calculado fica no `<table>`, e a raiz do componente não tem `role` nem nome
  acessível; o mesmo vale para v2, v3 e v4. Funciona, mas a seção 11 do contrato pede a frase na
  raiz do visual.
* **v1:** o cabeçalho da coluna do micrográfico começa em minúscula ("últimas 12 semanas") enquanto
  a primeira coluna começa em maiúscula ("SDR"); é escolha de estilo, não muda a leitura.
* **v2:** os campos `lastX` e `lastY` são calculados por linha e nunca desenhados, então a versão
  fica sem o ponto final em `--chart-1` que o item 4 da Anatomia descreve; ou o ponto entra, ou a
  Anatomia registra que a versão de escala comum dispensa a marca.
* **v2:** a contagem de semanas fora e os limites da escala saem por `String()` no texto, não pelos
  formatadores de `@/lib/format` (a seção 8 pede `formatInt`). Com inteiros de uma casa o resultado
  impresso é o mesmo.
* **v2:** com o máximo da escala em 30 min e um valor de 29,1 min, o traço quase encosta no topo do
  `viewBox`; um respiro vertical igual ao `SPARK_PAD_Y` da v1 deixaria a linha solta da borda.
* **v3:** o número da coluna "dias no SLA" recebe `--negative` sempre que a fila teve algum estouro,
  então uma linha melhor aparece em vermelho (25 de 30) ao lado de uma pior em tom neutro
  (20 de 30). A cor conta o estouro, o número conta o acerto: convém colorir pelo próprio número ou
  levar a contagem de estouros para uma coluna própria.
* **v3:** os dias de "atenção" não entram nem no numerador nem na leitura do denominador do resumo,
  que só conta os dias dentro do SLA; a soma das três cores da legenda não aparece em texto.
* **v3:** o padrão do dado é `'EEADDD'.repeat(5)`, o que deixa toda linha perfeitamente periódica e
  faz o tracker parecer listrado; um padrão irregular exercitaria melhor a leitura de sequência.
* **v3:** a marca de hoje usa `boxShadow` com `inset`, que desenha um anel e não uma sombra, mas a
  leitura do COR-9 fica mais tranquila com `outline` ou um contorno explícito.
* **v4:** o círculo de lacuna em `--text-muted` com traço de 1 px fica discreto nos dois temas; em
  tela de 1x ele compete com a linha de base da tabela. Um raio um pouco maior ajudaria.
