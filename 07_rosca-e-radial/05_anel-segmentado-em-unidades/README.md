# Anel segmentado em unidades

## O que é

Um anel dividido em N segmentos exatamente iguais, cada um representando uma única unidade
contável (uma agenda, um dia útil, uma reunião), colorido por status e com a contagem escrita no
centro. Ao contrário da rosca de composição (`01_rosca-com-total-central`), aqui o ângulo de
cada gomo não carrega valor nenhum: todo segmento tem o mesmo tamanho, e a leitura é contar
segmentos coloridos, não estimar proporção de arco. Junta a leitura de unidades da família
`22_unidades-waffle-e-pictograma` à forma circular. Como cada gomo vale sempre a mesma coisa,
todo cartão deste modelo escreve, em número, quanto é essa unidade (1 segmento = 1 agenda, 1 dia
útil ou 1 reunião), porque a contagem só é honesta se o valor do gomo estiver dito, não
subentendido. Fica legível até cerca de 40 segmentos: acima disso o vão entre gomos come a
proporção da fórmula e o segmento vira fio (`v4`).

## Quando usar

- Contagem pequena contra um total discreto e fixo, como 12 de 20 agendas de uma meta semanal.
- Unidades com até 3 status (por exemplo, realizada, marcada, faltante) em que cada segmento
  precisa ser identificável a olho, não só somado.
- Calendário curto de dias úteis de um mês (até uns 23 dias), um estado por dia, como SLA
  cumprido ou estourado.
- Meta discreta que pode ser ultrapassada, com o excedente declarado à parte do anel (`v4`).

## Quando evitar

- Mais de 40 unidades: os segmentos e o vão entre eles ficam finos demais para contar; usar
  waffle (`22_unidades-waffle-e-pictograma`).
- Valor contínuo ou fracionário, como reais ou horas: o modelo assume unidade inteira e igual;
  usar progresso circular (`13_progresso-meta-e-gauge`).
- Muitas pessoas ou filas lado a lado, cada uma contra a própria meta: bullet em lista ou tabela
  com barra (`13` ou `14`) leem mais rápido que vários anéis pequenos lado a lado.
- Mais de 3 status coloridos no mesmo anel: a contagem por cor se perde na mistura, e o objetivo
  de "contar, não estimar" deixa de valer.

## Anatomia

1. **Segmentos de valor 1.** Cada unidade é um item do `Pie` com `dataKey={() => 1}`: o ângulo
   de todo gomo é igual, porque o que varia é a cor, nunca o tamanho.
2. **Vão calculado por N.** `paddingAngle = Math.min(3, 120 / N)`, para o vão fixo de 3 graus não
   comer proporção demais quando N cresce (o vão vira competitivo com o próprio segmento acima de
   umas 40 unidades, o limite do modelo).
3. **Sem `cornerRadius`.** Arredondar a ponta de um segmento curto o transforma em pílula e
   engana o olho sobre onde o gomo começa e termina.
4. **Cor por status, nunca por posição.** Igual à `COR-3`: a cor vem do campo de status do dado
   (`row.done`, `row.status`), nunca do índice no array. Nas versões deste modelo, `--chart-1` ou
   `--positive` marcam o estado cumprido, `--line-strong` ou `--negative` o estado neutro ou de
   risco, e um segmento sem preenchimento (`fill` ausente, `stroke` em `--text-muted`) marca o
   estado que não conta para o total (faltante, sem expediente).
5. **Centro com a contagem, nunca decorativo.** `Label` com `content` lendo o `viewBox` do `Pie`
   (o mesmo padrão de `01_rosca-com-total-central`), sempre no formato "X de Y", nunca só X.
6. **O valor do segmento, escrito.** Uma linha de texto fixa (`text-muted`, 11 px, `aria-hidden`
   porque a frase acessível da raiz já diz o mesmo) declarando quanto vale um segmento: "cada
   segmento do anel vale 1 agenda", "1 dia útil", "1 reunião até o teto de 40". É a exigência
   deste modelo que o `check` não mede: um anel de unidades sem essa frase pode ser lido como uma
   rosca de proporção, e as duas formas respondem perguntas diferentes.
7. **Excedente fora do anel.** Quando o total real passa do teto de segmentos legíveis (`v4`), o
   excedente nunca vira um segmento a mais: sai como selo textual próprio, com sinal e ícone, ao
   lado do anel.

## Versões

- **[`v1_agendas-da-meta-semanal/`](./v1_agendas-da-meta-semanal/):** a forma básica, 20 agendas
  da meta semanal de uma SDR, 12 marcadas até quarta-feira, sem rótulo por segmento e com a
  legenda declarando o valor do segmento. Preview: [escuro](./v1_agendas-da-meta-semanal/preview.svg) · [claro](./v1_agendas-da-meta-semanal/preview-claro.svg).
- **[`v2_agendas-em-tres-status/`](./v2_agendas-em-tres-status/):** as mesmas 20 agendas em três
  status (realizada, marcada, faltante), com a faltante desenhada só de contorno e a meta escrita
  abaixo da contagem central. Preview: [escuro](./v2_agendas-em-tres-status/preview.svg) · [claro](./v2_agendas-em-tres-status/preview-claro.svg).
- **[`v3_sla-diario-do-mes-por-fila/`](./v3_sla-diario-do-mes-por-fila/):** três anéis de 22
  segmentos (os dias úteis de junho), um por fila, mesmo diâmetro e mesma ordem de dias, com o
  feriado fora da contagem central de cada fila. Preview: [escuro](./v3_sla-diario-do-mes-por-fila/preview.svg) · [claro](./v3_sla-diario-do-mes-por-fila/preview-claro.svg).
- **[`v4_quarenta-unidades-e-excedente/`](./v4_quarenta-unidades-e-excedente/):** o caso limite
  do formato, 40 segmentos no teto de legibilidade representando a meta trimestral, com as 3
  reuniões que passaram da meta declaradas num selo fora do anel, nunca como um 41º segmento.
  Preview: [escuro](./v4_quarenta-unidades-e-excedente/preview.svg) · [claro](./v4_quarenta-unidades-e-excedente/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e troque o
   array fictício pelo dado real, mantendo o mesmo formato (`id` mais o campo de status).
2. Se o total de unidades do recorte real puder passar de 40, mantenha o padrão da `v4`: fixe o
   anel no teto de segmentos legíveis e desenhe o excedente como selo à parte, nunca como gomo
   extra; abaixo de 40, a `v1` ou a `v2` bastam conforme o número de status.
3. A frase que declara o valor do segmento (peça 6 da Anatomia) é texto fixo por versão, não
   calculado: ao adaptar para outra unidade (dia, contrato, ligação), reescreva a frase junto, e
   confira que ela ainda bate com o `dataKey` do `Pie`.
4. Em telas com mais de um anel lado a lado (padrão da `v3`), dê à linha da grade altura
   suficiente para o menor dos anéis não encolher pela largura: `aspect-square` corta pelo lado
   que faltar espaço.

## Referências

- [Recharts, Pie Chart with gap and rounded corners](https://recharts.github.io/en-US/examples/PieChartWithPaddingAngle/): `paddingAngle` e `cornerRadius`, ponto de partida do modelo (aqui sem `cornerRadius`, para o segmento curto não virar pílula).
- [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): a regra de números inteiros para grades de unidades que justifica `dataKey={() => 1}` em vez de valor proporcional.
- [Storytelling with Data, what is a unit chart](https://www.storytellingwithdata.com/blog/what-is-a-unit-chart): a legenda que diz o que cada unidade representa, base da peça 6 da Anatomia.
- Estudo de origem: [`_estudo/familias/07_rosca-e-radial.md`](../../_estudo/familias/07_rosca-e-radial.md), seção 13 (Anel segmentado em unidades).

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. Nenhum item abaixo reprova versão; ficam registrados para a próxima
passada do produtor._

- **Todas as versões:** a amostra da legenda é um círculo (`rounded-full`), não a forma do
  segmento do anel. A `ROT-4` pede amostra na forma da marca e o `meta.json` da `v2` chega a
  anunciar "amostra na forma do segmento". A leitura não se perde, porque a ausência já vem
  vazada e a contagem está escrita ao lado, mas a promessa e o desenho ainda não batem.
- **Todas as versões:** o estado vazio traz a frase em `role="status"`, como a `EST-1` manda,
  sem o ícone lucide `Filter` de 16 px que a mesma regra cita.
- **v3:** a nota fixa diz "cada segmento do anel vale 1 dia útil", e a frase acessível fala em
  22 dias úteis, mas um dos 22 segmentos é o feriado sem expediente, que o próprio centro tira
  da conta (21). Vale trocar a palavra por "1 dia do calendário útil do mês" ou dizer que 1 dos
  22 está fora da contagem.
- **v4:** o centro, o selo e a frase acessível vêm das constantes `totalRealizado` e
  `metaTrimestral` do `data.ts`, não do array recebido pela prop `data`. Com o dado fixo do
  preview os números batem; quem colar no Farol e passar outro recorte vê o anel mudar de
  tamanho e os números do centro ficarem parados.
- **v4:** o selo imprime "+3 acima da meta" sem o substantivo na mesma linha (`NUM-6`). A
  unidade aparece no centro e na nota, então a leitura não fica ambígua no cartão inteiro.
