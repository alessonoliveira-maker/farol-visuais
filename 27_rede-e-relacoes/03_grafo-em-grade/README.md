# Grafo em grade

## O que é

Nós posicionados nas células de uma grade definida por duas categorias, as funções nas colunas e as etapas nas linhas, e ligados por setas ortogonais com cantos arredondados. Mantém a leitura de matriz e mostra dependência dirigida sem layout livre: a posição do nó já diz de quem é e em que etapa está, e a seta diz quem passa para quem, com a contagem escrita sobre ela. Grade, cabeçalhos, nós e setas saem no mesmo `viewBox`, com o centro de cada célula calculado em TypeScript (`buildGeometry`), então a camada de setas nunca descola da grade e nada mede o DOM. A célula vazia também informa: a que ninguém assumiu sai tracejada e escrita, diferente da função que não atua na etapa.

## Quando usar

- Handoff entre funções ao longo das etapas do funil, com seta de quem passa para quem.
- Nós que já têm duas categorias (função e etapa, origem e etapa) e cabem em até 6 por 6 células; o corpo das versões `v1`, `v2` e `v4` aguenta 4 por 4, e o da `v3`, 4 por 5.
- Mostrar etapa sem responsável ou função sem papel numa etapa, que o grafo livre esconde.
- Marcar setas em estado de atenção (SLA estourado) sem perder a estrutura do processo.
- Documentar o desenho do processo junto com a contagem medida em cada passagem.

## Quando evitar

- Os nós não têm atributo categórico: use o grafo bipartido (`27_rede-e-relacoes/02_grafo-bipartido`) ou a matriz de adjacência (`27_rede-e-relacoes/01_matriz-de-adjacencia`).
- A pergunta é quanto volume passou em cada etapa: use o sankey multietapa (`11_fluxo-sankey/02_sankey-multietapa`).
- Só importa quem é responsável, consultado ou informado em cada etapa, sem seta: use a matriz RACI (`25_tabelas-e-detalhe/07_matriz-raci`).
- Movimento entre etapas contado por par de-para: use a matriz de transição (`15_matrizes-e-mapas-de-calor/07_matriz-de-transicao`).
- Mais de 8 categorias num eixo: a grade vira tabela; agrupe categorias antes.

## Anatomia

1. **Grade** (`<rect>` por célula, `var(--line-subtle)`): `buildGeometry` divide o `viewBox` em colunas iguais e linhas iguais, e o centro de cada nó sai daí. Cabeçalho de coluna e rótulo de linha em `var(--text-secondary)`, 12 px, peso 600.
2. **Nó** (`<rect>` com `rx` 6, `var(--surface-sunken)` e contorno `var(--line-strong)`): o nome do papel em `var(--text-primary)`, 12 px. O nome está escrito dentro do nó, por isso o contorno não precisa dos 3:1 de marca sem texto.
3. **Seta** (`<path>` com `marker-end`, `var(--text-muted)`, 1,5 px): desce da base do nó até uma pista a 62% do vão entre as etapas (`LANE_SHARE`), corre de lado e desce até o topo do destino. O canto arredondado (`CORNER`) cai quando o desvio é menor que o raio. Seta na mesma coluna é vertical reta. Não usa `var(--line-strong)`, que mede 1,79:1 e 1,83:1, porque a seta é o dado (ACE-6).
4. **Pontas** (`portOffsets`): as setas que chegam ou saem do mesmo lado da mesma célula se ordenam pelo centro do vizinho e ganham um passo de 14 px cada. Vertical reta usa a ponta do destino nos dois lados, para não ganhar um desvio de poucos pixels.
5. **Contagem** (`<text>` com `formatInt`, 11 px, Space Grotesk 600, halo em `var(--surface-raised)`): acima da pista nas setas que dobram, ao lado da seta nas verticais retas (à direita, ou à esquerda quando uma pista da mesma etapa passa ali), nunca sobre a ponta.
6. **Linha de leitura** (`v2` e `v3`): frase de 12 px no topo, calculada do dado. **Frase acessível**: na raiz, com o tipo de gráfico, o tamanho da grade e a mesma conclusão, pelos mesmos formatadores.
7. **Vazio**: sem nó, a grade inteira dá lugar a um bloco `role="status"` com o ícone `Filter` (EST-1).

## Versões

- `v1_handoff-por-funcao-e-etapa`: 6 nós em 4 funções por 4 etapas, com 5 passagens. Demonstra o centro de célula por constante de geometria, a seta ortogonal com canto arredondado e ponta em `marker`, a contagem escrita no meio da seta e a seta lateral na mesma etapa.
- `v2_handoffs-com-sla-estourado`: as mesmas passagens com a parcela que estourou o prazo. Demonstra a seta em `var(--negative)` acima de 15% (`alertShare`), o ícone `Clock` junto do percentual por `formatRateWithVolume`, o zero medido escrito como "0% (0 de 310)" e as setas em alerta desenhadas por último.
- `v3_filas-de-pre-vendas-com-pilha`: 15 filas em 4 origens por 5 etapas, com 13 passagens. Demonstra a pilha de "3 filas" na célula com mais de um nó, as pontas deslocadas por seta, a espessura em três faixas com legenda, o caminho do `highlightId` em `var(--chart-1)` com o resto em neutro e o retorno por fora da grade, com o número escrito à esquerda do tronco para não apagar o traço.
- `v4_etapa-sem-responsavel`: 3 nós e uma célula esperada sem dono entre 16. Demonstra o contorno tracejado 3 3, o texto "Sem responsável definido", a seta tracejada que chega e não sai, a contagem "1 de 16 células" no rodapé, com a unidade e o período dos números das setas à direita e a diferença para a célula que não se aplica.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. Troque `data` pelas linhas reais no mesmo formato: `columns` e `rows` com `id` e `label`, `nodes` com `column` e `row` apontando para esses ids, e `edges` com `from`, `to` e `count` inteiro maior que zero. A `v2` pede `late` por aresta e `alertShare` em fração; a `v4` pede `gaps` para a célula esperada sem dono.
3. Na `v1`, `v2` e `v4`, a aresta liga etapas diferentes, de cima para baixo; a `v2` e a `v4` descartam aresta que sobe ou fica na mesma etapa. Na `v3` a aresta que sobe é retorno e corre pelo corredor da direita, então o nó de origem e o de destino precisam ser os mais à direita das suas linhas, ou a seta atravessa nós.
4. Na `v3`, `highlightId` é o id de qualquer nó, inclusive de uma fila dentro de pilha; id que não existe deixa a grade inteira em neutro. A pilha mostra até 3 folhas; acima disso a contagem escrita continua certa e o desenho para em 3.
5. O `viewBox` é o tamanho do corpo do cartão do catálogo (574 ou 894 px de largura). Em cartão de outra proporção o SVG escala inteiro, texto incluído: mudou o cartão, mude `VIEW_WIDTH` e `VIEW_HEIGHT` para o corpo novo, senão o texto cai abaixo de 11 px (GEO-18).
6. Dê altura ao pai antes de embrulhar em `VisualCard`, e troque o bloco de vazio por `EmptyState`.

## Referências

- [From Data to Viz, Network](https://www.data-to-viz.com/graph/network.html): quando o grafo serve e quando a matriz é melhor.
- Wybrow, Marriott e Stuckey, "Orthogonal Connector Routing" (2009): a ideia de pista entre linhas para a aresta ortogonal não atravessar nós.
- `VISUAIS/27_rede-e-relacoes/02_grafo-bipartido/README.md`: o vizinho sem grade, com a espessura em três faixas e o revestimento de cruzamento que este modelo também usa.
- `app/src/lib/format.ts`: `formatInt`, `formatPercent`, `formatRateWithVolume` e `formatMonthLong`, os formatadores do modelo.
- `app/src/styles/tokens.css`: `--text-muted`, `--negative`, `--chart-1`, `--line-subtle`, `--line-strong` e `--surface-sunken`.

## Pendências conhecidas

- Os nós e as setas da `v1`, `v2` e `v4` são desenhados com `<title>` nativo do SVG para a dica; o corpo já traz o número, então a dica só repete o rótulo (DIC-1) e fica como acessório do leitor de tela.
- O corredor de retorno da `v3` é um só, à direita; mais de um retorno compartilharia o mesmo trecho vertical.
- `var(--chart-1)` contra o neutro baixado a 0,76 mede pouco entre marcas (TOK-9); o caminho aceso não depende só da cor: ele é desenhado por cima, mais grosso quando o volume é alto, e o nó selecionado muda o peso do rótulo.
- `OPACIDADE-MARCA` sai não medida na `v3` (`sem_opacidade_em_marca`), porque a opacidade chega ao traço pela constante `DIM_OPACITY`. Medida à mão contra `tokens.css`: `--text-muted` a 0,76 sobre o cartão dá 3,58:1 no escuro e 3,28:1 no claro; o piso de 3:1 fica em 0,72.
- `ESPESSURA-MARCA` e `RAIO-CONTRA-AREA` não medem este modelo: a seta é traço de `<path>` e o nó é caixa de tamanho fixo, sem `<Bar>` nem área proporcional.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada, quatro versões julgadas. `v1` e `v2` aprovadas; `v3` e `v4` reprovadas por um bloqueante cada (rótulo do retorno em cima do traço da seta, e número de seta sem unidade nem período), descritos em `validation/revisao_27_rede-e-relacoes__03_grafo-em-grade_2026-10-13.md`. Os itens abaixo não reprovam.

- `v1` e `v3`: a soma do texto conta passagens em cadeia e escreve o substantivo da entidade. A frase acessível da `v1` diz `5 passagens que somam 3.390 oportunidades`; a linha de leitura e a frase da `v3` dizem `5 passagens que somam 978 leads`. A conta fecha com os números das setas, mas a mesma oportunidade ou o mesmo lead entra uma vez por passagem: na `v3` a Cadência longa recebe 340 e entrega 150, e o trecho depois de Triagem fina carrega também os 160 de Apresentação. Dizer `passagens` no lugar de `oportunidades` e de `leads`, ou trocar a soma por entrada e saída do caminho.
- `v1`, `v2`, `v3` e `v4`: número escrito dentro de frase sai em Manrope sem `tabular-nums` (TIP-1): rodapé da `v1` (`3º trimestre de 2026`), legenda e mês da linha de leitura da `v2` (`15%` e `2026`), rótulo `3 filas` da `v3` e contagem `1 de 16 células` da `v4`. As contagens das setas usam `font-display`. Sem coluna a alinhar, o preview não muda.
- `v1`, `v2`, `v3` e `v4`: o `notes` do `meta.json` mede o corpo com o caso de uso em duas linhas (265, 265, 425 e 225 px). No render de hoje o caso de uso cabe em uma linha e sobram cerca de 17 a 19 px em branco sob o desenho, além do recuo do cartão. A escala continua 1, porque quem manda é a largura. Na `v4` essa folga é onde cabe a linha de unidade pedida no parecer.
- `v1`, `v2` e `v4`: a dica nativa (`<title>`) escreve o número sem substantivo (`Capta o contato para Qualifica e agenda: 1.420`); a da `v3` escreve `leads` (NUM-6).
- `v1`, `v2`, `v3` e `v4`: recuos soltos no JSX (`a.cy - 8`, `HEADER_HEIGHT - 8`, `+ 4` de linha de base, e `x={162}` e `x={182}` da legenda da `v4`); a seção 5 do contrato pede constante nomeada. Sem consequência no render.
- `v2`: o rótulo sobre a pista tem parêntese, que desce abaixo da linha de base, e o halo de 3 px come metade da espessura da pista em dois pontos de 1,5 px por rótulo. Medido nas três pistas e nos dois temas: sobra de 48% a 59% do traço, e o traço não parte. `LABEL_RISE` de 8 px foi calibrado para algarismo; 2 px a mais de distância resolvem.
- `v2`: o rótulo à esquerda da seta reta (`10% (41 de 412)`) fica a 14,5 px dela e o da direita a 8 px, porque a largura vem de `CHAR_WIDTH` de 6,2 px por caractere e a tinta mede 5,8 (GEO-8). `textAnchor="end"` dispensa a estimativa.
- `v2`: `worst` sai de `data.edges` e o desenho sai de `edges`, já filtrado. Aresta descartada por subir de etapa ainda pode ser nomeada como maior estouro. O dado padrão não tem esse caso.
- `v2`: a frase acessível diz `A maior é de pré-vendas para executivo`, sem dizer maior o quê; a linha de leitura diz `Maior estouro`.
- `v3`: aceso em `--chart-1` contra neutro a 0,76 mede 2,65:1 no escuro e 1,83:1 no claro, marca contra marca, e o número não está no `notes`, que a TOK-9 pede. Em tons de cinza o caminho ainda se separa do resto nos dois temas (conferido no PNG). Essa luminância é o único segundo canal das setas acesas: `desenhado por cima` e `mais grosso quando o volume é alto`, citados em Pendências, não são canal de destaque.
- `v3`: a pilha `3 filas` esconde os três nomes. `Cadência longa`, que a linha de leitura anuncia, não está escrita na grade; `Cadência curta` só aparece na dica nativa da seta de 120, e `Ligação direta` em lugar nenhum (DIC-1). Da mesma pilha saem uma seta acesa e uma neutra, e só a cor diz qual é de qual fila. Nomear as filas da pilha na linha de leitura ou numa nota resolve.
- `v3`: a ponta de 9 px sobre o traço de 5 px deixa 2 px de ombro de cada lado, e nas setas neutras a ponta sai mais escura que o traço, porque as duas tintas a 0,76 se somam onde se cobrem. A direção ainda se lê. Ponta proporcional à faixa, com o traço parando na base dela, resolve os dois.
- `v3`: `period` (`2026-08`) existe no dado e não aparece no corpo nem na frase acessível.
- `v3`: `Agenda alta` recebe 200 e entrega 260 no mesmo mês, e as duas setas estão no caminho aceso. Sem estoque declarado, o leitor estranha.
- `v3`: todo rótulo de pilha sai em peso 700. Com duas pilhas além do nó aceso, o visual passa de dois elementos em 700 (TIP-3). O dado padrão tem uma pilha, que é a acesa.
- `v3`: com `highlightId` inexistente, a frase acessível cola `pilha.Nenhum caminho aceso.` sem espaço.
- `v4`: a amostra de `Função que não atua na etapa` é um retângulo em `--line-subtle`, que mede 1,25:1 no escuro e 1,29:1 no claro. É fiel à grade, mas quase some no escuro; o nome escrito ao lado segura a leitura.
- `v4`: `1 de 16 células` conta as 16 células da grade, 12 das quais são função que não atua. `1 de 4 etapas` responde mais direto ao caso de uso; a forma atual é a que o catálogo pede.
- `v4`: `buildEdges` descarta em silêncio a aresta cujo destino está na mesma coluna ou à esquerda (`b.cx <= a.cx`), e o passo 3 de Como colar só avisa da que sobe ou fica na mesma etapa.
- `v4`: `Conduz proposta` ocupa 97,5 dos 108 px do nó e deixa 5 px de cada lado. O teto de 15 caracteres do `data.ts` está no limite.
- README: Pendências diz que o `<title>` fica como acessório do leitor de tela, mas o `<svg>` é `aria-hidden` e a dica só serve ao cursor. A linha da `v2` em Versões diz `as mesmas passagens`, e a última mudou: é Conduz a proposta para Acompanha o cliente, no lugar de Fecha o contrato para Acompanha o cliente.

Revisão de 2026-10-13, segunda passada, depois da correção: `v3` e `v4` julgadas pelo arquivo de hoje e aprovadas, sem bloqueante. Os dois bloqueantes da primeira passada saíram: na `v3` o `28` do retorno fica à esquerda do tronco, com o texto a 8 px do traço, e o tronco tem a mesma tinta nas 101 linhas do trecho reto nos dois temas; na `v4` o rodapé escreve `Oportunidades nas setas, 3º trimestre de 2026` e a dica nativa leva o substantivo. Os itens abaixo não reprovam.

- `v3`: o `28` do retorno cai em cima da borda direita da grade (538 px) e o halo interrompe a linha ali. É linha de referência, não dado, e a leitura não muda; número de quatro algarismos avançaria cerca de 12 px para dentro da célula.
- `v3`: retorno que pula uma etapa inteira escreveria o número na altura do nó da etapa do meio, e com três algarismos o texto encosta na borda direita desse nó. O dado padrão só tem retorno entre etapas vizinhas; o passo 3 de Como colar não avisa.
- `v3`: o comentário do `data.ts` diz nome de fila em até 12 caracteres para caber no nó, e `Cadência curta`, `Cadência longa` e `Ligação direta` têm 14. Não aparece porque as três estão na pilha, que escreve `3 filas`.
- `v3`: a amostra da legenda de espessura é opaca (5,21:1 e 5,37:1) e a seta neutra sai a 0,76 (3,57:1 e 3,27:1 medidos de `tokens.css`). A espessura, que é o que a legenda ensina, bate nas três faixas.
- `v3`: seguem valendo, sem mudança no arquivo, as observações da primeira passada: soma em cadeia escrita como `978 leads`, pilha que esconde os três nomes, par aceso contra neutro fora do `notes` (2,66:1 no escuro e 1,84:1 no claro pela cor composta; em tons de cinza o caminho se separa nos dois temas), `period` fora do corpo e da frase, `3 filas` sem `tabular-nums`, peso 700 em toda pilha, frase colada com `highlightId` inexistente e ponta de 9 px sobre traço de 5 px.
- `v4`: a legenda das duas células vazias fica abaixo da grade, junto da contagem; a ROT-4 pede acima ou ao lado. Lê bem onde está e cabe em uma linha.
- `v4`: com mais de uma célula em `gaps`, a frase acessível nomeia só a primeira (`data.gaps[0]`) e atribui a ela a soma do que chega em todas. O dado padrão tem uma.
- `v4`: `3º trimestre de 2026`, no rodapé novo, entra na lista de número em Manrope sem `tabular-nums` (TIP-1), ao lado de `1 de 16 células`. Sem coluna a alinhar, o preview não muda.
- `v4`: seguem valendo a amostra de `Função que não atua na etapa` em `--line-subtle` (1,25:1 e 1,29:1), a contagem sobre 16 células, a aresta descartada em silêncio, `Conduz proposta` no limite do nó e os recuos `x={162}` e `x={182}` soltos.
- README: o item 3 de Anatomia descreve a seta com pista entre etapas, que é a da `v1`, `v2` e `v3`; a saída lateral da `v4` (`sidePath`, sem pista, número sobre o trecho horizontal) só está no `notes` do `meta.json`.
- README: o parágrafo da primeira passada ainda diz `v3` e `v4` reprovadas; vale o veredito desta passada, gravado em `_render/.qa/revisao/27_rede-e-relacoes__03_grafo-em-grade.json`.
