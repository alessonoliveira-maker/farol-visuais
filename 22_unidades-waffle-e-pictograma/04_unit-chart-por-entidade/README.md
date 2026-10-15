# Unit chart por entidade

## O que é

Um marcador por item real (oportunidade, conta, lead), agrupado em colunas por uma categoria e ordenado dentro do grupo pelo atributo que vira cor. Diferente do waffle, a unidade é a entidade e não uma fração: cada quadrado tem chave estável, dica com os dados do item e pode abrir o registro. Lê-se contando quadrados por coluna, com a contagem escrita no topo do grupo e o nome na base. Feito em SVG puro em React, com a grade de cada grupo calculada em TypeScript, de baixo para cima e com colunas fixas.

## Quando usar

- Cada item importa e pode ser aberto: oportunidades abertas por etapa, contas por executivo.
- De 20 a cerca de 1.500 itens, distribuídos em 3 a 8 grupos.
- Um atributo por item que vira cor, como dias sem movimento, lido como bloco no topo do grupo.
- Carga contra teto por pessoa, com a moldura do teto desenhada no próprio grupo.

## Quando evitar

- Só a contagem por grupo interessa, sem abrir item: waffle em barras (22/02).
- Distribuição de um valor contínuo por item: strip plot e beeswarm (16/03).
- Mais de cerca de 1.500 itens: agregar a unidade, como a v4, ou usar colunas (03).
- Leitura em linha de tabela ou cartão estreito: micro waffle de contagem (22/01).
- Estado de cada item ao longo do tempo: lasagna (15/06).

## Anatomia

1. **Grade do grupo:** função pura que põe o índice `i` na coluna `i % COLS` e na linha `floor(i / COLS)`, com a linha 0 na base. `CELL` de 10 px, `GAP` de 2 px, raio de 1,5 px, tudo em constantes no topo.
2. **Marcador:** um `rect` com `key` pelo id do item, preenchido com `var(--chart-N)`, `var(--seq-N)` ou `var(--warning)`. Em v1 e v2 a dica é um `<title>` com `formatCurrencyCompact` e `formatDays`.
3. **Ordem de preenchimento:** pelo atributo que vira cor (v2) ou pelo mais antigo na base (v1), então a faixa crítica forma um bloco contíguo.
4. **Contagem e nome:** contagem exata por `formatInt` em `kpi-number` acima do grupo; nome da etapa abaixo, em até 2 linhas e sem truncar.
5. **Moldura do teto e excedente (v3):** `rect` tracejado 3 3 em `--text-muted` com a capacidade; o que passa dela sobe em `--negative`, com `+N acima do teto` escrito.
6. **Reagrupamento (v3):** o layout é calculado antes e depois da troca e cada elemento anima por transform (Web Animations), sem animar quando o usuário pede menos movimento.
7. **Ausência (v4):** grupo sem etapa por último, quadrados de contorno tracejado em `--text-muted`.
8. **Estados:** vazio com `role="status"` e `Filter`; frase acessível na raiz, calculada do dado.

## Versões

- `v1_oportunidades-abertas-por-etapa`: 155 oportunidades em 5 etapas, 10 px por quadrado, dica por item. Canvas `card`.
- `v2_oportunidades-paradas-por-etapa`: três faixas de dias sem movimento, contorno na faixa crítica e nota direta ligada à etapa com mais paradas. Canvas `card`.
- `v3_carteira-de-contas-por-executivo`: seis carteiras contra o teto de 120, excedente em `--negative`, troca de agrupamento animada e marcadores como botões. Canvas `largo`.
- `v4_leads-por-etapa-com-sem-etapa`: 1.900 leads agregados em 1 quadrado = 10 leads, aviso no topo e grupo sem etapa tracejado por último. Canvas `card`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e passe os itens reais pela prop `data`.
2. A chave de cada marcador é o id do item: use o id do registro, nunca o índice, ou a animação da v3 embaralha.
3. Na v3, passe `onSelectAccount` para abrir o registro; sem ela o marcador só informa. Para filtrar, mande menos contas em `data`: os marcadores restantes seguem a mesma ordem.
4. A v3 foi desenhada para 894 px de corpo (viewBox de 894 de largura): em coluna mais estreita ela encolhe por inteiro e o texto sobreposto continua em tamanho fixo.
5. Os estados vazios estão inline com `role="status"`; ao colar, troque por `EmptyState` mantendo o texto.
6. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/` e confira os dois temas.

## Referências

- Estudo da família: `_estudo/familias/22_unidades-waffle-e-pictograma.md`.
- Molde SVG da família: `_render/exemplos/22_unidades-waffle-e-pictograma/01_waffle-10x10`.
- Padrão da técnica de reposicionamento: FLIP (First, Last, Invert, Play), medindo posição antes e depois e animando a diferença por transform.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, sobre os arquivos do mesmo dia. `v1`, `v2` e `v4` aprovadas; `v3` reprovada, com o parecer em `validation/revisao_22_unidades-waffle-e-pictograma__04_unit-chart-por-entidade_2026-10-13.md`. O que segue não reprova e fica para quem tocar o arquivo.

- `v1`, `v2`, `v4`, ESP-3: o nome do grupo em duas linhas passa da base do corpo. A caixa `h-8` tem 32 px, e a borda de 1 px com o `pt-1` deixam 27 px para 32 px de texto. Medido no PNG: a tinta termina 1 px abaixo do corpo na `v1` e na `v2` e 4 px na `v4` (descendentes de "agendada" e "registrada"). Sem corte no preview, porque o cartão tem 20,5 px de padding; em contêiner que esconde o transbordo a descendente é cortada. Somar a borda e o padding à altura resolve.
- `v1`, `v2`, `v4`, NUM-6: a contagem acima de cada grupo sai sem substantivo; a linha de abertura dá a unidade.
- `v2`, TIP-1: o "30" da linha de abertura (`Chart.tsx:93`) e o da nota (linha 149) ficam fora do `kpi-number` e sem `tabular-nums`; na nota, o 19 sai em Space Grotesk e o 30 em Manrope.
- `v2`, 17.1 e TIP-4: a legenda está em 11 px e leva `kpi-number` na frase inteira, que pede Space Grotesk em peso 400, não carregado (o navegador entrega 500). A 17.1 pede legenda em Manrope 12 px, com `tabular-nums` só no número.
- `v2`, ROT-4: a legenda vai da base ao topo (até 15, 16 a 30, mais de 30) e a pilha lida de cima para baixo começa em mais de 30. Sem consequência visível: a ordem crescente dos dias se explica sozinha.
- `v2`: as paradas por etapa só se leem contando quadrados nas três etapas sem nota (6, 11 e 8). O total (44) e a pior etapa (19) estão escritos. Melhoria possível: escrever o número de paradas junto da contagem de cada etapa.
- `v2`, TOK-9: pares entre faixas medidos nesta revisão e ausentes do `notes`: `--seq-5` contra `--seq-7`, 2,07:1 no escuro e 2,23:1 no claro; `--seq-7` contra `--warning`, 1,21:1 e 1,44:1, sustentado pelo contorno da faixa crítica.
- `v3`: os itens de mesma rodada estão no parecer (plural fixo na frase acessível, legenda em 11 px com um item em Space Grotesk, peso 400 em "128 contas", ordem da legenda, comentário solto no `data.ts`).
- `v3`: no modo por executivo sobram cerca de 60 px vazios acima do rótulo do excedente, porque o viewBox é dimensionado pelo maior segmento (16 linhas) para a base não pular na troca. Escolha defensável; é o estado que a galeria mostra.
- `v3`: as molduras vizinhas ficam a 3 px uma da outra (faixa de 149 px por grupo, moldura de 146 px) e leem como linha dupla.
- `v3`: são 566 paradas de tabulação. Uma parada só, com as setas andando na grade, reduziria o custo de quem navega por teclado. O marcador mantém `role="button"` e `cursor-pointer` mesmo sem `onSelectAccount`, quando não faz nada.
- `v3`: as contas pintadas em `--negative` são sempre as últimas da ordem de preenchimento, todas de Serviços no dado padrão, e o rótulo de cada uma diz "acima do teto", atributo que o dado não traz por conta. Declarado no `notes`.
- `v3`, NUM-6: "+8 acima do teto" sai sem o substantivo; "128 contas" logo abaixo dá a unidade.
- `v3`: a contagem por segmento dentro de cada carteira não está escrita; só o modo por segmento escreve o total de cada um.
- `v3`: o modo por segmento, a animação da troca e o estado de foco não foram renderizados; o que se sabe deles é leitura do código.
- `v4`, ACE-1: a frase acessível diz "1.900 leads em 6 etapas" e conta o grupo sem etapa como etapa; são 5 etapas e um grupo sem etapa. Sem esse grupo no recorte a frase cai para cerca de 80 caracteres, abaixo do piso de 100, porque não diz a maior etapa.
- `v4`, TIP-1: "1.900" e "1.500" do aviso (`Chart.tsx:66`) ficam fora do `kpi-number` e sem `tabular-nums`.
- `v4`: na unidade agregada, etapa com 1 a 4 leads arredonda para zero quadrado e fica só com o número. A nota do topo cobre; um piso de 1 quadrado para contagem maior que zero evita o grupo sem marca.

Segunda passada de 2026-10-13, sobre a `v3` corrigida às 06:58 do mesmo dia. Os dois bloqueantes da primeira passada estão resolvidos; a versão segue reprovada por dois defeitos da moldura do teto que o dado padrão esconde, descritos na seção "Segunda passada" do mesmo parecer. O que segue não reprova.

- `v3`: ramos que a primeira passada leu só no código, agora renderizados em rascunho com o `Chart.tsx` da versão. Modo por segmento nos dois temas: três pilhas de 188, 189 e 189, sem moldura e sem transbordo. Foco: contorno de 2 px em `--text-primary` no quadrado. Troca com movimento: 524 dos 566 marcadores animam e 42 não mudam de lugar. Lista vazia: bloco `role="status"` com `Filter`.
- `v3`, ESP-3: a primeira moldura nasce em x = 0 e o `<svg>` corta metade do traço esquerdo dela (1 de 2 px de dispositivo no PNG, nos dois temas). O comentário da linha 125 diz que ela fica inteira dentro do corpo. Um recuo de 1 px a mais resolve, e a última moldura ainda termina 2 px antes da borda.
- `v3`: a fileira do excedente encosta no traço de topo da moldura (a base do quadrado cai no centro do traço), e sob os 9 quadrados o traço aparece com metade da espessura. A fileira continua lendo como acima da moldura.
- `v3`: confirmado com o traço em `--text-muted`: molduras vizinhas a 3 px leem como linha dupla tracejada.
- `v3`: os cinco itens de mesma rodada da primeira passada seguem como estavam (plural fixo na frase acessível, legenda em 11 px com um item em Space Grotesk, peso 400 em "128 contas", ordem da legenda, comentário solto no `data.ts`). O plural foi medido: no recorte de 280 contas a frase diz "0 executivos passam do teto de 120, com 0 contas a mais".
- `v3`, nome longo: com um nome de 26 caracteres o nome quebra em duas linhas e "128 contas" desce 12,5 px além do corpo (294 contra 281,5 px). O dado padrão só tem nomes curtos.
- `v3`, segmento fora da lista: conta com `segmentId` que não está em `segments` é pintada com a cor do slot 1, a de Indústria (linha 287), e some no modo por segmento; no teste, 486 dos 566 quadrados ficaram na tela e a frase seguiu dizendo 566. O tipo não admite conta sem segmento; se o Farol tiver, ela pede grupo próprio no papel Ausência, como na `v4`.
- `v3`, `notes`: a conta do corpo dá o seletor com 28 px e soma 280; medido, o seletor tem 26 px e o conteúdo fecha em 278 dos 281,5 px.

Terceira passada de 2026-10-15, sobre a `v3` corrigida às 10:23 do mesmo dia. Aprovada: os dois bloqueantes da segunda passada estão resolvidos, conferidos em bancada com o mesmo `Chart.tsx` e só o `data.ts` trocado (280 contas com teto 120, 566 com teto 100, 280 com teto 125), nos dois temas; a bancada foi apagada. O que segue não reprova.

- `v3`, Anatomia, item 5 deste README: ainda descreve a moldura como "`rect` tracejado 3 3"; hoje ela é um `<path>` que fecha exatamente `ceiling` células, em degrau quando o teto não é múltiplo de 12. O comentário do topo do `Chart.tsx` (linha 12) também fala em "as 120 primeiras contas", e o teto vem do dado.
- `v3`, ROT-4: a legenda mantém o item "acima do teto" quando nenhum executivo passa dele. No recorte de 280 contas a amostra vermelha aparece sem nenhuma marca vermelha na tela. Sem leitura errada, porque a frase e a ausência de "+N" dizem o mesmo; mostrar o item só quando há excedente deixa a legenda igual ao desenho.
- `v3`: no degrau (teto 100), o traço vertical corre no vão de 2 px entre a última célula de dentro e a primeira de fora na mesma linha; a separação se lê pela cor do excedente mais do que pelo traço. Correto e legível nos dois temas.
- `v3`: seguem como estavam os itens já listados em "Pendências conhecidas" e nas passadas anteriores (plural fixo na frase acessível, que no recorte de 280 contas diz "0 executivos passam do teto de 120, com 0 contas a mais"; legenda em 11 px com um item em Space Grotesk; peso 400 em "128 contas"; ordem da legenda; comentário solto no `data.ts`; nome longo; `segmentId` fora da lista; fileira do excedente encostada no traço de topo).

## Pendências conhecidas

- `v3`, segunda rodada de correção (2026-10-15): o `viewBox` passou a cobrir `rowsFor(ceiling)` (a moldura sai inteira com pilhas baixas), a moldura é um `<path>` que fecha exatamente `ceiling` células, com degrau quando o teto não é múltiplo de 12, e o recuo do primeiro grupo ganhou 1 px. Seguem sem tratamento, sem peso de bloqueio: plural fixo na frase acessível, nome longo que passa da base do corpo, `segmentId` fora da lista, fileira do excedente encostada no traço de topo.
