# ECDF e histograma acumulado

## O que é

A escada que sobe a cada observação, do menor valor ao maior, com o eixo vertical de zero a cem por
cento. Não depende de bin nem de banda e mostra todo o dado de uma vez, o que a torna a resposta mais
honesta para "quantos casos ficam abaixo do SLA".

Custa intuição. É menos familiar que o histograma e, sem o par de guias rotulado no cruzamento, a
curva não vira frase. O par de guias não é enfeite: é o tradutor da peça.

## Quando usar

- Responder que percentual dos casos fica abaixo ou acima de um limiar: SLA, prazo, teto de CPL.
- Comparar de 2 a 4 grupos ou períodos sem escolher bin, lendo a distância horizontal na altura
  de 50%.
- Métrica muito assimétrica, na versão "ou mais" com eixo horizontal logarítmico avisado no rótulo.
- Qualquer tamanho de amostra; acima de dezenas de milhares, reamostrar em uns 200 quantis.

## Quando evitar

- Procurar moda, pico ou bimodalidade óbvia: histograma (modelo 01) ou densidade (06).
- Casos ainda sem desfecho, como oportunidades abertas: curva de sobrevivência (11).
- Público que nunca viu curva acumulada e não terá nota de leitura: histograma com estatística
  anotada (01).
- Concentração do total por entidade: curva de Lorenz (10) ou Pareto na família 08, modelo 04.
- Percentis desenhados ao longo do tempo: faixa em área na família 05, modelo 05.

## Anatomia

1. **Sentido escrito acima do gráfico**: "até" ou "ou mais". A mesma curva de cabeça para baixo
   responde a outra pergunta, e nada no desenho denuncia a troca.
2. **Degrau, nunca reta ligando pontos.** Entre duas observações não existe caso nenhum, e a reta
   inclinada inventaria os que faltam. **Qual degrau depende do sentido:** a forma "até" é
   `stepAfter`, porque a fração de casos com valor menor ou igual a x é constante no intervalo que
   **começa** numa observação; a forma "ou mais" é `stepBefore`, porque ali ela é constante no
   intervalo que **termina** numa observação. Trocar os dois desloca a curva de um degrau inteiro.
3. **Ponto desligado**: o degrau já é o dado; a bolinha só engorda a linha.
4. **Marcas do eixo vertical em 0, 25, 50, 75 e 100%**, que são as âncoras de leitura.
5. **Grade nos dois sentidos**, em `--line-subtle`, sem tique e sem linha de eixo. Os dois eixos
   deste modelo são quantitativos e lidos por posição, e a leitura é do cruzamento, então a grade
   transversal é a régua do desenho e não sujeira (EIX-3b, emenda de 2026-09-28).
6. **Par de guias no limiar e no percentual**, com o rótulo no cruzamento, desenhado à mão e
   deslocado da altura do ponto para a guia não atravessar as letras.
7. **Registros sem a medida fora da curva** e contados no rodapé, nunca somados em silêncio.
8. **Altura do eixo horizontal em constante do topo do arquivo**, nunca menos de 23 px: o rótulo
   nasce a `tickMargin` da linha e a tinta de 11 px mede cerca de 15 px (EIX-6b). Canvas maior não
   resolve, porque o plano em `flex-1` absorve a altura extra e empurra o rótulo junto.

## Versões

- `v1_sla-de-primeiro-contato`: 480 leads do mês, minutos até o primeiro contato humano. 71% recebem
  contato dentro do SLA de 30 minutos, 137 esperam mais que isso, o caso mais demorado esperou 317
  minutos, e 37 leads sem nenhum contato ficaram fora da curva.
- `v2_histograma-acumulado-com-tres-limiares`: a mesma escada em barras de 5 minutos, com a soma
  acumulada feita em TypeScript e o sentido como parâmetro de 1 ou menos 1. Três limiares medidos, 5
  minutos, 30 minutos e 2 horas, marcados na coluna que termina em cada um e escritos num bloco de
  três rótulos empilhados à direita do plano. Faixa aberta no fim, que é o que fecha a soma em 100%.
- `v3_cpl-ou-mais-em-escala-log`: acumulada descendente do CPL de 1.100 campanhas, com eixo
  horizontal logarítmico avisado no rótulo e escada de tiques derivada do dado na malha 1, 2, 5.
  Reamostrada em 200 degraus de quantil, com o erro vertical medido e escrito no rodapé. 47
  campanhas sem lead e 19 com custo zero ficam fora do log e são contadas em nota.
- `v4_massa-no-zero-e-abertas-fora`: acumulada da receita por oportunidade encerrada, em que 41% das
  244 fecharam em R$ 0, medido, e a curva nasce nessa altura com rótulo próprio no salto. Domínio do
  eixo fixo em passos de R$ 100 mil, e as 87 oportunidades abertas fora da conta, apontadas para a
  curva de sobrevivência.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. A função `ecdf` colapsa empates: cada valor distinto vira um ponto, já com o acumulado. Um ponto
   por observação empilharia degraus de altura zero no mesmo x e engordaria o SVG sem mudar a tela.
3. O ponto inicial com fração zero existe para a curva nascer no eixo, e na `v4` ele é o que dá traço
   ao salto do zero medido. Sem ele o degrau começa na primeira observação, e o gráfico parece ter
   perdido a origem.
4. A guarda de vazio testa **a lista que alimenta as contas**, nunca o array de pontos: o derivado
   pode nascer não vazio a partir do domínio, e a guarda apoiada nele nunca dispara. Toda agregação
   devolve `number | null` e nunca `0`, porque percentual sem base não é zero, é ausência.
5. As contagens de quem fica fora da curva (`WITHOUT_CONTACT`, `WITHOUT_LEADS`, `ZERO_COST`,
   `WITHOUT_OUTCOME`) não somem em silêncio: quem sai da conta sem nota empurra o percentual para
   cima de graça, que é o erro mais confortável de todos.
6. Na `v3`, a reamostragem é por **posto**, e a fração de cada ponto desenhado é contada no começo do
   bloco de empates, não no posto sorteado: o que a reamostragem corta são degraus, nunca a altura de
   um degrau que ficou.
7. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
8. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Pendências conhecidas

- **A região de decisão fica espremida no eixo linear.** Com a cauda indo a 317 minutos e o SLA em
  30, toda a leitura útil acontece nos primeiros 17% da largura. A curva está certa e a cauda é
  honesta, mas a peça pede a versão logarítmica quando o limiar for muito menor que o máximo, que é
  exatamente a v3 deste modelo. Cortar o eixo em 120 minutos resolveria a estética e esconderia os
  casos que o SLA existe para pegar.
- As marcas do eixo horizontal da `v1` são forçadas de hora em hora. Com o passo automático o Recharts
  saltava de 90 em 90 minutos, e o leitor ficava sem âncora para localizar os 30 do SLA.
- **A `v1` está na fila de dívida da guarda `EIXO-CALMO`, com dois achados**, um por eixo: ela espalha
  `AXIS_PROPS` e não sobrepõe `axisLine`, que no módulo compartilhado vem ligado. As v2, v3 e v4
  escrevem `axisLine={false}` depois do espalhamento, em cada eixo. O conserto da `v1` é de uma linha
  por eixo e derruba duas linhas da fila.

## Defeitos do acervo que estas versões não herdaram

Registrados aqui porque o vizinho propaga defeito, e a regra vence o exemplo.

- **Grade em um sentido só.** A `EIX-3b`, reescopada em 2026-09-28, passou a **obrigar** grade nos dois
  sentidos onde os dois eixos são quantitativos e lidos por posição, e nomeia a ECDF como um dos
  casos. Seguem com `vertical={false}`:
  `04_ecdf-e-histograma-acumulado/v1_sla-de-primeiro-contato/Chart.tsx` linha 134, e as quatro versões
  de `01_histograma`, entre elas `v4_receita-com-massa-no-zero/Chart.tsx` linha 341. As v2, v3 e v4
  deste modelo desenham a grade cheia.
- **`tickMargin` ausente.** A `EIX-5` fixa 8 px e a `v1` não declara nenhum, herdando o padrão da
  biblioteca. As três versões novas declaram `tickMargin={8}` nos dois eixos.
- **Altura do eixo horizontal não declarada.** A `EIX-6b` é de 2026-09-28 e a `v1` é anterior a ela,
  então a `v1` não tem constante de altura de eixo X. As três versões novas têm `X_AXIS_HEIGHT = 26`,
  que é `tickMargin` de 8 mais cerca de 15 px de tinta, com a conta escrita no comentário.
- **Guia que atravessa a marca.** Medido nesta leva, contra os tokens do Farol: nenhum token se vê ao
  mesmo tempo sobre a coluna de `--chart-1` e sobre o cartão. `--text-muted` mede 5,21:1 e 5,37:1
  contra o cartão e 1,82:1 e 1,12:1 contra a coluna; `--line-strong` mede 5,32:1 e 3,27:1 contra a
  coluna e 1,79:1 e 1,83:1 contra o cartão. Por isso a `v2` marca o limiar com ponto sobre o topo da
  coluna, e não com guia vertical: o ponto vive contra o cartão, e o anel de 1,5 px na cor do cartão o
  separa da coluna por baixo (COR-5). Onde a marca é linha e não área preenchida, como nas v1, v3 e
  v4, a guia em `--line-strong` continua válida, porque ali ela é estrutura de referência e não marca
  de dado.

## Referências

- Catálogo: [Observable Plot, bin transform com cumulative](https://observablehq.com/plot/transforms/bin): observar o `cumulative: -1` invertendo a acumulada para "ou mais".
- Catálogo: [From Data to Viz, cumulative distribution](https://www.data-to-viz.com/caveat/cumulative.html): observar a comparação entre acumulada e densidade na mesma amostra.
- Praticante: [Claus Wilke, Fundamentals of Data Visualization, ecdf e quantil](https://clauswilke.com/dataviz/ecdf-qq.html): observar a defesa da ECDF como representação sem parâmetro e a passagem para o Q-Q.
- Praticante: [Stephen Few, Distribution Displays (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/distribution_displays.pdf): observar a comparação por tarefa entre histograma, box e quantile plot.

## Correção de 2026-09-28

**v1, a guia horizontal atravessava as letras do rótulo.** O rótulo do cruzamento usava o `label` de
objeto do `ReferenceDot` com `position: 'right'`, que herda o y do ponto; como o ponto está
exatamente sobre a guia horizontal, a tracejada passava dentro de "71% em até 30 min", nos dois temas
e pior no claro.

O rótulo passou a ser desenhado à mão, por função de render que recebe o `viewBox` do ponto, e desce
16 px. O número saiu de medição no preview, não de estimativa: a guia cai em 151 px e a linha de
grade de 50% em 175 px, um corredor de 24 px; com 12 px a tinta ainda ficava a 3 px da guia, porque a
base central não deixa a tinta simétrica em torno da âncora; com 16 px ela mede de 159,5 a 167,5 px,
com 8 px livres acima e 7 px abaixo, iguais nos dois temas. O rótulo ganhou de passagem os algarismos
tabulares que a TIP-1 pede e que o `label` de objeto não trazia.

**v1, o recorte vazio desenhava um SLA medido.** `share` devolvia `0` quando não havia nenhum lead,
então as duas guias se cruzavam na origem e o rótulo escrevia "0% em até 30 min", isto é, um SLA
reprovado onde não houve medição. Agora `share` é `number | null`; sem base, a guia horizontal e o
ponto não são desenhados e a frase acessível diz que o percentual fica indisponível.
