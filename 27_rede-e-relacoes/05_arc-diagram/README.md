# Arc diagram

## O que é

Nós alinhados num eixo único e cada ligação desenhada como um arco entre dois deles. A posição no eixo é o índice do nó vezes o passo, e o arco do nó i ao nó j é meia elipse pelo comando `A` do `path`, com o semieixo ao longo do eixo igual à metade da distância entre os dois. Troca a visão da estrutura global, que é do grafo por forças, por nomes legíveis e por padrões que só aparecem quando a ordem é boa: com ordem aleatória os grupos somem; ordenados por volume, por dashboard ou por etapa, os blocos e as pontes aparecem. A espessura do arco segue a raiz do peso, o raio do nó segue a raiz do grau, e em relação dirigida o sentido cabe nos dois lados do eixo, lido sempre no sentido horário. Quando o arco mais longo não cabe na dimensão perpendicular ao eixo, todos os arcos achatam em elipse pelo mesmo fator. O eixo é horizontal quando os nomes cabem no passo (`v1`, `v3`) e vertical quando não cabem (`v2`, `v4`), porque o texto nunca gira.

## Quando usar

- Coocorrência ou dependência entre até 40 nós em que o nome de cada nó precisa ser legível.
- Eixo horizontal: 7 nós em 574 px de corpo ou 9 em 894 px, com rótulo de até 11 caracteres por linha; o passo fica perto de 81 px.
- Eixo vertical: até 30 nós num cartão de 690 px de altura, a 14 px por linha, com nome de até 26 caracteres.
- Procedência: de quais fontes de dado cada indicador depende, com os indicadores agrupados por dashboard.
- Relação dirigida em que o sentido cabe em dois lados do eixo: usa de um lado, é usado por do outro.
- Existe uma ordem natural (volume, dashboard, etapa do funil) que se pode declarar no cartão.

## Quando evitar

- Mais de 40 nós ou muitas ligações longas: use a matriz de adjacência (`27_rede-e-relacoes/01_matriz-de-adjacencia`).
- A estrutura global, com hubs e comunidades, é a mensagem: use o grafo por forças (`27_rede-e-relacoes/04`).
- Dois tipos de entidade em que a pergunta é quem se liga a quem entre as duas colunas, sem ordem natural: use o grafo bipartido (`27_rede-e-relacoes/02_grafo-bipartido`).
- As folhas pertencem a uma hierarquia de dois níveis ou mais: use o hierarchical edge bundling (`27_rede-e-relacoes/08`).
- Leitura do peso exato de cada par: o arco mostra a espessura, e só o par em destaque tem o número escrito. Use a matriz (`27_rede-e-relacoes/01_matriz-de-adjacencia`).
- Fluxo de volume entre etapas, com proporção do todo: use o sankey (`11_fluxo-sankey/01_sankey-simples`).

## Anatomia

1. **Eixo**: linha de 1 px em `var(--line-subtle)`. Na `v1` e na `v3` é horizontal; na `v2` e na `v4` é vertical e interrompido entre os grupos, e o vão é o separador de dashboard. O passo é derivado: a largura livre dividida pelos vãos entre nós.
2. **Nó** (`<circle>`): raio de `NODE_UNIT` vezes a raiz do grau (`nodeRadius`), para a área seguir o grau; `var(--text-secondary)` por padrão, `var(--chart-1)` no par ou na fonte em destaque, `var(--warning)` no nó em ciclo. Na `v3` o nó ganha uma haste até o pé da faixa do rótulo, de onde saem os arcos de baixo.
3. **Arco** (`<path>` com `fill="none"`): `M x0,y A rx,ry 0 0 1 x1,y`, sempre no sentido horário. Em `var(--text-muted)`, que mede 5,21:1 no escuro e 5,37:1 no claro; não usa `var(--line-strong)`, que mede 1,79:1 e 1,83:1, porque o arco é o dado (ACE-6). Fora do destaque baixa para `strokeOpacity` de 0,76 (ACE-5). Espessura pela raiz do peso na `v1` (`arcWidth`, de 1,5 a 6 px) e fixa de 1,5 px onde a relação é só presença; o arco da fonte acesa na `v2` e o do ciclo na `v3` têm 2,5 px.
4. **Achatamento**: um fator único por desenho, o espaço livre dividido pelo maior raio, com teto de 1. Sai 1 na `v1` e na `v4` (semicírculos), 0,70 na `v2` e 0,75 na `v3`. É único porque elipses semelhantes aninhadas não se cruzam; fator diferente por arco cria cruzamento falso junto do nó.
5. **Revestimento**: o mesmo `path` em `var(--surface-raised)` por baixo de cada arco, 1 px de cada lado, para abrir passagem no cruzamento (TOK-4). Os neutros são desenhados primeiro e os do destaque por último.
6. **Rótulo do nó** (`<text>`): nome em Manrope de 12 px, `var(--text-secondary)`, peso 500. Na `v1` fica sob o eixo, quebra em duas linhas quando passa do passo (`wrapLabel`) e leva o volume em Space Grotesk de 11 px, por `formatInt` com o substantivo. Na `v2` e na `v4` fica à esquerda do eixo, alinhado à direita, numa margem calculada pelo maior nome.
7. **Grupo** (`v2`, `v4`): nome do dashboard em 11 px e peso 600 na coluna da esquerda, com a contagem do grupo logo abaixo ("5 de 6 caem", "2 de 4 com fonte"), por `formatInt`.
8. **Contagem da fonte** (`v2`, `v4`): coluna de números à direita do nome, sob o cabeçalho "indicadores que dependem". Fonte que ninguém usa escreve 0 e vira ponto cheio mínimo (EST-3).
9. **Ausência** (`v4`): indicador sem fonte declarada vai para o fim do eixo como anel vazado em `var(--text-muted)`, sem preenchimento e sem arco, com "sem fonte declarada" escrito onde o arco sairia.
10. **Valor do par em destaque** (`v1`): `formatInt` com "leads", em peso 700, posto por anticolisão (`placeValue`): por dentro do arco, depois acima do topo; sem lugar livre fica só na linha de leitura. Não leva halo (GEO-4).
11. **Legenda dos sentidos** (`v3`): dois blocos de três linhas na margem esquerda, um acima e um abaixo do eixo, cada um do lado que explica, e a ordem do eixo declarada entre eles.
12. **Ciclo** (`v3`): achado por busca no grafo (`findCycle`, `reaches`); nós e arcos do ciclo em `var(--warning)`, ícone lucide `RefreshCw` de 12 px ao lado do rótulo e rótulo em peso 600.
13. **Linha de leitura**: frase de 12 px no topo do corpo, calculada do dado, com a conclusão da versão. **Frase acessível**: na raiz, com o tipo de gráfico, as contagens e a mesma conclusão, pelos mesmos formatadores.
14. **Vazio**: sem nenhuma ligação, o desenho inteiro dá lugar a um bloco `role="status"` com o ícone `Filter` (EST-1).

## Versões

- `v1_coocorrencia-de-origens-em-2026-08`: 7 origens em ordem de volume e 12 pares que aparecem na mesma jornada. Demonstra o semicírculo pelo comando `A`, a espessura pela raiz do peso e o raio do nó pela raiz do grau com régua calculada do dado, a ordem declarada no corpo, o par mais forte em `var(--chart-1)` com o valor escrito por anticolisão e o rótulo sem giro com quebra em duas linhas.
- `v2_procedencia-indicadores-e-fontes`: 24 indicadores em 4 dashboards e 6 fontes, com 31 dependências, em eixo vertical. Demonstra a ordem por dashboard com as fontes no fim, o separador de grupo, a prop `highlightId` que acende os arcos de uma fonte, a contagem "9 de 24 indicadores", o achatamento em elipse por fator único e a margem calculada pelo maior rótulo.
- `v3_dependencia-dirigida-entre-indicadores`: 9 indicadores na ordem do funil e 11 dependências de cálculo. Demonstra o arco acima para usa e abaixo para é usado por, a legenda dos dois sentidos junto do eixo, os rótulos curtos com os nomes completos na lista acessível, o ciclo em `var(--warning)` com `RefreshCw` e a altura de cada lado pelo arco mais longo dele.
- `v4_indicador-sem-fonte-declarada`: 14 indicadores, dos quais 3 sem fonte, e 5 fontes, uma delas sem nenhum indicador. Demonstra a ausência como anel vazado no fim do eixo, o zero medido como ponto cheio com 0 escrito, a mensagem no topo com a contagem no rodapé e a frase acessível que separa as duas ausências.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. Escolha a versão pelo tamanho do nome: se o maior rótulo cabe no passo (largura livre dividida pelos vãos), use o eixo horizontal da `v1` ou da `v3`; se não cabe, use o eixo vertical da `v2` ou da `v4`. Não gire o texto.
3. Na `v1`, passe `nodes` com `label`, `inSentence` e `volume`, e `links` com `weight` inteiro maior que zero. Não ordene antes: a ordem por volume é do componente. O semicírculo pede altura igual à metade da maior distância; par mais distante que 4 passos achata todos os arcos, e aí vale aumentar `ARC_MAX_HEIGHT` e `VIEW_HEIGHT`.
4. Na `v2` e na `v4`, cada indicador traz `groupId` e a lista `sources`. Lista vazia é fonte não declarada, e fonte que ninguém cita é zero medido: não troque uma pela outra. A ordem das fontes é do componente (`orderSources`).
5. Na `v2`, `highlightId` é o id da fonte acesa; id que não existe deixa tudo em neutro e a linha de leitura passa a citar a fonte com mais dependentes.
6. Na `v3`, os nós vêm na ordem do eixo e `orderLabel` diz qual é ela. Cada linha de `links` é `from` usa `to`. O rótulo curto precisa caber no passo menos 28 px, por causa do ícone de ciclo do vizinho.
7. O `viewBox` é o tamanho do corpo do cartão do catálogo. Mudou o cartão, mude `VIEW_WIDTH` e `VIEW_HEIGHT` para o corpo novo, senão o texto cai abaixo de 11 px (GEO-18). No eixo vertical a altura é de 14 px por indicador, 22 px por fonte e os vãos de grupo.
8. Dê altura ao pai antes de embrulhar em `VisualCard`, e troque o bloco de vazio por `EmptyState`.

## Referências

- Martin Wattenberg, "Arc Diagrams: Visualizing Structure in Strings" (IEEE InfoVis, 2002): a forma e o papel da ordem dos nós.
- Jeffrey Heer, Michael Bostock e Vadim Ogievetsky, "A Tour through the Visualization Zoo" (2010): o arc diagram entre as formas de rede e o peso da ordenação.
- [From Data to Viz, Arc diagram](https://www.data-to-viz.com/graph/arc.html): quando o arco serve e quando a matriz é melhor.
- [MDN, comando A do path](https://developer.mozilla.org/docs/Web/SVG/Reference/Attribute/d): raios, sentido e as duas flags do arco elíptico.
- `VISUAIS/27_rede-e-relacoes/02_grafo-bipartido/README.md`: o vizinho de duas colunas, de onde vêm o revestimento e a medição do traço.
- `app/src/lib/format.ts`: `formatInt` e `formatMonthShort`, os dois formatadores do modelo.
- `app/src/styles/tokens.css`: `--text-muted`, `--text-secondary`, `--surface-raised`, `--line-subtle`, `--chart-1` e `--warning`.

## Pendências conhecidas

- O número de cada par só aparece na dica (`<title>` nativo do SVG), salvo o par em destaque da `v1`. É o limite que "Quando evitar" declara.
- Arcos que saem do mesmo nó partem do mesmo ponto e correm juntos nos primeiros pixels. É da forma: quem precisa de pontas separadas usa o grafo bipartido.
- `var(--chart-1)` contra o arco baixado mede 2,65:1 no escuro e 1,83:1 no claro (TOK-9). O destaque não depende só da cor: o arco aceso é mais grosso, é desenhado por cima com revestimento, e os rótulos das pontas mudam de peso.
- `OPACIDADE-MARCA` sai não medida (`sem_opacidade_em_marca`), porque a opacidade chega ao traço pela constante `DIM_OPACITY` e a guarda não a segue. Medida à mão contra `tokens.css`: `--text-muted` a 0,76 sobre o cartão dá 3,58:1 no escuro e 3,28:1 no claro; o piso de 3:1 fica em 0,72.
- `RAIO-CONTRA-AREA` sai não medida nas quatro versões (`valor_nao_casado` na `v1`, `sem_dado` nas demais), porque o grau é contado no componente e não mora no `data.ts`. O raio é `NODE_UNIT` vezes a raiz do grau, sem piso somado, então a área segue o grau; só o nó de grau zero tem forma própria.
- `ESPESSURA-MARCA` sai não medida nas quatro versões: a guarda só tem piso para marca de barra. As espessuras do modelo são constantes do topo de cada arquivo.
- Na `v2` a ordem que aninha os arcos põe a fonte acesa na última linha do eixo. A mensagem abre o corpo na linha de leitura, e os indicadores que caem começam na primeira linha.
- A quebra do rótulo da `v1` e a margem da `v2` e da `v4` usam 6,4 px por caractere, média de Manrope 500 em 12 px, e não a largura medida de cada nome. Nome de muitas letras largas pode passar alguns pixels da estimativa.
- Na `v2` e na `v4` a ordem das fontes reduz cruzamentos e não é ranking; a contagem escrita ao lado de cada fonte é o que se lê.
- Na `v3` a linha de leitura escreve o primeiro ciclo achado; os nós e arcos de todo ciclo são marcados.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada, quatro versões julgadas e as quatro aprovadas, sem bloqueante. `npm run check` com 0 erros e 0 avisos. Conferido à mão o que as guardas não mediram: o arco neutro baixado mede no PNG 3,60:1 no escuro (`#65748d`) e 3,30:1 no claro (`#838ea4`), e o raio de cada nó nos quatro `preview.svg` é a unidade vezes a raiz do grau, sem piso. Os itens abaixo não reprovam.

- `v1`, `v2` e `v4`: desvios do catálogo aceitos, com o contrato vencendo. O catálogo pede arco em `--line-strong` na `v1` (a ACE-6 proíbe em traço que carrega a relação), rótulo girado a 45 graus na `v2` e eixo horizontal no canvas largo na `v4` (a TIP-5 proíbe o giro, e 30 e 19 nomes não cabem na horizontal). O `notes` de cada versão declara o desvio, e o `demonstrates` descreve o que foi entregue.
- `v1`: a régua da espessura mostra só os dois extremos (12 e 318) e não diz que o traço cresce com a raiz do peso. Quem interpola em linha reta entre as duas amostras lê perto de 135 no arco de 97 leads e de 67 no de 47. Um degrau do meio na régua, ou a palavra raiz na legenda, fecha a leitura.
- `v1`: as amostras da legenda saem em `--text-muted` cheio e os arcos a 0,76 de opacidade, então a amostra fica um tom mais forte que a marca que ela explica. Aplicar `DIM_OPACITY` à amostra do arco alinha as duas.
- `v1`: o período `ago/26` da linha de leitura e da linha de ordem sai em Manrope sem `tabular-nums` (TIP-1). Sem coluna a alinhar, o preview não muda.
- `v1`, `v2` e `v3`: a linha de leitura não tem folga para dado maior. Medido no PNG, ela ocupa 560 dos 574 px do corpo na `v1`, 781 dos 874 px livres ao lado do ícone na `v3` e 401 dos 494 px na `v2` com o CRM aceso; com a fonte de nome mais longo do dado a `v2` chega perto de 479 px (estimado pela largura do rótulo, não renderizado). Pela conta do layout, texto que quebra em duas linhas tira 20 px do SVG, a escala cai para perto de 0,91 na `v1`, 0,92 na `v3` e 0,96 na `v2`, e o texto de 11 px fica abaixo do piso (GEO-18). Na `v3` um ciclo de três indicadores já quebra a linha, e a frase acessível, hoje com 233 dos 250 caracteres, passa do teto da ACE-1.
- `v2` e `v3`: o tamanho do nó segue o grau e nenhuma legenda diz isso; só a `v1` e a `v4` trazem a régua do nó. Na `v2` a contagem escrita cobre as fontes, e os 7 indicadores de duas fontes ficam com o nó maior sem explicação. Na `v3` o raio vai de 3,5 a 7 px sem régua. O grau se conta pelos arcos que chegam ao nó, então o desenho não afirma nada falso.
- `v2` e `v4`: a contagem da coluna de grupo sai sem o substantivo (NUM-6): `5 de 6 caem`, `4 de 5 com fonte` e, na `v4`, `3 de 14` sozinho sob "Sem procedência". A unidade está na linha de leitura, logo acima, e no cabeçalho "indicadores que dependem", por isso não reprova.
- `v4`: o dashboard de cada indicador sem fonte só aparece na dica (`<title>`). O corpo diz que falta 1 no Comercial e 2 na Diretoria (`4 de 5` e `2 de 4 com fonte`), mas não diz qual dos três é de qual. O nome do dashboard cabe na nota à direita do anel.
- `v1`, `v2` e `v3`: o par marca contra marca dos nós não está no `notes` (a TOK-9 pede o número). Nó aceso em `--chart-1` contra nó neutro em `--text-secondary` mede 1,16:1 no escuro e 1,35:1 no claro; nó em ciclo em `--warning` contra o neutro mede 1,02:1 no escuro e 1,42:1 no claro. O segundo canal existe nas três (cor e peso do rótulo, arco mais grosso, ícone na `v3`), por isso não reprova.
- `v1`, `v2`, `v3` e `v4`: constantes de acabamento. Há número sem nome fora do topo do arquivo (`TOP_PAD + 26`, `LEGEND_X + 18` e `LEGEND_X + 26` na `v4`; `axisY - 6` e `+ 1` na legenda da `v3`; `SOURCE_GAP / 2 - 2` na `v2` e na `v4`) e distância ímpar (`LABEL_DX` de 7 px na `v3`, `VALUE_ABOVE_GAP` de 5 px na `v1`), contra a seção 5 e a ESP-1. Sem consequência no render.
