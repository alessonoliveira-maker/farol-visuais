# Treemap

## O que é

Retângulos lado a lado cuja área é proporcional ao valor de cada categoria, preenchendo um espaço fixo sem sobra nem escala; lê-se pela comparação de tamanho entre as células e pelo agrupamento visual das maiores contra a cauda de pequenas, sem eixo nem grade. A área é o único canal quantitativo do modelo, e por isso a soma dos filhos precisa fechar com o pai: quando não fecha, a peça declara o que fez com a diferença, em vez de deixar a área mentir.

## Quando usar

- Parte do todo com 8 a 40 categorias, quando a barra ficaria longa demais para o cartão.
- Uma hierarquia explorada um nível por vez, com trilha de navegação sempre visível.
- Área para tamanho (investimento, receita) e cor para desempenho com sinal (variação, desvio contra meta).
- Leitura de concentração: poucos itens grandes e uma cauda de itens pequenos.

## Quando evitar

- Menos de 6 categorias: a barra horizontal ordenada lê melhor (família 02).
- Pergunta de quanto a mais com precisão: comparar área é grosseiro; prefira barras.
- Valores negativos ou zero: não cabem em área; ficam fora do desenho e numa lista à parte.
- Dois ou três níveis que precisam ser vistos de uma vez: use o treemap aninhado (12/02).
- Métrica de cor com mais de três faixas que precisem ser distinguidas pelo tom: os tokens do Farol não entregam isso, e o caminho é nomear a faixa (ver Anatomia, item 7).

## Anatomia

1. **Célula.** Um retângulo por categoria, com área proporcional ao valor. A `v1` e a `v4` pintam tudo em `--chart-1`, porque ali há uma série só; a `v2` acende uma célula em `--chart-1` e deixa as demais no neutro de dado `--text-muted`; a `v3` pinta o sentido da variação em `--negative`, `--text-muted` e `--positive`.
2. **Vão entre células.** `nodeGap` de 2 px do Recharts, com o nó de profundidade zero pintado em `--surface-raised`, o separador entre segmentos da tabela 17.2, para o vão revelar essa cor em vez de uma borda.
3. **Rótulo interno, e a regra de quando ele não cabe.** Nome em `font-sans` e número em `font-display`, avaliados **como par**: a célula só ganha texto quando os dois cabem juntos na largura e na altura disponíveis, e a célula pequena demais fica **muda**, nunca com só o nome ou só o número (ROT-10). O nome nunca é cortado por reticência (TIP-7): ele quebra em até duas linhas por palavra inteira, no corte mais equilibrado que caiba dos dois lados, e quando nem isso cabe a função devolve `null` e a célula fica muda, porque a seção 5 proíbe contar com `overflow` para esconder o que vaza. A largura de caractere usada na conta é **superestimada de propósito** (6,6 px em Manrope e 7,2 px em Space Grotesk a 12 px, contra 6,31 e 7,08 medidos): aqui o lado seguro é o oposto do caso geral, porque rótulo que transborda cai sobre a célula vizinha e nenhuma guarda mede texto contra retângulo, enquanto rótulo escondido é coberto pela lista do item 4.
4. **Lista de identificação.** Abaixo do treemap, para **toda** célula desenhada, não só as que ficaram mudas: um quadrado da cor da célula, o nome e o número em coluna à direita (TIP-6). Ela não depende do tamanho que cada célula recebeu no layout do Recharts, então cobre com certeza a célula pequena demais para texto. É ela que cumpre a ROT-10, porque **a dica não conta**: não existe no preview, no papel nem para quem navega por teclado ou leitor de tela. Por isso nenhuma versão deste modelo desenha dica (DIC-1).
5. **Texto sobre a célula.** O único par aprovado pela ROT-6 é `--accent-cyan-contrast` sobre `--chart-1` (10,06:1 no escuro, 6,00:1 no claro). Sobre as demais marcas cheias deste modelo o texto sai **vazado na cor do cartão**, `--surface-raised`, medido em 5,21:1 e 5,37:1 sobre `--text-muted`, 5,50:1 e 6,36:1 sobre `--negative` e 7,36:1 e 5,34:1 sobre `--positive`. `--text-primary` sobre marca categórica mede de 1,53:1 a 3,37:1 e é proibido.
6. **Ausência.** Categoria sem base de comparação sai em contorno `--text-muted` sem preenchimento, o papel de ausência da 17.2, e é nomeada na lista e na régua; valor zero ou negativo sai do desenho, porque área não representa isso, e vai para a linha de rodapé com o motivo.
7. **Régua da métrica de cor.** Quando a cor carrega variação (`v3`), a magnitude **não mora no tom**: não existe rampa divergente nos tokens do Farol (TOK-3), a sequencial só tem três degraus acima de 3:1 nos dois temas e eles nem se separam entre si (TOK-8). A cor carrega o sentido, e a faixa vai pela **posição fixa na régua**, pelo **nome escrito** e pelo número com sinal na célula e na lista.
8. **Fechamento da área.** Em desenho de um nível, a soma das células é o total do recorte, escrito na linha de leitura. No detalhamento (`v4`), o valor de um nó com filhos é **sempre a soma dos filhos**, nunca um total declarado à parte, o que faz o pai fechar com os filhos por construção; ramo sem filhos mantém o valor declarado e a peça escreve que ele não se divide.
9. **Frase acessível.** `aria-label` na raiz com `role="figure"`, e não `role="img"`, porque a lista de identificação e os botões de navegação precisam continuar acessíveis a quem usa teclado ou leitor de tela.

## Versões

- `v1_receita-por-produto`: Recharts nativo com conteúdo customizado, nome e valor avaliados como par (célula pequena demais para os dois fica muda) e lista de identificação abaixo do treemap com cor, nome e valor de todo produto, inclusive o que ficou fora do desenho por valor zero ou negativo. Previews: [preview.svg](v1_receita-por-produto/preview.svg) e [preview-claro.svg](v1_receita-por-produto/preview-claro.svg).
- `v2_produto-que-mais-cresceu`: uma célula acesa em `--chart-1` e as demais no neutro `--text-muted`, com o destaque escolhido no `data.ts` e nunca inferido no render, e uma linha de leitura calculada do dado que traz crescimento, pontos de participação e a base de cada um. Previews: [preview.svg](v2_produto-que-mais-cresceu/preview.svg) e [preview-claro.svg](v2_produto-que-mais-cresceu/preview-claro.svg).
- `v3_cpl-qualificado-por-campanha`: dois canais, área para o investimento e cor para o sentido da variação do CPL, com a escala invertida escrita na régua, cinco faixas nomeadas em ordem, campanha sem mês anterior em contorno vazado e célula abaixo de 1% do investimento sem rótulo. Previews: [preview.svg](v3_cpl-qualificado-por-campanha/preview.svg) e [preview-claro.svg](v3_cpl-qualificado-por-campanha/preview-claro.svg).
- `v4_detalhamento-com-ramo-vazio`: detalhamento plataforma, campanha e criativo com trilha sempre visível, cabeçalho do nível com o peso do ramo no todo, estado vazio com botão de voltar no lugar de um retângulo único, caminho inicial declarado no `data.ts` e `key` com a assinatura do filtro. Previews: [preview.svg](v4_detalhamento-com-ramo-vazio/preview.svg) e [preview-claro.svg](v4_detalhamento-com-ramo-vazio/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão mais próxima para a página de destino.
2. Troque o tipo e o dado de exemplo pela query real, mantendo o índice de string que o `TreemapDataType` do Recharts exige (`[key: string]: unknown`).
3. Não filtre `data` antes de passar: as versões já separam internamente o que entra no desenho do que só entra na lista de identificação.
4. Dê altura ao pai (`h-64` na grade, por exemplo) ou passe `height`, porque o `ResponsiveContainer` desenha zero sem isso.
5. Na `v2`, passe `highlightId` vindo da página; na `v4`, passe `filterSignature` com a assinatura do filtro global, ou o caminho aberto sobrevive a um recorte que apagou o ramo.
6. Ajuste `MIN_LABEL_WIDTH`, `MIN_LABEL_HEIGHT`, `LABEL_LINE_HEIGHT`, `NAME_CHAR_WIDTH` e `VALUE_CHAR_WIDTH` só se o canvas real da página for muito diferente do canvas do catálogo, e lembre que superestimar a largura de caractere é o lado seguro aqui.

## Referências

- Catálogo: [Recharts, API Treemap](https://recharts.github.io/en-US/api/Treemap/).
- Catálogo: [Recharts, exemplo de Treemap](https://recharts-recharts.mintlify.app/examples/treemap).
- Catálogo: [From Data to Viz, Treemap](https://www.data-to-viz.com/graph/treemap.html).
- Catálogo: [Data Visualisation Catalogue, Treemap](https://datavizcatalogue.com/methods/treemap.html).
- Praticante: [Ben Shneiderman, Treemaps for space constrained visualization of hierarchies](https://www.cs.umd.edu/hcil/treemap-history/).
- Praticante: [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide).
- Portal de design: [Behance, UK's Public Sector Expenditure in One Treemap Chart](https://www.behance.net/gallery/193257421/UKs-Public-Sector-Expenditure-in-One-Treemap-Chart).

## Colisões entre o catálogo e o CONTRATO, resolvidas a favor do contrato

Cada uma está também na nota do `meta.json` da versão.

- `v2`: o catálogo pede as células não destacadas em `chart-1` com **opacidade 0,6**. Medido, `chart-1` composto a 0,6 contra o cartão dá **4,22:1 no escuro e 2,69:1 no claro**, abaixo do piso de 3:1 que a ACE-5 cobra da marca com opacidade. O neutro saiu para `--text-muted`.
- `v2`: o catálogo pede o contorno do destaque em **accent-amber**, que não tem utilitário, é acento de interface e repete o hex de `--warning` e de `--prov-premissa`; pela COR-8 um visual que pinta variação semântica no corpo não usa esses hexes. O destaque saiu em `--chart-1`, com o segundo canal da COR-2 no peso 700 e na linha de leitura.
- `v3`: o catálogo pede **escala divergente de cinco faixas de cor**, e a TOK-3 registra que não existe rampa divergente nos tokens; a TOK-8 mede que a sequencial tem três degraus úteis, e que eles se separam do fundo mas não entre si (1,42:1 a 2,07:1). A cor passou a carregar só o sentido, e as cinco faixas continuam existindo nomeadas e ordenadas na régua.
- `v3`: o catálogo pede **opacidade menor** abaixo de 1% do investimento, e a ACE-5 cobra da marca com opacidade os mesmos 3:1 (`--negative` a 0,6 mede 2,71:1 e 2,99:1). O recuo de ênfase virou célula muda mais o nome na linha de rodapé.
- `v3`: o catálogo manda o rótulo só nas campanhas com piora acima de 30% e **as demais na dica**; a ROT-10 diz que a dica não conta. O rótulo passou a depender de caber, e a identificação de toda campanha vive na lista.
- `v1`: o catálogo descreve o vão entre células em `surface-canvas`, e a versão usa `surface-raised`, que é o separador correto da tabela 17.2 dentro de um cartão.

## Observações da revisão (não bloqueantes, resolvidas na leva de 2026-09-28)

- **Defeito da `v1` que não se propagou para as irmãs.** O `wrapName` da `v1` tem um retorno de emergência: quando nenhum corte de palavra cabe na largura, ele devolve duas linhas mesmo assim, e elas podem passar da célula e invadir a vizinha. Isso contraria a seção 5 do contrato ("Conteúdo que passa da área do corpo gera aviso... Nunca conte com `overflow` para esconder") e a saída da GEO-2, que manda o nó ficar sem texto e entrar na lista de identificação quando nem a quebra em duas linhas cabe. Nas três versões novas a função devolve `null` nesse caso e a célula fica muda. Origem: `v1_receita-por-produto/Chart.tsx`, linhas 82 e 83 (`const half = Math.ceil(words.length / 2); return [...]`), e a própria `v1` já registrava o sintoma em Pendências conhecidas.
- **A largura de caractere da `v1` é herdada, não medida.** `CHAR_WIDTH = 6.3` é usado para nome e para valor, e a tabela do contrato mede 0,526 em em minúscula de Manrope (6,31 px a 12 px) e 0,590 em em dígito de Space Grotesk (7,08 px): o valor formatado é subestimado em 11%. Nas versões novas a constante é por família e superestimada. É observação de acabamento pela 14.1, não bloqueio: na `v1` o dado fixo não produz transbordo.
- `v3`: as guardas de desenho medem a peça, mas o par de texto vazado sobre marca cheia não está na tabela da ACE-8; ele foi medido à mão e está na nota do `meta.json`, com os seis números.
- `v4`: no ramo vazio a peça não tem SVG de gráfico, e o serializador grava tudo como ilha de HTML; `CONTRASTE-TEXTO` e `COLISAO-TEXTO` saem `texto_em_html` e **não medem nada**. Os pares estão medidos à mão na nota do `meta.json`.
- `v4`: o preview mostra o ramo vazio por decisão do catálogo, então o treemap dos níveis 1 e 2 não aparece nele; quem revisa precisa montar o componente com `initialPath` vazio para ver as células desenhadas.

## Pendências conhecidas

- `v1_receita-por-produto`: o retorno de emergência de `wrapName` devolve duas linhas que podem passar da célula e invadir a vizinha; o dado fixo não cai nesse caminho, mas dado real com palavra longa cai. A correção está escrita nas três irmãs e falta portar para a `v1`.
- `v1_receita-por-produto`: quando nenhum produto tem receita positiva, o estado vazio substitui também a lista de identificação, e os motivos de exclusão somem da tela junto com o gráfico. O mesmo vale para a `v2`.
- `v1_receita-por-produto`: a lista de identificação sempre lista todo produto (não só o que ficou sem rótulo interno), o que duplica nome e valor das células grandes; é o mesmo padrão de `06_pizza/01_pizza-simples`, e as versões novas seguem nele, aceito porque a alternativa exigiria medir o layout depois do primeiro render.
- `v3_cpl-qualificado-por-campanha`: a régua declara teto simétrico de ±50%, e nenhuma campanha do dado fixo passa dele, então o ramo em que a faixa da ponta absorve o excesso não é exercitado pelo preview.
- `v4_detalhamento-com-ramo-vazio`: o estado aberto é local ao componente; ao colar no Farol, uma página que precise do caminho na URL vai querer subir `path` para prop controlada, o que não está desenhado aqui.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-20, veredito aprovado, sobre a `v1`._

- `v1_receita-por-produto`: o total da composição não é impresso pelo Chart (NUM-5); ele aparece no subtítulo da moldura e na frase acessível, mas quem lê só o corpo do gráfico não tem o agregado contra o qual pesar cada célula. Na `v2` e na `v3` o total passou a estar escrito na linha de leitura.
- `v1_receita-por-produto`: o produto de valor zero sai da lista só com o motivo, sem o número (EST-3 pede zero medido escrito); e o estorno negativo também não traz a grandeza. Na `v2` a linha de rodapé traz nome, valor e motivo.
- `v1_receita-por-produto`: os valores da lista de identificação correm em linha junto do nome, sem coluna alinhada à direita (TIP-6, ROT-5). Nas versões novas a lista é uma grade e o número fica alinhado à direita de cada coluna.
- `v1_receita-por-produto`: o respiro da lista é de 6 px entre amostra e texto e 4 px entre linhas, contra os 10 px da tabela 17.7; não há colisão nos dois temas e a hierarquia preserva o agrupamento, então fica como alinhamento de constante para o próximo agente.
- `v1_receita-por-produto`: a lista ocupa cerca de um terço da altura do corpo, na vizinhança do teto de 30% da ROT-4; ela encurta o treemap e, com isso, aumenta o número de células pequenas demais para nome e valor juntos. Nas versões novas o canvas foi declarado por número com a conta da pilha, o que devolve altura ao treemap.
- `v1_receita-por-produto`: a dica repete o mesmo formato do rótulo sem acrescentar nada (DIC-1). Nas versões novas a dica foi removida, porque pela ROT-10 ela não identifica nada de todo modo.

_Revisão de 2026-10-14, sobre a `v2`, a `v3` e a `v4`: `v3` e `v4` aprovadas, `v2` reprovada (parecer em `validation/revisao_12_hierarquia__01_treemap_2026-10-14.md`)._

- `v2_produto-que-mais-cresceu`: o `nodeGap` de 2 px é respiro absoluto (GEO-16). Lendo os `<rect>` do `preview.svg`, Câmbio desenha 1,82% da área para 1,91% do valor (−4,3%) e Crédito estruturado 2,45% para 2,54% (−3,6%); é a mesma ordem dos 4,40% aceitos no primeiro nível do `12/02` e não se vê a olho nu.
- `v2_produto-que-mais-cresceu`: a linha de leitura mistura precisões na mesma frase ("de 7,3% para 11%"); com a diferença em pontos escrita com uma casa, as duas participações pedem a mesma precisão (NUM-1).
- `v2_produto-que-mais-cresceu`: o total do trimestre (R$ 4,7 mi) só existe na frase acessível (NUM-5). A observação de 2026-09-20 acima diz que na `v2` ele passou para a linha de leitura, e não passou.
- `v2_produto-que-mais-cresceu`: a frase acessível afirma "o que mais cresceu" sobre o `highlightId` sem conferir no dado; com o destaque vindo da página (item 5 de Como colar), a frase pode afirmar o falso. E "1 produto ficou fora do desenho" não flexiona o plural.
- `v2_produto-que-mais-cresceu`: o valor da lista não tem coluna de largura fixa, e a borda direita dele anda com a largura da variação ao lado ("sem base" contra "+3,7%") (ROT-5, TIP-6).
- `v2_produto-que-mais-cresceu` e `v3_cpl-qualificado-por-campanha`: o período de tela ("2026-T2", "ago/26", "sem 2026-07 medido") está escrito no `Chart.tsx` e não vem do dado como o `period` da `v4`; ao colar no Farol ele envelhece no primeiro recorte (DAD-9). Na `v3` o "2026-07" da régua ainda contraria a NUM-7, porque o resto da tela escreve jul/26.
- `v2`, `v3` e `v4`: a amostra da lista é `size-2 rounded-sm`, que no Tailwind 4 dá raio de 4 px num quadrado de 8 px, ou seja um círculo, para uma marca retangular (ROT-4); herdado da `v1`, que foi aprovada assim.
- `v2`, `v3` e `v4`: os números da linha de leitura, do cabeçalho do nível e das linhas de rodapé vão em Manrope sem `tabular-nums` (TIP-1); sem consequência visível em texto corrido.
- `v3_cpl-qualificado-por-campanha`: o render gravou diferença de 0,67% no escuro e 0,72% no claro (contagem dos pixels do `.diff.png`), acima dos 0,5% e abaixo dos 2% que reprovam; toda a diferença está no texto depois de "CPL", a colisão de faces de fonte que o próprio render anuncia. Defeito do app, não da peça.
- `v3_cpl-qualificado-por-campanha`: o percentual de cada faixa é arredondado sozinho (`formatPercent(bandShare, 0)`). Soma 100 no dado fixo porque o arredondamento simples coincide com o maior resto (35, 27, 22, 9, 5 e 2), mas a peça não aplica a NUM-2 e outro recorte pode somar 99 ou 101.
- `v3_cpl-qualificado-por-campanha`: na régua, "3 campanhas 35%" não diz de que é o 35%; numa linha cujo nome fala em percentual de variação, ele se lê como variação. Nomear a parte da verba, como "35% da verba" (NUM-6).
- `v3_cpl-qualificado-por-campanha`: "régua simétrica de ±50%" descreve uma propriedade que o desenho não tem: `SCALE_CAP` não entra em `bandOf`, e a faixa da ponta é aberta a partir de 30%. A pendência acima sobre "o ramo em que a faixa da ponta absorve o excesso" não tem ramo a exercitar; tirar o teto do texto ou fazer ele valer.
- `v3_cpl-qualificado-por-campanha`: a variação do CPL sai sem o volume de leads (volume junto da taxa, DAD-1): Busca cauda longa tem cerca de 7 leads qualificados (R$ 2,1 mil a R$ 289 cada) e mostra −28%. Declarar no `data.ts` as contagens de leads dos dois meses e escrever o volume na lista.
- `v3_cpl-qualificado-por-campanha`: a variação da célula e da lista não traz o CPL de base (NUM-4); o período de base está no subtítulo e há uma base só, então a leitura não muda.
- `v3_cpl-qualificado-por-campanha`: o catálogo pede a campanha nova em "neutro hachurado com o rótulo nova"; a peça usa o contorno vazado da 17.2 e "sem base", o que está certo, mas a troca não está na lista de colisões acima nem no `notes`.
- `v3_cpl-qualificado-por-campanha`: GEO-16 medido como na `v2`, desvio máximo de −2,6% (Documento patrocinado).
- `v4_detalhamento-com-ramo-vazio`: o cabeçalho escreve "10% do investimento de ago/26" e o todo (R$ 168,0 mil) só existe na frase acessível (NUM-4, NUM-5).
- `v4_detalhamento-com-ramo-vazio`: o texto do ramo vazio fixa "criativo" e "campanha", e uma plataforma com `children: []` mostraria "Nenhum criativo registrado nesta campanha". Com todo o dado em zero, `rootTotal` vale 0 e não `null`, então a raiz cai no mesmo texto em vez do estado vazio geral.
- `v4_detalhamento-com-ramo-vazio`: nó sem `children` e sem `investment` some da lista e do desenho sem menção (EST-2 pede `formatUnavailable()`).
- `v4_detalhamento-com-ramo-vazio`: `--chart-1` tem dois papéis no mesmo visual, marca de dado e cor de ação da trilha e dos botões (17.2, um papel por token); o `12/03` `v3` faz o mesmo e foi aprovado. No ramo vazio, a lista de vizinhos ainda traz amostra de cor de marcas que não estão na tela.
- `v4_detalhamento-com-ramo-vazio`: o preview mostra só o ramo vazio; os níveis com treemap foram julgados pelo código, que usa as mesmas funções de medida das irmãs.

_Segunda revisão de 2026-10-14, sobre a `v2` corrigida: aprovada. A base do 2026-T2 passou a somar todo produto com `revenuePrevious` medido, e a linha escreve "+3,8 pontos de participação, de 7,3% para 11%" (320 sobre 4.407 e 520 sobre 4.720); a frase acessível flexiona o plural._

- `v2_produto-que-mais-cresceu`: continuam valendo as observações da `v2` da primeira revisão acima (GEO-16 com os mesmos retângulos, precisões misturadas na linha, total fora do corpo, "o que mais cresceu" sem conferir no dado, período escrito no `Chart.tsx`, coluna de valor sem largura fixa, amostra redonda, números da linha sem `tabular-nums`), menos a do plural, que foi corrigida.
- `v2_produto-que-mais-cresceu`: o destaque `--chart-1` contra o neutro `--text-muted` mede 1,82:1 no escuro e 1,12:1 no claro (TOK-9). O segundo canal existe (peso 700 no nome e no valor da célula acesa, linha de leitura que nomeia o produto, item da lista em 600), então não reprova; mas o par não está medido no `notes` como a saída da TOK-9 pede, e se o produto aceso cair numa célula muda o retângulo dele só se acha pela cor. Um contorno no destaque ou o rótulo forçado na célula acesa resolvem.
- `v2_produto-que-mais-cresceu`: as nove variações da lista não nomeiam a base na própria linha (NUM-4); o período vem só da linha de leitura e do subtítulo, e a frase acessível escreve "+63% contra R$ 320,0 mil" sem o 2026-T2. Mesmo tratamento dado à `v3`.
- `v2_produto-que-mais-cresceu`: a variação da lista vai com sinal e cor, sem o ícone que a ACE-2 enumera e que a `v3` traz; o sinal já tira da cor o papel de canal único.
- `v2_produto-que-mais-cresceu`: o valor da lista usa `font-display` sem peso declarado e sai em Space Grotesk 400, que não está entre os pesos carregados (TIP-4); o navegador cai no 500 e não há consequência visível.
