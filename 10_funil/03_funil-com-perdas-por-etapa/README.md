# Funil com perdas por etapa

## O que é

Cada etapa do funil vira uma barra horizontal empilhada, dividida em avançou, perdido (opcionalmente quebrado por motivo) e em andamento. A forma responde onde e por que se perde: lê se da esquerda para a direita, e a soma dos três segmentos sempre fecha com o volume que entrou naquela etapa. É o modelo da família feito para dado de retrato de pipeline, em que a diferença entre duas etapas não é perda pura porque parte ainda está em andamento.

**Decisão de acabamento própria deste modelo:** toda taxa de perda vem por `formatRateWithVolume`, que já escreve o percentual junto do par de contagem ("28,1% (118 de 420)"). Isso obriga cada número a nomear a etapa contra a qual foi calculado, porque 30% de uma etapa e 30% do topo do funil são números diferentes e o contrato não deixa a tela confundir os dois.

## Quando usar

* Perguntar em qual etapa e por qual motivo as oportunidades saem, com até 5 motivos nomeados mais "Outros motivos" quando a cauda for mais longa.
* Dado de retrato do pipeline num dia ou numa semana, em que parte de cada etapa ainda está em andamento e precisa aparecer como tal.
* Revisão de perdas do Comercial e de descarte da Pré-vendas, etapa por etapa, com 3 a 6 etapas.
* Cadastro incompleto, em que uma fração da perda não tem motivo registrado: o modelo separa essa lacuna do motivo real em vez de escondê-la.

## Quando evitar

* Dado sem o segmento "em andamento" ou que não fecha com o volume da etapa: não publicar, porque o gráfico passaria a inventar perda onde há apenas trabalho em curso.
* Mais de 5 motivos sem agrupar a cauda: agrupar em "Outros motivos", ou usar o modelo `19_cascata-waterfall/02_cascata-de-decomposicao` para decompor uma única etapa.
* Quando só o volume por etapa importa e não a causa da perda: usar `10_funil/01_funil-em-barras-com-taxa-de-passo`.
* Largura de celular com muitos segmentos rotulados: mostrar só avançou, perdido e em andamento, sem a quebra por motivo.

## Anatomia

1. **Régua do eixo (nome + entrada).** Cada etapa recebe duas linhas no eixo: o nome em `--text-primary` 12 px semibold e, abaixo, quantas oportunidades entraram nela, em `--text-muted` 11 px tabular. É o denominador que todas as taxas da linha citam.
2. **Barra empilhada.** `BarStack` com um `Bar` por segmento, todos no mesmo `stackId`, na mesma ordem em todas as etapas: avançou primeiro, depois o perdido (inteiro ou por motivo, em slots categóricos fixos pela COR-8), em andamento por último.
3. **Avançou.** Sempre `var(--positive)`: o único segmento que carrega sentido de bom resultado, e por isso o único a usar token semântico como preenchimento fixo.
4. **Perdido.** Na versão básica, um segmento só em `var(--negative)`. Nas versões com motivo, de 3 a 5 segmentos em `--chart-1`, `--chart-3`, `--chart-6` (e `--chart-5`, `--chart-2` quando há cinco), na ordem da legenda.
5. **Sem motivo registrado.** Só na versão de cadastro incompleto: um segmento hachurado (`pattern` em `defs`, traço `--line-strong` sobre `--surface-raised`, com `useId` para o padrão nunca colidir entre instâncias), sempre separado dos motivos reais.
6. **Em andamento.** Sempre `var(--line-strong)`, por último na pilha: é o segmento cujo valor precisa estar escrito ao lado (`N em andamento`), porque a marca mede 1,79:1 no escuro e 1,83:1 no claro contra o cartão, abaixo do piso de marca da ACE-3, e só a isenção do valor escrito aprova o par.
7. **Rótulo de fechamento, na ponta livre.** `LabelList` no último segmento (`x + width` do próprio segmento, que nas pilhas equivale à ponta da barra inteira) escreve os absolutos de quem seguiu e de quem saiu (`N seguiram, N perdidos`), a taxa do motivo líder com `formatRateWithVolume` e o `N em andamento`, sempre contra o `entered` ou o `lost` daquela etapa, nunca contra o topo do funil: nenhum número aparece sem dizer contra qual base foi calculado.
8. **Legenda.** Lista horizontal acima do gráfico, na ordem visual da pilha, com uma amostra quadrada por segmento (ROT-4); o motivo "sem motivo registrado" usa a mesma textura hachurada da barra.

## Versões

* **[`v1_avancou-perdido-em-andamento`](./v1_avancou-perdido-em-andamento/):** a base da família, avançou, perdido e em andamento por etapa, com o fechamento auditado no dado e a linha de leitura apontando a etapa de maior taxa de perda.
* **[`v2_perdas-por-motivo`](./v2_perdas-por-motivo/):** quebra o perdido de cada etapa em cinco motivos (Sem perfil, Sem contato, Timing, Concorrência, Preço) em cores categóricas fixas, com o motivo líder de cada etapa nomeado sobre o próprio perdido.
* **[`v3_descarte-da-pre-vendas-clientes-novos`](./v3_descarte-da-pre-vendas-clientes-novos/):** caso denso da Pré-vendas com motivo de descarte por etapa e a prop `apenasClientesNovos` recalculando o recorte sem esticar a escala, porque o domínio vem sempre do recorte completo.
* **[`v4_perdas-sem-motivo-registrado`](./v4_perdas-sem-motivo-registrado/):** caso limite de cadastro incompleto, 38,1% das perdas do trimestre não têm motivo registrado, num segmento hachurado separado dos motivos conhecidos, nunca somado a "Outros motivos".

## Como colar no Farol

1. Escolha a versão pelo caso de uso: `v1` para o funil de perdas genérico, `v2` quando o motivo da perda for a pergunta, `v3` quando existir o alternador "apenas clientes novos" do Farol, `v4` quando o cadastro da unidade for incompleto.
2. Ao ligar o dado real, garanta a mesma auditoria feita aqui antes de publicar: `advanced + perdido (ou soma dos motivos) + inProgress` precisa fechar com `entered`, e o `entered` de uma etapa precisa ser o `advanced` da etapa anterior. Sem isso o visual inventa perda.
3. Nas versões `v2` a `v4`, a lista de motivos ou de estágios (`motives`, `stages`) é dado, não configuração de tela: mantenha a ordem que veio do CRM, porque é ela que fixa a cor de cada motivo no tempo.
4. Em `v3`, o alternador do Farol passa `apenasClientesNovos` como prop; o domínio compartilhado (`sharedDomainMax`) precisa continuar vindo do recorte completo, nunca do recorte filtrado, para a troca não esticar a escala.
5. `MARGIN.right` reserva espaço para o rótulo de fechamento na ponta livre; se o Farol cortar texto, aumente a margem antes de encurtar a frase.

## Referências

| Referência | O que observar |
|---|---|
| [AG Charts, Funnel Series](https://www.ag-grid.com/charts/javascript/funnel-series/) | Área de drop off com a cor da barra em opacidade reduzida; `spacingRatio` e `stageLabel` como referência de rótulo por etapa |
| [Graphtelling, Funnel Chart Alternatives](https://graphtelling.com/blog/funnel-chart-alternatives/) | Mesma linha de base, trilho com a população inicial, taxa de passo e queda absoluta lado a lado |
| [Towards Data Science, Telling your data story with funnel visualizations](https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/) | Barras para achar onde a jornada perde gente, em vez da silhueta afunilada |
| [Behance, Sales Conversions KPI Dashboard](https://www.behance.net/gallery/137208383/Sales-Conversions-KPI-Dashboard) | Funil de vendas dentro de um painel de conversão, com faixa de KPIs e colunas de conversão |

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18, sobre os PNGs dos dois temas e o `npm run check` com 0 erro e 0 aviso._

* **v1:** o total da etapa vive na régua do eixo ("420 entraram") e não no `LabelList` do último segmento, como o catálogo descreve; o número está na tela, apenas em outro lugar.
* **v1:** o rótulo de fechamento imprime o mesmo 118 duas vezes na mesma linha de leitura ("118 saíram" e "perda 28,1% (118 de 420)"); é redundância, não erro.
* **v2:** o catálogo pede rótulo interno no maior motivo a partir de 48 px, mas com este dado nenhum motivo chega ao piso da ROT-7 (largura do texto mais 16 px, e marca de 18 px), então nomear o motivo líder fora da barra é a saída certa; quem mantém o catálogo precisa corrigir a entrada.
* **v2 e v3:** o catálogo escreve "cinco motivos em `--chart-1` a `--chart-5`" e as versões usam os slots 1, 3, 6, 5, 2 da COR-8, que é o que o contrato manda; a divergência é do catálogo.
* **v2, v3 e v4:** a leitura estrita da COR-8 proíbe `--chart-2` em visual que pinta semântica no próprio corpo, e as versões pintam "Avançou" em `--positive` junto de um motivo no slot 2; o risco real, o `--chart-4` com o mesmo hex de `--positive`, foi evitado de propósito, mas vale uma decisão do dono do contrato.
* **v1 a v4:** `VALUE_LABEL_GAP = 8` onde a tabela 17.7 fixa 6 px entre o rótulo e a ponta da barra.
* **v2 e v3:** nas etapas menores os motivos caem para poucos pixels e só o motivo líder continua legível; além disso, `segmentShape` desconta 1,5 px de vão da largura, então um segmento mais estreito que o vão some da tela sem sumir do texto.
* **v3:** o agrupamento em "Outros motivos" citado pelo catálogo não aparece porque o dado tem exatamente cinco motivos; a rotina não é exercitada em nenhuma versão do modelo.
* **v4:** a hachura usa `--surface-raised` fixo, a mesma pendência aberta do halo na ROT-7: colada sobre outra superfície do Farol, a textura erra o fundo.

### Correção de 2026-09-18 (rodada do revisor independente)

Reprovação por ACE-3 nas três versões (`v2`, `v3`, `v4`): o segmento "Em andamento" mede 1,79:1 (escuro) e 1,83:1 (claro) contra o cartão, abaixo do piso de marca, e nenhuma das três escrevia o valor ao lado, a única isenção da tabela 17.10. Corrigido acrescentando `N em andamento` ao rótulo de fechamento das três, no mesmo padrão que o `v1` já usava. Aproveitada a mudança para também escrever `N seguiram` ao lado de `N perdidos`/`descartados`, por decisão do dono do modelo: perda por etapa exige o absoluto de quem entrou, seguiu e saiu, nomeado com a base do próprio cálculo, nunca só a taxa.

* O rótulo de fechamento de `v2`, `v3` e `v4` passou de 2 para 3 linhas. Em `v4` (canvas menor, 4 etapas), a linha extra estourava o corpo do preset `card`: o canvas foi fixado por número em `meta.json` (640 x 420, com a conta e o motivo em `notes`, conforme a ESP-6), 60 px acima do preset. `v2` e `v3` couberam nos próprios presets (`largo`) sem mudança de canvas.
* `seguiram` e `perdidos`/`descartados` foram escritos numa linha só ("N seguiram, N perdidos") em vez de duas linhas separadas como no `v1`, para não crescer ainda mais o rótulo; o `npm run check` mediu 0 erro e 0 aviso nas quatro versões depois do ajuste, inclusive COLISAO-TEXTO.
* Os apontamentos de `VALUE_LABEL_GAP`, do slot `--chart-2` junto de `--positive` e da COR-8 (linhas acima) não são bloqueantes pelo checklist desta rodada e não foram mexidos.

### Rodada de 2026-09-19 (revisor independente)

`npm run check` com 0 erro e 0 aviso nas quatro versões; as quatro aprovadas, sem nenhum bloqueante. Observações novas, todas não bloqueantes:

* **v2, correção de uma observação anterior:** a linha acima diz que nenhum motivo chega ao piso da ROT-7, mas medido no PNG o "Sem perfil" da etapa Aberta tem cerca de 110 px de largura e a marca tem 22 px de espessura, ou seja passa nos dois pisos (texto mais 16 px, e 18 px de marca). O que de fato impede o rótulo dentro da barra é a ROT-6: só existe par aprovado de texto sobre `--chart-1`, e os motivos ocupam também `--chart-3`, `--chart-6`, `--chart-5` e `--chart-2`. A decisão de nomear o motivo líder fora da barra continua certa; muda só o motivo dela.
* **v4:** na etapa Negociação os três motivos conhecidos caem para cerca de 2 px de largura desenhada cada um (4 e 5 oportunidades num corpo de cerca de 298 px, já descontado o vão de 1,5 px). As marcas continuam visíveis nos dois temas, mas nessa espessura a cor deixa de ser lida; quem carrega o número ali é o texto da ponta livre. Se o recorte real tiver etapas ainda menores, a saída da ESP-2 é subir a altura, nunca afinar mais.
* **v3:** nenhum dos dois PNGs mostra `apenasClientesNovos` em `true`, então o alternador de recorte, que é o motivo de existir da versão, fica sem prova visual no catálogo; quem colar precisa conferir a troca no Farol.
* **v1 e v2:** o `XAxis` leva `dataKey="entered"` embora o domínio venha da própria pilha; a prop não muda o desenho e pode induzir quem copiar o padrão a achar que o eixo depende dela.
