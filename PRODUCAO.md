# Produção do catálogo

Como uma peça nasce, quanto ela custa e qual a divisão de trabalho entre quem produz e quem
revisa. Escrito em 2026-09-25, depois de 347 peças, com número medido e não estimado.

**Quem produz uma peça não lê este arquivo, e desde 2026-09-30 a sessão orquestradora também não.**
Este é o **diário de auditoria** do dono: o que cada rodada mediu, ensinou e derrubou, em ordem
cronológica, com 1.300 linhas. O regime vigente foi destilado para [CLAUDE.md](CLAUDE.md) (regra de
leitura por papel), [PLAN.md](PLAN.md) (a fila, com a Fase 0 de ferramenta e régua) e
[_operacao/ORQUESTRADOR.md](_operacao/ORQUESTRADOR.md) (o protocolo da sessão); os briefings dos
quatro papéis vivem em `.claude/agents/visuais-*.md`, na raiz do repositório, e as decisões em
aberto em [_operacao/DECISOES_PENDENTES.md](_operacao/DECISOES_PENDENTES.md). Fato novo de rodada
continua entrando aqui; regra nova entra no CONTRATO ou no ARMADILHAS, pelo código, nunca aqui.
O produtor lê o dossiê de `npm run dossie`; consulta pontual por código no CONTRATO e no ARMADILHAS.

---

## A escala que falta

| | peças |
|---|---|
| planejadas | 814 |
| em disco | 347 |
| **faltam** | **467** |

O único par de custo medido é a peça `16_distribuicao/05_histograma-comparativo/v1`, produzida por
agente em 2026-09-25: **257.520 tokens e cerca de 34 minutos** para produzir, mais **287.282
tokens** para uma rodada de correção de dois defeitos.

Multiplicando pela ponta baixa, sem correção nenhuma e sem contar a revisão humana: **cerca de 120
milhões de tokens e 265 horas de agente.** Com uma rodada de correção por peça, que foi o que
aconteceu, dobra. Este número é o que justifica mexer no regime; não é ajuste de eficiência, é a
diferença entre o catálogo fechar e não fechar.

---

## Onde o custo está, medido

### Leitura: 260 KB para escrever 10 KB

O que um produtor lê antes da primeira linha de código:

| material | bytes | igual para todas as peças? |
|---|---|---|
| CONTRATO.md | 85 KB | sim |
| README.md da raiz | 22 KB | sim |
| ARMADILHAS.md | 49 KB, índice de 4 KB | índice sim, entradas por família |
| CHECKLIST_REVISAO.md | 8 KB | sim |
| estudo da família, média das 27 | 70 KB | por família |
| catálogo da família, média | 35 KB | por família |

São 260 KB, dos quais 125 KB são idênticos para as 467 peças restantes. A peça que sai tem 8 KB de
`Chart.tsx` e 2 KB de `data.ts`. O estudo da família 16 tem 153 KB e a produção aproveita umas 280
linhas dele: sob o regime de uma peça por agente, treze agentes leriam esse mesmo arquivo treze
vezes.

Leitura é cerca de 65 mil tokens, um quarto do custo da peça.

**Emenda do mesmo dia.** A colheita de notas locais levou o ARMADILHAS.md de 12,8 KB para 49,3 KB, o
que aumenta em cerca de 29% a leitura fixa que eu tinha acabado de apontar como um quarto do custo. A
troca é deliberada e a conta fecha: uma rodada de correção evitada custa 287 mil tokens, muito mais que
o material a mais somado em centenas de peças. Mas ela só fecha **se o arquivo for consultado e não
lido**, e por isso o cabeçalho dele mudou junto: o produtor lê o índice inteiro, que cabe numa tela, e
abre só as entradas que o seu visual pode tocar. Selecionar essas entradas por família é tarefa do
briefing da regra 4, e sem ela esta emenda piora o custo em vez de melhorar.

### Correção: uma rodada custa mais que a leitura inteira

Uma rodada de correção custou 287.282 tokens, contra 65 mil de leitura. **Evitar uma rodada vale
mais que otimizar toda a leitura.** É daqui que sai a ordem de prioridade deste documento, que é
contraintuitiva: guarda automática e autorrevisão vêm antes de economia de leitura.

### Reentrada: 49 modelos abertos pela metade

Em disco há **70 modelos com as quatro versões** e **49 modelos com uma só**. Os 49 são as famílias
06, 08, 09, 11, 12, 15 e 16, que é o que a varredura atual de v1 vem produzindo.

Cada um desses 49 vai exigir, mais tarde, um agente que entra frio e paga de novo a leitura da
família inteira, mais a leitura da v1, mais o README do modelo, para escrever três variações de
algo que já existe. A varredura de v1 não adia trabalho: ela duplica leitura, uma vez por modelo.

### A unidade de custo é a execução de agente

Cinco execuções medidas em 2026-09-25, incluindo as quatro varreduras de auditoria:

| execução | tokens | chamadas | minutos |
|---|---|---|---|
| produzir a 16/05 | 257.520 | 77 | 34 |
| corrigir a 16/05 | 287.282 | 15 | 4 |
| minerar código repetido | 231.684 | 57 | 28 |
| classificar defeitos | 272.465 | 34 | 30 |
| auditar a especificação | 268.856 | 25 | 21 |

O número de chamadas varia por um fator de cinco e o custo não acompanha: fica entre 231 mil e 287
mil tokens em todas, com média perto de 263 mil. O que enche a conta é o volume de material que
entra no contexto, não quantas vezes o agente age.

Daí a consequência que orienta o regime: **uma execução que entrega quatro peças custa
aproximadamente o mesmo que uma que entrega uma.** Cada peça produzida em execução própria paga o
preço cheio de uma execução inteira.

A ressalva honesta: as cinco tiveram instruções que mandavam ler bastante, então parte da constância
pode ser o agente enchendo o contexto até um patamar parecido por conta própria. A implicação prática
não muda.

---

## Cinco descobertas da auditoria de 2026-09-25

Quatro varreduras do acervo, todas com contagem por script e não a olho.

### 1. O aprendizado estava escrito no lugar que ninguém lê

`--surface-overlay` vale `#ffffff` no tema claro, exatamente igual ao `--surface-raised` que é o
fundo do cartão: contraste **1,00:1**, a marca desaparece. E medindo o tema escuro também, onde o
acervo inteiro acha que o problema não existe, ele dá **1,10:1**: a armadilha vale nos dois temas, só
é pior no claro. **Dezoito modelos distintos descobriram isso
por conta própria**, em oito famílias, e cada um escreveu a descoberta no `notes` do próprio
`meta.json` ou no README do próprio modelo. Nenhum desses lugares é lido pelo produtor seguinte. O
fato também está no CONTRATO, enterrado numa nota de rodapé da seção 7, que não é onde se procura.

Dezoito rodadas de descoberta para um fato de duas linhas.

### 2. A especificação do catálogo prescreve armadilha conhecida

**42 das 814 versões planejadas** carregam prescrição que as armadilhas já desmentiram, concentradas
em dois agrupamentos: onze versões pedem `--surface-overlay` como trilho, malha ou lugar vazio, e
quinze pedem o traço que carrega a relação em `--line-strong` ou `--text-muted` com opacidade de
0,15 a 0,4. Medi os dois temas: opaco o `--line-strong` já entrega só 1,79:1 no escuro e 1,83:1 no
claro, e com a opacidade que a spec pede cai para **entre 1,07:1 e 1,25:1**, ou seja a prescrição
pede uma marca invisível para carregar a relação. Passa batido pelo `check` porque a ACE-3 declara
isenção.

Isso já custou duas recusas em cinco modelos produzidos: a `16/02` recusou a caixa opaca no
`ErrorBar` e a `16/05` recusou as duas barras sobrepostas. Recusa certa, e caríssima: o agente gasta
contexto descobrindo o conflito, decidindo e justificando, uma vez por peça que herda a prescrição.

### 3. Só um terço dos defeitos é mecanizável, e um terço nunca será

Das 52 classes de defeito que o acervo registra: **16 mecânicas** (dá para medir no SVG ou no AST),
**11 heurísticas** (dá para avisar, com falso positivo aceitável), **10 de autorrevisão** (o próprio
produtor pega olhando o PNG que ele mesmo gerou, se a pergunta estiver escrita) e **15 humanas**.

As 15 humanas são a justificativa de manter revisão humana no fluxo, e o número diz o tamanho certo
dela: a revisão não sai, a fila dela encurta de 52 para 15.

### 4. O acervo aprovado já mente em pontos localizados

Achados de graça pelas varreduras, em peças com `check` verde:

- `13_progresso-meta-e-gauge/01_barra-de-progresso-linear/v3` imprime "mediana da equipe 0%" quando
  ninguém tem cota, porque a guarda testa `data.length` e a mediana é calculada sobre `withQuota`.
  Zero medido no lugar de ausência, que é exatamente o que a EST-2 proíbe.
- Sete peças imprimem `−0%`, porque o ternário do sinal manda o zero para o ramo negativo. Outras
  duas imprimem `+0%` e três imprimem `0%`: cinco respostas para a mesma pergunta.
- Vinte e quatro peças declaram `HALO` sem `strokeLinejoin`, o que é defeito e não variante.
- Doze de quinze implementações de mediana devolvem `0` para lista vazia. A convenção de quartil,
  por outro lado, está certa e consistente nas quinze: interpolação linear sobre `(n − 1) · p`.

### 5. A biblioteca compartilhada é prevenção, não economia

Extrair tudo o que se repete no acervo economiza cerca de **3.100 linhas, 5,1% do código**. Não é
alavanca de custo. O valor dela é outro: os 24 `HALO` quebrados, os sete `−0%` e as doze medianas
que mentem no vazio são todos o mesmo defeito copiado, e biblioteca conserta os três num lugar.

Dois cuidados medidos. Nem tudo que parece igual é: `niceCeiling` carrega cinco contratos
incompatíveis, dois deles com assinatura idêntica, e as peças polares usam duas convenções de ângulo
que, unificadas sob um nome só, girariam as radiais em 90 graus. E a biblioteca só pode morar em
`app/src/`, porque `@/` é o único especificador que significa a mesma coisa no render, no typecheck
e no app; caminho relativo dentro de VISUAIS funciona no render e morre quando a peça é colada.

---

## A colheita das notas locais

Varredura de 2026-09-25 sobre 176 campos `notes` preenchidos, 1.779 comentários de `Chart.tsx` e
1.308 itens de "Observações da revisão" em 116 READMEs: **3.263 notas locais examinadas, 34 fatos
promovidos** ao ARMADILHAS.md, 65 descartados por valerem só para a peça onde nasceram.

O caso do `--surface-overlay`, com 18 modelos, não era o maior. Os dois maiores:

- **33 modelos** tropeçaram no `ifOverflow` padrão `discard` do Recharts, que faz a linha de meta
  desaparecer exatamente no período em que a meta é passada. O defeito se esconde no único momento em
  que a peça tinha boa notícia para dar.
- **31 modelos** descobriram que nenhum preset de canvas fecha o cartão depois que ele ganha as linhas
  escritas que o contrato exige.

E a varredura achou **27 peças com defeito vivo**, todas com `check` verde. As que pesam: a rosa de
Nightingale de `07/07` desenha 33% de área para 20% de valor, em três versões e na entrada do
catálogo; `11/05 v1` declara 412 repasses e soma 338; `15/02 v1` tem o comentário do `Chart.tsx` e o
README afirmando coisas opostas sobre o mesmo dado.

### A generalização que vale mais que as 34 entradas

O `--surface-overlay` foi redescoberto 18 vezes porque **o CONTRATO mandava usá-lo**. A tabela de
tokens da linha 253 listava "trilho de barra" entre os usos legítimos, e a nota da linha 255, duas
linhas abaixo, dizia o contrário: trilho usa `--line-subtle` ou `--surface-sunken`. Quem produz vai à
tabela escolher a cor de um trilho, encontra a resposta sancionada e não chega à nota. Os dezoito
obedeceram.

Corrigido em 2026-09-25. Fica a regra: **fato redescoberto por muitos modelos acusa a especificação,
não quem produz.** Antes de escrever a armadilha, procure quem autorizou o erro. Uma contradição na
fonte custa uma rodada por peça que a herda, e nenhuma quantidade de memória de produção compensa
uma tabela que prescreve o defeito.

---

## O regime

Ordenado por retorno medido, não por ordem natural. Como uma rodada de correção custa mais que a
leitura inteira de uma peça, o que evita rodada vem primeiro.

### 1. O produtor revisa o próprio PNG antes de entregar

As dez classes de autorrevisão viram perguntas escritas, e quem produz responde cada uma contra o
preview que ele mesmo acabou de gerar. Custo: uma linha de instrução por pergunta. Evidência de que
funciona: na `16/05` o agente pegou dois defeitos sozinho olhando o próprio PNG, e escreveu duas
armadilhas novas no caminho.

A primeira pergunta da lista, que resolve a classe mais cara de defeito: *tape a legenda com a mão;
a anotação, sozinha, diz qual número é de qual grupo, e cita os grupos na mesma ordem em que a
legenda os lista?*

### 2. Defeito mecanizável vira guarda, não vira aviso no chat

Toda vez que um defeito aparecer duas vezes, a pergunta é se ele é medível. Se for, ele sai da fila
da revisão humana para sempre. Guardas priorizadas, com o limiar já especificado:

| guarda | peso | mede |
|---|---|---|
| `CONTRASTE-MARCA` | erro contra superfície, aviso entre marcas | 3:1 da ACE-5, com o traço mais grosso contando como fundo |
| `PESO-DESTAQUE` | aviso | mais de dois textos em peso 700, a TIP-3 |
| `TRANSBORDO-TINTA` | erro fora da raiz, aviso fora do SVG aninhado | tinta além da caixa, 1 px |
| `ID-ACENTUADO` | erro | identificador com acento, pelo AST |
| `LEGENDA-DIRECAO-DE-COR` | aviso | léxico "mais escura" e "clareia", que invertem entre temas |

### 3. A unidade de trabalho é o modelo, não a versão

Um agente por modelo. Ele produz a v1, eu reviso a v1 sozinha, e o **mesmo** agente, com o contexto
intacto, produz a v2 a v4. A leitura de 260 KB é paga uma vez para quatro peças em vez de quatro
vezes, e o modelo nunca fica aberto pela metade esperando uma reentrada fria.

O portão de qualidade não muda: a v1 continua revisada individualmente, que é onde a qualidade
nasce. A revisão da v2 a v4 é de conjunto, e é mais barata justamente porque são variações de uma v1
que acabou de ser aprovada.

### 4. Briefing por família, escrito uma vez

Antes da primeira peça de uma família, um agente destila o estudo dela num briefing de uns 15 KB:
as regras da família, as armadilhas que se aplicam, o preset de canvas, os formatadores disponíveis
e **o intervalo de linhas do estudo que cada modelo precisa ler**. O briefing não substitui o
estudo, ele indexa: o produtor lê 280 linhas dirigidas em vez de garimpar 2.000.

### 5. Aprendizado vai para o ARMADILHAS.md no mesmo turno em que aparece

Nota local no `meta.json` ou no README serve para desvio específico daquela peça. Fato que vale para
qualquer peça futura vai para o [ARMADILHAS.md](ARMADILHAS.md), imediatamente, com sintoma primeiro.
A regra existe porque a alternativa está medida: dezoito redescobertas do mesmo fato.

### 6. Especificação consertada antes de produzir a família

Prescrição do catálogo de estudo que bate contra armadilha conhecida é consertada na fonte, antes de
qualquer agente herdar o conflito. São 42 versões identificadas, concentradas em dois agrupamentos de
token.

---

## Pré-requisitos travados

- **O `sourceHash` precisa carimbar a biblioteca antes de qualquer peça depender dela.** Hoje ele
  hasheia `RENDERER_VERSION`, `Chart.tsx`, `data.ts` e `meta.json`, e nada mais. **Correção do que
  escrevi antes:** a biblioteca não cria esse ponto cego, ela o alarga. Toda peça já importa de
  `@/lib/format` e de `chartTheme.ts`, que também não entram no carimbo, então mexer num formatador
  hoje já envelhece previews em silêncio. O carimbo novo tem de cobrir os três, e entra como atributo
  separado no modelo do `tokensHash`, nunca dentro do `sourceHash`: misturado, invalidaria os 347
  previews de uma vez. Depois da extração,
  consertar a biblioteca mudaria o desenho de centenas de peças sem mudar hash nenhum: os previews
  envelheceriam em silêncio e o `check` diria que estão em dia. O precedente de como fazer está no
  mesmo arquivo, no `tokensHash`, que existe exatamente para isso.
- **A biblioteca exige escrever em `app/src/`**, que hoje é somente leitura para agente. `withSign`
  em `@/lib/format` e `HALO` em `chartTheme.ts` não mexem no build; módulo novo exige entrada no
  `contract.mjs` e na seção 6 do CONTRATO.
- **A guarda `CONTRASTE-MARCA` sem estreitamento acusa 153 das 344 peças.** Isso não é bug da
  guarda: é a prova de que os oito categóricos foram calibrados contra o fundo do cartão e nunca uns
  contra os outros. O melhor par contra `--chart-1` dá 1,30. Guarda que reprova o acervo existente é
  decisão de dono, não de quem implementa.

---

## Fila de veredito, zerada em 2026-09-28

Zero peças esperando julgamento. As 347 versões em disco estão em **340 aprovadas** e **7 reprovadas
com defeito nomeado**. O contador antigo de 332 era chute meu e estava errado nos dois sentidos; o
número agora sai do levantamento, não da minha memória.

A fila só zerou depois de eu descobrir que **18 aceites meus nunca tinham sido gravados**, o que está
contado na seção final deste documento. Enquanto o veredito vivia na conversa, o levantamento mostrava
29 pendências e eu relatava 12.

## Fila de conserto, sete peças

Todas com a nota de recusa gravada em `_render/.qa/revisao/`, que é o insumo de quem for consertar.

- **`15_mapa-de-calor-e-calendario/04`** (`DAD-9`): o dado termina em 14/09 e só a frase acessível
  declara o recorte; o título e o número em destaque falam do ano inteiro.
- **`15_mapa-de-calor-e-calendario/06`** (`TOK-7`): a faixa mais frequente do desenho mede 1,92:1
  contra o fundo no claro e 2,29:1 no escuro, porque usa degrau do meio de rampa sequencial como cor
  categórica.
- **`15_mapa-de-calor-e-calendario/08`** (`GEO-13`): compara seis medidas e nomeia cinco.
- **`16_distribuicao/02`** (`GEO-12` e `DAD-10`): ordem por mediana não declarada, e o comentário
  promete um rótulo que o desenho não desenha.
- **`16_distribuicao/03`** (`GEO-12`): ordem por mediana não declarada, e aqui a mediana também não
  está escrita, então o leitor não tem como deduzir.
- **`16_distribuicao/04`**: o rótulo nasce na altura exata da linha guia que passa pelo mesmo ponto.
- **`09_dispersao-e-bolhas/11`** (`TIP-7`): nome de categoria cortado no cabeçalho do painel, e os
  onze pontos de cada um dos oito painéis caem quase numa reta, ou seja a dispersão não dispersa.

**Fechados em 2026-09-28:** as seis instâncias restantes da mediana que nasce zero, as quatro versões
da rosa de Nightingale mais a entrada do estudo, e as duas recusas do lote anterior. A rosa rendeu o
melhor achado do dia: a fórmula velha **já tinha `Math.sqrt`**, mas por dentro do piso de raio, e como
a área de um setor de anel vale `r² − rMin²` a meia correção continua exagerando o pequeno. É pior que
o raio linear, porque tem raiz quadrada escrita no código e passa por conserto feito.

## As guardas, e a fila de dívida que elas abriram (2026-09-28)

O `check` foi de 8 para **12 guardas** (corrigido em 2026-09-28: o `NFD` que eu contava não é
guarda, é `String.normalize` dentro de dois ajudantes que tiram acento): `AGREGACAO-ZERO`, `CONTRASTE-MARCA`, `REGUA-CONSTANTE` e
`FORMATO-ACESSIVEL`. O `selftest` ganhou 18 provas, uma que acusa e uma que passa por guarda, mais os
quatro comportamentos da fila. Acervo depois delas: **347 versões, zero com erro**.

**O mecanismo é o achado.** Guarda nova não pode quebrar o acervo de uma vez, e as duas saídas óbvias
falham: aviso puro não barra peça nova, então a dívida cresce para sempre; lista de exceções anistia a
peça inteira. O que foi implementado é uma **fila de dívida com contagem**, em
`_render/scripts/lib/divida-guardas.json`:

- peça fora do registro que viola: **erro**, o `check` falha, peça nova é barrada;
- peça no registro: **aviso** dizendo que ela está na fila, a produção não para;
- dívida que **cresce** (registrada com 2, passa a 5): volta a ser erro, senão o registro vira anistia;
- dívida **quitada**: aviso pedindo a remoção da **chave quitada**, e é assim que a fila encurta à
  vista de quem roda o `check` em vez de virar arquivo que ninguém lê.

**Emenda de 2026-09-28, e ela corrigiu o que eu tinha escrito aqui.** A regra dizia "remova a
linha". Está errado quando a peça deve a mais de uma guarda: apagar a linha inteira porque a
`CONTRASTE-MARCA` foi quitada anistiaria de graça a `AGREGACAO-ZERO` que continua lá. O certo é
**remover a chave; a linha só desaparece quando a peça não deve mais nada**. Foi o que aconteceu no
conserto das cegueiras da `CONTRASTE-MARCA`: a `01_cards-e-kpis/03_kpi-com-regua-de-meta/v3` saiu
inteira porque só devia aquilo, e as duas de `12_hierarquia` perderam a chave e ficaram devendo
`AGREGACAO-ZERO`. O invariante de encurtar continua valendo; o que não vale é encurtar por fora.

O invariante que isso compra é o único que importa: **o número de linhas do arquivo só pode cair**. E
ele é declaradamente diferente do escape `// check-ok:`, que diz "isto é legítimo"; a fila diz "isto
está errado e ainda não foi consertado".

**A fila nasceu com 72 peças**, em 86 ocorrências: `AGREGACAO-ZERO` 48, `CONTRASTE-MARCA` 34,
`FORMATO-ACESSIVEL` 3, `REGUA-CONSTANTE` 1. As duas dívidas grandes se concentram em
`14_tabelas-visuais` e `13_progresso-meta-e-gauge`.

**Ponto cego declarado, e é elegante que esteja escrito:** no tema claro `--surface-overlay` e
`--surface-raised` são o mesmo `#ffffff`, então ali a `CONTRASTE-MARCA` não consegue separar a marca
do revestimento legítimo e se cala. Nada escapa, porque no escuro os dois tokens diferem e a peça é
acusada. O tema em que o defeito é pior é o tema em que a cor não o denuncia.

**Uma guarda foi recusada por quem a estudou, com razão.** A metade da `DAD-9` sobre qualificador de
período não vira guarda automática: a frase acessível é legitimamente mais longa e mais conclusiva que
o corpo, porque a `ACE-1` pede que ela conclua, então acusar a presença de "no ano" ou "no trimestre"
reprovaria a escrita correta na maior parte do acervo. Ficou registrado no cabeçalho da
`FORMATO-ACESSIVEL` para ninguém tentar de novo sem medir. A metade que entrou é a de formato, que tem
prova estrutural: o mesmo número não pode ter dois formatos.

**A `REGUA-CONSTANTE` nasceu como regra de regressão e achou instância viva.** As duas peças que a
`ROT-5b` cita já estavam consertadas, e a guarda encontrou uma terceira que a varredura humana não
alcançou: `09_dispersao-e-bolhas/03_bolhas/v1`, com a legenda de tamanho em constante enquanto a escala
da bolha vem do dado. Mesma família, mesmo defeito, terceira descoberta independente.

## A numeração do ARMADILHAS.md, paga em 2026-09-28

Havia duas numerações concorrentes de "armadilha N" no projeto, uma em `_estudo/00_acabamento.md` e
outra no `ARMADILHAS.md`, e as citações não diziam de qual arquivo. Pior: a numeração era posicional,
então inserir um fato no meio deslocava tudo abaixo e quebrava quem já tinha citado. Foi assim que um
briefing de família herdou a contagem velha, chamou uma entrada pelo número de outra e deixou uma
armadilha inteira de fora.

O conserto foi feito: cada entrada do `ARMADILHAS.md` ganhou **código estável por seção**, no idioma
que o `CONTRATO.md` já usa com `TIP-3` e `ACE-5`. São `REC-1` a `REC-29`, `GEO-1` a `GEO-13`, `TOK-1`
a `TOK-7` e `DAD-1` a `DAD-10`. O código nunca é reatribuído: entrada nova pega o próximo número livre
da seção, entrada removida deixa o código vago. O índice passou a ser **gerado do corpo por script**,
que é o que mata a classe de erro na raiz: a contagem do cabeçalho e a lista do índice não podem mais
divergir do arquivo por descuido meu.

As quatro citações numéricas que existiam no `16_distribuicao/BRIEFING.md` foram convertidas no mesmo
turno: 6 virou `REC-6`, 27 virou `REC-27`, 39 virou `TOK-1` e 43 virou `TOK-5`. As citações da família
13 não precisaram de nada, porque já diziam "armadilha 19 **do acabamento**" e apontavam para o outro
arquivo sem ambiguidade.

## O regime de revisão mudou em 2026-09-28, e o motivo foi custo de contexto

Até hoje eu revisava carregando os PNGs dos dois temas na minha própria janela. Numa sessão só isso
significou cerca de cinquenta imagens em resolução cheia, e foi o que encheu a sessão: os relatórios
de agente e a edição de documento são uma fração disso. O dono cobrou, com razão.

**O erro era de interpretação minha.** Estava escrito aqui que a revisão continua humana, e eu traduzi
isso como "as imagens vêm para a minha janela". O que precisa ser meu é **o veredito**, não a leitura
dos pixels. Existe no projeto um agente `revisor-visuais-dados` feito exatamente para isto: ele vê o
render, lê o código que o produziu e devolve achados com evidência, sem nunca editar nada.

**O novo desenho, em três regras.**

1. A revisão visual vai para o agente revisor, que carrega as imagens na janela dele. Eu leio o
   parecer, decido e carimbo. Abro PNG por amostragem, ou quando o parecer me deixar em dúvida.
2. Agente entrega **resumo curto e escreve o detalhe em `validation/`**. Trinta linhas para mim, o
   resto em arquivo. Os relatórios de hoje foram bons e vieram inteiros para a janela sem precisar.
3. **Um agente por vez.** O paralelismo não foi o que gastou contexto, mas o ganho dele não paga a
   perda de controle.

**A delegação foi testada antes de virar regra, e o teste tinha controle.** Mandei treze peças ao
revisor: as onze recém consertadas e **duas que eu já tinha julgado, sem dizer o veredito e com
instrução explícita de não ler a minha nota antes de formar opinião**. Resultado: numa das duas
convergimos, inclusive na mesma dúvida e no mesmo número medido sem combinar, 5,45:1 de pior par de
texto sobre célula. Na outra divergimos, e **ele estava certo**.

Eu tinha aprovado `15_mapa-de-calor-e-calendario/03` como exemplar. Ele mandou voltar por causa do
trilho da microbarra de leads, em `bg-surface-overlay`. Conferi no código: linha 123, `rounded-full`
com altura fixa, ou seja um trilho, 1,00:1 contra o cartão no tema claro. É a instância exata do
defeito que eu persegui em 18 modelos e cuja regra eu mesmo escrevi no CONTRATO. Olhei a célula do
heatmap e não olhei a coluna lateral.

A lição é sobre o meu olho, não sobre o dele: **um segundo par de olhos com evidência numérica pega o
que a minha varredura não pega**, e o custo dele é uma janela que não é a minha.

## Varredura incompleta: a minha mexeu no código e deixou 15 READMEs mentindo

**Emenda de 2026-09-29 à seção seguinte, e ela custou um erro meu no mesmo dia.** A varredura de
`--surface-overlay` trocou o token em **39 ocorrências de código** e não tocou nos READMEs que descrevem
essas linhas. Medido depois: **15 READMEs de modelo citavam `--surface-overlay` em modelos cujo
`Chart.tsx` já não o usava.** E a consequência não é cosmética: eu afirmei a um produtor que uma peça
desenhava `bg-surface-overlay`, ele leu o arquivo, era `bg-surface-sunken`, e a origem do meu engano foi
ter lido o README em vez do código. **README defasado é pior que README ausente**, porque é o que o
próximo agente lê como referência e ele não tem motivo para desconfiar.

Então a receita da varredura por eixo do defeito ganha um quarto passo, e ele não é opcional: emenda na
especificação, guarda no `check`, varredura pelo eixo, **e conciliação da documentação que descreve as
linhas tocadas**. O quarto passo é barato e tem uma propriedade que o torna seguro: **README não entra no
carimbo do preview**, então conciliá-lo não faz peça nenhuma perder o veredito.

E há um cuidado de julgamento que a pressa atropela: a menção defasada e a **nota histórica** parecem
iguais. "A peça usa `--surface-overlay`" é defasagem e se corrige; "a peça usava `--surface-overlay` e
foi corrigida em tal data" é rastro e **não se apaga**. Em dúvida, prefira tratar como rastro, porque
perder histórico é pior que carregar uma nota a mais.

**Três achados da conciliação que mudam o método, e nenhum era previsto.**

**O README de família é multiplicador de defeito.** O de `07_rosca-e-radial` ensinava `--surface-overlay`
como receita de trilho, e **os modelos 02, 04 e 05 copiaram dele**. Defeito em README de modelo custa um
modelo; em README de família, custa a família inteira, e o custo chega **antes** do produtor, porque é dali
que ele copia. Conciliação documental, portanto, começa pelos READMEs de família e desce, nunca o inverso.

**O eixo maior da defasagem não era README contra código, era README contra catálogo.** Quatro arquivos
cobravam uma emenda do CONTRATO que **a própria varredura já tinha feito**, isto é pediam conserto
executado. Isso não aparece comparando README com `Chart.tsx`; só aparece comparando a **pendência escrita**
com o estado atual da regra que ela invoca. É uma varredura diferente e ainda não foi feita por inteiro.

**E o meu teste de detecção tinha falso negativo de mecanismo, não de sorte.** Eu buscava "o código do
modelo contém o token em algum lugar"; uma peça que usa `bg-surface-overlay/60` legitimamente num cabeçalho
**passa** nesse teste enquanto o trilho que o README descreve já mudou de token. O critério certo é por
**linha descrita**, não por arquivo, e por isso a minha lista de 15 não era exaustiva sob o próprio
critério: a conciliação achou 4 além dela. Limite declarado do método, que vale para qualquer varredura
futura: **`grep` no arquivo da versão não refuta token que entra por primitiva compartilhada** (`AXIS_PROPS`,
`ChartTooltip`, grade), então a conclusão só vale para token escrito no arquivo da própria peça.

---

## Defeito de token se varre por token

O parecer trouxe um achado que vale mais que os onze consertos: **seis das treze peças tinham marca ou
texto abaixo do piso só no tema claro, e cinco pela mesma causa.** A razão de terem escapado está no
método, e é geral:

> Quando o defeito mora num **token**, varrer **versão por versão** não o elimina. A peça em que o
> defeito está não é a peça em que se está olhando, então ele reaparece indefinidamente, uma
> redescoberta por vez.

Medido depois do parecer: **78 ocorrências de `surface-overlay` em 61 arquivos**, das quais pelo menos
25 parecem trilho ou faixa. Quatro versões de `07_rosca-e-radial/04_barra-radial` declaram
`const TRACK_FILL = 'var(--surface-overlay)'`, com a palavra *track* no nome da constante apontando
para o token cuja regra diz "nunca trilho". Nenhuma varredura por peça ia fechar isso.

**A regra que fica:** fato que se repete em muitos modelos vira três coisas, não uma. Emenda na
especificação, para o próximo não errar; guarda no `check`, para o erro não passar; e **varredura pelo
eixo do defeito**, que quase nunca é a peça. Faltava a terceira.

## O que continua humano, e por quê

Quinze das 52 classes de defeito não são mecanizáveis nem pegáveis por autorrevisão. O exemplo que
fundamenta: na `16/05` a anotação dizia "mediana 39 contra 73 dias" sem nomear os grupos, em ordem
que contradizia a legenda logo acima. A ligação entre número e grupo **não existe no SVG**, a legenda
é `foreignObject`, onde as guardas declaram não haver posição, e as duas ordens em conflito eram
ambas deliberadas: a anotação ordenava por geometria e a legenda por papel. Nenhuma medida separa
isso de um desenho certo.

É por isso que a revisão humana do render fica. O que muda é a fila dela.

## Observação sobre o rastro de defeito

O histórico do git **não** carrega o rastro de conserto do catálogo: as 347 peças entraram num único
commit de importação com 2.237 arquivos, e `git log` na pasta devolve um commit. Todo o rastro de
defeito vive nas seções "Correção de `<data>`" dos READMEs de modelo. Se esse rastro importar,
commit por modelo passa a ser a granularidade certa; enquanto não for, o README é a fonte e vale
tratá-lo como tal.

---

## Decisões tomadas em 2026-09-25

O dono respondeu as quatro. Ficam registradas como regime, não como histórico.

1. **Produção por modelo completo.** Um agente por modelo, a v1 revisada sozinha e o mesmo agente
   seguindo para v2 a v4 com o contexto intacto. Consequência que eu assumi sem perguntar de novo,
   porque decorre da decisão: os **49 modelos hoje abertos com uma versão só** passam a ser fila de
   fechamento, e eles vêm antes de modelo novo dentro da mesma família. O motivo é de revisão e não de
   produção: a v1 deles está fresca na minha leitura agora, e revisar as variações de uma v1 recém
   aprovada custa menos que revisar as de uma v1 de três semanas atrás.
2. **Guarda vale para peça nova; acervo existente entra como pendência conhecida.** Nenhuma guarda nova
   reprova retroativamente. Quando uma guarda acusa peça já aprovada, o caso é registrado em
   "Pendências conhecidas" do README do modelo, e resolve quando a peça for colada numa página.
3. **Escrita em `app/src/` autorizada** para a biblioteca compartilhada, com o `sourceHash` emendado
   antes de qualquer peça passar a depender dela. O carimbo da biblioteca entra como **atributo
   separado**, no modelo do `tokensHash`, e não dentro do `sourceHash`: misturado, ele invalidaria o
   carimbo dos 347 previews de uma vez e o `check` reprovaria o acervo inteiro por preview
   desatualizado.
4. **Dos 27 defeitos vivos, consertar agora só os que mentem sobre número.** São 13 peças em 8 famílias,
   em três classes: a do zero e do sinal (zero medido virando ausência, saldo zero pintado de ganho,
   `−0%`), a de escala e apagamento (legenda que para antes do maior valor, denominador zero apagando o
   realizado, categoria descartada em silêncio) e a geometria da rosa de Nightingale, que desenha 33% de
   área para 20% de valor e é a única que exige refazer fórmula. O resto dos 27 fica registrado como
   pendência: contraste, espessura, truncamento e redundância de unidade não mentem sobre quantidade.

Duas coisas que a decisão 4 não cobriu e que eu separei em vez de decidir sozinho: `01/07 v3` e `v4`
usam nome fictício com sobrenome inteiro, fora do padrão de inicial que existe para nome inventado nunca
colidir com pessoa real, o que é regra de segurança e não de número; e `15/02 v1` tem comentário do
`Chart.tsx` e README afirmando coisas opostas sobre o mesmo dado.

---

## O enunciado das quatro, com as opções que estavam na mesa

Mantido porque registra o que foi pesado, e porque os números de cada opção continuam valendo.

1. **Modelo completo contra varredura de v1.** Modelo completo é mais barato e fecha o modelo; a
   varredura de v1 dá cobertura de catálogo mais cedo. São 49 modelos abertos hoje. O Farol já tem
   127 v1 em disco para trabalhar, o que enfraquece o argumento da cobertura.
2. **Guarda que reprova acervo aprovado.** A `CONTRASTE-MARCA` estreitada reprova de 23 a 35 peças; a
   `PESO-DESTAQUE` reprova 12. Consertar agora, registrar como pendência conhecida, ou deixar a
   guarda só para peça nova.
3. **Autorizar escrita em `app/src/`** para a biblioteca compartilhada existir.
4. **As 27 peças com defeito vivo.** Todas com `check` verde e veredito de aprovada. Vão de conserto
   trivial, como os 24 `HALO` sem `strokeLinejoin`, a peça que precisa ser redesenhada, como a rosa de
   Nightingale que desenha 33% de área para 20% de valor. Consertar em lote agora, consertar só as que
   mentem sobre número, ou carregar como pendência conhecida até a peça ser colada numa página.

## Aceite dito na conversa não existe

Em 2026-09-28, conferindo a fila de veredito, achei 29 peças pendentes quando eu contava 12. A
diferença não era de contagem: eu tinha aceitado 18 peças na conversa e nunca rodado
`npm run revisao`. O veredito vive em `_render/.qa/revisao/<familia>__<modelo>.json`, carimbado com
o sha1 de `Chart.tsx`, `data.ts` e `meta.json`. Sem esse carimbo, nada aconteceu: a peça continua
`sem_revisao` no levantamento, e quem retomar a fila vai revisar de novo o que eu já tinha revisado.

**A regra:** o veredito é o comando, não a frase. Toda peça que eu aceito ou recuso vira
`npm run revisao -- <caminho> aprovado|reprovado "nota"` na mesma rodada em que eu olho o PNG. A
recusa exige nota, e a nota é o que a fila de conserto lê depois; foi assim que as duas decisões do
lote 3 (a legenda de `09/04/v1` que para em 30 com máximo 32, e o `truncate` da linha de leitura de
`06_pizza/01/v1`) saíram da minha cabeça e entraram no levantamento.

Vale a recíproca, e é o motivo de a regra ser sobre a ferramenta e não sobre disciplina: a peça
consertada **perde** o veredito antigo sozinha, porque o sha1 muda. Aprovar e depois consertar sem
reaprovar deixa a peça pendente, o que está certo. O defeito era só de um lado, o meu.

---

## O regime de produção em volume, aberto em 2026-09-28

O catálogo tem **347 versões de 814 planejadas**, e as 467 que faltam se dividem em dois trabalhos de
custo muito diferente. **144 versões em 48 modelos** são irmãs de uma v1 que já existe, e ali a v1 ao
lado é o melhor contexto possível: ela já carrega as decisões daquele modelo resolvidas. **323 versões
em 81 modelos** precisam da v1 do zero, e onze famílias inteiras, da 17 à 27, estão em branco. Nenhum
modelo está parcial: ou tem quatro de quatro, ou só a v1, ou nada.

**O desenho das 467 já está feito**, e essa foi a descoberta que reenquadrou a fase. O
`_estudo/catalogo.json` traz, para cada uma, o slug, o título, o caso de uso **com os números
ilustrativos definidos** e cinco requisitos técnicos concretos, mais o canvas. O produtor não inventa
o que a versão é; ele implementa uma especificação que existe. O gargalo nunca foi desenho, é
throughput.

### O custo medido, e onde ele estava

Um agente produtor lia `CONTRATO.md` (86 KB), `ARMADILHAS.md` (66 KB) e `PRODUCAO.md` (31 KB): **47
mil tokens antes de escrever a primeira linha**, pagos uma vez por agente e quase todos releitura do
mesmo texto. Um agente por versão paga isso 467 vezes; um agente por modelo paga 129 vezes.

A resposta foi `npm run dossie -- <familia>/<modelo>`, que grava um arquivo só em
`_render/.qa/dossie/<familia>__<modelo>.md` com a especificação das versões do modelo, a especificação
estrutural do CONTRATO, as 79 regras de acabamento em enunciado e as armadilhas filtradas pela
abordagem. **59,4 KB contra 183 KB, ou 3,1x**, não os 7x que eu havia estimado. A parte que não
encolhe é a especificação estrutural, 53% do arquivo, porque é ela que produz **erro** no check.

**O dossiê é derivado por extração, nunca por reescrita**, e isso é a lição da numeração do
ARMADILHAS aplicada de novo: segunda fonte da verdade escrita à mão deriva. Ele recorta o texto de
origem como ele está, e o `selftest` tem controle negativo: trocando a extração por uma allowlist de
prefixos, cinco provas falham nomeando os códigos perdidos.

O dossiê **não** substitui os arquivos de origem, e declara isso em destaque: o corpo da armadilha,
com a saída, se consulta no `ARMADILHAS.md` **pelo código**. Conhecer o sintoma sem a saída só é
aceitável porque a saída tem endereço. Improvisar solução para sintoma listado não é opção.

### O portão desta fase é o `check`, não o meu olho

Pela emenda 14.1 do CONTRATO, regra que decide o que o desenho afirma bloqueia sempre, e constante de
acabamento só bloqueia quando o desvio aparece no render. Isso dá um portão que não passa por mim:
**`npm run check` com zero erros**. Aviso passa, erro não.

A propriedade que fecha o desenho é da fila de dívida: **peça fora do registro que viola dá erro**,
então as 467 versões novas **não podem somar dívida nenhuma**. Elas nascem obrigadas às 12 guardas
limpas, sem anistia. "Não boa o suficiente para aprovar" continua significando piso sólido: o que
falta é juízo estético e revisão, não correção mecânica. Volume deixa de depender da capacidade de
revisão, e a fila de veredito se esvazia depois, pelo `revisor-visuais-dados`.

### Duas correções de contagem, de 2026-09-28

**São 12 guardas, não 13**, e o erro estava sendo repetido por mim. O `NFD` que eu contava como guarda
é `String.normalize('NFD')` dentro de dois ajudantes que tiram acento (`guardas.mjs:81` e
`contract.mjs:426`): sem código, sem mensagem e fora da lista `CODIGOS`. Quem conta é o banner
`// CODIGO` do `guardas.mjs`, e foi a extração automática do dossiê que achou a diferença, não leitura.
Das 12, **todas as 12 são escapáveis** por `// check-ok:` e **4 têm fila de dívida**:
`AGREGACAO-ZERO`, `CONTRASTE-MARCA`, `REGUA-CONSTANTE` e `FORMATO-ACESSIVEL`.

**A colisão entre a especificação do catálogo e o CONTRATO é 2,5x maior do que o registrado.** Estava
escrito aqui que 42 das 814 versões planejadas prescrevem armadilha conhecida. A detecção por termo nos
campos `titulo`, `caso_de_uso` e `o_que_demonstra`, com filtro de negação, marca **103 versões, ou
12,7%**: `ACE-5` (opacidade) 50, `TIP-3` (peso 700) 44, `TIP-7` 5, `EIX-8` 3, `TIP-5` 3, `COR-9` 3. O
filtro de negação é o que separa marca de ruído; sem ele o número era 121, com "sem texto girado" e "em
vez de reticência" contando como colisão. A marca sai no dossiê como "confira antes de implementar",
nunca como veredito, e o dossiê diz que **o contrato vence**. O piloto confirmou as duas do modelo dele
na prática, uma por peso de fonte e uma por opacidade.

**Ponto cego de família inteira, descoberto pelo piloto.** Em dispersão, `CONTRASTE-MARCA` e
`ESPESSURA-MARCA` saem `preview_com_transform` nas quatro versões, **inclusive na v1 já aprovada**: por
`marca.mjs:325`, forma de SVG com `transform` em atributo ou estilo desliga as duas. Ou seja check
verde não significa medido, e o portão desta fase precisa ser lido com essa ressalva.

### Três consertos de ferramenta que precederam a fase

Nenhum era cosmético, e o primeiro contaminava a leitura de tudo o que vinha depois.

1. **Alvo múltiplo descartado em silêncio.** `check` e `render` liam `positional[0]` e jogavam o resto
   fora sem uma linha de saída; custou uma peça nesta sessão, que apareceu como conserto que não
   pegou. Agora processam N alvos, com resumo e saída diferente de zero se algum falhar. E havia um
   **segundo descarte que eu não tinha enunciado**: flag de liga-desliga engolia o alvo seguinte, de
   modo que `check alvo1 --sem-tipos alvo2` processava só o primeiro.
2. **Peneira de área da `CONTRASTE-MARCA` medindo contra o `<svg>` errado.** Ela media contra o
   ancestral mais próximo, não contra a tela, e num `<svg>` aninhado de 238 x 22 px descartava um
   degrau de rampa legítimo como "fundo de painel", até sobrarem dois degraus e a regra de "menos de
   três é categórico" reprovar rampa correta.
3. **Isenção de "tem texto por cima" cega no SVG.** Ela existia só no ramo HTML, e no SVG o `<text>` é
   **irmão** do `<rect>`, não filho, então selo neutro legítimo era contado como marca. O critério
   novo é **contenção, não interseção**, porque rótulo de valor encosta e às vezes invade a barra, e
   barra é marca de dado.

O conserto 2 e o 3 vieram com a prova que mais importa: **provas que garantem que a guarda ainda
acusa** o defeito verdadeiro, verificadas revertendo o conserto. Conserto de falso positivo que cega a
guarda é pior que o bug. E a peneira consertada **revelou três marcas que ela escondia**, todas avisos
legítimos, o que é o oposto de anistia.

---

## O que a produção em volume ensinou sobre a própria especificação (2026-09-28)

Nove modelos fechados em levas de quatro, 27 versões, todas com `check` de zero erro. O que mais valeu
não foram as versões: foi o que os produtores acharam ao tentar herdar o acervo.

### Produzir irmã é o melhor detector de defeito que o projeto tem

Todo agente que ia herdar uma v1 aprovada achou defeito vivo nela, e **todos com `check` verde**:
`fillOpacity` 0,55 medindo 2,43:1 no tema claro; `Math.max(...lista)` sem semente devolvendo
`-Infinity`; conector em `--line-strong` a 1,79:1 numa árvore em que a aresta carrega a relação; tique
de hora sem algarismo tabular; largura de eixo fora da faixa da `EIX-6`; `maxValor > 0 ? v/maxValor : 0`.
Nenhum consertou a v1, porque estava fora de escopo, e todos registraram no README da irmã. A lição de
método é que **revisão por quem vai reusar acha mais que revisão por quem vai aprovar**, porque quem
reusa precisa da peça funcionar, não parecer certa.

### Cinco defeitos de especificação, todos achados por extração ou por medição, nunca por leitura

1. **`ACE-5` e `ACE-6` estavam cada um em duas regras diferentes**, com 31 citações no acervo apontando
   para sentidos distintos. As emendas ficaram com os códigos, que é o que 13 citações queriam dizer, e
   as linhas curtas da lista base viraram `ACE-7` e `ACE-8`.
2. **A `EIX-3` escondia a exceção que a inverte num sub-bullet sem código.** Quem consultava por busca do
   código lia **o oposto da regra**, e isso queimou a mim e a um agente que fez tudo certo, custando
   três renders. Virou `EIX-3b`, bullet de topo, seguindo a convenção que `EST-1b` e `ROT-5b` já tinham.
   Regra nova da casa: **emenda nunca mora em sub-bullet sem código.** Varredura feita: era o único caso
   em 13 regras com sub-bullet.
3. **A geometria da moldura na §13 estava errada**, e dois agentes pediram o número de forma
   independente. Medida em 301 previews: não existe um número só, porque o cabeçalho tem duas alturas
   por causa do `line-clamp-2`. Os "cerca de 574 x 234" não correspondem a nenhum dos dois casos reais,
   574 x 241,5 e 574 x 225, e parecem média de duas situações que não se misturam.
4. **A regra da fila de dívida estava consertada só pela metade:** este documento passou a dizer "remova
   a chave", mas o `_LEIA` do arquivo e a mensagem em `divida.mjs` continuavam dizendo "apague a linha".
   Com peça devendo a duas guardas isso viraria anistia calada.
5. **`EIXO-CALMO` é a 13ª guarda**, então o `check` voltou a ter 13, agora pelo motivo certo. A correção
   anterior continua valendo: o `NFD` nunca foi guarda.

### Duas lacunas de paleta, medidas, esperando decisão do dono

**Nenhum neutro alcança 3:1 contra o cartão** (`--surface-overlay` 1,10 e 1,00, `--surface-sunken` 1,15
e 1,15, `--line-subtle` 1,25 e 1,29, `--line-strong` 1,79 e 1,83), o que afeta trilho, poço e moldura.
**E a rampa sequencial tem três degraus úteis, não sete:** só `--seq-5`, `6` e `7` passam de 3:1 nos dois
temas, porque as cores de papel invertem de luminância entre eles. Estão em `TOK-8`.

Somou-se uma terceira, que é lacuna do **conjunto de guardas** e não da paleta: **ninguém mede marca
contra marca**. Todas medem marca contra fundo. Aceso contra neutro mede 1,82:1 no escuro e **1,12:1 no
claro**, embora cada cor passe folgado contra o cartão, então no claro a cor sozinha não separa o
destaque. É `TOK-9`, e é invisível para quem revisa no tema escuro, que é o padrão do Farol.

### Número sem procedência circula por cópia, e eu reincidi no defeito ao consertá-lo

A largura de caractere existia em **três números para a mesma grandeza**: tabela por glifo em
`colisao.mjs`, um `0.52` chapado na guarda de espessura, e `6.4` copiado em sete peças sem ninguém saber
de onde vinha. Medi e o `6.4` está certo por 1,4% no lado seguro, porque subestimar faz a peça desenhar
e a `COLISAO-TEXTO` pegar a consequência, enquanto superestimar **esconde rótulo** e nenhuma guarda pega
o que não foi desenhado. Mas as três médias que eu publiquei para corrigir o problema **não tinham
família de fonte nem escopo**, e duas estavam erradas: eu havia calculado só sobre o subconjunto
tabelado. Space Grotesk e Manrope divergem, e a tabela certa é por família e por classe. Reproduzi
exatamente o defeito que estava consertando.

### Duas reincidências minhas, e as duas têm a mesma forma

**Afirmei fato por modelo a partir de agregado.** Eu disse a quatro agentes que a `EIXO-CALMO` pegaria a
v1 do modelo deles, e **errei em quatro de quatro**, com a lista das 20 peças acusadas na mão. E, uma
mensagem depois de reescopar a `EIX-3b` **por geometria e não por número de família**, briefei quatro
agentes dizendo "a sua família é o caso da `EIX-3b`"; um deles me corrigiu com a minha própria emenda,
porque em bolhas em grade categórica os dois eixos são categoria e vale a regra original. **Escopo por
lista é atalho que volta sempre**, e o antídoto é apresentar a regra pelo teste e nunca pela lista.

### Convergência independente é a prova mais forte que este projeto consegue

O CONTRATO **se contradizia** sobre o token neutro de dado: a §17.2 dava o papel a `--line-strong`, que
mede 1,79:1 e 1,83:1 e só é liberado com o valor escrito na marca, e a §7 nomeava `--text-muted`
"categoria neutra". Em nuvem de 48 ou de 84 pontos não há número por marca, então a isenção não existe e
as duas seções pedem coisas diferentes.

**Três agentes acharam isso separadamente, no mesmo dia, e os três decidiram igual**, cada um citando a
`14.1` e declarando a divergência no README da peça em vez de escondê-la. Nenhum deles sabia dos outros.
Resolvido na origem partindo o papel em dois, **com valor escrito** e **sem valor escrito**, porque a
contradição não era de número e sim de condição não declarada.

O padrão vale além deste caso: quando produtores independentes convergem numa recusa da especificação,
**a especificação é que está errada**, e a convergência é mais confiável que a releitura de quem
escreveu. É a versão operacional da regra de que fato redescoberto acusa a especificação, e agora com um
critério de disparo: **duas recusas independentes bastam para emendar sem discutir.**

Na mesma leva apareceu **lacuna e não contradição**: nada no contrato cobria a **altura do eixo X**. A
`EIX-6` dava a faixa do Y, a `EIX-5` fixava `tickMargin={8}`, e o X não existia. Virou `EIX-6b`, com a
conta (`tickMargin` mais cerca de 15 px de tinta, mínimo de 23) e com o achado que custou as três
rodadas de render: **aumentar o canvas não resolve**, porque a grade em `flex-1` absorve a altura extra e
empurra o rótulo junto.

### "Gerado do código vence escrito à mão" é falso, e a correção veio de um agente recusando minha ordem

A sessão inteira foi guiada pelo princípio de que número derivado por extração é melhor que número
mantido à mão, e ele pagou bem: matou a dívida da numeração do `ARMADILHAS.md`, sustentou o dossiê, e
achou dois códigos duplicados que a leitura não achava. Então eu mandei, por escrito, que numa divergência
entre a tabela de pares medidos da §17.10 e uma medição nova **o número novo mandasse**.

**O agente recusou, com razão.** Ele achou 2 divergências em 15 pares, de 0,01 a 0,02, e investigou a
causa em vez de aplicar a minha regra: a tabela escrita à mão **compõe a cor arredondando cada canal para
inteiro antes de medir**, e ele havia composto em ponto flutuante. O navegador rasteriza em **8 bits por
canal**, então é o número da tabela que corresponde à tela. Nenhum veredito muda, e o que ele recomendou,
e eu fiz, foi **declarar a convenção na própria tabela** em vez de emendar o número.

A regra certa, portanto, não é "gerado vence manual". É **quem modela o meio real vence**. Número mantido
à mão pode carregar um fato físico que o cálculo ingênuo não conhece, e extração sem esse fato produz uma
correção que é uma regressão. O antídoto é o mesmo em qualquer direção: **declarar a convenção junto do
número**, porque é a convenção, e não o número, que a próxima medição precisa para não "consertar" o que
estava certo.

Do mesmo episódio saiu uma segunda regra, pequena e afiada: **em tabela que decide aprovação, não se
arredonda na exibição.** O texto vazado sobre `--chart-8` mede 4,4986:1 no tema claro e falta 0,0014 para
o piso; uma tabela mostrando "4,50" pareceria aprovada. Casa decimal a menos é veredito trocado.

### Um defeito latente na ferramenta, e a razão de ele ser perigoso

A função `nomeDoToken` de `_render/scripts/lib/marca.mjs` **não serve para nomear a cor de uma marca**, e
quem a reusar herda o defeito sem perceber. Ela devolve o **primeiro apelido do hex**, e o Farol tem hexes
compartilhados por projeto: pela `COR-8`, `--chart-1` e `--accent-cyan` são o mesmo valor, e `--chart-2`,
`--warning` e `--prov-premissa` também. Resultado medido em 2026-09-28: `rgba(45, 212, 232, 0.4)` saía
nomeado como `--accent-cyan` e **escapava** de uma guarda que julgava `--chart-*`. Quem construiu a
`OPACIDADE-MARCA` precisou de desempate próprio.

O mesmo fato decidiu uma escolha de arquitetura e derrubou um critério meu. Eu havia mandado escolher
entre ler o preview e ler o código **pela cobertura**, "a que mede mais peças": o preview mede 69 versões
e o código 48, então pelo meu critério era preview. A resposta certa era código, porque **o render não
sabe qual token a peça pediu**, já que dois tokens diferentes chegam ao pixel com o mesmo hex e um deles é
proibido em marca. Meu critério media "quanto lê" e ignorava "consegue triar o que lê": o leitor de
preview acusaria 59 versões, 15% do catálogo, por não conseguir aplicar a isenção de valor ao lado, que
não tem definição geométrica.

**A regra que sai disso:** cobertura bruta não é critério de escolha entre dois leitores; **cobertura
útil é cobertura menos falso positivo**, e um leitor que não distingue os casos que a regra isenta tem
cobertura alta e utilidade baixa. Vale como precedente para toda guarda futura: pergunte primeiro se o
meio carrega a informação que a regra precisa, e só depois quantas peças ele alcança.

### Quando a resposta é discreta, a média é a pior estimativa possível

O dossiê precisava dizer a partir de quantos caracteres o caso de uso quebra na segunda linha do
cabeçalho, porque disso depende qual das duas alturas de moldura usar. A conta óbvia é largura útil
dividida por avanço médio. **Ela produz exatamente o número errado.** Medido no corpus dos 814 casos de
uso: o avanço médio é 5,76 px por caractere, e 574 ÷ 5,76 dá 100 caracteres, que cai **dentro da faixa de
fronteira**, entre o que sempre cabe e o que nunca cabe.

A saída foi medir o corpus e publicar **três faixas**: a 574 px, até 92 é uma linha garantida, 93 a 104 é
fronteira, 105 ou mais são duas linhas. E um achado de borda que a média nunca daria: nos canvases
estreitos, `kpi` e `kpi-alto` com 302 px de cabeçalho, **nenhum dos 814 casos de uso cabe em uma linha**,
então ali são sempre duas e o desconto já é fixo.

**A regra vale para qualquer limiar deste projeto, e é curta: quando a resposta é discreta, a média
aterra na zona ambígua.** Uma linha ou duas, cabe ou não cabe, passa ou reprova: a média descreve o meio
da distribuição, e é no meio que a resposta é indefinida. O antídoto é medir o corpus e dar faixas com
zona de fronteira declarada, em vez de um número que parece preciso e erra justamente nos casos típicos.
O motivo aqui é concreto e vale citar: média por classe de caractere não descreve prosa, porque o espaço
avança 0,216 em contra 0,616 da maiúscula, e prosa é feita das duas.

### Convergência em contorno não é convergência em recusa, e eu confundi as duas

A regra que eu escrevi nesta sessão diz que **duas recusas independentes bastam para emendar sem
discutir**, e ela funcionou três vezes: o token neutro de dado, a base ancorada da `EIX-3b` e o halo da
`ROT-7b`. Nos três casos os produtores **recusaram a especificação com uma medição** e a especificação
estava errada.

Aí eu apliquei a mesma regra a um caso que não era recusa. Dois agentes bateram no tique de moeda que o
Recharts quebra em duas linhas, e os dois **alargaram o eixo**, um para 72 px e outro para 80. Eu li a
convergência como recusa e emendei a `EIX-6` para abrir a faixa até 80. Uma terceira medição, por soma
glifo a glifo, mostrou que a leitura era do sintoma: `R$ -200 mil` soma 61,79 px e com o `tickMargin`
pede 69,79, acima do teto de 64, e **o contrato já tinha a resposta**, a `REC-2`, que manda trocar a
unidade do rótulo. `R$ -0,2 mi` pede 62,69 px e cabe. Largura de eixo acima de 64 é sinal de unidade
errada, não de teto apertado.

**A distinção, que a regra original não fazia:** convergência em **recusa** é evidência de que a
especificação está errada, porque dois produtores independentes mediram e discordaram dela.
Convergência em **contorno** é evidência de que existe um muro, e nada mais: dois produtores podem
contornar do mesmo jeito porque a saída óbvia é a mesma, sem que nenhum dos dois tenha procurado a regra
que resolve. **A pergunta que separa as duas é uma: eles mediram contra a regra, ou desviaram dela?**
Se desviaram, o que a convergência pede é que eu procure a regra que eles não acharam, e só então
emende, e às vezes a emenda é no dossiê e não no contrato.

É o meu erro de sempre virado do avesso. Eu já sabia que afirmo o particular a partir do agregado; este é
o caminho inverso, **generalizar o particular para dentro da especificação**. Nos dois casos a falha é a
mesma: pular a conferência contra o critério que já está escrito.

### Antes de mexer numa guarda que funciona, meça o contrafactual no acervo

O halo da `ROT-7` é um **escape por construção**: a `CONTRASTE-TEXTO` resolve o fundo do texto por
geometria, então havendo halo ela mede o texto contra o halo e não contra a marca por baixo. Duas peças
escreviam `--text-primary` sobre fatia categórica, medindo **1,53:1 no escuro e 2,99:1 no claro** contra a
fatia, e passavam o portão porque contra o halo medem 14,53:1 e 17,96:1.

A saída óbvia era mudar a `CONTRASTE-TEXTO` para parar de compor o halo. **Medido, ela consertaria 10
versões e estragaria 8**, porque nas 8 a tinta cruza a borda de uma área e ali o halo é exatamente o que a
`ROT-7` quer: 44% de falso positivo. A resposta certa foi **guarda nova ao lado**, medindo o que faltava
sem tirar o que já funcionava.

**A regra: guarda existente não se altera por raciocínio, se altera por contrafactual medido no acervo.**
Contar quantas peças a mudança conserta é metade da conta; a outra metade é quantas ela passa a acusar
sem razão, e essa metade não aparece se você só pensar no caso que te incomodou.

### O discriminador certo raramente é o que já existe, e eu sugeri o errado

Eu mandei reusar a peneira de área do `marca.mjs`, que descarta forma grande como fundo de painel, para
separar "texto sobre marca" de "texto sobre painel". **Sem ela a classe vai de 10 para 15 versões, e as 5
extras são marca de verdade**, área empilhada e pizza de raio variável, não painel: a peneira descartaria
defeito real. O discriminador que funciona é outro e mais simples, **fundo uniforme em toda a caixa de
tinta**: se o texto tem um único fundo por baixo, ele está **dentro** de uma marca e a marca é o fundo a
medir; se tem mais de um, ele **cruza** uma borda e o halo é a resposta correta. Concorda **167 em 167**
com a contenção por forma e dispensa peneira nenhuma.

Reusar o que existe é bom instinto e foi certo no caso da contenção, que saiu de `marca.mjs` para um
módulo compartilhado. Mas **reusar o discriminador de outra pergunta é diferente de reusar a medição**: a
peneira de área responde "isto é fundo de painel?", e a pergunta aqui era "o texto tem um fundo ou dois?".
Perguntas parecidas, respostas que divergem em 5 de 15 casos.

### Três correções de contagem, de 2026-09-29, e a ferramenta que já respondia

**São 20 modelos abertos, não 23 nem 25.** Eu vinha repetindo 23 de memória. Ao medir, o disco devolveu
25 modelos com 1 a 3 versões, e eu quase reportei 25. A fila verdadeira é 20: cinco modelos são
planejados com **3 versões, não 4**, e por isso três no disco é fechado e não é irmã faltando. São
`02_barras-horizontais/10_corrida-de-barras`, `04_linhas/03_step-degrau`, `05_areas/10_area-bump`,
`13_progresso-meta-e-gauge/04_aneis-concentricos` e `13_progresso-meta-e-gauge/05_gauge-de-arco-preenchido`.

**A regra: "modelo aberto" só se define contra o planejado do catálogo, nunca contra um teto presumido
de quatro.** O que torna o erro fácil é a média: 814 versões em 205 modelos dá **3,97 por modelo**, a
três centésimos de 4, então o teto presumido acerta em 200 dos 205 casos e o engano só aparece nos cinco
que importam, que são justamente os que eu ia mandar agente produzir sem ter o que produzir.

**A família 16 não está fechada, e o "5/5" que eu reportei ao dono tinha o denominador tirado do
numerador.** `16_distribuicao` tem **13 modelos** no catálogo: 5 fechados, 8 sem nenhuma versão. O que
eu contei foi "dos modelos que têm versão, todos estão completos", que é verdade e não é a pergunta.
Fechamento de família se mede contra o catálogo, igual a fechamento de modelo.

**O `pendencias` já respondia, e sem trava.** Eu fui contar pasta com script próprio quando
`npm run pendencias -- --sem-tipos` faz a comparação contra o catálogo, roda sem pegar a trava entre
processos (só o typecheck precisa dela, e `--sem-tipos` o pula) e leva 11,7 s. As duas medições
convergem de forma independente e exata: ele acusa **`sem_pasta` 383**, que é 60 irmãs dos 20 abertos
mais 323 versões dos 81 modelos vazios, e 60 mais 323 fecha 383. Ele também mostra que
`sem_readme_modelo` 323 é exatamente o conjunto dos vazios, isto é **nenhum modelo com versão está sem
README**, o que a varredura de conciliação deixou verdadeiro.

**Estado medido em 2026-09-29:** 205 modelos, 814 versões planejadas, **431 no disco (52,9%)**,
104 modelos fechados, 20 abertos, 81 vazios, 0 pasta de versão fora do catálogo.

## A rodada de 2026-09-29: 5 modelos fechados, e o que os 5 relatórios ensinaram

Cinco produtores, um por família aberta, um modelo cada, com o dossiê como especificação e `check` de
zero erros como portão. Fecharam `06_pizza/03`, `08/03 painéis alinhados`, `11/02 sankey multietapa`,
`12/05 perímetro aninhado` e `15/04 calendário estilo contribuições`, com **15 versões novas**. O
briefing custou cinco parágrafos porque o dossiê carregava o resto, e nenhum dos cinco pediu régua.

### As cinco lacunas do dossiê eram todas comportamento que já existia escrito em algum lugar

Nenhuma delas exigia decisão nova, e é a décima vez que este padrão aparece: o que falta ao produtor
não é julgamento, é **publicação do que já era verdade**. As cinco: (1) o `<svg>` em fluxo de texto
perde o `display: block` no preview e engorda a linha, com causa em `serialize.ts:635`, virou `GEO-17`;
(2) a largura útil do tique do eixo Y é `width − tickSize − tickMargin`, com o `tickSize` de 6 px
descontado **mesmo com `tickLine={false}`**, conferido em `CartesianAxis.js`; (3) o Sankey desenha as
ligações **antes** dos nós e aceita ReactElement em `node` e `link`, conferido em `Sankey.js:963` e
`:587`, virou sonda; (4) o comportamento de **borda** de `@/lib/format`, que a assinatura não conta,
resolvido publicando as 170 linhas do arquivo por extração literal, 6 KB num dossiê de 143; (5) o
`CHART_SEQUENTIAL_COLORS[i]` vale `--seq-(i+1)`, e indexar pelo grau da tabela pinta um degrau abaixo
do que se mediu.

### Três contradições do dossiê contra ele mesmo, e as três eram minhas

**A tabela do passo prometia faixa que não cabe.** Ela publicava o corpo com o cabeçalho de **uma
linha**, o melhor caso, e três parágrafos acima o mesmo dossiê dizia que nos canvases estreitos
**nenhum** dos 814 casos de uso cabe em uma linha. Resultado: a tabela anunciava **8 faixas** em
`kpi-alto`, onde o corpo real é de 155,5 px e a espessura com 8 nasce em **11,55 px**, abaixo do piso
de 12. O teto verdadeiro é **7**, e no `kpi` é **1**, não 2. A tabela passou a publicar as duas
hipóteses, com a de uma linha marcada **inalcançável** onde ela é impossível.

**A nota da §13 cobrava uma emenda já paga, e eu propaguei a afirmação falsa a quatro agentes.** O
dossiê dizia "a §13 do contrato fala em cerca de 574 x 234", e a §13 já tinha sido corrigida para o par
241,5 e 225. Três produtores escreveram no relatório que "a §13 continua errada": estavam lendo a minha
nota, não o contrato. **Quem conserta a origem tem de procurar quem ainda cobra a emenda.** É o mesmo
eixo de defeito que a varredura de READMEs achou, e agora ele apareceu dentro da ferramenta.

**A largura do eixo tinha duas contas no mesmo arquivo.** A `EIX-6`, recortada no dossiê, manda somar a
tinta e **acrescentar 18 px**; a seção de largura de caractere, três páginas depois, dizia "o texto mais
o `tickMargin` de 8 px". Um produtor seguiu a de cima, dimensionou o eixo em 60 px e o Recharts quebrou
o tique em duas linhas, cortando o do topo. As duas contas estão unificadas nos 18 px, e agora o dossiê
também **explica** de onde eles vêm, o que a `EIX-6` media sem saber o mecanismo.

### Duas provas do selftest codificavam o defeito que eu estava consertando

Ao trocar a conta do eixo de 8 para 18 px, o selftest falhou: existia a prova "o dossiê explica que a
largura de eixo soma o tickMargin", que exigia literalmente a frase errada. E ao remover a nota
defasada da §13, falhou a prova "o dossiê acusa a divergência com a §13", que mantinha viva uma
cobrança já paga. **Teste de texto de pendência envelhece junto com a pendência**, e enquanto ele não
envelhece ele impede o conserto. As duas foram invertidas: a primeira cobra os 18 px e o mecanismo, a
segunda cobra o par medido. Uma prova que fixa a redação de uma pendência precisa ser lida toda vez que
a pendência for paga, e isso não é automático.

### Produzir irmã achou 14 peças com texto abaixo do piso, e o fator já estava calculado e sendo jogado fora

Um produtor mediu que a `v1` do modelo dele declara 11 px e entrega **10,40 px**, porque o `<svg>` sai
esticado, e que a `TAMANHO-TEXTO` não pega porque lê o tamanho **declarado**. Varri o acervo: **14
peças**, a pior a **7,23 px**, todas com preview aprovado e `check` verde. E o fator de escala **já era
calculado** em `colisao.mjs`, para marcar `escalado` e cegar a `COLISAO-TEXTO`, e descartado em seguida.
A emenda não inventou medição nenhuma: fez o número já existente chegar ao veredito. Virou `GEO-18`.

**A emenda precisou de três camadas, e as três descartavam o mesmo dado.** O fator tinha de ser
propagado no nó, no estilo do `<tspan>` **e** no remapeamento que `fecharLinha` faz para a saída. Nas
duas primeiras tentativas o campo chegou `undefined`, não 1: sinal de que o caminho não era o que eu
supunha, e não de que a escala era 1. Campo que sai `undefined` onde o padrão é 1 é sempre caminho
errado, nunca valor neutro.

### Meu primeiro teste da escala teria dado falso alarme de 1.208 peças

A primeira varredura cruzou "existe `<svg>` com escala diferente de 1" com "o menor `font-size` do
arquivo" e devolveu **1.208** peças com texto abaixo do piso, o que seria quase o catálogo inteiro. O
número era lixo: escala **0,5833 é 14/24**, ou seja **ícone da lucide**, que não tem texto dentro
nenhum, e o `font-size` que eu cruzava vinha de outro lugar do arquivo. Medindo o `font-size` **dentro**
do bloco do `<svg>` escalado, e só onde há `<text>`, o número caiu para 14, que é o real e que confere
na vírgula com a medição independente do produtor. **Escala e texto precisam estar no mesmo elemento
para a conta existir**, e o ícone é o contraexemplo que está em quase toda peça.

### O serializador arredonda o `viewBox`, e sem filtro a guarda reprovaria peça correta pela ferramenta

O serializador grava o `viewBox` em inteiro e a caixa em fracionário, então quase toda peça tem um
`<svg>` com `viewBox` 282 dentro de uma caixa de 281,5: fator **0,99823**, que não é decisão de desenho
de ninguém. Sem filtro a guarda reprovava duas versões de `05_areas/10_area-bump` por 11 px chegarem a
**10,98**, com a causa na ferramenta e o erro no nome do produtor. O critério que resolve é estrutural e
não um limiar arbitrário: **a escala só conta quando a caixa difere do `viewBox` em pelo menos um pixel
inteiro**, porque abaixo disso a diferença cabe no arredondamento que o próprio arquivo introduziu.

### Qual das duas razões é o fator, e por que a de largura erraria a peça mais grave

Escala de `<svg>` tem duas razões e elas divergem. Sem `preserveAspectRatio` o padrão é `xMidYMid meet`,
que escala uniformemente pela **menor** e centraliza o resto; com `none` quem governa a altura do glifo
é a razão de altura. Na coluna radial as duas são **0,8792** e **0,6573**: pela largura o texto chega a
9,67 px, pela altura a **7,23 px**. Usar a de largura erraria 2,44 px justamente na peça pior do acervo,
e ainda a deixaria acima do piso em alguns casos. Três provas do selftest fixam isso.

### Eu afirmei a `EIX-3b` de novo, e errei de novo

No briefing do modelo de painéis alinhados escrevi "este modelo tem dois eixos quantitativos, então a
`EIX-3b` provavelmente é o seu caso". O produtor aplicou o teste das três perguntas e provou que não: o
eixo x é categoria de tempo e a marca é barra ancorada no zero, o que reprova duas das três. **É a
segunda vez que erro esta regra afirmando em vez de mandar testar.** Nos briefings seguintes tirei a
afirmação e deixei a instrução de aplicar o teste, citando que eu já errei aqui. Regra que tem teste
escrito não se anuncia por semelhança: o teste é mais curto que a minha intuição e acerta mais.

### Convergência independente: a geometria da moldura foi confirmada quatro vezes, na vírgula

Quatro produtores mediram o recuo e o cabeçalho nos próprios previews e os quatro bateram com a tabela:
33 px de recuo, 894 px de largura útil, 40,5 px de cabeçalho de uma linha, desconto de altura de
118,5 px, corpo de 574 px de largura. Um deles escreveu que registrava "porque confirmei em vez de
assumir". A tabela medida é a peça do dossiê com mais confirmação independente até aqui.

### O ponto cego é por TÉCNICA DA PEÇA, não por abordagem nem por família

Peça que sai como **uma ilha `foreignObject` única** faz `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e
`TEXTO-NA-MARCA` saírem `texto_em_html` nas quatro versões do modelo: três guardas caladas de uma vez.
Em Sankey a `ESPESSURA-MARCA` sai `marca_fora_do_bar` em 4 de 4, porque o piso de 12 px só vale dentro
de `<Bar>`. Em dispersão as duas de marca saem `preview_com_transform`. **Check verde não significa
medido, e o motivo tem nome:** os produtores desta rodada conferiram à mão e escreveram a conferência no
`notes`, que é o comportamento certo. Um deles foi além e desenhou no `viewBox` igual ao corpo para a
escala sair 1, o que devolveu as três guardas à peça dele, ao contrário da `v1`.

**Correção do meu próprio enunciado, feita na rodada 2 e por medição.** Eu escrevi acima "o ponto cego é
por abordagem" e briefei um produtor dizendo que as guardas de texto sairiam `texto_em_html` na família
dele. Ele mediu: **3 de 3** irmãs novas foram MEDIDAS por `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e
`TEXTO-NA-MARCA`, e só a `v1` sai `texto_em_html`, isto é **1 de 4** no mesmo modelo. O silêncio era da
**técnica da v1**, que põe o texto em HTML, e não da abordagem nem da família. A generalização certa é
esta: o motivo de não medição descreve **como aquela peça foi desenhada**, e duas irmãs do mesmo modelo
podem ter cobertura diferente. É a terceira vez nesta frente que eu generalizo de uma peça para o grupo
e a medição me desmente, e as três vezes o produtor achou porque mediu em vez de acreditar.

**E a escolha de técnica é uma alavanca de cobertura, não um detalhe.** Dois produtores desenharam em
`<text>` de SVG com `viewBox` igual ao corpo medido, escala exatamente 1, e com isso ganharam quatro
guardas que a `v1` do mesmo modelo não tem. Vale escrever no briefing: **desenhar no espaço do corpo, em
SVG, compra medição**; pôr o texto em HTML dentro de ilha a perde.

## A rodada 2 de 2026-09-29, e o achado que ela destravou: o dígito tabular

Quatro dos cinco produtores voltaram com o portão verde, fechando `06_pizza/04`, `08/04 pareto`,
`12/06 icicle` e `15/05 calendário mensal`. O saldo de conhecimento foi maior que o da rodada 1.

### A tabela de largura errava 30% em número, e a causa é o dígito tabular

Um produtor relatou que `100%` a 14 px, orçado em 38 px, mediu 53 px. O diagnóstico dele estava errado
(ele atribuiu ao glifo `%`, que **está** na tabela, com 0,762 em) e o fenômeno estava certo. Medindo no
navegador com as fontes do Farol carregadas: **sob `tabular-nums` todo dígito mede 0,620 em**, idêntico
em Manrope e em Space Grotesk, nos pesos 400 a 700 e nos tamanhos de 11 a 30 px, com os nove dígitos
iguais ao zero nas 32 combinações. As tabelas do projeto são **proporcionais** (`1` vale 0,434 e `0`
vale 0,644 no Grotesk), e o catálogo escreve quase todo número com `tnum`. Resultado: `111` a 14 px mede
26,05 px e a soma proporcional dava **18,23, ou 30% a menos**; `000` mede os mesmos 26,05 e a soma dava
27,05, 3,8% a mais. **Subestimar largura de rótulo é o erro caro, porque esconde colisão.** Sem `tnum` a
tabela é quase exata, com erro medido de 0,1% a 0,5% em cinco strings.

**O controle que valida a medição**, e sem ele o número idêntico nas duas famílias pareceria defeito:
família inexistente devolve 0,5000 em, igual a `serif`, e as duas famílias reais divergem **sem**
tabular, 0,5895 e 0,5614, o que prova que as duas carregaram. O 0,620 idêntico é coincidência de
desenho das duas fontes, não fallback.

A `COLISAO-TEXTO` passou a resolver `font-variant-numeric` na cadeia, com `normal` desligando o herdado.
Contrafactual no acervo: **zero erro novo** em 460 versões, porque as peças têm folga; o que mudou é que
os rótulos numéricos passaram a medir **igual entre si**, que é a propriedade que o dado tem na tela.
Num preview de teste, `98%`, `41%`, `58%`, `18%` e `36%` mediam de 25,28 a 27,87 px e agora medem os
mesmos **28,03 px**.

### O extrator de regras cortava o enunciado no meio da frase, e sem avisar

`extrairRegras` lia **linha por linha**, e o `CONTRATO.md` quebra a 100 colunas. Toda regra cujo
enunciado passa de uma linha chegava ao dossiê truncada e **sem** o `[…]` que marca corte: a `EIX-6b`
terminava em "(emenda de". Um produtor achou apontando a linha. O extrator passa a juntar a continuação
indentada do bullet, e hoje nenhuma das 82 regras termina em frase aberta.

### "Sem pegadinha conhecida" mandava explicitamente não conferir

O dossiê imprimia, para os componentes sem sonda, a frase **"não vá ler o pacote por precaução"**. Um
produtor a seguiu e perdeu uma rodada com a ordem de pintura do Sankey, que está escrita no pacote com
um comentário do próprio autor. O rótulo virou "Sem sonda declarada", o texto diz que ninguém sondou e
que isso é tudo o que a linha afirma, e nomeia as **três classes que nunca são sondadas**: ordem de
pintura entre as partes de um componente, que tipos uma prop de render aceita, e o que um componente
sincroniza com outro. `Line` e `Sankey` ganharam sondas com prova em arquivo e linha.

### A tabela por glifo era citada como régua e não estava no arquivo

**Dois produtores, no mesmo dia e de forma independente**, escreveram a mesma frase: o dossiê diz que "a
fonte de verdade é a tabela por glifo" e não a traz, então quem decide usa a média que o próprio dossiê
desautoriza. Eram 120 entradas e menos de 2 KB. Agora está publicada. É o caso mais limpo de
convergência independente até aqui, e a lição é dura: **citar a régua não é publicar a régua**, e o
produtor obedece o que está na mão dele.

### Três provas do selftest fixavam o estado defeituoso

Já eram duas na rodada 1 e viraram três: "o dossiê aponta a tabela por glifo como fonte" passava
enquanto a tabela estava ausente, porque ela cobrava o **apontamento**. Prova que fixa a redação de uma
pendência precisa ser reescrita quando a pendência é paga, e nenhuma delas avisa sozinha. As três foram
invertidas para cobrar o estado certo, e o total do selftest foi de 389 para 409 provas.

### O `canvas_sugerido` errou por fator grande em UM modelo, e eu generalizei para a família

No icicle o sugerido era `largo`, com 281,5 px de corpo, e o desenho pediu **422 px**; na outra versão o
sugerido era `alto`, com 441,5 px, e o desenho pediu **618 px**. Eu registrei isso como "em modelo de
hierarquia com lista de identificação o conselho erra por 40% a 50% da altura", e **a rodada seguinte
desmentiu**: no modelo de árvore e dendrograma, da mesma família, o produtor mediu `largo` sugerido
dando 281,5 px contra **278 pedidos** e `card` dando 241,5 contra **207**, ou seja o conselho acerta com
folga; só uma das três versões estourou, e **pela largura, não pela altura**.

**É a quinta vez que eu generalizo de uma medição para o grupo e a medição me desmente.** O que fica de
pé é o enunciado estreito: o `canvas_sugerido` é conselho do catálogo e a conta de linhas manda, e o
erro dele **não tem magnitude típica** que se possa antecipar por família. Quem produz mede o próprio
desenho; quem escreve briefing não prevê o número.

### A especificação do catálogo pede opacidade sem dizer "opacidade", e o detector era cego a isso

O catálogo quase nunca escreve a palavra: ele escreve **"baixa as demais para 15%"**. Um produtor bateu
nisso em 2026-09-29 e resolveu bem, pelo contrato, mas o dossiê não o avisou. Medido nas 814 versões:
**seis** pedem opacidade em marca por esse padrão e **cinco eram invisíveis** à busca por termo. As seis
pedem de **15% a 45%**, e o mínimo medido da `ACE-5` para as cores de papel é **0,63 a 0,77**, ou seja
todas as seis pedem abaixo do piso e toda peça nova que obedecesse a especificação sairia com erro.

**O discriminador estreito ganhou do largo, e a diferença foi medida antes de escolher.** O padrão largo,
qualquer `a NN%`, acertava **4 de 10**: marcava percentual de dado ("a partir de 100%", "55% da banda",
"22% e etiqueta LACUNA"). O estreito exige o grupo **não destacado** ao lado do percentual e acerta
**6 de 6**. A escolha não é só de precisão: marca ruidosa gasta a confiança na marca, e a marca aqui não
é veredito, é um pedido de conferência, então ela só funciona enquanto o produtor acredita nela.

### Quarta reincidência do mesmo erro meu, e a decisão que sai dela

Na rodada 3 eu escrevi no briefing que, naquela família, a `ESPESSURA-MARCA` sairia
`marca_fora_do_bar`. O produtor mediu: **1 de 3** sai assim, e as outras duas saem
**`sem_marca_de_barra`**, porque o motivo muda com a presença de `<rect>` na peça. Ou seja **dois
motivos diferentes dentro do mesmo modelo**, o que é mais fino que a correção que eu já tinha escrito
hoje ("o ponto cego é por técnica da peça"): ele é por **peça**, e a peça vizinha não serve de proxy.

São quatro vezes nesta frente, e as quatro têm a mesma forma: eu olho uma peça, generalizo para o
grupo, e escrevo a generalização num briefing onde ela vira instrução. **A decisão, a partir daqui:
briefing não afirma motivo de não medição.** Ele instrui a ler o que o `check` de fato reportou e, onde
saiu não medida, a conferir à mão e escrever a conferência no `notes`. O custo de não afirmar é zero,
porque o produtor tem de ler o relatório de qualquer maneira; o custo de afirmar já foi pago quatro
vezes, e na melhor das vezes o produtor gastou uma linha do relatório para me corrigir.

**O que vale afirmar, porque foi medido e é escolha do produtor:** desenhar em `<text>` de SVG num
`viewBox` igual ao corpo medido, com escala 1, **compra** medição. Dois produtores fizeram isso e saíram
com `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA` medindo 3 de 3, contra a `v1` do mesmo modelo
que sai `texto_em_html` nas três. Isso é conselho sobre a técnica, não previsão sobre o resultado.

## A rodada 3 de 2026-09-29: cinco modelos, e o dia em que eu quebrei a régua consertando a régua

Os cinco produtores fecharam `06/05 raio variável`, `08/05 colunas com acumulado`, `11/05 chord`,
`12/07 árvore e dendrograma` e `15/06 lasagna`, todos com zero erro. O saldo de conhecimento foi o maior
das três rodadas, e três dos itens abaixo são correções de coisas que **eu** escrevi hoje.

### Consertar a conta do eixo quebrou o exemplo do próprio parágrafo, e um produtor leu o resultado

Ao trocar a sobrecarga do eixo de 8 para 18 px, eu deixei no mesmo parágrafo o exemplo antigo, que
passou a dizer que `R$ −0,2 mi` "pede **72,69 px** e cabe" num teto de **64**. Um produtor citou os dois
números lado a lado. **Emenda de número exige reler o exemplo que a usa**, e eu não reli.

### E a correção do dígito tabular derrubou o teto de 64 px da EIX-6, que é decisão do dono

Medido a 11 px em Space Grotesk com dígito tabular: o tique de moeda mais estreito da família,
`R$ 1,7 mi`, soma 47,84 px de tinta e pede **65,84 px**; `R$ 60 mil` pede **65,85**; `R$ −200 mil` pede
**79,50**. A `EIX-6` manda as duas coisas ao mesmo tempo, tique com a unidade escrita **e** largura entre
48 e 64, e depois da correção do tabular as duas não fecham juntas. A `REC-2`, que manda encurtar o
rótulo, **não tem o que encurtar** em `R$ 1,7 mi`. Isto entrou no dossiê como **tensão declarada**, com o
procedimento de desvio da `14.1` no lugar de uma decisão minha, e está na mesa do dono.

**Cuidado com a leitura desse número:** eu medi 52 de 192 declarações de largura de eixo acima de 64 px e
quase ia reportar isso como o tamanho do problema. Errado: a maioria é **eixo de categoria** em barra
horizontal, onde o rótulo é nome e a `EIX-6` não se aplica. O teto de 64 é do eixo **numérico**.

### A ordem de pintura do Recharts é por zIndex, e a REC-13 dizia outra coisa

A `REC-13` afirmava que "a ordem de pintura é a ordem de entrada do array". Medido em
`recharts/es6/zIndex/DefaultZIndexes.js`: entre **tipos** de marca manda o zIndex, com grade −100, área
100, barra 300, linha 400, eixo 500 e dispersão 600, e a ordem do JSX não muda nada. Uma `Line` pinta
**sobre** qualquer `Bar`. A régua do array continua valendo **dentro** de um tipo, que é o caso das
fatias de um `Pie` e dos nós de um `Treemap`, e era desses casos que a entrada falava.

### Duas pegadinhas do `Bar` que custaram render e viraram sonda

`Bar.js:619`: coluna negativa chega com **`height` negativo** e `y` na borda de baixo; o `Rectangle`
normaliza ao desenhar e **a conta de rótulo não**, o que pôs um rótulo 86 px fora do lugar.
`Bar.js:126`: o `index` que chega ao `shape` e ao `LabelList` é o **filtrado**, e o do dado é
`entry.originalDataIndex`; com `null` no meio da série, `rows[index]` lê a linha errada.

### Quatro lacunas publicadas, e duas foram pedidas por dois produtores cada

A **altura de linha do corpo**, que a conta de linhas da `GEO-1` exige e que o dossiê não trazia: medida
em 5.811 pares dos previews, e o resultado é melhor que o pedido, porque mostra que **a altura não é
função do tamanho** (a 11 px vai de 11 a 16,5 px conforme a classe, 50% de diferença). O **contraste dos
tokens de texto e de procedência** contra o cartão, que faltava nas três tabelas de cor; os oito passam
o piso de 4,5:1. A **tabela por glifo inteira**, que era citada como régua e não estava no arquivo. E a
régua de **borda curva**, que virou `GEO-19`: a âncora fora do arco reentra pelo canto de baixo, e a
conta horizontal do contrato não pega isso.

### A quarta prova que fixava estado, e agora o padrão tem nome

Ao acrescentar duas sondas ao `Bar`, quebrou a prova "o modelo de barra recebe a pegadinha do vão de
categoria", que exigia `itens.length === 1`. Somadas às três da rodada 1 e 2, são **quatro provas desta
suíte que fixavam ESTADO em vez de COMPORTAMENTO**: uma exigia a frase errada do eixo, uma exigia que o
dossiê acusasse uma emenda já paga, uma exigia que ele apontasse para uma tabela em vez de publicá-la, e
esta exigia uma contagem que cresce por bom motivo.

**A regra que sai disso: prova de extração cobra PRESENÇA, nunca contagem nem redação literal de
pendência.** As quatro foram reescritas: a do `Bar` passou a procurar a pegadinha por título, e virou
três provas em vez de uma. O selftest foi de 389 para **417 provas**, e o crescimento é quase todo de
provas que antes não existiam para comportamento que já valia.

### A especificação prescreve a meia correção da GEO-3, que a própria GEO-3 chama de mais perigosa

O catálogo especifica, para o raio variável, "raio por raiz quadrada do valor sobre o maior valor, entre
rMin e rMax". Com raio mínimo, essa forma **não** entrega área proporcional, porque a área do setor vale
`r² − rMin²` e não `r²`. Medido pelo produtor com o piso de 32% que a `v1` usa: ela desenha **0,3199 de
área para 0,2000 de valor**, e `√(rMin² + (rMax² − rMin²)·v/topo)` dá **0,3000 contra 0,3000**, com erro
de 0,0000% nos 12 setores das três irmãs novas. A `v1` carrega o defeito e **nenhuma guarda mede raio
contra área**, então ela passa verde. É a lacuna de cobertura mais bem caracterizada que este catálogo
tem hoje, e é candidata natural à próxima guarda: a conta é determinística e sai do `preview.svg`.

### A validação em massa que ninguém pediu, e que vale mais que uma aprovação

Um produtor conferiu, por conta própria e contra `tokens.css`, **as 7 linhas da rampa sequencial, as 21
da tabela de opacidade mínima e as 22 da matriz de texto sobre preenchimento**, e todas bateram na
segunda casa. Outro conferiu a geometria da moldura e bateu na vírgula, que é a quinta confirmação
independente dela. Um terceiro mediu quatro tokens de texto e **errou um**, `--text-primary`, com 14,67
contra os 14,53 da função do projeto, o que também é informação: a fórmula está certa e a reimplementação
à mão é o elo frágil, então o dossiê publicar a tabela vale mais que ensinar a medir.

## A rodada 4 de 2026-09-29 fechou a fila, e os cinco relatórios derrubaram cinco afirmações das réguas

Com `06/06`, `08/06`, `12/08`, `15/07` e `15/08` o catálogo foi a **491 versões, 60,3%**, e a fila de
modelos abertos zerou: **124 completos, 0 abertos, 81 vazios**. Nenhum dos cinco pediu régua nova, e os
cinco entregaram contradição medida.

### Três réguas com erro de fato, todas provadas no pacote instalado

**A `REC-24` afirma o contrário do que acontece.** Ela diz que em eixo categórico `x1` igual a `x2` "não
produz retângulo nenhum". Medido: **77,75 px**, exatamente uma banda, e a `ReferenceArea` sobre um mês só
desenha e leva o texto dentro. Prova: `ReferenceArea.js:44` mapeia `x1` com `position: 'start'` e a linha
54 mapeia `x2` com `position: 'end'`, e `RechartsScale.js` soma `bandwidth()` no caso `'end'`.

**A isenção do `Bar` para forma própria é mais estreita do que o dossiê diz.** O "Bars with a custom
shape are not filtered out" de `Bar.js:663` cobre o retângulo de **dimensão zero**, não o valor `null`:
com `null`, o `d3-scale` devolve `unknown`, o item volta a `null` antes do retângulo e o `shape` **não é
chamado**.

**A `GEO-3` cita o circle packing pelo motivo errado.** Medido no `preview.svg` da `v1`: as 14 folhas têm
`k = r/√v` uniforme em **3,3910** e desvio máximo de **0,0008 p.p.** entre área e valor, isto é estão
certas. O desvio está nos **4 anéis de campanha**, até **2,4 p.p.**, e o mecanismo é outro: o raio do pai
nasce do empacotamento e não da soma dos filhos. A citação aponta o modelo certo pela razão errada.

### Quatro descrições erradas no próprio dossiê, três delas achadas por mais de um produtor

A **frase acessível** não sai em `aria-label`, sai em `data-farol-ace`; o único `aria-label` do arquivo é
o da moldura, e quem seguiu a descrição mediu as frases da moldura em vez das suas. O **cabeçalho da
`ESPESSURA-MARCA`** lista três motivos de não medição e omite justamente o que sai, `sem_marca_de_barra`,
apontado por três produtores. A **definição de `marca_fora_do_bar`** está errada: peça de SVG puro sem
`<Bar>` nenhum foi **medida 4 de 4** e uma reprovada por 16 px contra piso de 17, então o que decide é
**haver rótulo por dentro da marca**, não a ausência do `<Bar>`. E a **`GEO-1`** continua repetindo, uma
vez por bloco de versão, que o canvas se declara "por número", quatro rodadas depois de quatro produtores
baterem no aviso do `check` que pede o nome do preset: **eu emendei a armadilha e não o texto que o dossiê
imprime por versão**, o que é conserto pela metade.

### Quatro números que faltam, e um deles falta numa régua que eu escrevi hoje

A **altura da caixa de tinta** de um texto de 11 px, que a `GEO-19` manda reservar contra a borda curva e
não fornece: o dossiê traz a altura de linha e a largura por glifo, e a altura de tinta só para 12 px e de
passagem. A **margem vertical** que o tique da borda do eixo de valor precisa quando o eixo de categoria
está escondido, que custou dois renders a um produtor, porque com `margin.bottom: 0` e `XAxis hide` o
tique `R$ 0` simplesmente some. A nota de que a conta `corpo = canvas − 2×recuo − cabeçalho − 12`
**continua valendo para canvas por número**, que é para onde a `GEO-1` empurra toda peça. E a metade que
falta na **`GEO-18`**: ela descreve o `viewBox` maior que a caixa, que encolhe o texto, e não diz que o
caso inverso é seguro, porque com `xMidYMid meet` a escala é a menor das duas razões.

### Duas tabelas do dossiê que não conversam

A matriz de texto sobre preenchimento aprova `--surface-raised` sobre `--chart-1` a **6,00:1**, e a mesma
marca **composta a 0,72 de opacidade cai para 3,38:1 no claro**, abaixo do piso de texto. A matriz cobre
só a marca opaca, e a tabela de opacidade mínima cobre só a marca contra o cartão; o par texto sobre marca
translúcida não está em nenhuma das duas.

### O que a rodada confirmou, e vale tanto quanto o que derrubou

A correção do dígito tabular foi **reproduzida por um produtor com erro de 0,00 px** nos cinco controles.
A geometria da moldura bateu na vírgula pela sexta e sétima vez, agora também em canvas declarado por
número. A `GEO-16` **não transfere** para circle packing, e o produtor mediu em vez de supor: o menor
círculo desenhou **1,508% da área para 1,508% do valor**, contra os 87% de erro que a armadilha registra
em treemap. E o mecanismo de **declarar em vez de travar** funcionou: três irmãs declararam eixo de 80 px
citando a tensão da `EIX-6`, com a conta escrita, em vez de parar ou inventar formato.

### A lista do que ficou aberto, para quem retomar

Além das réguas e dos números acima: `formatDecimal` devolve **U+002D** em valor negativo, contra a §8 e
a `NUM-3`, e um preview tem quatro coeficientes com hífen e zero ocorrência de U+2212. `formatPercentPoints`
continua com o nome que promete ponto percentual e a saída com sinal de percentual, com 13 peças
chamando-a. Falta guarda para **raio contra área**, que é a lacuna melhor caracterizada do catálogo,
porque a conta é determinística a partir do `preview.svg`. E uma afirmação minha para verificar: eu
registrei três ocorrências de `--surface-overlay` adiadas na `v1` do heatmap, e a fila de dívida traz só
`TAMANHO-TEXTO` para ela, com a `CONTRASTE-MARCA` medindo a peça sem achado.
