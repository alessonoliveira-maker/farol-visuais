# Pareto

## O que é

Colunas em ordem decrescente com a quantidade ou o valor de cada categoria, e uma linha com o
percentual acumulado do total, de 0 a 100%, sobreposta num eixo direito. O eixo do acumulado é
derivado do eixo das colunas: fixando o eixo das colunas de zero ao total geral, a fração de
altura de cada coluna coincide com a fração de percentual da linha na mesma categoria, e a
primeira coluna toca o primeiro ponto da linha. Lê se poucas causas concentram a maior parte do
efeito: quantas categorias, a partir da maior, já respondem por 80% do total.

## Quando usar

- Priorizar causas que concentram o efeito: motivos de perda, motivos de desqualificação, origens
  de lead sem dado.
- De 4 a cerca de 12 categorias visíveis mais Outros no fim; cauda maior vai agrupada com a
  contagem no rótulo.
- Quantidade ou valor sempre positivos, com a pergunta de concentração explícita: quantos motivos
  fazem 80%.

## Quando evitar

- Menos de 4 categorias: barras ordenadas em `02_barras-horizontais/01_barras-simples-ordenadas`.
- Categorias com ordem própria, como etapas ou faixas de ticket: ordenar por valor destrói a
  ordem; use `03_colunas-verticais/01_colunas-simples`.
- Valores negativos ou estornos: a curva acumulada perde sentido; use
  `03_colunas-verticais/05_colunas-positivo-e-negativo` ou `19_cascata-waterfall`.
- Concentração de uma distribuição contínua, como ticket por cliente:
  `16_distribuicao/10_curva-de-lorenz`.
- Quantidade e valor misturados no mesmo gráfico: ordenam diferente; ofereça alternância.

## Anatomia

1. `ComposedChart` com dois `YAxis` por `yAxisId`: o das colunas (`qtd`), oculto, com domínio fixo
   de zero ao total geral; o do acumulado (`pct`), à direita, com domínio fixo de 0 a 100 e tiques
   redondos de 20 em 20.
2. `Bar dataKey="count" yAxisId="qtd"` numa cor só (`--chart-1`), sem destaque por categoria nesta
   versão básica; `Line dataKey="acumPct" yAxisId="pct"` na segunda cor categórica (`--chart-3`,
   ordem da COR-8).
3. Ordenação decrescente por quantidade com desempate estável por nome, e agrupamento de "Outros"
   sempre no fim, calculados em `buildParetoRows` antes do render, nunca por `sort` no JSX.
4. Acumulado somado sobre os valores brutos (contagem inteira), arredondado só na hora de formatar
   cada rótulo (`formatPercentPoints`).
5. Rótulo direto do valor no topo de cada coluna (contagem mais o substantivo "perdas", NUM-6), e
   rótulo do nome mais valor só no último ponto da linha (ROT-3), com halo contra a cor do cartão.
6. Dica única (`ChartTooltip`) com a contagem e a fatia percentual da categoria, mais o acumulado
   até ali, construída a partir do próprio `data` para não depender do tipo genérico do payload do
   Recharts (mesmo padrão de `01_coluna-com-linha`).
7. Linha de leitura no topo do corpo, calculada do dado: quantos motivos e quais somam a maior
   parte das perdas (ANO-5).
8. `data` vazio troca o gráfico inteiro por um bloco `role="status"` (EST-1).
9. Corte da regra de 80% como `ReferenceLine` no eixo do acumulado, com `ifOverflow="extendDomain"`
   (REC-1) e o rótulo numa margem reservada fora das marcas (REC-4, ANO-3). A contagem de motivos
   até o corte sai de um laço sobre as linhas já acumuladas, nunca de um índice escrito à mão.
10. Cor por categoria pelo `shape` da `Bar` com `Rectangle`, nunca por `Cell`: as marcas até o corte
    e os motivos nomeados ficam em `--chart-1`, a cauda agregada e o que passa do corte recuam para
    `--line-strong`, que só é permitido porque o valor está escrito em toda marca (isenção da ACE-3).
11. Cauda longa agregada numa marca final fora da ordenação, com a contagem de motivos agrupados na
    segunda linha do tique do eixo, e `minPointSize` para a categoria minúscula continuar visível.
12. Alternância entre duas grandezas da mesma perda em HTML (`role="radiogroup"`), com um painel por
    etapa lado a lado: o domínio do percentual acumulado é comum aos painéis (EIX-9) e o das marcas
    vai de zero ao total da própria etapa, que é o que mantém o pareto derivado em cada painel.

## Versões

- `v1_perdas-por-motivo`: perdas do trimestre por 4 motivos nomeados mais "Outros", em ordem
  decrescente. Demonstra a ordenação decrescente com desempate estável por nome (dois motivos
  fictícios empatados em quantidade), "Outros" sempre no fim mesmo sendo maior que a última
  categoria nomeada, o eixo das colunas fixado de zero ao total geral para a primeira coluna tocar
  o primeiro ponto da linha, e o acumulado somado sobre os valores brutos com arredondamento só na
  exibição.
- `v2_corte-em-80-por-cento`: os mesmos motivos com o corte da regra de 80% desenhado. Demonstra o
  corte calculado do dado (3 de 6 motivos, 81,5% acumulado), a cor por `shape` da `Bar` com o neutro
  depois do corte, a `ReferenceLine` no eixo do acumulado com o rótulo na margem esquerda reservada,
  e o peso do rótulo como segundo canal do destaque, dentro do teto de dois elementos em 700.
- `v3_quantidade-contra-valor-por-etapa`: um pareto por etapa do funil, lado a lado, com alternância
  entre quantidade e valor perdido. Demonstra que as duas grandezas ordenam diferente (Concorrência
  é o 4º motivo em quantidade na pré-vendas e o 1º em valor), o domínio comum de percentual entre os
  painéis, as barras horizontais para o nome caber inteiro, e o corte recalculado por etapa e por
  grandeza com a contagem escrita no título de cada painel.
- `v4_cauda-longa-e-poucos-motivos`: os 10 motivos de maior volume mais a cauda de 30 somada.
  Demonstra a contagem de motivos agrupados na segunda linha do tique da cauda, o `minPointSize` que
  mantém visível a coluna de 2 perdas em 308, a troca para colunas simples com aviso escrito abaixo
  de 4 motivos, e o estado vazio no lugar do gráfico quando o recorte não tem perda medida.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a página, por exemplo
   `app/src/pages/<pagina>/visuals/LossPareto/`.
2. Troque o `import` de `./data` pelo seletor da página (lista de motivos de perda com contagem) e
   passe `data` pela prop; o default do `data.ts` fica só como amostra do catálogo.
3. Dê altura ao pai (`<div className="h-64">`, por exemplo, para o canvas `card`) ou passe
   `height`.
4. Se a página trouxer mais de 8 categorias, agrupe a cauda em "Outros (n=X)" antes de passar
   `data`; o componente não faz esse agrupamento numérico sozinho, só respeita a flag `isOther`.
5. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- Catálogo: [Wikipedia, Pareto chart](https://en.wikipedia.org/wiki/Pareto_chart). Observar a
  definição, o eixo direito como percentual acumulado e o exemplo em que resolver as 3 primeiras
  causas reduz 78% do problema.
- Documentação: [Highcharts, Pareto chart](https://www.highcharts.com/docs/chart-and-series-types/pareto-chart).
  Observar a série de pareto derivada de uma série base de colunas (`baseSeries`), em 0 a 100% num
  segundo eixo oposto.
- Exemplo oficial: [Recharts, Vertical Composed Chart](https://recharts.github.io/en-US/examples/VerticalComposedChart/).
  Observar `layout="vertical"` para a variante horizontal com rótulos longos.
- Documentação: [Recharts, Bar API](https://recharts.github.io/en-US/api/Bar/). Observar `shape`
  como função para cor por item e `minPointSize` para categorias minúsculas da cauda.

## Observações da revisão (não bloqueantes)

- `v1_perdas-por-motivo`: o check acusa aviso `FRASE-ACESSIVEL` (ACE-1). A frase da raiz mede 239
  caracteres, a 11 do teto de 250, e cresce com o recorte, porque concatena os nomes dos 3
  primeiros motivos; com nomes longos ela estoura. Candidata a encurtar a enumeração.
- `v1_perdas-por-motivo`: `MAX_BAR_SIZE = 28` fica acima do teto de 24 em cartão da ESP-2. A
  espessura medida no PNG (cerca de 27 px) passa folgado no piso, então não prejudica a leitura,
  mas o número declarado contraria a régua.
- `v1_perdas-por-motivo`: o halo da ROT-7 no rótulo "45 perdas" apaga um trecho do primeiro
  segmento da linha do acumulado, logo depois do ponto inicial. O halo é obrigatório e o valor
  segue legível, mas a linha nasce com um vão visível nos dois temas.
- `v1_perdas-por-motivo`: precisão percentual mista. O tique do eixo direito sai inteiro (`0%`,
  `20%`) e o rótulo do último ponto e a linha de leitura saem com uma casa (`100,0%`, `66,0%`).
- `v1_perdas-por-motivo`: a linha de leitura fixa os 3 primeiros motivos em vez de dizer quantos
  motivos cruzam a concentração, que é a pergunta do modelo. O corte em 80% está planejado para a
  `v2`, então aqui o texto informa sem responder.
- `v1_perdas-por-motivo`: o visual não desenha grade. Com o eixo do acumulado à direita e sem
  linha de grade, conferir um ponto da linha contra o tique depende do olho; os tiques e os pontos
  batem no render, mas a grade horizontal facilitaria.
- Modelo: a EIX-8 do contrato proíbe eixo duplo, e o catálogo desta família justifica a exceção
  dizendo que o eixo do acumulado é derivado do eixo das colunas. A versão cumpre a justificativa
  (domínio das colunas de zero ao total, a 1ª coluna tocando o 1º ponto) e sinaliza a segunda
  escala pela cor do eixo igual à da linha. Fica registrada a tensão entre as duas réguas.
- Modelo, nas quatro versões: o `check` acusa aviso `CONTRASTE-MARCA` no `--line-strong` usado como
  preenchimento da marca neutra (1,79:1 no escuro, 1,83:1 no claro). É o mesmo uso do molde
  `02_barras-horizontais/01_simples-ordenada`, permitido pela isenção da ACE-3 porque o valor está
  escrito em toda marca; a guarda orienta e não reprova.
- Modelo: o primeiro ponto da linha cai por construção na ponta da primeira coluna ou barra. Na
  `v2` e na `v4` o rótulo da primeira coluna agora fica à esquerda dela, junto ao topo, fora do
  traço (a `v4` ganhou margem esquerda de 56 px para isso); na `v3` o rótulo "Acumulado 100,0%" foi
  para a direita do último ponto, em duas linhas, numa margem direita de 96 px. A `v1` mantém o
  cruzamento com halo.
- `v2_corte-em-80-por-cento`: a especificação da versão pede peso 700 no rótulo do destaque, e o
  grupo do corte tem 3 motivos. Pela TIP-3, que admite 700 em no máximo dois elementos, o 700 ficou
  no nome e no valor do motivo líder e o grupo do corte carrega 600 contra 400. O desvio está
  declarado na nota do `meta.json`.
- `v2_corte-em-80-por-cento`: a margem esquerda de 58 px cortava a primeira letra de "corte 80%" no
  render, com a soma por glifo prevendo 49,8 px de tinta. Ficou em 68 px. Margem e largura de eixo
  se superestimam, porque o erro só aparece depois da rodada de render.
- `v3_quantidade-contra-valor-por-etapa`: são duas anotações no visual, o rótulo do corte repetido
  em cada painel. É o teto da ANO-1, e a repetição é do pequeno múltiplo, não duas anotações
  concorrendo no mesmo plano.
- `v3_quantidade-contra-valor-por-etapa`: o preview mostra só a grandeza padrão, quantidade. A
  alternância para valor perdido muda a ordem dos motivos e a contagem do corte na etapa de vendas,
  de 4 para 3, e nenhuma guarda mede esse estado, porque o render fotografa o estado inicial.
- `v3_quantidade-contra-valor-por-etapa`: medido no render, em `ComposedChart` com
  `layout="vertical"` o primeiro item do array nasce **no alto**, e não na base. É o sentido que a
  emenda da REC-3 registra para o `BarChart` vertical, agora conferido também no combinado; a
  ordenação decrescente sai do jeito certo sem `reversed`.
- `v4_cauda-longa-e-poucos-motivos`: o eixo de nomes reserva 48 px, e não os 30 do tique de uma
  linha nem os 38 que a tinta de duas linhas sugere. Com 38 px o render acusou conteúdo 3 px abaixo
  da área do corpo, porque o grupo de tiques nasce abaixo da âncora do eixo. O número está descrito
  pela consequência medida, como manda a 14.1.
- `v4_cauda-longa-e-poucos-motivos`: com 11 categorias e o eixo das colunas de zero ao total, a
  coluna mais alta ocupa 19% do plano, então o desenho fica baixo e a curva ocupa o topo. É o preço
  do eixo derivado, que é justamente o que legitima a combinação nesta família; trocar por escala
  própria das colunas quebraria a leitura de que a 1ª coluna toca o 1º ponto.
- `v4_cauda-longa-e-poucos-motivos`: o preview mostra só o recorte cheio. Os dois outros caminhos,
  colunas simples abaixo de 4 motivos e estado vazio sem perda medida, existem no código e não são
  medidos por nenhuma guarda, porque o dado padrão nunca executa esses ramos.
- `v4_cauda-longa-e-poucos-motivos`: a EIX-7 fixa em 8 o teto de categorias com `interval={0}`, e
  esta versão imprime 11, que é o que o modelo declara aguentar em Quando usar. Com a banda de
  76,2 px o par mais apertado de tiques, "Sem retorno" contra "Concorrência", fica a 10,3 px de
  tinta contra tinta, e o `check` não acusou colisão.

2026-10-14, revisão independente de `v2`, `v3` e `v4` (as três reprovadas pela pergunta 31; o
bloqueante está em `validation/revisao_08_combinados-e-eixo-duplo__04_pareto_2026-10-14.md`). O que
segue não reprova:

- Modelo: pela exceção da marca fina da ROT-7, quem sai do lugar é o rótulo; `v2`, `v3` e `v4`
  foram corrigidas em 2026-10-14. A `v1`, aprovada em 2026-09-19 e não tocada, mantém o cruzamento
  do halo com a linha na primeira coluna.
- `v2`, `v3`, `v4`: TIP-1. Números em Manrope sem `tabular-nums` na linha de leitura (`v2`, `v4`), no
  título de cada painel e na linha do total (`v3`), e tiques do eixo de percentual sem `font-display`
  nas três. Sem consequência visível em texto de uma linha só.
- `v2`, `v4`: TIP-7. A linha de leitura usa `truncate` e a cauda dela carrega o número ("das 200
  perdas"); na `v3`, o mesmo vale para o título do painel ("3 motivos até 80%") e para a linha do
  total. Hoje tudo cabe; com nome de etapa ou recorte longo, a reticência come o número.
- `v2`, `v3`, `v4`: NUM-1. Precisão percentual mista no mesmo cartão: tique e corte inteiros,
  "Acumulado 100,0%" e linha de leitura com uma casa. A casa de 81,5% tem função, mostra que o
  acumulado passou de 80; a de 100,0% não tem.
- `v3`: a raiz `role="img"` envolve o `radiogroup` da alternância. Filho de `img` é apresentacional
  para leitor de tela, então o controle pode sumir para quem não enxerga a tela;
  `14_tabelas-visuais/06_tabela-cruzada-com-totais-marginais/v4` usa `figure` com `role="group"`.
- `v3`: etapa sem perda, ou com zero na grandeza escolhida, some do pequeno múltiplo sem aviso:
  `buildPanel` devolve `null`, o painel é filtrado, o outro ocupa a largura toda e a frase acessível
  também perde a etapa. Um painel com a frase de vazio no lugar diria que a etapa existe e zerou.
- `v3`: o total de cada etapa (170 e 40 perdas) não está escrito, e as barras medem a participação na
  própria etapa, então 62 e 14 perdas desenham quase o mesmo comprimento nos dois painéis. O rótulo
  absoluto sustenta a leitura, mas o volume da etapa só sai somando.
- `v3`: a frase acessível começa pela contagem ("2 gráficos de barras") e não nomeia o motivo líder
  de cada etapa, que é o que responde ao caso de uso; no preview, que mostra só quantidade, a
  resposta (Concorrência sobe do 4º para o 1º lugar na pré-vendas) depende de alternar.
- `v3`: `CUT_LABEL_GAP = 7` fica fora dos múltiplos de 2 px da ESP-1, sem consequência visível.
- `v3`: no modo valor, pela geometria do código, o primeiro rótulo da etapa de vendas (`R$ 3,4 mi`,
  a 10 px da ponta) fica a cerca de 1 px de o halo encostar na linha do acumulado. O render só
  fotografa quantidade, então essa medida é projeção, não render.
- `v4`: a frase acessível diz "mais a cauda somada" sem a contagem de 30 motivos, que só está no
  tique.

2026-10-14, segunda passada da revisão independente, depois da rodada de correção: `v2`, `v3` e
`v4` aprovadas, e o bloqueante da pergunta 31 está resolvido nas três (linha do acumulado contínua
nos dois temas, conferida no PNG ampliado). O que segue não reprova:

- `v2`, `v4`: o rótulo da primeira coluna sai do traço pela regra `index === 0`, e não por conta
  de colisão. Para o primeiro ponto a garantia é estrutural, porque a linha nasce nele e só segue
  para a direita; para os outros rótulos nada é calculado. Num recorte mais plano (na `v4`, líder
  abaixo de cerca de 14% do total com o segundo motivo perto dele) o halo do segundo rótulo passa
  a cruzar o primeiro trecho. A conta geral sugerida na rodada anterior (caixa do rótulo contra os
  segmentos vizinhos, escala fixa de 0 a 100) cobriria esse caso.
- `v2`, `v4`: `FIRST_LABEL_DROP` fixo em 12 px. Com a primeira coluna mais baixa que isso, o rótulo
  desce abaixo da base e encosta no tique do nome; a descida pode sair da altura da coluna.
- `v2`: o rótulo da primeira coluna agora ocupa a faixa esquerda, a mesma do `corte 80%`. Se o
  líder sozinho ficar perto de 80% do total, os dois se encontram na margem.
- `v4`: no modo de colunas simples, abaixo de 4 motivos, o rótulo da primeira coluna continua à
  esquerda dela, embora ali não haja linha; poderia voltar ao topo, como os outros. Ramo sem render.
- `v4`: a margem esquerda de 56 px estreitou a banda de 76,2 para cerca de 71,8 px. O par de tiques
  mais apertado, "Sem retorno" contra "Concorrência", mede agora 6,5 px de tinta a tinta (13 px no
  PNG 2x), e não os 10,3 px da observação anterior: acima do respiro de 4 px, mas um nome dois
  caracteres mais longo colide.
- `v2`, `v4`: TIP-6. Os tiques do eixo direito saem alinhados à esquerda (`100%` e `80%` não
  alinham pelo `%`); número em coluna pede alinhamento à direita.
- `v3`: a nota do `meta.json` ficou velha: fala em 80 px reservados à direita (hoje 96) e diz que o
  halo do rótulo de valor interrompe a linha na primeira barra, o que deixou de acontecer. O
  comentário de `PANEL_MARGIN` também atribui os 96 px ao rótulo de valor, quando quem pede a
  margem é o "Acumulado" de duas linhas.
- `v4`: a nota do `meta.json` ficou velha: margem esquerda de 8 px (hoje 56), eixo X de 38 px (hoje
  48) e banda de 76,2 px (hoje cerca de 71,8).
