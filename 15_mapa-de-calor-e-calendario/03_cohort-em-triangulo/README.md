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
10. **Rodapé de média ponderada pelo tamanho do cohort**, sobre os mesmos cohorts em todas as colunas
    (só os que já fecharam a coluna mais funda, com o n escrito no rótulo como "mesmos N cohorts"), para
    que as colunas sejam comparáveis. Quando a população não chega à última coluna, o rodapé diz até qual
    M e deixa em branco o que vem depois; sem dois cohorts fechados, diz que não há cohort fechado. É a
    leitura vertical resumida.
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
  cadência de pré-vendas de mai/26, cada bloco com a sua média ponderada dos mesmos cohorts (o bloco novo só chega a M2, e o rótulo diz), a divisória entrando como
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

- **Resolvido nas v2, v3 e v4 (2026-10-15, por nota do dono):** o rodapé deixou de ser `weightedRate` sobre
  todas as linhas de cada coluna e passou a usar uma população fixa, os cohorts com medida e período
  fechado em todas as colunas até a mais funda que dois ou mais alcançam (`commonPopulation`). Na `v2`
  isso é por bloco (antes: jan e fev até M6; depois: mai e jun até M2, M3 a M6 em branco), e a comparação
  de M1 passou a sair da mesma população; na `v3`, cinco cohorts até M12 (abr/25 a ago/25); na `v4`, jan e
  fev até M6 (mar/26 fica de fora por ter M2 sem medição), na taxa e na contagem. O rótulo diz "mesmos N
  cohorts", a legenda diz até qual M e a frase acessível traz o n. Os canvas da `v2` (680), da `v3` (660)
  e da `v4` (680) subiram por causa do rótulo e da legenda mais longos.
- **Resolvido na v1 (2026-10-15):** o rodapé agora é a média ponderada dos mesmos cohorts em todas as colunas (os que já fecharam M6, hoje jan e fev, e o rodapé diz quantos), então M6 não cai abaixo de M5 por troca de população. A comparação do melhor cohort em M3 usa a média dos cohorts fechados em M3, com o n na frase acessível.
- **v1, ACE-1:** a frase da `v1` é calculada do dado e cresce com o recorte; o que falta é um corte se entrarem mais meses de entrada.
- **O alternador da v4 só aparece no preview no estado inicial.** A §13 do contrato avisa que estado
  de interação não sai no SVG, então a unidade de contagem existe no componente e se confere no Farol.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-10-15, sobre as quatro versões; `v2` e `v3` aprovadas, `v1` e `v4` reprovadas (os
bloqueantes estão em `validation/revisao_15_mapa-de-calor-e-calendario__03_cohort-em-triangulo_2026-10-15.md`).
Os itens abaixo não reprovam._

- `v1`: o trilho da coluna Leads passou para `bg-surface-sunken`, que a tabela de tokens do contrato
  aceita para trilho; mede 1,15:1 contra o cartão, e a Anatomia deste README pede a coluna sem trilho,
  como nas irmãs.
- `v1`: o tracejado da célula em curso sai em `--text-primary`, e o traço contra o preenchimento mede
  1,44:1 no escuro e 2,17:1 no claro sobre `--seq-7`; ainda se vê nos PNGs porque a borda encosta no
  cartão, mas a Anatomia item 4 pede a tinta do número.
- `v1`: a legenda escreve só os extremos da rampa (5% e 22%), sem a fronteira de cada faixa, e a borda
  superior do rodapé é divisória que a ESP-5 proíbe.
- `v2`, `v3` e `v4`: as fronteiras da legenda saem arredondadas para inteiro e contradizem células
  escritas. Na `v2` e na `v4`, "19%" é 18,5% e a célula de 18,7% (jan/26, M3) sai na faixa que a
  legenda diz começar em 19%. Na `v3`, a primeira fronteira "1%" é 0,6% (células de 0,6% e 0,7% na
  primeira faixa), "11%" é 11,1% (11,0% de nov/25 em M4 fica abaixo) e "15%" é 14,6% (14,7% e 14,9%
  ficam acima). Escrever a fronteira com uma casa, ou escolher fronteiras redondas e classificar por
  elas.
- `v2`, `v3` e `v4`: a linha de leitura quebra em duas linhas no preview, contra a ANO-5, e a conta de
  canvas da nota do `meta.json` reservou 16 px para ela; coube porque havia folga.
- `v2`: a anotação "M1: 14,0% antes, 21,4% depois" repete os dois números da linha de leitura logo
  acima, e as duas médias do rodapé os imprimem de novo; uma das duas linhas basta, ou a anotação vai
  para junto da coluna M1.
- `v2`: a linha de leitura diz "com os 3 que já entraram sob a nova cadência", mas entraram cinco; três
  são os que já fecharam M1. A frase acessível usa "somam" para uma média ponderada.
- `v2`, `v3` e `v4`: os estados de célula (tracejado, poço, pontilhado) aparecem na legenda só por
  texto, sem amostra na forma da marca (ROT-4).
- `v4`: a legenda não diz que a média deixa de fora o período em curso, ao contrário das irmãs; a
  anotação "1 cohort sem entradas e 1 período sem medição" repete a legenda e não flexiona plural; o
  botão "contagem" não pressionado não tem forma de botão.

_Segunda passada de 2026-10-15, depois da rodada de correção; `v1` e `v4` aprovadas. Resolvidos no
arquivo de hoje: na `v1`, o trilho da coluna Leads, o tracejado em `--text-primary` e a borda do
rodapé; na `v4`, a linha de legenda que diz que média e total deixam de fora o período em curso. Os
itens abaixo não reprovam._

- `v1`: a frase de recuo, quando nenhum cohort fechou `M3`, tem 76 caracteres ("Triângulo de cohort
  sem nenhum período fechado na mesma idade para comparar."), abaixo do piso de 100 da ACE-1, e não diz
  quantos cohorts nem qual idade; o preview não passa por esse ramo.
- `v1`: o domínio da rampa inclui a célula em curso, então set/26 em `M0` (4,8%) ocupa sozinha o
  primeiro degrau e todo `M0` fechado desce para o segundo; a legenda arredonda esse extremo para "5%",
  acima da célula de 4,8% que ele abre.
- `v1`: os estados de célula (tracejado, vazio) aparecem na legenda só por texto, sem amostra na forma
  da marca (ROT-4), como já anotado para as irmãs.
- `v4`: na correção, a frase acessível perdeu "com a conversão de lead em agenda" e passou a dizer só
  "Triângulo de cohort de 9 meses de entrada"; como a legenda e a linha de leitura são `aria-hidden` e
  título e subtítulo não citam agenda, quem usa leitor de tela ouve "25,0% (3 de 12)" sem saber de que
  medida. A frase tem 170 caracteres, então o trecho volta sem passar de 250.
- `v4`: `thinHigher` usa `>`, então taxas iguais imprimem "a taxa da base menor é menor"; com empate a
  linha de leitura afirma uma diferença que não existe.
- `v4`: a linha "média e total deixam de fora o período em curso" aparece também no modo taxa, em que
  não há total na tela; e "M6 são seis meses depois" escreve "seis" à mão, enquanto `lastLabel` sai de
  `ELAPSED_MONTHS` (a `v1` calcula as duas partes).
- `v4`: a conta de canvas da nota do `meta.json` reserva 16 px para a linha de leitura e 48 px para a
  legenda "em três linhas", mas no preview a linha de leitura ocupa duas linhas e a legenda cinco; cabe
  porque a tabela é `flex-1` e cede altura, não pela folga declarada. A mesma nota diz que a legenda
  nomeia a diagonal como mês de calendário, e ela escreve só "tracejado: set/26 em curso".
- `v4`: a legenda descreve o zero medido como "poço com contorno", mas o único zero do dado está na
  linha de base rala e sai com o contorno de `--warning`; o contorno de `--text-muted` que a legenda
  descreve não aparece no preview.

_Terceira passada de 2026-10-15, só da `v1`, depois da correção do rodapé pedida pelo dono; `v1`
aprovada. Conferido à mão contra o `data.ts`: o rodapé é a média ponderada de jan/26 e fev/26 (800
leads) em toda coluna, 7,8%, 13,7%, 16,9%, 18,4%, 19,2%, 19,6% e 19,8%, sem queda de M5 para M6, e a
média de M3 da frase é 19,7% (440,675 de 2.232 leads, 5 cohorts fechados). Os itens abaixo não
reprovam._

- `v1`: para caber o n, a frase acessível perdeu a frase da diagonal em curso. A legenda é
  `aria-hidden` e o `td` tracejado não tem `aria-label` (só a célula vazia tem), então quem usa leitor
  de tela ouve set/26 em M0 com 4,8% ao lado de ago/26 com 11,2% como queda. A frase tem 195 de 250
  caracteres: cabe devolver "set/26 em curso", ou rotular a célula aberta.
- `v1`: `best && referenceAverage` testa um número por verdade. Antes da correção a média era objeto;
  agora é `number`, e uma média medida de 0,0% em M3 cai na frase de recuo "sem nenhum período
  fechado", contra a EST-1b e a EST-3. Trocar por `!== null`.
- `v1`: a população do rodapé é fixada pela última coluna. Num recorte em que nenhum cohort fechou M6
  (todo recorte que começa menos de sete meses antes de `CURRENT_MONTH`), as sete médias saem em
  branco, o rótulo lê "mesmos 0 cohorts" e a frase "Rodapé: média dos mesmos 0 cohorts em toda
  coluna". Com um único cohort, sai "mesmos 1 cohorts" e o rodapé repete a linha. Esconder a linha com
  uma nota abaixo de dois cohorts, ou fixar a população na coluna mais funda com pelo menos dois
  fechados e dizer até qual M.
- `v1`: a legenda diz "só dos 2 cohorts que já chegaram a M6", mas três linhas têm célula em M6, e
  mar/26 chegou lá em curso. "que já fecharam M6", ou os nomes jan/26 e fev/26, tira a dúvida.
- `v1`: a frase compara mai/26 com 19,7% (5 cohorts fechados em M3), número que não está no cartão, e
  o rodapé imprime 18,4% em M3 (2 cohorts). As duas contas estão certas e com o n, mas são duas médias
  de M3 em dois canais; citar a do rodapé, ou dizer na frase que ela difere.
- `v1`: o "2" de "mesmos 2 cohorts" e o da linha nova da legenda saem sem `tabular-nums` (TIP-1), sem
  consequência visível. O campo `cohorts` de `columnAverages` guarda a soma de leads (800), e não a
  contagem, e não é lido.
- `v1`: texto que ficou para trás: o comentário do topo do `Chart.tsx` (linhas 10 e 11) ainda diz que
  o rodapé resume "cohorts diferentes na mesma idade"; o `demonstrates` do `meta.json` não cita a
  população fixa; e a conta de 297 px de tabela da nota é anterior ao rótulo do rodapé quebrar em duas
  linhas na coluna Leads. Cabe no canvas `alto` sem corte.
- `v1`: a legenda ocupa três linhas, e a ROT-4 pede até duas. Já era assim antes da correção, e nada
  sai cortado.
- README: a pendência substituída avisava que toda coluna é uma população diferente. As `v2`, `v3` e
  `v4` continuam com `weightedRate` sobre todas as linhas de cada coluna, então estão sujeitas à
  mesma queda de M5 para M6 sem piora real. "As v2 a v4 não escrevem contagem no rodapé" não diz
  isso. O aviso para elas devia voltar.

_Quarta passada de 2026-10-15, das `v2`, `v3` e `v4`, depois da correção do rodapé pedida pelo dono; as
três aprovadas. O item acima, do README, está resolvido. Conferido à mão contra o `data.ts`: na `v2`, o
bloco antes é jan/26 e fev/26 (800 leads) com 7,8%, 13,6%, 16,8%, 18,5%, 19,3%, 19,6% e 19,9%, e o
bloco depois é mai/26 e jun/26 (999 leads) com 10,5%, 21,3% e 25,3% até M2; na `v3`, abr/25 a ago/25
(497 criadas) de 0,4% a 14,3%, e a linha de leitura com fev/26 em 15,7% contra 13,4% (158 de 1.181);
na `v4`, jan/26 e fev/26 (424 leads) com 7,8%, 13,7%, 17,0%, 18,6%, 19,6%, 19,8% e 20,0%. Nenhum
rodapé cai mais de uma coluna para a outra. Os itens abaixo não reprovam._

- `v2`: a comparação de M1 (linha de leitura, anotação e frase) sai da população fixa do rodapé e deixa
  de fora mar/26 e abr/26, que fecharam M1 e são os cohorts mais próximos da mudança (956 leads, 54% da
  base de M1 do bloco antes), e jul/26 no bloco depois. Com todos os fechados em M1 seria 14,0% (4
  cohorts, 1.756 leads) contra 21,4% (3 cohorts, 1.548 leads). A escolha ganha coerência com o rodapé e
  não muda a conclusão; como a pergunta é uma coluna só, ela não precisa da população fixa, e o rótulo
  poderia dizer quais cohorts entram.
- `v2`: "mesmos" fica sem antecedente na linha de leitura ("com os mesmos 2 cohorts anteriores") e na
  frase acessível ("média dos mesmos 2 cohorts antes de mai/26"), que também perdeu o verbo da conclusão
  (sobe). A legenda diz "a idade mais funda do bloco", mas no bloco depois a idade mais funda desenhada
  é M4 e a do rodapé é M2; o rótulo "até M2" desfaz a dúvida.
- `v2`, `v3` e `v4`: o recuo do rótulo do rodapé escreve "sem cohort fechado" quando a população é nula,
  e ela também é nula com um cohort fechado, pelo piso `MIN_COMMON` de 2. "Sem dois cohorts fechados",
  como a legenda da `v3` e da `v4` já diz. O preview não passa por esse ramo.
- `v2`, `v3` e `v4`: a nota do `meta.json` trocou canvas e corpo e manteve folga e alturas antigas. A
  `v2` diz 45,5 px de folga sobre 561,5 (pela conta dela sobram 125,5), legenda em três linhas (sai em
  cinco) e médias de 18 px (a do bloco depois sai em três linhas); a `v3` diz 23,5 sobre 541,5 (sobram
  63,5), legenda em duas linhas (sai em três) e rodapé de 16 px (sai em duas linhas); a `v4` diz 57,5
  sobre 561,5 (sobram 117,5) e legenda em três linhas (sai em seis). Tudo cabe sem corte nos dois temas.
- `v3`: o cartão imprime duas médias de M6: 13,4% na linha de leitura (11 cohorts fechados em M6) e
  12,1% no rodapé (os 5 que fecharam M12). As duas levam o n e a população escritos ("já fechados nessa
  idade", "mesmos 5 cohorts", "só dos cohorts que já fecharam M12"), então a diferença se reconcilia no
  próprio cartão; uma oração na linha ("acima dos 12,1% do rodapé, que só conta os 5 cohorts com M12")
  pouparia o leitor. Na frase acessível falta "fechados em M6" depois de "11 cohorts".
- `v3`: a frase acessível perdeu "a diagonal tracejada é set/26, em curso" para caber o rodapé, e a
  célula aberta não tem `aria-label`; quem usa leitor de tela ouve "o melhor é fev/26, 15,7%" e depois
  encontra mar/26 com 18,0% em M6 sem saber que o período está em curso. Como a taxa é acumulada, a
  célula aberta é piso, e mar/26 já passa de fev/26 em M6. "O melhor cohort fechado", na linha e na
  frase, ou citar mar/26 em curso, resolve.
- `v3`: README: "800x620" ficou na seção Versões e no passo 6 de Como colar; o canvas é 800x660 desde a
  correção.
- `v4`: um dos "mesmos 2 cohorts" do rodapé é fev/26, de 12 leads, a linha de base rala que a própria
  versão diz não sustentar intensidade. Com o peso por lead o rodapé é 97% jan/26 (412 de 424 leads) e
  difere da linha de jan/26 em até 0,2 ponto percentual, o que esvazia o motivo do `MIN_COMMON` ("com um
  só, a média repetiria a própria linha"). Escrever os leads no rótulo (424) ou contar no piso só cohorts
  acima de `MIN_SAMPLE`.
- `v3` e `v4`: `footerCount` recua para 0 com população nula. Hoje não chega à tela, porque todo uso está
  atrás de `footerLabel` ou de `population`, mas `number | null` deixaria o tipo carregar a ausência
  (EST-1b).
