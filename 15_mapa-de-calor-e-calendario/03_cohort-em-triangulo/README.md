# Cohort de conversão em triângulo

## O que é

A tabela que separa o efeito do tempo do efeito da safra. Cada linha é um grupo de entrada, o cohort
do mês em que o lead ou a oportunidade nasceu; cada coluna é o tempo decorrido desde essa entrada, em
M0, M1, M2; e a célula é a taxa acumulada até ali. O formato triangular não é decisão de desenho:
aparece sozinho, porque um cohort de agosto ainda não viveu o terceiro mês de vida. É o que responde
se a conversão melhorou de verdade ou se os números do começo do ano só tiveram mais tempo para
amadurecer.

## Quando usar

- Comparar safras na mesma idade: o cohort de maio em M3 contra o cohort de janeiro em M3.
- Medir o efeito de uma mudança de processo pelo mês em que ela entrou, não pelo mês de fechamento.
- Achar o ponto de maturação da conversão, o M em que a curva para de subir e a espera deixa de valer.
- Mostrar que uma taxa mensal caiu por imaturidade do cohort recente, e não por piora de desempenho.

## Quando evitar

- Entidade sem data de entrada estável: sem o marco de nascimento o cohort é arbitrário.
- Menos de uns quatro períodos decorridos: o triângulo vira duas colunas e uma tabela resolve melhor.
- Cohorts minúsculos, em que a taxa oscila mais do que o efeito que se quer medir.
- Curvas de maturação que precisam ser comparadas linha a linha com precisão de valor: aí são linhas
  sobrepostas (família 04), com o triângulo ficando como o mapa de calor de apoio.
- Recorte que muda de tamanho a cada filtro e faz o triângulo trocar de forma a cada clique.

## Anatomia

1. **Coluna de entrada**, com o mês do cohort por `formatMonthShort`, em `--text-secondary`.
2. **Coluna de tamanho**, com barra inline em `bg-chart-1` e o número ao lado, **sem trilho**: nenhum
   neutro do Farol alcança 3:1 contra o cartão (`--surface-overlay` 1,10 e 1,00, `--surface-sunken`
   1,15, `--line-subtle` 1,25, `--line-strong` 1,79), então um trilho é estrutura que não existe na
   tela, sobretudo no tema claro, e a régua da barra passa a ser o número escrito ao lado, que é a
   isenção da WCAG 1.4.11. É o volume que sustenta toda a linha: sem ele, 22% de 40 leads lê igual a
   22% de 600 (NUM-1).
3. **Miolo do triângulo**, com a taxa acumulada escrita em cada célula e o fundo na rampa sequencial
   de cinco degraus, pulando `--seq-4` e `--seq-5` pela mesma medição de contraste da família.
   A escala é comum à tabela inteira: normalizar por linha faria toda safra parecer igualmente boa.
4. **Célula em curso**, com borda tracejada **na mesma tinta do número da célula**, e não em
   `--text-primary` fixo: o contorno é pintado sobre o preenchimento da própria célula, e
   `--text-primary` sobre `--seq-7` mede 1,44:1, abaixo dos 3:1 que a ACE-6 pede de traço que carrega
   informação; na tinta do número o pior caso medido é 5,45:1. Ela conta um mês que ainda não terminou,
   então lê como queda sem ser queda; forma sozinha a diagonal do mês de calendário.
5. **Célula vazia**, sem borda e sem fundo, para o período que ainda não começou. É ausência de
   futuro, categoria diferente de dado faltando.
6. **Célula sem medição**, com contorno pontilhado em `--text-muted` e o ícone `Unplug`, sem número. É
   período que existe e cujo fechamento se perdeu, terceira categoria que não é futuro nem zero
   (EST-2). O rótulo de `formatUnavailable()` vai na legenda, porque a célula estreita não o comporta.
7. **Célula de zero medido**, com o poço de `--surface-sunken`, contorno cheio em `--text-muted` e o
   zero escrito (EST-3). Fica **fora da rampa**, que é o que a DAD-2 pede para o zero não ser lido
   como ausência nem a ausência como zero.
8. **Linha sem base**, quando o cohort não teve entradas: uma célula única com o rótulo de ausência no
   lugar das células, porque taxa sem denominador não é zero pequeno, é inexistente.
9. **Linha de base rala**, quando a base existe e está abaixo do piso de amostra: as células **perdem
   a intensidade** em vez de ganhar opacidade, porque `--seq-1` a `--seq-4` não alcançam 3:1 nem
   opacos e nenhuma opacidade abaixo de 1 passa nos dois temas (ACE-5). O aviso vive em contorno cheio
   de `--warning`, no ícone `TriangleAlert` e no `n` escrito ao lado.
10. **Rodapé de média ponderada pelo tamanho do cohort**, calculada só sobre períodos fechados, que é
    a leitura vertical resumida. O rótulo não traz contagem de cohorts, porque **cada coluna tem uma
    população diferente**: a idade que um cohort alcançou depende do mês em que ele entrou.
11. **Legenda**, com a **fronteira de cada faixa escrita** (TOK-8), a medida, a chave dos estados de
    célula que o dado de fato desenha, e **o que o índice da coluna significa** (GEO-13): sem dizer
    que `M0` é o mês de entrada e que a diagonal é um mês de calendário, o eixo horizontal fica
    rotulado só por número e a terceira leitura do formato não se nomeia em lugar nenhum do cartão.

## Versões

- `v1_agenda-por-cohort-mensal-de-entrada`: conversão de lead em agenda de nove cohorts mensais de
  2026, de M0 a M6, com coluna de tamanho, diagonal de setembro tracejada e média ponderada no
  rodapé. Preview: [preview.svg](v1_agenda-por-cohort-mensal-de-entrada/preview.svg) e
  [preview-claro.svg](v1_agenda-por-cohort-mensal-de-entrada/preview-claro.svg).
- `v2_mudanca-de-cadencia-entre-cohorts`: os mesmos nove cohorts partidos em dois blocos pela nova
  cadência de pré-vendas de mai/26, cada bloco com a sua média ponderada, a divisória entrando como
  anotação de mudança de regra (ANO-1) em vez de moldura (ESP-5), e a coluna M1 destacada por peso de
  fonte e anotação, nunca por cor, porque a rampa já gastou o canal. Preview:
  [preview.svg](v2_mudanca-de-cadencia-entre-cohorts/preview.svg) e
  [preview-claro.svg](v2_mudanca-de-cadencia-entre-cohorts/preview-claro.svg).
- `v3_ganho-acumulado-por-mes-de-criacao`: 18 cohorts por 13 colunas de mês decorrido em linhas de
  20 px, com o número escrito em toda célula (a densidade **não** obrigou a abrir mão dele; o que ela
  obrigou foi a declarar o canvas por número, 800x620), coluna de tamanho com barra sem trilho, marcos
  de leitura em M3, M6 e M12 por peso de cabeçalho em vez de borda de coluna, e sete zeros medidos no
  M0 desenhados em poço fora da rampa. Preview:
  [preview.svg](v3_ganho-acumulado-por-mes-de-criacao/preview.svg) e
  [preview-claro.svg](v3_ganho-acumulado-por-mes-de-criacao/preview-claro.svg).
- `v4_periodo-parcial-e-cohort-pequeno`: as quatro situações que não podem ser lidas como a mesma
  coisa num único cartão (futuro, período em curso, período sem medição e zero medido), mais o cohort
  sem entradas escrito como ausência e o cohort de doze leads **sem intensidade** em vez de esmaecido,
  com alternador de unidade entre taxa e contagem por `aria-pressed`. Preview:
  [preview.svg](v4_periodo-parcial-e-cohort-pequeno/preview.svg) e
  [preview-claro.svg](v4_periodo-parcial-e-cohort-pequeno/preview-claro.svg).

## Colisões entre o catálogo e o CONTRATO, e como se resolveram

Todas a favor do CONTRATO, como manda a seção 14.1, e cada uma declarada também na nota do
`meta.json` da versão em que aparece.

- **`v2`, divisória entre blocos contra a ESP-5.** A especificação pede divisória horizontal entre
  abr/26 e mai/26, e a ESP-5 proíbe divisória entre itens. A linha entrou como **anotação de mudança
  de regra** (ANO-1), com traço de referência em `--line-strong`, que a ACE-6 endossa nesse papel
  apesar de medir 1,79:1 e 1,83:1, e com o rótulo escrito ao lado dela, fora das células.
- **`v3`, borda de coluna nos marcos contra a ESP-5.** A especificação pede borda de coluna discreta
  em M3, M6 e M12. O marco passou a viver no peso 600 e na cor `--text-primary` do cabeçalho da
  coluna, mais a linha da legenda que os nomeia.
- **`v4`, marca esmaecida contra a ACE-5.** A especificação pede o cohort de doze leads esmaecido na
  marca, e a medição fecha esse caminho: `--seq-1` a `--seq-4` não alcançam 3:1 **nem opacos**, então
  nenhuma opacidade abaixo de 1 passa nos dois temas, e baixar a opacidade só afunda um número que já
  está abaixo do piso. A saída é mais honesta que o esmaecido: a linha **perde a intensidade**, porque
  intensidade é afirmação de ordem e doze leads não a sustentam.
- **As três versões novas, número centrado na célula contra a TIP-6.** A TIP-6 manda número à direita
  em coluna, e aqui o número é rótulo sobre marca, caso que a própria regra centraliza. A média do
  rodapé segue a mesma âncora das células que ela resume, e ali a diferença é nula na tela, porque
  toda taxa sai com cinco caracteres em algarismo tabular e centrado coincide com alinhado à direita.

## Quantos níveis a cor afirma, medido

Cinco degraus desenhados, **dois níveis afirmados**, e é o número que sustenta o resto.

- Contra o cartão, no pior dos dois temas: `--seq-1` 1,14:1, `--seq-2` 1,49:1, `--seq-3` 1,92:1,
  `--seq-6` 5,45:1, `--seq-7` 8,29:1. Só os dois altos passam do piso de 3:1 da WCAG 1.4.11, e os três
  baixos não se separam nem do cartão.
- Degrau contra degrau vizinho: 1,23:1, 1,29:1, 2,84:1 e 1,45:1. **Nenhum par chega a 3:1**, nem o
  salto de `--seq-3` para `--seq-6`, que mede 3,03:1 no escuro e reprova no claro com 2,84:1.
- Os cinco degraus só são legítimos porque **toda célula pintada escreve o número**, que é a condição
  da isenção registrada na TOK-8. Sem o número, a peça ficaria em `--seq-5`, `6` e `7`.
- O que carrega a ordem além da cor: o número escrito em cada célula, a posição fixa da coluna, a
  fronteira de cada faixa escrita na legenda e, na `v2`, o peso de fonte da coluna em destaque.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/CohortTriangle/`.
2. Troque `data` pelo cohort real do seletor da página, mantendo a contagem acumulada de conversões e
   o tamanho do cohort **separados**: é a divisão no componente que permite base ausente virar
   ausência de taxa em vez de zero, e é ela que o alternador da `v4` usa para trocar de unidade.
3. O comprimento do array de contagem é o número de períodos já começados: é ele que desenha o
   triângulo, nunca uma máscara à parte. Posição `null` é período que existe e não foi medido.
4. Passe o mês de referência por `CURRENT_MONTH` vindo do recorte da página, nunca de `Date.now()`;
   o preview e o teste precisam desenhar a mesma diagonal em qualquer data.
5. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
6. Acima de uns 12 cohorts ou 9 colunas, **suba o canvas antes de afinar a célula**: o número dentro
   da célula é o que segura a ACE-2 e a isenção da TOK-8, e o piso de 11 px da TIP-2 não é negociável.
   A `v3` mostra o teto prático medido: 18 linhas por 13 colunas cabem em 800x620 com o número inteiro
   em toda célula, e a conta está na nota do `meta.json` dela.
7. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Referências

- Catálogo: [Holistics, cohort retention](https://docs.holistics.io/docs/charts/cohort-retention): observar a coluna de tamanho do cohort e o cuidado com a ordem cronológica das colunas.
- Praticante: [Statsig, introdução aos triangle charts](https://www.statsig.com/blog/intro-triangle-charts-retention): observar a leitura horizontal (um cohort envelhecendo) e vertical (cohorts na mesma idade).
- Portal de design: [Behance, cohort analysis de retenção ao longo do tempo](https://www.behance.net/gallery/174732039/COHORT-ANALYSIS-CUSTOMER-RETENTION-OVER-TIME): observar a combinação de tabela triangular com resumo (só metadados em texto verificados).

## Pendências conhecidas

_Produção da v1 em 2026-09-24 e das v2, v3 e v4 em 2026-09-29, sem revisão formal. São coisas para
resolver na colagem, não antes dela._

- **Toda coluna do triângulo é uma população diferente, e a média do rodapé não corrige isso.** Na v1
  a média de M6 (19,8%) sai abaixo da de M5 (20,3%) sem que nada tenha piorado: M6 só tem os cohorts
  de janeiro e fevereiro, que são os dois mais fracos do recorte. As versões novas tiraram a contagem
  de cohorts do rótulo do rodapé justamente para não afirmar uma população fixa que não existe. Se a
  página precisar comparar colunas entre si, o caminho é restringir o rodapé aos cohorts presentes em
  **todas** as colunas e dizer quantos são.
- **A v1 ainda tem dois defeitos que as versões novas não herdaram**, e os dois já saem como aviso no
  `check`. O primeiro é a AGREGACAO-ZERO em `Chart.tsx:55` e `Chart.tsx:126`: o ramo de lista vazia
  devolve `0` em vez de `null` (EST-1b). O segundo é a coluna de tamanho desenhada **sobre um trilho**
  em `Chart.tsx:123`, hoje `bg-surface-sunken`, que mede 1,15:1 contra o cartão nos dois temas: o
  trilho é estrutura que não alcança o piso de 3:1, e a saída é a das versões novas, que é não ter
  trilho nenhum e deixar a régua com o número ao lado. Atenção ao ler este README na versão anterior:
  a Anatomia e as Pendências diziam `bg-surface-overlay`, e o código nunca usou esse token.
- **O alternador da v4 só aparece no preview no estado inicial.** A §13 do contrato avisa que estado
  de interação não sai no SVG, então a unidade de contagem existe no componente e se confere no Farol.
