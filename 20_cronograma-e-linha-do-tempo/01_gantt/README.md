# Gantt

## O que é

Uma linha por atividade e o tempo no eixo horizontal: cada barra vai da data de início à data de fim, e a leitura revela paralelismo, lacunas e o que está no ar hoje. No Recharts é um `BarChart` com `layout="vertical"` e o `dataKey` em tupla `[inícioMs, fimMs]`, sem série transparente de deslocamento (a exceção é a v4, em que várias barras dividem a mesma linha e a pilha precisa de um gap sem marca). Os ticks de calendário (primeiro dia do mês ou do trimestre) são gerados em TypeScript por `Date.UTC`, as datas entram como texto `YYYY-MM-DD` e a data de hoje vem no dado, nunca do relógio. O modelo absorve o Gantt de progresso com linha de base, o Gantt hierárquico com colunas de texto e a linha do tempo empacotada em faixas.

## Quando usar

- Períodos com início e fim declarados, de 5 a cerca de 30 linhas, quando a duração e a sobreposição importam.
- Calendário de campanhas, flights de mídia, janelas de contratação e iniciativas com datas comprometidas.
- Planejado contra realizado com percentual concluído, quando existe linha de base registrada.
- Fases com entregas filhas e colunas curtas de dono e status ao lado da trilha.
- Muitos intervalos curtos e anônimos que cabem empacotados em poucas faixas.

## Quando evitar

- Encadeamento entre tarefas define o prazo: use o Gantt com dependências (`20/09`).
- Só a ordem importa e não há datas firmes: use o roadmap por horizonte (`20/07`) ou o stepper (`20/03`).
- Eventos sem duração: use a linha do tempo de marcos (`20/02`).
- Sequência de estados de cada oportunidade: use a jornada por entidade (`20/04`).
- Centenas de linhas com identidade fixa: agregue ou vá para a lasagna da família 15.

## Anatomia

1. Linha de leitura opcional no topo, calculada do dado, com a contagem do que está no ar ou atrasado em hoje (ANO-5).
2. Eixo de categoria à esquerda com o nome completo da atividade, desenhado por tick customizado; na v3 o tick traz também a indentação do nível, o dono e o status.
3. Eixo de tempo numérico com `domain` fixo e `ticks` gerados em TypeScript, formatados por `formatMonthShort`, com grade vertical `var(--line-subtle)` só na direção da leitura.
4. Barra por atividade em tupla `[início, fim]`, com o fim exclusivo (último dia no ar mais um dia) para o dia final ocupar a largura inteira; cor por `shape` com `Rectangle`, nunca `Cell`.
5. Linha de hoje em duas `ReferenceLine` com `ifOverflow="extendDomain"`: a de baixo em `var(--surface-raised)` é o halo que mantém a linha visível sobre a barra colorida, e a de cima em `var(--text-primary)`; o rótulo `hoje, dd/mm/aaaa` fica na margem do topo.
6. Faixa de período em `ReferenceArea` com `var(--surface-sunken)` e a palavra escrita na margem do topo (ANO-4).
7. Rótulo direto de cada barra pela escala do eixo (`useXAxisScale` e `useYAxisScale`), do lado em que cabe, com halo; cor fixa por categoria em tabela de slot, nunca pela posição.
8. Estados de fronteira: sem plano desenha só o realizado tracejado com a etiqueta, em aberto desenha até hoje com ponta tracejada, sem data de início sai do eixo e é listado abaixo, e recorte vazio troca o gráfico pelo bloco `role="status"` com o ícone `Filter` (EST-1).

## Versões

- `v1_calendario-de-campanhas-do-trimestre`: 8 campanhas fictícias entre 2026-10-01 e 2026-12-31. Demonstra a tupla `[início, fim]` num `BarChart` vertical, ticks mensais por `Date.UTC`, a linha de hoje do dado com rótulo no topo, a janela de congelamento em `ReferenceArea` e a cor fixa por plataforma com rótulo direto no lugar de legenda.
- `v2_progresso-contra-linha-de-base`: 6 iniciativas de 2027. Demonstra o `shape` com trilho do planejado e preenchimento até o percentual, o fim real convertido em pixel por `useXAxisScale`, o atraso escrito como `+12 d` com `var(--negative)` só nas atrasadas, o esperado até hoje contra o concluído e a linha sem plano tracejada.
- `v3_plano-hierarquico-por-publico`: 16 linhas em três níveis (público, iniciativa, entrega). Demonstra o tick customizado com indentação, dono e status, a barra de agrupamento fina pela envoltória das filhas, o status com ícone e palavra e a linha de hoje atravessando os três níveis.
- `v4_criativos-empacotados-com-periodo-aberto`: 35 criativos em faixas. Demonstra o empacotamento guloso determinístico, a pilha com gap sem marca por posição, o teto de 7 faixas com a barra `+N` e a lista na dica, a ponta tracejada de quem está em aberto e a lista dos sem data de início fora do eixo.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para uma pasta de visual da página, por exemplo `app/src/pages/<pagina>/visuals/<NomeDoGantt>/`.
2. Troque o `import` do `./data` pelo seletor real da página e passe `data` e `today` pelas props; a data de hoje continua vindo do dado ou do filtro de período da página, nunca de `Date.now()` dentro do componente.
3. Converta as datas da fonte para `YYYY-MM-DD` antes de passar; o componente soma um dia ao fim para o último dia ocupar a largura inteira.
4. Ponha o componente no corpo de um `VisualCard` com altura definida no pai e confira que a altura dá 12 px ou mais por barra: no canvas `largo` cabem 8 linhas, no `alto` cerca de 16.
5. Troque o estado vazio inline por `EmptyState` do Farol mantendo o sentido do texto (seção 16 do CONTRATO).
6. Rode `npm run typecheck` e `npm run lint` no `app/` e confira nos dois temas e a 390 px de largura.

## Referências

- Gantt, H. L. (1919). Organizing for Work: a barra de duração sobre escala comum de tempo é a forma original do modelo.
- [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): "Gantt" fica em Eventos e linha do tempo, ao lado da lista de marcos.
- [Recharts, exemplo de intervalo com tupla](https://recharts.github.io/en-US/examples/): `dataKey` devolvendo `[início, fim]` num `Bar` de layout vertical.
- Farol: `app/src/lib/format.ts` (`formatMonthShort`, `formatDate`, `formatDays`) e `app/src/components/visuals/charts/chartTheme.ts` (`AXIS_PROPS`).
- Pedido de formatador próprio: o Farol não tem `formatDateRange` para o par início e fim; as versões escrevem o período com `formatDate` nas duas pontas.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-08, quatro versões julgadas: `v2` e `v4` aprovadas, `v1` e `v3` reprovadas com parecer em `validation/revisao_20_cronograma-e-linha-do-tempo__01_gantt_2026-10-08.md`. Nada abaixo reprova; quem tocar o arquivo alinha.

- `v1`: `barCategoryGap="28%"` fica abaixo dos 30% da ESP-2 e não está declarado no `meta.json`; a barra mede 12 px e não há consequência no preview.
- `v1`: o rótulo direto da barra (`Busca paga, 31 dias`) sai em 11 px e em `font-sans` sem `tabular-nums`; a 17.1 pede 12 px para rótulo e a TIP-1 pede algarismo tabular.
- `v1`: o rótulo `Redes sociais, 47 dias` entra 12 px na faixa de congelamento, e o halo em `--surface-raised` abre um recorte da cor do cartão sobre a faixa `--surface-sunken` (pendência aberta da ROT-7).
- `v1`: a anotação `congelamento` traz o nome e não o período; a ANO-2 pede nome e valor, e as datas da faixa só se leem pela posição.
- `v1`, `v2`, `v3`, `v4`: a linha de leitura usa `truncate` e a cauda carrega número (`4 correm em paralelo`, `+13 d`, `2 em curso`, `4 sem data de fim`), o que a TIP-7 proíbe; no preview sobra largura e nada é cortado. A data do começo da frase fica fora do `kpi-number` (TIP-1).
- `v2`: ramo que o dado padrão não exercita: linha sem plano e sem início real recebe `hoje` como início (`Chart.tsx`, linha 120) e desenha um dia tracejado em hoje. Na escala do preview a marca teria 1,5 px e ficaria sob a linha de hoje; numa janela curta vira realizado que não existe. Trocar por `range` nulo e etiqueta própria.
- `v2`: o trilho do planejado (`--surface-sunken` com contorno `--line-strong`) mede 1,15:1 no preenchimento e 1,79:1 no escuro e 1,83:1 no claro no contorno. Passa pela isenção do número escrito na linha (17.2), mas a amostra `planejado` da legenda não tem número ao lado (TOK-5); contorno em `--text-muted` resolve os dois.
- `v2`: `no prazo` na coluna `atraso` aparece na linha que está 13 pontos atrás do esperado (58% contra 71%) e lê como "em dia"; `dentro da data` diz só o que a coluna mede.
- `v2`: a legenda não explica o tracejado: vermelho tracejado é atraso ainda em aberto e ciano tracejado é realizado sem plano, e só o segundo tem etiqueta.
- `v2`: 7 linhas de grade mensais numa área de plotagem de cerca de 160 px de altura, onde a EIX-4 pede de 3 a 5; os tiques não colidem. O `barCategoryGap="24%"` está declarado no `meta.json`.
- `v2`, `v3`: o ano `2027` está escrito à mão na frase acessível e precisa sair de `windowStart`; na `v2`, `+13 d` e `13 dias` são montados à mão, sem `formatDays`, e o singular sai errado com 1 dia.
- `v3`: cada público tem uma única iniciativa, então as 4 barras de público repetem as 4 de iniciativa; um público com duas iniciativas demonstraria a envoltória de verdade.
- `v3`: a frase acessível tem 235 caracteres e a terceira sentença é fixa e descreve o gráfico em vez de concluir; tirá-la devolve folga ao teto de 250 da ACE-1.
- `v3`: entrega sem datas (`range` nulo) fica com nome, dono e status e nenhuma barra, sem a palavra `sem data` no lugar. O `barCategoryGap="20%"` está declarado no `meta.json`.
- `v4`: ramo que o dado padrão não exercita: o empacotamento trata o criativo em aberto como encerrado em hoje mais um dia (`Chart.tsx`, linha 129), então um criativo com início futuro cairia na mesma faixa, por cima do rótulo `em aberto`, e o desenho diria que o aberto terminou. Tratar o aberto como ocupando a faixa até o fim da janela.
- `v4`: o caso de uso pergunta quais criativos não têm data de fim e o nome deles só existe na dica (DIC-1); há espaço livre à direita da ponta para `Criativo 01, em aberto`.
- `v4`: a barra `+16 criativos` é a envoltória de 16 períodos e não diz quantos seguem no ar; 9 dos 16 no ar em hoje estão dentro dela, e ela atravessaria um vazio se o excedente tivesse lacuna.
- `v4`: a guarda de vazio testa `data.length` e não os datados (EST-1b, DAD-6); um recorte só com criativos sem data de início desenha eixo e grade sem barra.
- `v4`: a lista `Sem data de início, fora do eixo` usa `truncate` sobre nomes que não estão na frase acessível (TIP-7) e junta com `e`, que lê mal a partir de três nomes.
- `v4`, `v2`: o halo da linha de hoje corta a ponta tracejada. Na `v4` sobra um resto de cerca de 4 px à direita da linha, porque a ponta termina em hoje mais um dia; na `v2` a borda direita das caixas tracejadas some sob a linha. Terminar o tracejado na linha de hoje limpa o desenho.
- `v4`: dois criativos consecutivos na mesma faixa sem dia de intervalo (o empacotamento aceita `to <= from`) ficam colados na mesma cor e leem como um só (COR-5); no dado padrão o menor intervalo é de 1 dia, 6,4 px. A dica do excedente lista 16 linhas e deve passar da altura do corpo: conferir no navegador.

Segunda revisão de 2026-10-08, depois da rodada de correção: `v1` e `v3` julgadas de novo pelo arquivo atual e aprovadas, sem bloqueante. Medido no render: o pico da `v1` dá 4 campanhas simultâneas (de 2026-11-20 a 2026-11-26), o rótulo `Busca paga, 31 dias` começa 12 px depois da linha de hoje, e o contorno da entrega planejada da `v3` mede 5,21:1 no escuro e 5,37:1 no claro. Das observações acima seguem valendo, na `v1`, o vão de 28%, o rótulo direto em 11 px sem `tabular-nums`, o halo de `Redes sociais, 47 dias` sobre a faixa, a anotação `congelamento` sem período e o `truncate` da linha de leitura; na `v3`, o ano escrito à mão, a envoltória repetida, a frase de 235 caracteres, a entrega sem datas e o `truncate`. Itens novos, nenhum reprova:

- `v1`: a nota do `meta.json` diz que a faixa de congelamento é opaca, mas o `ReferenceArea` do Recharts aplica `fillOpacity` de 0,5 por padrão e o `preview.svg` sai com `fill-opacity:0.5`. A faixa composta mede 1,08:1 no escuro e 1,07:1 no claro contra o cartão, onde a opaca mediria 1,15:1; ela se vê nos dois PNGs. Declarar `fillOpacity={1}` ou corrigir a nota.
- `v1`: o rótulo de `Retomada de outubro` foi para depois da linha de hoje e ficou a 95 px da ponta da barra, onde a ROT-2 pede a ponta livre. A leitura se mantém pela linha; o texto de 99 px caberia dentro da barra de 233 px, no par aprovado da ROT-6.
- `v1`: só o rótulo do lado direito desvia da linha de hoje. O ramo do lado esquerdo (`Chart.tsx`, linha 220) não confere, e uma barra que comece logo depois de hoje sem espaço à direita teria o halo do rótulo sobre a linha (ROT-7, marca fina). O dado padrão não exercita.
- `v1`: os rótulos do topo (`hoje, dd/mm/aaaa` e `congelamento`) dividem a mesma linha de base e nenhum desvia do outro; com hoje dentro da janela de congelamento os dois se sobrepõem (ROT-9). O dado padrão não exercita.
- `v3`: a nota do `meta.json` ainda diz contorno `var(--line-strong)` na entrega planejada, e o `Chart.tsx` (linha 290) usa `var(--text-muted)`; atualizar a nota.
- `v3`: a guarda de vazio testa todas as linhas e não as entregas (DAD-6); um recorte só com públicos e iniciativas desenha eixo e grade sem barra e escreve `0 de 0 entregas em atraso`.
- `v3`: as datas de início e fim das entregas não estão escritas em lugar nenhum (nem rótulo, nem dica, nem frase acessível); a leitura é pela grade trimestral, que basta para a distribuição no ano e não para o dia.
- `v3`: o aviso `ESPESSURA-MARCA` do check é esperado, porque a barra de agrupamento tem 5 px por especificação do catálogo.
