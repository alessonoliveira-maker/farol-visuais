# Revisão de 15_mapa-de-calor-e-calendario/05_calendario-mensal-em-grade, 2026-10-15

Revisor independente. Julgadas as quatro versões: `v1_reunioes-realizadas-em-setembro` com motivo
`revisao_desatualizada` (o `Chart.tsx` mudou depois do veredito de 2026-09-28; julguei o arquivo de
hoje, não a nota antiga) e `v2`, `v3` e `v4` com motivo `sem_revisao`. PNGs de 2026-10-02, mais novos
que os `Chart.tsx` (2026-09-28 e 2026-09-29).

`npm run check -- 15_mapa-de-calor-e-calendario/05_calendario-mensal-em-grade`: 0 com erro, 1 aviso
(AGREGACAO-ZERO em `v1/Chart.tsx:70`, em fila de dívida). As quatro saem `texto_em_html` nas três
guardas de texto, então o contraste foi conferido à mão contra `app/src/styles/tokens.css`: os pares de
texto dos `notes` conferem (o mais apertado é `--text-muted` sobre `--surface-sunken` no claro, 4,65:1),
e o único número errado está numa observação da v3.

Resultado: as quatro reprovadas. O bloqueante comum é o vazio (pergunta 16): nenhuma das quatro tem
`role="status"`, e com `data = []` cada uma escreve zero onde não houve medição. É o defeito reprovado
hoje em `15/03` e em `15/04/v1`, e a saída é o bloco que as irmãs da família já usam. Além dele, a v1
não entrega um item do catálogo, a v2 e a v3 têm frase acessível que não diz o que a versão existe para
dizer, e a v4 tem `--chart-1` em dois papéis e a frase com a janela mal contada. Observações no README
do modelo, na seção final.

**O bloco de vazio, igual para as quatro.** Antes do `return`, com a condição `data.length === 0`: raiz
`flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted`, `role="status"`, ícone lucide
`Filter` de 16 px e uma frase de 12 px dizendo que o recorte não tem nenhum dia medido (na v4, nenhum
marco registrado) e o que isso significa. É o desenho da `15/04/v2` (`Chart.tsx:208` a `219`).

---

## v1_reunioes-realizadas-em-setembro: reprovada

```
Versão: 15_mapa-de-calor-e-calendario/05_calendario-mensal-em-grade/v1_reunioes-realizadas-em-setembro
Data: 2026-10-15
Resultado: reprovada
Não: 8, 16, e o item 4 do catálogo
Correções:
  16 e 8. EST-1 e EST-1b: data vazio vira bloco role="status"; a média de lista vazia é null, nunca 0.
  Catálogo, item 4: desenhar os dias de agosto e outubro nas pontas, sem cor e em --text-muted.
Não se aplica: 4, 6, 7, 13, 18, 27, 28, 29, 30, 31, 32
```

### Bloqueante 1. Perguntas 16 e 8; EST-1 e EST-1b; seção 14.1 (ausência exibida como zero)

- **Evidência no código.** Não há ramo de vazio nem `role="status"`. Com `data = []` a `<figure>`
  desenha o cabeçalho de dias, as 42 células vazias e a legenda inteira, que escreve "0 no mês, média
  de 0,0 por dia útil" e "0 dias úteis sem reunião". A linha 70 devolve `0` para `workdays` vazio (é o
  aviso AGREGACAO-ZERO), então um mês com dado e sem nenhum dia útil medido também escreve "média de
  0,0 por dia útil".
- **O que mudar.** O bloco de vazio acima. `average` passa a `number | null` por uma função como o
  `averageOf` da v2 (linhas 74 a 78), e a legenda escreve "sem dia útil medido para a média" quando for
  null, como a v2 e a v3 já fazem. A fila de dívida da AGREGACAO-ZERO perde a entrada da v1.

### Bloqueante 2. Catálogo, item 4 de `o_que_demonstra`; seção 14.1 (versão que não demonstra o que o catálogo diz)

- **Evidência.** O catálogo (`_estudo/catalogo/15_mapa-de-calor-e-calendario.json`) dá à v1 quatro
  itens, e o quarto é "Dias de agosto e outubro nas pontas sem cor e em --text-muted". O código desenha
  `<div />` vazio em toda posição fora do mês (linha 103), e nos dois PNGs a segunda de 31/08 e as
  posições de 01/10 a 11/10 (fim da quinta linha e a sexta inteira) saem em branco. A Anatomia do
  README, item 5, registra a escolha, mas o `notes` não declara o desvio e o catálogo não mudou.
- **O que mudar.** Gerar as pontas como a v3 (`daysInMonth`, `shiftMonth` e `buildGrid`, linhas 64 a
  111 dela): número do dia em `--text-muted`, sem preenchimento e sem valor. Atualizar o item 5 da
  Anatomia do README, que hoje diz "não desenhados na v1 e na v2".

### Aproveitar a mesma passada (não bloqueia; também no README)

- O `notes` ainda cita `--surface-overlay` para o zero; o código usa `--surface-sunken`.
- A frase escreve "1 dia sem expediente ficou fora da média" com singular fixo (linha 84): com 0 ou 2
  feriados sai "0 dia" ou "2 dia". `formatDays` resolve.
- O tracejado do feriado em `--line-strong` mede 1,79:1 e 1,83:1; a v3 já trocou por `--text-muted`.
- Nenhum dia útil termina em zero (os zeros caem todos em sábado e domingo), e o `meta.json` promete
  "dia útil em zero" como estado. Um dia útil em 0 no `data.ts` exercita a segunda metade do caso de uso.

---

## v2_dias-acima-da-capacidade-de-agenda: reprovada

```
Versão: 15_mapa-de-calor-e-calendario/05_calendario-mensal-em-grade/v2_dias-acima-da-capacidade-de-agenda
Data: 2026-10-15
Resultado: reprovada
Não: 8, 16, 19
Correções:
  16 e 8. EST-1: data vazio vira bloco role="status"; hoje a linha de leitura escreve "0 dos 0 passaram dele".
  19. ACE-1 e catálogo, item 4: a frase acessível nomeia os dias acima do teto, não só quantos são.
Não se aplica: 4, 6, 7, 13, 18, 27, 28, 29, 30, 31, 32
```

### Bloqueante 1. Perguntas 16 e 8; EST-1; seção 14.1 (ausência exibida como zero)

- **Evidência no código.** Sem ramo de vazio. Com `data = []` a grade sai com 42 células vazias, a
  legenda com as quatro amostras, e a linha de leitura (linhas 106 a 108) escreve "Teto de 22 agendas
  por dia útil, e 0 dos 0 passaram dele". Média e pico já devolvem null (linhas 74 a 86) e a legenda
  os trata; falta o portão do conjunto.
- **O que mudar.** O bloco de vazio do topo. Para dado com dias mas nenhum com expediente
  (`worked.length === 0`), a linha de leitura diz que não há dia útil medido, em vez de "0 dos 0".

### Bloqueante 2. Pergunta 19; ACE-1; catálogo, item 4; seção 14.1

- **Evidência.** O caso de uso pergunta "em quais dias", e o catálogo pede "Frase acessível com os
  dias acima do teto e o maior valor do mês". A frase do preview (218 caracteres) diz "5 dos 21 dias
  úteis passaram do teto de 22 agendas, e o pico foi 28 no dia 25": quantos, nunca quais. O resto da
  figura é `aria-hidden`, então para quem ouve a resposta da versão (dias 5, 11, 12, 24 e 25) não existe.
- **O que mudar.** Listar os dias de `over` na frase ("nos dias 5, 11, 12, 24 e 25"), com um teto de
  dias citados e o resto contado quando a lista for longa, e "nenhum dia útil passou do teto" quando
  for vazia. Para caber em 250, a última oração ("Fim de semana não tem expediente e fica fora das
  contas.", 56 caracteres) sai ou encurta. Na mesma passada, "o pico foi 28 agendas" (NUM-6).

---

## v3_mes-de-seis-semanas-com-feriado: reprovada

```
Versão: 15_mapa-de-calor-e-calendario/05_calendario-mensal-em-grade/v3_mes-de-seis-semanas-com-feriado
Data: 2026-10-15
Resultado: reprovada
Não: 8, 16, 19
Correções:
  16 e 8. EST-1: data vazio vira bloco role="status"; hoje a grade escreve dias 32 a 36 e "0 agendas em 0 dias úteis medidos".
  19. ACE-1: "o feriado saiu da média" é texto fixo; contar os feriados do dado e escrever a oração só quando houver.
Não se aplica: 4, 6, 7, 13, 18, 27, 28, 29, 30, 31, 32
```

### Bloqueante 1. Perguntas 16 e 8; EST-1; seção 14.1 (ausência exibida como zero)

- **Evidência no código.** Sem ramo de vazio. Com `data = []`, `buildGrid` (linhas 85 a 111) põe os
  seis dias de out/26 e completa as 36 posições restantes com `next` de 1 a 36, então a grade escreve
  dias 32 a 36, que não existem. A linha de leitura (linhas 170 a 172) escreve "Parcial até 24/11/2026:
  0 agendas em 0 dias úteis medidos", e a legenda "0 dias útil sem agenda" e "0 dias a medir".
- **O que mudar.** O bloco de vazio do topo, antes de montar a grade.

### Bloqueante 2. Pergunta 19; ACE-1 (frase calculada do dado); seção 14.1

- **Evidência no código.** A frase (linhas 174 a 181) tem a oração fixa "o feriado saiu da média"
  (linha 180), que nenhum dado calcula: com um mês sem feriado no `data` a frase afirma um feriado que
  não existe, e com dois diz "o feriado". O componente recebe `month` e `data` por prop, e o passo 3
  do "Como colar" manda o mês vir do seletor da página, então a frase vai ao Farol com qualquer mês.
  É a régua aplicada em `09_dispersao-e-bolhas/10_matriz-de-dispersao` em 2026-10-14: frase que afirma
  o que o dado pode não ter bloqueia como encoding.
- **O que mudar.** Contar as células `feriado` e escrever "1 feriado saiu da média" ou "N feriados
  saíram da média", e omitir a oração com zero. Na mesma frase, "1 dia útil ficou sem agenda" quebra a
  concordância com 2 ou mais ("2 dias útil ficou"), igual na legenda (linha 314); e "em seis semanas"
  (linha 177) vale para a grade, que tem sempre seis linhas, mas lê como mês de seis semanas: calcular
  as semanas do mês por `Math.ceil((offset + dias do mês) / 7)` tira a ambiguidade.

---

## v4_calendario-de-marcos-com-janela-de-leitura: reprovada

```
Versão: 15_mapa-de-calor-e-calendario/05_calendario-mensal-em-grade/v4_calendario-de-marcos-com-janela-de-leitura
Data: 2026-10-15
Resultado: reprovada
Não: 8, 11, 16, 19
Correções:
  16 e 8. EST-1: data vazio vira bloco role="status"; hoje a linha de leitura escreve "0 marcos" sobre o mês desenhado inteiro.
  11. 17.2: --chart-1 é a categoria "prazo interno" e o anel de hoje; tirar um dos dois papéis.
  19. ACE-1: "atravessa 3 semanas" conta as linhas desenhadas, não a janela, e "fora do mês" é texto fixo.
Não se aplica: 4, 6, 7, 13, 18, 27, 28, 29, 30, 31, 32
```

### Bloqueante 1. Perguntas 16 e 8; EST-1; seção 14.1

- **Evidência no código.** Com `data = []` o calendário sai inteiro (janela, hoje, recesso), a linha
  de leitura (linhas 190 a 192) escreve "0 marcos em dez/26, e 0 caem na janela que abre em
  14/12/2026", e a frase diz "sem nenhum prazo registrado": corpo e frase dizem duas coisas, e nenhum
  dos dois é o estado vazio da EST-1.
- **O que mudar.** O bloco de vazio do topo, com a frase falando de marco registrado.

### Bloqueante 2. Pergunta 11; 17.2 ("um token tem um papel só dentro do mesmo visual"); seção 14.1 (papel de cor)

- **Evidência no código.** `KIND_FILLS.prazo` é `--chart-1` (linha 48), papel Categórico, e
  `RING_TODAY` também é `--chart-1` (linha 63), papel Destaque.
- **Evidência no PNG.** Nos dois temas o anel de 09/12 sai na mesma cor do chip "Envia o orçamento",
  que ele abraça: o dia corrente lê como dia de prazo interno. O item 4 do catálogo pede "Hoje ...
  marcado sem cor de valor", e aqui a cor do anel é a de uma categoria. É o defeito reprovado em
  `12_hierarquia/04_arvore-de-indicadores` em 2026-10-14.
- **O que mudar, uma das duas.** (a) Chips nos slots 3, 6 e 5, deixando o 1 só para o destaque, com o
  desvio da COR-8 declarado no `notes`; o vazado `--surface-raised` sobre `--chart-5` mede 5,90:1 no
  escuro e 6,25:1 no claro, e a marca contra o cartão mede o mesmo. (b) Manter os chips e marcar hoje
  sem `--chart-1`: palavra "hoje" junto do número, que já sai em 700, e anel num token sem outro papel
  na peça, medido a 3:1 contra o cartão e contra o poço nos dois temas. Atualizar a Anatomia do README,
  item 7, e conferir os dois PNGs.

### Bloqueante 3. Pergunta 19; ACE-1; seção 14.1

- **Evidência.** A frase diz "A janela de leitura abre em 14/12/2026, atravessa 3 semanas e termina em
  13/01/2027, fora do mês". `crossed` (linha 183) conta as linhas da grade que a barra toca, mas de
  14/12/2026 a 13/01/2027 são 31 dias em 5 semanas de segunda a domingo: quem ouve recebe uma janela
  de três semanas que termina 30 dias depois de abrir. E "fora do mês" é texto fixo
  (linha 200): com `windowEnd` dentro do mês, a frase afirma o falso.
- **O que mudar.** Dizer o que se conta ("ocupa as 3 últimas semanas do mês" ou a duração real, "dura
  31 dias"), e escrever "fora do mês" só quando `windowEnd` passa do último dia de `month`. Na mesma
  frase, "21 prazos" vira "21 marcos", como na linha de leitura (a legenda chama de prazo interno só 12
  dos 21), e "com 4" vira "com 4 marcos" (NUM-6).

---

## Ordem sugerida e o que não mexer

Primeiro o bloco de vazio nas quatro, que é o mesmo código; depois a média nula e as pontas da v1, as
frases da v2, da v3 e da v4, e o papel do `--chart-1` na v4. Render por último, `--tema ambos`, e os
dois PNGs olhados; a frase nova conferida no `data-farol-ace` do `preview.svg` (100 a 250 caracteres).

Não mexer: a semana na segunda calculada em UTC; as seis linhas reservadas (e a exceção declarada da
v4); o zero no poço, fora da rampa; a rampa da v2 derivada do teto, com o anel de alerta separado do
preenchimento por 2 px da cor do cartão; os tercis da v3 com o teto de cada degrau escrito e o último
no maior valor observado; o dia futuro com relógio e sem número; a barra da v4 por semana, com canto só
na ponta real; o texto vazado sem halo nos chips (ROT-7b); as contas de canvas por número nos `notes`.

## Nota de régua, para o dono

Nenhuma guarda do `check` cobra a EST-1: as quatro versões saem `ok` sem `role="status"`, e o vazio só
cai na revisão à mão, como caiu hoje em `15/03` e `15/04/v1`. Uma guarda que procure, no `Chart.tsx`,
um retorno com `role="status"` condicionado ao comprimento do `data` pegaria a classe inteira. E as
peças `html-tailwind` saem `texto_em_html` nas três guardas de texto, então o contraste delas é sempre
medição à mão, contra os números que o próprio produtor escreveu no `notes`.
