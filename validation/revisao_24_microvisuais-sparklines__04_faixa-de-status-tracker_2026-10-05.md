# Parecer de revisão: 24_microvisuais-sparklines/04_faixa-de-status-tracker

Data: 2026-10-05. Revisor independente. Primeira revisão das quatro versões (`sem_revisao`).

`npm run check -- 24_microvisuais-sparklines/04_faixa-de-status-tracker`: 0 com erro, 1 aviso
(`CONTRASTE-MARCA` na v4, aceito e anotado), 0 escapes. Os dois PNGs de cada versão foram abertos.
As guardas de texto e de espessura não medem este modelo (`texto_em_html` nas quatro; `marca_html` em
três e `sem_marca_de_barra` na v2), então larguras, posições, cores e textos foram medidos no DOM vivo, com o mesmo pacote e o mesmo
navegador do render, sem gravar nada na pasta das versões. Fidelidade do preview conferida pelos dois
PNGs de cada tema (o do SVG contra o da página): no máximo 0,115% de pixels com qualquer diferença, na
v4, abaixo de 0,5%.

| Versão | Resultado | Bloqueantes |
|---|---|---|
| `v1_sla-diario-da-fila-de-entrada` | aprovada | 0 |
| `v2_entradas-em-52-semanas-com-semana-corrente` | reprovada | 1 |
| `v3_coleta-diaria-de-oito-fontes` | reprovada | 3 |
| `v4_meta-semanal-com-feriado-e-sem-coleta` | aprovada | 0 |

O que está certo nas quatro e não deve ser mexido na correção: ausência como estado próprio, em
contorno `--text-muted` (5,21:1 e 5,37:1) e fora do denominador; o limite conta como dentro (15 min na
v1, 40 agendas na v4); altura menor como segundo canal do estado ruim; resumo e frase acessível saídos
das mesmas contagens do corpo; datas por `formatDate` em UTC a partir de constante do `data.ts`; estado
vazio com `role="status"`; `formatUnavailable()` quando o denominador é zero; ordem das fileiras da v3
declarada no cartão.

## v2_entradas-em-52-semanas-com-semana-corrente: reprovada

### Bloqueante 1. Pergunta 20, com reflexo na 11. ACE-3, seção 17.2 (papel Sequencial), TOK-8

- **Evidência.** `CLASS_COLORS` usa `CHART_SEQUENTIAL_COLORS[2]` a `[6]`, isto é `--seq-3` a `--seq-7`,
  e a célula de 12,36 px não leva número. Medido contra o cartão nos dois temas:

| Classe | Token | Semanas | Escuro | Claro |
|---|---|---|---|---|
| menos de 40 | `--seq-3` | 3 | **2,29:1** | **1,92:1** |
| 40 a 59 | `--seq-4` | 10, a corrente entre elas | 3,38:1 | **2,60:1** |
| 60 a 79 | `--seq-5` | 16 | 4,89:1 | 3,72:1 |
| 80 a 99 | `--seq-6` | 14 | 6,96:1 | 5,45:1 |
| 100 ou mais | `--seq-7` | 7 | 10,12:1 | 8,29:1 |

  No tema claro, 13 das 50 semanas com dado ficam abaixo de 3:1, e são justamente as semanas fracas, que
  respondem metade da pergunta do caso de uso. No escuro, 3 semanas. A 17.2 e a tabela da 17.10 dizem
  que `--seq-1` a `--seq-3` só valem com o valor escrito na célula; a TOK-8 mede a rampa inteira e fecha
  o caso: sem número na célula, só `--seq-5`, `--seq-6` e `--seq-7` passam nos dois temas. O
  `meta.json` reconhece a TOK-8 e segue o catálogo mesmo assim; o catálogo não autoriza o que o
  contrato proíbe. É o mesmo defeito reprovado hoje em `16_distribuicao/06_densidade-kde/v3`.
- **O que mudar.** Ficar nos três degraus que passam nos dois temas: três classes de corte redondo em
  `--seq-5`, `--seq-6` e `--seq-7` (por exemplo menos de 60, de 60 a 99 e 100 ou mais), com `CUTOFFS`
  de dois cortes e a legenda de três amostras, que sai sozinha do `map`. Declarar o desvio do catálogo
  na nota do `meta.json`, como a v4 já faz, e reescrever os itens 1 e 4 do `demonstrates`. Alinhar o que
  ainda diz cinco classes: o comentário do topo do `Chart.tsx`, o comentário de `CUTOFFS` no `data.ts`
  e, no README, as linhas de Quando usar, Versões e Referências. Conferir nos dois temas que semana sem
  dado (contorno) e semana corrente (contorno forte e valor ao lado) continuam distintas da menor classe.

### A alinhar na mesma rodada (observações)

- NUM-6: "113 na semana mais cheia" e "O pico é de 113" na frase acessível sem o substantivo.
- EIX-10 e ROT-4: a semana corrente é pintada com a classe do valor parcial; a amostra da legenda é
  vazada e a marca é preenchida. O contorno e a nota "parcial até" declaram, então não reprova.
- EST-2: com a semana corrente nula o resumo escreve "sem dado" à mão, e não `formatUnavailable()`.
- ESP-5: `border-l border-line-subtle` entre a faixa e o resumo. Sem consequência visível.

## v3_coleta-diaria-de-oito-fontes: reprovada

### Bloqueante 1. Pergunta 29. EIX-12, seção 14.1 (alinhamento entre painéis)

- **Evidência.** As oito fileiras dividem um eixo de datas só, impresso uma vez embaixo, e o mesmo dia
  não cai na mesma coluna de pixels. O estado `off` leva `border border-solid`, e a borda soma 2 px à
  base do `flex-1`: nas fileiras com bloco vazado ele mede 7,45 px e os preenchidos encolhem para
  5,45 px, contra 5,83 px nas fileiras sem bloco vazado. Posição do início do bloco, em px a partir da
  borda do corpo, no canvas `largo` (passo de 6,83 px por dia):

| Dia | Seis fileiras sem bloco vazado | Analytics | Formulários do site |
|---|---|---|---|
| 18º | 272,20 | 299,83 (+27,63) | 266,89 (−5,31) |
| 36º | 395,25 | 416,08 (+20,83) | 384,31 (−10,94) |
| 50º | 490,95 | 506,42 (+15,47) | 503,64 (+12,69) |
| 64º | 586,64 | 596,77 (+10,13) | 594,97 (+8,33) |
| 72º | 641,27 | 648,39 (+7,12) | 647,16 (+5,89) |
| 88º | 750,52 | 751,64 (+1,12) | 751,45 (+0,93) |

  Na Analytics o deslocamento chega a 27,63 px, isto é 4 dias; os 4 dias de coleta parcial dela (64º a
  67º) aparecem um dia e meio à direita das mesmas datas nas outras fontes. A leitura que a pilha de
  fileiras existe para dar, "que fontes falharam no mesmo dia", sai errada sem nenhum sinal na tela.
- **O que mudar.** Todo bloco com a mesma largura, qualquer que seja o estado: o contorno do `off` não
  pode entrar na base do flex. Serve anel interno (`box-shadow: inset 0 0 0 1px`) no lugar de `border`,
  ou a mesma borda de 1 px em todos os blocos na cor do próprio preenchimento, como a v2 já faz, ou
  grade com `repeat(n, minmax(0, 1fr))`. Conferir que o 18º bloco começa no mesmo x nas oito fileiras.

### Bloqueante 2. Seção 14.1 (versão que não demonstra o que o catálogo diz), item 4 do `demonstrates`; pergunta 15 e ROT-9 no modo estreito

- **Evidência.** O modo estreito é item do catálogo e do README (Como colar, passo 4), e o canvas
  `largo` não o fotografa. Montado à parte em três larguras de cartão, nos dois temas:

| Cartão | Corpo | Modo | Faixa | Largura do bloco |
|---|---|---|---|---|
| 390 px | 332 px | 30 dias | 52 px | 0,77 px |
| 360 px | 302 px | 30 dias | 22 px | 0 px |
| 449 px | 391 px | 90 dias | 111 px | 0,24 px |

  As colunas do nome (`w-36`) e do percentual (`w-28`) são fixas e, com os dois vãos, tomam 280 px.
  Abaixo de 384 px de corpo sobram no máximo 103 px para 30 blocos e 29 vãos: 2,47 px por bloco no
  melhor caso, abaixo do piso de 3 px do próprio modelo (README, Quando evitar), e 0,77 px na largura
  de 390 px que a seção 16 do contrato manda conferir. Nessa largura as duas datas colam e se leem como
  um número só, "05/09/202604/10/2026". Logo acima do corte, a 391 px de corpo, o modo de 90 dias
  entrega 0,24 px por bloco, e os blocos vazados, que não encolhem abaixo dos 2 px de borda, tomam a
  faixa inteira: a Analytics mostra só os 17 dias sem agenda e os 73 dias com agenda somem.
- **O que mudar.** No modo estreito a faixa precisa da largura do corpo: nome e percentual numa linha,
  faixa na linha de baixo (332 px dão cerca de 10 px por bloco), ou outra saída que solte as colunas
  fixas. O corte dos 90 dias sobe para onde o bloco chega a 3 px: faixa de 359 px, isto é corpo de
  639 px com as colunas atuais. As duas datas precisam de respiro em qualquer largura. Atualizar o
  passo 4 de Como colar no README e a nota do `meta.json` com o corte novo, e conferir montando o
  cartão a 390 px nos dois temas.

### Bloqueante 3. Pergunta 12. ROT-4, ACE-2 (identificação das marcas pelo segundo canal)

- **Evidência.** A amostra sai de `STATE_CLASS[state].replace('h-5', 'h-3')`, que só troca a altura de
  completa e de sem agenda. Medido: completa 12 x 12 px, parcial **12 x 14 px**, falhou 12 x 10 px. Na
  legenda a parcial é a mais alta das três; na fileira ela é a do meio (20, 14 e 10 px). A altura é o
  canal que a versão declara para não depender de matiz, e a legenda ensina a ordem trocada justo no
  par que o tema claro mais aproxima (verde `--positive` e marrom `--warning`).
- **O que mudar.** Altura da amostra escrita por estado, na mesma ordem da fileira, como a v4 faz com
  o campo `swatch`: por exemplo 12, 8 e 6 px.

### A alinhar na mesma rodada (observações)

- ACE-1 e caso de uso: a frase acessível começa por "Coleta diária", sem o tipo do gráfico, e não diz o
  estado de hoje, que é a primeira metade da pergunta. No dado padrão a Analytics falhou nos 3 últimos
  dias e isso só se lê na última coluna. Cabe na frase e na nota: quantas fontes fecharam hoje completas.
- Nota do `meta.json`: afirma que o cartão avisa que o percentual segue sobre os 90 dias no modo
  estreito; o texto do cartão só diz que aparecem os últimos 30.
- TIP-1: o número da nota do modo estreito não leva `tabular-nums`.
- COR-5: vão de 1 px entre blocos, como o catálogo pede. Os blocos se separam nos dois PNGs.

## v1_sla-diario-da-fila-de-entrada: aprovada

32 perguntas sem bloqueante. Conferido: 26 de 28 dias com dado no corpo e na frase (153 caracteres), os
2 dias sem coleta nas posições 9 e 17 em contorno, os 2 dias fora do SLA com 14 px contra 24 px, texto
de 11 px a 5,21:1 e 5,37:1. Observações, todas no README: `border-l` entre a faixa e o resumo (ESP-5),
bloco sem coleta 2 px mais largo que os demais (13,36 contra 11,36 px, a mesma causa do bloqueante 1 da
v3, aqui sem fileira vizinha para desalinhar), linha órfã em "2 dias sem coleta, fora da conta" e
legenda em 11 px.

## v4_meta-semanal-com-feriado-e-sem-coleta: aprovada

32 perguntas sem bloqueante. Conferido: 14 de 19 semanas com dado no corpo e na frase (209 caracteres),
23 blocos, a 18ª semana no limite conta como batida, a maior sequência de 6 semanas calculada do
array, barra da sequência a 8,16:1 e 8,13:1. O desvio do catálogo (23 semanas, e não 22) está declarado
na nota e a conta fecha: 19 com dado, 3 sem coleta e 1 de feriado.

O aviso do check fica como observação, e a razão é a isenção da ACE-3: o bloco de feriado em
`--line-strong` mede 1,79:1 e 1,83:1, mas leva a palavra "feriado" escrita acima dele e nome na
legenda; tapado o bloco, a informação continua na tela. O limite dessa leitura: o rótulo sai de
`indexOf('holiday')`, então um segundo feriado no recorte ficaria sem palavra e sem contraste. Demais
observações no README: bloco sem dado 2 px mais largo e barra da sequência 2,3 px além do sexto bloco,
colisão latente entre o rótulo da sequência e o de feriado (ROT-9), frase acessível sem o tipo.

## Defeitos de régua e de ferramenta notados

- O catálogo pede na v2 "5 classes de --seq-3 a --seq-7" sem número na célula, e a seção 17.2, a ACE-3
  e a TOK-8 proíbem. O produtor obedeceu ao catálogo e anotou o conflito; a entrada do catálogo precisa
  ser corrigida para três classes, senão a próxima leva repete.
- `CONTRASTE-MARCA` mediu a v2 e não acusou `--seq-3` a 1,92:1 nem `--seq-4` a 2,60:1 no tema claro:
  com três ou mais degraus desenhados a guarda trata a rampa como uso certo e não olha o piso. É a
  mesma lacuna anotada hoje em `16_distribuicao/06_densidade-kde`.
- O render só fotografa o canvas do `meta.json`, então modo de largura estreita por container query
  passa por check, render e PNG sem ser visto. O defeito do bloqueante 2 da v3 só apareceu montando o
  cartão à parte, a 390 px.
- Borda em filho `flex-1` muda a largura do bloco sem aviso. Vale uma entrada GEO no `ARMADILHAS.md`:
  o estado vazado em contorno é regra do modelo e a forma óbvia de escrevê-lo desalinha as fileiras.
