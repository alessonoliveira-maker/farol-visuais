# Win/loss

## O que é

Blocos de altura fixa, um por período: para cima da linha central quando o período foi bom e para baixo quando foi ruim, com um traço central para o empate e nada para o período sem dado. A altura não carrega valor, de propósito, e o desenho mostra o que nenhum outro microvisual mostra tão bem: a sequência, ou seja, as séries de acerto, as séries de falha e a virada entre elas. É SVG puro em React, com a geometria em função pura no próprio arquivo: largura dividida por N, vão de 2 px, viewBox fixo e `vectorEffect="non-scaling-stroke"` no traço central. A posição é o segundo canal da cor.

## Quando usar

- Resultado binário por período com regra declarada: semana dentro ou fora do SLA, mês com meta batida ou não.
- De 12 a 26 períodos numa célula de 60 a 120 px por 14 a 22 px, mais baixa que o sparkbar porque a altura não carrega valor.
- Tabela de executivos ou de filas ordenada por períodos batidos, onde o padrão de sequência separa o irregular de quem decaiu.
- Anotar a maior sequência de falhas.

## Quando evitar

- A magnitude é a história: use o sparkbar divergente (`24_microvisuais-sparklines/02_sparkbar`).
- Mais de dois estados medidos por período: use a faixa de status (`24_microvisuais-sparklines/04_faixa-de-status-tracker`).
- Valor contínuo julgado contra uma faixa: use o sparkline de linha (`24_microvisuais-sparklines/01_sparkline-de-linha`).
- Só o resultado atual contra a regra, sem histórico: use a pílula de variação (`24_microvisuais-sparklines/03_pilula-de-variacao`).
- Mais de cerca de 40 períodos em 120 px: agregue o período ou use a faixa de status.
- Dado bruto com zero por falta de coleta: separe sem dado de zero antes, ou o componente inventa empates.

## Anatomia

1. **Blocos** de 12 a 18 px de altura fixa em `--positive` (acima da linha) e `--negative` (abaixo), com vão de 2 px entre blocos e de 2 px até a linha central.
2. **Linha central** de 1 px em `--line-subtle`, com `vectorEffect="non-scaling-stroke"`.
3. **Empate** como traço central de 2 px em `--text-muted`, que quebra a sequência.
4. **Sem coleta** como contorno de 1 px em `--text-muted`, centrado na linha; **sem meta atribuída** como espaço vazio, nunca bloco.
5. **Resumo escrito** com `formatInt`, só sobre períodos medidos: `19 de 26`, nunca sobre o calendário inteiro.
6. **Anotação** da maior sequência: colchete de 1 px em `--text-muted` e rótulo de 11 px, em HTML posicionado em fração do viewBox.
7. **Datas e meses** por `formatDate` e `formatMonthShort`; frase acessível na raiz, calculada do dado, com o SVG em `aria-hidden`.

## Versões

- `v1_sla-semanal-em-26-semanas`: 26 semanas dentro ou fora do SLA, resumo 19 de 26 e a sequência recente.
- `v2_maior-sequencia-fora-do-sla-anotada`: colchete e rótulo na maior sequência fora do SLA, com um empate que a quebra.
- `v3_meta-mensal-por-executivo`: tabela de 12 executivos com 12 blocos por linha, ordem por meses batidos e contagem à direita.
- `v4_meses-sem-meta-empate-e-sem-coleta`: executivo contratado no meio do ano, com meses sem meta vazios, empate e mês sem coleta.

## Como colar no Farol

1. Ligue `data` ao tipo exportado pelo `data.ts` da versão e entregue o resultado já classificado em `win`, `loss`, `tie` ou `null`; a regra do binário mora na página, nunca no componente.
2. Na v4, a ausência chega em dois campos (`hasTarget` e `outcome`): mês sem meta atribuída nunca vira derrota.
3. O SVG usa `preserveAspectRatio="none"` e só as marcas esticam; o texto fica em HTML. Na v3 o SVG tem largura e altura fixas e a tabela pede corpo de pelo menos 574 x 505 px.
4. Embrulhe num `VisualCard`; o Chart não desenha moldura própria. Troque o estado vazio inline por `EmptyState`, mantendo o sentido do texto.

## Referências

- Estudo da família: `_estudo/familias/24_microvisuais-sparklines.md`.
- Praticante: Tufte, [sparkline theory and practice](https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/), a barra de ganhar e perder como palavra desenhada.
- Guia de anatomia dentro da família: `24_microvisuais-sparklines/04_faixa-de-status-tracker`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, primeira passada das quatro versões: `v3` e `v4` aprovadas, `v1` e `v2` reprovadas, com o parecer em `validation/revisao_24_microvisuais-sparklines__07_win-loss_2026-10-05.md`. `npm run check`: 0 com erro, 0 avisos, 0 escapes. As guardas de texto não medem este modelo (`texto_em_html` nas quatro), então geometria, cores e textos foram medidos nos PNGs dos dois temas contra o `data.ts`. Fidelidade entre o SVG e a página: de 0,007% a 0,130% de pixels com qualquer diferença. O que segue não reprova.

* `v1`, `v2`, `v3` e `v4`, ROT-4 e tabela 17.1: a legenda fica abaixo do desenho, em 11 px e `--text-muted`, com 6 px entre a amostra e o texto; a regra pede acima ou ao lado, e a tabela pede 12 px, `--text-secondary` e 10 px. Sem consequência visível: a mais alta mede 36 px, 23% do corpo da `v1`.
* `v1`, `v2` e `v3`, linha central: em `--line-subtle` ela mede 1,25:1 no escuro e 1,29:1 no claro. É referência, e os blocos se leem sem ela porque as duas fileiras aparecem; mas as legendas da `v1` e da `v3` dizem "acima da linha" e "abaixo da linha", e num recorte só com vitórias a referência quase some.
* `v2` e `v4`, legenda: não dizem "acima da linha" e "abaixo da linha", como a `v1` e a `v3` dizem. As amostras de bateu e não bateu se separam só pela cor, e verde contra vermelho mede 1,34:1 no escuro e 1,19:1 no claro. A posição no desenho resolve; a palavra na legenda fecharia.
* `v1` e `v3`, empate, mora no ramo: `tie` faz parte do tipo, não ganha marca e sai do denominador (`measured` soma só vitórias e derrotas), então some como o período sem dado. A anatomia pede traço central, que a `v2` e a `v4` desenham. O dado padrão das duas não tem empate.
* `v1` e `v2`, redação das datas: a frase acessível da `v1` ("de 06/04/2026 a 28/09/2026") e a linha de leitura e a frase da `v2` ("de 18/05/2026 a 22/06/2026") usam a segunda de abertura da primeira e da última semana sem dizer "semana de", que as pontas do eixo dizem. A sequência da `v2` fecha em 28/06/2026.
* `v2`, TIP-1: o rótulo sob o colchete (linha 152) não tem `tabular-nums`. Um algarismo só e fora de coluna, sem consequência visível.
* `v2`, pergunta 2: "6 semanas seguidas fora" aparece duas vezes, no topo em 14 px e sob o colchete em 11 px. O topo pode responder a segunda metade do caso de uso, quando a sequência terminou.
* `v2`, sobra vertical: 164,5 px de conteúdo num corpo de 241,5 px, com 38,5 px vazios em cima e embaixo.
* `v2`, plural fixo, mora no ramo: com uma derrota só e nenhuma sequência a linha escreve "1 semanas fora do SLA".
* `v3`, anatomia: o item 1 diz blocos de 12 a 18 px de altura e a `v3` usa 10 px, para caber em linhas de 24 px.
* `v3`, DAD-10: o `demonstrates` cita o nome longo que quebra linha sem cortar. No corpo de 574 px a coluna tem 296 px e o nome de 169 px cabe numa linha, então a quebra não é exercitada.
* `v3`, redação: a nota do `meta.json` tem a frase quebrada "para os grupos se separarem e vão de 2 px"; "Larissa B. é o mais regular", na frase acessível, e "no melhor executivo", na linha de leitura, fixam o masculino.
* `v4`, linha central: a versão não desenha a linha central em nenhum mês, e o item 2 da anatomia a descreve; o catálogo pede sem traço só nos meses sem meta. Verde em cima, vermelho embaixo e o traço do empate no meio mantêm a leitura no dado padrão.
* `v4`, seção 17.2: o empate, que é medido, e o mês sem coleta, que é ausência, dividem o `--text-muted` e se separam só pela forma (traço de 2 px contra contorno de 18 px de altura). Legível nos dois temas; `--text-secondary` no empate separaria os papéis.
* `v4`, mora no ramo: o colchete e o texto "sem meta atribuída até" saem de `lastIndexOf` e supõem que os meses sem meta são um prefixo contíguo. Mês sem meta no meio da série faria o colchete cobrir meses com meta.
* `v4`, EST-1 e EST-2, mora no ramo: com dado e nenhum mês medido, o bloco usa o ícone `Filter` do vazio com o texto de `formatUnavailable()`. São dois estados, e a regra pede `Unplug` no indisponível.
* `v4`, plural fixo, mora no ramo: "2 mês sem coleta", "2 empatou", "2 ficou fora"; e sem nenhum mês sem coleta a linha ainda escreve "0 mês sem coleta, também fora".
* `v4`, catálogo: 2 de 4 no lugar do 5 de 7, com o desvio declarado na nota. A série fica com 5 marcas em 12 posições, pouco para ler sequência; 5 de 7 com "sem meta atribuída até abr/26" só fecha numa janela de 12 meses que termina em nov/26.

Revisão de 2026-10-05, segunda passada, só da `v1` e da `v2` (`revisao_desatualizada`, depois da rodada de correção): `v1` aprovada, `v2` reprovada, com o parecer na seção Segunda passada do mesmo arquivo de `validation/`. `npm run check`: 0 com erro, 0 avisos, 0 escapes. Os dois bloqueantes da primeira passada foram conferidos por execução fora da árvore, com o dado trocado pela prop: na `v1`, a última semana nula sai "a última semana não tem resultado medido" e a em empate sai "fechou exatamente no limite do SLA"; na `v2`, a oração do empate só é escrita com empate colado na maior sequência. Fidelidade entre o SVG e a página: 0,13% na `v1` e 0,09% na `v2`. Do parágrafo anterior continuam valendo, para as duas, os itens de legenda, linha central, redação das datas, TIP-1, rótulo repetido, sobra vertical e plural fixo. O que segue não reprova.

* `v1`, empate, mora no ramo, continua depois da correção: a frase acessível agora conta o empate ("1 no limite"), mas o desenho segue sem marca para `tie` (`blockAt`, linha 37) e o resumo o tira do denominador ("18 de 25"). Para quem enxerga, a semana no limite fica igual à semana sem dado. Desenhar o traço central da anatomia, como a `v2`, ou tirar `tie` do tipo.
* `v1`, EST-2, mora no ramo: sem nenhuma semana decidida o resumo escreve "indisponível semanas dentro do SLA", em minúscula, colado ao texto de apoio e sem o ícone `Unplug`. Num recorte só de empates o mesmo texto aparece para semanas que foram medidas.
* `v1`, tabela 17.1 e ANO-5: a linha de leitura está em 11 px e `--text-muted`, e a tabela pede 12 px e `--text-secondary`. Sem consequência visível. Em 12 px ela mediria cerca de 306 px e não caberia nos 302 px do corpo, então alinhar pede encurtar a frase.
* `v2`, redação do README: a linha da `v2` em Versões diz "com um empate que a quebra", e o empate do dado padrão quebra a outra série, a que teria 7 semanas, não a maior. O cartão já não afirma isso; o README ainda afirma.
* `v2`, redação das datas, continua: "a maior, de 18/05/2026 a 22/06/2026" responde a segunda metade do caso de uso com a segunda de abertura da última semana, e a sequência fecha em 28/06/2026. "da semana de 18/05/2026 à de 22/06/2026" fecharia.
* `v2`, ROT-4: a legenda vem na ordem dentro, fora, no limite, e a ordem visual de cima para baixo é dentro, no limite, fora. Sem consequência visível.
* `v2`, limiar: com duas sequências do mesmo tamanho, `longestLossRun` anota a primeira, e a tela não diz que há outra igual nem que a escolhida é a mais antiga.
* `v2`, mora no ramo: a frase acessível não conta a semana sem resultado (com uma nula sai "11 dentro, 13 fora e 1 no limite" em 26 semanas). O caso extremo, a janela inteira nula, é o bloqueante do parecer.
