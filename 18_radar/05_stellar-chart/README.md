# Stellar chart

## O que é

Alternativa ao radar proposta na Nightingale: cada dimensão vira um espeto afinado que sai do miolo até o valor, e nada liga um eixo ao outro. Sem polígono não há área que engana nem linha sugerindo vizinhança entre categorias que não têm relação, e a forma de estrela se sustenta com 5 ou com 12 eixos. Lê se pelo **comprimento** do espeto contra os anéis da grade, com o valor escrito ao lado do nome.

**A área acompanha o valor, e isso é construção, não acaso.** O espeto é um trapézio de largura fixa: 6 px na base e 2 px na ponta, sempre, qualquer que seja o valor. A área dele vale `(HALF_BASE + HALF_TIP) * comprimento`, isto é 4 px vezes o comprimento, e o comprimento é linear no índice. O dobro do índice desenha o dobro da tinta, e não o quádruplo (GEO-3). O que quebraria a conta é a marca engordar com o valor, ou virar setor de ângulo fixo: nos dois a área passa a ir com o quadrado do raio, e o modelo volta a ser o radar que ele veio substituir.

## Quando usar

- Perfil de uma entidade em 5 a 12 dimensões na mesma escala, quando a peça pede forma radial e a leitura precisa ser por distância (v1).
- Uma meta ou referência única para todos os eixos, em círculo tracejado, com os espetos abaixo dela em destaque (v2).
- Mais eixos do que o radar simples aguenta sem virar ruído: doze critérios com o nome no raio externo (v3).
- Dimensões sem relação de vizinhança, em que a linha do polígono sugeriria continuidade falsa.
- Recorte em que um eixo mediu zero e outro ainda não foi medido, e os dois precisam ler diferentes (v4).

## Quando evitar

- Leitura exata de valores ou ranking: barras com rótulo direto (`02_barras-horizontais/01_simples-ordenada`).
- Entidade contra outra série completa: radar comparativo (`18_radar/02_radar-comparativo`) ou barras agrupadas (`02_barras-horizontais`).
- Categorias cíclicas com volume: coluna radial (`07_rosca-e-radial/06_coluna-radial`) ou rosa de Nightingale (`07_rosca-e-radial/07_rosa-de-nightingale`).
- Espeto de base larga: acima de 4 px de meia base ele volta a ser área, e o olho passa a comparar manchas em vez de comprimentos.
- Largura do espeto proporcional ao valor: **nunca**. É a forma mais rápida de devolver a área ao quadrado.
- Mais de 12 dimensões: tabela com heatmap nas células (`14_tabelas-visuais`).
- Eixos em escalas diferentes: coordenadas paralelas (`18_radar/06_coordenadas-paralelas`).

## Anatomia

1. **Espeto**, um `path` por eixo, calculado pela função pura `spike(cx, cy, i, n, r)`: primeiro eixo no topo, sentido horário, meia base `HALF_BASE = 3` e meia ponta `HALF_TIP = 1`. A ponta tem 2 px e não zero porque ponta em agulha some nos últimos pixels e o espeto lê mais curto do que o valor. Cor `--chart-1`; na v2 o neutro é `--line-strong`, que só vale com o valor escrito.
2. **Anel do zero** (`HUB_R`), em `--line-strong`: os espetos nascem nele e não no centro geométrico. Sem ele as bases se sobrepõem no miolo, a área visível deixa de ser a área do espeto e o zero de um eixo não tem onde pousar. Mede 12 px com seis eixos (v1, v2), 16 px com doze (v3) e 20 px na v4, para o ponto do zero não encostar nas bases vizinhas.
3. **Comprimento** por `valueToRadius`: `HUB_R + valor / 100 * (OUTER_R - HUB_R)`, linear. Na v1 e na v2 isso dá 1 px por ponto de índice.
4. **Grade circular** em `--line-subtle`, anéis em 25, 50, 75 e 100, com `vectorEffect="non-scaling-stroke"`. Os números da escala ficam no vão entre dois eixos mais próximo da horizontal, com halo da ROT-7, e somem quando o vão não comporta o número: com doze eixos só 50 e 100 são escritos.
5. **Rótulo de eixo**: nome em Manrope de 11 px e valor em Space Grotesk de 12 px por `formatInt`, na mesma linha. Âncora pelo quadrante (`start` à direita, `end` à esquerda, `middle` no topo e na base), nome longo em duas linhas por `tspan` com quebra por palavra inteira, nunca texto girado. Até seis eixos o rótulo mora na ponta do espeto (v1, v2); com muitos eixos ou vizinhos altos ele vai para o raio externo fixo `LABEL_R` (v3, v4).
6. **Meta** (v2): círculo tracejado `3 3` em `--text-muted`, pintado antes dos espetos, com o rótulo `meta 70` sobre ele. Rótulo de eixo que pousaria em cima do círculo salta para fora; o que ainda cruza leva halo.
7. **Estados** (v4): zero medido é ponto cheio sobre o anel do zero, na origem do próprio eixo, e o rótulo escreve 0; indicador sem medição é raio tracejado em `--text-muted`, sem ponto, e o rótulo escreve `formatUnavailable()`. A legenda no topo tem a forma das duas marcas.
8. **Anticolisão em graus** (v3, v4): `minNeighbourDeg(largura)` devolve a distância angular que o rótulo centralizado do polo exige do vizinho. Se o passo dos eixos é menor, o nome quebra em duas linhas; se nem assim cabe, `spreadFromPoles` afasta a âncora do rótulo vizinho, sem mexer no espeto.
9. **Linha de leitura** no topo (v1, v2), 12 px, calculada do dado, e **rodapé** de 11 px dizendo que o comprimento é o índice de 0 a 100. Na v3 esse papel é da lista ao lado; na v4, da legenda.
10. **Estado vazio**: `data` sem linha desenha um bloco `role="status"` com o ícone `Filter` e uma frase, no lugar da estrela.

## Versões

- `v1_competencias-do-executivo`: [preview](./v1_competencias-do-executivo/preview.svg) ([claro](./v1_competencias-do-executivo/preview-claro.svg)). A forma básica com seis competências: função `spike`, grade circular com os quatro anéis numerados, rótulo na ponta do espeto e linha de leitura com a mais forte e a mais fraca.
- `v2_meta-em-circulo-e-espetos-abaixo`: [preview](./v2_meta-em-circulo-e-espetos-abaixo/preview.svg) ([claro](./v2_meta-em-circulo-e-espetos-abaixo/preview-claro.svg)). Meta de 70 em círculo tracejado; quem fica abaixo acende em `--chart-1` e ganha peso 600 no rótulo, os demais ficam em `--line-strong` com o valor escrito; índice exatamente na meta não acende.
- `v3_maturidade-em-doze-criterios`: [preview](./v3_maturidade-em-doze-criterios/preview.svg) ([claro](./v3_maturidade-em-doze-criterios/preview-claro.svg)). Doze critérios com o nome no raio externo fixo, quebra em duas linhas onde o perímetro não dá largura, e a lista dos três mais baixos com a média ao lado da estrela. Canvas de 640 por 412, porque o preset `card` não fecha.
- `v4_zero-sem-dado-e-vizinhos-altos`: [preview](./v4_zero-sem-dado-e-vizinhos-altos/preview.svg) ([claro](./v4_zero-sem-dado-e-vizinhos-altos/preview-claro.svg)). Os três estados de um eixo no mesmo desenho: espeto, ponto do zero medido entre dois vizinhos de 95 e 97, e raio tracejado do indicador ainda não medido, com a frase acessível separando um do outro.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/CompetencyStellar/`, e passe o dado real pela prop `data`; o default de cada `data.ts` só serve ao catálogo.
2. A ordem dos eixos é a ordem do array. Traga a do registry de métricas da página e não ordene por valor: a estrela muda de forma quando os eixos trocam de lugar, e duas telas com ordens diferentes deixam de ser comparáveis.
3. Todos os eixos precisam estar na mesma escala de 0 a 100. Métrica em outra unidade se normaliza antes, na página, e a regra de normalização vai no subtítulo do `VisualCard`.
4. O `viewBox` de cada versão tem o tamanho do corpo do canvas dela, para o texto chegar à tela nos 11 px declarados. Num cartão menor o SVG encolhe inteiro e o texto cai abaixo do piso: dê ao corpo pelo menos 422 por 356 px (v1, v2, v4) ou 574 por 277 px (v3), ou redesenhe as constantes `VIEW_W`, `VIEW_H` e `OUTER_R` para o corpo real.
5. Na v4, mande `null` para indicador sem medição e `0` só para índice medido que deu zero. Trocar um pelo outro é o defeito que a versão existe para evitar.
6. O estado vazio inline dá lugar a `EmptyState` da página, mantendo o sentido da frase.
7. Rode `npm run typecheck` e `npm run lint` no `app/` e abra a página nos dois temas.

## Referências

- Nightingale, revista da Data Visualization Society: o artigo que propõe o stellar chart como alternativa ao radar, com os espetos afinados no lugar do polígono. A citação completa está no estudo da família.
- Estudo de origem: [`_estudo/familias/18_radar.md`](../../_estudo/familias/18_radar.md).
- `ARMADILHAS.md`, entradas GEO-3 (área contra raio), GEO-15 (rótulo de escala colado ao de setor), GEO-18 (`viewBox` do tamanho do corpo) e TOK-5 (`--line-strong` como marca).
- No Farol: `app/src/lib/format.ts` (`formatInt`, `formatDecimal`, `formatUnavailable`) e `app/src/styles/tokens.css` (`--chart-1`, `--line-strong`, `--line-subtle`, `--text-muted`).

## Observações da produção

- **Área contra valor, medida à mão.** A guarda `RAIO-CONTRA-AREA` não mede este modelo (`sem_marca_de_area`: ela procura fatia, anel, setor e bolha, e o espeto é um trapézio). A conferência foi feita no `preview.svg` das quatro versões, pela área do polígono de cada `path` contra o valor do `data.ts`: 4,00 px² por ponto na v1 e na v2, 3,36 na v3 e 3,68 na v4, com desvio de participação de 0,0000 ponto percentual nas três primeiras e 0,0003 na v4, contra a tolerância de 0,01 da guarda. As coordenadas do `path` saem com quatro casas: com duas, o arredondamento da meia base levava o desvio a 0,018 ponto percentual, medido no segundo render.
- **v2, aviso da `CONTRASTE-MARCA`.** O neutro em `--line-strong` mede 1,79:1 no escuro e 1,83:1 no claro. É o token que o catálogo pede e a isenção da ACE-3 se aplica, porque o valor de cada espeto neutro vai escrito na ponta dele; a ponta fina do neutro é o trecho que menos se vê no tema claro.
- **v2, desvio da TIP-3.** O catálogo pede peso 700 em todo eixo abaixo da meta; com três eixos seriam seis elementos em 700. Ficou peso 600.
- **v4, EST-2.** O rótulo do eixo sem medição escreve `formatUnavailable()` sem o ícone `Unplug`: dentro de um `text` de SVG o ícone viraria um `svg` aninhado ao lado do nome. A forma da ausência está no raio tracejado e na legenda.
- **v4, anticolisão.** Com os oito eixos do dado padrão o passo é de 45 graus e o rótulo do topo pede 37,8: nenhum rótulo se desloca. A função age a partir de dez eixos, quando o passo cai para 36 graus: primeiro quebrando o nome do polo em duas linhas, e só depois afastando o vizinho.
- **Largura de texto estimada.** A quebra do nome usa 6,1 px por caractere em Manrope de 11 px, sem ler o DOM. Nome muito mais largo que a média (muitas maiúsculas) pode passar da caixa prevista.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-10-13: `v1`, `v2`, `v3` e `v4` aprovadas, sem parecer em `validation/`. Comprimento e área dos espetos refeitos à mão no `preview.svg` das quatro: 1,00, 1,00, 0,84 e 0,92 px por ponto, com desvio de participação em área de no máximo 0,0003 ponto percentual. Nada abaixo reprova._

- `v1`, `v2`, `v3`, `v4`: os números da escala, e o `70` do rótulo da meta na `v2`, saem em Space Grotesk sem `fontWeight` e herdam 400, peso que a TIP-4 não lista como carregado. O navegador cai no 500 e nada muda no preview; declarar `fontWeight={500}` alinha a constante.
- `v1`, `v2`: o rótulo na ponta do espeto não tem anticolisão contra o espeto vizinho nem contra os números da escala. No dado padrão nada encosta. Pela conta da geometria, um nome de 17 caracteres no polo com índice 10 põe a ponta do rótulo sobre o espeto vizinho que passe de 60, e índice abaixo de 10 no eixo de 60 graus deixa o nome a menos de 8 px por cima dos números da escala. Recorte assim pede o raio externo fixo da `v3` e da `v4`.
- `v1`, `v2`, `v3`: o anel do zero não leva o `0` escrito: a escala numera de 25 a 100 e só o rodapé diz que o comprimento vai de 0 a 100. Na `v4` o ponto do zero medido pousa nesse anel e ensina onde o zero mora.
- `v1`, `v2`: a frase acessível diz `competências de Executivo 07` e o título do cartão diz `do Executivo 07`; o `subject` entra sem artigo.
- `v2`: o aviso CONTRASTE-MARCA do `check` continua. Os três espetos neutros em `--line-strong` medem 1,79:1 no escuro e 1,83:1 no claro e vivem da isenção da ACE-3, com o valor escrito na ponta de cada um. No PNG claro a ponta de 2 px do espeto de 70 ainda se vê encostada no círculo da meta.
- `v2`: o círculo tracejado passa por trás do `a` de `meta` e deixa um resto de traço de cerca de 1 px logo acima da letra, visível só na ampliação de 5 vezes, nos dois temas. Pôr o círculo no vão entre `meta` e `70` elimina o resto.
- `v2`: o destaque usa peso 600 e a COR-2 escreve 700. O desvio está declarado na nota do `meta.json` por causa do teto da TIP-3, e no preview o peso contra 400 mais a cor do texto sustentam o segundo canal.
- `v3`: a lista ao lado repete os três pares de nome e valor que a estrela já escreve em peso 600. É o que o catálogo pede e funciona como linha de leitura em lista, com a média; se o cartão encolher, é a primeira peça a sair.
- `v3`: `Segmentação de` começa a 3 px da borda esquerda do `svg`, que corta o que passa dela, contra os 4 px de `EDGE_PAD`. A estimativa de 6,1 px por caractere ficou 1 px abaixo da tinta real; sem corte no preview.
- `v4`: o mesmo estado tem três nomes: o título diz `sem dado`, a legenda e a frase acessível dizem `ainda não medido` e o rótulo do eixo escreve o texto de `formatUnavailable()`. Nada se contradiz, mas a legenda não repete a palavra do rótulo.
- `v4`: o rótulo sem medição sai sem o ícone `Unplug` da EST-2, como a produção declarou. A ausência tem forma e palavra, e a ACE-2 fica atendida.
- `v4`: o dado padrão não aciona nenhum dos dois ramos da anticolisão em graus (passo de 45 contra 37,8 pedidos). A quebra do nome no polo e o `spreadFromPoles` foram conferidos por leitura de código e por conta à mão com doze eixos, não por render.
- `v1`, `v2`, `v3`, `v4`: o estado vazio foi conferido por leitura de código, não por render.
- README: `Lê se pelo comprimento`, no parágrafo de abertura, perdeu o hífen da ênclise. Hífen dentro de palavra não é separador: o certo é `Lê-se`.
