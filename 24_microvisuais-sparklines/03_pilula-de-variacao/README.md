# Pílula de variação e indicador de estado

## O que é

Delta, direção e estado escritos no tamanho de uma palavra, colados ao número que qualificam. A pílula traz sinal tipográfico (`+` ou `−`, U+2212) sobre o valor absoluto, glifo do lucide-react (`TrendingUp`, `TrendingDown`, `Minus`) e a base da comparação nomeada na mesma linha. O modelo também absorve a seta de tendência dentro da frase, que nunca escala com a magnitude, e o ponto de status, com silhueta própria por estado e regra de corte escrita. É HTML com Tailwind e uma função pura que decide o tom pela polaridade da métrica e por uma faixa neutra. O texto semântico vai direto sobre o cartão, sem fundo tingido, porque `bg-positive/15` reprova contraste no tema claro. Base zero, base minúscula e ausência têm desenho próprio e nunca viram verde por omissão.

## Quando usar

- Delta de um KPI contra uma base nomeada (mês anterior, mesmo mês do ano anterior, meta), ao lado do número em card ou célula.
- Métricas em que subir é ruim (CPL, tempo de resposta), com a polaridade trocando só a cor e nunca o glifo.
- Direção dentro de uma frase de leitura, com seta e faixa de estabilidade declarada.
- Estado de uma linha contra regra explícita, com forma, cor e rótulo; a lista aguenta cerca de 16 linhas no preset `alto`.
- Tabelas em que só a minoria fora da regra deve acender e o restante fica em tom neutro.

## Quando evitar

- Variação ao longo de vários períodos: use o sparkbar divergente (`24_microvisuais-sparklines/02_sparkbar`).
- Base pequena em que o percentual vira manchete: escreva o delta absoluto, como a v4.
- Estado sem regra de corte declarada: sem regra o ponto colorido é opinião; mostre o número.
- Estado por período em sequência de dezenas de dias: use a faixa de status (`24_microvisuais-sparklines/04_faixa-de-status-tracker`).
- Magnitude da mudança como leitura principal: a seta não serve; use a pílula com número ou a barra em célula (`14_tabelas-com-visual-embutido/01_tabela-com-barras-inline`).
- Tabela em que a maioria das linhas ficaria vermelha: revise a regra antes de desenhar o semáforo.
- Card de KPI completo com procedência: o modelo é `01_cards-e-kpis/01_kpi-simples` e a pílula é ingrediente.

## Anatomia

1. **Sinal e percentual:** `+` ou `−` à mão sobre `formatPercent` do valor absoluto, inteiro a partir de 10% e com uma casa abaixo, em `kpi-number`.
2. **Glifo:** `TrendingUp`, `TrendingDown` e `Minus` (ou `ArrowUpRight`, `ArrowDownRight`, `ArrowRight` na frase), 14 px, `aria-hidden`, dentro de um contêiner flex para não engordar a linha (GEO-17).
3. **Tom:** `text-positive`, `text-negative` ou `text-text-secondary`, decidido pela polaridade da métrica (`goodDirection`) e pela faixa neutra, nunca pelo sinal. Sem fundo tingido (COR-7).
4. **Base nomeada:** `contra R$ 1,2 mi em jul/26`, por `formatCurrencyCompact` e `formatMonthShort`, na mesma linha (NUM-4).
5. **Casos de borda:** base zero ou ausente escreve `sem mês anterior medido para comparar`; base de leads abaixo de 10 mostra `+3 leads`; sem dado atual escreve `formatUnavailable()` com `Unplug`.
6. **Ponto de estado (v3):** `Circle`, `Triangle`, `Diamond` e `CircleDashed` com a palavra do estado; só o crítico em `--negative`, o resto em `--text-muted`, a regra de corte escrita no cabeçalho e a duração por `formatDays`.
7. **Frase acessível:** `role="group"` com `aria-label` calculado do dado, contando alta, queda, estável e sem base.

## Versões

- `v1_receita-do-mes-contra-mes-anterior`: receita de ago/26 com `+7,7%` contra jul/26 e uma segunda pílula em faixa neutra contra ago/25. Demonstra sinal tipográfico, glifo, texto direto sobre o cartão e `Minus` na faixa de 1%.
- `v2_setas-de-tendencia-na-linha-de-leitura`: cinco indicadores da pré-vendas dentro de uma frase, com seta de 14 px e faixa de estabilidade de 5%. Demonstra a polaridade (tempo de resposta em alta com seta para cima em `--negative`) a queda de 16% dos handoffs aceitos (seta para baixo em `--negative`, fora da faixa) e o indicador sem semana anterior, que não ganha seta.
- `v3_status-do-handoff-por-oportunidade`: 16 oportunidades por estado do aceite, com a regra de mais de 2 dias úteis escrita. Demonstra silhueta por estado, só o crítico em vermelho, duração em dias úteis e o anel vazado de quem não tem data.
- `v4_origens-com-base-zero-e-base-minuscula`: leads, CPL qualificado e investimento por origem. Demonstra base zero, delta absoluto de base pequena, CPL com polaridade invertida, investimento neutro e origem sem coleta.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para `app/src/pages/<pagina>/visuals/<Nome>/`. A v1 e a v4 são cartões de moldura `stage` e vão direto na grade; a v2 e a v3 também são o próprio cartão.
2. Troque `polarity` e `goodDirection` pelo `goodDirection` do registry da métrica (`@/data/metrics/registry`). Nunca decida a cor pelo sinal da variação.
3. Faixas e cortes (`FLAT_BAND`, `stableBelow`, `overdueAfterDays`, `smallBaseBelow`) vêm do dicionário da métrica com a data de vigência; o catálogo só os deixa como amostra.
4. Na v3, `referenceDate` é o dia que a página passa; nenhum dia pode vir de `new Date()` dentro do componente. O feriado não entra na contagem de dias úteis do catálogo; se a regra do comercial os exclui, calcule a duração na página e passe pronta.
5. Para usar só a pílula numa célula de tabela, copie `pillOf`, `signedPercent` e o trecho do glifo da v1.
6. O estado vazio da v3 vira `EmptyState` do Farol quando a página já o usa, mantendo o sentido do texto.

## Referências

- Praticante: Edward Tufte, [sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/), sobre palavra desenhada do tamanho de uma frase.
- Implementação: [lucide-react](https://lucide.dev/guide/packages/lucide-react), pelos glifos de tendência e de forma.
- Farol: `01_cards-e-kpis/01_kpi-simples` como guia da pílula dentro do cartão, e `app/src/lib/format.ts` para os formatadores.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, primeira passada. `v1` e `v3` aprovadas; `v2` e `v4` reprovadas, com os bloqueantes em `validation/revisao_24_microvisuais-sparklines__03_pilula-de-variacao_2026-10-05.md`. Medidas tiradas dos PNGs de `_render/.qa/`, que têm 2 px de imagem por px de CSS.

* `v1`, TIP-4: o valor da base (`R$ 1,2 mi`, linha 96) usa `kpi-number` sem classe de peso e herda 400, que a Space Grotesk não carrega; o navegador desenha em 500. O mesmo vale para `font-display` no ramo sem medição (linha 130). Sem consequência visível; `font-medium` alinha.
* `v1`, ACE-1, mora no ramo: com `value` nulo a frase acessível fica só com a cabeça, 62 caracteres, abaixo do piso de 100. O dado padrão não passa por ali.
* `v1`, arredondamento: o cartão mostra `R$ 1,3 mi` contra `R$ 1,2 mi` com `+7,7%`, e quem refaz a conta pelos compactos chega a 8,3%; na segunda linha o mês e a base saem os dois como `R$ 1,3 mi`. O `data.ts` declara o caso, e o valor exato só existe no `title`.
* `v1`, redação do `meta.json`: o título é `Receita do mês com pílula de variação` e o catálogo diz `Receita reconhecida contra o mês anterior`.
* `v2`, NUM-4, para acertar na mesma passada: a variação traz a base só pelo valor (`contra 108`), e as palavras `semana anterior` só aparecem no item que não tem base. Num recorte em que todos têm base, o nome do período some da tela. Escrever uma vez, no cabeçalho ou na legenda.
* `v2`, posição da seta: no PNG escuro a tinta da `ArrowUpRight` vai do topo da maiúscula até 3,5 px acima da linha de base e mede 6,5 px de altura, porque a caixa de 14 px assenta na linha de base e o glifo tem margem interna. Lê-se, mas fica alta para o que o catálogo chama de alinhada à linha de base.
* `v2`, EST-2, mora no ramo: `current` nulo escreve `formatUnavailable()` em `--text-primary` com peso 600 e sem `Unplug`, e a frase acessível conta esse indicador como `sem semana anterior medida`.
* `v2`, EST-3, mora no ramo: `previous` igual a zero cai em `sem semana anterior medida`, embora a semana tenha sido medida em zero.
* `v2`, TIP-4: a base (`108`, `2,9 h`, linha 80) usa `kpi-number` sem peso, como na `v1`.
* `v2`, redação do `meta.json`: o `notes` fala em cinco linhas de frase; o render tem quatro.
* `v3`, TIP-1: a linha da regra (linha 113) traz o `2` de `2 dias úteis` sem `tabular-nums`.
* `v3`, TIP-4: as contagens do resumo fora do crítico (`2`, `1`, `10`, linha 120) usam `kpi-number` sem peso.
* `v3`, redação, mora no ramo: os plurais do resumo e da frase são fixos (`1 aceitas`, `1 pendentes no prazo`), e `overdueAfterDays` igual a 1 escreve `mais de 1 dia úteis`.
* `v3`, nome longo: a coluna do nome tem cerca de 320 px e a linha tem altura fixa de 22 px, sem tratamento de quebra; o maior nome do dado padrão ocupa 210 px e cabe. Defeito latente.
* `v3`, ACE-1, mora no ramo: a frase do estado vazio tem 99 caracteres, um abaixo do piso.
* `v3` e `v4`, moldura `stage`: o cartão começa pela linha da regra e não tem nome próprio, ao contrário da `v1` e da `v2`. Colado direto na grade, quem dá o título é a página.
* `v4`, ACE-1, redação: a frase acessível começa por `Variação de leads por origem`, e não pelo tipo. Começar por `Tabela com a variação de leads`, no molde das irmãs.
* `v4`, TIP-1: a linha do cabeçalho (linha 138) traz `ago/26`, `jul/26` e `±1%` sem `tabular-nums`.
* `v4`, alinhamento: a célula `indisponível` fica cerca de 2 px acima da linha de base do nome da origem e dos números da mesma linha, porque não tem o número de 14 px que dá altura às outras células.
* `v4`, NUM-4: a base é nomeada uma vez, no cabeçalho (`contra jul/26`), e o valor dela não aparece na célula. Serve para tabela; fica o registro de que a `v1` é a única que escreve valor e mês da base na linha.
* `v4`, EST-3, texto que o catálogo manda: `Parceiro novo` teve 0 leads medidos em jul/26 e a tela diz `sem mês anterior medido para comparar`. A `v1` resolve melhor no ramo de base zero (`jul/26 teve R$ 0`). CPL e investimento escrevem `sem base` tanto para base nula quanto para base zero.
* `v4`, ordem das linhas: é a do dado, nem por volume nem por variação. A pergunta `quais origens cresceram` leria mais rápido com as altas no topo ou com a ordem declarada.
* `v4`, largura: as três colunas fixas somam 608 px mais os vãos, e o corpo precisa de cerca de 770 px; abaixo disso a linha transborda. No canvas de 880 px o `sem base` do investimento para a 1,5 px do limite do conteúdo, ainda com os 16 px de padding inteiros. Este README não declara a largura mínima.
* `v4`, seção 5: `COLUMN_CLASS`, `VALUE_CLASS` e `MEASURES` estão nas linhas 112 a 116, depois do componente que as usa, e não no topo.
* `v4`, redação: a frase acessível escreve `estável` sempre no singular, e o `meta.json` troca o exemplo do catálogo (`+150%`) por `+50%`, que é o que o dado dá (9 contra 6).

Revisão de 2026-10-05, segunda passada, depois da correção. `v2` e `v4` aprovadas: os três bloqueantes da primeira passada fecharam (ramo de vazio com `role="status"` nas duas, e a queda de 16% dos handoffs aceitos no dado da `v2`). Fidelidade recalculada dos PNGs `.pagina.png` com a tolerância do render: 0,05% e 0,08% na `v2`, 0,33% e 0,36% na `v4`, escuro e claro.

* `v2` e `v4`, EST-1: o bloco de vazio substitui o cartão inteiro e traz só a frase, sem o ícone `Filter` de 16 px que a regra descreve e que a `v3` desenha (linha 100 dela). Mora no ramo.
* `v2` e `v4`, ACE-1, mora no ramo: o `aria-label` do vazio tem 62 caracteres na `v2` e 67 na `v4`, abaixo do piso de 100.
* `v2`, tipografia do percentual: `+9,3%` sai em Manrope 600 com `tabular-nums` e a base ao lado (`108`) em Space Grotesk, duas famílias de algarismo no mesmo parêntese. A Anatomia deste README diz `kpi-number` para o percentual, que é o que a `v1` e a `v4` fazem.
* `v2`, ROT-4: a chave das setas fica no pé do cartão, e a regra pede legenda acima ou ao lado. Mede 33 px de cerca de 196 px de corpo (17%). Cada seta já vem com sinal e número, então a chave serve para declarar a faixa de 5% e a polaridade invertida.
* `v2`, seta nova: a `ArrowDownRight` assenta na mesma caixa das outras duas (topo da tinta 1 px acima do topo dos algarismos nas três linhas, passo de linha de 28 px). Continua valendo a nota da primeira passada: a tinta termina de 3 a 4 px acima da linha de base.
* `v2`, seguem sem mexer da primeira passada: NUM-4 (o nome `semana anterior` só aparece no item sem base), EST-2 e EST-3 nos ramos de `current` nulo e de `previous` zero, TIP-4 na base (linha 80) e o `notes` do `meta.json`, que ainda fala em cinco linhas de frase.
* `v4`, seguem sem mexer da primeira passada: frase acessível que não começa pelo tipo, cabeçalho sem `tabular-nums` (hoje linha 150), `indisponível` 2 px acima da linha de base da linha dela, texto de base zero, ordem das linhas, constantes nas linhas 112 a 116 e `estável` sempre no singular. Largura medida de novo: `sem base` do investimento termina de 1 a 1,5 px antes do limite do conteúdo, sem transbordo.
* README, redação: na linha da `v2` em Versões falta a vírgula depois do primeiro parêntese (`em --negative) a queda`), e o passo 6 de Como colar no Farol cita só o vazio da `v3`, quando a `v2` e a `v4` agora têm o delas.
