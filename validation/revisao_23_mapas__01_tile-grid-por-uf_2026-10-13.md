# Parecer de revisão: 23_mapas/01_tile-grid-por-uf

Data: 2026-10-13. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render de 10:00:52 a 10:01:01, posterior ao `Chart.tsx`, ao `data.ts` e ao `meta.json` das quatro, o mais novo de 10:00:47). `npm run check` com tipos: 0 com erro, 3 avisos (CONTRASTE-MARCA na `v2` e na `v3`, COLISAO-TEXTO na `v3`).

Resultado: `v1` e `v4` aprovadas; `v2` e `v3` reprovadas, cada uma por um bloqueante. As observações não bloqueantes das quatro estão no README do modelo.

## Peso dos bloqueantes

* **`v3`, MA e TO sobrepostos nos três mapas.** Pergunta 15; ESP-3 e seção 14.1 (constante de acabamento com consequência visível: sobreposição e marca fundida). É o que pesa mais: aparece nos dois PNGs, nos três painéis, e cai numa fronteira de macrorregião, que é o quarto item do `demonstrates`.
* **`v2`, UF sem lead desenhada na classe "na meta ou abaixo".** Pergunta 8; EST-2, ACE-2 e armadilha DAD-2; seção 14.1 (ausência exibida como medida bloqueia sempre). É o mais leve: mora num ramo que o dado padrão não exercita, e foi lido no código, não visto no PNG. É o mesmo peso dado a `22_unidades-waffle-e-pictograma/01_waffle/v4` e a `18_radar/04_radar-de-ciclo/v3`.

## O que foi medido e o que não foi

* **Medido:** os oito PNGs de conferência, com recortes ampliados dos tiles de amostra rala e da legenda da `v1`, da linha da meta e dos tiles da `v2`, da fronteira entre MA e TO da `v3` e dos tiles de `sem dado` da `v4`; o contraste de cada par de texto e de marca nos dois temas, pelos tokens de `app/src/styles/tokens.css` (tabela no fim); as 27 taxas da `v1` e as 27 da `v2` refeitas contra o `data.ts`, com a classe, o anel e o corte do ranking de cada uma; na `v3`, a contagem de UFs acima da média por plataforma (10 de 26, 13 de 25 e 11 de 23) e o maior desvio; na `v4`, os quintis (70, 110, 230, 380 e 1.280), a soma de 5.650 e os 18% de 6.890; o vão entre todos os pares de hexágonos vizinhos da `v3`, pela geometria do código e pelos polígonos do `preview.svg`; a folga do `sem dado` da `v4` em pixels do PNG; a diferença entre o preview e a página nas quatro.
* **Não medido pela ferramenta:** COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA na `v1`, na `v2` e na `v4` (`texto_em_html`); ESPESSURA-MARCA nas quatro (`marca_html` e `sem_marca_de_barra`). Contraste e colisão foram cobertos à mão, pelos tokens e pelos PNGs. EIXO-CALMO, OPACIDADE-MARCA e RAIO-CONTRA-AREA não se aplicam.
* **Não renderizado:** o vazio das quatro; o ramo de UF sem lead da `v1` e da `v2`; o empilhamento abaixo de 560 px da `v2`; a quebra de linha dos painéis da `v3` em contêiner estreito. O que se diz desses ramos é leitura do código.
* **Não testado:** as saídas sugeridas abaixo. São conta sobre a geometria e leitura do código, não render.

## `v2_ufs-acima-da-meta-com-ranking`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 8; EST-2, ACE-2 e armadilha DAD-2; seção 14.1 (ausência)

**Evidência, por leitura de código (o dado padrão não exercita o ramo).** `rateOf` devolve `null` para UF com `leads` 0 (`Chart.tsx:41` a `44`), e o comentário da função diz "ausência, nunca taxa zero". No desenho do tile (linhas 118 a 137) o nulo só tira o número: `isAbove` fica falso, a classe continua `bg-line-strong text-text-primary` com `border-transparent`, e a linha 136 não escreve nada no lugar da taxa. A ausência só existe na dica (linha 130). A legenda da linha 142 dá nome a esse mesmo cinza: "Cinza: na meta ou abaixo". A linha de leitura (linha 100) e a frase acessível (linha 89) usam `data.length` como base, então a UF sem medição entra no "de 27".

**Por que bloqueia.** Lido como está desenhado, o cartão afirma que uma UF sem lead recebido ficou na meta ou abaixo dela. É a ausência exibida numa classe medida, o equivalente binário da ausência como zero, que a seção 14.1 manda bloquear sempre. UF com `leads` 0 é dado válido e provável (a `v4` deste mesmo modelo tem duas) e o tipo `UfLeads` aceita. A `v3` e a `v4` tratam o caso com forma vazada, contorno tracejado e palavra; a `v2` é a única em que a ausência ganha cor de classe. A `v1` tem o mesmo ramo sem a palavra, mas lá o tile sai vazado e não afirma classe, por isso ficou como observação.

**O que mudar.**

1. No ramo `rate === null`, tirar o preenchimento neutro: tile vazado, contorno tracejado em `--text-muted` (5,21:1 no escuro e 5,37:1 no claro contra o cartão) e sigla em `--text-secondary`.
2. No lugar da taxa, o ícone `Unplug` de 12 px em `--text-muted` (EST-2). A palavra de `formatUnavailable()` não cabe no tile: "indisponível" em 11 px pede cerca de 62 px e o tile tem 55 px úteis. Pela GEO-2, o que não cabe muda de lugar e não encolhe.
3. A linha de legenda (linha 142) ganha o terceiro item, escrito, quando houver UF sem lead. A ACE-2 pede forma vazada e palavra, e a palavra fica ali.
4. A base da contagem passa a ser as UFs medidas (`rated.length`) na linha de leitura e na frase acessível. Com o dado padrão o texto não muda: 7 de 27.
5. O dado padrão pode ficar como está. O ramo se confere por leitura e por um render local com uma UF em `leads: 0`, sem gravar.

### Itens de mesma rodada, que não bloqueiam

* **ANO-3.** `scaleMax` (linha 80) sai só da maior taxa. Com meta acima da maior taxa a linha da meta cai fora do trilho, por cima da coluna de valores. O equivalente do `extendDomain` é `Math.max(top.rate, target)` antes do arredondamento. O dado padrão não exercita (meta de 18% contra teto de 25%).
* **TOK-10.** A linha da meta em `--text-secondary` mede 8,16:1 e 8,13:1 contra o cartão e 4,56:1 e 4,43:1 sobre as barras neutras, mas 1,16:1 no escuro e 1,35:1 no claro sobre a barra acesa de PR, onde quase some por 12 px. A leitura se mantém porque a linha continua 4 px acima e 4 px abaixo da barra. A saída da TOK-10 é o halo na cor da superfície ou a guia interrompida.
* **TIP-1.** A linha de leitura (linha 99) e o `10 maiores` (linha 149) estão em Manrope sem `tabular-nums`.
* **NUM-6.** `10 maiores` sem o substantivo (taxas).
* **COR-2.** No mapa a UF em `highlightId` muda só o preenchimento; o peso 700 está no ranking. E a legenda não diz o que é o tile preenchido.

## `v3_hexagonal-cpl-qualificado-por-plataforma`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 15; ESP-3 e seção 14.1 (sobreposição de marcas)

**Evidência.** Nos três painéis o hexágono de MA e o de TO se sobrepõem, e é o único par do mapa sem vão. Visto nos dois PNGs:

| Painel | MA | TO | O que se vê |
|---|---|---|---|
| Plataforma Social | −30, `--positive` | −32, `--positive` | os dois hexágonos fundem numa mancha só, sem vão entre as duas UFs |
| Plataforma de Busca | +4, neutro | −29, `--positive` | TO cobre o canto inferior direito de MA |
| Plataforma Profissional | +6, mistura de `--negative` | sem lead qualificado | o contorno tracejado de TO passa por cima do preenchimento de MA |

Medido nos polígonos do `preview.svg`, iguais nos três painéis: centro de MA em 106,00 e 48,19; centro de TO em 114,00 e 75,90. A distância projetada no eixo de 60 graus, que é o da aresta comum, mede 28,00 px. Dois hexágonos de 30 px de largura precisam de 30,00 px para encostar e de 32,00 px para o vão de 2 px do resto do mapa. São 2,00 px de sobreposição, cerca de 23 px² por painel. Os outros 55 pares a menos de 12 px um do outro têm vão de +2,00 px ou mais.

**Causa.** `REGION_SHIFT` (`Chart.tsx:42` a `48`) empurra o Nordeste 8 px para a direita. MA (linha 2, coluna 5) fica acima e à esquerda de TO (linha 3, coluna 5, Norte, parado), e o empurrão leva MA para cima de TO: cada 2 px de deslocamento horizontal comem 1 px do vão. O comentário da linha 40 registra o encontro de TO com MA para o deslocamento vertical do Norte; o horizontal do Nordeste produz o mesmo encontro pelo outro lado.

**Por que bloqueia.** É sobreposição de marcas no preview, e a seção 14.1 manda descrever pela consequência: na Plataforma Social duas UFs leem como uma forma só, e na Profissional o contorno que significa ausência invade uma UF medida. O quarto item do `demonstrates` ("Macrorregiões separadas por afastamento, sem contorno sobre o hexágono") falha exatamente onde o Norte e o Nordeste se tocam: ali o espaço é negativo.

**O que mudar.**

1. Garantir vão de 2 px ou mais em todo par de hexágonos, conferido por conta sobre os centros e não só no olho.
2. Uma translação rígida do Nordeste não abre as duas fronteiras de MA com o Norte ao mesmo tempo: AP fica acima e à esquerda de MA, TO fica abaixo e à direita, e a soma dos dois vãos é sempre 4 px. Duas saídas calculadas, não renderizadas:
   * Nordeste em `{ x: 8, y: -4.62 }`, paralelo à aresta comum: AP com MA e MA com TO ficam em 2,00 px, PA com MA abre para 10 px e nenhum par fica abaixo de 2.
   * Manter o Nordeste como está e descer só TO 5 px: MA com TO vai a 2,33 px, TO com GO e com DF a 2,87 px, e nenhum par fica abaixo de 2.
3. Nas duas saídas MA com TO fica só com o vão comum, sem espaço extra. Isso já vale hoje para RO com MT e para MT com TO, que têm 2,00 px e só o degrau vertical de 6 px. Ajustar o quarto item do `demonstrates` e o `notes` para dizer onde a separação por espaço vale, ou rever a posição de TO na grade.
4. Conferir os três painéis nos dois PNGs depois da troca.

### Itens de mesma rodada, que não bloqueiam

* **NUM-6, o que mais pesa entre eles.** O número do hexágono sai sem o símbolo (`+17`), logo abaixo de um cabeçalho que escreve outra unidade (`média R$ 84`). AP na Plataforma Social custa R$ 98: o desvio é de +17% e de +R$ 14, e quem lê `+17` como reais erra o valor. Ficou como observação porque a unidade está escrita no rodapé do corpo ("em %") e na dica, que é como o acervo trata número cuja unidade está em outro ponto do cartão. Há folga para resolver: cada mapa mede 236 px (o `notes` diz 280), os três somam 740 px num corpo de 894 px. Pela conta, com célula de 36 px (34 desenhados) os três somam cerca de 824 px e cada painel pede cerca de 234 px de altura contra 237 disponíveis, e `−30%` em 11 px pede cerca de 28 px. Não renderizado.
* **Limiar da legenda.** `bucketOf` (linhas 108 a 114) põe o desvio de exatamente 15 na classe forte, dos dois lados, e a legenda chama essa classe de "mais de 15%". Nenhuma UF do dado padrão cai em 15.
* **Catálogo, quinto item.** O catálogo pede "abaixo de 32 px por hexágono só a sigla aparece e o valor vai para a dica". O SVG tem tamanho fixo, o hexágono nunca fica abaixo de 32 px, e em contêiner estreito os painéis quebram de linha. O `meta.json` trocou o item pelo da ausência sem declarar a troca no `notes`. Declarar.
* **COLISAO-TEXTO, aviso do check.** Sigla e número ficam a 1,98 px de tinta a tinta em 74 pares. Nos dois PNGs os dois se leem soltos. A célula maior do primeiro item resolve junto.
* **Pergunta 21.** O render gravou imagem de diferença nos dois temas. Medido de novo nesta revisão: 0,59% no escuro e 0,65% no claro, acima do 0,5% e abaixo dos 2% que reprovam. A diferença está no texto depois de "CPL " no subtítulo da moldura e no rodapé do Chart, e nas siglas PA e AC: é kerning de texto em SVG contra HTML, de 1 px. As marcas são idênticas nos dois.
* **TOK-8.** Os três degraus do meio se separam por 1,37:1 a 1,62:1 no escuro e por 1,39:1 a 1,56:1 no claro. Quem carrega a classe é o sinal e o número, que estão em todo hexágono medido.

## `v1_taxa-de-qualificacao-por-uf` e `v4_leads-sem-uf-e-ufs-sem-dado`: aprovadas

**`v1`.** As 27 taxas impressas batem com o `data.ts`, as quebras de 4 em 4 p.p. (de 4% a 24%) batem com a legenda e a cor de cada tile bate com a classe. A rampa de cinco degraus (`--seq-1`, `2`, `3`, `6` e `7`) é a saída literal da TOK-2, e com o número em todo tile vale o regime da TOK-8 em que a cor é apoio. O contorno pontilhado de RR, AP e AC (menos de 50 leads) responde à DAD-1 sem espremer o volume num tile de 49 px; o par taxa e volume está na dica. A grade desenhada à mão, e não a do geofacet, está declarada no `data.ts`, no `meta.json` e no README.

**`v4`.** Os três estados não se confundem em nenhum dos dois temas: UF com leads (cor e número), zero medido (vazado, contorno cheio e o 0 escrito, em AC e SE) e sem dado (hachura, contorno tracejado e as palavras, em RR, AP e TO). O card lateral escreve 1.240 e 18% do total de 6.890, fora dos tiles e fora dos quintis. O canvas de 640 por 400 por número está justificado pela GEO-1: a coluna lateral pede 274 px e o corpo tem 281. O ponto a vigiar é a folga do `sem dado`, de 1,5 a 2 px de cada lado até o contorno (tinta de 48,5 px num vão de 52 px): sem colisão no preview, registrado no README.

## Contraste medido

Fórmula da WCAG sobre os tokens, conferida por amostra de cor nos PNGs. Texto pede 4,5:1; marca pede 3:1, salvo com o valor escrito nela.

| Par | Escuro | Claro | Onde |
|---|---|---|---|
| `--text-primary` sobre `--seq-1`, `--seq-2`, `--seq-3` | 12,69, 9,21, 6,33 | 14,82, 12,05, 9,35 | `v1`, `v4` |
| `--accent-cyan-contrast` sobre `--seq-6`, `--seq-7` | 7,38, 10,72 | 5,45, 8,29 | `v1`, `v4` |
| `--seq-1`, `2`, `3` contra o cartão | 1,14, 1,58, 2,29 | 1,21, 1,49, 1,92 | `v1`, `v4`, com o valor escrito |
| `--text-primary` sobre `--line-strong` | 8,13 | 9,79 | `v2`, `v3` |
| `--accent-cyan-contrast` sobre `--chart-1` | 10,06 | 6,00 | `v2` |
| Anel `--chart-1` contra o tile `--line-strong` | 5,32 | 3,27 | `v2` |
| `--line-strong` contra o cartão | 1,79 | 1,83 | `v2`, `v3`, com o valor escrito |
| `--surface-raised` sobre `--positive` e sobre `--negative` | 7,36 e 5,50 | 5,34 e 6,36 | `v3` |
| `--text-primary` sobre as duas misturas de 32% | 5,01 e 5,95 | 7,06 e 6,30 | `v3` |
| `--text-muted` sobre `--surface-sunken` | 5,98 | 4,65 | `v4`, rótulo do card |
| `--text-secondary` e `--text-muted` contra o cartão | 8,16 e 5,21 | 8,13 e 5,37 | as quatro |

## Registro do parecer

```
Versão: 23_mapas/01_tile-grid-por-uf/v1_taxa-de-qualificacao-por-uf
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 7, 13, 26, 27, 28, 29, 30, 31, 32

Versão: 23_mapas/01_tile-grid-por-uf/v2_ufs-acima-da-meta-com-ranking
Data: 2026-10-13
Resultado: reprovada
Não: 8
Correções:
  8. EST-2, ACE-2, DAD-2: desenhar a UF sem lead como tile vazado de contorno tracejado com Unplug, dar a ela um item escrito na legenda e contar só as UFs medidas na base.
Não se aplica: 3, 6, 26, 27, 28, 29, 30, 31

Versão: 23_mapas/01_tile-grid-por-uf/v3_hexagonal-cpl-qualificado-por-plataforma
Data: 2026-10-13
Resultado: reprovada
Não: 15
Correções:
  15. ESP-3, seção 14.1: tirar a sobreposição de 2 px entre MA e TO nos três mapas e garantir vão de 2 px ou mais em todo par de hexágonos.
Não se aplica: 3, 4, 6, 13, 26, 27, 28, 29, 30, 31, 32

Versão: 23_mapas/01_tile-grid-por-uf/v4_leads-sem-uf-e-ufs-sem-dado
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 7, 13, 26, 27, 28, 29, 30, 31, 32
```
