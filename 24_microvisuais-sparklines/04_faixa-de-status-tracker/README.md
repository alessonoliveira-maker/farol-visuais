# Faixa de status e de calor (tracker)

## O que é

Fileira de blocos de largura igual, um por período, cada um pintado pelo estado ou pela classe de valor daquele período. Lê-se regularidade e sequência: quantos períodos foram ruins, se estão juntos e se a fila piorou no fim. É HTML com Tailwind: um flex com `gap-px` e um filho por bloco. Três regras sustentam o modelo: sem dado é estado próprio, em contorno e fora da conta; no máximo quatro estados, com o ruim reforçado por altura menor e não só por matiz; e um bloco por período de calendário, inclusive os vazios.

## Quando usar

- Estado categórico por período em 30 a 90 blocos: SLA diário, coleta diária de uma fonte, meta semanal com feriados.
- Magnitude por período em pouca largura, como 52 semanas de entradas, em 3 classes sequenciais (seq 5 a seq 7) com legenda.
- Várias fileiras empilhadas, uma por fonte, com o percentual de completude à direita de cada uma.
- Tela de confiança no dado: o painel de hoje tem coleta completa em todas as fontes?
- Sempre com resumo textual junto, como 26 de 28 dias com dado dentro do SLA.

## Quando evitar

- Valor exato ou contínuo por período: use o sparkbar (`24/02_sparkbar`) ou o sparkline (`24/01_sparkline-de-linha`).
- Só dois estados em que a sequência de acerto e falha é a história: use o win/loss (`24/07_win-loss`).
- Dias arranjados em semanas e meses para ler ciclo de dia da semana: use o calendário (`15/04_calendario-estilo-contribuicoes`).
- Estados com duração variável: use a jornada por entidade (`20/04_jornada-por-entidade`).
- Cinco ou mais estados: agrupe em até quatro antes do componente.
- Blocos abaixo de 3 px de largura: agregue dias em semanas e diga isso no rótulo.

## Anatomia

1. Blocos: `flex` com `gap-px`, filhos `flex-1 rounded-sm`, cor por `bg-positive`, `bg-negative`, `bg-warning`, `bg-line-strong` ou `var(--seq-N)` em `style`.
2. Altura como segundo canal: o estado ruim é mais baixo que o bom.
3. Estado sem dado: contorno `--text-muted` sem preenchimento, fora do denominador.
4. Resumo escrito: contagens do próprio array, por `formatInt`, `formatDays` e `formatRateWithVolume`.
5. Rótulos só de início e fim por `formatDate`, e de mês por `formatMonthShort` nas viradas de trimestre.
6. Legenda na ordem visual, com amostra na forma da marca.

## Versões

- `v1_sla-diario-da-fila-de-entrada`: 30 dias, dentro do SLA, fora e sem coleta, com resumo à direita.
- `v2_entradas-em-52-semanas-com-semana-corrente`: faixa de calor em 3 classes (cortes 50 e 80), com a semana corrente parcial em contorno.
- `v3_coleta-diaria-de-oito-fontes`: 8 fileiras de 90 dias, 4 estados e container query para largura estreita (abaixo de 672 px: nome e percentual numa linha, faixa de largura cheia, últimos 30 dias).
- `v4_meta-semanal-com-feriado-e-sem-coleta`: feriado neutro, semanas sem coleta e a maior sequência batida anotada.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` e troque o default de `data` pela série real do período, no mesmo tipo.
2. Embrulhe num `VisualCard` com título e subtítulo; o Chart não desenha moldura própria.
3. Acima de cerca de 120 blocos por fileira, troque o flex por SVG com `rect` para não inflar o DOM.
4. Na v3, o `@container` da raiz precisa de um pai que defina a largura; o corte de 30 dias vale abaixo de 672 px de contêiner (bloco de 3 px ou mais com os 90 dias).
5. Troque o estado vazio inline por `EmptyState` do Farol, mantendo o sentido do texto.

## Referências

- Estudo da família: `_estudo/familias/24_microvisuais-sparklines.md`.
- Rampa sequencial limitada a três degraus a 3:1 nos dois temas (TOK-8): a v2 usa só seq 5 a seq 7, três classes, desvio declarado do catálogo (que pede cinco); a ordem das classes mora na legenda escrita, e não na cor.
- Molde de HTML com Tailwind: `01_cards-e-kpis/07_grade-e-tira-de-kpis/v1_tira-de-abertura-do-comercial`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, primeira passada das quatro versões. A v1 e a v4 foram aprovadas; a v2 e a v3 foram reprovadas, e os bloqueantes delas estão em `validation/revisao_24_microvisuais-sparklines__04_faixa-de-status-tracker_2026-10-05.md`. O que segue não reprova.

- v1, v3 e v4, largura do bloco vazado: `border` soma 2 px à base do `flex-1`, então o bloco em contorno sai 2 px mais largo que os preenchidos (13,36 contra 11,36 px na v1; 25,73 contra 23,73 px na v4). Numa fileira só não muda a leitura; na v3 é bloqueante, porque desalinha as fileiras.
- v1 e v2, ESP-5: o resumo à direita leva `border-l border-line-subtle`, divisória interna que a regra manda trocar por espaço. Sem consequência visível.
- v1: "2 dias sem coleta, fora da conta" quebra em duas linhas e deixa "conta" sozinha na segunda.
- v1 a v4, tabela 17.1: o texto da legenda está em 11 px e `--text-muted`; a tabela pede 12 px e `--text-secondary`. Mede 5,21:1 no escuro e 5,37:1 no claro, acima do piso.
- v2, NUM-6: "113 na semana mais cheia" e a frase acessível ("O pico é de 113") não levam o substantivo; a unidade vem da linha de cima e da legenda.
- v2, EIX-10 e ROT-4: a semana corrente, parcial, é pintada com a classe do valor parcial (47, classe abaixo de 50), e só o contorno e a nota a separam das semanas fechadas; a amostra da legenda é vazada e a marca é preenchida.
- v2, EST-2: com a semana corrente nula, o resumo escreve "sem dado" à mão, e não `formatUnavailable()`. Mora no ramo, não no preview.
- v3, ACE-1 e caso de uso: a frase acessível começa por "Coleta diária", sem o tipo do gráfico, e não diz o estado de hoje; no dado padrão a fonte Analytics falhou nos 3 últimos dias, e isso só se lê na última coluna.
- v3, redação do `meta.json`: a nota afirma que o cartão avisa que o percentual segue sobre os 90 dias no modo estreito; o texto do cartão só diz que aparecem os últimos 30.
- v3, TIP-1: o número da nota do modo estreito não leva `tabular-nums`.
- v3, COR-5: o vão entre blocos é de 1 px, abaixo do 1,5 px da regra, como o catálogo pede (`gap-px`); os blocos se separam nos dois PNGs.
- v4, ACE-3 e TOK-5: o bloco de feriado em `--line-strong` mede 1,79:1 no escuro e 1,83:1 no claro, e é o aviso do check. Vale pela palavra "feriado" escrita acima do bloco; o rótulo sai de `indexOf`, então um segundo feriado no recorte ficaria sem ele.
- v4: a barra da maior sequência é posicionada por fração da fileira e termina em 149,73 px, 2,3 px além do sexto bloco (147,4 px), por causa dos blocos vazados mais largos.
- v4, ROT-9: o rótulo da sequência e o de feriado dividem a mesma linha; colidem se a sequência começar a menos de uns 190 px do feriado ou da borda direita. Não acontece com o dado padrão.
- v4, ACE-1: a frase acessível começa por "Meta semanal de agendas", sem o tipo do gráfico.

Revisão de 2026-10-05, segunda passada, só da v2 e da v3 depois da correção (`revisao_desatualizada`). As duas foram aprovadas, julgadas pelo arquivo atual e medidas no DOM (cartão de 960, 738, 737, 390 e 360 px na v3). Da lista acima ficaram resolvidos: a largura do bloco vazado da v3 (contorno por sombra interna, desvio de 0,00 px entre as oito fileiras), a nota do `meta.json` da v3 e o `tabular-nums` do número da nota do modo estreito. O que segue não reprova; "segue" marca o item que já estava na lista acima e não mudou no arquivo.

- v2, TOK-8: as classes vizinhas medem 1,42:1 e 1,45:1 entre si no escuro e 1,46:1 e 1,52:1 no claro (extremos a 2,07:1 e 2,23:1). Pela cor a faixa afirma dois níveis, e a classe do meio se lê pela legenda escrita. É a lacuna de paleta da TOK-8, e os três degraus são a saída que a entrada manda.
- v2, ACE-3 e EIX-10, contorno da semana corrente: `--text-primary` contra o preenchimento mede 2,97:1 no escuro e 4,82:1 no claro com o dado padrão (classe menor). Com a semana corrente em 50 a 79 mede 2,09:1 e 3,30:1; em 80 ou mais, 1,44:1 e 2,17:1, e o contorno deixa de se ver. Hoje vale pelo valor e pela data escritos ao lado e pela posição; um vão de `--surface-raised` entre o contorno e o preenchimento tira a dependência da classe.
- v2, ACE-1: a frase acessível escreve "1 semanas ficaram sem dado" quando há uma lacuna só. Mora no ramo.
- v2, NUM-6, segue: "113 na semana mais cheia" e "O pico é de 113" sem o substantivo.
- v2, EIX-10 e ROT-4, segue: a semana corrente é pintada na classe do valor parcial (47, menos de 50); a amostra da legenda é vazada e a marca é preenchida.
- v2, EST-2, segue: com a semana corrente nula o resumo escreve "sem dado" à mão.
- v2, ESP-5, segue: `border-l border-line-subtle` entre a faixa e o resumo.
- v3, ACE-1 e caso de uso, segue: a frase acessível começa por "Coleta diária", sem o tipo do gráfico, e não diz o estado de hoje; a Analytics falhou nos 3 últimos dias e isso só se lê na última coluna.
- v3, modo estreito, altura: o conteúdo mede 464 px com 671 px de corpo, 500 px com 332 px e 516 px com 302 px, contra 241 px no modo largo. O passo 4 de Como colar só fala da largura; com a raiz em `justify-center`, corpo mais baixo que isso transborda em cima e embaixo por igual.
- v3, modo estreito, leitura: o percentual segue sobre os 90 dias ao lado de 30 blocos (a Telefonia mostra 86% com os 30 blocos completos). A nota do cartão declara e o "de 90" ajuda; dizer o período junto do percentual é melhoria possível.
- v3, desvio do catálogo: o corte do modo estreito é `@2xl` (672 px de contêiner, bloco de 3,37 px), e não o `@sm` do catálogo, que deixaria os 90 blocos abaixo de 1 px. Declarado no `meta.json` e no passo 4 de Como colar.
- v3, EST-2: fonte sem nenhum dia com agenda escreve `formatUnavailable()` sem o ícone `Unplug`. Mora no ramo.
- v2 e v3, COR-5, segue: vão de 1 px entre blocos, como o catálogo pede (`gap-px`); os blocos se separam nos dois PNGs.
