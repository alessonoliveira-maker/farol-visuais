# Revisão de visuais — treze versões do catálogo VISUAIS

_Revisor de visuais de dados · 2026-09-28_

**Alvo:** as onze versões consertadas em 2026-09-28 mais as duas de controle.
**Base do parecer:** os PNGs de `_render/.qa/<familia>/<modelo>/<versao>.png` e `.claro.png` já existentes (nenhum render novo foi gerado), mais `Chart.tsx`, `data.ts`, `meta.json` e o README do modelo de cada uma, mais os vereditos em `_render/.qa/revisao/`.
**Régua:** `CONTRATO.md` (com as emendas de 2026-09-28, `EST-1b`, `TIP-7` e `ROT-5b`), `ARMADILHAS.md` (citado por código) e `CHECKLIST_REVISAO.md`.

**Procedimento nas duas de controle.** Formei o parecer de `16/05` e de `15/03` sem abrir os arquivos de revisão delas, e só depois comparei. A comparação está na seção final.

---

## Veredito em três linhas

Dos onze consertos, **todos resolveram o defeito que motivou a reprovação** e nenhum resolveu só na aparência: conferi o dado, o código e o pixel dos dois temas em cada um. O que compromete o lote é outra coisa, e é sistêmica: **seis das treze peças têm marca ou texto que cai abaixo do piso de contraste no TEMA CLARO**, sempre por uma de duas causas, `var(--surface-overlay)` usado como estrutura (que no claro é o mesmo branco do cartão, 1,00:1, como a seção 7 do contrato já declara) ou `fillOpacity` composta contra branco. A mudança de maior retorno é uma varredura de um token só, `--surface-overlay` → `--surface-sunken` em papel de trilho/fundo de marca, mais a revisão dos dois `fillOpacity` da família 09/16.

---

## Quadro de vereditos

| # | Versão | Conserto pedido | Resolveu? | Veredito sugerido |
|---|---|---|---|---|
| 1 | `15/04` calendário | DAD-9, recorte só na frase acessível | sim | **volta** (achado novo A1) |
| 2 | `15/06` lasagna | TOK-7, faixa em `--seq-3` | sim, medido | passa com ressalva |
| 3 | `15/08` heatmap de correlação | GEO-13, medida sem nome | sim | **volta** (achado novo A2) |
| 4 | `16/02` box plot | GEO-12 + DAD-10 | sim, os dois | passa com ressalva |
| 5 | `16/03` strip plot | GEO-12 | sim | **volta** (achado novo A4) |
| 6 | `16/04` ECDF | rótulo sobre a `ReferenceLine` | sim | passa com ressalva |
| 7 | `09/11` pequenos múltiplos | TIP-7 + dado sem dispersão | sim, os dois, verificados | passa com ressalva |
| 8 | `09/03` bolhas | ROT-5b, régua da legenda | sim | **volta** (achado novo A3) |
| 9 | `13/03 v1` anel | DAD-5, precisão divergente | sim | passa com ressalva |
| 10 | `13/03 v2` anel | DAD-5 | sim | passa com ressalva |
| 11 | `13/03 v3` anel | DAD-5 | sim | **volta** (achado novo A5) |
| 12 | `16/05` histograma comparativo (controle) | — | — | passa com ressalva |
| 13 | `15/03` cohort em triângulo (controle) | — | — | **volta** (achado novo A6) |

---

## Achados transversais

### A0 — O tema claro é onde este lote quebra, e a guarda não o vê · ALTO · design

**O que vejo:** seis peças das treze têm uma marca ou um texto abaixo do piso da ACE-3 **só no tema claro**, e em cinco delas a causa é a mesma família de erro. Medido por mim sobre os `preview-claro.svg`, com a fórmula da WCAG:

| Peça | Elemento | Escuro | Claro | Piso |
|---|---|---|---|---|
| `15/04` | célula de dia com zero fechamento (`--surface-overlay`) | 1,10:1 | **1,00:1** | 3:1 |
| `13/03 v3` | trilho do anel (`--surface-overlay`) | 1,10:1 | **1,00:1** | 3:1 |
| `15/03` | trilho da microbarra de leads (`bg-surface-overlay`) | 1,15:1 | **1,00:1** | 3:1 |
| `09/03` | bolha isolada (`fillOpacity 0,55`) | 3,77:1 | **2,44:1** | 3:1 |
| `16/03` | ponto isolado (`fillOpacity 0,45`) | **2,96:1** | **2,04:1** | 3:1 |
| `15/08` | valor escrito na célula (pior caso) | **3,10:1** | **2,10:1** | 4,5:1 |

**Por que atrapalha:** o contrato já resolveu esse caso duas vezes e as duas decisões não chegaram a estas peças. A seção 7 diz, com o número: "`--surface-overlay` no tema claro é o mesmo branco de `--surface-raised` (medido em 1,00:1)... Estrutura que precisa ser vista, como trilho, moldura ou faixa, usa `--line-subtle` ou `--surface-sunken`", e cita nominalmente a revisão de `12/04`, que é o mesmo trilho de microbarra de `15/03`. A ACE-5 cita nominalmente `09/04` com `fillOpacity` de 0,55 dando **2,43:1 no claro**; `09/03` é o irmão de família, com o mesmo token e a mesma opacidade, e mede **2,44:1**. Não é defeito novo, é defeito já catalogado que sobreviveu à varredura porque a varredura foi por versão e não por token.

**Por que a guarda não pega:** três dessas seis peças desenham em HTML dentro de `foreignObject` (`15/03` inteira, `15/04` na coluna e na legenda, `13/03 v3` na legenda), e a própria 17.10 declara o ponto cego: "Texto em `foreignObject` não tem contraste medido... são 45 versões inteiras". E a `CONTRASTE-TEXTO` mede texto, não marca: trilho, célula de calendário e bolha não são texto. Um `check` verde nestas peças mede menos do que parece.

**Proposta:** varrer o acervo por `--surface-overlay` em papel de trilho, fundo de marca ou moldura e trocar por `--surface-sunken`; e varrer por `fillOpacity` em marca, medindo a cor composta contra `--surface-raised` **no claro**, que é sempre o lado que reprova.

**Alternativa:** se a varredura for cara agora, o mínimo é uma guarda executável que meça **a cor composta de toda forma preenchida contra o fundo resolvido**, nos dois temas, e não só texto. Foi assim que a `CONTRASTE-TEXTO` nasceu, e o corredor de evidência existe: os seis casos acima ficam entre 1,00 e 2,96, e nenhum caso aprovado do lote fica abaixo de 5,3.

---

## A1 · `15_mapa-de-calor-e-calendario/04_calendario-estilo-contribuicoes/v1`

**O conserto pedido (DAD-9) foi resolvido de fato.** Os três canais que o revisor pediu estão na tela e todos derivam do dado, não de constante: o título virou "Fechamentos por dia no ano em curso"; o número em destaque escreve "374 fechamentos **até 14/09/2026**" (`measuredUntil` sai de `days[days.length-1]`); uma borda em degrau tracejada fecha a medição no último dia medido, no mesmo traçado dos separadores de mês (`stepPath`, agora função pura, reusada pelos dois); e o rodapé nomeia a borda, "tracejado: fim da medição em 14/09/2026". A frase acessível e o texto visível passaram a dizer a mesma data. Confirmado nos dois PNGs.

### A1.1 — O dia útil sem fechamento é invisível nos dois temas, e é o que o subtítulo pergunta · ALTO · design

**O que vejo:** `ZERO_COLOR = 'var(--surface-overlay)'` (`Chart.tsx`, linha 36). Medido no `preview-claro.svg`: a célula de zero sai em `rgb(255,255,255)`, que é o próprio `--surface-raised` do cartão, **1,00:1**. No escuro sai em `rgb(24,36,58)` contra `rgb(18,28,46)`, **1,10:1**. São 65 células de zero no recorte. A amostra da legenda usa o mesmo token, então no tema claro a legenda imprime "0" e em seguida **um vão vazio** onde deveria estar o quadradinho do zero, antes dos cinco degraus coloridos.

**Por que atrapalha:** o `useCase` do cartão é, literalmente, "Em que dias do ano a casa fecha, e **quantos dias úteis passam em branco**?", e o terceiro número do painel lateral é "8 dias úteis sem fechar". O leitor que quiser localizar esses 8 dias no desenho não consegue em nenhum dos dois temas. É a EST-3 ao contrário: o zero é medido, mas não desenha marca. E o token é o que a seção 7 proíbe exatamente nesse papel.

**Proposta:** `ZERO_COLOR = 'var(--surface-sunken)'`, que é o que a seção 7 nomeia para estrutura que precisa ser vista, e conferir a legenda depois. Referência de convenção: o calendário de contribuições do GitHub usa um cinza claro explícito para o dia zero, nunca o branco da página.

**Alternativa:** manter o preenchimento e dar contorno de 1 px em `--line-subtle` só à célula de zero, o que também a separa do fundo e ainda distingue "dia medido com zero" de "dia fora do recorte".

**Observação não bloqueante:** a borda tracejada de fim de medição cai na última coluna do desenho, onde já não há calendário à direita, então ela carrega pouco sozinha; quem sustenta a leitura são o título, o rótulo do número e a linha da legenda. Está correto, só não é o canal principal.

---

## A2 · `15_mapa-de-calor-e-calendario/08_heatmap-de-correlacao/v1`

**O conserto pedido (GEO-13) foi resolvido de fato.** Os dois eixos levam nome e nenhum leva número: colunas "Investimento, Impressões, Cliques, Leads, Leads qualificados" e linhas "Impressões... CPL qualificado". A medida 1, Investimento, que é a que o subtítulo persegue, agora tem nome. A quebra do cabeçalho em duas linhas é por palavra inteira, sem reticência (TIP-7 respeitada), e a proporção do desenho praticamente não mudou.

### A2.1 — O valor escrito na célula é ilegível em 8 das 15 células no tema claro · ALTO · design

**O que vejo:** a regra de cor do texto é um limiar fixo:

```tsx
function cellText(value: number): string {
  return Math.abs(value) >= 0.5 ? 'var(--surface-sunken)' : 'var(--text-primary)';
}
```

Os dois tokens **invertem com o tema**, mas o fundo não inverte junto: `cellFill` compõe `color-mix(in oklab, --positive|--negative N%, var(--surface-overlay))`, e `--surface-overlay` no claro é branco, então célula forte continua **clara** no tema claro e recebe texto quase branco. Medido par a par nos dois `preview.svg`, cor do retângulo contra cor do texto:

| Célula | Escuro | Claro |
|---|---|---|
| `0,58` | 3,84:1 | **2,10:1** |
| `−0,57` | **3,10:1** | **2,25:1** |
| `0,62` | 4,15:1 | **2,26:1** |
| `0,73` | 5,16:1 | **2,75:1** |
| `−0,71` | 3,94:1 | **2,96:1** |
| `0,88` | 6,85:1 | **3,63:1** |
| `0,91` | 7,22:1 | **3,85:1** |
| `0,94` | 7,62:1 | **4,09:1** |

Piso da ACE-3 para texto: 4,5:1. No claro **8 das 15 células reprovam** e cinco ficam abaixo de 3:1; no escuro 4 das 15 reprovam. É visível a olho nos dois PNGs, principalmente em `0,62`, `0,58`, `−0,57` e `−0,71`.

**Por que atrapalha:** o valor escrito em cada célula é justamente a isenção que autoriza a peça a usar uma rampa de baixo contraste (17.2) e é o que o próprio revisor citou como o que "sustenta a leitura para quem não separa vermelho de verde". A isenção não vale quando o valor escrito não se lê. E o defeito é pior onde a correlação é mais forte, isto é, exatamente nas células que carregam a conclusão.

**Proposta:** escolher a cor do texto pela **luminância do fundo composto**, não pelo módulo do coeficiente. Uma função de uma linha resolve nos dois temas sem tabela nova: calcular o `relativeLuminance` do fundo e escolher entre `--text-primary` e `--surface-sunken` pelo maior contraste. Como o fundo é `color-mix` resolvido pelo navegador, isso pede que a composição seja feita em TypeScript a partir dos tokens, o que a peça já tem meio caminho andado.

**Alternativa (mais barata e mais segura):** subir o piso de intensidade da mistura, para que a célula forte fique sempre escura no claro e sempre clara no escuro, e manter o limiar; ou sair do `color-mix` com `--surface-overlay` no meio e usar `--surface-sunken` como neutro central, que é mais escuro que o cartão no claro.

**Observação não bloqueante:** os quatro coeficientes negativos e o `-1,00` da legenda saem com hífen (U+002D), não com o sinal de menos tipográfico da seção 8. Vêm de `formatDecimal`, e o próprio contrato registra na NUM-3 que o formatador devolve hífen no negativo. A regra está escrita para variação e não para coeficiente, então isto fica como registro, não como defeito.

---

## A3 · `09_dispersao-e-bolhas/03_bolhas/v1`

**O conserto pedido (ROT-5b) foi resolvido de fato, e bem.** `LEGEND_VALUES` fixo virou `LEGEND_REFERENCES` de dois degraus redondos mais o máximo observado, montado por `legendValues(maxInvestimento)`. A legenda termina em R$ 182,0 mil, que é o maior investimento do recorte, e a caixa dos círculos passou a ser a do máximo. O degrau de 150 mil saiu com justificativa medida no comentário (raio de 15,4 contra 16,9 px, os dois círculos leriam como um só). Conferi que `raioPorArea` usa `AREA_MIN + (valor/max) * (AREA_MAX - AREA_MIN)`, exatamente a mesma conta do `range={[AREA_MIN, AREA_MAX]}` do `ZAxis`: a régua da legenda e a marca do plano estão na mesma escala, que é o ponto da ROT-5b.

### A3.1 — A bolha isolada mede 2,44:1 no tema claro, e é o mesmo número que reprovou `09/04` · ALTO · design

**O que vejo:** `BUBBLE_FILL_OPACITY = 0.55` sobre `var(--chart-1)`. Compondo contra o cartão: no claro `rgb(11,109,125)` a 55% sobre branco dá **2,44:1**; no escuro `rgb(45,212,232)` a 55% sobre `rgb(18,28,46)` dá 3,77:1. Duas bolhas sobrepostas sobem para 5,26 e 3,24. O contorno é `--surface-raised`, que no claro é o branco do cartão, então ele separa bolhas vizinhas mas não ajuda contra o fundo.

**Por que atrapalha:** a ACE-5 é uma emenda de 2026-09-19 escrita com este caso na mão: "Em `09/04`, `fillOpacity` de 0,55 derrubou a bolha para **2,43:1 no tema claro**". `09/03` é a versão vizinha, com o mesmo token, a mesma opacidade e 2,44:1. E a consequência é invertida em relação ao que se quer: **a bolha isolada é a mais apagada e a aglomerada é a mais visível**, quando o achado comercial mora nas campanhas isoladas de CPL alto, no canto direito do plano.

**Proposta:** trocar a opacidade por contorno, que é a saída que a própria ACE-5 oferece: preenchimento opaco em `--chart-1` com contorno de 1,5 px em `--surface-raised`, que separa as bolhas sobrepostas sem mexer no contraste do preenchimento. Nesta peça a sobreposição é moderada (36 bolhas, aglomeração só na faixa de CPL baixo), então o contorno basta.

**Alternativa:** manter a opacidade e subi-la até a cor composta passar 3:1 nos dois temas. Pela conta, no claro isso exige aproximadamente 0,70.

**Observações não bloqueantes:**
* A área tem intercepto: `AREA_MIN = 12` faz a menor campanha do recorte (R$ 5,2 mil, 2,9% do máximo) desenhar 4,2% da área máxima, um raio 20% maior que o proporcional (GEO-3). É o preço de manter a bolha mínima visível, é pequeno aqui e está declarado no código; registro para quem copiar o padrão com dado de cauda mais longa.
* Esta é a única das treze com `.diff.png` gravado, e o diff é do **subtítulo da moldura**, não do gráfico: o `useCase` tem 104 caracteres, quebra em duas linhas e o ponto de quebra difere entre o SVG aberto sozinho e a página. Está dentro da tolerância do render e é artefato da ferramenta.

---

## A4 · `16_distribuicao/03_strip-plot-e-beeswarm/v1`

**O conserto pedido (GEO-12) foi resolvido de fato.** O rodapé escreve "faixas em ordem de mediana crescente, de cima para baixo". Conferi contra o dado: Busca paga 86, Social 110, Display 149, Vídeo 174, exatamente a ordem desenhada. Os outros números da tela também batem: n 114 campanhas (34+41+17+22), 35 campanhas acima de R$ 150, e as 7 campanhas sem nenhum lead declaradas fora da faixa em vez de virarem CPL zero.

### A4.1 — O ponto isolado mede 2,04:1 no tema claro · ALTO · design

**O que vejo:** `fillOpacity` de 0,45 sobre `var(--chart-1)`, nos 114 pontos. Composta contra o cartão: **2,04:1 no claro** e **2,96:1 no escuro**, os dois abaixo do piso de 3:1 da ACE-5. Dois pontos sobrepostos sobem para 3,24 e 5,26.

**Por que atrapalha:** mesma inversão de `09/03`, e aqui pior, porque o rodapé **ensina o leitor a ler densidade pela cor**: "cor mais forte é mais campanha no mesmo valor". A campanha única, que é a que se abre, pausa ou copia, é a mais apagada da tela; a peça tem CPL de até R$ 391 e são justamente esses pontos solitários da direita que o gestor procura. No PNG claro eles quase desaparecem.

**Proposta:** subir a opacidade até a cor composta do ponto único passar 3:1 nos dois temas e reservar o empilhamento para a diferença acima disso, ou trocar o canal de densidade: contorno em `--surface-raised` e deslocamento vertical de beeswarm, que é o que o modelo já anuncia no nome.

**Alternativa:** manter a opacidade e desenhar o ponto único com contorno, de modo que a marca tenha uma borda de 3:1 mesmo com o preenchimento translúcido.

### A4.2 — A mediana de Display cai a 1,05 px da linha de meta e cobre parte dela · MÉDIO · design

**O que vejo:** medido no `preview.svg`, a `ReferenceLine` da meta está em `x = 292,75` e o retângulo da mediana de Display (largura 2 px) ocupa `290,705` a `292,705`, isto é, **1,05 px entre os centros**, com sobreposição física. A mediana de Display é R$ 149 e a meta é R$ 150.

**Por que atrapalha:** o cartão existe para responder quantas campanhas passam da meta; das quatro faixas, a de Display é a única em que a resposta da mediana é ambígua na tela, e a marca opaca ainda apaga o tracejado da referência naquele ponto. O dado é honesto, o desenho é que não deixa o leitor decidir de que lado a faixa está.

**Proposta:** desenhar a mediana como um traço vazado ou com folga de alguns pixels (por exemplo, a mediana com 2 px de altura a mais e contorno na cor da superfície), e, quando a distância entre mediana e referência for menor que um limiar declarado em constante, escrever o valor da mediana ao lado. Hoje a mediana não está escrita em lugar nenhum do cartão, o que o próprio revisor já havia notado.

**Alternativa:** manter como está e acrescentar ao rodapé a mediana de cada faixa em número, o que resolve a ambiguidade sem mexer no desenho.

**Observação não bloqueante:** a função `median` devolve `number | null` como manda a EST-1b, mas o dado publicado não tem nenhuma faixa sem campanha, então o ramo de ausência não aparece em nenhum dos dois PNGs. É conserto de ramo, não de foto, e está certo assim; registro porque a divisão de trabalho entre versões (candidata E7 da seção 18) continua invisível.

---

## A5 · `13_progresso-meta-e-gauge/03_progresso-radial-de-anel-unico`

**O conserto pedido (DAD-5) foi resolvido de fato nas três versões.** O percentual passou a ser escrito uma vez (`const percentText = formatPercent(percent, 0)`) e reusado no centro do anel e na frase acessível. Conferi nos `data-farol-ace` dos previews: v1 diz 46% nos dois lugares (41 de 90 dá 45,56%), v2 diz 74% e v3 diz 65%. A divergência "46% visto contra 45,6% ouvido" acabou.

### A5.1 — v3: o trilho do anel é invisível no tema claro, e some o denominador · ALTO · design

**O que vejo:** `const TRACK_FILL = 'var(--surface-overlay)'` (v3, linha 19). No `preview-claro.svg` o trilho sai em `rgb(255,255,255)`, **1,00:1** contra o cartão; no escuro, 1,10:1. Nas irmãs v1, v2 e v4 o mesmo `TRACK_FILL` é `var(--surface-sunken)` e mede 1,15:1, que é pouco mas se vê nos dois PNGs. No PNG claro da v3 o anel deixa de ser anel: vira um arco aberto flutuando, sem os 35% que faltam.

**Por que atrapalha:** num anel de progresso o trilho **é o denominador**. Sem ele o leitor perde a referência do todo e a forma passa a dizer só "tem receita aqui", não "65% da meta". E este é literalmente o defeito pelo qual a **v4 deste mesmo modelo foi reprovada em 2026-09-19**: "no tema claro o trilho em surface-overlay e branco puro, entao o anel de zero medido some". A v4 foi corrigida, a v3 ficou para trás, e a passada de hoje mexeu no `Chart.tsx` da v3 sem pegar isto.

**Proposta:** `TRACK_FILL = 'var(--surface-sunken)'`, alinhando v3 com v1, v2 e v4. É uma linha.

**Alternativa:** se a distinção precisar ser mais forte que os 1,15:1 do `--surface-sunken`, usar contorno de 1 px em `--line-subtle` no trilho, que é o outro token que a seção 7 nomeia para estrutura visível.

### A5.2 — v1 e v2: o `useCase` do cartão é cortado no meio da frase · MÉDIO · design

**O que vejo:** as duas versões declaram `"canvas": "kpi-alto"` (360 x 280). O `useCase` da v1 tem 117 caracteres e o da v2 tem 110, os dois dentro do teto de 140 da seção 4. Na moldura, o subtítulo cabe em duas linhas e o resto é **cortado sem reticência e sem aviso**: a v1 imprime "...contra a meta do mês **e que**" e perde "percentual isso representa."; a v2 imprime "...esperado para a data **de**" e perde "corte.". Nos dois temas. A v3, que usa canvas `card`, imprime o subtítulo inteiro.

**Por que atrapalha:** o preview é o retrato que vai para a galeria, e ele publica uma frase que para no meio. Não é do `Chart.tsx`, é do encontro entre duas regras do contrato: a seção 4 autoriza 140 caracteres e o preset `kpi-alto` não os comporta.

**Proposta:** encurtar o `useCase` das duas para o que cabe em duas linhas do `kpi-alto` (na medida do render, algo em torno de 88 caracteres), o que é decisão da versão e não da ferramenta.

**Alternativa (decisão do dono do catálogo, não minha):** a ferramenta passar a reticenciar ou a crescer a faixa do cabeçalho, e a seção 4 passar a declarar um teto de `useCase` **por preset**. Isso é vizinho da candidata E8 da seção 18, que já pede rever a lista de presets.

**Observação não bloqueante:** a v3 tem um desalinho de acabamento: é a única das quatro que não espalha `{...AXIS_PROPS}` no `PolarAngleAxis`. Como ela também passa `tick={false}`, não há consequência no render, então fica como observação, no peso que a 14.1 manda.

**Observação não bloqueante (v3):** os valores impressos na legenda somam R$ 3,21 mi enquanto o centro diz R$ 3,3 mi. Conferido no dado: a soma verdadeira é R$ 3.250.000, então **nenhuma parte está faltando** e a versão está certa pela precisão da ROT-10 de 2026-09-20. Os percentuais impressos somam exatamente 65, que é o teste que importa. Registro porque R$ 90 mil de diferença de arredondamento é grande o bastante para um leitor de diretoria notar, e a própria ROT-10 sugere, nesse caso, uma casa a mais ou uma nota curta.

---

## A6 · `15_mapa-de-calor-e-calendario/03_cohort-em-triangulo/v1` (controle)

**Parecer independente, escrito antes de abrir a nota do arquivo de revisão.**

Esta é a peça mais bem construída do lote no que diz respeito a honestidade do dado, e eu confirmei isso com a conta na mão, não por impressão:

* **As médias ponderadas estão certas.** Recalculei a coluna M0 sobre os oito cohorts fechados (setembro é o em curso): 36.965,6 / 3.892 = **9,498%**, impresso 9,5%. M5 sobre jan, fev e mar: 25.464,9 / 1.255 = **20,29%**, impresso 20,3%. M6 sobre jan e fev: **19,80%**, impresso 19,8%. A regra "só períodos fechados" que o rodapé promete é a que o código executa (`isOpenPeriod` exclui a diagonal).
* **As curvas acumuladas são monotônicas em todas as nove linhas**, como uma taxa acumulada tem de ser.
* **Ausência e período em curso são coisas diferentes na tela e as duas estão nomeadas**: célula vazia para período que não começou, contorno tracejado para período em curso, as duas declaradas no rodapé.
* **Todo valor está escrito na célula e todo par texto/célula passa o piso.** Medi os cinco degraus da rampa nos dois temas: o pior par é 5,45:1 (claro) e 6,33:1 (escuro). Os dois degraus altos trocam a cor do texto explicitamente; os três baixos herdam `--text-primary` e continuam confortáveis. Ao contrário de `15/08`, aqui a isenção da 17.2 se sustenta de verdade.

### A6.1 — O trilho da microbarra de leads some no tema claro · MÉDIO · design

**O que vejo:** `className="relative min-w-0 flex-1 rounded-full bg-surface-overlay"`. No `preview-claro.svg` o trilho é branco puro sobre o cartão branco, **1,00:1**; no escuro, 1,15:1 e se vê. No PNG claro as barras de leads flutuam sem calha.

**Por que atrapalha:** o contrato nomeia este caso com endereço: "a revisão de `12/04` encontrou o mesmo defeito **num trilho de microbarra**, que sumia no claro e deixava o ponto do valor sem escala". A consequência aqui é menor do que em `12/04`, porque as nove barras compartilham a mesma origem e a mesma escala e ainda se comparam entre si, e porque o número está escrito ao lado; o que se perde é a leitura "quanto isto é do maior", que é o que o trilho entrega. Mesmo assim é o token proibido no papel proibido, e a correção é uma palavra.

**Proposta:** `bg-surface-sunken`, o que a seção 7 manda.

**Observações não bloqueantes:**
* A legenda da rampa imprime **5% e 22%**, enquanto o recorte observado vai de 4,8% a 21,9%. Os extremos saem do dado (`Math.min`/`Math.max`), o arredondamento é para fora, e nenhuma célula chega a 22%. Não engana ninguém, mas nomeia um degrau que não existe; a `ROT-5b` resolveu o caso irmão em legenda de área, e vale a pena o mesmo cuidado aqui.
* **A peça inteira é HTML dentro de `foreignObject`** (é uma `<table>`). Isso significa que `CONTRASTE-TEXTO` e `TAMANHO-TEXTO` **não mediram nada** nela: o `check` verde não diz nada sobre contraste nem sobre escala tipográfica aqui. Foi por isso que medi à mão. Vale dizer no README do modelo.

---

## A7 · `16_distribuicao/05_histograma-comparativo/v1` (controle)

**Parecer independente, escrito antes de abrir a nota do arquivo de revisão.**

Testei as três coisas que costumam quebrar um histograma comparativo e as três estão certas:

* **Os números batem.** n 167 e 143; medianas 73 e 39; a diferença anotada "34 dias" é exatamente 73 − 39; as 18 ganhas sem data de criação aparecem **separadas por grupo** (11 e 7), que é a forma que não esconde a diferença de cadastro entre as carteiras.
* **Os bins são os mesmos para os dois grupos** (7 dias, domínio fixo de 0 a 210 vindo da métrica), e recalculei a binagem a partir do `data.ts`: o platô de 26 que a silhueta desenha nas faixas 21 a 28 e 28 a 35 é **real**, os dois bins têm 26 ocorrências. Era a minha primeira suspeita visual e a conferência a derrubou.
* **A ausência não vira zero e o zero medido vira zero.** `outlineDraw` devolve `null` depois do último bin com ocorrência (cliente da casa termina em 147 dias) e a silhueta simplesmente para, mas os bins vazios **no meio** da amostra (91 e 98) desenham zero, que é o correto. As faixas vazias da barra preenchida, de 175 a 196, também levam a marca de base.
* **O vazio substitui o gráfico inteiro** com `role="status"`, ícone `Filter` de 16 px e frase de 12 px em `--text-muted`, exatamente no desenho da EST-1, e a guarda testa **as duas listas que alimentam a conta**, não uma lista vizinha.
* **A legenda usa amostra na forma da marca**: quadrado cheio para a barra, glifo em degrau para a silhueta. É o detalhe certo da ROT-4.

### A7.1 — `median` devolve `0` para lista vazia · BAIXO · dado

**O que vejo:**

```tsx
function median(values: readonly number[]): number {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  if (sorted.length === 0) return 0;
  ...
```

Isto contraria a letra da **EST-1b**, emenda de hoje: "Toda função que agrega uma lista (mediana, média, quartil, percentil, taxa, percentual de etapa) declara retorno `number | null` e devolve `null` para lista vazia. Nunca `0`."

**Por que quase não atrapalha:** o propósito da EST-1b está satisfeito. A guarda de vazio da linha 188 testa `filledGroup.values` e `outlineGroup.values`, que são exatamente as listas que alimentam `median`, e retorna antes. O ramo é inalcançável. É o oposto do caso que motivou a emenda, em que a guarda testava a lista vizinha.

**Proposta:** trocar a assinatura por `number | null` mesmo assim, porque a função é copiável e porque, uma vez colada no Farol com dado real, a guarda de cima pode mudar antes desta linha. Custo de duas linhas. De quebra, o `middle` é calculado antes da checagem de tamanho, o que não quebra nada e denuncia a ordem trocada.

**Observação não bloqueante:** o eixo Y é contagem e os grupos têm n diferente (167 contra 143), o que em tese distorce a comparação de formas. Está declarado três vezes (o `n` de cada grupo na legenda, a razão no comentário do `data.ts`, e a `v4_grupos-de-tamanho-desigual` declarada na seção `## Versões planejadas` do README como a versão que troca contagem por percentual dentro do grupo). Com 17% de diferença de tamanho e o par de medianas anotado, a leitura se sustenta. Não é defeito.

**Veredito independente:** peça correta, com um item de conformidade de código. **Passa com ressalva.**

---

## A8 · `16_distribuicao/02_box-plot/v1`

**Os dois consertos pedidos foram resolvidos de fato.** (1) GEO-12: o rodapé escreve "filas ordenadas pela mediana, da mais rápida para a mais lenta", e conferi a ordem contra o dado, recalculando o quartil por interpolação linear: 7, 14, 18, 24, 30 e 33 minutos, exatamente a ordem desenhada. (2) DAD-10: o comentário deixou de prometer código sobre cada ponto e a peça escreve o caso mais distante no rodapé, "o mais distante é o LD 4927, com 188 min", com a razão declarada no comentário (dois outliers vizinhos ficam a 4 px e o código mede cerca de 35).

Conferi também os demais números contra o `data.ts`: n 297 leads (62+58+33+49+54+41), 19 pontos além da cerca de 1,5 vez, 29,3% acima do SLA de 30 min (87 de 297), e LD 4927 com 188 minutos. Todos batem. O canvas saiu do preset (640 x 460) e o `meta.json` declara o desvio com a conta nas `notes`, como manda a ESP-2.

### A8.1 — `quantile` devolve `0` para lista vazia, e não há estado de vazio · MÉDIO · dado

**O que vejo:** `if (sorted.length === 0) return 0;` (linha 80). Com uma fila sem nenhum contato, `summarize` devolve q1, mediana e q3 iguais a zero, `whiskerLow` e `whiskerHigh` em zero, e a fila nasce **no topo da ordenação como a mais rápida de todas**. É exatamente a história que a EST-1b conta e que fez `16/03`, `09/11` e `15/06` serem consertadas nesta mesma rodada; esta peça não entrou na varredura porque a reprovação dela era de outro assunto.

Junto vem o resto da família: não há bloco `role="status"` (pergunta 16 do checklist), e o rodapé imprime `formatPercent(total === 0 ? 0 : above / total, 1)`, isto é, **"0,0% acima do SLA"** quando a base é zero. Taxa sem base é ausência, não zero por cento, e a `15/06` desta mesma leva já faz o certo (`breachShare === null`).

**Por que atrapalha:** nada disso aparece no preview publicado, e por isso mesmo é o tipo de defeito que a EST-1b diz que só a revisão pega: "uma função que devolve 0 passa por todas as guardas do check e por todas as perguntas do CHECKLIST_REVISAO.md, porque o que se inspeciona é a tela". Este `Chart.tsx` é código de produção e sai do catálogo sem limpeza.

**Proposta:** `quantile` com retorno `number | null`; fila sem contato sai da ordenação por valor e vai para o fim com `formatUnavailable()` na coluna, no molde que a `15/06` já implementou; taxa com base zero vira `formatUnavailable()`; e `data` vazio desenha o bloco `role="status"` da EST-1.

**Alternativa:** se a peça quiser assumir que fila sem lead não chega ao componente, o mínimo é a guarda de vazio testando `queue.contacts` e o estado `role="status"`, que é o que 272 das 347 versões do acervo já fazem.

**Observação não bloqueante:** `BOX_FILL` é `var(--surface-overlay)`, e a consequência aqui é diferente das outras cinco: o preenchimento existe para **cobrir** o traço do `ErrorBar` que atravessa a caixa, e no claro o branco opaco cobre igual. Funciona nos dois temas. O efeito colateral é que a caixa lê como preenchida no escuro e como vazada no claro (GEO-11). Sem consequência de leitura, então fica como observação, no peso da 14.1.

---

## A9 · `15_mapa-de-calor-e-calendario/06_lasagna/v1`

**O conserto pedido (TOK-7) foi resolvido de fato, e a medição confirma.** As cinco faixas saíram da rampa `--seq-*` e foram para cores de papel. Medi as quatro que aparecem no desenho contra o cartão:

| Faixa | Token | Escuro | Claro |
|---|---|---|---|
| até 1 h | `--positive` | 7,36:1 | 5,34:1 |
| até 4 h | `--chart-1` | 9,50:1 | 6,00:1 |
| até 24 h | `--chart-3` | 6,47:1 | 6,18:1 |
| até 48 h | `--warning` | 8,36:1 | 5,74:1 |

A faixa que sumia, "até 24 h", saiu de 2,29:1 / 1,92:1 para 6,47:1 / 6,18:1. Também verifiquei a afirmação de daltonismo do README por conta própria (ΔE76 sobre a matriz de Machado 2009, deuteranopia): o par mais fraco entre as faixas desenhadas é "até 1 h" contra "até 4 h", com **28,7 no claro** e 37,2 no escuro, bem acima do piso de 15 que a COR-8 usa. O conserto é real.

### A9.1 — A escala é ordenada e a ordem não sobrevive fora da cor · MÉDIO · forma

**O que vejo:** as cinco faixas são uma régua ordenada (até 1 h < até 4 h < até 24 h < até 48 h < mais de 48 h), mas a ordem agora está só no matiz. Medida a luminância relativa das quatro faixas desenhadas: no claro, 0,147 / 0,125 / 0,120 / 0,133, uma amplitude total de 0,027 e **não monotônica**; entre faixas vizinhas o contraste vai de **1,03:1 a 1,13:1**. No escuro, 0,403 / 0,535 / 0,348 / 0,465, também não monotônica.

**Por que atrapalha:** a peça troca uma rampa que ordenava mal por um conjunto categórico que não ordena. Em impressão em cinza, em projeção ruim ou para quem lê por luminância, as doze filas viram um bloco só. O README argumenta que quem não separa as cores "continua lendo a peça pela ordem das filas e pela mediana escrita à direita", o que é verdade para a comparação **entre filas** e falso para a pergunta que o subtítulo faz, "em que dias o primeiro contato estourou", que é leitura **dentro da fila**, célula a célula.

**Proposta:** manter as cores de papel e devolver a ordem por um segundo canal, por exemplo escurecendo progressivamente dentro de cada matiz, ou usando duas cores e três intensidades. A forma vizinha que resolve isso sem paleta nova é a de `ARMADILHAS` TOK-2 invertida: escala de duas pontas com neutro declarado no limiar do SLA.

**Alternativa (e é a que eu recomendaria manter, se o custo pesar):** deixar como está, que é o padrão de semáforo que o mercado lê, e acrescentar ao rodapé o limiar do combinado.

### A9.2 — O cartão nunca diz qual é o combinado · MÉDIO · dado

**O que vejo:** o subtítulo pergunta "Quais filas respondem **dentro do combinado**", e o combinado não está escrito em nenhum lugar visível. Ele existe no código (`allMeasured.filter((hours) => hours > 24)`) e na frase acessível ("X% dos dias medidos passaram de 24 h"), mas não no desenho parado.

**Por que atrapalha:** é a mesma inversão do DAD-9 que reprovou a `15/04` desta mesma família: o essencial só em quem não se vê. O leitor tem cinco faixas nomeadas e nenhuma pista de qual delas é a linha do acordo.

**Proposta:** uma frase no rodapé, no molde do que a peça já faz com a ordem das filas: "combinado de 24 h; 21,4% dos dias medidos passaram dele", com o percentual saindo do mesmo `breachShare` que a frase acessível já calcula.

**Observações não bloqueantes:**
* A faixa "mais de 48 h" está na legenda e **não tem nenhuma célula** no recorte (o maior valor do dado é 38,5 h). Legenda que nomeia categoria ausente é o inverso da ROT-10 e custa pouco, mas vale explicitar que a régua é de serviço e não do recorte.
* A `medianOf` foi corrigida para `number | null` corretamente, e a coluna da direita foi de 46 px para 64 px para caber `indisponível`, mas **nenhuma das doze filas fica sem dia medido** no dado publicado, então o ramo e os 18 px extras não aparecem em nenhum PNG. Conserto de ramo, correto; o inventário de estados provados continua sendo a candidata E7.

---

## A10 · `16_distribuicao/04_ecdf-e-histograma-acumulado/v1`

**O conserto pedido foi resolvido de fato.** O rótulo "71% em até 30 min" saiu da altura da `ReferenceLine` horizontal e desceu para dentro do plano, abaixo do ponto. Nos dois PNGs o tracejado não cruza mais nenhuma letra, e no claro, que era o pior caso, a linha passa bem acima do topo do texto. Os números batem com o dado: n 480 leads, 343 contatados em até 30 min (71,46%, impresso 71%), 137 acima do SLA, 37 sem contato declarados fora da curva.

### A10.1 — O eixo Y declara cinco tiques e desenha quatro, e a grade vai junto · MÉDIO · design

**O que vejo:** `const Y_TICKS = [0, 0.25, 0.5, 0.75, 1]`, cinco valores passados em `ticks={[...Y_TICKS]}`. No `preview.svg` o eixo imprime apenas `0%`, `25%`, `50%` e `100%`, e a `CartesianGrid` desenha linhas em `y = 120`, `92,5`, `65` e `10`. A linha de 75%, que cairia em `y = 37,5`, **não existe**. É a `REC-29`, "O eixo descarta tique em corpo curto e leva a grade junto", agora no terceiro modelo.

**Por que atrapalha:** o corpo tem 110 px de altura e os intervalos de grade passam a ser 27,5, 27,5 e **55 px**. O olho lê espaçamento uniforme como escala uniforme, então a metade de cima do gráfico aparenta o dobro de amplitude da de baixo. E é justamente a metade de cima onde a ECDF vive: a curva passa de 71% em 30 minutos e gasta os outros 285 minutos do eixo subindo os 29% restantes. O leitor que quiser estimar "quanto da curva está acima de 75%" não tem referência, embora o autor a tenha declarado.

**Proposta:** reduzir para quatro tiques redondos e coerentes (`[0, 0.5, 0.75, 1]` ou `[0, 0.25, 0.5, 0.75, 1]` com o corpo mais alto), ou passar `interval={0}` no `YAxis` para o Recharts parar de descartar. A EIX-4 pede de 3 a 5 linhas de grade em intervalo redondo, e hoje a peça entrega 4 linhas em intervalo **não** redondo.

**Alternativa:** já que a peça tem uma linha de referência horizontal em 71%, assumir o desenho e trocar o tique de 75% pela própria referência, rotulando-a no eixo; aí a irregularidade vira intenção declarada.

---

## A11 · `09_dispersao-e-bolhas/11_pequenos-multiplos-de-dispersao/v1`

**Os dois consertos pedidos foram resolvidos de fato, e este é o melhor trabalho do lote.**

(1) **TIP-7.** O nome do executivo ocupa sozinho a primeira linha do cabeçalho, com a largura inteira do painel, e a contagem desceu para a linha da mediana, que já existia: o cabeçalho continua com duas linhas e nenhuma altura saiu do gráfico. Não há `truncate` em lugar nenhum do `Chart.tsx`, então um nome maior quebra em duas linhas em vez de sumir, que é o comportamento que a TIP-7 quer. O nome mais longo do dado também encolheu para "Diego F. Castro" e o cabeçalho mais largo, "Ana Beatriz Ramos", imprime inteiro nos dois temas.

(2) **Dado sem dispersão.** O `data.ts` foi reescrito e eu **recalculei o Pearson de cada painel** a partir dos pares publicados, em vez de aceitar o que o comentário afirma:

| Painel | n | r medido | comentário do `data.ts` |
|---|---|---|---|
| Camila O. | 11 | +0,98 | +0,98 |
| Giovana P. | 11 | −0,87 | −0,87 |
| Felipe N. | 11 | +0,80 | +0,80 |
| Ana Beatriz Ramos | 11 | +0,62 | +0,62 |
| Bruno C. | 12 | +0,48 | +0,48 |
| Diego F. Castro | 10 | −0,42 | −0,42 |
| Elisa T. | 12 | +0,04 | +0,04 |
| Hugo M. | 11 | −0,00 | 0,00 |

Todas as oito conferem. A grade agora ensina o que ela existe para ensinar: duas relações fortes, uma negativa forte, duas médias, uma fraca e duas nuvens sem relação. O n varia de 10 a 12 e cada cabeçalho escreve o próprio.

Conferi ainda a geometria, porque a EIX-9 e a REC-17 moram aqui: os oito painéis saem com **coordenadas idênticas** no SVG (corpo de `x = 56` a `185` e de `y = 6` a `65`, grade em três verticais e três horizontais), e as oito medianas tracejadas caem nos pixels que o valor exige (Diego 113,5 dias em `y = 23,1`; Bruno 18 dias em `y = 58,4`; e assim por diante). Painéis alinhados de verdade, não só por promessa.

### A11.1 — O mesmo número aparece em dois formatos na mesma tela · BAIXO · design

**O que vejo:** a linha de leitura escreve `formatCurrencyCompact(TICKET_DOMAIN[1])`, que imprime **"R$ 900,0 mil"**, e o tique do eixo de todos os oito painéis escreve `formatCurrencyAxis(900000)`, que imprime **"R$ 900 mil"**. São o mesmo número, no mesmo cartão, com duas grafias; a linha de leitura existe justamente para nomear o domínio do eixo.

**Por que atrapalha:** é a DAD-5 aplicada dentro do corpo, que é o defeito que fez as três versões de `13/03` serem consertadas nesta mesma rodada. Aqui é menos grave porque o valor é idêntico e só a casa decimal difere, e porque os dois formatadores estão individualmente corretos pela NUM-1.

**Proposta:** a linha de leitura, quando cita o domínio do eixo, usa o formatador do eixo. Uma troca de função.

**Observação não bloqueante:** os oito cabeçalhos de painel saem em 15 px, acima do teto de 14 px da tabela 17.1. O contrato já registra isso: "Ao menos 21 versões escrevem texto de SVG acima de 14 px... Isso está medido mas não é acusado". Registro para o inventário, não como defeito.

---

## Propostas de forma

Nenhuma das treze peças está na forma errada. A escolha de forma está certa em todas: calendário para cadência diária, lasagna para fila por dia, matriz triangular para correlação simétrica, box plot e strip para distribuição por categoria, ECDF para "quanto já foi atendido até T", pequenos múltiplos para "a relação muda por recorte", bolhas para três medidas, anel para parte de uma meta, cohort em triângulo para maturação. Isso é raro num lote de treze e merece ser dito: a camada 1 deste catálogo está resolvida, e a dívida está toda na camada 2.

A única proposta de forma que eu faria é na **`15/06` lasagna**, e é opcional: como a pergunta do cartão é "em que dias estourou", e não "qual é a magnitude", uma escala de duas pontas com neutro declarado no combinado (dentro do SLA em um matiz, fora em outro, com intensidade dentro de cada lado) devolveria a ordem por luminância sem perder a legibilidade que o conserto de hoje ganhou. Custo: uma rampa divergente não existe nos tokens (TOK-3), então teria de ser composta. Fallback convencional: manter as cinco faixas de papel e escrever o combinado no rodapé, que é a A9.2.

---

## Aposta criativa

**Uma só, e é barata.** Na `16/02` box plot, a fila "Bruna C." tem intervalo interquartil de 6 minutos num domínio de 200, e a caixa dela fica com cerca de 13 px enquanto a de "Rafael T." tem 200 px. O desenho já é honesto, mas o que a operação quer saber não é a largura da caixa e sim **quem está dentro e quem está fora do SLA**. Um segundo painel estreito à direita, com uma barra 100% por fila mostrando dentro e fora do SLA, responderia isso em um relance e reaproveitaria o `aboveSla` que o componente já calcula.

* **O que revela:** que Ernesto V., com n 33, tem a segunda menor mediana e ainda assim é quem mais estoura em proporção. Hoje isso está no desenho mas exige contar bolinhas vermelhas e lembrar o n de cada fila.
* **O que custa:** um painel a mais no mesmo canvas, que já está em 640 x 460 declarado; e o risco de o leitor comparar a barra 100% com a caixa como se fossem a mesma escala, o que pede um rótulo claro.
* **Fallback convencional:** não fazer o painel e escrever o percentual acima do SLA por fila ao lado do `n`, no mesmo rótulo de categoria que já existe. Zero risco, quase todo o ganho.

---

## Divergências de marca

Nenhuma proposta minha pede desvio de paleta, e nenhuma toca o brandbook. Duas tensões internas ao contrato, porém, apareceram e são decisão do dono do catálogo, não minha:

1. **Semântico pintando série.** A `15/06` agora pinta cinco faixas de SLA com `--positive`, `--chart-1`, `--chart-3`, `--warning` e `--negative`. A tabela 17.2 diz que o papel semântico "**nunca pinta série**", e ao mesmo tempo o define para "estado", que é o que uma faixa de SLA é. O conserto respeitou a COR-8 (nem `--chart-2` nem `--chart-4`) e nomeia todas as faixas em palavra, então a segunda metade da regra está cumprida. Registro a divergência em vez de escolher em silêncio: ou a 17.2 ganha uma frase dizendo que faixa de serviço é estado e pode, ou a peça precisa de outra saída.
2. **Teto de `useCase` contra preset de canvas.** A seção 4 autoriza 140 caracteres e o preset `kpi-alto` corta em torno de 88. Hoje isso é resolvido por sorte, versão a versão. É emenda de contrato, vizinha da candidata E8.

---

## O que NÃO mudar

Explicitamente, para nenhuma destas coisas ser refeita na próxima rodada:

* **A `09/11` inteira.** O dado reescrito é o melhor exemplo do acervo de "dado que exercita o visual": oito painéis com força de relação medida e declarada, conferida por mim par a par. O cabeçalho sem `truncate` e a geometria idêntica nos oito painéis também estão certos e são difíceis.
* **A `15/03` cohort, tirando a cor do trilho.** A média ponderada só sobre período fechado, a diagonal tracejada, a célula vazia para período que não começou e o valor escrito em toda célula formam o conjunto mais honesto do lote. Não mexer na aritmética nem no rodapé.
* **A `16/05`, tirando a assinatura de `median`.** A truncagem da silhueta no último bin com ocorrência, com zero desenhado nos bins vazios do miolo, é exatamente a distinção que a EIX-10 pede e quase ninguém implementa. O estado de vazio dela é o molde a copiar.
* **A `16/02`, na parte que foi consertada.** A decisão de não rotular os dezenove outliers e escrever o mais distante no rodapé, com a razão medida no comentário (4 px entre pontos contra 35 px de texto), é a resposta certa para a DAD-10 e vale como precedente.
* **A `16/04`, no encoding.** O `stepAfter` contra a reta que inventaria casos, o par de guias, o eixo de hora em hora para ancorar os 30 minutos e os 37 leads sem contato declarados fora da curva. O achado A10.1 é do eixo, não da curva.
* **A `15/06`, nas cores novas.** Elas foram medidas e estão certas nos dois temas e em deuteranopia. As ressalvas são sobre ordem e sobre o limiar não escrito, não sobre a paleta.
* **O desvio de canvas declarado da `16/02`** (640 por 460, com a conta nas `notes`). É exatamente o que a ESP-2 manda fazer, e desvio declarado assim não é irregularidade.

---

## Comparação com o parecer do dono, nas duas de controle

Escrevi as seções A6 (`15/03`) e A7 (`16/05`) antes de abrir os arquivos de revisão dessas duas peças, e é como estão acima. A comparação com a nota do dono fica registrada aqui, abaixo desta linha, sem alterar nada do que está escrito acima.

### `16/05` histograma comparativo: convergimos

O seu veredito é **aprovado**; o meu é **passa com ressalva**, e a ressalva é de código, não de tela. Convergimos no elogio (barra sólida contra silhueta em degrau resolvendo a sobreposição sem transparência, legenda com a forma de cada marca, mediana tracejada na cor do grupo com os 34 dias medidos por seta, rodapé declarando bin, domínio fixo e os 18 excluídos já decompostos por grupo) e convergimos até no mesmo ponto de dúvida: os dois levantamos o `n` de 167 contra 143 no eixo de contagem e os dois o dispensamos pela mesma razão, os dois `n` estão escritos e o eixo está nomeado. Acrescento a isso uma coisa que você não cita e que reforça a dispensa: a `v4_grupos-de-tamanho-desigual` está declarada na seção `## Versões planejadas` do README como a versão que troca contagem por percentual, então a divisão de trabalho é explícita.

**Divergência única:** o `median` da linha 169 devolve `0` para lista vazia, o que contraria a letra da EST-1b de hoje. Grade o peso como quiser: o propósito da emenda está satisfeito, porque a guarda de vazio da linha 188 testa as duas listas que alimentam a conta, e o ramo é inalcançável. É BAIXO, e não muda o veredito.

### `15/03` cohort em triângulo: divergimos em um ponto, e ele é do tema claro

Seu veredito é **aprovado**, com "peça exemplar"; o meu é **volta**, por um token.

Convergimos no essencial e, o que é mais útil, **convergimos no número sem combinar**: você registra "com os cinco degraus escolhidos o pior caso é 5,45:1" e eu medi, à mão e sobre o `preview-claro.svg`, os mesmos 5,45:1 como pior par de texto sobre célula. Também convergimos na leitura de que a célula vazia, o tracejado e a média ponderada só sobre período fechado estão certos, e eu acrescento a conferência aritmética que a sua nota não faz: recalculei três colunas da média ponderada a partir do `data.ts` (M0 9,498%, M5 20,29%, M6 19,80%) e as três batem com o impresso.

**Divergência:** a **microbarra da coluna Leads usa `bg-surface-overlay` como trilho**, e no tema claro isso é branco puro sobre cartão branco, 1,00:1. No PNG claro as nove barras flutuam sem calha. Não é gosto: é o token que a seção 7 do contrato proíbe nesse papel, com o número já medido, e citando nominalmente a revisão de `12/04`, que era **o mesmo trilho de microbarra**. A consequência aqui é menor do que em `12/04`, porque as barras dividem origem e escala e ainda se comparam entre si, e porque o número está escrito ao lado; por isso a chamo de MÉDIO e não de ALTO. Mas a regra é dura e a correção é uma palavra, `bg-surface-sunken`.

Registro também, sem divergir, o ponto cego que a nota não menciona: a peça inteira é uma `<table>` em `foreignObject`, então `CONTRASTE-TEXTO` e `TAMANHO-TEXTO` não mediram nada nela. Foi por isso que eu e você medimos à mão, e é por isso que o `check` verde aqui prova menos do que prova numa peça de SVG.

### O que a comparação diz do método

De duas peças, batemos em uma e divergimos em um item da outra, e o item que eu vi a mais é da mesma família que domina o lote inteiro: `--surface-overlay` em papel de estrutura, visível só no tema claro. Isso sugere menos um desacordo de olho e mais uma lacuna de varredura: o defeito não se encontra olhando peça por peça, encontra-se procurando o token.
