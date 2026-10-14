# Marimekko 100% e mosaico

## O que é

Colunas encostadas em que a largura é a participação do grupo no total e a altura se divide pela participação de cada parte dentro do grupo. A área de cada ladrilho é proporcional ao valor da célula, então o olho lê primeiro quanto pesa cada grupo e depois do que ele é feito. Só a parte da base tem linha de base comum entre colunas: é ela que se compara de verdade, e por isso a parte mais importante fica sempre embaixo. O modelo absorve três variações do mesmo layout: o marimekko divergente (partes favoráveis acima e desfavoráveis abaixo de uma linha zero), o mosaico de duas variáveis (tabela de contingência como área, com vão maior entre grupos que entre partes) e o mosaico com resíduos (cor pelo resíduo de Pearson contra a independência). O Recharts não tem barra de largura variável, então a geometria sai de uma função pura em TypeScript e o desenho é SVG puro em React.

## Quando usar

* Peso de cada grupo e composição dele no mesmo quadro, de 3 a 6 grupos por até 5 partes, como leads por origem e cobertura de dado (`v1`).
* Lado favorável e desfavorável por grupo com peso, como oportunidades aceitas e devolvidas por fila no handoff (`v2`, variação divergente).
* Participação de mercado por segmento, sempre com o perímetro declarado: largura pelo tamanho do segmento, altura pela fatia de cada competidor (`v3`).
* Tabela de contingência de duas variáveis categóricas vista como área, com contagens de dezenas a milhares, e a pergunta de onde a combinação foge do esperado (`v4`), com contagem esperada de pelo menos 5 por célula.

## Quando evitar

* Comparar com precisão partes do meio da pilha entre colunas, que não têm linha de base comum: barras agrupadas (`02_barras-horizontais/02`).
* Grupos de peso parecido ou largura sem significado: barras empilhadas 100% (`02_barras-horizontais/04_barras-empilhadas-100`) ou colunas empilhadas 100% (`03_colunas-verticais/04_colunas-empilhadas-100`).
* Mais de 6 grupos ou mais de 5 partes: tabela cruzada com totais marginais (`14_tabelas-visuais/06`).
* Hierarquia de três níveis ou mais: treemap (`12_hierarquia/01_treemap`).
* Passagem de casos entre etapas ou estados: parallel sets (`11_fluxo-sankey/04_parallel-sets`).
* Taxa de um desfecho binário ao longo de x: spineplot (modelo `03` desta família); área como produto de duas métricas: bar mekko (modelo `02`).
* Resíduos em que a área não acrescenta: matriz categórica em cor (`15_mapa-de-calor-e-calendario/02_matriz-categorica`).

## Anatomia

1. **Função de layout** pura no topo do arquivo: `marimekko()` na `v1` e na `v3`, `divergingMarimekko()` na `v2` e `mosaic()` na `v4`. Recebe os valores por coluna e uma caixa e devolve `x`, `w`, `y` e `h` de cada ladrilho. Os vãos saem antes da partilha de largura e de altura, então a área fica exatamente proporcional à célula (GEO-16).
2. **Colunas** por largura decrescente, ordenadas no componente; partes em ordem fixa, com a mais importante na base.
3. **Vão** de 2 px entre colunas e entre partes, que é o próprio cartão (`--surface-raised`) aparecendo; no mosaico da `v4`, 6 px entre grupos.
4. **Ladrilho** em `rect` com cor por token: categórica na ordem da COR-8 (`--chart-1`, `--chart-3`) quando as partes são categorias; `--chart-1` contra neutros (`--text-muted`, `--line-strong`, `--surface-sunken`) quando só uma parte acende ou quando a cor é resíduo.
5. **Rótulo interno** só em ladrilho de pelo menos 28 por 18 px, com a tinta do par medido sobre o preenchimento (`--accent-cyan-contrast`, `--surface-raised` ou `--text-primary`). Percentual inteiro pelo maior resto (NUM-2) por `formatPercent`; contagem por `formatInt`.
6. **Eixo de coluna** abaixo dos ladrilhos: nome em até duas linhas por palavra inteira, total (`formatInt` ou `formatCurrencyCompact`) e participação, com a base do percentual escrita só na primeira coluna.
7. **Rótulo escalonado** com linha conectora para a coluna estreita demais para o próprio nome (GEO-7); na `v2` ele leva o selo de n.
8. **Lista de identificação** abaixo do gráfico com todo ladrilho sem rótulo interno, com nome e número (ROT-10). A dica (`title` do SVG) só acrescenta: contagem, valor em moeda ou resíduo.
9. **Ausência e exceção**: dado ausente em hachura neutra no topo da coluna (`v1`); esperado abaixo de 5 em hachura sem cor e contagem zero em linha de 1 px com ponto (`v4`). Hachura e traço em `--text-muted`, nunca `--line-strong` (TOK-5).
10. **Linha de leitura** calculada do dado e **legenda com valor** em HTML, acima do SVG; frase acessível de 100 a 250 caracteres na raiz, com o SVG em `aria-hidden`.

## Versões

* [`v1_cobertura-de-dado-por-origem`](./v1_cobertura-de-dado-por-origem/) ([preview](./v1_cobertura-de-dado-por-origem/preview.svg)): leads de 2026-08 por origem, divididos em dado completo, parcial e ausente. Demonstra a função `marimekko()`, as colunas por largura decrescente com o completo na base, o vão de 2 px, o eixo com nome, total e participação, o rótulo interno com piso e a ausência hachurada no topo.
* [`v2_handoff-aceitas-e-devolvidas`](./v2_handoff-aceitas-e-devolvidas/) ([preview](./v2_handoff-aceitas-e-devolvidas/preview.svg)): oportunidades do handoff de 2026-T3 por fila. Demonstra a variação divergente com dois acumuladores, o eixo de proporção por lado com 100% nas duas pontas, o motivo fora de perfil em `--chart-1` contra os demais em neutro, a anotação com a taxa de devolução da maior fila e a fila com n = 3 em coluna fina, com rótulo escalonado e selo.
* [`v3_participacao-de-mercado-com-perimetro`](./v3_participacao-de-mercado-com-perimetro/) ([preview](./v3_participacao-de-mercado-com-perimetro/preview.svg)): fatia de mercado por segmento em 2026. Demonstra o subtítulo obrigatório do perímetro com a procedência do total, nós na base em `--chart-1` contra três neutros, o segmento de 0,5% com rótulo escalonado, o seletor de segmento para região e a tabela cruzada equivalente em `details`.
* [`v4_desfecho-por-origem-com-residuos`](./v4_desfecho-por-origem-com-residuos/) ([preview](./v4_desfecho-por-origem-com-residuos/preview.svg)): oportunidades de 2026 por origem e desfecho. Demonstra o mosaico de duas variáveis com vão de 6 px entre grupos, o botão que inverte quem divide primeiro, o resíduo de Pearson em TypeScript com a escala em `--chart-1` contra neutro, a legenda com limiares em ±2 e ±4, a amostra insuficiente em hachura e a contagem zero como linha marcada, o resíduo com sinal escrito na tela em toda célula fora da faixa neutra (no ladrilho, na lista de resíduos ou na lista de identificação) e o substantivo oportunidades no eixo e na linha de leitura.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para a pasta do visual na página e troque o `import` do `./data` pelo seletor real, passando `data` (e `parts`, `reasons`, `players` ou `outcomes`, conforme a versão) pela prop.
2. Entregue as colunas em qualquer ordem: o componente ordena por largura. A ordem das partes é a da lista de partes, e ela não muda entre filtros.
3. Reserve a altura do cartão pela conta do `notes` de cada `meta.json`: o SVG tem `viewBox` do tamanho do corpo, e num pai mais baixo ele encolhe por inteiro, texto incluído (GEO-18). Num cartão mais largo ele cresce na mesma proporção.
4. Na `v3`, o subtítulo do perímetro é obrigatório: sem `perimeter.source` e `perimeter.provenance` a participação de mercado não tem denominador declarado. A tabela em `details` cresce o cartão quando abre; reserve a altura ou leve a tabela para uma aba.
5. Na `v4`, mantenha `MIN_EXPECTED` em 5 e os limiares em 2 e 4, que são convenção de leitura do resíduo de Pearson; se a página tiver outro corte, mude a constante e a legenda acompanha.
6. No celular a forma pede layout horizontal, com colunas virando linhas e rótulos à esquerda; estas versões não fazem a troca, então abaixo de 480 px de largura prefira a tabela cruzada.
7. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

* [Data Visualisation Catalogue, marimekko chart](https://datavizcatalogue.com/methods/marimekko_chart.html): os dois eixos percentuais, a falta de linha de base e o limite de poucos segmentos.
* [Wikipedia, mosaic plot](https://en.wikipedia.org/wiki/Mosaic_plot): a divisão recursiva e o sombreamento pelo resíduo padronizado (Hartigan e Kleiner, 1981; Friendly, 1994).
* [Nivo, marimekko](https://nivo.rocks/marimekko/): espessura por `value`, partes por `dimensions` e o deslocamento `diverging`; lido só como geometria, não entra na stack.
* [Vega-Lite, Mosaic Chart with Labels](https://vega.github.io/vega-lite/examples/rect_mosaic_labelled_with_offset.html): a sequência de dois empilhamentos normalizados.
* [Nightingale, How to Create a Pivot Marimekko Chart in Plain JavaScript](https://nightingaledvs.com/how-to-create-a-pivot-marimekko-chart-in-plain-javascript/): largura pela soma da coluna, altura pelo percentual dentro dela e pivô de dimensão.
* Estudo da família: `_estudo/familias/26_mosaico-marimekko.md`.
* Farol: `app/src/styles/tokens.css` (tokens de cor) e `app/src/lib/format.ts` (formatadores); não há wrapper de marimekko em `app/src/components/visuals/charts/`.
* Pedido de paleta registrado: par de tokens divergentes para resíduo e correlação (TOK-3). Enquanto não existir, a `v4` usa `--chart-1` contra neutro, com a função de cor num lugar só (`BAND_STYLE`).

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada, as quatro versões (`sem_revisao`): `v1`, `v2` e `v3` aprovadas, sem bloqueante; `v4` reprovada, com dois bloqueantes descritos em `validation/revisao_26_mosaico-marimekko__01_marimekko-e-mosaico_2026-10-13.md` (contagem sem substantivo em todo o corpo, NUM-6; resíduo de uma célula fora do esperado só na cor e na dica, ACE-2). `check`: 0 com erro e 3 avisos de `CONTRASTE-MARCA`, todos do `--line-strong` como neutro de dado com o valor escrito. Área de cada ladrilho medida no `preview.svg` contra o valor da célula: desvio de 0,0000 p.p. nas quatro.

- `v1` e `v3`, ordem da legenda: segue a pilha da base para o topo; a ROT-4 fala em pilha lida de cima para baixo, e a pergunta 6 quer a ausência por último. Na `v1` as duas não se cumprem juntas; ficou a ordem do dado, com a ausência no fim.
- `v1`, par medido: o rótulo interno sobre `--chart-3` usa `--accent-cyan-contrast` e mede 6,86:1 no escuro e 6,18:1 no claro; a ROT-6 só cita o par sobre `--chart-1`.
- `v1`, rótulo escalonado: nenhuma coluna do dado padrão é estreita o bastante para ele; o ramo existe no código e só se vê desenhado na `v2`, na `v3` e na `v4`.
- `v2`, demais motivos: sem orçamento (40) e sem retorno do contato (25) entram somados em `Devolvidas, demais motivos` e só se abrem na dica. A lista de identificação comporta os dois totais.
- `v2`, rótulo da fila fina: `1 aceita, 2 devolvidas` não diz o motivo das duas; só o ciano do ladrilho de 6,1 px mostra que são fora de perfil.
- `v2`, plano: o domínio fixo em 100% por lado deixa as colunas largas usando no máximo 43% do lado das devolvidas, e a metade de baixo fica quase vazia. Declarado no `notes`.
- `v2`, tique de baixo: o `100%` das devolvidas ignora o vão de 2 px entre as duas partes e fica até 2 px acima do fim de uma pilha inteira devolvida. Sem consequência no preview.
- `v2`, anotação: `Site e formulário: devolução de 36,2% (55 de 152)` tem 49 caracteres contra o teto de 50 da ANO-2; fila de nome mais longo passa do teto.
- `v3`, ANO-6: a etiqueta `PREMISSA` fica dentro do Chart, junto do total do perímetro. O catálogo pede, o `notes` declara, e `25/04`, `25/05`, `25/07` e `22/05 v3` passaram do mesmo jeito.
- `v3`, coluna de 4,4 px: os ladrilhos de concorrente B (`--line-strong`, 1,8:1) e de demais (poço a 1,15:1 com contorno) não têm número junto; a lista de identificação cobre os quatro. No claro a metade de cima da coluna fica pálida.
- `v3`, quinto competidor: `PLAYER_STYLE` tem quatro estilos e `styleOf` repete o último; com cinco partes, que o modelo admite, as duas de cima saem iguais.
- `v3`, cor pela posição: a cor vem do índice em `players`, lista fixa; a `v1` usa a chave `slot` do dado. Lista filtrada por quem cola desloca as cores (COR-3).
- `v3`, participação da coluna: uma casa (`42,0%`) contra o inteiro da NUM-1, para o segmento de 0,5% não ler 0% ou 1%. Declarado.
- `v3`, visão Região: não renderizada. `Norte e Centro-Oeste` quebra em `Norte e` e `Centro-Oeste`, com a conjunção solta no fim da primeira linha, e o título do cartão segue dizendo por segmento.
- `v3`, Anatomia deste README: o item 10 fala em linha de leitura nas quatro; a `v3` tem o subtítulo do perímetro no lugar dela.
- `v4`, ponto do zero: raio de 2,5 px num vão de 6 px, a 0,5 px do ladrilho hachurado de Evento; lê como marca dele.
- `v4`, lista de identificação: `(amostra insuficiente)` vem depois dos três itens de Evento e só vale para o em aberto.
- `v4`, neutros de Evento: dois ladrilhos da faixa neutra em coluna de 22,9 px sem número junto; a lista cobre.
- `v4`, estado invertido: não renderizado; pela conta do arquivo a coluna Em aberto (78,8 px) fica com os cinco ladrilhos mudos.
- `v1` a `v4`, catálogo: o verbete pede hachura em `--line-strong`, ladrilho mudo só na dica, etiqueta de procedência no Chart e dois matizes de acento; as versões desviaram pelo contrato (TOK-5, ROT-10 e TOK-3; a ANO-6 ficou com o catálogo, com ressalva) e declararam. O catálogo precisa de emenda.

Revisão de 2026-10-13, segunda passada, só a `v4` (`revisao_desatualizada`, julgado o `Chart.tsx` das 13:06): aprovada, sem bloqueante. Os dois bloqueantes da primeira passada foram sanados: `oportunidades` está no eixo da primeira coluna e na linha de leitura (NUM-6), e as cinco células fora da faixa neutra têm o resíduo com sinal na tela, três no ladrilho, uma na lista de resíduos e uma na lista de identificação (ACE-2). Medido no arquivo de hoje: 14 ladrilhos com 225,138 px² por oportunidade, vãos de 6,0 e 2,0 px, SVG em escala 1 (viewBox de 574 por 296 em caixa de 574 por 297), corpo fechando os 465 px sem transbordo, texto de 5,21:1 para cima no escuro e de 5,37:1 no claro, SVG contra página com 0,03% e 0,07% dos pixels acima da tolerância de 48 da ferramenta. `check`: 0 com erro; na `v4`, aviso de `FRASE-ACESSIVEL` (239 de 250 caracteres) e de `CONTRASTE-MARCA` (amostra da legenda em `--line-strong`, com o limiar escrito ao lado). Seguem valendo as linhas da `v4` da primeira passada (ponto do zero, colchete da lista, neutros de Evento, coluna Em aberto muda no estado invertido).

- `v4`, `notes` do `meta.json` e comentário de `VIEW_W`: descrevem uma geometria que o arquivo não desenha mais. O `notes` fala em SVG de 321 px, viewBox de 574 por 321 e 245 px de ladrilhos, e não conta a linha de resíduos; o arquivo tem viewBox de 574 por 296 e 220 px de ladrilhos, e a conta que fecha os 465 px é 32 + 24 + 48 + 297 + 24 + 40. O comentário diz canvas de 640 por 584 e o `meta.json` diz 600. O total e o canvas seguem certos; sem consequência no preview.
- `v4`, linha de leitura: a tinta para a 3,5 px da borda direita do corpo. Nome de origem mais longo quebra em duas linhas, o SVG perde 16 px e a escala cai para 0,95, com o texto de 11 px a 10,4 px (GEO-18). A primeira linha da lista de identificação tem a mesma folga, e a conta do canvas não tem linha de sobra.
- `v4`, dica: `22 observadas, 53,3 esperadas` segue sem o substantivo, e a NUM-6 cita a dica. A unidade está escrita no corpo.
- `v4`, `±2` da lista de resíduos: sai em Manrope sem `tabular-nums` (TIP-1), enquanto os limiares da legenda usam `kpi-number`. Um algarismo, sem consequência visível.
- `v4`, total geral: 520 só existe na frase acessível; na tela ele sai da soma dos cinco `n` (190, 150, 96, 62 e 22).
- `v4`, Indicação de cliente com perdido: o resíduo de −3,4 foi para a lista de resíduos, e o ladrilho de 67,5 px de altura comporta a segunda linha. No claro ele segue a 1,59:1 da faixa neutra vizinha.
- `v4`, polos da escala no claro: `--chart-1` contra `--text-muted` mede 1,12:1 (1,82:1 no escuro); o que separa mais de menos que o esperado é o matiz e o sinal escrito. Declarado no `notes`.
- `v4`, estado invertido, pela conta do arquivo e sem render: 254 px de ladrilhos e nenhuma coluna escalonada; o maior desvio (ganho com indicação de cliente, +6,0) cai no modo empilhado e o número vai para a lista de resíduos; a linha do zero de Orgânico fica a 1,5 px do contorno do ladrilho hachurado de Evento, na mesma cor; a lista de identificação chega perto de 187 caracteres, ainda em duas linhas.
