# Linha em degrau

## O que é

A linha fica horizontal até a próxima mudança e salta na vertical: afirma que não existe valor
intermediário entre um patamar e o outro. O valor vale a partir da data do registro
(`type="stepAfter"`), nunca antes, e o eixo de tempo numérico faz a largura de cada degrau
respeitar a duração real entre mudanças, não a contagem de eventos. O modelo absorve a área em
degrau, que empilha patamares por função a partir do zero.

## Quando usar

* Valores que mudam em instantes discretos: teto de agendas por semana, tamanho de equipe, preço
  de serviço, meta revisada.
* Capacidade em degrau contra uma demanda contínua, na mesma unidade e no mesmo eixo.
* Composição de equipe por função ao longo do ano, empilhada em área em degrau a partir do zero.
* De 2 a 6 mudanças por série; acima disso, ou a densidade de eventos pede outra escala de tempo.

## Quando evitar

* Grandeza contínua amostrada, como entradas diárias ou CPL: use `01_linha-simples`.
* Mudança de posição num ranking: use `08_bump-chart`.
* Faixa aceitável que não muda no tempo: use `ReferenceArea` em `01_linha-simples`.
* Estado categórico ao longo do tempo (ativo, pausado): use o tracker de
  `24_microvisuais-sparklines`.

## Anatomia

1. **Eixo x numérico de tempo.** `XAxis type="number" domain={['dataMin', 'dataMax']} scale="time"
   dataKey="ts"`, com `ts` calculado por `new Date(dateString).getTime()` a partir da data
   `YYYY-MM-DD` do dado; o tique volta para `YYYY-MM` por `new Date(ts).toISOString().slice(0, 7)`
   e passa por `formatMonthShort`, sem depender do fuso do navegador.
2. **Eixo y quantitativo do zero.** `domain={[0, ceiling]}` com `ceiling` derivado do maior valor,
   `allowDecimals={false}` e de 3 a 5 linhas de grade redondas.
3. **Linha ou área `type="stepAfter"`.** O patamar vale a partir da data do registro; `stepBefore`
   só quando o valor vale até a data, o que nenhuma versão daqui usa.
4. **Ponto final repetido na data de corte.** Sem ele o último patamar vira um ponto sem largura;
   a v1 e a v3 acrescentam essa linha fora do dado de entrada.
5. **Motivo na dica.** Como o valor sozinho não diz por que mudou, um `Tooltip content` próprio lê
   `payload[0].payload` e monta os itens do `ChartTooltip` com o texto do motivo, em vez do
   conteúdo padrão do Recharts.
6. **No máximo duas anotações.** A maior mudança (v1) ou a faixa de um evento que afeta todas as
   séries (v3, férias coletivas) levam anotação; as demais mudanças ficam só na dica.
7. **Duas mudanças na mesma data.** Resolvidas pela ordem de registro no `data.ts`, nunca por outro
   critério: a v3 monta o valor vigente de cada categoria varrendo o array em ordem e mantendo o
   último valor escrito para aquela data.

## Versões

* [`v1_teto-de-capacidade-da-pre-vendas`](./v1_teto-de-capacidade-da-pre-vendas/): teto de agendas
  por semana da pré-vendas, de 2026-01 a 2026-09, a cada contratação ou saída. Demonstra
  `type="stepAfter"`, o ponto final repetido na data de corte, o eixo numérico de tempo e o motivo
  de cada mudança na dica, com a maior mudança anotada.
  ([preview escuro](./v1_teto-de-capacidade-da-pre-vendas/preview.svg) ·
  [preview claro](./v1_teto-de-capacidade-da-pre-vendas/preview-claro.svg))
* [`v2_capacidade-contra-demanda-semanal`](./v2_capacidade-contra-demanda-semanal/): demanda
  semanal de entradas contra o teto de capacidade, no mesmo eixo e na mesma unidade. Demonstra o
  teto em `--line-strong` como série de comparação e a demanda em `--chart-1`, as semanas acima do
  teto marcadas com símbolo e excedente escrito, e a frase acessível com o total de semanas fora
  do teto.
  ([preview escuro](./v2_capacidade-contra-demanda-semanal/preview.svg) ·
  [preview claro](./v2_capacidade-contra-demanda-semanal/preview-claro.svg))
* [`v3_equipe-por-funcao-em-area-degrau`](./v3_equipe-por-funcao-em-area-degrau/): tamanho da
  equipe de pré-vendas, vendas e atendimento em área empilhada em degrau. Demonstra o domínio a
  partir do zero, a união das datas de mudança das três funções num único eixo, a queda e a volta
  das férias coletivas como faixa anotada, e duas mudanças na mesma data (uma correção) resolvidas
  pela ordem do registro.
  ([preview escuro](./v3_equipe-por-funcao-em-area-degrau/preview.svg) ·
  [preview claro](./v3_equipe-por-funcao-em-area-degrau/preview-claro.svg))

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e ajuste o
   import do dado.
2. Ligue `data` (e, na v2, `capacitySteps`; na v3, `cutoffDate`, `vacationStart` e `vacationEnd`)
   ao seletor real da página.
3. A data de corte (v1 e v3) é o dia de hoje na página real, não uma constante fixa: derive-a do
   relógio do servidor ou do filtro de período, nunca de `new Date()` dentro do próprio `Chart.tsx`
   (proibido pela seção 10 do `CONTRATO.md`).
4. Dê altura ao pai (`h-64` a `h-80`) e embrulhe em `VisualCard` com `metricId`.
5. Confira o recorte com uma mudança só (o degrau vira uma reta) e o recorte vazio, que aqui vira o
   bloco `role="status"` no lugar do gráfico.

## Referências

* [Nightingale, Step Aside Line Graphs And Bar Charts! This Is a Job For Me](https://nightingaledvs.com/step-charts/):
  observar juros, temporadas e níveis sem valor intermediário.
* [Vega-Lite, Step Chart](https://vega.github.io/vega-lite/examples/line_step.html): observar
  `interpolate: step-after`.
* [Recharts, Line API](https://recharts.github.io/en-US/api/Line/): observar os tipos `step`,
  `stepBefore` e `stepAfter`.
* [Recharts, Area API](https://recharts.github.io/en-US/api/Area/): observar `type="stepAfter"` e
  `stackId` para a área em degrau empilhada.
* [Datylon, 80 types of charts and graphs](https://www.datylon.com/blog/types-of-charts-graphs-examples-data-visualization):
  observar o step line chart entre as formas temporais.
* Arquivo do Farol: [`app/src/components/visuals/charts/chartTheme.ts`](../../../../app/src/components/visuals/charts/chartTheme.ts),
  origem de `useAnimateOnce`, `AXIS_PROPS` e das cores de token usadas em toda versão.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. As três versões passaram sem bloqueante; o que segue é nuance._

* **v1, v2 e v3:** o tique do eixo de valor sai só com o algarismo, sem a unidade que a NUM-6
  pede em todo lugar em que o número aparece. A leitura não sofre, porque o rótulo direto e a
  linha de leitura escrevem "agendas", "entradas" e "pessoas".
* **v1:** a frase acessível passa o motivo por `toLowerCase()`, então o leitor de tela ouve
  "contratação de dois sdrs". Preservar a caixa da sigla soaria melhor.
* **v1:** o caso de uso impresso sob o título traz "2026-01 a 2026-09", e a NUM-7 reserva
  `YYYY-MM` ao dado e ao documento, não à tela. O texto vem do catálogo e ficou como está.
* **v2:** o rótulo direto do teto escreve só o valor, "12 agendas", e deixa o nome da série por
  conta da unidade. Um prefixo "Teto" tornaria a identificação independente disso.
* **v2:** o catálogo diz que as semanas acima do teto são marcadas "com ponto"; o desenho usa
  triângulo, que é o que o README já chama de símbolo. Não muda a leitura.
* **v2:** a frase acessível afirma "a maioria após o corte de capacidade" tomando o último degrau
  como corte. Vale para o dado fixo; com um último degrau de alta, a frase manteria a palavra.
* **v3:** `buildRows` consome os eventos na ordem do array e para no primeiro de data diferente,
  ou seja, assume o `data` já cronológico, enquanto a v1 e a v2 ordenam a prop recebida. Dado
  fora de ordem perderia eventos em silêncio.
* **v3:** a mudança dupla de 2026-03-02 volta ao valor anterior, então a técnica que ela ensina
  não aparece no desenho, só na dica e no `data.ts`.
* **v3:** a legenda usa `gap-1.5` entre a amostra e o texto, contra os 10 px da tabela 17.7.
