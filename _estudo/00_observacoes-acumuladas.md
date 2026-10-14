# Observações acumuladas da revisão: famílias 01 e 02

_Síntese de 2026-09-17, sobre as 64 versões aprovadas dos 16 modelos de `01_cards-e-kpis` e
`02_barras-horizontais`. Fontes: os 16 `README.md` de modelo (seções "Observações da revisão" e
"Pendências conhecidas") e os 16 vereditos em `_render/.qa/revisao/*.json`, inclusive o `historico`,
que guarda 34 reprovações anteriores à aprovação final._

Este documento não altera nada. Ele agrupa a revisão por **padrão**, não por modelo, classifica a
causa de cada padrão contra o `CONTRATO.md` e separa o que vale virar emenda do que é acabamento de
uma peça só.

## Como ler as contagens

O universo é de 64 versões. Uma observação que o README escreve como "todas as versões" conta 4.
Contagem marcada com "ao menos" é piso: vale o que está escrito nos READMEs, e há itens que a
revisão registrou uma vez num modelo e não repetiu nos vizinhos onde o mesmo desenho aparece.

A classificação de causa usa três rótulos:

* **(a) contrato**: a regra não existe, é vaga, contradiz outra seção, ou existe e nada a mede.
* **(b) hábito**: a regra é clara e o produtor passou por cima.
* **(c) stack**: limitação real de Recharts, de token ou do canvas, que nenhuma redação resolve.

---

## Os padrões recorrentes

### P1. Regra escrita que nenhuma ferramenta mede

**Alcance:** ao menos 24 das 64 versões, nas duas famílias. **Causa: (a).**

Quatro regras do contrato falharam repetidamente, e nas quatro o `npm run check` saiu com
`0 com erro` sobre a versão defeituosa. A própria revisão do modelo `02_barras-horizontais/03` já
registra o diagnóstico: "o `npm run check` não tem guarda para nome de marca real no `data.ts`: as
duas versões reprovadas na primeira passada desta revisão passavam com `0 com erro`".

1. **Marca de empresa real no `data.ts`**, contra a seção 3 ("zero dado pessoal real e zero marca de
   empresa real"). Quatro reprovações: `02/01 v3` (LinkedIn Ads, Google Ads, YouTube, Instagram),
   `02/03 v3` (Anúncio Meta, Google Ads), `02/03 v4` (Meta, Google, LinkedIn, TikTok) e `02/08 v3`
   (Meta Ads, Google Ads, LinkedIn Ads). O erro é sistemático porque o domínio real da casa é mídia
   paga, e a origem de lead verdadeira **é** o nome da plataforma.
2. **Número cru interpolado em JSX, sem formatador e sem algarismo tabular**, contra a TIP-1 da 17.1
   e a seção 8. Ao menos 10 versões: `01/01 v2` e `v4` (reprovadas por isso), `01/02 v3`
   (`{merged.length} dias`) e `v4` ("até 4 h" sem `formatHours`), `01/04 v1`, `v2` e `v4`, `01/05 v3`
   (`index + 1` sem `formatInt`), `01/08 v2` e `v4`, mais a correção de 2ª rodada do `02/07`, que
   levou `tabular-nums` aos títulos de lado de três versões.
3. **Literal "indisponível" no lugar de `formatUnavailable()` com ícone `Unplug`**, contra a EST-2.
   Quatro versões: `01/01 v3` (reprovada), `02/01 v4`, `02/04 v4` e `02/07 v4`, esta corrigida em
   rodada.
4. **Frase acessível fora da faixa de 100 a 250 caracteres da ACE-1.** Dez versões acima do teto
   (`01/07 v3` com 266 e `v4` com 351, `02/02 v2` com 275, `v3` com 282 e `v4` com 260, `02/05 v1`
   com cerca de 255, `02/06 v3` acima de 300, `02/07 v2` com 324 e `v3` com 284, `02/08 v2` com 252)
   e mais quatro a menos de seis caracteres do teto (`01/04 v4` com 244, `01/05 v2` com 229 e `v4`
   com 238, `01/06 v4` com 245). A frase é calculada do dado, então o número de caracteres muda com
   o recorte: as quatro no limite são defeito futuro, não folga.

A TIP-1 chega a prometer a medição ("Verifica: nenhum número de tela sem uma dessas classes") e a
seção 12 lista "acessibilidade, escrita" entre o que o check cobre. A promessa não se cumpre porque
os quatro casos são de conteúdo, não de estrutura, e a verificação de hoje é estrutural.

### P2. Espessura de barra que colapsa no cálculo do Recharts

**Alcance:** ao menos 10 versões, quase todas em `02_barras-horizontais`. **Causa: (c) + (a).**

O Recharts desconta o `barCategoryGap` percentual dos **dois lados** da banda antes de dividir pelo
número de séries. O resultado medido: `02/01 v1` com 8 px, `02/01 v3` com 9 px (reprovada, porque o
nome de 12 px dentro da barra media 1,0:1 contra o fundo), `02/02 v2` com cerca de 2,5 px contra o
`BAR_MAX = 11` declarado, `02/02 v1` com 5,5 px e `v3` com 7,7 px, `02/04 v2` com 10 px e caixa
interna de 8,5 px contra texto de 12 px (reprovada por ROT-7), e `02/07 v1`, `v3` e `v4` com 5 a 7 px,
onde "`maxBarSize` de 20 e 14 nunca chega a valer". Some o caso vizinho de `01/05 v3`, em que o
trilho de 64 px deixa as barras de 7% a 12% com 4 a 8 px.

A ESP-2 da 17.7 diz "`barCategoryGap` entre `"30%"` e `"40%"` e `maxBarSize` de no máximo 24 em
cartão". É **só teto**. Não há piso de espessura, e `maxBarSize` é um limite que o cálculo da banda
raramente alcança, o que faz a constante declarada no topo do arquivo mentir sobre o que se vê.
A correção que funcionou em `02/01 v3` foi empírica: `ROW_STEP` de 24 para 50 e `barCategoryGap` de
32% para 30%, o que engrossou a barra de 9 px para os 20 px do `maxBarSize`.

### P3. Rótulo de valor que colide com a marca ou sai da área

**Alcance:** ao menos 10 versões, nas duas famílias, com 6 reprovações formais. **Causa: (c) + (a).**

A armadilha está documentada com precisão na 2ª rodada de correção do `02/07`: para a barra que
nasce do zero, "o rótulo de valor estava ancorado em `x` do `Rectangle`, que o Recharts sempre
devolve como o pixel da base (zero), não da ponta; para um valor negativo ou revertido isso colava o
número junto da linha de zero, por cima da própria barra, e em faixas pequenas o halo cobria quase
toda a marca". As quatro versões do `02/07` foram reprovadas por isso, todas de uma vez, e a
correção é uma linha: ancorar em `x + width`.

Ao redor dessa, colisões do mesmo tipo: `02/02 v2` reprovada (rótulos do par se sobrepõem em 64/71,
70/73, 76/76), `02/02 v4` reprovada (a maior barra de cada painel perde o rótulo, que sai fora do
painel), `02/04 v2` reprovada (o rótulo do segmento colide com o próprio contorno), `02/03 v4` (o
rótulo nasce por baixo do retângulo tracejado, sem o halo da ROT-7), `02/01 v2` (rótulos encostam na
linha tracejada do SLA), `02/06 v4` ("0 agendas" é o primeiro candidato a encostar na coluna de
contagem) e, na família 01, `01/04 v3` (o SLA de 8 h cai sobre o traço do p75 e as duas marcas viram
uma linha só).

A ROT-7 manda pôr halo em rótulo que cruza linha de referência ou outra marca, e a ESP-3 manda
reservar margem para que "nada encoste na borda do corpo". Nenhuma das duas diz **onde ancorar** o
rótulo, e o render só acusa conteúdo fora do corpo, não colisão entre duas marcas dentro dele. O
próprio README do `02/07` pede a emenda: "um comentário de uma linha em cada `renderLeftValue` evita
que a próxima cópia do padrão volte a colar o número sobre a barra".

### P4. Rótulo suprimido por não caber, e o valor não reaparece em lugar nenhum

**Alcance:** ao menos 8 versões, concentradas em composição. **Causa: (a), buraco de regra.**

`02/08`, todas as quatro versões: "segmento abaixo do limiar de rótulo fica sem nenhum número na tela
e sem dica, então um ponto da escala com 2% ou 3% não tem valor legível em lugar algum". `02/03 v3`:
"só dois dos quatro segmentos imprimem percentual, então os números escritos na barra nunca somam
100 e a composição inteira depende da dica". `02/04 v1`: o percentual da fatia de ausência só aparece
em uma das três barras. `02/04 v2`: o piso de altura que resolveu a colisão deixou a fatia de
ausência sem percentual em toda barra. `02/04 v4`: com o rótulo suprimido, a composição do Squad
Cedro só se lê pela geometria e pela legenda.

O buraco é lógico, não estético. A tabela 17.2 autoriza o neutro de dado e a rampa sequencial de
baixo contraste **pela isenção** do valor escrito na marca ou junto dela, e a DIC-1 proíbe pôr o
essencial só na dica. Quando o rótulo é suprimido porque não cabe, a isenção morre junto com ele, e
a marca fica com contraste abaixo de 3:1 sem nada que a socorra. O contrato não diz o que fazer
nesse ponto, e cada versão inventou uma saída diferente.

### P5. `--line-strong` com dois papéis, e amostra de legenda sem isenção possível

**Alcance:** ao menos 9 versões, nas duas famílias. **Causa: (a) + (c).**

A 17.2 abre dizendo que "um token tem um papel só dentro do mesmo visual" e reserva `--line-strong`
para neutro de dado, deixando `--text-muted` para referência. A seção 7, na mesma página, lista
`--line-strong` como a cor da linha do zero. O `01/02 v2` registra o conflito com todas as letras:
"a divergência é do contrato consigo mesmo". Daí em diante cada versão escolheu um lado: `01/03 v3`
usa `--text-muted` no teto "porque `--line-strong` mede 1,8:1 e sumiria sobre as faixas", `01/02 v2`
usa `--line-strong` na linha de referência, e `01/04 v3` usa o mesmo token em dois papéis no mesmo
visual, trilho do domínio e faixa p25 a p75.

O segundo braço é de contraste. `--line-strong` mede 1,79:1 no escuro e 1,83:1 no claro, e vive da
isenção do valor escrito. A isenção **não alcança amostra de legenda**, que por definição não tem
valor ao lado, e isso apareceu três vezes: `02/02 v2` ("ali não há valor escrito ao lado da amostra
para valer a isenção da 17.2"), `02/03 v2` (as amostras dos três estágios medem de 1,14:1 a 1,62:1,
porque a opacidade cai sobre um token que já parte de 1,79:1) e `02/04 v3` (tracejado de "Outras" a
1,83:1). Some `01/05 v3` (barra `--line-strong` sobre trilho `--surface-sunken`) e `02/05 v1` (meta
em `--line-strong` cuja leitura depende de uma coluna de números que pode ser cortada).

O lado (c) é real e o contrato já o admite: as propostas P1 e P7 da 17.11 existem exatamente para
isso, e a P7 registra que no tema claro **não existe** cor que passe 3:1 contra o cartão e contra
`--chart-1` ao mesmo tempo. Enquanto o token não nasce, a redação precisa escolher um dos dois
papéis e proibir o outro.

Caso vizinho, de colisão de hex e não de papel: `02/06 v3` foi reprovada porque `--info` tem o mesmo
hex de `--chart-3` nos dois temas, então o selo "novo" saía na cor de quem perdeu peso. A mesma
observação reaparece na lista não bloqueante da versão corrigida.

### P6. Prosa que descreve o que a peça não faz

**Alcance:** ao menos 14 ocorrências, nas duas famílias. **Causa: (b) + (a).**

O `meta.json`, a Anatomia do README do modelo e a entrada do catálogo descrevem a versão, e em
catorze pontos a descrição não bate com o que está desenhado:

* `01/01 v3`: o `useCase` escreve "quando a mídia foi coletada" onde o catálogo escreve "média".
* `01/02 v2`: o `meta.json` diz que a contagem de dias fora do teto está no rodapé; está no número.
* `01/02 v3`: o campo `alignment` do `data.ts` não é lido pelo componente, e o rodapé é texto fixo.
* `01/05 v3`: as `notes` citam uma "nota da escala" que não existe no cartão.
* `01/08 v1`: o `meta.json` promete três ramos e o dado padrão rende um.
* `01/08 v2`: o `useCase` escreve "entre 30 e 90 dias" e o cartão escreve "entre 31 e 90".
* `02/02 v3`: `meta.json` e README anunciam uma linha de leitura que a versão não desenha.
* `02/05 v2`: o comentário de `BELOW_FILL` afirma que o valor está escrito sobre a barra, o que não
  acontece em nenhuma linha.
* `02/07 v1`: o `meta.json` prometia uma dica inexistente, corrigido em rodada.
* `02/08 v3`: o catálogo descreve "a única barra que pende para a esquerda" e há duas.

E, no nível do texto de modelo, quatro números de prosa que divergem do código ou do contrato:
a Anatomia do `02/01` fala em vão de 32% a 36% e a `v3` usa 30%; a Anatomia do `02/02` declara 28% a
34%, faixa que já diverge dos 30% a 40% da ESP-2; o item 3 da Anatomia do `02/07` afirma que
"`stackId` diferente é o que garante os dois lados centrados na mesma linha", e o Recharts faz o
contrário, medido em 16 px entre os centros; e o passo 1 do "Como colar no Farol" do `01/05` sugere
alturas (`h-64`, `h-48`) que não comportam os cartões medidos no render, de 260 a 309 px.

A seção 14 do contrato fixa os nomes e a ordem das seções do README, e o check recusa seção faltando
ou trocada. Ou seja, a verificação garante a **forma** do documento e nada diz sobre a **verdade**
dele. Quando um número de prosa (vão, altura, faixa) não sai de uma constante nomeada, ele envelhece
sozinho na primeira correção do código.

### P7. Caso difícil que existe no código e não existe no preview

**Alcance:** ao menos 10 versões, nas duas famílias. **Causa: (a), regra vaga.**

A seção 3 pede "volume plausível: o dado precisa exercitar o visual (nome longo, valor pequeno,
categoria neutra), não só o caminho feliz". Na prática, os modelos combinaram uma divisão de trabalho
em que as versões 1 a 3 mostram o caminho feliz e a `v4` mostra zero, ausência e amostra pequena. A
divisão está declarada nas `notes` e foi aceita pela revisão, mas ela deixa ramos de código sem
nenhuma prova visual:

* `01/03 v1`: os três casos difíceis que o código trata (realizado nulo, meta nula, acima da meta) só
  aparecem desenhados na `v4`.
* `01/04 v3`: o caminho "amostra pequena, sem p90" não aparece no preview.
* `01/06 v1`: `previous: null` e agendas zero existem no código e não no preview.
* `01/08 v1` e `v3`: os ramos de faixa recolhida e de régua sem avaliação nunca são fotografados.
* `02/08 v3`: o tratamento de origem com total zero simplesmente não existe, ao contrário da `v1` e
  da `v4`.

Dois desses ramos são falha, não escolha, e a revisão os separou bem: `01/07 v1` deixa a tira sem
cartão nenhum quando `data.metrics` vem vazio, sem o bloco `role="status"` que a EST-1 exige (o mesmo
vale para a `v3` e a `v4` com lista de executivos vazia), e `01/07 v3` **quebra em tempo de execução**
com lista vazia, porque `ranked[0]` vai para `total()` por asserção `as ExecutiveWeekly`. O dado fixo
nunca chega lá; quem colar no Farol com lista filtrada chega.

### P8. Canvas fora do preset que o catálogo sugere

**Alcance:** ao menos 8 versões, nas duas famílias. **Causa: (a).**

`01/03 v2` e `v4` (400 x 330 contra `kpi-alto`, 960 x 280 contra `faixa`), `01/06` nas quatro versões
(400 x 280, 400 x 340 e 1120 x 320), `01/08 v1` (360 x 240 contra `kpi`, "porque o critério literal e
o link não cabem em 180 px de altura") e `02/01 v3` (`{ width: 640, height: 940 }` contra `alto`).

O ponto que faz disso padrão e não desobediência é que os READMEs convergem na mesma frase: "o motivo
está em `notes`, e **é o catálogo que precisa ser acertado**". Sete presets da seção 4 não cobrem
duas formas que a família 01 produz o tempo todo, o cartão de KPI alto com régua e a tira larga de
quatro peças, nem o ranking muito longo da família 02. O efeito colateral aparece do outro lado:
`02/01 v1`, `v2` e `v4` sobram de 60 a 110 px vazios no fim do canvas, porque o preset escolhido é
maior que a peça.

### P9. Peso 700 em mais de dois elementos quando o destaque vem de um critério

**Alcance:** 3 versões, só na família 02. **Causa: (a), cláusula faltando.**

`02/01 v4` (empate: peso 700 em seis elementos, duas posições, dois nomes e dois valores), `02/02 v4`
(o valor da plataforma em destaque em cinco painéis) e `02/07 v3` (nove das quatorze linhas acendem,
uma para cada termo acima de 10 p.p.). A TIP-3 fixa "peso 700 em no máximo dois elementos por visual:
o nome e o valor do destaque", redação que pressupõe **um** destaque escolhido. Quando o destaque é
uma regra aplicada ao conjunto (empate, todos acima do limiar, um por painel), o teto de dois é
inaplicável e o segundo canal da COR-2 precisa ser outro. O `02/07 v3` chega à conclusão sozinho: "o
destaque continua legível, mas deixa de ser destaque".

---

## Candidatas a emenda do CONTRATO.md

Oito, em ordem do que pouparia mais versões futuras. Emenda aqui é o que evitaria o problema em toda
produção posterior, não o que conserta uma peça. Nenhuma delas foi aplicada: este documento só
propõe.

### E1. Quatro guardas executáveis no `npm run check`

**Pouparia ao menos 24 versões.** Seção 12 (o que o check confere) mais seção 3, seção 8, TIP-1,
EST-2 e ACE-1.

Vale para o padrão P1 inteiro. As quatro regras já estão escritas e corretas; o que falta é medição.
Todas as quatro são estáticas e cabem no check de hoje:

1. Lista de nomes proibidos no `data.ts` (plataformas de mídia, CRMs, bancos, operadoras), com a
   mensagem apontando a seção 3. É a guarda mais barata e a que mais reprovou.
2. Recusa de número literal ou de expressão numérica interpolada em JSX que não passe por um
   formatador de `@/lib/format`. A TIP-1 já promete essa verificação; basta cumpri-la.
3. Recusa da string "indisponível" escrita à mão, obrigando `formatUnavailable()`.
4. Medição do comprimento da frase de `aria-label` sob o dado padrão, com erro acima de 250 e aviso
   a partir de 235, porque a frase cresce com o recorte.

O ganho não é só de conformidade. Enquanto o check sai `0 com erro` sobre uma versão que viola o
contrato, o produtor aprende que o check é a régua, e a revisão vira a única barreira.

### E2. Piso de espessura de barra e fórmula de passo declarada

**Pouparia ao menos 10 versões, e toda família de barra ainda por produzir.** Emenda à ESP-2 (17.7).

A ESP-2 ganha um piso ao lado do teto: espessura efetiva de marca de no mínimo 12 px em cartão, e
nunca menor que a altura do texto mais 2 px quando houver rótulo dentro da marca. Junto, a regra de
que a constante de passo (`ROW_STEP`, ou altura por categoria) seja derivada e comentada, com a
observação de que o Recharts desconta o `barCategoryGap` dos dois lados da banda antes de dividir
pelas séries, o que faz `maxBarSize` quase nunca valer. Sem o piso, a constante declarada no topo do
arquivo descreve uma intenção, não o desenho.

Isso alcança daqui para a frente as famílias 03 (colunas), 07 (rosca e radial não, mas 10 funil sim),
19 (cascata), 22 (waffle) e 26 (marimekko), que herdam o mesmo cálculo de banda.

### E3. Ancoragem do rótulo de valor e halo obrigatório em cruzamento

**Pouparia ao menos 10 versões, com 6 reprovações evitadas.** Emenda à ROT-2 e à ROT-7 (17.4).

Texto proposto, em duas frases: o rótulo de valor ancora sempre na **ponta livre** da marca, o que em
Recharts significa `x + width` para a barra horizontal, e nunca em `x` do `Rectangle`, que é a base
(zero) mesmo com valor negativo ou eixo revertido; quando dois rótulos de séries vizinhas podem se
aproximar, a versão declara o respiro mínimo em constante nomeada e aplica o halo da ROT-7, que é
obrigatório e não opcional em qualquer rótulo que possa cruzar marca ou linha.

É a emenda com melhor razão entre esforço e reprovação evitada: quatro versões de um mesmo modelo
caíram juntas duas rodadas seguidas pela mesma armadilha, que uma frase no contrato teria fechado.

### E4. O que acontece quando o rótulo de segmento não cabe

**Pouparia ao menos 8 versões, e toda a produção de composição.** Emenda à 17.2 (isenção) e à ROT-4.

A isenção que autoriza `--line-strong` e `--seq-1` a `--seq-3` é o valor escrito na marca ou junto
dela. Falta dizer o óbvio: **quando o rótulo é suprimido porque não cabe, a isenção cai junto**. A
emenda fecha o circuito com três saídas explícitas, em ordem de preferência: levar o valor para uma
legenda com valor (ROT-5) ou coluna à direita; trocar a cor da marca por uma que passe 3:1 sozinha;
ou agregar o segmento. E fixa que nenhuma composição publica marca sem valor legível em algum lugar
da tela, o que a DIC-1 já implica ao proibir o essencial só na dica, sem nunca ter dito para este
caso.

### E5. `--line-strong` com um papel só, e amostra de legenda sem isenção

**Pouparia ao menos 9 versões.** Emenda à 17.2 e à tabela de tokens de estrutura da seção 7.

Duas correções de redação. A primeira resolve o contrato contra si mesmo: a seção 7 e a tabela 17.2
precisam dizer a mesma coisa sobre `--line-strong`, e o candidato natural é reservá-lo a **neutro de
dado** e mandar toda referência (meta, teto, média) para `--text-muted` tracejado, que é o que a
17.2 já diz e o que `01/03 v3` fez por necessidade de contraste. A segunda é uma cláusula nova:
**amostra de legenda nunca usa token cuja legibilidade dependa da isenção do valor escrito**, porque
amostra de legenda não tem valor ao lado por definição. As três ocorrências medidas vão de 1,14:1 a
1,83:1.

Enquanto as propostas P1 e P7 da 17.11 não virarem token, a emenda não resolve o problema de fundo,
mas impede que ele se espalhe por decisão caso a caso.

### E6. Número de prosa vem de constante, e o `meta.json` é conferido contra a tela

**Pouparia ao menos 14 ocorrências de texto.** Emenda à seção 4 (`meta.json`) e à seção 14 (READMEs).

Duas regras curtas. Primeira: todo número que a Anatomia ou o "Como colar no Farol" citam sobre o
desenho (vão, altura, faixa, limiar) é citado **pelo nome da constante** do `Chart.tsx`, não pelo
valor, ou então não é citado. Segunda: `useCase`, `demonstrates` e `notes` afirmam só o que está na
tela do preview, e a conferência de cada afirmação contra o PNG entra como item explícito do
CHECKLIST_REVISAO.md. Dez das catorze ocorrências são de um `meta.json` que promete uma peça que a
versão não tem, o que é exatamente o tipo de erro que só a leitura lado a lado pega.

### E7. Cada versão declara os estados que o preview prova

**Pouparia ao menos 10 versões.** Emenda à seção 3 (dado fixo) e à EST-1.

A seção 3 pede dado que exercite o visual e não define o que é exercitar. A emenda torna isso
verificável sem exigir dado difícil de toda versão: o modelo declara, no README, a matriz de estados
(cheio, vazio, indisponível, zero medido, amostra pequena, parcial) e **qual versão prova cada um**,
e nenhum estado tratado no código do modelo fica sem uma versão que o fotografe. A divisão de
trabalho que os modelos já praticam continua legítima; o que muda é que ela passa a ser declarada e
conferível, em vez de ficar escondida nas `notes`.

A mesma emenda cobre o caso mais grave desta rodada, que é diferente de falta de foto: `01/07 v3`
quebra em tempo de execução com lista vazia. Se o estado vazio precisa de prova, ele precisa antes de
existir.

### E8. Presets de canvas revistos, e desvio declarado deixa de ser desvio

**Pouparia ao menos 8 versões.** Emenda à tabela de presets da seção 4.

Os sete presets não cobrem o cartão de KPI alto com régua (algo perto de 400 x 330), a tira larga de
quatro peças (perto de 1120 x 320) nem o ranking muito longo (640 x 940). A emenda tem duas partes:
acrescentar os presets que a produção real pediu, e escrever que o preset sugerido pelo catálogo é
sugestão, de modo que um objeto `{ width, height }` com razão em `notes` deixe de ser tratado como
divergência a registrar. Cabe também a recíproca, que apareceu três vezes no `02/01`: preset maior
que a peça deixa faixa vazia no fim, e o ajuste é para baixo.

---

## O que é ruído de revisão e não vira emenda

Itens legítimos, registrados com razão, que não pedem regra nova. Ou são de uma peça só, ou são
defeito da ferramenta `_render`, ou são julgamento de acabamento que o contrato não deveria
congelar.

**Defeito da ferramenta, não do contrato.** O render acusa diferença acima de 0,5% entre o SVG
sozinho e a página em `01/02 v1` e `02/06 v1`, e nos dois casos a revisão localizou a diferença no
desenho do **texto da moldura compartilhada**, não no Chart. Fica abaixo do limite de falha e é
acusado a cada render. Na mesma conta entra o `useCase` de 122 caracteres do `01/02 v4`, cortado pela
moldura de duas linhas do preview, cujo contorno de hoje é encurtar o texto para caber numa moldura
que deveria crescer. As duas coisas são conserto de `_render`, e o teto de 140 caracteres da seção 4
não é o problema.

**Bug local de uma versão.** O ponto duplo da frase acessível do `01/06 v3` e `v4`, porque a
descrição termina em `p.p.` e o molde acrescenta `. `; a maiúscula no meio da oração em `01/04 v3`;
o `−0,0%` do `01/05 v4` com variação exatamente zero; o `+74%` do `02/08 v2`, que é o
`formatPercentPoints` do Farol imprimindo o sinal de porcentagem sobre pontos percentuais. Este
último é da plataforma e já está registrado como tal em dois modelos; vira pedido ao Farol, não
emenda de contrato.

**Julgamento de acabamento, deliberado e escrito.** A legenda do `01/05 v2` acima dos 30% da ROT-4,
que é a tabela de valores que o catálogo pediu; a ordenação do `02/04 v2` pela fatia da base, que põe
19 perdas acima de 214; o cabeçalho do `02/06 v1` que pinta "queda" e "alta" na cor da polaridade,
redundância e não erro; o percentual impresso duas vezes na mesma linha em `02/03 v3`. Em todos a
revisão apontou e a própria peça já carrega a justificativa.

**Vocabulário e estilo.** "handoff" em inglês no `01/06 v3`, "39 resp." abreviado no `02/08 v3`
contra a ROT-8, o sobrenome inteiro em `01/07 v3` e `v4` fora do padrão de inicial da seção 3. O
terceiro é regra clara e caberia na guarda E1 se a lista de nomes for verificada por forma, mas
sozinho não sustenta emenda.

**Padrão de 3 versões que fica de fora por margem.** O P9 (peso 700 por critério) atinge três
versões, todas na família 02, e é candidato natural a emenda quando a família 03 ou a 17 repetirem o
caso. Por ora, uma frase na TIP-3 resolveria, mas ela disputaria espaço com as oito acima sem o
mesmo alcance.

---

## Pendências conhecidas ainda em aberto

Cinco vêm das seções "Pendências conhecidas" formais, que só dois modelos têm. Três são pendências de
fato, escritas no corpo das observações sem seção própria.

### Formais

1. **`02/07 v1`, `v3` e `v4`: as duas alas da mesma faixa não ficam na mesma linha.** Medido no PNG
   escuro da `v1` em 2026-09-17: os centros das duas marcas da mesma faixa ficam a 16 px um do outro
   (252 e 268, com a faixa rotulada em 260) e cada marca tem 7 px de altura. É o comportamento do
   Recharts para dois `Bar` com `stackId` diferente, que os distribui como duas faixas dentro da
   mesma banda. O item 3 da Anatomia afirma o contrário e precisa ser reescrito quando o desenho for
   revisto. A 4ª rodada declarou o item explicitamente fora de escopo. **É a pendência mais séria da
   lista**, porque o modelo promete uma linha única que não entrega, e porque amarra P2, P6 e a
   própria forma do butterfly.
2. **`02/01 v3`: contagem fora da barra posicionada por estimativa de largura.** O rótulo usa
   `estimateWidth` de 6,6 px por caractere em vez da largura real do texto, então a coluna de
   contagens fica desalinhada entre linhas de nomes de comprimentos diferentes. Corrigir exigiria
   medir o texto renderizado (`getBBox` ou canvas de medição), declarado fora do escopo da rodada.
3. **`02/07 v3` e `v4`: o halo dos rótulos usa `--surface-raised` fixo.** Colado sobre outra
   superfície do Farol que não seja o cartão, o halo aparece como um retângulo de cor errada em volta
   do número. Não há token de "superfície do pai" no contrato para resolver isso na origem. Registrada
   para quem colar decidir caso a caso; é candidata a uma proposta nova na 17.11, ao lado de P1 a P7.
4. **`02/07 v2`: escalas independentes contra o resumo do modelo.** A leitura declara as duas escalas,
   mas o resumo do modelo pede escala comum; como a `v4` é a versão desenhada para grandeza
   divergente, sobra a dúvida de qual é a saída certa da `v2`.
5. **`02/07 v3`: 14 termos acima do teto de cerca de 12 faixas** que o catálogo indica para o modelo.
   O canvas alto segura, e a barra fica fina, o que realimenta o P2.

### De fato, sem seção própria

6. **A ferramenta não tem guarda para marca real no `data.ts`**, escrito como pendência no README do
   `02/03`: "enquanto não houver essa verificação, a conferência é da revisão". É a E1, item 1.
7. **`01/05`, passo 1 do "Como colar no Farol": as alturas sugeridas não comportam os cartões.** A
   `v2` mede cerca de 260 px contra os 256 px de `h-64`, a `v3` cerca de 291 px contra `h-64` e a
   `v4` cerca de 309 px contra os 192 px de `h-48`, e o conteúdo transbordaria a borda do cartão.
   Quem seguir o README ao pé da letra reproduz o defeito.
8. **`01/07 v3` quebra em tempo de execução com lista vazia** (`ranked[0]` para `total()` por asserção
   `as ExecutiveWeekly`). O dado fixo nunca chega lá, então nem o check nem o render acusam, mas é a
   única pendência da rodada que não é de acabamento: é falha de código esperando dado real.

---

_Fim. Nenhum arquivo além deste foi tocado._
