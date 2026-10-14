# Grafo de rede dirigido por forças

## O que é

Cada entidade é um disco e cada relação é uma aresta. A posição dos discos sai de uma simulação
física, Fruchterman e Reingold, em que as arestas puxam e todos os nós se repelem: quem se liga
muito fica junto, quem liga dois grupos fica entre eles e quem tem pouca ligação vai para a
periferia. Lê-se pela forma, isto é, núcleos, cadeias, pontes e ilhas, e não pela posição exata:
os eixos não medem nada. O desenho é determinístico, com iterações fixas e semente tirada do
próprio dado, então a mesma entrada dá sempre o mesmo retrato e nada anima na tela.

## Quando usar

- Descobrir grupos, pontes e periferia numa rede de até cerca de 150 nós com rótulo só nos nós
  relevantes; a `v3` chega a 180 nós e 322 arestas no canvas `largo` e já está no limite.
- Rede de indicação entre clientes, em que a forma é a mensagem: quem segura um núcleo, que
  cadeias existem, que grupos não se falam.
- Coocorrência de produto em contas, quando se quer ver comunidades, sempre com filtro de peso
  mínimo e com o total oculto escrito.
- Até 300 nós calculados no navegador: o custo é de `n (n - 1) / 2` pares por iteração, medido em
  cerca de 0,1 s para 180 nós. Acima disso, posição pré-calculada fora da tela.

## Quando evitar

- Mais de 300 nós, ou ligação densa, que vira emaranhado: use a matriz de adjacência
  (`27_rede-e-relacoes/01_matriz-de-adjacencia`).
- Leitura do valor exato de um par, ou ranking de ligações: use a matriz de adjacência ou uma
  lista ordenada de pares (família `02_barras-horizontais`).
- Dois tipos de entidade com ligação só entre eles: use o grafo bipartido (27/02).
- Rede centrada numa entidade só: use a versão egocêntrica do grafo radial (27/06).
- Pertencimento de pai para filho, sem aresta cruzada: use a árvore
  (`12_hierarquia/07_arvore-e-dendrograma`).
- Comparar tamanho de nó com precisão: a área do disco orienta, não mede; use barras.

## Anatomia

1. **Simulação.** Fruchterman e Reingold em TypeScript, sem biblioteca: `k` é a raiz da área por
   nó, todo par se repele com `k² / d`, toda aresta puxa com `d² / k`, e o passo de cada nó é
   limitado por uma temperatura que cai em linha reta até zero em 300 iterações. Uma gravidade em
   direção ao centro, mais forte no eixo curto, segura os componentes desconexos dentro do plano.
2. **Semente.** Posição inicial por `mulberry32`, com semente por FNV-1a sobre a assinatura
   textual do dado somada a um sal fixo. A conta só usa soma, produto e raiz quadrada, então o
   resultado não depende do motor. Nada de `Math.random` nem de relógio (DAD-3).
3. **Encaixe e limpeza.** A caixa dos centros é levada para a área útil, com esticamento limitado
   por eixo; depois, passadas fixas afastam discos que se tocam e tiram nó de cima de aresta de
   que ele não é ponta.
4. **Aresta.** `<line>` opaca em `--text-muted`, desenhada antes dos nós. É ela que carrega a
   relação, então é dado e mede 3:1 (ACE-6); `--line-strong` e opacidade baixa ficam de fora. Na
   `v3` a espessura é o peso; na `v2` a ponta é um `<marker>` com recuo pelo raio do destino.
5. **Nó.** `<circle>` com contorno em `--surface-raised`, que o separa da aresta e do vizinho
   (COR-5). Cor por `slot` fixo do dicionário de produtos (`--chart-1` a `--chart-6`, COR-3 e
   COR-8), e `--text-muted` para Outros e para o neutro. Na `v1` a área é a receita, com raio pela
   raiz quadrada e sem raio mínimo (GEO-3).
6. **Rótulo.** Só nos nós relevantes: grau alto, os que mais indicam, as pontes. Cada nome procura
   posição sem nó e sem aresta por baixo, em oito direções e afastamentos crescentes, e afastado
   ganha linha de chamada pontilhada. Nenhum rótulo leva halo, que apagaria a aresta (GEO-4). A
   largura sai da soma por glifo, a mesma tabela da guarda `COLISAO-TEXTO`.
7. **Dica.** `<title>` em cada nó, com o que o corpo não escreve nó a nó: nome, produto, receita,
   grau, quem indicou.
8. **Textos do corpo.** Linha de leitura calculada do dado, com taxa sempre acompanhada do volume
   por `formatRateWithVolume`; legenda ou painel; contagem de nós e de arestas por `formatInt`; mês
   por `formatMonthShort`. Tudo como `<text>` no mesmo `<svg>`, com `viewBox` igual ao corpo
   medido do preset, para a escala sair 1 (GEO-18).
9. **Frase acessível e estado vazio.** A raiz é `role="figure"` com a frase calculada do dado;
   `data` vazio troca o desenho por um bloco `role="status"` (EST-1).

## Versões

- `v1_rede-de-indicacoes-entre-clientes`: "Rede de indicações entre clientes", 60 clientes e 72
  indicações em 5 grupos. Demonstra a simulação com semente fixa, o raio pela raiz da receita, a
  cor pelo produto principal, a aresta opaca desenhada antes dos nós, a margem para o maior rótulo
  e o rodapé com a contagem e a régua de área. Canvas `alto` em vez do `card` sugerido, e aresta
  opaca em vez da opacidade de 0,25 do catálogo; os dois desvios estão no `meta.json`.
- `v2_clientes-que-mais-indicam`: "Os três clientes que mais indicam", 36 clientes e 33 indicações
  dirigidas. Demonstra a seta por `<marker>` com recuo pelo raio do destino, os três em `--chart-1`
  com nome e número de indicados, a vizinhança acesa por `highlightId` com adjacência em `Map` de
  `Set`, e o rótulo só acima do corte de grau. O neutro é `--text-muted` e não `--line-strong`, e o
  peso 700 fica só no cliente em foco; os dois desvios estão no `meta.json`. Canvas `quadrado`.
- `v3_coocorrencia-de-produto-em-180-contas`: "Produtos que convivem em 180 contas", 180 contas,
  322 ligações desenhadas e 236 ocultas. Demonstra o filtro de peso mínimo antes da simulação, o
  custo quadrático medido com o layout em `useMemo`, a cor por produto dominante com Outros, o
  rótulo só nas 7 pontes com pista reservada e o painel lateral de legenda e totais. Canvas `largo`.
- `v4_clientes-sem-nenhuma-indicacao`: "Clientes fora da rede de indicações", 64 clientes, 42
  ligados em 7 grupos e 22 isolados. Demonstra o isolado fora da simulação e alinhado numa faixa
  com título, contagem e nome, a marca vazada, os componentes pequenos separados por espaço e a
  lista acessível de ligações nas próprias arestas. Canvas `alto`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a página de destino. O dado é uma lista de nós em
   que cada nó carrega as próprias ligações (`referred` ou `links`); cada par aparece uma vez.
2. Troque o dado fictício pela consulta real e mantenha o `slot` de cada produto fixo no
   dicionário `products`, nunca calculado pela posição no ranking.
3. Filtre e limite ANTES de passar o dado: peso mínimo, teto de nós, e escreva na tela o total que
   ficou de fora. O componente desenha o que recebe; acima de 300 nós o layout trava a tela.
4. O `viewBox` mede o corpo do preset da versão. Em cartão de outro tamanho o desenho escala
   inteiro, texto incluído: para outra largura, ajuste `BODY_WIDTH` e `BODY_HEIGHT` ao corpo real.
5. Na `v2`, ligue o foco ao estado da página: passe `highlightId` com o id sob o cursor ou o
   selecionado, e `null` para apagar o foco. A posição dos nós não depende do foco: a semente só lê
   as ligações e o espaço do anel é reservado para todos os nós, então trocar o foco acende outra
   vizinhança sem mexer no desenho (medido: 0 px de deslocamento nos 36 focos possíveis).
6. O sal da semente (`SEED_SALT`) foi escolhido para o dado fictício. Com dado real, teste alguns
   valores e fique com o desenho de menos cruzamento; ele é fixo, então o retrato não muda sozinho.
7. Ao embrulhar num `VisualCard`, o estado vazio inline dá lugar a `EmptyState` (seção 16, passo 7).

## Referências

- Método: Fruchterman e Reingold, Graph Drawing by Force-directed Placement, Software: Practice
  and Experience, 1991: a repulsão `k² / d`, a atração `d² / k` e o resfriamento.
- Catálogo: [From Data to Viz, Network](https://www.data-to-viz.com/graph/network.html): o
  emaranhado como risco central e o limite prático de nós.
- Catálogo: [Data Visualisation Catalogue, Network Diagram](https://datavizcatalogue.com/methods/network_diagram.html).
- Praticante: [d3-force](https://d3js.org/d3-force), como referência de comportamento; a biblioteca
  não entra, porque a seção 6 do contrato fecha a lista de imports.
- Farol: `app/src/components/visuals/charts/chartTheme.ts` (cores de série) e `app/src/lib/format.ts`.
- Pedido registrado, sem contorno: não existe token de rampa neutra para aresta mais clara que
  `--text-muted` e ainda acima de 3:1; por isso a aresta da `v3`, densa, usa o mesmo tom da `v1`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada, quatro versões julgadas pelo arquivo e pelos PNGs de hoje (render das 15:23, posterior ao último `Chart.tsx`, das 15:20). `v1`, `v2`, `v3` e `v4` aprovadas, com as 32 perguntas sem não nos dois temas. Conferido fora do componente: contagens e taxas refeitas do `data.ts`; contraste de cada cor contra o cartão nos dois temas (nenhum texto, marca ou aresta abaixo de 5,21 para 1); vão de cada rótulo ao próprio nó e ao nó alheio, lido do `preview.svg`; geometria da `v2` rodada nos 36 focos possíveis e sem foco; dado vazio, nó único e rede sem aresta nas quatro, sem erro. Os itens abaixo não reprovam.

- `v1`, `v2` e `v3` (posicionamento de rótulo, código comum às quatro): o rótulo com linha de chamada não paga custo por parar ao lado de nó alheio, porque `COST_AMBIGUOUS` só vale sem chamada, e a chamada que cruza aresta custa 0,5. Medido: na `v1`, `Rodrigo T.` fica a 4,8 px de Lorena M. e a 5,4 px de Isabela N., a 33,2 px do próprio disco, que é o maior do grafo, e a chamada de 30 px cruza 1 aresta; na `v2`, `Ricardo L.` fica a 5,8 px de Carla N. e a 36,9 px do próprio nó, e a chamada de 56 px de `Marcelo B.` passa a 3,0 px de Leandro G., com o rótulo 8,5 px abaixo dele; na `v3`, `Hotel Pontal` fica a 3,1 px de Agro Central, a mesma distância do próprio anel. Quem desfaz a dúvida é a chamada e, na `v2` e na `v3`, o peso, o número e o anel. Cobrar distância mínima de nó alheio também do rótulo com chamada e subir o custo da chamada que cruza aresta; na `v1` sobra espaço em volta do disco.
- `v1`, `v2`, `v3` e `v4`: as constantes do posicionamento de rótulo (`LABEL_GAP` a `AMBIGUITY_MARGIN`) ficam no meio do arquivo, depois das funções de geometria, e o fator 0,71 da diagonal não tem nome; a seção 5 pede constante de desenho nomeada no topo. `NODE_GAP` e `LABEL_GAP` de 3 px são ímpares (ESP-1). Sem consequência no render.
- `v1`: a amostra da régua de área é um anel vazado em `--text-muted`, e o disco é cheio com contorno de 1,5 px na cor do cartão. O anel soma 0,5 px ao raio e o contorno tira 0,75 px: pela geometria, a amostra de R$ 426,9 mil tem 29,0 px de diâmetro de tinta contra 26,5 px do disco de Rodrigo T., e a de R$ 100,0 mil tem 14,6 px contra 12,1 px do disco de R$ 100,5 mil, o que dá 20% e 45% a mais de área; no PNG saem 29 contra 26 px e 14,5 contra 11,5 px. O contorno vazado em `--text-muted` também é o desenho do papel Ausência na tabela 17.2. Desenhar a amostra como a marca: disco cheio com o mesmo contorno (ROT-4).
- `v1`: o contorno na cor do cartão tira 0,75 px de todo raio, então o menor disco (R$ 30,7 mil, 3,75 px) mostra 64% da área nominal e o maior mostra 90%. É a mesma prática de `09_dispersao-e-bolhas/03_bolhas`, com 1 px. A guarda `RAIO-CONTRA-AREA` lê o raio nominal e não vê esse efeito; nesta versão ela saiu `valor_nao_casado`. O Quando evitar já diz que a área orienta e não mede.
- `v1`: sem piso de área. Receita abaixo de 0,5% da maior dá raio menor que 1 px, e receita zero dá raio zero: o cliente some, as arestas continuam chegando ao ponto vazio e a dica fica sem alvo (EST-3). A GEO-3 aceita piso declarado em bolha. No dado padrão o menor raio é 3,75 px.
- `v1`: a frase acessível diz `Quem mais se liga: Rita F., com 8 indicações`, e Maria Aparecida S. também tem 8 (7 feitas e 1 recebida). O empate sai decidido pelo id, sem aviso. Nomear os dois ou dizer que há empate.
- `v1`: os valores da régua usam `font-display` sem `fontWeight` e herdam 400, peso que o Space Grotesk não carrega (TIP-4); o navegador desenha com 500. Sem consequência no render.
- `v2`: `--chart-1` faz dois trabalhos de destaque, o preenchimento dos três que mais indicam e o anel e a seta da vizinhança em foco, e soma 16 marcas na cor de destaque; a tabela 17.2 pede um destaque por visual. O foco padrão é o terceiro colocado, que fica com o peso 700 e as setas grossas, enquanto Ricardo L., com 9, fica em 600 e setas finas em neutro. A legenda e o número escrito separam os dois sentidos. Levar o anel e a seta da vizinhança para `--text-primary`, como o anel de ponte da `v3`, ou deixar o foco padrão em quem lidera.
- `v2`: quem cada um trouxe só tem nome para a vizinhança em foco. Com o foco em Ricardo L. entram 6 dos 9 nomes e com o foco em Marcelo B. entram 5 dos 7; o resto fica na dica, como o catálogo especifica. Com o foco numa folha ao lado de um núcleo (Carla N.), o nome dela vai para 56 px de distância, a 3,4 px de outro nó. Nos 37 estados nenhum rótulo cai sobre nó, seta ou outro rótulo, e nenhum nó muda de lugar.
- `v2`: o raio de 8 px contra 5 px marca os três e não mede grau: Nelson M., com 4 indicados, tem o raio de uma folha. Está declarado no `meta.json` e nada na tela diz.
- `v3`: a linha `Ligações ocultas, com menos de 2` termina num número sem substantivo (NUM-6), a 20 px do valor 236 na mesma linha. `Ligações ocultas, com 1 produto` cabe nos 214 px e leva a unidade.
- `v3`: 10 dos 180 discos têm aresta alheia passando por dentro (11 ocorrências; em Construtora Campos ela passa a 0,5 px do centro), e ali o disco lê como elo de uma cadeia que não existe. É o resíduo declarado das 8 rodadas de `SETTLE_ROUNDS`; mais rodadas custam pouco perto dos 96 ms do layout.
- `v3`: o limiar da ponte, 2 ou mais ligações para um mesmo grupo alheio, não está na tela. São 30 contas com alguma ligação para outro grupo e 7 pontes, e 3 das 20 ligações entre grupos não têm ponte em nenhuma ponta, as três com os produtos de Outros. A chave do painel diz só `liga dois grupos`.
- `v3`: a espessura tem degraus de 0,5 px (1, 1,5 e 2 px em 206, 78 e 38 arestas). O degrau do meio não se separa do primeiro a olho, e a chave mostra só os extremos.
- `v3`: os nós de Outros usam `--text-muted`, a mesma cor da aresta, e quem os separa é o contorno de 1 px. O anel da ponte usa `--text-primary`, token de texto, porque `--chart-1` já é categoria; a tabela 17.2 não tem papel para esse marcador. No tema claro, Crédito estruturado (`#7a6a12`) e Câmbio (`#945808`) ficam próximos e as duas comunidades são vizinhas; é questão de token.
- `v3`: a legenda traz só a contagem, sem a coluna de percentual da ROT-5, como o `meta.json` declara. Os totais do painel repetem 7 pontes e 322 ligações, que a linha de leitura já escreve.
- `v4`: na linha de leitura, `jan/25` sai em Manrope sem `tabular-nums` (TIP-1, linha 790 do `Chart.tsx`); as outras três versões têm a classe. Sem coluna a alinhar, o preview não muda.
- `v4`: `fora da simulação` é termo de implementação e não diz nada ao leitor do comercial. `em ordem alfabética` corre por linha nas 4 colunas, e a grade, com 16 px de passo, lê como coluna: de cima para baixo a primeira dá Alberto F., Cristina D., Igor V.
- `v4`: a marca vazada tem 10 px de diâmetro de tinta e o disco ligado mostra 8,5 px, porque o contorno na cor do cartão tira 0,75 px do raio. O comentário das linhas 866 e 867 diz que os dois têm o mesmo tamanho. Tamanho não codifica nada nesta versão.
