# Parecer de revisão: 23_mapas/02_coropletico-por-uf

> Este arquivo tem duas passadas do mesmo dia. A que vale para o corretor é a **segunda**, logo abaixo, feita sobre a `v4` já corrigida. A primeira vem depois dela, como histórico: o bloqueante dela está resolvido.

# Segunda passada, 2026-10-13: `v4` depois da correção

Revisor independente. Julgada só a `v4_bivariado-com-variavel-ausente`, em `revisao_desatualizada`, pelo arquivo de hoje (`Chart.tsx` e `meta.json` de 11:39:52, `data.ts` de 11:09:58) e pelos PNGs de 11:40:04 e 11:40:05, posteriores aos três. A nota da primeira passada não serviu de régua. `npm run check` com tipos: 0 com erro, 2 avisos, os dois na `v4` (COLISAO-TEXTO em 24 pares e CONTRASTE-TEXTO em 10 trechos), e os dois se confirmam no PNG.

Resultado: `v4` **reprovada, por um bloqueante**. O bloqueante da primeira passada está resolvido: a taxa e o CPL estão escritos nos 24 hexágonos classificados, a isenção da ACE-3 passa a valer para as quatro células tênues e a classe não depende mais só da cor. O que reprova agora é o lugar onde a terceira linha foi parar.

## O que foi medido e o que não foi

* **Como.** O `preview.svg` e o `preview-claro.svg` foram abertos no mesmo navegador do render (Edge, por `playwright-core`), em escala 4, com as fontes embutidas carregadas. De cada tema saíram o desenho inteiro, o desenho sem os textos do mapa (o fundo real) e a tinta de cada linha isolada (sigla, taxa e CPL em camadas separadas). Para cada um dos 75 textos do mapa, cada pixel de tinta foi testado contra o polígono do próprio hexágono e contra a cor real do fundo naquele pixel.
* **Limite da medida.** "Fora do hexágono" é contra o caminho do polígono de preenchimento. O contorno de 1 px na mesma cor acrescenta 0,5 px de tinta para fora, então a parte que sai da área pintada é cerca de 0,4 px menor que o número da tabela. A fração de tinta sobre fundo da cor do texto não tem esse limite: é lida do pixel.
* **Refeito contra o `data.ts`:** as 27 taxas, os 24 valores de CPL, os tercis (12,5% e 17,3% sobre 27 UFs; R$ 95 e R$ 150 sobre 24), as nove combinações (soma 24), a lista do canto em foco e as contagens da legenda. Os 48 valores escritos nos hexágonos batem um a um, as nove cores desenhadas casam uma a uma com as nove combinações e as nove células da legenda têm a mesma cor na mesma posição.
* **Contraste, lido do pixel:** todo texto sobre a própria célula mede de 5,54:1 a 11,63:1 no escuro e de 6,00:1 a 14,51:1 no claro. Passa.
* **Preview contra página**, medida minha com limiar de 25 por canal: 0,30% no escuro e 0,31% no claro.
* **Não renderizado:** o vazio, o ramo de UF com mídia paga e sem lead qualificado e o de UF fora do dado. Lidos no código.
* **Testada só em bancada:** a saída sugerida abaixo foi medida sobre uma cópia do preview, com as âncoras dos textos movidas no DOM, sem tocar no `Chart.tsx`. Não é render do componente: o corretor confere de novo depois de mudar o código.

## Bloqueante 1. Perguntas 13 e 15; ROT-7, ESP-3 e seção 14.1 (constante com consequência no render)

**O que se vê.** A linha do CPL não cabe onde foi posta. Em 16 dos 24 hexágonos classificados ela sai da própria marca, nos dois temas, e nos dois de amostra pequena ela atravessa o contorno pontilhado, que é a marca da amostra pequena.

**Por que acontece.** As três linhas estão ancoradas a 11 px acima, 11 px abaixo e 22 px abaixo do centro (`VALUE_STEP = 11`, `Chart.tsx:36`, aplicado nas linhas 336, 347 e 358). O lado reto do hexágono só vai até 17,07 px do centro (raio do polígono de 34,14 px); dali para baixo a largura cai 3,46 px a cada pixel. A tinta medida do CPL vai de 17,1 a 27,1 px abaixo do centro: a linha inteira está na parte que afunila. Na linha de base dos algarismos, a cerca de 26 px do centro, o hexágono comum tem cerca de 28 px de largura e o de amostra pequena (raio de 30,64 px, pelo `THIN_INSET = 4`) cerca de 16 px, contra 35,5 px de tinta em `R$ 170` e 28,8 px em `R$ 95`. O `notes` afirma "três linhas de 11 px dentro da faixa reta do lado"; a medida diz que só duas estão.

**Evidência medida**, igual nos dois temas, porque a geometria é a mesma:

| Onde | UFs | Tinta do CPL fora do hexágono | Passa da borda | Consequência no PNG |
|---|---|---|---|---|
| Amostra pequena | AC (`R$ 130`) | **25,0%** | **4,62 px** | cruza o canal e o anel pontilhado; 6,4% da tinta na faixa do anel |
| Amostra pequena | RR (`R$ 98`) | **11,6%** | **2,89 px** | cruza o canal e toca o anel; 1,8% da tinta na faixa do anel |
| Célula cheia, CPL de três algarismos | AM, PA, MA, PI, MT, GO, BA, AL, DF, SP | de 4,0% a 5,3% | de 1,47 a 1,79 px | de 2,0% a 2,7% da tinta cai no vão, que tem a cor do próprio texto: **1,00:1**; o pé do `R` e o canto do último algarismo somem |
| Célula tênue, CPL de três algarismos | PE, PB, MG, RJ | de 4,5% a 5,2% | de 1,47 a 1,59 px | o texto em `--text-primary` fica pendurado sobre o vão de 2 px, a menos de 1 px do vizinho |
| CPL de dois algarismos, hexágono comum | CE, RN, SE, MS, ES, RS, SC, PR | 0% | 0 px | cabe, sem folga |

* Na AC e na RR o texto é `--text-primary` e o anel é `--text-secondary`, sem halo: onde se cruzam, o par mede **1,78:1 no escuro e 2,21:1 no claro**. No recorte ampliado do tema claro o `R` e o `0` de `R$ 130` e o `R` e o `8` de `R$ 98` se fundem com os traços do pontilhado. São exatamente as duas UFs classificadas que levam o anel (`demonstrates`, item 5).
* A CONTRASTE-TEXTO do `check` avisou os mesmos 10 trechos das células cheias ("1,00:1 em 4% da tinta") e mandou conferir no PNG. Conferido: é real. Ela não viu a AC nem a RR, porque contorno de forma não entra no fundo que ela resolve.
* **Mesma causa, segunda consequência: leitura apertada.** A taxa e o CPL ficam a 0,75 px de tinta a tinta nos 24 hexágonos (a cauda da vírgula contra o topo do cifrão; entre as fileiras de algarismos são cerca de 3 px), com passo de 11 px para texto de 11 px. A COLISAO-TEXTO avisou os 24 pares, a 1,98 px pela caixa estimada. Enquanto isso sobram 13,7 px vazios entre a sigla e a taxa, e o bloco de três linhas fica 6 px abaixo do centro do hexágono.

**Por que bloqueia.** A pergunta 15 pede os dois PNGs sem corte, sobreposição ou transbordo, e a 13 pede que nenhum rótulo seja cortado nem cruze marca sem halo (ROT-7: o halo é obrigatório e se decide pelo que o dado pode produzir). A seção 14.1 trata posição de rótulo como constante de acabamento, que bloqueia quando o desvio aparece no render, e nomeia as consequências: colisão, texto cortado, marca partida, leitura apertada. Aqui aparecem as quatro, em 16 de 24 marcas, nos dois temas. Não é reprovação pelo 11 nem pelo 22: é pelo que eles fazem na tela. E pesa o papel desta versão: a correção da primeira passada trouxe os valores para dentro da marca para a leitura não depender da cor, e valor que sai da marca e se funde com o contorno entrega isso pela metade.

**O que mudar.**

1. Redistribuir as três linhas para dentro da parte larga do hexágono, usando o espaço que hoje sobra entre a sigla e a taxa. A saída medida em bancada: **a taxa no centro, a sigla 14 px acima e o CPL 14 px abaixo** (`VALUE_STEP = 14`; `y` de `cell.cy - VALUE_STEP`, `cell.cy` e `cell.cy + VALUE_STEP`, no lugar de `- VALUE_STEP`, `+ VALUE_STEP` e `+ VALUE_STEP * 2`).
2. O que a bancada mediu com essa distribuição, nos dois temas: nenhuma das 72 linhas dos 24 hexágonos fica com tinta fora do polígono, inclusive na AC e na RR; a tinta vai de 18,1 px acima a 19,2 px abaixo do centro; ficam de 5,5 a 6,0 px entre a sigla e a taxa e 3,75 px entre a taxa e o CPL; o pior contraste do CPL volta a ser o da própria célula (de 5,54:1 para cima).
3. A conta por trás, para o caso de outra distribuição: a tinta de cada linha em torno da própria âncora, com `dominant-baseline="central"`, mede de 4,1 px acima a 4,4 px abaixo na sigla de 12 px, de 3,9 acima a 5,4 abaixo na taxa (a vírgula desce) e de 4,9 acima a 5,1 abaixo no CPL (o cifrão passa dos algarismos nos dois sentidos). O teto que decide é o do hexágono de amostra pequena: para o CPL de 35,5 px ter 2 px de folga de cada lado dentro do preenchimento recuado, a base da tinta dele não pode passar de 19,2 px abaixo do centro; no hexágono comum o limite é 22,7 px. Hoje ela está a 27,1 px.
4. Com o passo de 14 px o CPL de três algarismos cabe nos dois tipos de hexágono, mas na AC fica no limite da folga de 2 px. O de quatro algarismos (`R$ 1.050`, cerca de 46 px) não cabe no hexágono de amostra pequena, que tem cerca de 40 px na base da linha. Declarar no `notes` o teto que o hexágono comporta, como a `v3` fez, ou tratar o caso.
5. Alinhar o texto que descreve a posição: no `notes`, a frase "três linhas de 11 px dentro da faixa reta do lado", e o comentário de `VALUE_STEP` no `Chart.tsx`.
6. Conferir depois do render, nos dois temas: a AC e a RR (o CPL dentro do preenchimento, sem tocar o canal nem o anel), as dez células cheias (nenhum canto de glifo apagado) e os dois avisos do `check`, que devem sair: CONTRASTE-TEXTO sem trecho a 1,00:1 e COLISAO-TEXTO sem os 24 pares.

## Itens de mesma rodada, que não bloqueiam

* **Taxa das três UFs em hachura só na dica** (RO 10,2%, TO 10,9% e AP 11,1%), DIC-1. Agora que os outros 24 hexágonos escrevem a taxa, essas três são as únicas sem ela no desenho parado. A célula de 62 px comporta a taxa sob a sigla, com o mesmo halo.
* **Tabela do canto em foco.** `8,9% (10 de 112)` vai sem o substantivo (NUM-6); a dica escreve "10 de 112 leads". E a tabela agora repete o CPL e a taxa que o hexágono já escreve: o que ela acrescenta é o nome e o volume.
* **DAD-1.** A taxa no hexágono vai sem o volume; a amostra pequena é marcada pelo pontilhado e o volume das outras 20 UFs fica na dica. Mesmo tratamento da `v1`.
* **Seguem da primeira passada, sem mudança no arquivo:** a legenda da hachura diz "sem mídia paga" também para UF com mídia e sem lead qualificado; os tercis da taxa saem das 27 UFs, incluídas as três fora da paleta; o canto alto e alto no escuro contrasta menos com o cartão que o de taxa alta com CPL baixo; `--text-primary` entra na mistura de um preenchimento.
* **ROT-4.** A grade 3x3 ocupa 185 dos 362 px do corpo (51%). Fica ao lado do mapa, sem consequência.
* **TIP-4.** A taxa e o CPL do hexágono, em `font-display`, não declaram peso e herdam o 400; o navegador entrega o 500. Sem consequência visível.
* **README, Anatomia, item 2.** Diz sigla em 11 px; na `v4` a sigla está em 12 px.

## Registro do parecer

```
Versão: 23_mapas/02_coropletico-por-uf/v4_bivariado-com-variavel-ausente
Data: 2026-10-13
Resultado: reprovada
Não: 13 e 15
Correções:
  13. ROT-7: tirar o CPL de cima do anel pontilhado na AC e na RR, trazendo a linha para dentro do preenchimento.
  15. ESP-3 e seção 14.1: redistribuir as três linhas (taxa no centro, sigla 14 px acima, CPL 14 px abaixo) para o CPL não sair do hexágono em 16 de 24 marcas nem ficar a 0,75 px da taxa.
Não se aplica: 3, 4, 6, 7, 26, 27, 28, 29, 30, 32
```

# Primeira passada, 2026-10-13 (histórico)

Data: 2026-10-13. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render de 11:18:45 a 11:18:54, posterior ao `Chart.tsx`, ao `data.ts` e ao `meta.json` das quatro, o mais novo de 11:18:38). `npm run check` com tipos: 0 com erro, 0 avisos.

Resultado: `v1`, `v2` e `v3` aprovadas; `v4` reprovada, por um bloqueante. As observações não bloqueantes das quatro estão no README do modelo.

## Sobre a malha de hexágonos

O catálogo descreve o modelo com o contorno real das UFs (`ufPaths.ts`, `regiaoPaths.ts`). As quatro versões pintam o coroplético sobre uma malha de hexágonos declarada no `data.ts`. Não foi tratado como versão que não demonstra o catálogo, por três razões conferidas: a seção 1 do contrato fecha a versão em cinco arquivos e a seção 6 fecha a lista de imports; a linha do modelo em `_operacao/fila.json` (ordem 66) traz a nota "Sem geometria de UF nos imports permitidos: coroplético sobre tile ou hexágono, declarado no README"; e o desvio está declarado no README, no `notes` das quatro e no comentário da malha, com as vizinhanças perdidas e criadas escritas.

## Peso do bloqueante

* **`v4`, quatro das nove cores da paleta abaixo de 3:1 contra o cartão, sem valor escrito na marca.** Pergunta 20, com reflexo na 19 e na 30; ACE-3, ACE-2 e papel Categórico da 17.2; seção 14.1 (contraste bloqueia sempre). Aparece nos dois PNGs, em 9 das 24 UFs classificadas, e é o mesmo defeito já reprovado em `24_microvisuais-sparklines/04_faixa-de-status-tracker/v2`, em `16_distribuicao/06_densidade-kde/v3` e em `20_cronograma-e-linha-do-tempo/04_jornada-por-entidade` (`v1` e `v2`): cor abaixo do piso em marca que não leva o número.

## O que foi medido e o que não foi

* **Medido:** os oito PNGs de conferência, com recortes ampliados do mapa das quatro nos dois temas e da legenda da `v4`; o contraste de cada par de texto e de marca nos dois temas, pelos tokens de `app/src/styles/tokens.css`, e conferido por amostra de cor nos dois PNGs da `v4` (12 pontos por tema, todos iguais à conta); as 27 taxas da `v1`, os limites dos quantis, a contagem por classe (7, 4, 6, 5 e 5) e as 5 maiores; os 27 desvios da `v2`, a média de 16,4% (1.798 de 10.945), a contagem dos 7 degraus (2, 5, 5, 1, 4, 5 e 5) e o maior desvio; na `v3`, as 26 médias por UF, as 5 médias ponderadas por região, as posições, a cobertura, as quebras de R$ 600 a R$ 950 e o canal entre regiões vizinhas pela geometria do código (de 5 a 10,2 px, nenhum par sobreposto); na `v4`, as 27 taxas, os 24 valores de CPL, os tercis (12,5% e 17,3%; R$ 95 e R$ 150), a contagem das nove combinações (soma 24) e a tabela do canto em foco; a distância de cor entre as nove células da `v4`, em ΔE76, com visão normal e em deuteranopia simulada (matriz de Machado 2009, a mesma da COR-8); a diferença entre o preview e a página nas quatro (de 0,02% a 0,03% na `v1` e na `v2`, abaixo de 0,01% na `v3`, 0,35% e 0,36% na `v4`, com limiar de 25 por canal, medida minha e não a do render).
* **Não medido pela ferramenta:** ESPESSURA-MARCA, EIXO-CALMO e RAIO-CONTRA-AREA não se aplicam. OPACIDADE-MARCA não mediu nenhuma das quatro, e na `v2` e na `v4` a mistura com o cartão por `color-mix` compõe a mesma cor que o `fillOpacity` comporia; medido à mão. FORMATO-ACESSIVEL não mediu a `v3` (a frase usa a função `money`); conferido à mão, o corpo e a frase usam o mesmo `formatCurrency` sem centavo. CONTRASTE-MARCA mediu as quatro sem aviso: ela isenta toda forma com texto por cima, e na `v4` esse texto é a sigla, não o valor.
* **Não renderizado:** o vazio das quatro; o ramo de UF sem lead da `v1` e da `v2`; a visão de macrorregiões da `v3` (`selectedRegion` nulo); o ramo de UF com mídia e sem lead qualificado da `v4`. O que se diz desses ramos é leitura do código.
* **Não testado:** as saídas sugeridas abaixo. São conta sobre a geometria e sobre os tokens, não render.

## `v4_bivariado-com-variavel-ausente`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 20, com reflexo na 19 e na 30; ACE-3, ACE-2 e 17.2 (Categórico); seção 14.1

**Evidência.** `PALETTE` (`Chart.tsx:60` a `76`) desenha quatro das nove combinações como mistura de 14% ou 40% da cor com `--surface-raised`. O hexágono escreve só a sigla (linhas 327 a 337); a taxa e o CPL ficam na dica (linha 318). Medido pelos tokens e conferido por amostra de cor nos dois PNGs, na legenda e no mapa:

| Combinação | UFs no dado padrão | Cor no escuro | Contra o cartão | Cor no claro | Contra o cartão |
|---|---|---|---|---|---|
| taxa baixa, CPL baixo | RN, SE | `#252c4a` | **1,25:1** | `#e8e5f6` | **1,24:1** |
| taxa média, CPL baixo | ES | `#1d6678` | **2,62:1** | `#9dc5cb` | **1,86:1** |
| taxa baixa, CPL médio | PB, RR | `#683d5f` | **1,97:1** | `#dcadc6` | **1,94:1** |
| taxa média, CPL médio | MG, AC, PE, RJ | `#48487e` | **2,03:1** | `#bdb5e7` | **1,92:1** |
| as cinco células cheias | as outras 15 | | de 5,76:1 a 9,50:1 | | de 6,00:1 a 9,91:1 |

São 9 das 24 UFs classificadas em marca abaixo de 3:1, nos dois temas. O contorno em `--line-strong` do canto baixo e baixo mede 1,79:1 e 1,83:1 e também não chega ao piso. A amostra da lista de cantos (`taxa baixa, CPL baixo`) tem a mesma cor e o mesmo contorno.

A classe dessas UFs só existe na cor. Fora do canto em foco (PI, MA, PA e AL, que a tabela escreve), 20 das 24 UFs não têm a taxa nem o CPL em nenhum texto do desenho parado. E a cor não se sustenta sozinha: entre as células tênues a razão de luminância vai de 1,03:1 a 2,10:1 no escuro e de 1,01:1 a 1,57:1 no claro, então quem separa é o matiz. Em deuteranopia simulada, a distância ΔE76 entre `taxa média, CPL baixo` (ES) e `taxa baixa, CPL médio` (PB, RR) cai para 4,5 no claro e 10,0 no escuro; entre `taxa alta, CPL médio` (MT, GO, SP) e `taxa média, CPL alto` (AM, BA), para 8,5 no claro; entre `taxa alta, CPL médio` e `taxa alta, CPL alto` (DF), para 8,2 no escuro. Na mesma régua, a COR-8 pede rótulo em cada marca para os pares que medem 4,1 e 15. É simulação por matriz, não teste com pessoa.

O texto, esse, passa: a sigla mede de 5,55:1 a 14,51:1 sobre as nove células nos dois temas.

**Por que bloqueia.** A ACE-3 pede 3:1 de marca e de amostra contra o fundo adjacente, "salvo quando o valor está escrito na marca ou junto dela". A sigla diz qual é a UF, não quanto ela mede, e o próprio `notes` reconhece que a isenção vale "só em parte". A 17.2 repete a condição nos dois papéis que a paleta ocupa: intensidade abaixo do piso só vale com o valor escrito na célula (papel Sequencial), e `--chart-7` só entra com rótulo direto em cada marca (papel Categórico). A mistura com o cartão é a mesma conta do `fillOpacity` que a ACE-5 manda manter acima de 3:1 nos dois temas; trocar a opacidade por `color-mix` conserta o texto (e isso está certo) e não muda o contraste da marca. A seção 14.1 põe contraste entre as regras que bloqueiam sempre, e o catálogo pedir "canto baixo e baixo perto do fundo" não autoriza o que o contrato proíbe: foi essa a régua aplicada ao tracker de 52 semanas, que também seguia o catálogo e também declarava a TOK-8.

O que o desenho perde não é detalhe de acabamento. A pergunta do caso de uso tem resposta escrita (a linha de leitura e a tabela), mas a versão existe para mostrar a relação entre as duas medidas nas outras 20 UFs, e ali a leitura depende de casar nove cores com a legenda, quatro delas mais perto do cartão do que o piso permite.

**O que mudar.** Há dois caminhos. O primeiro é o recomendado; o segundo fica aberto, com uma armadilha já medida.

Caminho A, escrever o que a cor diz (conta sobre a geometria, não renderizado):

1. Em cada hexágono classificado, abaixo da sigla, escrever a taxa e o CPL com os formatadores que a tabela já usa (`formatPercent(rate, 1)` e `formatCurrency(cpl, 0)`), em `font-display` de 11 px e na cor de `paletteText`. Com os dois valores na marca a isenção da ACE-3 passa a valer para as células tênues, a classe deixa de depender só da cor (ACE-2) e a paleta vira apoio de varredura, que é o regime da TOK-8 para célula com número, o mesmo da `v1`, da `v2` e da `v3`.
2. Três linhas não cabem na célula de 44 px, cuja faixa de largura cheia tem 24 px de altura. Pela conta, com `HEX_W` de 52 px (raio desenhado de 28,4 px) e linhas de base a −11, +2 e +15 px do centro: a linha do CPL tem cerca de 46 px úteis contra cerca de 36 px de `R$ 224`, a sigla tem cerca de 30 px úteis no topo contra cerca de 21 px de `MG`, e sobram 5 px de tinta a tinta entre as linhas.
3. O mapa passa a 342 por 290 px e não fecha no corpo do `largo`, que tem 281,5 px de altura. Canvas por número, pela GEO-1, com a conta refeita no `notes`. A coluna lateral cai de 588 para 536 px e continua comportando a legenda de 200 px e as listas.
4. Na UF de amostra pequena o preenchimento recua 4 px (`THIN_INSET`) e a linha do CPL fica com cerca de 34 px úteis para 36 px de texto: o valor cruzaria a borda do preenchimento. Rever o recuo ou levar o pontilhado para o vão, e conferir AC e RR nos dois temas.
5. Nas três UFs em hachura a taxa é medida (RO 10,2%, TO 10,9% e AP 11,1%) e hoje só está na dica. Se couber, escrever a taxa sob a sigla, com o mesmo halo.
6. Alinhar o que ainda diz "só a sigla": o comentário de `HEX_W` e o do topo do `Chart.tsx`, o `demonstrates` (que passa a dizer que a taxa e o CPL vão escritos no hexágono), o trecho do `notes` sobre a isenção em parte, e no README a Anatomia (item 2) e o tamanho do SVG em Como colar (item 6).

Caminho B, manter só a sigla e subir as nove células ao piso (aberto, não provado):

1. Com a sigla dentro, a célula precisa medir 4,5:1 contra o cartão para ler com texto vazado, o que já entrega os 3:1 da marca. Entre 3:1 e 4,5:1 nenhum dos dois textos passa nos dois temas, que é a lacuna da TOK-2. Na prática as nove células viram cheias e a ordem deixa de morar na luminância.
2. Uma candidata foi testada em conta e não serve: apagar as classes baixas na direção de `--text-muted` em vez do cartão (`--text-muted` no canto baixo e baixo e mistura de 50% nas três células do meio). Passa no contraste, de 5,21:1 a 9,91:1 nos dois temas, e falha na separação: no claro `taxa média, CPL baixo` fica a ΔE76 de 8,2 de `taxa alta, CPL baixo` com visão normal e a 1,6 em deuteranopia.
3. Este caminho abandona o quinto item do catálogo (canto baixo e baixo perto do fundo), e isso se declara no `notes`. Só vale com os dois PNGs conferidos e a distância entre as nove cores medida nos dois temas.

Nos dois caminhos, conferir que a hachura, o pontilhado da amostra pequena e a menor classe continuam distintos entre si nos dois temas.

### Itens de mesma rodada, que não bloqueiam

* **Legenda da hachura.** O texto diz "sem mídia paga: fora da paleta, sem CPL", mas `cplOf` (linhas 147 a 150) também devolve nulo para UF com mídia paga e nenhum lead qualificado, e ela ganharia a mesma hachura e a mesma frase. O dado padrão não exercita. Trocar por um texto que valha para os dois casos ou separar os dois.
* **Tercis da taxa.** Os limites de 12,5% e 17,3% saem das 27 UFs com taxa, incluídas as três sem CPL, que não entram na paleta: a classe baixa da taxa tem 11 UFs e só 8 pintadas. A legenda escreve os limites, então nada falso é afirmado; dizer no `notes` sobre que conjunto cada variável é classificada.
* **Canto alto e alto no escuro.** Mede 8,34:1 contra o cartão, menos que `taxa alta, CPL baixo` (9,50:1). Declarado no `notes` como lacuna de paleta. Com os valores escritos deixa de pesar.
* **Token de texto em preenchimento.** `--text-primary` entra com 35% na mistura do canto alto e alto. Sem consequência visível.
* **ROT-4.** A grade 3x3 ocupa 185 dos 281,5 px do corpo (66%). Fica ao lado do mapa, sem consequência.
* **TIP-4.** Os limites da legenda e o CPL da tabela em `font-display` não declaram peso e herdam o 400; o navegador entrega o 500. Sem consequência visível.

## `v1`, `v2` e `v3`: aprovadas

**`v1_taxa-de-qualificacao-sequencial`.** As 27 taxas impressas batem com o `data.ts`, os limites dos quantis (10,9%, 12,5%, 18,0%, 21,0% e 23,9%) batem com a legenda, o empate de TO e AL em 10,9% fica na mesma classe e a cor de cada hexágono bate com a classe. A rampa de cinco degraus (`--seq-1`, `2`, `3`, `6` e `7`) é a saída literal da TOK-2 e, com a taxa em todo hexágono, vale o regime da TOK-8 em que a cor é apoio. A lista das 5 maiores traz o volume. O que fica para o README: o volume das outras 22 UFs só está na dica.

**`v2_desvio-da-media-nacional`.** Os 27 desvios batem com a diferença entre a taxa e a média já arredondadas, os dois limites de classe são exercitados e pertencem à classe mais forte, como a legenda escreve (SP, com −2,0, fica no degrau médio e PA, com −5,0, no forte), MG sai em 0,0 sem sinal e DF leva o contorno grosso e a anotação. O sinal está em todo valor, a polaridade segue a COR-6 e a troca de `fill-opacity` por `color-mix` opaco está declarada. As misturas de 20% e de 50% ficam abaixo de 3:1 contra o cartão, e aqui a isenção vale inteira, porque o desvio está escrito em cada marca. O que fica para o README: a unidade fora do hexágono e o volume só na dica.

**`v3_macrorregiao-com-drill-para-uf`.** As médias por região são ponderadas pelas contagens (Nordeste R$ 825 com 1.125 de 1.419, Norte R$ 536, Centro-Oeste R$ 697, Sudeste R$ 755, Sul R$ 732), as posições entre as 26 UFs medidas batem (empate de MA e GO em 16º), PI sai vazado no mapa e com `formatUnavailable()` e ícone na tabela, e a cobertura de 0 de 41 é zero medido, não ausência. A escala recalculada para a camada aberta está dita na legenda, e as regiões fechadas ficam em neutro com o valor escrito, sem classe emprestada. Nenhum par de blocos se sobrepõe: o menor canal é de 5 px. O canvas por número está justificado pela GEO-1. A visão de macrorregiões não está no preview e foi conferida só por leitura.

## Contraste medido

Fórmula da WCAG sobre os tokens; na `v4`, conferida por amostra de cor nos dois PNGs. Texto pede 4,5:1; marca pede 3:1, salvo com o valor escrito nela.

| Par | Escuro | Claro | Onde |
|---|---|---|---|
| `--text-primary` sobre `--seq-1`, `--seq-2`, `--seq-3` | 12,69, 9,21, 6,33 | 14,82, 12,05, 9,35 | `v1`, `v3` |
| `--accent-cyan-contrast` sobre `--seq-6`, `--seq-7` | 7,38, 10,72 | 5,45, 8,29 | `v1`, `v3` |
| `--seq-1`, `2`, `3` contra o cartão | 1,14, 1,58, 2,29 | 1,21, 1,49, 1,92 | `v1`, `v3`, com o valor escrito |
| `--text-primary` sobre as misturas de 20% e de 50% de `--positive` | 9,99 e 5,14 | 13,51 e 8,39 | `v2` |
| `--text-primary` sobre as misturas de 20% e de 50% de `--negative` | 11,11 e 6,47 | 12,85 e 7,35 | `v2` |
| `--surface-raised` sobre `--positive` e sobre `--negative` | 7,36 e 5,50 | 5,34 e 6,36 | `v2` |
| Misturas de 20% e de 50% contra o cartão | de 1,31 a 2,83 | de 1,33 a 2,44 | `v2`, com o desvio escrito |
| `--text-secondary` sobre `--surface-sunken` | 9,36 | 7,04 | `v3`, região fechada |
| `--text-primary` sobre as quatro células tênues | de 5,55 a 11,63 | de 9,27 a 14,51 | `v4` |
| `--surface-raised` sobre as cinco células cheias | de 5,76 a 9,50 | de 6,00 a 9,91 | `v4` |
| Quatro células tênues contra o cartão | **de 1,25 a 2,62** | **de 1,24 a 1,94** | `v4`, **sem valor escrito** |
| `--text-muted` e `--text-secondary` contra o cartão | 5,21 e 8,16 | 5,37 e 8,13 | hachura, ausência e pontilhado |

## Registro do parecer

```
Versão: 23_mapas/02_coropletico-por-uf/v1_taxa-de-qualificacao-sequencial
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 7, 13, 26, 27, 28, 29, 30, 31, 32

Versão: 23_mapas/02_coropletico-por-uf/v2_desvio-da-media-nacional
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 7, 26, 27, 28, 29, 31, 32

Versão: 23_mapas/02_coropletico-por-uf/v3_macrorregiao-com-drill-para-uf
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 7, 13, 26, 27, 28, 29, 30, 31, 32

Versão: 23_mapas/02_coropletico-por-uf/v4_bivariado-com-variavel-ausente
Data: 2026-10-13
Resultado: reprovada
Não: 20, com reflexo na 19 e na 30
Correções:
  20. ACE-3, ACE-2, 17.2, seção 14.1: escrever a taxa e o CPL em cada hexágono, com célula maior e canvas por número, ou levar as nove células a 3:1 contra o cartão com a sigla a 4,5:1 nos dois temas.
Não se aplica: 3, 4, 6, 7, 13, 26, 27, 28, 29, 32
```
