# Parecer de revisão: 24_microvisuais-sparklines/07_win-loss

Data: 2026-10-05. Revisor independente, primeira passada das quatro versões (`sem_revisao`).

> Atualização de 2026-10-05: a `v1` e a `v2` foram corrigidas e rejulgadas. O estado que vale para as
> duas está na seção **Segunda passada**, no fim deste arquivo: `v1` aprovada, `v2` reprovada por um
> bloqueante novo (pergunta 8). O texto abaixo fica como registro da primeira passada.

`npm run check -- 24_microvisuais-sparklines/07_win-loss`: 0 com erro, 0 avisos, 0 escapes. Os dois PNGs
de cada versão foram abertos. As guardas de texto não medem este modelo (`texto_em_html` nas quatro) e a
de espessura também não (`marca_fora_do_bar`), então geometria, cores e textos foram medidos nos PNGs
dos dois temas contra o `data.ts`. Fidelidade do preview, pelo PNG do SVG contra o PNG da página: de
0,007% (`v3`) a 0,130% (`v1`) de pixels com qualquer diferença, abaixo de 0,5%.

| Versão | Resultado | Não |
|---|---|---|
| `v1_sla-semanal-em-26-semanas` | reprovada | 8, com reflexo na 19 |
| `v2_maior-sequencia-fora-do-sla-anotada` | reprovada | 17 |
| `v3_meta-mensal-por-executivo` | aprovada | nenhum |
| `v4_meses-sem-meta-empate-e-sem-coleta` | aprovada | nenhum |

As observações não bloqueantes das quatro versões estão no README do modelo, seção
`Observações da revisão (não bloqueantes)`. Este arquivo trata do que reprova e do que convém alinhar
na mesma rodada, já que o modelo tem uma rodada de correção só.

## O que está certo e não deve ser mexido na correção

* Blocos de altura fixa com vão de 2 px entre vizinhos e 1,5 px livre de cada lado da linha central
  (COR-5). Medido na `v1`: bloco de 9,7 por 12 px; na `v2`: 20 por 16 px; na `v3`: 14 por 10 px.
* Marcas contra o cartão: `--positive` a 7,36:1 e `--negative` a 5,50:1 no escuro; 5,34:1 e 6,36:1 no
  claro. Empate, contorno de ausência e colchetes em `--text-muted`, a 5,21:1 e 5,37:1.
* Todo texto em HTML, fora do SVG esticado, em 14, 12 e 11 px; nenhum texto sobre marca.
* Datas em UTC a partir de constante do `data.ts`, por `formatDate` e `formatMonthShort`.
* Estado vazio com `role="status"`, ícone `Filter` e frase de 12 px nas quatro.
* Contagens do corpo e da frase acessível saídas das mesmas variáveis: 19 de 26, 6 semanas, 11 de 12,
  2 de 4. Frases de 161, 173, 185 e 194 caracteres, começando por "Win/loss".
* Na `v2`, o colchete cobre exatamente a sequência (de 332 a 593 px no PNG, as mesmas bordas do 1º e do
  6º bloco) e o empate quebra a contagem em `longestLossRun`.
* Na `v3`, os rótulos de trimestre caem na coluna do 1º, 4º, 7º e 10º bloco, com ao menos 13 px entre
  um rótulo e o seguinte, e o peso 700 fica só no nome e na contagem do destaque.
* Na `v4`, mês sem meta nunca vira derrota, e a conta sai só de meses com meta e coleta.

## v1_sla-semanal-em-26-semanas: reprovada

Um bloqueante, e ele mora no ramo, não na foto: os dois PNGs do dado padrão estão corretos e legíveis.

### Bloqueante 1. Semana sem resultado é escrita como semana fora do SLA

Pergunta 8, com reflexo na 19. Regras: EIX-10 e EST-2 (ausência nunca vira zero), seção 14.1 (ausência
exibida como zero decide o que o desenho afirma e bloqueia sempre), armadilha DAD-2.

**Evidência no código.**

* `Chart.tsx`, linha 77: `const lastWord = data.at(-1) === 'win' ? 'dentro do SLA' : 'fora do SLA';`.
  Tudo o que não é vitória vira "fora do SLA", inclusive `tie` e `null`.
* Linhas 78 a 83: `runLine` cai em `a última semana fechou ${lastWord}` sempre que as duas sequências
  finais têm menos de 2 semanas. Com a última semana nula ou em empate, `winRun` e `lossRun` valem 0 e
  o texto sai "a última semana fechou fora do SLA".
* `runLine` vai para dois lugares: a linha de leitura visível (linha 103) e a frase acessível (linhas 85
  a 87). O desenho, no mesmo caso, não põe bloco nenhum na última posição (linha 37), então a tela
  mostra uma semana vazia e escreve que ela falhou.
* Com todas as semanas nulas o cartão escreve `formatUnavailable()` no resumo e, logo abaixo, "a última
  semana fechou fora do SLA".

**Por que não é hipótese remota.**

* O tipo `Outcome` do próprio `data.ts` declara `tie` e `null` ("fazem parte do tipo, mas este recorte
  não os usa"), e a prop `data` os aceita.
* O README, em Como colar no Farol, manda entregar o resultado "já classificado em `win`, `loss`, `tie`
  ou `null`". Quem cola a `v1` trocando só o dado passa por esse ramo.
* A posição em que o nulo mais aparece numa série semanal é justamente a última: a semana que ainda não
  teve coleta. É o caso em que o texto mente.
* O modelo existe para isto. O Que é do README diz que período sem dado não ganha marca, e o catálogo
  diz que sem dado e derrota são desenhos diferentes. A `v1` cumpre no desenho e descumpre no texto.

**O que mudar.**

1. Tratar os quatro desfechos da última semana, em vez de dois: vitória ("fechou dentro do SLA"),
   derrota ("fechou fora do SLA"), empate ("fechou no limite do SLA") e ausência. Na ausência, escrever
   que a última semana não tem resultado, com `formatUnavailable()` no lugar do desfecho (EST-2), e
   nunca a palavra "fora".
2. A frase acessível hoje conta só "dentro" e "fora". Quando houver empate ou semana sem resultado,
   contar os dois à parte, como a `v2` já faz com "1 no limite", para a soma fechar com o total de
   semanas anunciado.
3. Conferência: renderizar uma vez com a última semana nula e outra com a última em empate, ler a linha
   de leitura e a frase, e devolver o dado padrão. O `data.ts` não precisa mudar.

### A alinhar na mesma rodada (observações da `v1`)

* Empate sem marca: `blockAt` (linha 37) devolve nulo para `tie`, e `measured` (linha 72) soma só
  vitórias e derrotas. A semana no limite some do desenho e do denominador, igual à semana sem dado. A
  anatomia pede traço central de 2 px em `--text-muted`, que a `v2` desenha na linha 133; e a `v4` põe o
  empate no denominador sem contá-lo como vitória.
* Redação das datas: a frase acessível diz "de 06/04/2026 a 28/09/2026", que são as segundas de
  abertura da primeira e da última semana. As pontas do eixo dizem "semana de"; a frase não.
* ROT-4 e tabela 17.1: legenda abaixo do desenho, em 11 px e `--text-muted`. Sem consequência visível.

## v2_maior-sequencia-fora-do-sla-anotada: reprovada

Um bloqueante, e ele está no dado padrão, nos dois PNGs.

### Bloqueante 1. A linha de leitura atribui o empate à sequência errada, e o trecho é texto fixo

Pergunta 17. Regras: ANO-5 (linha de leitura calculada do dado), seção 14.1 (o que o desenho afirma).

**Evidência no código.** `Chart.tsx`, linha 122, ramo com sequência:
`a maior, de ${runStart} a ${runEnd}; o empate no limite do SLA a interrompe`. As datas são calculadas;
a oração do empate é literal. Nada nela consulta `ties` nem a posição do empate.

**Evidência no PNG, igual nos dois temas.** O cartão escreve "a maior, de 18/05/2026 a 22/06/2026; o
empate no limite do SLA a interrompe". O pronome só tem um antecedente, a maior sequência. No desenho:

| Trecho | Semanas (índice) | Datas de abertura | Posição no PNG |
|---|---|---|---|
| Maior sequência, sob o colchete | 7ª a 12ª (6 a 11) | 18/05/2026 a 22/06/2026 | 332 a 593 px |
| Vitórias que a encerram | 13ª e 14ª (12 e 13) | 29/06/2026 e 06/07/2026 | 598 a 682 px |
| Outra série, 3 derrotas | 15ª a 17ª (14 a 16) | 13/07/2026 a 27/07/2026 | 687 a 814 px |
| Empate | 18ª (17) | 03/08/2026 | 820 a 858 px |
| Outra série, 3 derrotas | 19ª a 21ª (18 a 20) | 10/08/2026 a 24/08/2026 | 864 a 991 px |

O empate está 113 px à direita do fim do colchete (medida em px de tela, metade da distância no PNG),
dentro da outra série. A maior sequência começa depois de uma vitória e termina numa vitória: nenhum
empate a toca. O próprio `data.ts` e a nota do `meta.json` dizem o certo: o empate parte em 3 e 3 a
série que teria 7 semanas, e por isso a de 6 fica sendo a maior.

**Consequência.** A segunda metade do caso de uso é "quando ela terminou?". O cartão responde com uma
causa falsa, e quem procura o empate ao lado do colchete não o encontra. E como a oração é fixa, um
recorte sem empate nenhum continua escrevendo que "o empate a interrompe".

**O que mudar.**

1. Calcular a oração do dado, em função pura, como `longestLossRun`: procurar o empate que tem derrota
   dos dois lados e dizer qual semana é e o que ele separa. Com o dado padrão o texto fica na linha de
   "o empate da semana de 03/08/2026 parte em 3 e 3 a série que teria 7".
2. Sem empate colado em derrota, a oração não é escrita. A linha fica só com as datas da maior.
3. Dizer quando a maior terminou, que é a pergunta: "da semana de 18/05/2026 à de 22/06/2026". As datas
   são as segundas de abertura, e sem "semana de" o leitor conta 5 semanas e um dia.
4. Conferir que a linha cabe em 574 px a 11 px sem `truncate` (TIP-7); se não couber, quebrar em duas
   linhas, com a data da maior na primeira.
5. Conferência: renderizar uma vez trocando o `T` do `data.ts` por `L` (a série vira 7 e passa a ser a
   maior, sem empate no recorte) e ler a linha; devolver o dado padrão.

### A alinhar na mesma rodada (observações da `v2`)

* TIP-1: o rótulo sob o colchete (linha 152) leva o algarismo sem `tabular-nums`.
* Pergunta 2: "6 semanas seguidas fora" aparece duas vezes, no topo em 14 px e sob o colchete em 11 px.
  O rótulo do colchete é o que o catálogo pede; o topo pode dizer quando a sequência terminou.
* A frase acessível também diz "de 18/05/2026 a 22/06/2026" sem "semana de".
* Legenda sem "acima da linha" e "abaixo da linha", que a `v1` e a `v3` escrevem.
* Plural fixo no ramo sem sequência (linha 121): "1 semanas fora do SLA".
* Sobra vertical: 164,5 px de conteúdo num corpo de 241,5 px.

## Registro

```
Versão: 24_microvisuais-sparklines/07_win-loss/v1_sla-semanal-em-26-semanas
Data: 2026-10-05
Resultado: reprovada
Não: 8 (reflexo na 19)
Correções:
  8. EIX-10 e EST-2: tratar os quatro desfechos da última semana em lastWord; semana nula ou em
     empate nunca sai escrita como fora do SLA, na linha de leitura e na frase acessível.
Não se aplica: 6, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

```
Versão: 24_microvisuais-sparklines/07_win-loss/v2_maior-sequencia-fora-do-sla-anotada
Data: 2026-10-05
Resultado: reprovada
Não: 17
Correções:
  17. ANO-5: calcular do dado a oração do empate na linha de leitura (qual semana, entre quais
      trechos) e omiti-la sem empate colado em derrota; hoje ela é fixa e aponta a sequência errada.
Não se aplica: 6, 18, 26, 27, 28, 29, 30, 31, 32
```

```
Versão: 24_microvisuais-sparklines/07_win-loss/v3_meta-mensal-por-executivo
Data: 2026-10-05
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 13, 18, 26, 27, 28, 30, 31, 32
```

```
Versão: 24_microvisuais-sparklines/07_win-loss/v4_meses-sem-meta-empate-e-sem-coleta
Data: 2026-10-05
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 18, 26, 27, 28, 29, 30, 31, 32
```

---

# Segunda passada: v1 e v2 depois da rodada de correção

Data: 2026-10-05. Revisor independente, outra instância. Motivo: `revisao_desatualizada` nas duas (o
`Chart.tsx` mudou depois do veredito). Foi julgado o arquivo de hoje, não a nota acima. A `v3` e a `v4`
não foram rejulgadas e seguem com o veredito da primeira passada.

`npm run check -- 24_microvisuais-sparklines/07_win-loss`: 0 com erro, 0 avisos, 0 escapes. Os PNGs
dos dois temas são mais novos que o `Chart.tsx`, foram abertos e medidos. Fidelidade, PNG do SVG contra
PNG da página: 0,13% na `v1` e 0,09% na `v2`, nos dois temas. Os ramos foram conferidos por execução
fora da árvore: os dois `Chart.tsx` empacotados no diretório temporário e renderizados em texto com o
dado trocado pela prop `data`. Nenhum arquivo do catálogo foi tocado para isso.

| Versão | Resultado | Não |
|---|---|---|
| `v1_sla-semanal-em-26-semanas` | aprovada | nenhum |
| `v2_maior-sequencia-fora-do-sla-anotada` | reprovada | 8, com reflexo na 25 |

## Os dois bloqueantes da primeira passada estão corrigidos

* `v1`, pergunta 8: `lastLine` (linhas 80 a 87) trata os quatro desfechos. Executado: última semana
  nula escreve "a última semana não tem resultado medido"; em empate, "a última semana fechou
  exatamente no limite do SLA"; em derrota, "a última semana fechou fora do SLA". A frase conta à parte
  "1 no limite" e "1 sem resultado medido", e a soma fecha com as 26 semanas. Com todas nulas o resumo
  escreve `formatUnavailable()` e a linha não diz "fora".
* `v2`, pergunta 17: a oração do empate deixou de ser texto fixo (linhas 96 a 104). No dado padrão a
  linha é "a maior, de 18/05/2026 a 22/06/2026", sem oração, e está certo: nenhum empate toca a maior.
  Executado: empate na semana seguinte escreve "o empate no limite da semana de 29/06/2026 a encerra";
  na anterior, "o empate no limite da semana de 11/05/2026 a precede"; sem empate vizinho, nada. A
  linha mais longa tem 88 caracteres, cerca de 484 px a 11 px, e cabe nos 574 px do corpo.

## Medido nos PNGs de hoje, igual nos dois temas salvo onde dito

| Medida | `v1` | `v2` |
|---|---|---|
| Marcas contra o `data.ts` | 19 acima e 7 abaixo, na ordem do array | 11 acima, 14 abaixo e 1 traço, na ordem do array |
| Bloco e vão | 9,7 por 12 px, vão de 2 px | 20 por 16 px, vão de 2 px |
| `--positive` e `--negative` contra o cartão | 7,36 e 5,50:1 no escuro; 5,34 e 6,36:1 no claro | os mesmos |
| Texto mais fraco, `--text-muted` em 11 px | 5,21:1 no escuro; 5,37:1 no claro | os mesmos |
| Empate e colchete, `--text-muted` | não se aplica | 5,21 e 5,37:1; traço de 2 px; colchete de 332 a 593 px, as bordas do 1º e do 6º bloco |
| Frase acessível | 161 caracteres | 173 caracteres |
| Tinta do corpo | 147 px de altura em 155,5 px, sem corte | 158 px em 241,5 px, sem corte |

## v2_maior-sequencia-fora-do-sla-anotada: reprovada

Um bloqueante novo, que a primeira passada não apontou e que não nasceu da correção. Ele mora no ramo:
os dois PNGs do dado padrão estão corretos e legíveis.

### Bloqueante 1. Janela sem nenhuma semana medida sai escrita como zero semana fora do SLA

Pergunta 8, com reflexo na 25 (vazio separado de indisponível). Regras: EST-2 ("Indisponível escreve
`formatUnavailable()`", "Nunca zero"), EST-1b ("a guarda de vazio testa a lista que alimenta a conta,
nunca a lista vizinha") e seção 14.1 (ausência exibida como zero bloqueia sempre). Armadilhas DAD-6 e
DAD-2 ("Ausência sai da amostra e é contada no rodapé, sempre").

**Evidência no código.**

* Linha 73: a guarda de vazio testa `data.length === 0`. O tipo `Outcome` aceita `null`, e a linha 144
  desenha a semana nula como nada. Um array de 26 nulos passa pela guarda.
* Linhas 86 a 89: `wins`, `losses`, `ties` e `longestLossRun` só enxergam semanas com resultado. Sem
  nenhuma, valem 0, 0, 0 e `null`. Nada no arquivo conta as semanas nulas.
* Linha 125: com `run === null` o topo escreve "sem sequência fora do SLA".
* Linha 130: a linha de leitura escreve `formatInt(losses)` seguido de "semanas fora do SLA, nenhuma
  colada na outra".
* Linhas 108 a 113: a frase acessível soma só dentro, fora e no limite.

**Evidência por execução**, com o dado trocado pela prop.

| Dado | Topo, 14 px | Linha de leitura, 11 px | Frase acessível |
|---|---|---|---|
| 26 semanas nulas | sem sequência fora do SLA | 0 semanas fora do SLA, nenhuma colada na outra | 0 dentro, 0 fora e 0 no limite. Nenhuma sequência de derrotas. |
| 13 vitórias e 13 nulas | sem sequência fora do SLA | 0 semanas fora do SLA, nenhuma colada na outra | em 26 semanas: 13 dentro, 0 fora e 0 no limite |
| 1 nula no meio da maior | 3 semanas seguidas fora | a maior, de 08/06/2026 a 22/06/2026 | 11 dentro, 13 fora e 1 no limite, soma 25 de 26 |

Na primeira linha o SVG sai com zero marcas, só a linha central, e o cartão afirma que não houve
sequência fora do SLA e que foram 0 semanas fora. Não houve medição nenhuma. É o mesmo estado que a
`v1` trata na linha 114 (`measured === 0 ? formatUnavailable()`).

**Por que não é hipótese remota.**

* O README, em Como colar no Farol, manda entregar `null` para semana sem dado. Fila recém criada ou
  com a coleta parada entrega a janela inteira nula: é o estado indisponível do Farol, que a pergunta
  25 manda manter separado do vazio.
* O texto do estado vazio do próprio arquivo (linha 81) já diz o certo para esse caso: "O recorte não
  tem semanas medidas". A guarda só não o alcança porque testa a lista inteira.
* O zero aqui é a boa notícia. "0 semanas fora do SLA" numa fila sem medição se lê como SLA cumprido.

**O que mudar.**

1. Contar as semanas medidas (`wins + losses + ties`) e as sem resultado (`data.length` menos isso).
2. Com zero semana medida, não escrever "sem sequência fora do SLA" nem "0 semanas fora do SLA": o topo
   leva `formatUnavailable()` e a linha diz que nenhuma semana do recorte tem resultado medido (EST-2).
   A frase acessível diz o mesmo, sem "0 dentro, 0 fora e 0 no limite" e sem "Nenhuma sequência de
   derrotas".
3. Havendo semana sem resultado, contá-la na frase acessível e na linha do ramo sem sequência, como a
   `v1` faz nas linhas 88 a 92 ("1 sem resultado medido"), para a soma fechar com o total anunciado.
4. Conferência: renderizar uma vez com as 26 semanas nulas e outra com metade nula, ler topo, linha e
   frase (de 100 a 250 caracteres nos dois casos) e devolver o dado padrão. O `data.ts` não muda.

### A alinhar na mesma passada (observações da `v2`, não reprovam)

* Plural fixo no mesmo ramo (linha 130): executado com uma derrota só, sai "1 semanas fora do SLA".
* TIP-1: o rótulo sob o colchete (linha 161) segue sem `tabular-nums`.
* Redação das datas: "a maior, de 18/05/2026 a 22/06/2026" usa a segunda de abertura da última semana,
  e a sequência fecha em 28/06/2026. "da semana de 18/05/2026 à de 22/06/2026" responde quando terminou.
* README, Versões: "com um empate que a quebra" repete a atribuição que o cartão deixou de fazer. O
  empate do dado padrão quebra a outra série, a que teria 7 semanas.
* Pergunta 2: "6 semanas seguidas fora" continua duas vezes, no topo e sob o colchete.
* ROT-4: legenda na ordem dentro, fora, no limite; a ordem visual de cima para baixo é dentro, no
  limite, fora. Legenda abaixo do desenho, em 11 px. Sem consequência visível.

## v1_sla-semanal-em-26-semanas: aprovada

32 perguntas sem "não" nos dois temas, e os ramos de última semana nula, em empate e de janela inteira
nula conferidos por execução. Três observações no README, no parágrafo da segunda passada: o empate
segue sem marca e fora do denominador ("18 de 25"), agora contado só na frase acessível; sem semana
decidida o resumo escreve "indisponível semanas dentro do SLA", sem o ícone `Unplug`; a linha de
leitura está em 11 px e `--text-muted`. Nenhuma tem consequência visível no dado padrão.

## Registro da segunda passada

```
Versão: 24_microvisuais-sparklines/07_win-loss/v1_sla-semanal-em-26-semanas
Data: 2026-10-05
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

```
Versão: 24_microvisuais-sparklines/07_win-loss/v2_maior-sequencia-fora-do-sla-anotada
Data: 2026-10-05
Resultado: reprovada
Não: 8 (reflexo na 25)
Correções:
  8. EST-2, EST-1b e DAD-6: com zero semana medida, escrever formatUnavailable() no topo e na frase
     no lugar de "sem sequência fora do SLA" e "0 semanas fora do SLA"; contar as semanas sem
     resultado na frase acessível.
Não se aplica: 6, 18, 26, 27, 28, 29, 30, 31, 32
```
