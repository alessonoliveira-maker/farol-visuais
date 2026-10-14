# KPI com faixa de incerteza ou distribuição

## O que é

Um número que não pode ser publicado como ponto único sem mentir sobre a própria natureza. Duas famílias de caso convivem no mesmo modelo. A primeira é o cenário ou a projeção: o ponto médio publicado sozinho vira compromisso, então a faixa (o mínimo e o máximo do intervalo) é o número principal, e uma régua em SVG puro mostra a largura relativa contra um domínio declarado, nunca contra a própria faixa. A segunda é o tempo ou o valor de cauda longa (tempo até o primeiro contato, ciclo de venda, ticket): a média é puxada pela cauda e descreve um caso raro, então o número principal é a mediana, com o p90 ao lado em peso menor e uma régua mínima que marca a faixa interquartil. Nos dois casos a premissa ou o método do cálculo aparece escrito em uma linha; sem isso a faixa parece rigor sem ser.

## Quando usar

- Forecast, cenário ou projeção da Diretoria, em que publicar o ponto médio viraria compromisso.
- Três cenários, conservador, base e otimista, com a indicação de qual deles virou meta.
- Tempos e valores assimétricos, como tempo até o primeiro contato, ciclo de venda e ticket.
- A mesma estatística comparada entre etapas, com réguas de teto declarado e SLA marcado.

## Quando evitar

- Dado já realizado e fechado: use o KPI simples com variação (modelo 01).
- Faixa que acompanha uma série no tempo: vá para área com banda (família 05).
- Distribuição completa com caixa, atípicos e forma: use distribuição (família 16).
- Menos de 30 observações para percentil alto: publique a mediana com o par e suprima o p90.
- Faixa sem a premissa que a gerou: parece rigor sem ser; escreva a premissa ou não publique.

## Anatomia

1. **Rótulo com a natureza do número:** "projeção", "cenário", "mediana"; `text-xs font-medium text-text-secondary`.
2. **Número principal:** a faixa escrita por extenso ("R$ 6,8 mi a R$ 8,3 mi") ou a mediana isolada, sempre em `kpi-number text-3xl leading-none font-semibold`; sem cálculo possível, `Unplug` mais `formatUnavailable()` no lugar, nunca zero.
3. **Régua em SVG puro, viewBox não uniforme:** linha de base e pontas em `--line-strong`, representando um domínio declarado (zero ao teto do plano, ou zero ao maior p99 arredondado) que nunca é a própria faixa ou a própria amostra.
4. **Marca de intervalo ou de dispersão:** retângulo cheio em `--chart-1` para a faixa de cenário; retângulo em `--line-strong` para a faixa interquartil (p25 a p75), com marcas verticais mais curtas nas duas pontas; como o neutro de dado só vale com o valor escrito (seção 17.2 do contrato), o cartão escreve p25 e p75 por extenso junto da régua.
5. **Ponto central ou mediana, com peso menor que a faixa:** corte fino na cor do cartão (`--surface-raised`) atravessando a marca, para não competir peso visual com o intervalo.
6. **Marcador do p90, quando existe amostra suficiente:** círculo em `--chart-1` com contorno na cor do cartão, desenhado num SVG próprio (nunca dentro do viewBox esticado da régua, que transformaria o círculo em elipse); abaixo de 30 observações some e o cartão escreve "amostra pequena".
7. **Referência tracejada:** meta, teto, SLA ou realizado anterior em `--text-muted`, traço `3 3`, cruzando a régua inteira.
8. **Amostra e exclusões declaradas:** "n = 412 leads" ao lado do rótulo; casos fora da conta (abertos, censurados) nomeados por extenso, nunca silenciados.
9. **Premissa ou método:** uma linha em `text-text-muted` com a premissa do cenário ou o método de interpolação dos quantis; sem premissa, o cartão avisa que a faixa não deve ser publicada.
10. **Etiqueta de procedência:** PREMISSA ou DERIVADO no cabeçalho, quando a moldura é `stage` e o próprio Chart é o cartão inteiro (seção 13 do contrato); nos casos sem campo de procedência no dado (tempos de etapa), a etiqueta não é desenhada.

## Versões

- `v1_receita-projetada-de-2027-em-faixa`: a projeção de 2027 como faixa de R$ 6,8 mi a R$ 8,3 mi, domínio até o teto do plano, ponto central em traço fino e a premissa da capacidade de pré-vendas escrita. Previews: [escuro](./v1_receita-projetada-de-2027-em-faixa/preview.svg) e [claro](./v1_receita-projetada-de-2027-em-faixa/preview-claro.svg).
- `v2_tres-cenarios-e-o-que-virou-meta`: três cenários (conservador, base, otimista) na mesma escala relativa, cada um com forma própria além da cor, o cenário meta em destaque e a distância calculada até as duas pontas. Previews: [escuro](./v2_tres-cenarios-e-o-que-virou-meta/preview.svg) e [claro](./v2_tres-cenarios-e-o-que-virou-meta/preview-claro.svg).
- `v3_tempos-da-esteira-em-mediana-e-p90`: tira de três etapas da esteira (primeiro contato, agenda, aceite do handoff) com mediana, p90, faixa interquartil, SLA tracejado e amostra por etapa, todas na mesma escala até o maior p99 arredondado. Previews: [escuro](./v3_tempos-da-esteira-em-mediana-e-p90/preview.svg) e [claro](./v3_tempos-da-esteira-em-mediana-e-p90/preview-claro.svg).
- `v4_retorno-que-cruza-zero-e-amostra-pequena`: dois casos limite lado a lado, um retorno projetado entre −0,3x e 1,4x que cruza o empate em zero (com a marca do zero em `--line-strong`) e um ciclo de venda medido em só 14 casos, com o p90 suprimido e as oportunidades ainda abertas declaradas fora da conta. Previews: [escuro](./v4_retorno-que-cruza-zero-e-amostra-pequena/preview.svg) e [claro](./v4_retorno-que-cruza-zero-e-amostra-pequena/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`. As quatro versões são moldura `stage`: vão direto na grade, numa célula com altura definida pela página (`h-80` cobre confortavelmente a v1 e a v2; a v3, mais larga, pede uma coluna de 2 a 3 células e `h-72`; a v4 pede `h-72` a `h-80`). Três das quatro subiram o canvas acima do preset sugerido pelo catálogo, cada uma com a razão escrita no `notes` do `meta.json`.
2. Passe o dado real pela prop `data`, sempre com o domínio declarado explícito (`domain.max` ou `domain.min`/`domain.max`) vindo da configuração da métrica, nunca calculado a partir do próprio intervalo ou da própria amostra.
3. Na v3, o teto comum (maior p99 arredondado) e os quantis por etapa são recalculados no componente a partir da série crua; se a página já traz os percentis prontos da consulta, troque `summarizeStage` por uma função que só valida o formato, para não recalcular o que o banco já entregou.
4. Etiqueta de procedência: quando o cartão vier com `provenance` no dado (v1 e v2), ela é do próprio Chart por estar em moldura `stage`; nos cartões de tempo (v3 e v4, cauda longa) não há campo de procedência e nada é desenhado no lugar.
5. Estados vazio e indisponível já estão inline com `role="status"` e `formatUnavailable()`; ao colar, troque pelo `EmptyState`/`UnavailableState` do Farol mantendo o texto, e rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, conferindo os dois temas e 390 px de largura.

## Referências

- [SWD, visualizing uncertainty](https://www.storytellingwithdata.com/blog/2018/6/27/visualizing-uncertainty). Formas de mostrar intervalo sem assustar o público executivo.
- [FlowingData, Visualizing the Uncertainty in Data](https://flowingdata.com/2018/01/08/visualizing-the-uncertainty-in-data/). Repertório de formas de incerteza e o custo de cada uma.
- [FT Visual Vocabulary, README](https://github.com/Financial-Times/chart-doctor/blob/main/visual-vocabulary/README.md). Categoria distribuição e o lugar das formas de intervalo.
- [Figma Community, KPI Charts](https://www.figma.com/community/file/1130917765288346079/kpi-charts). Tratamentos de faixa e marcador em componentes de cartão.
- [Google SRE Book, Monitoring Distributed Systems](https://sre.google/sre-book/monitoring-distributed-systems/). A seção "Worrying About Your Tail": o exemplo de latência média enganosa e a coleta por faixas.
- [Grafana, Calculation types](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/calculation-types/). A lista de reduções (média, mediana, percentis), prova de que a estatística do número é uma escolha declarada.
- [Grafana, Stat](https://grafana.com/docs/grafana/latest/panels-visualizations/visualizations/stat/). O número único com a opção de cálculo que reduz a série a um valor.
- [Data Viz Catalogue, Box Plot](https://datavizcatalogue.com/methods/box_plot.html). Mediana, quartis e atípicos, que a régua da v3 resume em quatro marcas.
- [Stephen Few, Introducing Bandlines, em PDF](https://www.perceptualedge.com/articles/visual_business_intelligence/introducing_bandlines.pdf). Quartis e mediana como fundo para ler magnitude, parente próximo desta régua.

## Observações da revisão (não bloqueantes)

- `v1_receita-projetada-de-2027-em-faixa`: o número da premissa ("240 entradas por mês") sai em Manrope sem `tabular-nums` (TIP-1); o mesmo vale para "16%, 18% e 21%" na v2 e para "n = 14" no aviso da v4.
- `v1_receita-projetada-de-2027-em-faixa`: o rótulo "centro" some quando a referência cai dentro da faixa, e o corte passa a ser explicado só pela linha de leitura.
- `v2_tres-cenarios-e-o-que-virou-meta`: o halo em `--surface-raised` sobre a faixa em `--surface-sunken` deixa manchas retangulares visíveis em volta de "R$ 6,8 mi" e "R$ 7,4 mi" no tema escuro.
- `v2_tres-cenarios-e-o-que-virou-meta`: o rótulo de valor não alinha pela ponta; um cenário perto do teto transbordaria o cartão (v1, v3 e v4 já usam `EDGE_FRACTION`).
- `v2_tres-cenarios-e-o-que-virou-meta`: a faixa entre os cenários em `--surface-sunken` é marca de dado sem papel na tabela 17.2 e quase não se separa do cartão no tema escuro; a leitura dela depende do número escrito acima.
- `v2_tres-cenarios-e-o-que-virou-meta` e `v4_retorno-que-cruza-zero-e-amostra-pequena`: sem premissa, o cartão só omite a linha, em vez de avisar que a faixa não deve ser publicada, como fazem a v1 e a Anatomia, item 9.
- `v3_tempos-da-esteira-em-mediana-e-p90`: no terceiro cartão o SLA de 8 h cai sobre o traço do p75, e as duas marcas viram uma linha só.
- `v3_tempos-da-esteira-em-mediana-e-p90`: o ponto do p90 e o corte da mediana não têm rótulo na régua e se identificam só pelo valor escrito acima; `--line-strong` faz dois papéis no mesmo visual (trilho do domínio e faixa p25 a p75).
- `v3_tempos-da-esteira-em-mediana-e-p90`: o `data.ts` não exercita caso difícil (as três etapas têm n acima de 30 e nenhuma é nula), então o caminho "amostra pequena, sem p90" não aparece no preview.
- `v3_tempos-da-esteira-em-mediana-e-p90`: a frase acessível põe maiúscula no meio da oração ("a mais lenta é Do primeiro contato à agenda").
- `v4_retorno-que-cruza-zero-e-amostra-pequena`: com amostra suficiente, o cartão do ciclo mantém o ícone de alerta e escreve "Amostra suficiente para publicar o p90", mas não publica o p90.
- `v4_retorno-que-cruza-zero-e-amostra-pequena`: a frase acessível diz "p90 não calculado" enquanto a tela diz "não publicado", e as 9 oportunidades abertas não são citadas; ela já tem 244 caracteres, e um rótulo mais longo passa do teto de 250 (ACE-1).
- `v4_retorno-que-cruza-zero-e-amostra-pequena`: o ícone de alerta em `--warning` fica no mesmo matiz do selo PREMISSA do cartão vizinho.
- `v1_receita-projetada-de-2027-em-faixa`: `percent()` escreve a fração crua no `left` (56.66666666666667%), enquanto a v3 arredonda em `pct()`; não muda a tela, só destoa entre versões irmãs.
- `v2_tres-cenarios-e-o-que-virou-meta`: dois algarismos "1" vizinhos em Space Grotesk ("11%", "R$ 12,0 mi") parecem um número riscado a 11 px; é traço da fonte, não do componente, e vale medir se o par precisa de mais espaço.
- `v3_tempos-da-esteira-em-mediana-e-p90`: a grade é fixa em `grid-cols-3`, mas a prop `data` aceita qualquer quantidade de etapas; com 2 ou 4 etapas a tira desalinha.
- `v4_retorno-que-cruza-zero-e-amostra-pequena`: a marca do zero é desenhada antes da faixa e fica coberta por ela no trecho central; sobram 2 unidades acima e abaixo, que quase não se veem no tema escuro.
