# Pequenos múltiplos de linha

## O que é

Um gráfico de linha por categoria da mesma métrica, empilhado numa grade Tailwind, com o mesmo
eixo x, o mesmo array de datas e o cursor sincronizado por `syncId`. Cada painel tem o mesmo
tamanho e a mesma largura de eixo y, para o olho comparar forma e nível sem reler escala a cada
painel. É a saída para o espaguete de mais de 4 ou 5 séries num eixo só (modelo 02): em vez de
uma cor por categoria disputando atenção, cada categoria ganha o próprio espaço.

A decisão que este modelo mais precisa deixar explícita é a da escala. Quando a pergunta é de
nível (esta categoria está acima ou abaixo das outras, ou de uma referência do grupo), o domínio
do eixo y é **um só, calculado sobre o conjunto inteiro e igual em todo painel**; escala por
painel é o jeito clássico de a peça mentir sem querer, porque duas curvas de formato idêntico
podem estar em patamares completamente diferentes e ninguém percebe. Só quando a pergunta é a
forma da curva, não o nível absoluto, a escala independente é aceitável, e mesmo assim precisa
estar escrita por extenso em cada painel, nunca implícita.

## Quando usar

- De 4 a 12 categorias da mesma métrica em que todas importam igualmente: plataformas de mídia,
  squads de pré-vendas, origens de lead.
- A pergunta é de nível (subiu, desceu, está acima da mediana do grupo): use escala comum.
- Comparar cada categoria com uma referência do grupo (mediana, meta) sem sobrepor as linhas.

## Quando evitar

- Até 4 séries que ainda se leem juntas num eixo só: use múltiplas séries, modelo 02.
- Métricas diferentes em painéis alinhados (grandeza e taxa, por exemplo): use combinados e eixo
  duplo, família 08; nunca eixo duplo dentro de um painel.
- Linha minúscula dentro de cartão ou célula, sem eixo: use microvisuais e sparklines, modelo 24.
- Menos de cerca de 80 px de altura por painel: a tabela com sparkline lê melhor.
- Mais de 12 painéis: filtre, agrupe em Outros ou pagine antes de desenhar a grade.

## Anatomia

1. Grade `grid` do Tailwind (`grid-cols-3 grid-rows-2`, `grid-cols-4 grid-rows-3`, conforme o
   número de painéis), um `LineChart` por categoria dentro de `ResponsiveContainer`.
2. Domínio y: comum, calculado em TypeScript sobre o `Math.max` de todos os painéis e arredondado
   para cima (v1, v2, v3); ou independente por painel, com o teto escrito em texto abaixo do
   cabeçalho (v4).
3. `YAxis width` na mesma constante nomeada em todo painel, mesmo quando só a primeira coluna
   imprime o tique em texto (v3): sem isso o eixo x desalinha entre colunas.
4. Cabeçalho de cada painel: nome da categoria (`truncate` só quando o nome inteiro está na frase
   acessível da raiz) e o último valor ou a contagem que resume o painel, em `formatCurrencyCompact`
   ou `formatInt` conforme a unidade.
5. Eixo x só nos painéis da linha de baixo (`hide` nos demais), com `ticks` explícitos (início,
   meio, fim) em vez de deixar o Recharts descartar por conta própria.
6. Referência do grupo quando existe: uma segunda `Line` tracejada em `var(--line-strong)`
   (mediana, v2) ou uma `ReferenceLine` tracejada em `var(--text-muted)` (meta, v3), a mesma em
   todo painel.
7. Painel sem nenhum dado no recorte: bloco `role="status"` com o ícone `Filter` substituindo só
   aquele `LineChart`, nunca a grade inteira (v4); a raiz da peça continua com `role="img"`.
8. Animação: `useAnimateOnce()` até 6 a 8 painéis; desligada (`isAnimationActive={false}`) a
   partir de 12, porque animar doze curvas ao mesmo tempo lê como ruído, não como entrada.

## Versões

- [`v1_cpl-por-plataforma-em-quatro-paineis`](./v1_cpl-por-plataforma-em-quatro-paineis/): CPL
  mensal de quatro plataformas de mídia em domínio y comum, calculado sobre o conjunto e escrito
  em nota acima da grade. [Preview escuro](./v1_cpl-por-plataforma-em-quatro-paineis/preview.svg) ·
  [claro](./v1_cpl-por-plataforma-em-quatro-paineis/preview-claro.svg).
- [`v2_origens-contra-a-mediana-do-grupo`](./v2_origens-contra-a-mediana-do-grupo/): seis origens
  de lead, cada painel com a própria linha contra a mediana semanal do grupo tracejada, painéis
  ordenados do maior para o menor volume da última semana.
  [Preview escuro](./v2_origens-contra-a-mediana-do-grupo/preview.svg) ·
  [claro](./v2_origens-contra-a-mediana-do-grupo/preview-claro.svg).
- [`v3_sla-de-doze-squads-em-grade`](./v3_sla-de-doze-squads-em-grade/): o caso denso do modelo,
  doze squads de pré-vendas em grade 4 por 3, meta de SLA tracejada em cada painel, contagem de
  semanas abaixo da meta e sinal de ícone e palavra quando a semana mais recente está abaixo dela.
  [Preview escuro](./v3_sla-de-doze-squads-em-grade/preview.svg) ·
  [claro](./v3_sla-de-doze-squads-em-grade/preview-claro.svg).
- [`v4_painel-sem-dado-e-escala-independente`](./v4_painel-sem-dado-e-escala-independente/): oito
  origens de volumes muito diferentes, cada painel com a própria escala declarada em texto, e uma
  origem sem nenhuma coleta no período resolvida como estado vazio dentro do próprio painel.
  [Preview escuro](./v4_painel-sem-dado-e-escala-independente/preview.svg) ·
  [claro](./v4_painel-sem-dado-e-escala-independente/preview-claro.svg).

## Como colar no Farol

1. Ligue `data` ao seletor real da página; o formato de cada categoria (`points` com a chave de
   tempo e o valor) é o mesmo em toda versão, então trocar o dado fictício pelo real não muda a
   forma do componente.
2. Dê altura ao pai (`h-72` ou mais, conforme o número de linhas da grade): sem altura,
   `ResponsiveContainer` desenha zero em cada painel, não só no conjunto.
3. Ao decidir entre escala comum e independente, comece pela pergunta que a página está
   respondendo, não pelo que couber melhor no espaço: nível pede comum (v1 a v3), forma pede
   independente e declarada (v4).
4. Acima de 12 categorias, ofereça filtro, agrupamento em Outros ou paginação antes de crescer a
   grade; o modelo não pagina sozinho.

## Referências

- [Recharts, Synchronized Line Chart](https://recharts.github.io/en-US/examples/SynchronizedLineChart/):
  observar o `syncId` compartilhado entre gráficos e o `Brush` que move todos juntos.
- [Storytelling with Data, be gone, dual y-axis!](https://www.storytellingwithdata.com/blog/2016/2/1/be-gone-dual-y-axis):
  observar os gráficos separados verticalmente com o mesmo eixo x, a alternativa ao eixo duplo.
- [Peltier Tech, Secondary Axes in Charts](https://peltiertech.com/secondary-axes-in-charts-2/):
  observar os panel charts como saída para múltiplas séries na mesma unidade.
- [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide):
  observar pequenos múltiplos entre as variações de linha quando as séries se sobrepõem.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18; correção de 2026-09-18 (EIX-9 e syncId, ver Pendências conhecidas). O que
está aqui não reprova versão; o que reprovou está na nota do veredito._

- `v1`: a frase acessível da raiz mede 238 caracteres, a 12 do teto de 250 da ACE-1, e cresce com o
  número de canais do recorte; com um canal a mais ela estoura.
- `v1`: o catálogo chama a versão de CPL por plataforma e o `meta.json` chama de CPL por canal; a
  leitura não muda, mas o mesmo visual aparece com dois nomes entre catálogo e galeria.
- `v2`: a mediana do grupo é tracejada em `--line-strong` (1,83:1 no claro), enquanto a 17.2 reserva
  `--text-muted` para linha de referência; o catálogo pede neutro, então fica registrada a divergência
  entre catálogo e contrato, não uma correção.
- `v3`: a série do squad abaixo da meta é pintada em `--negative`, e a 17.2 diz que semântico nunca
  pinta série; o catálogo pede o sinal do painel abaixo da meta e a versão acrescenta ícone e palavra,
  então a cor não é o único canal.
- `v3`: o tique de 50% declarado em `Y_TICKS` não sai em nenhum painel do preview, nem na primeira
  coluna; o Recharts descarta o tique do meio na altura disponível e sobram duas linhas de grade,
  0% e 100%. Corrige a leitura anterior, que dizia "só na primeira coluna".
- `v4`: a dica usa `cursor={{ stroke: 'var(--line-strong)' }}` em vez do `CURSOR_COLOR` que a DIC-3
  pede para linha.

_Acrescentado na revisão de 2026-09-18, segunda passada:_

- `v2`: o eixo x da linha de baixo imprime só `16/03/2026`; o tique de início declarado em
  `tickWeeks` é descartado pelo Recharts porque a data por extenso transborda à esquerda do corpo.
  O recorte inteiro continua dito no cabeçalho do cartão, mas o painel sozinho não diz onde a série
  começa. A forma curta de data ou uma reserva de margem à esquerda resolveriam.
- `v1`, `v2`, `v4`: a grade sai com duas linhas por painel (piso e teto), abaixo das 3 a 5 da EIX-4.
  Em painel de pequeno múltiplo isso é escolha defensável de densidade, e fica registrado como
  divergência consciente, não como acabamento esquecido.
- `v3`: a `ReferenceLine` da meta não leva rótulo com nome e valor no painel, como pede a ANO-3; o
  valor vive na nota acima da grade, uma vez para os doze painéis. Repetir o rótulo em doze painéis
  seria ruído, então a nota é a saída, mas a divergência com a ANO-3 fica anotada.
- `v3`, `v4`: os textos de apoio do cabeçalho de painel (`0 de 26 semanas`, `escala 0 a 40`) trazem
  número sem `tabular-nums` nem `font-display`, o que a TIP-1 pede para todo número de tela; em
  coluna de painéis vizinhos o número dança um pouco entre linhas.
- `v2`: o nome da origem leva `truncate`, enquanto o `demonstrates` do `meta.json` promete "sem
  truncar nome longo"; no dado fixo nada trunca, então é divergência de texto, não de desenho.

## Pendências conhecidas

_Correção de 2026-09-18, rodada única. Bloqueantes resolvidos nesta rodada, um por versão:_

- `v1`, `v2`, `v3`, `v4`: **EIX-9 corrigido.** O `XAxis` usava `hide={!isBottomRow}`, que não
  reserva altura de eixo quando escondido; a linha de cima media até 89 px de corpo contra 51 px
  na de baixo para o mesmo domínio, achatando ou esticando a mesma curva conforme a posição na
  grade. Trocado por `tick={isBottomRow ? {...} : false}` com o `XAxis` sempre presente e uma única
  `margin` para todo painel: o eixo agora reserva a mesma altura em toda linha da grade. Como efeito
  colateral positivo, o tique de valor impresso (antes divergente entre linha de cima e de baixo em
  `v1`/`v2`) e a proporção do corpo do painel em `v4` (antes ~32 px embaixo contra ~70 px em cima)
  também ficaram consistentes; por isso as duas observações que citavam esse sintoma saíram da lista
  acima.
- `v4`: **syncId ausente, corrigido.** Nenhum `LineChart` declarava `syncId`, então o cursor não
  sincronizava entre os 8 painéis e a versão não demonstrava o array com `null` casando pelo índice,
  que é o próprio ponto da versão. Adicionado `syncId="origens-escala-independente"`.

_Não resolvidas nesta rodada (permanecem como registradas em Observações da revisão, não bloqueiam):_

- `v3`: tique e linha de grade de 50% ausentes em todos os painéis (o Recharts descarta o tique do
  meio na altura disponível). É um segundo eixo (`YAxis`) e uma segunda causa, distinta do
  `XAxis`/EIX-9 corrigido acima; não estava na lista de problemas bloqueantes desta rodada e não foi
  tocada para não misturar causas na mesma correção.
- `v2`: cor da mediana (`--line-strong` vs `--text-muted` da 17.2) é divergência catálogo vs
  contrato, não erro de implementação; mantida como está, com a divergência anotada.
- `v3`: cor semântica na série (`--negative`) com ícone e palavra somados; mantida, cor não é o
  único canal.
- `v4`: cor do cursor fora do token `CURSOR_COLOR`.
- `v1`: frase acessível a 12 caracteres do teto da ACE-1; nomeação divergente entre catálogo e
  `meta.json`.

## Correção de 2026-09-28

**v2, a mediana do grupo nascia zero na semana sem nenhuma origem medida.** `median` devolvia `0`
para lista vazia e o painel ainda fazia `weeklyMedian[pointIndex] ?? 0`, então a semana sem medição
puxava a linha tracejada até a base dos seis painéis ao mesmo tempo, afirmando que o grupo inteiro
fez zero lead. Contagem zero de leads é plausível, e nada na tela separava uma coisa da outra.

O que mudou: `median` devolve `number | null`; a mediana passou a ser indexada pela semana, num
`Map`, e não pela posição do ponto dentro do painel, porque origens com listas de tamanhos
diferentes casariam a semana de uma com a mediana de outra; a linha da mediana ganhou
`connectNulls={false}`, então a referência quebra no vazio (EIX-10); e uma nota na linha de leitura
escreve "mediana indisponível em N semanas sem origem medida", que entra também na frase acessível,
porque a quebra de uma linha tracejada é discreta demais para contar isso sozinha.

**Conserto de caminho latente:** as 11 semanas publicadas têm as 6 origens, então a mediana segue
calculada em todas e o desenho não mudou. O que se conserta é o ramo, não a foto.
