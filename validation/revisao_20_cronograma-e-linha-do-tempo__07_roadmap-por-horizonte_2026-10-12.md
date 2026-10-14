# Parecer de revisão: 20_cronograma-e-linha-do-tempo/07_roadmap-por-horizonte

Data: 2026-10-12. Revisor independente, primeira passada das quatro versões (`sem_revisao`). `npm run check`: 0 erros, 0 avisos. As guardas COLISAO-TEXTO, CONTRASTE-TEXTO, CONTRASTE-MARCA e TEXTO-NA-MARCA não leem esta abordagem (`texto_em_html` e `sem_marca` nas quatro), então contraste, colisão e corte foram conferidos à mão.

Como foi medido: nos PNGs de `_render/.qa/20_cronograma-e-linha-do-tempo/07_roadmap-por-horizonte/`, que têm 2 px de imagem por px de tela, com leitura de cor e de tinta pixel a pixel; no `.pagina.png`, que é a página viva, comparado com o PNG do `preview.svg`; nos tokens de `app/src/styles/tokens.css`, com a fórmula de contraste da WCAG; e no `data.ts`, refazendo à mão cada contagem e cada ordem que a tela imprime.

| Versão | Resultado | Não |
|---|---|---|
| `v1_roadmap-de-paineis-do-farol` | aprovada | nenhum |
| `v2_confianca-por-iniciativa` | aprovada | nenhum |
| `v3_roadmap-por-publico` | reprovada | 17 |
| `v4_horizonte-vazio-e-descartadas` | reprovada | 3 |

As observações não bloqueantes das quatro estão no README do modelo, seção `Observações da revisão (não bloqueantes)`. Este arquivo trata do que reprova e do que foi pesado e não reprovou.

Não se aplica, nas quatro: perguntas 4, 6, 7, 13, 26, 27, 28, 30 e 31. A 18 só se aplica à `v4` (atributo `title`), a 29 só à `v3` (faixas que dividem as colunas de horizonte) e a 32 só à borda tracejada da `v2`.

## v3_roadmap-por-publico

Resultado: reprovada. Um bloqueante, igual nos dois temas. O resto confere com o dado: 24 iniciativas, 6 por faixa e 8 por horizonte; as doze contagens de célula somam os totais nas duas direções (2, 3, 1, 2 em Agora; 2, 2, 3, 1 em Próximo; 2, 1, 2, 3 em Depois); a ordem dentro de cada célula é a prioridade declarada; as quatro datas saem por `formatDate`; as cores seguem a ordem 1, 3, 6, 5 por chave de público e medem de 4,67:1 a 10,90:1 contra o cartão; cabeçalho e faixas usam o mesmo molde de grade, então a coluna de horizonte cai no mesmo pixel (pergunta 29).

### Bloqueante 1. Pergunta 17. ANO-5, com a seção 14.1 (o que o desenho afirma)

**O que o desenho faz.** A primeira linha do corpo diz `A distância entre as colunas não é tempo: nenhuma data está comprometida.` Logo abaixo, quatro cartões trazem data (`03/11/2026`, `01/12/2026`, `20/10/2026` e `12/01/2027`), e o rodapé os explica como `Iniciativa que já foi para o Gantt, com a data comprometida`. A mesma tela afirma que nenhuma data está comprometida e que quatro estão. E o assunto da contradição é o que o modelo existe para proteger: quem lê não pode sair em dúvida sobre o que tem prazo prometido.

**Evidência.**

* `Chart.tsx`, linha 71: a frase é texto fixo, copiado da `v1`, onde é verdade porque o dado da `v1` não tem campo de data.
* `Chart.tsx`, linha 57: `const inGantt = initiatives.filter((item) => item.ganttOn !== null).length`. A conta existe e vale 4 no dado padrão (`data.ts`, linhas 38, 47, 50 e 58).
* `Chart.tsx`, linha 62: a frase acessível usa essa conta e diz `4 já têm data no Gantt`. Quem ouve recebe o fato certo e quem enxerga recebe o contrário na primeira linha. É a assimetria da DAD-9: o texto calculado acerta e o texto escrito à mão fica com a redação de outra versão.
* `Chart.tsx`, linha 118: o rodapé usa a mesma palavra da frase do topo, `comprometida`, para dizer o oposto.
* PNG escuro e claro: as três peças aparecem juntas, a frase com tinta em y de 145 a 169, os selos de data nos cartões e o rodapé em y de 1.043 a 1.067.

**Por que bloqueia.** A ANO-5 pede linha de leitura calculada do dado, e a pergunta 17 repete. Aqui o custo de não calcular não é de estilo: a frase fixa é falsa para 4 das 24 iniciativas do próprio preview. A seção 14.1 separa a regra que decide o que o desenho afirma da constante de acabamento, e uma afirmação escrita que o dado desmente está do primeiro lado. Não é redação: trocar a ordem das palavras não conserta, só o número conserta.

**O que mudar.**

1. `Chart.tsx`, linha 71: a frase passa a ser calculada de `inGantt` e de `initiatives.length`, que a linha 57 já tem. Com `inGantt` maior que zero, algo como `A distância entre as colunas não é tempo: só 4 de 24 iniciativas têm data comprometida.`, com os números por `formatInt` e `tabular-nums` no trecho numérico (TIP-1). Com `inGantt` igual a zero, a frase de hoje continua valendo.
2. O singular entra na mesma conta: com uma só, `1 de 24 iniciativas tem data comprometida`.
3. O mínimo aceitável, se a frase calculada não couber em uma linha de 600 px: ficar só com `A distância entre as colunas não é tempo.` e deixar a contagem para o rodapé. A contradição sai, a conclusão não entra.
4. A frase acessível (linha 62) e o rodapé (linha 118) já dizem o certo e não mudam.
5. Conferir depois, com `npm run render -- 20_cronograma-e-linha-do-tempo/07_roadmap-por-horizonte/v3_roadmap-por-publico --tema ambos` e `npm run check`: a primeira linha do corpo, os selos e o rodapé contam a mesma coisa, e a última tinta continua antes do fim do corpo (hoje sobra 6,5 px).

**Saída que não resolve.** Tirar o selo de data dos cartões apaga o terceiro item do catálogo. Trocar a palavra do rodapé por outra (`prevista`, `marcada`) mantém as quatro datas na tela sob uma frase que as nega.

As observações da `v3` no README (contagem na calha mais perto da coluna vizinha, total do cabeçalho fora da coluna das parcelas, nota do `meta.json` com a altura antiga) cabem na mesma passada, sem obrigação.

## v4_horizonte-vazio-e-descartadas

Resultado: reprovada. Um bloqueante, igual nos dois temas. O resto confere: a coluna Depois fica na grade com `0 iniciativas` e `sem iniciativa priorizada`, que é zero medido e não ausência (EST-3); as três descartadas trazem ícone, texto rebaixado e motivo, na ordem de prioridade declarada; `3 ideias descartadas` é contado do dado e o mês sai por `formatMonthLong`; a iniciativa sem público escreve `Sem público declarado`; as cores seguem a ordem 1, 3, 6, 5 por chave; a última tinta fica em 367,5 px de 380.

### Bloqueante 1. Pergunta 3. Seção 14.1 (encoding), com a regra do modelo (ordem pela prioridade declarada) e a NUM-7

**O que o desenho faz.** Na coluna Próximo, os três cartões imprimem um ordinal que não é a prioridade declarada no dado. A tela diz `1º Calendário editorial`, `2º Pesquisa de satisfação` e `3º Revisão do glossário de métricas`. O dado declara o contrário: a revisão do glossário é a prioridade 1, o calendário é a 2 e a pesquisa é a 3. Os três ordinais da coluna estão errados, e o que a Diretoria lê como terceiro da fila é o que o dado põe em primeiro.

**Evidência.**

* `data.ts`, linha 42: `mk-05`, `Revisão do glossário de métricas`, `audience: null`, `priority: 1`. Linha 45: `mk-04`, `Calendário editorial`, `priority: 2`. Linha 48: `mk-09`, `Pesquisa de satisfação`, `priority: 3`.
* `Chart.tsx`, linhas 55 a 57: a ordenação põe primeiro quem tem público e só depois olha a prioridade (`Number(a.audience === null) - Number(b.audience === null) || a.priority - b.priority`).
* `Chart.tsx`, linha 100: o ordinal impresso é `formatInt(index + 1)` seguido de `º`, o índice da lista já reordenada, e não a prioridade.
* PNG escuro e claro, coluna Próximo, tinta do ordinal em x de 526 a 556: `1º` em y de 272 a 287 ao lado de `Calendário editorial`, `2º` em y de 384 a 399 ao lado de `Pesquisa de satisfação`, `3º` em y de 498 a 514 ao lado de `Revisão do glossário de métricas`.
* README do modelo, "O que é": `A ordem dentro da coluna vem da prioridade declarada`. Anatomia, item 3: `prioridade ordinal (1º)`. O ordinal é a prioridade, por definição do próprio modelo.

**Por que bloqueia.** O número escrito no cartão é a única coisa que este modelo quantifica, e aqui ele desmente o dado em três de três cartões. A seção 14.1 põe encoding entre as regras que bloqueiam sempre, porque decide o que o desenho afirma. Nas colunas Agora e Descartado a ordem é a declarada e não há defeito; o erro nasce só onde a regra `sem público por último` atropela a prioridade, e o dado foi montado justamente para exercitar esse caso.

**O que mudar.**

1. `data.ts`, linhas 42, 45 e 48: o item do catálogo (`sem público declarado, por último`) passa a ser fato do dado. `mk-04` vira prioridade 1, `mk-09` vira 2 e `mk-05` vira 3. O PNG fica igual ao de hoje e passa a ser verdade. Sem esta mudança a versão ou mente no ordinal ou deixa de demonstrar o terceiro item do catálogo.
2. `Chart.tsx`, linhas 55 a 57: a ordenação fica só por `a.priority - b.priority`, e o termo de público sai. Com ele no lugar, o preview fecha mas o ramo continua: colada no Farol com dado real, uma iniciativa sem público de prioridade 1 volta a sair por último com ordinal trocado.
3. O comentário da linha 54, o cabeçalho do `data.ts` e a nota do `meta.json` passam a dizer que `por último` vem da prioridade declarada.
4. Se o dono quiser a regra dentro do componente (sem público sempre por último, qualquer que seja a prioridade), o ordinal impresso tem de ser a posição pela prioridade declarada, calculada antes de reordenar. A tela mostraria `2º`, `3º`, `1º` de cima para baixo e o cartão fora de ordem precisaria dizer por quê. Não recomendo.
5. Conferir depois, com `npm run render -- 20_cronograma-e-linha-do-tempo/07_roadmap-por-horizonte/v4_horizonte-vazio-e-descartadas --tema ambos` e `npm run check`: em toda coluna, o ordinal de cada cartão é a posição dele pela `priority` do `data.ts`.

**Saída que não resolve.** Tirar o ordinal só do cartão sem público deixa `1º` e `2º` impressos em cartões que o dado declara 2 e 3. Trocar o ordinal por marcador sem número esconde o erro e apaga a prioridade das outras colunas.

As observações da `v4` no README (plural fixo em `ideias`, linha de leitura que repete o subtítulo, número sem `tabular-nums`, borda neutra em `--line-strong`) cabem na mesma passada, sem obrigação.

## Pesado e não reprovou

Vale para o corretor não reabrir o que já foi decidido, e para a próxima revisão saber o que foi olhado.

### Nas quatro versões

* **Pergunta 20, contraste de texto, medido à mão.** A moldura é `stage`, então o texto fora dos cartões fica sobre `--surface-canvas`: `--text-primary` 15,95:1 no escuro e 16,89:1 no claro; `--text-secondary` 8,95:1 e 7,64:1; `--text-muted` 5,72:1 e 5,05:1. Dentro dos cartões, sobre `--surface-sunken`: 16,67:1 e 15,56:1; 9,36:1 e 7,04:1; 5,98:1 e 4,65:1, que é o par mais fraco do modelo e está aprovado na 17.10. Nenhum texto abaixo de 4,5:1.
* **Pergunta 15, nada passa do corpo.** Última linha com tinta, em px de tela: 342,5 de 380 na `v1`, 353,5 de 380 na `v2`, 533,5 de 540 na `v3` e 367,5 de 380 na `v4`. Nenhum texto cortado sem intenção e nenhuma sobreposição nos oito PNGs.
* **Pergunta 21.** PNG do `preview.svg` contra a página viva, pixels diferentes: 0,19% na `v1`, 0,15% na `v2`, 0,22% na `v3` e 0,03% na `v4`, nos dois temas.
* **Pergunta 16.** As quatro trocam o desenho inteiro por `role="status"` com `Filter` de 16 px e frase em 12 px `--text-muted`.
* **Pergunta 19.** Frases acessíveis de 167, 180, 144 e 139 caracteres, começando por `Roadmap`.
* **Pergunta 10, TIP-1.** Há número em Manrope sem `tabular-nums` na linha de leitura da `v2` e da `v4`. É texto corrido, sem coluna, sem consequência no preview: observação pela 14.1.

### v1_roadmap-de-paineis-do-farol

* As doze prioridades do `data.ts`, que vêm fora de ordem de propósito, saem na ordem declarada nas três colunas, e o ordinal impresso coincide com a `priority` em todos os cartões.
* A frase fixa `nenhuma data está comprometida` é verdade aqui para qualquer dado, porque o tipo `PanelInitiative` não tem campo de data. É a mesma frase que reprova a `v3`.

### v2_confianca-por-iniciativa

* **A afirmação da linha de leitura.** `A confiança cai com o horizonte` só é escrita quando a parcela de alta cai a cada horizonte (3 de 3, 1 de 4, 0 de 3, refeitas do `data.ts`); com coluna vazia a parcela é `null` e a frase volta a só listar as contagens (EST-1b).
* **Pergunta 32 e ESP-5, a borda tracejada.** Mede 2,05:1 e 1,59:1 contra o cartão. Aplicado o teste da ACE-6: tapada a borda, `confiança baixa` continua escrito com o ícone, então ela é segunda pista e não dado. É item do catálogo, é estado e não divisória, e a nota do `meta.json` declara.
* **Pergunta 2 e ROT-4, a legenda que repete o cartão.** É o quarto item do catálogo; observação.
* **A declaração de que não há datas.** A descrição do modelo no catálogo diz que o título declara que a distância não é tempo, e na `v2` nem o título nem a linha de leitura dizem; só a frase acessível. O título é do catálogo e a única linha de leitura está ocupada pelo terceiro item dele. A tela não desenha data nem eixo, então nada falso é afirmado: observação, com o texto do README corrigível na mesma passada.

### v3_roadmap-por-publico

* **Pergunta 14, NUM-6, contagem sem substantivo.** As doze contagens de célula e os três totais do cabeçalho são números soltos. O acervo trata como observação quando a unidade está escrita em outro ponto do cartão, e aqui está (`6 iniciativas` em cada faixa e `contagem da célula` no rodapé).
* **A contagem mais perto da coluna vizinha.** Medido na primeira faixa: o cartão acaba em x de 505, o algarismo vai de 534 a 545 e o cartão seguinte começa em 562. São 14,5 px até a célula dele e 8,5 px até a outra. A última coluna não tem vizinho à direita e o rodapé diz de quem é o número, então a leitura se recupera: observação.

### v4_horizonte-vazio-e-descartadas

* **Perguntas 10 e 18, TIP-7 e DIC-1 contra o `line-clamp-2`.** O título `Conversão por canal de origem e por campanha ativa no trimestre corrente` perde a cauda na tela, e ela só existe no atributo `title` e no DOM. A TIP-7 diz que nome de marca desenhada não some por reticência, e a DIC-1 que nada essencial vive só na dica. Do outro lado, o catálogo pede exatamente isto como quarto item da versão (`Título longo com line-clamp-2 e texto completo no atributo title`), a nota do `meta.json` declara, o trecho visível continua identificando a iniciativa sem ambiguidade e o corte aparece sinalizado na página viva. Em `20/06`, `v4`, o mesmo conflito foi pesado e não reprovou. Mantive o peso e registro o conflito de régua para o dono decidir: se a TIP-7 vencer, o título quebra em três linhas (cabe, a coluna Agora termina em 301,5 px de 380 e a linha a mais pede 16) e a nota declara o desvio do catálogo.
* **O corte sem reticências no preview.** No PNG do `preview.svg` a segunda linha termina em `ativa`, sem sinal de corte; no `.pagina.png` termina em `ativ...`. É a ferramenta que não leva o `line-clamp` para o SVG, não a versão.
* **Borda neutra em `--line-strong`.** 2,05:1 e 1,59:1 contra o cartão, com `Sem público declarado` escrito ao lado: isenção da 17.2.

## Registro

```
Versão: 20_cronograma-e-linha-do-tempo/07_roadmap-por-horizonte/v1_roadmap-de-paineis-do-farol
Data: 2026-10-12
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 7, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

```
Versão: 20_cronograma-e-linha-do-tempo/07_roadmap-por-horizonte/v2_confianca-por-iniciativa
Data: 2026-10-12
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 7, 13, 18, 26, 27, 28, 29, 30, 31
```

```
Versão: 20_cronograma-e-linha-do-tempo/07_roadmap-por-horizonte/v3_roadmap-por-publico
Data: 2026-10-12
Resultado: reprovada
Não: 17
Correções:
  17. ANO-5, seção 14.1: a frase do topo deixa de ser fixa e passa a contar as iniciativas com data comprometida (4 de 24), em vez de dizer que nenhuma data está comprometida.
Não se aplica: 4, 6, 7, 13, 18, 26, 27, 28, 30, 31, 32
```

```
Versão: 20_cronograma-e-linha-do-tempo/07_roadmap-por-horizonte/v4_horizonte-vazio-e-descartadas
Data: 2026-10-12
Resultado: reprovada
Não: 3
Correções:
  3. Seção 14.1 (encoding), regra do modelo e NUM-7: o ordinal impresso tem de ser a posição pela prioridade declarada; a iniciativa sem público fica por último pela prioridade do dado, e a ordenação fica só por prioridade.
Não se aplica: 4, 6, 7, 13, 26, 27, 28, 29, 30, 31, 32
```
