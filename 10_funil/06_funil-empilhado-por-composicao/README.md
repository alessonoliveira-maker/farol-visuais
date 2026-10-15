# Funil empilhado por composição

## O que é

Cada etapa do funil vira uma barra horizontal dividida pelas categorias de um atributo do lead
(origem, campanha): o comprimento total da barra é o volume da etapa e cada segmento é quanto
daquele volume pertence a cada categoria. Lido em volume, mostra onde cada categoria se perde;
lido em 100%, mostra quem sobrevive até o ganho. "Sem origem" ou "Sem campanha" é cobertura de
dado, não uma categoria de verdade, e por isso fica sempre em contorno neutro, separada e no fim
da pilha.

## Quando usar

- Marketing perguntando quais origens de lead sobrevivem até agenda e ganho, com até 6 categorias
  nomeadas mais a categoria de lacuna, em 3 a 6 etapas.
- Alternar entre volume (onde se perde) e 100% (quem sobrevive), com o modo escrito no título de
  quem cola o gráfico.
- Cauda longa de campanhas ou canais, agrupando as menores numa fatia só e mantendo a lacuna de
  cobertura separada.

## Quando evitar

- Mais de 6 categorias sem agrupar a cauda: agrupar em "Outras" ou usar a família
  `14_tabelas-visuais`.
- Caminhos que se ramificam entre etapas, em que uma pessoa pode pular etapa ou passar por mais de
  um caminho: usar o `11_fluxo-sankey/02_sankey-multietapa`.
- Comparar o mix do fundo com o do topo quando a cobertura de origem muda entre etapas, sem avisar
  o viés de preenchimento (a `v4` existe exatamente para isso).
- Uma etapa só: usar a barra 100% da família `06_barras-empilhadas-e-100` ou o waffle da família
  `22_unidades-waffle-e-pictograma`.

## Anatomia

1. **Barra por etapa**, proporcional ao volume, no eixo categórico vertical (`YAxis type="category"`).
2. **Segmento por categoria**, `Bar stackId="mix"` por categoria, cor fixa por slot (`--chart-1` a
   `--chart-6` na ordem 1, 3, 6, 5, 2, 4 da COR-8). Quando a categoria não é o essencial da
   mensagem (o caso da `v4`, que fala de cobertura e não de mix), as categorias somam num tom
   neutro só (`--line-strong`) em vez de seis cores sem legenda (ROT-4).
3. **Categoria de lacuna** ("Sem origem", "Sem campanha") em contorno `--text-muted` sem
   preenchimento (`fill="none" stroke="var(--text-muted)"`), sempre por último na pilha e fora do
   teto de 6 cores.
4. **Total absoluto da etapa**, escrito na ponta livre da pilha inteira (`LabelList` no último
   segmento, que é sempre a lacuna). A `Bar` da lacuna declara `shape` (`Rectangle`), senão o
   Recharts descarta a barra de largura zero e o total vai embora com ela (`REC-11`).
5. **Legenda com amostra na forma da marca**, na ordem visual da pilha, esquerda para direita.
6. **Dica** (`ChartTooltip`) com o valor absoluto de cada categoria (na `v4`, só as duas partes da pilha), porque o eixo de valor sai
   quando o total já está escrito na ponta (ROT-2).

## Versões

- [`v1_origem-do-lead-ao-ganho-em-volume`](./v1_origem-do-lead-ao-ganho-em-volume/) ([preview](./v1_origem-do-lead-ao-ganho-em-volume/preview.svg)): leads de 2026-08 por origem, do Lead ao Ganho, em volume absoluto. Demonstra o `BarChart` vertical com uma `Bar stackId="mix"` por categoria, a lacuna sempre em contorno e no fim, e o total da etapa escrito na ponta da pilha.
- [`v2_mix-em-100-com-indicacao-em-destaque`](./v2_mix-em-100-com-indicacao-em-destaque/) ([preview](./v2_mix-em-100-com-indicacao-em-destaque/preview.svg)): mesma base em 100%, com indicação em cor cheia e as demais origens atenuadas. Demonstra `stackOffset="expand"`, os sete percentuais de cada etapa somando 100 pelo maior resto (NUM-2), escritos em colunas à direita de cada barra com a amostra de cor no cabeçalho e a legenda de nomes acima do gráfico, as origens atenuadas a 0,72 (3:1 nos dois temas, ACE-5), a dica com o valor absoluto e o total de leads da etapa na ponta; etapa sem lead escreve ausência, nunca 1% por origem.
- [`v3_cauda-longa-de-campanhas-agrupada`](./v3_cauda-longa-de-campanhas-agrupada/) ([preview](./v3_cauda-longa-de-campanhas-agrupada/preview.svg)): 14 campanhas ativas de 2026-08, as 5 maiores em leads nomeadas e as outras 9 agrupadas numa fatia só. Demonstra o agrupamento calculado no componente a partir do volume de entrada, o teto de 6 cores categóricas mais a lacuna, e a dica que nomeia as campanhas que compõem a fatia da cauda.
- [`v4_sem-origem-cai-ao-longo-do-funil`](./v4_sem-origem-cai-ao-longo-do-funil/) ([preview](./v4_sem-origem-cai-ao-longo-do-funil/preview.svg)): mesma base em volume, com o foco na cobertura: 28% dos leads chegam sem origem e só 6% dos ganhos. Demonstra o percentual da lacuna escrito em cada etapa, a cobertura de origem junto do rótulo da categoria, e o aviso de viés de preenchimento na linha de leitura; a parte com origem soma as seis categorias num tom neutro só (`--line-strong`, papel Neutro de dado da 17.2), sem cor por categoria, porque seis cores sem legenda não eram identificáveis na imagem (correção de 2026-09-19, ROT-4); a dica traz as duas partes da pilha (com origem somada e sem origem), sem o detalhe por origem; a linha de leitura e a frase acessível calculam a direção da cobertura do dado, e etapa sem lead escreve ausência em vez de 0%.

## Como colar no Farol

1. Escolha volume (`v1`, `v3`, `v4`) quando a pergunta for "onde se perde volume", e 100% (`v2`)
   quando for "que mistura sobrevive"; nunca troque de modo no meio de uma mesma página sem dizer
   isso no título.
2. Ao ligar o dado real, mantenha a ordem de processo no array de etapas (a ordem é a informação,
   como no `01_funil-em-barras-com-taxa-de-passo`) e uma chave estável por categoria, para a cor
   de cada uma não mudar quando o recorte muda (COR-3).
3. Para a cauda longa (`v3`), passe a lista completa de categorias com sua metaínformação
   (`campaigns`) e deixe o componente recalcular o agrupamento pelo volume da primeira etapa do
   recorte; não agrupe fora do componente, ou a dica perde a lista de quem compõe "Outras".
4. Se a cobertura de origem mudar muito entre etapas (o caso da `v4`), não conclua qual origem
   "venceu" sem antes checar essa cobertura: o viés de preenchimento é o motivo de a `v4` existir.

## Referências

- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): barras empilhadas e proporcionais na categoria parte do todo.
- [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide): barras empilhadas como alternativa mais legível para partes.
- [Towards Data Science, funnel visualizations](https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/): o funil em rosca só aguenta dois ou três grupos, argumento para barras.
- [Behance, busca "funnel chart dashboard"](https://www.behance.net/search/projects/funnel%20chart%20dashboard): varredura de composições.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19, sobre os PNGs dos dois temas em `_render/.qa/`._

- `v1`: nas etapas do fundo (Proposta e Ganho) cada segmento fica com poucos pixels e a mistura só
  se lê pela dica; é o custo esperado do modo volume, e a `v2` é quem responde "que mistura".
- `v1`, `v2` e `v3`: `VALUE_LABEL_GAP = 8` onde a tabela da 17.7 pede 6 px entre o rótulo e a ponta
  da barra; não muda a leitura.
- `v2`: a legenda lateral imprime o percentual e a contagem da última etapa sem nomear a etapa; só
  a categoria em destaque fica ancorada, pela linha de leitura.
- `v2`: as marcas atenuadas em 35% medem de 1,6:1 a 2,3:1 contra o cartão, abaixo do piso de marca
  da ACE-3; quem sustenta a leitura é o valor escrito ao lado na legenda.
- `v2`: a legenda escreve 41% e a linha de leitura 41,2% para o mesmo número, por precisões
  diferentes da NUM-1 (composição inteira contra taxa com uma casa).
- `v3`: a dica nomeia a cauda pelos ids das campanhas (`F, G, H...`) e não pelos nomes; com 9
  campanhas agrupadas a linha da dica fica longa.
- `v3` e `v4`: a linha de leitura usa `truncate`, então em cartão estreito ela sai por reticências
  em vez de quebrar.
- `v4`: o catálogo descreve a faixa de lacuna como hachurada e a versão usa o contorno neutro da
  17.2; o desvio está declarado no `notes` do `meta.json`, que é o tratamento correto.

_Segunda leitura de 2026-09-19, revisor independente, sobre os mesmos PNGs e o `npm run check` limpo
nas quatro versões._

- `v3`: o preenchimento vem do posto (`rank0` a `rank4`) sobre a lista ordenada pelo volume da
  entrada, que é o arranjo que a COR-3 desaconselha; dentro do gráfico a leitura se sustenta, porque
  a legenda nomeia cada cor e a campanha guarda a mesma cor nas cinco etapas, mas a mesma campanha
  troca de cor quando o recorte muda. Caminho natural: um `slot` fixo em `CampaignMeta`.
- `v1`, `v3` e `v4`: `maxBarSize` recebe o `ROW_STEP` (48 e 44), acima do teto de 24 que a ESP-2 cita
  para cartão; a espessura medida no PNG fica em 15 e 14 px, dentro do piso, e o rótulo mora fora da
  marca, então o teto declarado descreve a intenção e não o desenho.
- `v2`: o vazio da coluna de percentual é o sinal de traço em vez de `formatUnavailable()` da EST-4;
  o ramo é inalcançável, porque o estado vazio já sai antes com `role="status"`.
- `v2`: o destaque de indicação vive da cor cheia contra as atenuadas, e o segundo canal da COR-2 é a
  linha de leitura mais o valor na legenda, não o peso da marca.

_Revisão de 2026-10-14, revisor independente, sobre o arquivo de hoje e os PNGs de 2026-10-02 nos dois
temas. A `v2` e a `v4` foram reprovadas, com os bloqueantes em
`validation/revisao_10_funil__06_funil-empilhado-por-composicao_2026-10-14.md`; os itens abaixo não
bloqueiam._

- `v2`: a legenda com valor que não nomeia a etapa, anotada acima em 2026-09-19, passou a bloqueante
  nesta leitura, junto com a falta do percentual das outras quatro etapas, que o catálogo promete
  ("percentuais de cada etapa"); ver o parecer.
- `v1`, `v3` e `v4`: os cinco totais da ponta saem em peso 700, e a TIP-3 admite dois elementos; sem
  consequência no preview, 600 resolve.
- `v1` e `v3`: o total da ponta é contagem sem substantivo (`1.240`, `540`), contra a NUM-6; a unidade
  está escrita no título e no subtítulo da `v1` e na linha de leitura da `v3`.
- `v4`: o mesmo total sem substantivo, e ali a palavra leads não aparece no cartão; só o nome da etapa
  Lead sugere a unidade. Escrever `1.240 leads` na ponta.
- `v1`, `v2` e `v3`: a amostra da legenda sai redonda (`rounded-sm` vale 6 px num quadrado de 8 px) e a
  marca é barra retangular; a ROT-4 e o item 5 da Anatomia pedem amostra na forma da marca. Raio de
  2 px, ou nenhum, resolve.
- `v1`, `v2` e `v3`: os segmentos vizinhos da pilha não têm vão nem contorno em `--surface-raised`
  (COR-5) e medem entre si de 1,03:1 a 1,47:1 nos dois temas, opacos. Nos PNGs a borda se lê pelo
  matiz nas três etapas de cima; nas duas de baixo os segmentos têm de 1 a 7 px e um contorno fixo os
  apagaria (GEO-16), então o vão vale só onde o segmento comporta.
- `v1`: `leaderOf` devolve `referral` quando a etapa inteira é zero, e o primeiro da ordem fixa no
  empate; com o Ganho em zero a frase acessível diria "liderado por Indicação com 0". Ramo fora do
  dado padrão.
- `v2`, `v3` e `v4`: números em Manrope sem `tabular-nums` (TIP-1) na linha de leitura (`v2`, `v3`), na
  coluna de contagem da legenda (`v2`) e em "72% com origem" (`v4`).
- `v2`: a grade é tracejada (`strokeDasharray="3 3"`), e a EIX-3 descreve traço contínuo em
  `--line-subtle`; sem consequência no preview.
- `v3`: o subtítulo pergunta quais nomeadas sustentam volume até o ganho e o que a cauda soma; no Ganho
  os segmentos têm de 1,35 a 2,7 px, e a soma da cauda (32 leads na entrada) só existe na frase
  acessível e na dica. A linha de leitura pode trazer a cauda, ou o `useCase` perguntar o que a peça
  mostra.
- `v3`: a legenda escreve "Outras campanhas" sem a contagem que a COR-4 pede ("Outras campanhas (9)").
- `v3`: a linha de leitura usa `truncate`, e a cauda dela ("7 de 9 no ganho") traz número que a frase
  acessível não tem, o que a TIP-7 de 2026-09-28 não admite; no canvas `largo` ela cabe inteira.
- `v3`: a cor por posto (`rank0` a `rank4`), anotada em 2026-09-19, segue igual no arquivo de hoje
  (COR-3).
- `v4`: a cobertura e a lacuna são arredondadas cada uma por si; com meio ponto exato (1 de 8, 12,5%)
  os dois textos somariam 101 (NUM-2). Escrever a cobertura como 100 menos o percentual impresso da
  lacuna resolve.
- `v4`: a dica não traz o valor de cada origem, porque são só duas `Bar` (com origem somada e sem
  origem); o item da `v4` em Versões, a correção de 2026-09-19 abaixo, o `notes` do `meta.json` e o
  comentário do topo do `Chart.tsx` dizem o contrário (DAD-10). Vai no parecer como correção da mesma
  rodada.
- Modelo: o "Quando evitar" cita `06_barras-empilhadas-e-100`, que não existe; a barra 100% do acervo é
  `02_barras-horizontais/04_barras-empilhadas-100`.

_Segunda passada de 2026-10-14, revisor independente, depois da rodada única de correção da `v2` e da
`v4`, com render de bancada do Ganho zerado e do Ganho sem lacuna. As duas seguem reprovadas, com os
bloqueantes no mesmo arquivo de `validation/`; os itens abaixo não bloqueiam._

- `v2`: `BAR_CATEGORY_GAP = '24%'`, abaixo dos 30% a 40% da ESP-2, e `maxBarSize` de 48; no preview a
  barra mede 19 px com 16 px de vão, sem consequência.
- `v2`: a linha de leitura escreve "nas entradas" e "nos ganhos" fixos, em vez de `first.stage` e
  `last.stage`; num recorte que termina em Proposta ela diria "nos ganhos". Com o Ganho vazio, lê
  "evolui para indisponível nos ganhos".
- `v2`: a frase acessível arredonda cada parte sozinha (`formatPercent(value, 0)`) e as colunas usam o
  maior resto; no dado padrão coincidem, em outro recorte podem diferir em 1 ponto (DAD-5).
- `v2` e `v4`: a dica escreve a contagem sem o substantivo (`valueFormat="int"`), contra a NUM-6.
- `v4`: "NN% sem origem" na ponta e a linha de leitura em Manrope sem `tabular-nums` (TIP-1).
- `v4`: a linha de leitura termina com "o mix do fundo não se compara ao do topo", a mesma oração do
  subtítulo (ANO-5 pede não repetir o subtítulo); o que ela acrescenta é a direção e os dois números.
- `v4`: `--line-strong` como preenchimento mede 1,79:1 no escuro e 1,83:1 no claro; vale a isenção da
  ACE-3, porque a cobertura e o total estão escritos junto de cada barra, e ela só se sustenta
  enquanto o total da ponta existir em toda etapa.
- `v4`: o `check` pede para tirar a chave `AGREGACAO-ZERO` da versão em `divida-guardas.json`, porque
  a guarda não acusa mais nada.
- `v1` e `v3`, não julgadas nesta passada: o total também mora no `LabelList` da lacuna (`noOrigin`,
  `noCampaign`) sem `shape`, o mesmo ramo da armadilha `REC-11`; com lacuna zero numa etapa, o total
  dela some.
- Modelo: o item 4 da Anatomia manda pôr o total "no último segmento, que é sempre a lacuna", que é o
  arranjo que a `REC-11` derruba quando a lacuna é zero.

_Segunda passada de 2026-10-15, revisor independente, depois da segunda rodada de correção da `v2` e da
`v4`, com render de bancada em sete casos (Ganho zerado, Ganho sem lacuna, sem lacuna em todas as etapas e
funil todo zerado). A `v2` foi aprovada; a `v4` segue reprovada, com o bloqueante em
`validation/revisao_10_funil__06_funil-empilhado-por-composicao_2026-10-15.md`. Os itens abaixo não
bloqueiam._

- `v2`: na etapa sem lead (bancada com o Ganho zerado), "0 leads" e "sem lead nesta etapa" saem ancorados
  no 0% (x 104 e 176 do `preview.svg`), dentro da área do gráfico e fora da coluna dos totais (x 594) e
  das sete colunas; a grade tracejada de 25% (x 218,5) passa pela palavra "lead". Lê certo e não afirma
  número; ancorar na borda do 100% (`parentViewBox`) devolve o texto à coluna.
- `v2`: com todas as etapas em zero (bancada), o cabeçalho de amostras fica solto sobre a área do
  gráfico, sem coluna embaixo, e a frase acessível sobe a 262 caracteres (teto de 250 da ACE-1) dizendo
  "com os sete percentuais de cada etapa escritos à direita" sem nenhum escrito. Funil todo em zero é o
  caso que o estado vazio descreve ("não houve lead no funil do período"); levar a soma zero ao bloco
  `role="status"` resolve os três.
- `v2`: com só o Ganho zerado, a frase acessível tem 243 caracteres, a 7 do teto, e "os sete percentuais
  de cada etapa" não vale para a etapa vazia.
- `v4`: com todas as etapas em zero (bancada), o domínio `[0, 'dataMax']` vira `[0, 0]` e a ponta de cada
  etapa cai no meio da área (x perto de 325); o mesmo estado vazio sugerido para a `v2` resolve.
- `v4`: com o Ganho zerado, a linha de leitura e a frase dizem "indisponível em etapa sem lead" sem nomear
  a etapa nem dar a cobertura do topo, que segue medida.
- `v1`, `v2` e `v4`: o comentário do `data.ts` explica Busca paga e Rede profissional com plataformas reais
  ("Google Ads", "LinkedIn"); a saída da DAD-8 é nomear pelo tipo, e a guarda `MARCA-REAL` não lê
  comentário. Nada disso chega à tela.
- `v2` e `v4`: seguem iguais no arquivo de hoje as observações de 2026-10-14 sobre `BAR_CATEGORY_GAP` de
  24%, "nas entradas" e "nos ganhos" fixos, dica sem substantivo e `tabular-nums` em "NN% sem origem" e na
  linha de leitura da `v4`. O item 4 da Anatomia, anotado acima, já foi atualizado.

_Terceira passada de 2026-10-15, revisor independente, só da `v4`, com render de bancada nos dois temas e
`check` na cópia em quatro casos (Ganho zerado, Ganho sem lacuna, Lead zerado e Ganho só com lead sem
origem). A `v4` foi aprovada: a `COLISAO-TEXTO` sai limpa nos quatro e o tique "sem lead" termina perto de
x 45, dentro da coluna que vai a x 102. Os itens abaixo não bloqueiam._

- `v4`: com uma etapa de 1 lead (bancada com o Ganho só sem origem), a ponta escreve "1 leads", porque o
  substantivo é fixo no plural; o dado padrão não tem etapa com 1 lead.
- `v4`: o README não registra a correção desta rodada (segunda linha da ponta cortada na etapa sem lead e
  tique encurtado para "sem lead"); o item de 2026-10-15 em Correções ainda diz que a etapa zerada escreve
  "0 leads" com a ausência, e a ausência agora mora só no tique e na linha de leitura.
- `v4`: seguem iguais no arquivo de hoje a dica sem substantivo, o `tabular-nums` ausente em "NN% sem
  origem" e na linha de leitura, a oração da linha de leitura que repete o subtítulo, o funil todo zerado
  fora do estado vazio e o comentário do `data.ts` com plataformas reais.

## Correções de 2026-09-19 (rodada de revisão)

- `v2`: `MARGIN.right` subiu de 68 para 100 px; o rótulo `1.240 leads` (o mais longo do dado fixo)
  encostava e cortava na borda direita do corpo do gráfico nos dois temas (ESP-3). Verificado nos
  PNGs de `_render/.qa/` dos dois temas: o rótulo agora sobra respiro antes da legenda.
- `v4`: as seis origens coloridas sem legenda e sem rótulo direto viravam série não identificável
  na imagem (ROT-4). Como o essencial desta versão é a cobertura (quanto chega sem origem), não o
  mix por origem, a correção segue a segunda opção do parecer: as seis categorias somam agora numa
  faixa neutra só (`--line-strong`, papel Neutro de dado da 17.2) em vez de seis cores; a dica
  continua trazendo o valor de cada origem para quem quiser o detalhe, o que também resolve o
  apontamento de que a identidade das categorias só existia na dica (DIC-1): sem cor por
  categoria no visual, não há identidade implícita que precise ser "levada" para fora dela.
- `v4`: de passagem, `TAIL_LINE_GAP` foi de 7 para 8 px, um múltiplo de 2 (ESP-1); mudança
  cosmética, sem risco, feita porque já se mexia no mesmo bloco de renderização.
- Nenhum apontamento desta rodada foi contestado; os dois problemas bloqueantes têm correção
  direta na causa, sem depender de leitura alternativa do contrato.

## Correções de 2026-10-14 (rodada de revisão)

- `v2`: `FADED_OPACITY` 0,35 para 0,72 (ACE-5); sete percentuais por etapa em colunas à direita (ROT-10, NUM-5); `percentSharesOf` devolve `null` sem lead e a etapa escreve "sem lead nesta etapa" (EST-1b); `tabular-nums` e amostra com raio de 2 px.
- `v4`: frase acessível e linha de leitura calculadas da cobertura (sobe, cai ou fica), sem `truncate`; cobertura e lacuna `number | null`, cobertura como 100 menos a lacuna impressa; `leads` na ponta, peso 600, `tabular-nums`; texto sobre a dica alinhado ao código (DAD-10).

## Correções de 2026-10-15 (segunda rodada)

- `v2` e `v4`: a `Bar` da lacuna ganhou `shape` (`Rectangle`, contorno só quando a largura é positiva), então a etapa sem lacuna mantém o total, os sete percentuais (`v2`) e "0% sem origem" (`v4`), e a etapa zerada escreve "0 leads" com a ausência (`REC-11`, EST-3). Conferido no PNG nos dois temas com o Ganho zerado e com o Ganho sem lacuna, em dado de teste sem gravar o `data.ts`.
- `v1` e `v3` têm o mesmo `LabelList` sem `shape` e não foram tocadas (aprovadas).

## Pendências conhecidas

- `v4`, CONTRASTE-MARCA: `--line-strong` como preenchimento mede 1,79:1 a 1,83:1; a guarda só orienta (TOK-1 contra DAD-2) e a barra tem o valor escrito.
