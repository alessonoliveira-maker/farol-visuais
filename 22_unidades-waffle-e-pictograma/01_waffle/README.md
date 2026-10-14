# Waffle 10x10

## O que é

Uma grade de quadrados iguais em que cada quadrado vale uma fração fixa do total, com a unidade escrita ao lado: a proporção se lê contando, e as linhas e colunas da grade servem de régua. O preenchimento segue ordem fixa, por colunas, de baixo para cima e da esquerda para a direita, para cada categoria formar um bloco contíguo. As contagens por categoria saem pelo método do maior resto e a grade fecha sempre em 100. O modelo cobre o waffle de uma fração só, o waffle empilhado de três a cinco categorias, os múltiplos comparativos com a mesma grade e o micro waffle de contagem de unidades reais. Feito em HTML com Tailwind, com a grade em `div` e `grid-rows` explícito, sem Recharts.

## Quando usar

- Uma fração dita como x de 100, como leads do mês com telefone válido (uma fração, 100 quadrados).
- Composição de 3 a 5 partes em que a categoria pequena precisa continuar visível, com contagem absoluta na legenda.
- A mesma fração em 3 a 9 grupos, com a mesma grade, a mesma unidade e o n escrito em cada um.
- Contagem pequena e inteira de coisas reais, até cerca de 20 unidades, em cartão ou em linha de tabela.
- Leitura de diretoria em que "36 de cada 100" comunica melhor que o ângulo de uma rosca.

## Quando evitar

- Decimal que decide, como 62,4% contra 62,1%: número com barra de progresso (13/01).
- Mais de 5 categorias: barra 100% empilhada (02) ou treemap (12/01).
- Fração contra meta que pode passar de 100%: barra de progresso e capacidade (13/01).
- Muitos grupos com uma fração cada: tabela com barra em célula (14/01).
- Contagem por categoria sem denominador natural: waffle em barras (22/02).
- Mais de cerca de 400 `div` na mesma peça: reduzir a grade ou trocar a técnica para SVG com `rect`.

## Anatomia

1. **Grade:** `div` em `grid grid-cols-N grid-rows-N`, com `grid-rows` explícito para a célula não esticar, vão de 2 px (1 px no micro) e raio de 2 px. A cor vai por `style` com `var(--chart-N)` ou `var(--text-*)`.
2. **Ordem de preenchimento:** função pura `fillOrder(linha, coluna)`, coluna a coluna e de baixo para cima; a célula pergunta se a posição dela é menor que a contagem pintada.
3. **Contagem de quadrados:** maior resto para composições, `Math.round` só quando há uma fração única; categoria abaixo de um quadrado fica com zero célula e vai para a legenda, sem célula forçada.
4. **Célula vazia:** `--surface-sunken` (ou `--line-subtle` onde o fundo é o palco). Ausência de dado em contorno `--line-strong`, tracejado quando é sem coleta, hachurado quando é categoria sem motivo registrado.
5. **Número exato:** `formatPercent` ao lado da grade, que pinta quadrados inteiros e nunca fatia célula; contagens por `formatInt`.
6. **Legenda e unidade:** amostra na forma da marca, contagem absoluta e percentual iguais à contagem de quadrados, e a linha "1 quadrado = N%" mais o n do total.
7. **Estados:** vazio com `role="status"` e `Filter`; sem coleta com `Unplug` e `formatUnavailable()`; amostra abaixo de n = 30 sem a fração e com o selo escrito.
8. **Frase acessível:** na raiz com `role="img"`, calculada do dado, com as células e o desenho em `aria-hidden`.

## Versões

- `v1_leads-com-telefone-valido`: uma fração, 194 de 312 leads, 62 quadrados e o texto 62,2%, legenda de unidade e n no rodapé. Quadrado, moldura `card`.
- `v2_desfecho-das-oportunidades-encerradas`: waffle empilhado com ganhas em `--chart-1`, perdidas e desqualificadas em dois neutros, sem motivo hachurado por último e transferida com 0,3% na legenda sem célula. Card.
- `v3_cobertura-de-origem-por-plataforma-e-mes`: nove waffles em matriz 3 por 3 com a mesma grade, pior grupo em cor, em peso 700 e nomeado junto do n, selo de amostra pequena e mês sem coleta tracejado. Alto. **Grade de 5 por 5, decisão D8**: nove grades de 100 `div` somam 900, acima do teto de cerca de 400 da família, então cada waffle tem 25 quadrados de 4% e a peça soma 225 `div`. O número escrito é a taxa exata e a legenda declara a unidade.
- `v4_micro-waffle-de-posicoes-por-fila`: micro waffle de 6 posições com quadrado de 6 px, vaga tracejada, conversão em grade de 100 com célula de 3 px, chip "menos de 1 em 100" em uma linha, volume escrito junto da taxa ("40 de 282 leads", contagens no `data.ts`), e fila sem ocupação ou sem base como indisponível com `Unplug`. KPI alto, moldura `stage`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e passe o dado real pela prop `data`.
2. A cor pertence à categoria: mantenha o mapa de categoria para cor vindo do dado ou da página, e nunca derive a cor da posição na lista ordenada.
3. Conferir a abordagem: a v1 e a v2 usam `@container` na raiz; coloque a peça numa célula com altura definida (v1 e v2 pedem o corpo de um cartão de 360 px de altura ou mais; a v3 pede 560 px).
4. Os estados vazio e indisponível estão inline com `role="status"`; ao colar, troque por `EmptyState` e `UnavailableState` do Farol mantendo o texto.
5. A v4 é o próprio cartão (`stage`): vai direto na grade de KPIs, numa célula de cerca de 280 px de altura.
6. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/` e confira os dois temas.

## Referências

- Estudo da família: `_estudo/familias/22_unidades-waffle-e-pictograma.md`.
- Método do maior resto: o mesmo de `01_cards-e-kpis/05_kpi-com-decomposicao/v1_receita-do-mes-entre-novos-e-carteira`.
- Molde SVG da mesma família, para comparar com a técnica de `div`: `_render/exemplos/22_unidades-waffle-e-pictograma/01_waffle-10x10`.
- Decisão D8 (catálogo pede `html-tailwind`, molde é SVG puro, v3 reduzida ao teto): `_operacao/DECISOES_PENDENTES.md`.

## Observações da revisão (não bloqueantes)

**2026-10-12, revisão independente das quatro versões.** `v1` e `v2` aprovadas; `v3` e `v4` reprovadas, com os bloqueantes em `validation/revisao_22_unidades-waffle-e-pictograma__01_waffle_2026-10-12.md`. O que segue não reprova e fica para quem tocar o arquivo.

- Modelo, README: "Quando evitar" perdeu o item do catálogo que manda a contagem pequena em forma circular para o anel segmentado (07/05).
- Modelo, TIP-4: `kpi-number` sem classe de peso pede Space Grotesk 400, que não é peso carregado, e sai no 500 por aproximação (`v1` em `n = 312`, `v2` na coluna de contagem, `v3` em `n =` e em "sem coleta", `v4` nas linhas de 11 px). Sem consequência visível.
- `v1`, TIP-1: quatro textos com algarismo em Manrope sem `tabular-nums` ("Leads de agosto de 2026", "194 de 312 leads" e os dois itens da legenda). Nenhum está em coluna, sem consequência visível.
- `v1`, pergunta 2: 194 e 312 aparecem duas vezes cada (frase ao lado do número, legenda e `n = 312`). A legenda pode ficar só com o que a frase não diz.
- `v1`, GEO-1: no canvas `quadrado` a grade de 210 px deixa cerca de 55 px livres acima e 60 px abaixo. Cabe grade maior ou canvas mais baixo.
- `v2`, NUM-2 e perguntas 6 e 27: os inteiros fecham 100 (36, 37, 18 e 9) e a linha de Transferidas acrescenta 0,3%, então o percentual impresso soma 100,3%. É o que o catálogo pede (0,3% listado ao lado de inteiros iguais à contagem de quadrados), não defeito de produção, e ficou relatado como tensão de régua para o dono decidir.
- `v2`, maior resto: a conta roda sobre a base sem as categorias abaixo de um quadrado (339, não 340). Com este dado o resultado é o mesmo; com várias categorias pequenas os quadrados delas seriam redistribuídos e a soma impressa cresceria. Preferir o maior resto sobre o total.
- `v2`, 17.2 e TOK-9: `--text-secondary` como preenchimento não tem papel na tabela (mede 8,16:1 e 8,13:1 contra o cartão). Marca contra marca, medido à mão: Ganhas contra Perdidas 1,16:1 no escuro e 1,35:1 no claro; Perdidas contra Desqualificadas 1,56:1 e 1,51:1. O destaque tem segundo canal na linha de leitura, mas "Ganhas" na legenda não muda de peso, e o par medido não está no `notes`.
- `v2`, ACE-3: a ausência hachurada em `--line-strong` mede 1,79:1 e 1,83:1 contra o cartão. Vale pela isenção do valor escrito (9% e 31 na legenda) e é o token que o catálogo pede, mas a 17.2 dá contorno `--text-muted` à ausência.
- `v2`, ramo não renderizado: `NEUTRAL_COLORS` tem dois tons, e um terceiro bloco neutro com 1% ou mais repetiria `--text-muted` e ficaria sem identificação. Declarar o limite no tipo ou no README.
- `v2`, comentário: `stackOrder` diz que o dado vem do maior para o menor, mas Ganhas (121) vem antes de Perdidas (126). A ordem real é o destaque primeiro.
- `v2`, ACE-1, redação: a frase acessível (230 caracteres) repete "ganhas" e começa a terceira oração em minúscula ("As ganhas ocupam 36 de 100. ganhas, 36; perdidas, 37").
- `v2`, TIP-1: "36 de cada 100 foram ganhas" e "menos de 1 quadrado" sem `tabular-nums`.
- `v2`, 17.7: itens da legenda com `space-y-1` (4 px) contra os 10 px da tabela. Sem consequência visível.
- `v2`, pergunta 21: a célula é fracionária (225 px de corpo dão 20,7 px por célula), e o PNG do SVG e o da página divergem numa linha e numa coluna de bordas. Pela contagem do revisor, que não é a da ferramenta, 0,48% dos pixels no escuro e 0,49% no claro, contra 0,02% a 0,04% nas outras três.
**2026-10-12, correção após a reprovação.** `v3`: segundo canal no pior grupo (peso 700 e "pior grupo" junto do n), altura fixa do bloco de texto, célula vazia com contorno. `v4`: contagens no `data.ts`, volume junto da taxa, chip em uma linha, ausência de base com `Unplug`, frase com o tipo do gráfico. Falta nova revisão.

- `v3`, D8: com 4% por quadrado, quatro grupos de 78,6% a 81,3% desenham os mesmos 20 quadrados, e 54,1% desenha 14 (56%). O caso de uso diz "de cada 100" e a grade se conta de 25. Dado para a decisão do dono.
- `v3`, TIP-1: cabeçalhos de mês ("jun/26") sem `tabular-nums`.
- `v3`, tipografia: "sem coleta" sai em Space Grotesk porque divide com o n o parágrafo de classe `kpi-number`.
- `v3`, ESP-1: `size-[72px]` com quatro vãos de 2 px dá célula de 12,8 px. Com 68 ou 78 px a célula fica inteira.
- `v3`, EST-3, ramo não renderizado: `total` igual a 0 cai em "sem coleta", e zero lead medido não é falta de coleta.
- `v3`, ACE-1, ramo não renderizado: a frase acessível (233 caracteres) lista pelo nome todo grupo de amostra pequena e sem coleta, e com mais de um de cada passa de 250.
- `v4`, ACE-3: a célula vazia da grade de 100 em `--line-subtle` mede, sobre o palco (`--surface-canvas`), 1,37:1 no escuro e 1,21:1 no claro. O `notes` cita 1,25:1, que é a medida da guarda contra o cartão. Vale pela isenção do valor escrito.
- `v4`, 17.7: o README diz que a peça é o próprio cartão, mas a raiz não desenha cartão (`p-4 rounded-lg border border-line-subtle`). O acervo tem precedente aprovado dos dois jeitos.
- `v4`, seção 5: medidas de desenho escritas na classe (`size-[39px]`, `w-[104px]`) e não em constante nomeada no topo.
- `v4`, catálogo: a vaga de 6 px com borda tracejada de 1 px lê como contorno contínuo; o tracejado não se distingue nesse tamanho.

**2026-10-12, segunda passada, depois da correção.** `v3` e `v4` aprovadas, sem bloqueante. Conferido nos PNGs dos dois temas: as nove grades da `v3` alinham no pixel (topo em 308, 548 e 788 e base em 451, 691 e 931, na escala 2) e pintam 20, 20, 20, 16, 14, 20 e 21 quadrados; as grades da `v4` pintam 14, 10, 6 e 0 células e o chip sai em uma linha. As observações anteriores das duas seguem valendo, salvo a medida `w-[104px]` da `v4`, que hoje é `w-36`. O que segue é novo.

- `v4`, pergunta 21 e GEO-17: o preview diverge da página em 0,55% (escuro) e 0,56% (claro) dos pixels, pela contagem do revisor com o comparador da ferramenta, e o render gravou os `.diff.png`, que só existem acima de 0,5%. É a faixa de aviso do contrato (erro só acima de 2%). Toda a diferença está na linha "ocupação indisponível": ícone de 12 px, vão de 4 px e texto de 113 px pedem 129 px, e a coluna da esquerda ficou com 125 px depois que a da direita passou a `w-36`. Na página o texto invade 4 px do vão e para a 9 px da grade, sem colisão; no arquivo o ícone encolhe para 8 px, porque o serializador não leva `flex-shrink: 0` para o `<svg>` clonado. Com `w-32` na coluna da direita, cujo texto mais largo mede 121 px, a da esquerda volta a 141 px. Conta sobre o PNG, não testada.
- `v4`, README: o passo 5 de "Como colar no Farol" dá a altura da célula e não a largura. O bloco da direita é fixo em 191 px, então a peça pede 364 px de largura para a linha de ocupação caber, e o canvas tem 360.
- `v4`, ACE-1 e DAD-5: a frase acessível diz "sem ocupação" e, no ramo não renderizado, "sem conversão", onde o corpo escreve `formatUnavailable()`. Quem ouve pode entender fila vazia, e o `data.ts` avisa que nulo não é fila vazia. Usar o mesmo texto do corpo na frase. Ela também segue listando valores sem conclusão e sem o volume que o corpo escreve.
- `v4`, NUM-6 e moldura `stage`: com a troca de "viram venda" por "40 de 282 leads", o corpo deixou de nomear a venda, e "4 de 6" nunca nomeou a posição. No preview o título e o caso de uso da moldura resolvem; no Farol a peça vai à grade sem `VisualCard`, e o nome das duas medidas fica por conta da página. Escrever "40 de 282 leads viraram venda", ou dizer no passo 5 que a página dá o título.
- `v3`, ramo não renderizado: a matriz fixa três meses na classe (`repeat(3, ...)`) e o tipo aceita qualquer quantidade; com dois ou quatro meses as linhas desalinham. `grid-cols-5 grid-rows-5` também repete `GRID` à mão.
- `v3`, ramo não renderizado: com `Math.round`, taxa de 98% ou mais pinta os 25 quadrados sem ser 100%, e abaixo de 2% não pinta nenhum sem ser zero. A `v4` resolve o mesmo caso com o chip.
- `v3`, ramo não renderizado: com um único grupo medido, ele sai marcado como pior grupo.
- `v3`, redação: "selo abaixo de n = 30", no rodapé, não diz o que o selo faz. Sugestão: "abaixo de n = 30 a fração não é publicada".
