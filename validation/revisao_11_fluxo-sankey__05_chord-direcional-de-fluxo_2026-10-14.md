# Parecer de revisão: 11_fluxo-sankey/05_chord-direcional-de-fluxo

Data: 2026-10-14. Revisão independente de `v2`, `v3` e `v4`, as três com motivo `sem_revisao`. Julgado o arquivo de hoje (Chart.tsx de 2026-09-29, PNGs de 2026-10-02, mais novos que o código), com `npm run check -- 11_fluxo-sankey/05_chord-direcional-de-fluxo` em 0 erros e 1 aviso (CONTRASTE-MARCA na `v2`).

Resultado: `v3` aprovada; `v2` e `v4` reprovadas. Há uma única rodada de correção, e os dois bloqueantes abaixo são todos os encontrados. As observações não bloqueantes das três versões estão no README do modelo, seção final; uma delas, da `v2`, vale corrigir na mesma rodada e está repetida aqui.

Tokens usados nas medidas, de `app/src/styles/tokens.css`, contra `--surface-raised` (#121c2e no escuro, #ffffff no claro): `--line-strong` 1,79:1 e 1,83:1; `--text-muted` 5,21:1 e 5,37:1. Entre marcas, contra `--text-muted`: `--chart-3` 1,24:1 (escuro) e 1,15:1 (claro); `--chart-5` 1,13:1 e 1,16:1; `--chart-6` 1,42:1 e 1,00:1.

## v2_foco-na-pre-vendas: reprovada

Não: 32, 20, 11.

**Bloqueante 1. Perguntas 32, 20 e 11; regras ACE-6, ACE-3 e tabela 17.2 (papel "Neutro de dado, com valor escrito"); armadilhas TOK-1 e TOK-5.**
Evidência: `Chart.tsx:68` define `DIMMED_FILL = 'var(--line-strong)'` e `Chart.tsx:237` pinta com ele toda fita que não toca a Pré-vendas: Executivo e Relacionamento (78 e 66), Executivo e Especialista de produto (41 e 47), Relacionamento e Especialista de produto (34 e 29). O check mede as 3 marcas em 1,79:1 no escuro e 1,83:1 no claro, abaixo dos 3:1. A tabela 17.2 só aceita `--line-strong` como dado "quando cada marca carrega o próprio número", e nenhuma das seis contagens aparece na tela: o que está escrito junto do arco é o total que a função envia (142, 121, 92), não o valor da fita. O `notes` do `meta.json` e o item 1 de "Desvios do catálogo" do README alegam a isenção "com o valor de cada arco escrito ao lado", e ela não se aplica, porque o arco não é a marca apagada. Teste da ACE-6: tapadas as três fitas, some quanto Executivo, Relacionamento e Especialista de produto trocam entre si, que é o contexto que a versão decidiu manter na roda. A ACE-6 nomeia a ligação de fluxo como traço que carrega a relação. Precedentes da família, com o mesmo desenho de foco e contexto: `03_alluvial/v2` e `04_parallel-sets/v2`, reprovadas hoje, e `02_sankey-multietapa/v1`, em 2026-10-05.
O que mudar: trocar `DIMMED_FILL` para `var(--text-muted)` opaco, o "Neutro de dado, sem valor escrito" da 17.2 (5,21:1 e 5,37:1). A ACE-5 continua proibindo os 15% do catálogo, então o desvio declarado permanece, só com outro token. Atualizar junto o que hoje afirma a isenção: o comentário do topo (`Chart.tsx:15` a `17`), o de `Chart.tsx:67`, o `notes` do `meta.json`, o item `v2` de "Versões" e o item 1 de "Desvios do catálogo" no README.

**Medição que a correção precisa fazer, pela TOK-9 (não é bloqueante hoje, vira consequência da correção).** Depois da troca, as fitas acesas ficam quase na mesma luminância das apagadas: contra `--text-muted`, `--chart-3` mede 1,24:1 e 1,15:1, `--chart-5` 1,13:1 e 1,16:1, e `--chart-6` 1,42:1 no escuro e **1,00:1 no claro**. O foco passaria a depender só do matiz (COR-2, ACE-2). O nome em 700 e a anotação já são segundo canal fora da fita; falta um na própria fita. A saída que a revisão de `18_radar/06_coordenadas-paralelas/v2` aceitou, e que o parecer de `03_alluvial/v2` repete, é revestir as fitas acesas com `--surface-raised` mais largo que o contorno das apagadas. Medir o par marca contra marca nos dois temas e escrever o número no `notes`.

**Corrigir junto (não bloqueante, registrado no README).** A linha de leitura fixa o verbo e só calcula o número (`Chart.tsx:332` a `349`). No dado padrão as outras três funções recebem mais do que enviam (Executivo 142 contra 299, Relacionamento 121 contra 164, Especialista de produto 92 contra 106), então com `highlightId` em qualquer uma delas, que é a prop que a versão existe para demonstrar, a linha sai "entrega −157 repasses mais do que recebe". Escolher o verbo pelo sinal de `netSent` e escrever o valor absoluto.

Conferido e sem bloqueante: 629 repasses fecham nos quatro arcos (274, 142, 121, 92); Pré-vendas envia 274 e recebe 60, saldo 214, e o par principal confere com o dado (186 e 23); fita acesa com `m[i][j]` na borda de i e `m[j][i]` na de j, na cor do parceiro por `slot` (COR-3), desvio declarado; slots 1, 3, 6, 5 (COR-8); 700 em dois elementos, nome em foco e saldo (TIP-3, com a observação do README); 12 e 11 px, algarismo tabular em todo número (TIP-1, TIP-2); anotação de 49 caracteres com nome e as duas contagens (ANO-2); vazio e soma zero em `role="status"` com `Filter` (EST-1); `viewBox` igual ao corpo, escala 1, guardas de texto medindo; nenhum corte nem colisão nos dois PNGs; fita mais fina 21,4 px no pé.

```
Versão: 11_fluxo-sankey/05_chord-direcional-de-fluxo/v2_foco-na-pre-vendas
Data: 2026-10-14
Resultado: reprovada
Não: 32, 20, 11
Correções:
  32. ACE-6 e 17.2: fitas fora de foco em --text-muted no lugar de --line-strong, com segundo canal na fita acesa medido contra elas.
Não se aplica: 6, 18, 26, 27, 28, 29, 30, 31
```

## v3_reatribuicao-entre-executivos: aprovada

Sem bloqueante. 137 reatribuições fecham nos oito arcos, em ordem decrescente (29, 24, 20, 17, 15, 13, 11, 8); os 6 pares abaixo de 3 trocas (A e F, B e F, B e G, C e F, D e G, E e H) ficam fora do desenho, com a sub-fatia reservada no arco e a anotação de 48 caracteres declarando o corte; nenhum par desenhado tem ponta zero, e a fita mais fina, de 1 reatribuição, mede 6,8 px no pé e chega às duas pontas nos dois temas; slots 1, 3, 6, 5, 2, 4 e `--text-muted` (5,21 e 5,37:1) nos dois sem slot, com o nome escrito em todo arco (COR-4, COR-8, ACE-2); par líder A e B com 21 e saldo de 3 conferido no dado (12 contra 9); `viewBox` na escala 1 e as guardas de texto medindo. Observações no README, entre elas o sentido ambíguo de "saldo de 3 para Executivo A".

```
Versão: 11_fluxo-sankey/05_chord-direcional-de-fluxo/v3_reatribuicao-entre-executivos
Data: 2026-10-14
Resultado: aprovada
Não: nenhum
Não se aplica: 6, 18, 26, 27, 28, 29, 30, 31
```

## v4_muitas-equipes-com-saida-para-matriz: reprovada

Não: 15, 19, 12.

**Bloqueante 1. Perguntas 15, 19 e 12; regras ACE-2 e 14.1 (identificação das marcas; constante com consequência visível, marca partida).**
Evidência: o dado tem um par de mão única de propósito (`data.ts:51`): Outras manda 5 repasses para a Equipe Litoral e a Litoral não manda nada para Outras. `Chart.tsx:219` desenha a fita mesmo com uma ponta zero, e `ribbonPath` (`Chart.tsx:102` a `115`) leva as duas quadráticas ao mesmo ponto na borda da Litoral, com o centro como controle. A largura da fita ao longo do caminho é então t² vezes o pé de 14,2 px, contado a partir da ponta zero, e o contorno `--surface-raised` de 1,5 px (`Chart.tsx:77` e `78`) cobre o que fica fino. Medido nos dois PNGs pela cor da fita (#0f7a55 no claro, #3fbf8f no escuro): a tinta verde vai de y 321 a y 531 da imagem em escala 2 e acaba em (878, 531), isto é cerca de (406, 180) do `viewBox`, na metade do comprimento da curva (229 px). A ponta da Litoral fica em (298, 161) do `viewBox`, a uns 110 px dali, e nesse trecho não há tinta nenhuma em nenhum dos dois temas. Na tela, uma fita sai do arco de Outras e para no meio da roda; nada a liga à Litoral além da cor verde, que é a do slot 4. O destino da marca depende só da cor (ACE-2), e a fita lê como partida. É exatamente o caso difícil que o `data.ts` declara exercitar.
O que mudar: fazer a fita de mão única chegar visível ao arco da Litoral nos dois temas, sem publicar largura nessa ponta, que mede zero. Caminhos possíveis, a escolher pelo produtor: um desenho de ponta que afine de forma linear e não quadrática até o arco; uma ponta em seta tocando o arco, como o `ribbonArrow` da referência do d3; ou outro que cumpra o critério. Critério de aceite, conferido nos dois PNGs: tinta contínua da fita do pé em Outras até a borda interna do arco da Litoral, sem pé falso na Litoral, e sem se confundir com a fita de Oeste e Litoral, cujo pé está colado nessa ponta. Atualizar o `notes` e o README se a geometria mudar. Remover o par de mão única do dado não resolve: é o caso que a versão declara demonstrar.

Conferido e sem bloqueante: 355 repasses entre arcos fecham nos sete arcos (74, 61, 52, 44, 37, 29, 58) e, com os 19 internos, dão 374; Outras com "(n=8)" no rótulo e por último, em `--text-muted` (COR-4); slots 1, 3, 6, 5, 2, 4 (COR-8); taxa com volume por `formatRateWithVolume`, 77 de 374 (DAD-1); 700 em um elemento só; 12 e 11 px com algarismo tabular; botão de 12 px em `--text-secondary`, a cerca de 330 px do fim da linha de leitura e sem encostar em nada; `role="figure"` na raiz para o botão continuar acessível; desvio da matriz por `onShowMatrix` declarado no `notes` e no README; vazio em `role="status"`; demais fitas visíveis nas duas pontas (a mais fina, 3 repasses, 8,5 px no pé); nenhum corte nem colisão de texto nos dois PNGs.

```
Versão: 11_fluxo-sankey/05_chord-direcional-de-fluxo/v4_muitas-equipes-com-saida-para-matriz
Data: 2026-10-14
Resultado: reprovada
Não: 15, 19, 12
Correções:
  19. ACE-2 e 14.1: a fita de mão única de Outras para a Equipe Litoral precisa chegar visível ao arco da Litoral nos dois temas, sem pé falso.
Não se aplica: 6, 18, 26, 27, 28, 29, 30, 31
```
