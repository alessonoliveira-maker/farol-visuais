# Curva de Lorenz

## O que é

Entidades ordenadas da menor para a maior, com a fração acumulada de entidades no eixo horizontal e a
fração acumulada do total no vertical. A diagonal é a igualdade perfeita, em que todas valem o mesmo,
e a área entre ela e a curva mede a concentração, resumida no Gini (zero é igualdade, um é todo o
total numa entidade só). Responde quanto do total vem de poucos: receita por cliente, investimento
por campanha. Sai do `ComposedChart` do Recharts com `Line` linear para a curva, e `Area` em par
quando a sombra entre a curva e a diagonal faz parte da leitura. O plano é quadrado de 0 a 100% nos
dois eixos, porque a diagonal só vale 45 graus se os lados forem iguais.

## Quando usar

- Mostrar a concentração de um total entre dezenas a milhares de entidades (as versões têm de 377 a
  1.100).
- Comparar a concentração de dois períodos ou duas carteiras, com o Gini de cada um na legenda.
- Transformar a curva em frase de negócio: 10% dos clientes respondem por 52% da receita.
- Abrir a lista das entidades que concentram o total a partir de uma faixa da curva.

## Quando evitar

- Poucas entidades, como 8 executivos: a curva vira degraus grossos e o Gini fica enviesado. A `v4`
  trata abaixo de 20 com pontos e sem Gini; barras ordenadas (família 02) lê melhor.
- Nomear quem concentra, entidade por entidade: Pareto na família 08, modelo 04.
- Total com muitos lançamentos negativos, como estornos: a curva desce e perde a leitura. A `v4`
  deixa o negativo fora da conta e o conta em nota.
- Distribuição de uma medida por caso, sem pergunta de concentração: histograma (modelo 01) ou ECDF
  (modelo 04).

## Anatomia

1. **Função `lorenz`**: ordena em ordem crescente, acumula e devolve `null` sem entidade ou com total
   zero (EST-1b). O Gini sai da soma dos trapézios sob a curva, G = 1 − 2A, no dado cheio.
2. **Plano quadrado**: os dois eixos de 0 a 100% com `formatPercent(valor, 0)`, grade nos dois
   sentidos (EIX-3b, os dois eixos são quantitativos e lidos por posição) em `GRID_COLOR`. O quadrado
   vem da conta de margens, com eixo Y de 44 px mais 8 de margem direita contra 12 em cima, eixo X de
   26 e 14 embaixo, 52 dos dois lados, e do `aspect-square` do contêiner.
3. **Diagonal tracejada** em `--line-strong`, `Line` sobre `equal = x`: é estrutura de referência, não
   marca de dado.
4. **Curva** em `--chart-1`, traço de 2 px, `type="linear"`: entre dois clientes não há dado, e uma
   suavização inventaria concentração que não existe.
5. **Sombra** em `--surface-sunken`, opaca e na camada -150, abaixo da grade. `fillOpacity` em
   `--chart-1` não passa de 3:1 contra o cartão (ACE-5), e o `Area` do Recharts pinta a 0,6 se a
   prop não vier explícita.
6. **Leitura dos maiores**, desenhada pelas escalas do gráfico (`useXAxisScale`, `useYAxisScale`,
   `usePlotArea`) numa `ZIndexLayer` de 450, acima das linhas: barra do ponto da curva até 100% em
   `--text-primary`, ponto com anel da cor do cartão e frase com halo.
7. **Legenda com Gini e n** acima do plano, com amostra na forma da marca.

## Versões

- `v1_concentracao-da-receita-por-cliente`: 640 clientes, `quadrado`. Os 10% maiores respondem por 52%
  da receita, Gini 0,57, com barra, ponto e frase de leitura.
- `v2_ano-anterior-contra-atual`: dois anos no mesmo quadrado, 598 e 640 clientes. 2024 em
  `--text-muted`, 2025 em `--chart-1` e só ele sombreado. Os 10% maiores passam de 45% a 55% (+10 p.p.),
  e o Gini de 0,49 a 0,59. Curvas numa grade comum de 101 posições, Gini do dado cheio.
- `v3_investimento-de-midia-por-campanha`: 1.100 campanhas, `card`. 12% das campanhas, 134, consomem
  pelo menos 70% do investimento. Curva simplificada de 1.100 para 28 pontos por Ramer, Douglas e
  Peucker com erro vertical de até 0,2 p.p., Gini no dado cheio, faixa clicável e botão que chamam
  `onOpenList`.
- `v4_estornos-e-clientes-sem-receita`: 400 registros, 23 estornos fora da conta e 113 clientes sem
  receita mantidos, 30% dos 377 que ficam. A curva corre rente ao eixo até 30%, a faixa nomeia os 113,
  e a nota diz que sem os zeros o Gini seria 0,58 e não 0,70. Canvas de 480 por 540.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. Passe a lista de valores por entidade em `data`, um número por cliente ou campanha, sem agrupar:
   a ordenação é parte da conta e acontece no componente. A `v2` recebe `{ previous, current }` com o
   rótulo de cada ano.
3. O quadrado depende de `aspect-square h-full` no contêiner do gráfico e de a soma de margens e
   eixos ser igual nos dois sentidos (52 px). Mudou o `YAxis width`, a altura do eixo X ou a margem?
   Refaça a conta, ou o plano deixa de ser quadrado.
4. A `ZIndexLayer` exige Recharts 3.4 ou mais (o Farol está na 3.10.1). Em versão anterior, o que um
   componente próprio desenha cai abaixo da `Area` e a sombra apaga a leitura.
5. Na `v3`, ligue `onOpenList` à abertura da lista: recebe a quantidade de campanhas da faixa. Sem
   callback o botão e a faixa não fazem nada.
6. Na `v4`, o ramo de menos de 20 entidades só aparece com `data` curta; o dado padrão não o desenha.
7. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
8. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Referências

- Catálogo: [Wikipedia, Lorenz curve](https://en.wikipedia.org/wiki/Lorenz_curve): observar a definição por acumulada e a relação com o coeficiente de Gini.
- Praticante: [World Bank, Measuring inequality](https://www.worldbank.org/en/topic/poverty/brief/measuring-inequality): observar o uso da curva e do Gini em comparação entre países.
- Método: Ramer, Douglas e Peucker, simplificação de polilinha por desvio máximo, usada na `v3` para reamostrar o dado cheio.
- Farol: `app/src/components/visuals/charts/chartTheme.ts` para `AXIS_PROPS` e `GRID_COLOR`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, quatro versões julgadas. A `v3` foi reprovada por tique perdido no eixo X, e o
parecer está em `validation/revisao_16_distribuicao__10_curva-de-lorenz_2026-10-05.md`. O que segue não reprova.

- `v1`, `v2`, `v3`, `v4`: o tique `100%` do eixo X é desenhado 10,3 px à esquerda da linha de grade dele (na `v1`, texto em 271,7 e grade em 282), porque a margem direita de 8 px não comporta meia largura do rótulo. Lê sem dúvida nas três aprovadas; na `v3` é o que derruba o tique de 75%. Quem tocar o arquivo sobe a margem direita e refaz a conta do quadrado.
- `v1`, `v2`, `v3`: a função `lorenz` descarta valor negativo em silêncio (`filter(value >= 0)`). O n impresso continua honesto, mas só a `v4` conta o que saiu. Vale uma nota quando houver negativo no dado.
- `v1`, `v4`: legenda com uma série de dado e a diagonal de referência. A ROT-1 preferiria rótulo direto na diagonal; fica porque o catálogo pede o Gini e o n na legenda.
- `v2`: as curvas saem de uma grade uniforme de 1%, e o último trecho, de 99% a 100%, vira uma corda reta com vértice visível perto de 75% no eixo vertical. O desvio é menor que 1 px na horizontal; a simplificação da `v3` resolveria.
- `v2`: `signedPoints` escreve `+0 p.p.` quando os dois anos empatam; sem variação, o sinal sobra.
- `v3`: o `notes` do `meta.json` fala em grade uniforme de 120 passos e erro calculado, e o código usa Ramer, Douglas e Peucker com 28 pontos e tolerância fixa de 0,2 p.p. Alinhar o texto ao código na correção.
- `v3`: a frase dentro do plano repete o número grande e a frase ao lado (12% das campanhas, 70%). O catálogo pede as duas coisas, mas a de dentro podia nomear a faixa em vez de repetir.
- `v3`: `R$ 2,5 mi de R$ 3,6 mi` dá 69% na conta de cabeça, ao lado de "pelo menos 70%". É arredondamento do formato compacto, não erro de conta.
- `v3`: o botão e a frase em `text-text-primary` trazem número sem `tabular-nums` (TIP-1), sem consequência no preview.
- `v3`, `v4`: na frase acessível, "12% do total" e "30% do total" querem dizer do total de campanhas e de clientes; ao lado de investimento e receita, o "total" fica ambíguo.
- `v4`: o ramo de menos de 20 clientes não aparece em nenhum preview, como o `meta.json` e este README declaram. Lido no código, ele desenha um ponto a mais, o da origem (0, 0), sob a legenda "cada cliente", e a amostra da legenda segue sendo traço quando a marca é ponto (ROT-4). Corrigir quando o ramo ganhar preview.
- `v4`: o halo do rótulo "113 clientes sem receita" é `--surface-raised` sobre a faixa `--surface-sunken`, e aparece como contorno claro em volta das letras nos dois temas. Legível; o halo na cor da faixa sumiria.

Revisão de 2026-10-05, segunda passada, só a `v3` (código mudou depois do veredito). O tique de 75% voltou com `interval={0}`, mas a `v3` segue reprovada: o `100%` do eixo X agora sai cortado na borda direita do quadrado, e o parecer está na segunda parte do mesmo arquivo em `validation/`. O que segue não reprova.

- `v3`: o `notes` do `meta.json` continua falando em grade uniforme de 120 passos e erro calculado; o código usa Ramer, Douglas e Peucker, 28 pontos e tolerância fixa de 0,2 p.p. Apontado na primeira passada e não alinhado.
- `v3`: a observação da primeira passada sobre o `100%` deslocado 10,3 px para a esquerda deixou de valer para esta versão, porque o rótulo agora fica centrado na linha dele; segue valendo para `v1`, `v2` e `v4`.
- `v3`: a frase acessível mantém "12% do total" para dizer 12% das campanhas, e o botão e a frase em `text-text-primary` seguem com número sem `tabular-nums` (TIP-1), sem consequência no preview.
- `v3`: se a correção levar a soma de margens da `v3` para 60 px, a Anatomia (item 2) e o passo 3 de Como colar, que dizem 52 para o modelo inteiro, precisam dizer que a `v3` difere.
