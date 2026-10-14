# Parecer de revisão: 25_matriz-e-quadrantes/01_matriz-2x2-de-quadrantes

Data: 2026-10-06. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 10:06, posterior ao `Chart.tsx` das quatro). `npm run check` com tipos: 0 com erro, 1 aviso (frase acessível da `v4` com 236 caracteres, a 14 do teto da ACE-1).

Resultado: `v1`, `v3` e `v4` aprovadas; `v2` reprovada por três bloqueantes. As 26 observações não bloqueantes estão no README do modelo.

## Peso dos bloqueantes

* **`v2`, nenhuma bolha tem nome.** Pergunta 18 e DIC-1. Não é acabamento: a seção 14.1 põe a identificação das marcas entre as regras que bloqueiam sempre, e o caso de uso pergunta quais campanhas.
* **`v2`, percentual impresso que não soma.** Pergunta 6 e NUM-2. É a proporção que o rótulo afirma, e o acervo já reprovou pelo mesmo motivo hoje (`19_cascata-waterfall/08_cascata-aninhada`, `v3`).
* **`v2`, grade pintada por cima do texto.** Perguntas 13 e 15, ROT-7. Aqui é acabamento com consequência no render, e se descreve pela consequência: cinco linhas de texto riscadas, uma delas dentro de um número. É o mais leve dos três e não cairia sozinho sem a medição de pixels abaixo.

## O que foi medido e o que não foi

* **Medido:** os dois PNGs de cada versão, com recorte ampliado das zonas de texto; a classificação, as contagens, as somas e as taxas de cada região, refeitas do `data.ts` das quatro versões; a área de cada bolha da `v2` no `preview.svg` contra o investimento (desvio máximo de 0,0004 p.p. entre participação de área e de valor, raio de 5,10 a 20,00 px); os contrastes de texto e de marca sobre as regiões tingidas, compostos a partir de `app/src/styles/tokens.css` com cada canal arredondado para inteiro; as colunas de pixels da grade sobre o texto dos blocos da `v2`.
* **Não medido pela ferramenta:** ESPESSURA-MARCA e CONTRASTE-MARCA nas quatro (`preview_com_transform`), e RAIO-CONTRA-AREA na `v2` (`valor_nao_casado`). As três foram cobertas à mão, como descrito acima.
* **Não renderizado:** na `v3`, a lista expandida, o filtro por região e o cursor sobre um ponto. O render só desenha o estado inicial, então o que se diz desses estados é leitura do código.
* **Não testado:** as saídas sugeridas. As medidas de espaço livre citadas nelas são conta sobre o `preview.svg`, não render.

## `v2_campanhas-contra-break-even-com-bolhas`: reprovada, três bloqueantes

### Bloqueante 1. Pergunta 18; DIC-1 e seção 14.1 (identificação das marcas)

**Evidência.** Nos dois PNGs não existe um único nome de campanha. O plano tem 29 bolhas, 8 delas em `--chart-1` na região Escalar, e os únicos textos são os quatro blocos de resumo, os rótulos dos cortes e os nomes dos eixos. O nome só chega pela dica (`renderTooltip`, `Chart.tsx:242` a `251`, `label={point.name}`), que o preview não tem, que o teclado não alcança (`accessibilityLayer={false}`, linha 281) e que a frase acessível não cobre.

O caso de uso do catálogo e do `meta.json` é "Quais das 30 campanhas pagam o lead abaixo do break-even de R$ 4,20 e batem a meta de 18% de qualificação?". O cartão responde quantas (8 de 29), quanto (R$ 174,1 mil) e com que taxa (24,6%). Não responde quais. A resposta, tirada do `data.ts`, são estas oito:

| Campanha | CPL | Qualificação | Investimento |
|---|---|---|---|
| Redes sociais, lookalike | R$ 3,40 | 23,0% | R$ 48,0 mil |
| Busca institucional | R$ 2,90 | 27,0% | R$ 42,0 mil |
| Marketplace, categoria B | R$ 3,00 | 22,0% | R$ 24,8 mil |
| Redes sociais, base própria | R$ 2,60 | 31,0% | R$ 14,5 mil |
| Indicação premiada | R$ 2,40 | 28,0% | R$ 13,4 mil |
| Webinário recorrente | R$ 2,80 | 19,0% | R$ 12,2 mil |
| Guia de compra | R$ 4,00 | 21,0% | R$ 10,6 mil |
| Newsletter patrocinada | R$ 3,60 | 20,0% | R$ 8,6 mil |

**Por que bloqueia.** A DIC-1 diz que nada essencial vive só na dica, e a 14.1 lista a identificação das marcas entre as regras que decidem o que o desenho afirma. O próprio README do modelo manda para a matriz agregada (`25/02`) quem só quer os quatro números, "sem procurar item": parada, a `v2` é esse caso com bolhas anônimas. As três irmãs nomeiam a resposta, a `v1` e a `v4` por rótulo direto e a `v3` pela lista. O precedente de bolha sem nome aprovada, `09_dispersao-e-bolhas/03_bolhas/v1`, pergunta por relação entre medidas, não por quais.

**O que mudar.** Nomear no desenho parado ao menos as oito de Escalar. Há dois caminhos dentro do contrato, e podem conviver:

1. Rótulo direto só na região de ação, com o desconflito da `v4` (`placeLabels`): bolhas, blocos de resumo e linhas de corte como obstáculo, halo na cor do cartão, nome em `--text-primary` com peso 600. O obstáculo de cada bolha precisa do raio dela, não de um raio fixo. À esquerda da nuvem, abaixo do bloco de Escalar, sobram cerca de 200 por 85 px.
2. Se o rótulo direto não fechar sem colisão, uma lista de identificação das oito ao lado ou abaixo do plano, na ordem do investimento, com CPL e taxa em colunas à direita (ROT-5), e o canvas refeito pela conta da GEO-1.

Nos dois caminhos, nome que ficar sem lugar se declara no cartão com a contagem, e a frase acessível pode citar a maior de Escalar. As 21 bolhas das outras regiões seguem na dica.

### Bloqueante 2. Pergunta 6; NUM-2

**Evidência.** `RegionBlock` calcula a participação de cada região sozinha (`Chart.tsx:155`) e a escreve com `formatPercent(share, 0)` (linha 167), uma a uma, sem repartir o resto. O rodapé declara o todo: "Participações sobre R$ 747,5 mil do plano". As quatro partes impressas somam 99%:

| Região | Investimento | Participação exata | Impresso | Pelo maior resto |
|---|---|---|---|---|
| Escalar | R$ 174,1 mil | 23,29% | 23% | 23% |
| Renegociar o custo | R$ 130,5 mil | 17,46% | 17% | 18% |
| Volume barato que não vira nada | R$ 255,8 mil | 34,22% | 34% | 34% |
| Pausar | R$ 187,1 mil | 25,03% | 25% | 25% |
| Soma | R$ 747,5 mil | 100,00% | 99% | 100% |

Os valores em reais fecham (174,1 + 130,5 + 255,8 + 187,1 = 747,5). Só o percentual abre.

**Por que bloqueia.** A NUM-2 manda a composição com percentual inteiro somar 100 pelo maior resto, e a pergunta 6 cobra a soma no percentual impresso. As quatro regiões são as partes de um todo que o próprio cartão nomeia, e a participação do investimento é o que esta versão existe para mostrar.

**O que mudar.** Calcular os quatro inteiros juntos, no componente de fora, onde `summaries` e `totalInvestimento` já existem: piso de cada participação, e o ponto que falta vai para o maior resto (aqui, Renegociar o custo, com 0,46). O bloco recebe o inteiro pronto em vez de dividir de novo. Com `totalInvestimento` zero o valor segue nulo e o parêntese não é escrito, como hoje (EST-1b). O parecer de `19_cascata-waterfall/08_cascata-aninhada` de 2026-10-06 cita `wholeShares`, de `19/02`, como molde no acervo.

### Bloqueante 3. Perguntas 13 e 15; ROT-7

**Evidência.** As linhas de grade de R$ 2 e de R$ 6 (x = 247,5 e 614,5 no `preview.svg`) passam por cima de cinco linhas de texto dos blocos, nos dois temas:

| Bloco | Linha | Onde a grade risca |
|---|---|---|
| Escalar | "Qualificação 24,6% (14.130 de 57.424)" | dentro do número, entre "57." e "424" |
| Volume barato que não vira nada | o título | dentro de "nada" |
| Volume barato que não vira nada | "Qualificação 12,0% (8.265 de 69.012)" | dentro do número, depois de "69.0" |
| Renegociar o custo | "Qualificação 25,2% (6.039 de 23.954)" | dentro de "Qualificação", depois de "Qua" |
| Pausar | "Qualificação 12,2% (4.355 de 35.755)" | dentro de "Qualificação", depois de "Qua" |

Medido no PNG claro (2 px de dispositivo por px): nas colunas 560 e 561, que são a grade de R$ 2, a luminância mínima ao longo das linhas de texto fica entre 217 e 221, a cor da grade, enquanto 3 px para cada lado há tinta de glifo (de 25 a 136). A grade não está atrás do texto, está na frente, e apaga uma coluna de 1 px do glifo.

**Causa.** `RegionBlock` é `absolute` e vem antes do `ResponsiveContainer` no DOM (`Chart.tsx:277` a `280`). Os dois são posicionados, então o SVG é pintado depois: grade, tinta de região e bolhas ficam por cima do texto. O catálogo pede "blocos de resumo em HTML sobre o gráfico", e hoje eles estão embaixo. Com outro recorte, uma bolha no canto cobriria o bloco inteiro.

**Por que bloqueia.** A pergunta 13 cobra que nenhum rótulo seja coberto por linha, com halo onde cruza, e a ROT-7 é a régua. Pela 14.1 é acabamento com consequência visível: número riscado no meio. A `v1`, a `v3` e a `v4` escrevem o texto do plano em SVG com halo e saem limpas.

**O que mudar.** Duas coisas, juntas:

1. Pôr os blocos acima do SVG na ordem de pintura: renderizar depois do `ResponsiveContainer` ou dar `z-index` a eles. O `pointer-events-none` que já têm mantém a dica viva.
2. Dar chão limpo ao texto, porque acima do SVG a grade ainda apareceria entre os glifos: halo na cor do cartão em cada linha. Em HTML, contorno de texto em `--surface-raised` pintado antes do preenchimento faz o papel do `paintOrder` do SVG. Sombra não serve (COR-9), e caixa de fundo atrás do bloco vira moldura sobre a região tingida (ESP-5).

Se o halo em HTML não fechar nos dois temas, a saída é escrever as três linhas na `PlaneLayer`, em SVG com o `HALO` das irmãs, e corrigir o item do `meta.json` que diz HTML.

### Para levar na mesma rodada (não bloqueiam)

Estão no README do modelo. As que cabem na mesma edição da `v2`:

1. O rótulo do corte horizontal escreve "meta 18,0%" e, embaixo, "META". A segunda linha repete a primeira e não é uma das quatro procedências. A frase acessível e o subtítulo dizem "18%" (DAD-5): calcular o texto uma vez e usar nos dois lugares.
2. O texto em `--text-muted` dos blocos mede 4,55:1 no escuro sobre a região de ação a 7%. O piso é 4,5:1, e com o halo do bloqueante 3 o fundo passa a ser a cor do cartão, o que devolve os 5,21:1 da tabela.
3. "Maiores desenhadas antes" vale dentro de cada `Scatter`, e a série de Escalar é pintada inteira depois das demais. Uma série só, ordenada por investimento e com a cor por ponto, fecha o caso.
4. O contorno de 1,5 px tira 0,75 px do raio visível de toda bolha (15% do raio na menor), e a régua de tamanho soma 0,75 px por fora.
5. A legenda de tamanho está acima da linha de leitura (ANO-5).

O que não muda na `v2`: a área das bolhas pelo `ZAxis` de zero ao máximo, a régua que termina no máximo observado (ROT-5b), a taxa da região sobre os totais com o volume ao lado, o corte de premissa tracejado, a campanha sem lead fora do plano e contada no rodapé com o valor gasto.

## As três aprovadas

* **`v1_ticket-e-conversao-por-executivo`.** Medianas de R$ 50,1 mil e 22,8% e contagens de 4, 2, 2 e 4 conferidas. Doze rótulos diretos sem colisão nos dois temas. Quatro observações no README.
* **`v3_forecast-parado-com-lista-sincronizada`.** 15 críticas somando R$ 3,59 mi em R$ 12,51 mi (28,7%, impresso 29%); 13, 22, 22 e 7 nas demais. As 15 também são as 15 que passam dos dois cortes sem a faixa, então a linha de leitura não esconde ninguém. Dez observações no README, a mais visível delas a contagem sem substantivo nos cantos e nos botões (NUM-6), que o acervo trata como observação quando a unidade está escrita em outro ponto do cartão.
* **`v4_variacao-de-origens-centrada-no-zero`.** Variações refeitas do dado: 8, 4, 3 e 5 por região, domínio de 100% e de 6 p.p., origem de +480% na borda com o valor escrito. Os 8 nomes da região de ação estão no desenho. Cinco observações no README.

Duas observações valem para mais de uma versão: o corte em `--line-strong` (`v1`, `v2`, `v3`) e o contraste de marca medido à mão nas quatro.

## Registro

```
Versão: 25_matriz-e-quadrantes/01_matriz-2x2-de-quadrantes/v2_campanhas-contra-break-even-com-bolhas
Data: 2026-10-06
Resultado: reprovada
Não: 6, 13, 15, 18
Correções:
  18. DIC-1 e 14.1: nomear no desenho parado ao menos as 8 bolhas de Escalar, por rótulo direto com desconflito ou por lista de identificação.
  6. NUM-2: fechar em 100 as quatro participações de investimento pelo maior resto (hoje 23, 17, 34 e 25).
  13 e 15. ROT-7: pôr os blocos de resumo acima do SVG e dar halo na cor do cartão ao texto deles, para a grade não riscar as cinco linhas.
Não se aplica: 3, 4, 27, 28, 29, 30, 31, 32
```

```
Versão: 25_matriz-e-quadrantes/01_matriz-2x2-de-quadrantes/v1_ticket-e-conversao-por-executivo
Data: 2026-10-06
Resultado: aprovada
Não: nenhum
Não se aplica: 3, 4, 6, 27, 28, 29, 30, 31, 32
```

```
Versão: 25_matriz-e-quadrantes/01_matriz-2x2-de-quadrantes/v3_forecast-parado-com-lista-sincronizada
Data: 2026-10-06
Resultado: aprovada
Não: nenhum
Não se aplica: 3, 4, 6, 27, 28, 29, 30, 31, 32
```

```
Versão: 25_matriz-e-quadrantes/01_matriz-2x2-de-quadrantes/v4_variacao-de-origens-centrada-no-zero
Data: 2026-10-06
Resultado: aprovada
Não: nenhum
Não se aplica: 3, 4, 6, 27, 28, 29, 30, 31, 32
```

---

# Segunda passada: `v2_campanhas-contra-break-even-com-bolhas`

Data: 2026-10-06. Revisor independente, outro que o da primeira passada. Motivo: `revisao_desatualizada`. Julgado o arquivo de hoje (`Chart.tsx` das 10:52:37, PNGs e `preview.svg` das 10:52:46, posteriores a ele), sem partir da nota antiga. `npm run check` com tipos: 0 com erro, 2 avisos no modelo (COLISAO-TEXTO na `v2`, FRASE-ACESSIVEL na `v4`).

Resultado: **reprovada, dois bloqueantes**, os dois nos fios que ligam os nomes às bolhas, peça que não existia na primeira passada. Os três bloqueantes de antes estão resolvidos: oito nomes no desenho parado, participações de 23, 18, 34 e 25 que somam 100, blocos de resumo acima do SVG com halo. Nove observações novas foram para o README do modelo.

## O que foi medido e o que não foi

* **Medido:** os dois PNGs inteiros e em recorte ampliado da região Escalar, da coluna de rótulos, dos quatro blocos e do topo; a geometria de cada fio contra as 29 bolhas, pelo `preview.svg` (segmento contra círculo, raio mais 0,75 px de contorno); a cor do traço e a do fundo amostradas no PNG; classificação, contagens, somas, participações e taxas refeitas do `data.ts` (8, 7, 8 e 6 campanhas; R$ 174,1 mil, 130,5 mil, 255,8 mil e 187,1 mil; 24,6%, 25,2%, 12,0% e 12,2%); a área das 29 bolhas contra o investimento (desvio de 0,00000 p.p.; a guarda RAIO-CONTRA-AREA não mediu, `valor_nao_casado`).
* **Medido à mão por guarda ausente:** CONTRASTE-MARCA (`preview_com_transform`): `--chart-1` sobre a região de ação dá 8,30:1 e 5,43:1; `--text-muted` sobre as outras, 4,95:1 e 5,11:1.
* **Não renderizado:** a dica e o estado vazio, lidos no código.
* **Não testado:** as saídas sugeridas abaixo. As folgas citadas nelas são conta sobre o `preview.svg`, não render.

## Bloqueante 1. Pergunta 32; ACE-6 (e piso de marca da ACE-3)

**Evidência.** Os sete fios da coluna de rótulos são `<line stroke="var(--line-strong)" strokeWidth={1}>` (`Chart.tsx:211` a `218`). Amostrado no PNG, o pico do traço contra o fundo da região de ação mede **1,77:1 no tema escuro** (traço `rgb(50, 79, 115)` sobre `rgb(20, 41, 59)`) e **1,80:1 no claro** (`rgb(168, 186, 208)` sobre `rgb(238, 245, 246)`). Pelos tokens a conta dá 1,78:1 e 1,79:1. O piso é 3:1.

**Por que bloqueia.** O teste da ACE-6 é tapar o traço e perguntar se a informação continua. Aqui não continua: os sete nomes estão numa coluna comprimida a 12 px de passo, com fios de 62 a 209 px até as bolhas, e a altura do nome não é a da bolha (a de "Indicação premiada" está em y 116,1 e o nome em y 104,9; quatro bolhas ficam entre 20% e 23%, a cerca de 6,6 px uma da outra na altura). Sem o fio ninguém sabe qual bolha é qual. É traço que carrega a relação, não linha de referência, e a 14.1 põe contraste e identificação das marcas entre as regras que bloqueiam sempre. O acervo já decidiu o mesmo caso em `09_dispersao-e-bolhas/06_antes-e-depois-com-setas`: linha de chamada que liga nome a ponto sai de `--line-strong`.

**O que mudar.** Trocar o token do fio por um de dado que passe 3:1 nos dois temas sobre a região tingida. `--text-muted` mede ali 4,56:1 no escuro e 4,86:1 no claro, e é o que o `09/06` usa no mesmo papel. Manter 1 px. Medir de novo no PNG depois da troca, nos dois temas.

## Bloqueante 2. Perguntas 15 e 31; seção 14.1, identificação das marcas (ROT-7, marca fina, e ROT-11 por analogia)

**Evidência.** No `preview.svg` a camada `PlaneLayer` é pintada antes das `ReferenceArea` e dos dois `Scatter`, então todo fio passa por baixo de qualquer bolha que encontre. Medido, segmento a segmento:

| Fio | Comprimento | O que acontece no caminho |
|---|---|---|
| Guia de compra | 209,2 px | some atrás de Marketplace, categoria B (23,2 px, a 2,5 px do centro dela) e de Redes sociais, lookalike (24,1 px): 47,3 px escondidos, 23% do fio, que aparece em três pedaços |
| Busca institucional | 100,9 px | some atrás de Indicação premiada por 15,7 px (16%) e reaparece do outro lado |
| Newsletter patrocinada | 173,0 px | tangencia por baixo a bolha de Marketplace, categoria B e por cima a de Webinário recorrente, a 0,02 px do contorno de cada uma; nos últimos 49,9 px corre a menos de 1,5 px da grade de 20% (fio em y 168,0 a 169,3, grade em y 169,5) |
| Redes sociais, lookalike | 147,0 px | passa 7,6 px por baixo do contorno do topo de Marketplace, categoria B |

Consequência na tela, igual nos dois PNGs: a bolha de Marketplace, categoria B recebe **dois fios pela esquerda, a 3,4 px um do outro** (o dela, que termina ali, e o de Guia de compra, que continua por trás), mais um tangente em cima e outro embaixo. A de Indicação premiada recebe dois fios a 5,2 px. Quem segue o fio de "Guia de compra" chega primeiro numa bolha de R$ 24,8 mil com CPL de R$ 3,00, e a campanha é a de R$ 10,6 mil com CPL de R$ 4,00, a mais próxima do break-even de toda a região. O trecho final do fio de Newsletter não se separa da grade.

**Por que bloqueia.** É acabamento com consequência no render, e se descreve pela consequência: conector partido em pedaços e nome que aponta para a bolha errada. A 14.1 lista marca partida e leitura apertada entre as consequências que tornam bloqueante até uma constante, e a identificação das marcas entre as regras que bloqueiam sempre. A pergunta 31 cobra que a marca de traço fina (seta, conector, linha) não apareça cortada; aqui quem corta não é halo, é bolha alheia, e o efeito na tela é o mesmo que a ROT-7 mediu em `09/06`. A ROT-11 e a pergunta 28 falam de painel de detalhe, que esta peça não tem, mas dão o princípio: linha de chamada toca só a marca que ela representa. Trocar só o token do bloqueante 1 não resolve este: fio mais visível continua entrando em bolha alheia.

**O que mudar.** Nenhum fio pode ter trecho coberto por bolha que não é a dele, nem passar a menos de 2 px do contorno de uma, nem correr colado a uma linha de grade. Duas contas sobre o `preview.svg` para não gastar a rodada no lugar errado:

1. **Da coluna da esquerda não existe reta livre para duas das sete.** Varrendo a saída do fio em x 214,8 e y de 102 a 177,5, a melhor folga para Guia de compra é de 2,08 px **para dentro** de Marketplace, categoria B, e a melhor para Newsletter patrocinada é de 0,04 px para dentro de Webinário recorrente. Para Redes sociais, lookalike sobra no máximo 1,86 px. Reordenar ou reespaçar a coluna não fecha.
2. **O canto de cima à direita da região está vazio.** Entre x 340 e 449 e y 36 e 135 não há centro de bolha; o que ocupa a faixa é o nome "Redes sociais, base própria", até cerca de x 391 e y 108, e a borda de Redes sociais, lookalike, que sobe até y 133. Um fio vertical descendo de y 118 até Guia de compra, em x 431, passa a 17,9 px da bolha mais próxima; um até Newsletter patrocinada, em x 394,3, passa a 2,1 px de Redes sociais, lookalike.

Caminhos dentro do contrato, a escolher:

* **Teste em TypeScript e âncora por bolha.** Em `PlaneLayer`, medir a distância de cada segmento ao centro de toda bolha desenhada (não só as de Escalar; raio da bolha mais 0,75 px de contorno mais 2 px de folga) e, havendo toque, tirar aquele nome da coluna: ao lado da própria bolha quando couber sem cruzar o corte, ou numa segunda âncora no canto de cima à direita com fio curto. Nome que não achar lugar livre não ganha fio torto: vai para a chave abaixo.
* **Chave numerada no lugar dos fios.** Número ao lado de cada bolha de Escalar (ou dentro dela, pela ROT-6 e pela ROT-7b, só onde a bolha tiver 18 px ou mais de diâmetro) e a lista numerada dos oito nomes onde hoje está a coluna. Sem fio não há o que cruzar, e a solução não depende do dado fixo.
* **Lista de identificação fora do plano**, o caminho 2 da primeira passada, com o canvas refeito pela GEO-1.

Em qualquer um: conferir os oito nomes nos dois temas, um por um, e não só os três fios citados; e manter o nome de "Redes sociais, base própria" a mais distância da bolha de Busca institucional do que da própria (hoje 2,3 px contra 5 px, observação no README).

## O que não muda na `v2`

A área das bolhas pelo `ZAxis` de zero ao máximo e a régua que termina no máximo observado; as participações fechadas em 100 pelo maior resto; os blocos em HTML acima do SVG com halo; a taxa da região sobre os totais com o volume ao lado; o corte de premissa tracejado com a etiqueta; a campanha sem lead fora do plano, contada no rodapé com o valor gasto; os nomes em `--text-primary` com halo, que se leem inteiros nos dois temas.

## Registro da segunda passada

```
Versão: 25_matriz-e-quadrantes/01_matriz-2x2-de-quadrantes/v2_campanhas-contra-break-even-com-bolhas
Data: 2026-10-06
Resultado: reprovada
Não: 15, 31, 32
Correções:
  32. ACE-6: tirar os sete fios de --line-strong (1,77:1 e 1,80:1) e pôr em token de dado que meça 3:1 sobre a região de ação nos dois temas; --text-muted mede 4,56:1 e 4,86:1.
  15 e 31. Seção 14.1, identificação das marcas (ROT-7 marca fina, ROT-11 por analogia): nenhum fio pode passar por dentro nem tangenciar bolha alheia, nem correr colado à grade; mudar a âncora dos nomes de Guia de compra, Newsletter patrocinada e Busca institucional ou trocar os fios por chave numerada.
Não se aplica: 3, 4, 27, 28, 29, 30
```

