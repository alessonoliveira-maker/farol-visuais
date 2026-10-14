# Parecer de revisão: 20_cronograma-e-linha-do-tempo/02_linha-do-tempo-de-marcos

Data: 2026-10-08. Revisor independente, primeira passada das quatro versões (`sem_revisao`). `npm run check`: 4 versões, 0 com erro, 0 avisos. Previews em dia; cada PNG de conferência comparado com o `.pagina.png` da mesma versão, diferença de 0,000% nos dois temas.

Como foi medido: coordenadas lidas no `preview.svg` de cada versão (px de CSS, no sistema do gráfico, que começa na borda esquerda do corpo do cartão) e tinta medida nos PNGs de `_render/.qa/20_cronograma-e-linha-do-tempo/02_linha-do-tempo-de-marcos/`, que têm 2 px de imagem por px de CSS. Todos os defeitos abaixo são iguais nos dois temas.

| Versão | Resultado | Não |
|---|---|---|
| `v1_marcos-do-plano-comercial-2027` | reprovada | 15 e 31 |
| `v2_regua-de-marcos-com-estado` | reprovada | 15 e 31 |
| `v3_narrativa-do-ano-da-pre-vendas` | reprovada | 14, 15 e 25 |
| `v4_marcos-por-publico-com-semana-lotada` | reprovada | 12 e 18 |

São cinco defeitos em quatro versões, e dois deles são o mesmo (a âncora do rótulo na `v1` e na `v2`). Nenhum é de encoding: a escala de tempo, o domínio, a linha de hoje vinda do dado, os estados da `v2`, o agrupamento e a coluna "a definir" da `v4` conferem com o `data.ts`. As observações não bloqueantes estão no README do modelo, seção `Observações da revisão (não bloqueantes)`.

Não se aplica: 3, 4, 6, 26, 27, 28 e 30 nas quatro; 18 na `v2` e na `v3`, que não têm dica; 13 na `v3`, que não tem anotação; 29 nas três primeiras, que têm uma faixa só.

## v1_marcos-do-plano-comercial-2027

Resultado: reprovada. Um bloqueante. O resto confere: 6 marcos na data, 4 passados em 24/05/2027, próximo em 12/07/2027 a 49 dias, frase acessível calculada, dica com `ChartTooltip`, estado vazio da EST-1.

### Bloqueante 1. Perguntas 15 e 31. ROT-7, armadilha GEO-4, ESP-3

**O que o desenho faz.** Os rótulos não estão centrados nos losangos, e os de baixo ficam em cima da marca: o halo deles apaga a ponta inferior de 4 dos 6 losangos.

**Evidência.**

* `preview.svg`: o losango de "Orçamento aprovado" tem `cx="61.199"` e `cy="82"`, e o `<path>` dele traz `x="55.281"`, `y="76.083"` e `width="11.835"`. O rótulo está em `x="55.281"`: o `renderLabel` (linhas 130 a 136) usa como centro o canto superior esquerdo da caixa do símbolo. O desvio é o raio `√(110/π)`, 5,92 px para a esquerda e 5,92 px para cima, igual nos seis marcos.
* Com isso o nome dos rótulos de baixo tem a linha de base em `y="96.08"`, 14,08 px abaixo do eixo, e não os 20 de `NAME_OFFSET_BELOW`. O topo da maiúscula fica em 88,2 e a ponta do losango em 91,76: 3,6 px de texto sobre a marca, mais 2 px de halo.
* PNG, coluna central de cada losango, nos dois temas: os dois inteiros ("Playbook novo no ar" e "CRM em produção") medem 30 px de imagem, 15 acima e 14 abaixo do eixo. "Orçamento aprovado" mede 24 (7 abaixo), "Revisão de meta" 23 (7 abaixo), "Metas por executivo" 27 e "Piloto de reativação" 28 (11 abaixo). A metade de baixo perde de 3 a 7 dos 14 px e o losango vira um pentágono de base chata.
* O losango de "Orçamento aprovado" tem o rótulo dele em cima e é cortado pelo rótulo do vizinho: "Metas por executivo" ocupa x de 43 a 149 e passa por baixo do losango em x 61,2. É o par a 14 dias que o `data.ts` põe "para provar a anticolisão de rótulo".

**Por que bloqueia.** Marca partida e rótulo em cima da marca de outro marco são consequência visível no preview (seção 14.1), e a saída da GEO-4 é literal: quem sai do lugar é o texto, nunca a marca.

**O que mudar.**

1. Em `renderLabel`, ler também `width` e `height` do `LabelProps` e centrar em `x + width / 2` e `y + height / 2`.
2. Depois de centrar, os deslocamentos atuais deixam 2,3 px entre a tinta do nome de baixo e a ponta (o halo ainda roça o contorno) e 2,1 px em cima. Subir `NAME_OFFSET_BELOW` para pelo menos 22 e `DATE_OFFSET_ABOVE` para pelo menos 15, levando `DATE_OFFSET_BELOW` e `NAME_OFFSET_ABOVE` junto, para 4 px de respiro dos dois lados.
3. Conferir depois, no PNG: os seis losangos com a mesma altura de tinta, cada rótulo centrado no seu losango, e "Metas por executivo" sem tocar o losango de "Orçamento aprovado". O rótulo mais à direita, "Revisão de meta", continua dentro da plotagem: centro em 817,4 e meia largura de 43 px, contra a borda em 870.

### Para alinhar na mesma passada (não bloqueia)

* A nota do `meta.json` fala em conector, que não é desenhado, e em "125 x 125 px de corpo"; corrigir o texto junto com as constantes novas.
* Terminar o domínio em início de mês, como a `v4`, tira a linha de grade sem tique da borda direita.

## v2_regua-de-marcos-com-estado

Resultado: reprovada. Um bloqueante, o mesmo defeito de âncora da `v1`. O resto confere: 2 atingidos, 1 em curso, 1 atrasado há 14 dias (de 16/08 a 30/08), 1 com a data prevista entre parênteses; estado sempre com forma e palavra (ACE-2); "!" vazado em `--surface-raised` sobre `--negative`, único elemento em peso 700.

### Bloqueante 1. Perguntas 15 e 31. ROT-7, ESP-3

**O que o desenho faz.** Os cinco rótulos ficam 8 px à esquerda da marca que nomeiam, e os de baixo encostam nela: a ponta do losango entra na linha do nome.

**Evidência.**

* `preview.svg`: losangos com centro em x 63,62; 229,64; 395,66; 617,02 e 751,42, todos com centro em y 82 e pontas em 74 e 90. Rótulos em x 55,64; 221,66; 387,68; 609,04 e 743,44. A diferença é de 7,98 px em todos, o raio `√(200/π)` da caixa que o `ZAxis` reserva. Mesma causa da `v1`: `renderLabel` (linhas 178 a 184) toma o canto da caixa por centro.
* Rótulos de baixo ("Treino dos executivos" e "Novo painel de metas"): linha de base do nome em 98,02, topo da maiúscula em 90,1, e a ponta do losango em 90. Respiro de 0,1 px. Rótulos de cima: linha de base da terceira linha em 61,02, a 11,9 px da ponta de cima. O mesmo desenho tem 12 px de um lado e zero do outro.
* PNG, nos dois temas: a primeira linha de tinta dos dois nomes de baixo está em y 400 de imagem, e a ponta do marco em curso chega a y 399 ou 400. Ela aparece entre "painel" e "de", na altura das hastes do "l" e do "d", e o halo tira de 1 a 2 px de imagem do traço dela (a ponta de cima mede 5 px, a de baixo 3 ou 4). É justamente o marco cuja forma é o estado.

**Por que bloqueia.** Colisão entre marca e rótulo com respiro zero é consequência visível (seção 14.1), e o desvio de 8 px se vê comparando o centro de cada rótulo com o losango. A causa é um erro de posição, não uma constante de acabamento: quem copiar este `renderLabel` com um símbolo maior herda um desvio maior.

**O que mudar.**

1. Em `renderLabel`, centrar em `x + width / 2` e `y + height / 2`.
2. Com o centro certo, `FIRST_OFFSET_BELOW = 24` dá cerca de 7 px de respiro embaixo e `FIRST_OFFSET_ABOVE = 13` dá cerca de 3 px em cima. Subir o de cima para 14 ou 15, para pelo menos 4 px dos dois lados.
3. Conferir depois, no PNG: cada rótulo centrado no losango, nenhuma ponta dentro de linha de texto, e o marco em curso com as quatro pontas iguais.

### Para alinhar na mesma passada (não bloqueia)

* O dado padrão não tem futuro com data confirmada, então o losango vazado de traço contínuo não aparece no preview. Cabe nos mesmos 5 marcos: 1 atingido, 1 atrasado, 1 em curso, 1 futuro confirmado e 1 a confirmar. Se entrar, conferir a distância entre os rótulos do mesmo lado em setembro.
* A frase acessível escreve "1 atrasados"; flexionar pelo número.
* A nota do `meta.json` também conta o espaço de um conector que não é desenhado.

## v3_narrativa-do-ano-da-pre-vendas

Resultado: reprovada. Dois bloqueantes. O resto confere: 8 eventos na data, cartões alternados pela ordem, conector de 14 px em `--text-muted` (5,21:1 no escuro), destaque com borda, peso 700 e linha própria (COR-2), e 21 sobre 15 menos 1 igual a +40%. Cartão em SVG no lugar de `foreignObject` é desvio declarado e apoiado na seção 13.

### Bloqueante 1. Pergunta 15. ESP-3, sobreposição

**O que o desenho faz.** Cartões vizinhos do mesmo lado se sobrepõem e, como têm o mesmo fundo e nenhuma borda, viram um bloco só. O leitor vê 6 blocos para 8 eventos.

**Evidência.** `preview.svg`, `<rect>` de 200 px de largura, x no sistema do gráfico (largura total de 894 px):

| Lado | Cartão | x | Vizinho seguinte do mesmo lado | Vão |
|---|---|---|---|---|
| cima | Meta de agenda revista | 4 a 204 | Script de abertura novo, 183,5 a 383,5 | sobrepõe 20,5 px |
| cima | Script de abertura novo | 183,5 a 383,5 | Campanha de mídia pausada, 400,6 a 600,6 | 17,1 px |
| cima | Campanha de mídia pausada | 400,6 a 600,6 | Treino de objeções, 617,7 a 817,7 | 17,1 px |
| baixo | Nova lista de contas | 93 a 293 | Nova cadência de contatos, 292 a 492 | sobrepõe 1 px |
| baixo | Nova cadência de contatos | 292 a 492 | Painel de agenda por SDR, 509,2 a 709,2 | 17,1 px |
| baixo | Painel de agenda por SDR | 509,2 a 709,2 | Dois turnos de contato, 690 a 890 | sobrepõe 19,2 px |

* Os eventos do mesmo lado ficam a 77 dias (199 px) ou a 84 dias (217 px). A nota do `meta.json` só faz a conta dos 84 dias; com 77, o cartão de 200 px já não cabe.
* O ajuste de borda (`EDGE`, linha 137) empurra o primeiro cartão 19,6 px para a direita e o último 36,3 px para a esquerda, para cima do vizinho, e nada confere o resultado.
* PNG, nos dois temas: "Meta de agenda revista" e "Script de abertura novo" formam um retângulo contínuo de x 74 a 832 de imagem; "Painel de agenda por SDR" e "Dois turnos de contato", um de x 1084 a 1846. Nenhum texto é coberto (29 px entre as colunas de texto no primeiro par, 23 px no segundo), mas a fronteira entre os dois eventos some. No par do meio de baixo, quem separa é só a borda do destaque.

**Por que bloqueia.** Sobreposição de marcas está na lista de ilegibilidade, e a primeira coisa que a versão diz demonstrar é o cartão por evento.

**O que mudar.**

1. Resolver a colisão depois do ajuste de borda: nenhum par do mesmo lado com menos de 8 px de vão. Dois caminhos. Empurrar o vizinho: cada cartão começa no maior valor entre a posição natural e o fim do anterior mais 8 px, com uma passada da direita para a esquerda no lado que encosta na borda direita (com 200 px, os quatro cartões e os três vãos somam 824 px e cabem nos 886 disponíveis). Ou derivar a largura do cartão da menor distância entre vizinhos do mesmo lado, quebrando o texto pela largura que sobrar.
2. O conector continua caindo dentro do próprio cartão, com o raio do canto de folga.
3. Corrigir a conta da nota do `meta.json`.
4. Conferir depois, no `preview.svg`: os 6 vãos da tabela com 8 px ou mais e nenhum `<rect>` de cartão fora de 0 a 894.

### Bloqueante 2. Perguntas 14 e 25. NUM-1, NUM-4, armadilha DAD-1, Precedência da seção 17

**O que o desenho faz.** O número central da versão é uma taxa escrita sem volume, e a variação dela sai sem a base na mesma linha.

**Evidência.**

* `data.ts`, linhas 25 e 26: `rateBefore: 0.15` e `rateAfter: 0.21`, fração pronta, sem contagem. A saída da DAD-1 é declarar contagens, não a taxa.
* `Chart.tsx`, linha 204: a linha de leitura escreve "Taxa de agenda de 15,0% para 21,0%" com `formatPercent`, sem volume. A NUM-1 pede taxa com uma casa e o volume (`formatRateWithVolume`), e a Precedência põe "volume junto da taxa" entre o que nenhuma regra relaxa.
* `Chart.tsx`, linha 168: o cartão escreve "taxa de agenda +40%" e mais nada na linha. Linha 209: a frase acessível diz "A taxa de agenda mudou +40%" sem os dois valores. A NUM-4 pede a base na mesma linha, e aqui ela decide a leitura: +40% ao lado de uma taxa se lê tanto como 40% a mais quanto como 40 pontos a mais.
* A nota do `meta.json` afirma "com a base escrita no cartão". Não está: a base só aparece na linha de leitura.

**Por que bloqueia.** Mesmo critério de `09_dispersao-e-bolhas/06_antes-e-depois-com-setas`, `v1`, reprovada em 2026-10-05 pelas mesmas duas perguntas.

**O que mudar.**

1. No `data.ts`, trocar as frações por contagens antes e depois (contatos e reuniões agendadas, por exemplo) que deem 15,0% e 21,0%.
2. Derivar a taxa no componente, com retorno `number | null` (EST-1b), e tirar o `?? 0` da linha de leitura.
3. Linha de leitura com `formatRateWithVolume` nos dois valores. Com os volumes ela passa de uma linha; tirar a segunda metade ("a distância entre os pontos é proporcional ao tempo"), que repete o subtítulo, resolve as duas coisas (ANO-5).
4. Cartão e frase acessível nomeiam a base junto do +40%. No cartão o texto útil tem 180 px: algo como "agenda +40% contra 15,0%" cabe, e a frase inteira com "taxa de" não cabe em 11 px e peso 700.
5. Conferir depois: mesma taxa, mesmo formato e mesmo volume na linha de leitura, no cartão e na frase acessível, a linha de leitura em uma linha só e a frase acessível entre 100 e 250 caracteres.

## v4_marcos-por-publico-com-semana-lotada

Resultado: reprovada. Um bloqueante. O resto confere: 25 marcos, 23 com data em 20 losangos (5 por faixa), 2 na coluna "a definir" com losango vazado e tracejado, nunca no fim do ano; 7 marcos de 29/03 a 02/04 (3, 2, 1 e 1 por faixa); contador vazado em `--surface-raised` sobre `--chart-1`; linhas guia em `--text-muted`; hoje cruzando as quatro faixas.

### Bloqueante 1. Perguntas 12 e 18. TIP-7, DIC-1, identificação das marcas (seção 14.1)

**O que o desenho faz.** Um dos 20 losangos fica sem nome e sem linha guia: "Campanha de reativação", Marketing, 24/05/2027. O nome dele só existe na dica.

**Evidência.**

* `preview.svg`: a faixa do Marketing tem 5 losangos (centro em x 119,0; 250,4; 348,9; 491,2 e 619,0) e 4 rótulos (x 123,0; 254,4; 495,2 e 623,0). Não há `<text>` nem `<line>` para o de x 348,9. As outras três faixas têm 5 losangos e 5 rótulos.
* O texto mais próximo do losango anônimo é de outro marco: "Reformulação do site" começa em x 254,4 e mede 108,5 px, até x 363. O losango ocupa x de 342,9 a 354,9, embaixo de "site", com 3,9 px entre a base do texto (y 199,5) e a ponta de cima (y 203,4). Sem abrir o `data.ts`, o losango parece não ter nome ou dividir o do vizinho.
* `Chart.tsx`, linhas 160 a 177: `placeLabels` percorre as três alturas e, sem vaga, sai do laço sem registrar o rótulo. Aqui ele perde a altura 1 porque o texto do vizinho ocupa o lugar, e perde a 2 e a 3 porque a linha guia dele atravessaria esse texto (linha 169).
* A nota do `meta.json` declara a omissão ("fica na dica"). O catálogo só manda para a dica a lista dos marcos que dividem o mesmo pixel, e esses levam contador; marco único sem nome não está previsto.

**Por que bloqueia.** Identificação das marcas bloqueia sempre (seção 14.1), e a DIC-1 proíbe o essencial só na dica. É a mesma classe de `09_dispersao-e-bolhas/06_antes-e-depois-com-setas`, `v1`: o rótulo mais próximo da marca é o de outra.

**O que mudar.**

1. `placeLabels` nunca desiste em silêncio de um marco único. Quando faltar vaga, realocar o vizinho que bloqueia e tentar de novo.
2. Com o dado padrão existe uma vaga nas alturas atuais: "Reformulação do site" na altura 2 e "Campanha de reativação" na altura 1, à direita do losango, de x 352,9 a cerca de 479, antes da guia de "Webinar de produto" em x 491,2. Atenção ao que essa vaga cria: a guia de "Reformulação do site" na altura 2 sobe até y 175,4, e a ponta de baixo do losango "2 marcos" da Pré-vendas, no mesmo x 250,4, está em y 171,9. Ficam 3,5 px, e a guia passa a parecer ligada ao losango de cima. Parar a guia na linha de base do texto (y 184,4) em vez do topo dele abre 12 px.
3. Se nem realocando couber, a saída precisa ser visível no desenho (juntar ao vizinho num losango com contador, por exemplo), nunca um losango mudo.
4. Tirar da nota do `meta.json` a frase que autoriza a omissão.
5. Conferir depois: 20 losangos datados e 20 rótulos, nenhum texto de um marco a menos de 4 px acima do losango de outro, e nenhuma guia a menos de 4 px de losango de outra faixa.

### Para alinhar na mesma passada (não bloqueia)

* O rótulo novo de "Campanha de reativação" vai cruzar a linha de hoje (x 387), como "Piloto de reativação" já cruza. O halo resolve (ROT-7); se a escada passar a tratar hoje como obstáculo, melhor.
* `CHAR_WIDTH` estima a largura por contagem de caracteres (armadilha GEO-8). Ao mexer na escada, conferir a estimativa contra a tinta dos dois rótulos mais longos.

## O que foi pesado e não reprovou

* **`v2`, trecho a percorrer em `--line-strong`.** Mede 1,79:1 no escuro e 1,83:1 no claro. Pelo teste da ACE-6 (tapar o traço apaga a informação?) é régua de referência: quem diz onde o percorrido acaba é o fim do traço cheio em `--chart-1` e a linha de hoje, e os marcos futuros têm forma e palavra próprias. O catálogo pedia `--line-subtle`, mais fraco ainda, e a troca está declarada na nota.
* **`v2`, três estados pela forma.** Cheio, anel com núcleo e vazado aparecem. O vazado só aparece na variante tracejada, e isso ficou como observação, com a saída.
* **`v4`, nomes dos marcos agrupados só na dica.** É o que o catálogo especifica para marcos no mesmo pixel, e o losango leva contador e rótulo ("3 marcos"). Não é o caso do bloqueante, que é marco único.
* **`v4`, "Piloto de reativação" sobre a linha de hoje.** Tem halo, como a ROT-7 manda, e a linha de hoje continua legível acima e abaixo do texto.
* **`v1`, `v2`, `v3`, linha de grade sem tique na borda direita.** Fecha a plotagem em dia 15, não afirma mês nenhum e não leva rótulo. Observação.
* **As quatro, número fora de algarismo tabular em frase corrida (TIP-1), e nome de marco em 11 px na `v1`, na `v2` e na `v4`.** Sem coluna a alinhar e acima do piso; mesmo peso dado em `20_cronograma-e-linha-do-tempo/03_stepper-de-etapas`.
* **`v3`, cartão em SVG e não em `foreignObject`.** Desvio declarado, e é o texto em SVG que deixa as guardas de contraste e de colisão medirem a versão.

## Defeito de régua notado

O `LabelList` de um `Scatter` entrega o canto da caixa do símbolo, não o centro, e isso não está no `ARMADILHAS.md`: duas versões caíram nele. E nenhuma guarda mede halo ou texto sobre marca: a `v1` passou no `check` com 0 avisos e 4 de 6 marcas cortadas, com `CONTRASTE-MARCA` e `ESPESSURA-MARCA` fora por `preview_com_transform`.

## Registro

```
Versão: 20_cronograma-e-linha-do-tempo/02_linha-do-tempo-de-marcos/v1_marcos-do-plano-comercial-2027
Data: 2026-10-08
Resultado: reprovada
Não: 15, 31
Correções:
  15. ROT-7 (GEO-4), ESP-3: centrar o rótulo no losango (x + width / 2, y + height / 2) e deixar 4 px entre a tinta do rótulo e a ponta, dos dois lados, para nenhum halo cortar marca.
  31. ROT-7: "Metas por executivo" não pode tocar o losango de "Orçamento aprovado".
Não se aplica: 3, 4, 6, 26, 27, 28, 29, 30
```

```
Versão: 20_cronograma-e-linha-do-tempo/02_linha-do-tempo-de-marcos/v2_regua-de-marcos-com-estado
Data: 2026-10-08
Resultado: reprovada
Não: 15, 31
Correções:
  15. ROT-7, ESP-3: centrar o rótulo no losango (x + width / 2, y + height / 2); pelo menos 4 px entre rótulo e ponta dos dois lados.
  31. ROT-7: a ponta do marco em curso não pode entrar na linha de "Novo painel de metas" nem perder traço para o halo.
Não se aplica: 3, 4, 6, 18, 26, 27, 28, 29, 30
```

```
Versão: 20_cronograma-e-linha-do-tempo/02_linha-do-tempo-de-marcos/v3_narrativa-do-ano-da-pre-vendas
Data: 2026-10-08
Resultado: reprovada
Não: 14, 15, 25
Correções:
  14. NUM-1, NUM-4 (DAD-1): contagens no data.ts, taxa com formatRateWithVolume na linha de leitura e base junto do +40% no cartão e na frase acessível.
  15. ESP-3: pelo menos 8 px entre cartões vizinhos do mesmo lado, inclusive depois do ajuste de borda.
  25. Precedência da seção 17: volume junto da taxa.
Não se aplica: 3, 4, 6, 13, 18, 26, 27, 28, 29, 30
```

```
Versão: 20_cronograma-e-linha-do-tempo/02_linha-do-tempo-de-marcos/v4_marcos-por-publico-com-semana-lotada
Data: 2026-10-08
Resultado: reprovada
Não: 12, 18
Correções:
  12. TIP-7, identificação das marcas: "Campanha de reativação" ganha rótulo e linha guia; a escada realoca o vizinho em vez de omitir.
  18. DIC-1: nome de marco único não vive só na dica; sai a frase da nota do meta.json que autoriza a omissão.
Não se aplica: 3, 4, 6, 26, 27, 28, 30
```
