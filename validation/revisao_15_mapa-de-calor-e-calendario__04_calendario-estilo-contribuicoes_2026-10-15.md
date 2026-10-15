# Revisão de 15_mapa-de-calor-e-calendario/04_calendario-estilo-contribuicoes, 2026-10-15

Revisor independente. Julgadas as quatro versões: `v1_fechamentos-por-dia-em-2026` com motivo
`revisao_desatualizada` (o `Chart.tsx` mudou depois do veredito de 2026-09-28; julguei o arquivo de
hoje, não a nota antiga) e `v2`, `v3` e `v4` com motivo `sem_revisao`. PNGs de 2026-10-02, mais novos
que os `Chart.tsx` (2026-09-28 e 2026-09-29).

`npm run check -- 15_mapa-de-calor-e-calendario/04_calendario-estilo-contribuicoes`: 0 com erro,
2 avisos, os dois da v1 (TAMANHO-TEXTO em fila de dívida; AGREGACAO-ZERO em `Chart.tsx:103`, limite de
desenho). v2, v3 e v4 saem `ok`, com COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA medidas.

Resultado: v1 reprovada, com cinco bloqueantes; v2, v3 e v4 aprovadas. As observações das quatro
estão no README do modelo, na seção final.

---

## v1_fechamentos-por-dia-em-2026: reprovada

```
Versão: 15_mapa-de-calor-e-calendario/04_calendario-estilo-contribuicoes/v1_fechamentos-por-dia-em-2026
Data: 2026-10-15
Resultado: reprovada
Não: 3, 8, 10, 14, 16, 20
Correções:
  20. ACE-3 e TOK-8: classes de cor só em --seq-5, --seq-6 e --seq-7, com o intervalo de cada classe escrito na legenda.
  14. NUM-5 e NUM-6: "dias úteis sem fechar" não pode contar feriado; tirar os feriados da conta e dar a eles marca própria.
  3. ANO-1: o pico empata em 4 dias; contornar e escrever todos, nunca afirmar "o melhor dia".
  16 e 8. EST-1 e EST-2: data vazio vira bloco role="status"; hoje a tela escreve 0 fechamentos e 0 dias úteis.
  10. TIP-2 e GEO-18: desenhar em escala 1; hoje 13 textos chegam a 10,4 px.
Não se aplica: 4, 6, 18, 27, 28, 29, 30, 31, 32
```

O que a rodada de 2026-09-28 pediu está resolvido e não volta: o recorte do ano em curso aparece no
número, na legenda e no degrau tracejado (DAD-9), e o zero saiu de `--surface-overlay` para
`--surface-sunken`. Os bloqueantes abaixo são outros.

### Bloqueante 1. Pergunta 20, com reflexo na 11 e na 12; ACE-3; armadilha TOK-8; seção 14.1 (contraste)

- **Evidência no código.** `BUCKET_COLORS` (`Chart.tsx:37` a `43`) é `--seq-1`, `--seq-2`, `--seq-3`,
  `--seq-6` e `--seq-7`, para 1, 2, 3, 4 e 5 ou mais fechamentos. A célula de 12 px não leva número.
- **Evidência no dado.** Dos 192 dias com fechamento, 64 têm 1, 94 têm 2 e 18 têm 3: **176 dias, 92%,
  estão nos três degraus que a TOK-8 mede abaixo de 3:1** contra o cartão (1,14, 1,58 e 2,29 no
  escuro; 1,21, 1,49 e 1,92 no claro).
- **Evidência medida no PNG.** No claro, 01/01 (zero, `--surface-sunken`) sai em rgb(234,239,247) e
  02/01 (1 fechamento, `--seq-1`) em rgb(220,236,242): **1,05:1 entre os dois**, e 1,21:1 do dia de
  1 fechamento contra o cartão. No escuro, 1,31:1 entre zero e 1. O subtítulo pergunta pelos dias em
  branco, e no tema claro o dia em branco se separa do dia com 1 fechamento só pela matiz.
- **Por que bloqueia.** Contraste é regra que decide o que o desenho afirma (14.1). É o mesmo defeito
  reprovado em `24_microvisuais-sparklines/04_faixa-de-status-tracker/v2` em 2026-10-05. A legenda
  escreve só as pontas ("0" e "5+"), então nem o texto carrega a ordem, que é a saída da TOK-8.
- **O que mudar.** Três classes em `--seq-5`, `--seq-6` e `--seq-7`, com o intervalo de cada uma
  escrito ao lado da amostra, como a v3 faz (`rangeLabel`). Com o dado padrão, por exemplo, "1",
  "2 a 3" e "4 ou mais" dão 64, 112 e 16 dias; o corte é do corretor. O zero fica fora da rampa:
  `--surface-sunken` passa a medir cerca de 3,2:1 contra `--seq-5` no claro e 5,6:1 no escuro, ou
  adote o traço em `--text-muted` da v3 e da v4 (5,21:1 e 5,37:1 contra o cartão), que faz do dia em
  branco a marca mais legível, e é ele o assunto da peça. Declarar no `notes` o desvio do catálogo
  ("5 faixas de 0 a 4 ou mais") pela TOK-8, reescrever o item 3 de `demonstrates` e, se o zero virar
  traço, a frase da Anatomia, item 8, deste README. Conferir os dois PNGs.

### Bloqueante 2. Pergunta 14; NUM-5 e NUM-6; seção 14.1 (unidade do que se conta)

- **Evidência no dado.** Os 8 dias de segunda a sexta com zero são 01/01, 16/02 e 17/02 (Carnaval),
  03/04 (Sexta-feira Santa), 21/04, 01/05, 04/06 (Corpus Christi) e 07/09: **todos feriados de 2026**.
  Não há, no dado padrão, nenhum dia útil sem fechamento.
- **Evidência no código.** `idleWorkdays` (`Chart.tsx:106`) conta `day.value === 0 && day.row < 5`, isto
  é segunda a sexta, e o painel escreve "8 / dias úteis sem fechar"; a frase acessível repete "8 dias
  úteis terminaram sem nenhum fechamento". O comentário do `data.ts` (linha 8) promete "oito dias úteis
  com zero fechamentos espalhados pelo ano", e eles caíram todos em feriado.
- **Por que bloqueia.** A segunda metade do caso de uso ("quantos dias úteis passam em branco?") é
  respondida com 8 quando a resposta do dado é 0. O número conta uma coisa e o rótulo nomeia outra,
  que é o defeito reprovado hoje em `15/01/v4` ("um dia médio" sobre o volume da semana).
- **O que mudar.** Pôr em `data.ts` uma lista `HOLIDAYS` em `YYYY-MM-DD`, como a v4, e tirar os
  feriados da conta de dia útil; desenhar o feriado com marca própria, distinta do zero (o contorno
  pontilhado em `--text-muted` da v4 serve) e nomeá-la na legenda. Para o caso difícil continuar
  exercitado, mover alguns zeros para dias úteis que não são feriado. Recalcular painel, legenda e
  frase. Trocar o rótulo por "dias de semana" não basta: a pergunta é de dia útil.

### Bloqueante 3. Pergunta 3, com reflexo na 13; ANO-1; seção 14.1 (identificação das marcas)

- **Evidência no dado.** O máximo é 5 e acontece em **4 dias**: 29/04, 30/06, 30/07 e 31/08.
- **Evidência no código e no PNG.** `peak` (`Chart.tsx:105`) fica com o primeiro pelo `>` estrito. O
  contorno marca só 29/04, o painel escreve "29/04/2026 / melhor dia, 5 fechamentos", a legenda diz
  "contorno: melhor dia do ano" e a frase diz "O melhor dia é 29/04/2026". Nos dois PNGs as outras três
  células saem na mesma cor do topo, sem contorno.
- **Por que bloqueia.** O desenho afirma um máximo único que o dado não tem, e a escolha entre os
  empatados é artefato da ordem do array.
- **O que mudar.** Calcular todos os dias no máximo. Com mais de um, contornar todos e escrever o
  empate no painel, na legenda e na frase ("5 fechamentos em 4 dias", com as datas se couberem). Tornar
  o máximo único no `data.ts` resolve a foto, mas o código continua tendo de tratar o empate, porque o
  dado do Farol vai empatar.

### Bloqueante 4. Perguntas 16 e 8; EST-1 e EST-2; seção 14.1 (ausência exibida como zero)

- **Evidência no código.** Não há ramo de vazio nem `role="status"`. Com `data = []` a `<figure>`
  desenha os rótulos de dia da semana num `<svg>` de 31 px, o painel com "0 / fechamentos no ano" e
  "0 / dias úteis sem fechar" e a legenda de 0 a 5+. A tela afirma zero onde não houve medição.
- **O que mudar.** Antes do `return`, o mesmo bloco das irmãs (v2, `Chart.tsx:208` a `219`): raiz
  `flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted`, `role="status"`, ícone
  `Filter` de 16 px e a frase dizendo que o recorte não tem nenhum dia medido. Condição:
  `days.length === 0`. O ternário de `columns` (`Chart.tsx:103`), que gera o aviso AGREGACAO-ZERO,
  deixa de precisar do ramo de zero.

### Bloqueante 5. Pergunta 10; TIP-2; armadilha GEO-18 (texto abaixo do piso no próprio preview)

- **Evidência medida no `preview.svg`, igual nos dois temas.** O `<svg>` do calendário tem `viewBox`
  de 601 x 120 e sai numa caixa de 698 x 113,5 px: escala de 1,161 na largura e **0,946 na altura**, e
  é a menor que manda. Os 13 textos de 11 px do SVG (rótulos de mês e de dia da semana) chegam a
  **10,4 px**, e a TAMANHO-TEXTO acusa. A guarda trata como dívida conhecida e só avisa; a revisão
  não, como em `15/02/v1` e `15/08/v1`: o piso é do contrato e a medição existe.
- **Consequência segunda.** Por `preview_com_escala`, COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA
  não medem a v1, e medem as três irmãs.
- **O que mudar (saída da GEO-18).** Escala exatamente 1. A largura sobra (601 contra 698); o que
  falta são 6,5 px de altura. Ou a geometria cabe nos 113,5 px e o `<svg>` ganha `width` e `height`
  iguais ao `viewBox`, para não esticar (ampliar também desliga as três guardas), ou o canvas vai por
  número e dá ao `<svg>` os 120 px que ele pede, com a conta das linhas no `notes` (GEO-1). Consertado,
  a chave `TAMANHO-TEXTO` da v1 sai de `_render/scripts/lib/divida-guardas.json`, e o `check` deve
  mostrar as três guardas de texto medindo a v1.

### Ordem sugerida e o que não mexer

Primeiro o vazio (4) e a escala (5), que mexem na estrutura; depois a rampa (1), o feriado (2) e o
pico (3), que mexem no dado e na legenda; render por último, `--tema ambos`, e os dois PNGs olhados.
Não mexer: a geometria em UTC com a semana na segunda, o degrau de mês como linha aberta (GEO-9), o
degrau tracejado de fim de medição com a data no número e na legenda, e o zero fora da rampa.

---

## v2_tres-anos-de-receita-reconhecida: aprovada

Sem "não". Domínio da rampa comum aos três anos (EIX-9), cortes por quartil batendo com a legenda
(R$ 34,1 mil, R$ 41,1 mil, R$ 52,1 mil e o máximo observado, R$ 208,3 mil); degrau `--seq-4` com
contorno em `--text-muted` como segunda pista (TOK-8); 6 dias de falha hachurados, distintos do zero;
vazio com `role="status"`; escala 1 com a conta no `notes`. A parte de dezembro sai do dado: 15,2%,
15,9% e 16,8%. Observações no README.

## v3_efeito-de-fim-de-mes-por-dia-do-mes: aprovada

Sem "não". Só `--seq-5` a `--seq-7`, com o intervalo escrito; data inexistente sem desenho; janela
dos últimos 5 dias úteis conferida mês a mês (jan 15 de 33, abr 16 de 39, ago 15 de 32) e o total de
114 de 272; mês incompleto sem taxa; zero em traço; escala 1. Observações no README.

## v4_grade-micro-por-sdr-com-ferias: aprovada

Sem "não". Escala comum de 4 faixas com a mais baixa em quadrado menor; férias vazadas e feriado
pontilhado, fora da classe zero; 6 colunas declaradas no `notes` (agosto de 2026 começa num sábado);
leitura conferida (Elis V. 22 de 52 na sexta, Fábio S. 30 de 56 na segunda). Observações no README.

## Nota de régua, para o dono

A CONTRASTE-MARCA não julga degrau `--seq-*` quando a peça desenha três ou mais degraus
(`guardas.mjs:1355` a `1366`, motivo `marca_de_token_nao_julgado`), então a TOK-8 não tem guarda: a v1
passou calada com 176 células abaixo de 3:1 nos dois temas, e o mesmo defeito já caiu à mão em
`24/04/v2`, `16/06/v3` e `20/04`.
