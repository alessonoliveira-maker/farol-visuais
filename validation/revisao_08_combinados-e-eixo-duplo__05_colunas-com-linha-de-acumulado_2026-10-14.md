# Parecer de revisão: 08_combinados-e-eixo-duplo/05_colunas-com-linha-de-acumulado

Data: 2026-10-14. Versões julgadas: `v2_ritmo-linear-com-alternancia-para-paineis`, `v3_fechamentos-por-vertical-com-acumulado` e `v4_estorno-e-meta-revisada`, as três `sem_revisao`. A `v1` não foi julgada de novo.

`npm run check -- 08_combinados-e-eixo-duplo/05_colunas-com-linha-de-acumulado`: 0 com erro, 0 avisos, tipos em ordem, previews em dia (PNGs de 2026-10-02, posteriores aos `Chart.tsx` de 2026-09-29).

Resultado: as três reprovadas. Seis bloqueantes ao todo: três na `v2`, um na `v3`, dois na `v4`. Dois deles têm a mesma causa nas três versões (linha de dado atravessando coluna sem segundo fundo) e a mesma saída, e convém corrigir os três arquivos juntos.

Coordenadas em px do `preview.svg` (canvas 1x) salvo quando o texto diz "PNG", que é o arquivo 2x de `_render/.qa/`. Contraste pela fórmula da WCAG sobre as cores lidas no próprio `preview.svg` e no `preview-claro.svg`.

---

## v2_ritmo-linear-com-alternancia-para-paineis

```
Versão: 08_combinados-e-eixo-duplo/05_colunas-com-linha-de-acumulado/v2_ritmo-linear-com-alternancia-para-paineis
Data: 2026-10-14
Resultado: reprovada
Não: 12, 20, 29
Correções:
  29. EIX-12 (REC-16): dar ao painel do acumulado a mesma escala band do painel das colunas.
  12. Identificação das marcas (14.1), ROT-3: nomear a grandeza de cada painel.
  20. ACE-3, ACE-2 (TOK-4, TOK-10): dar à linha do modo duplo um segundo fundo em --surface-raised.
Não se aplica: 6, 26, 27, 28, 32
```

### Bloqueante 1. Pergunta 29, EIX-12 e REC-16: o mesmo mês cai em pixels diferentes nos dois painéis

**Evidência.** O painel de cima (`accumulatedPanel`) é um `ComposedChart` sem `Bar`, e o Recharts dá a ele a escala **point**; o de baixo tem `Bar` e fica com **band**. No `preview.svg`, a linha do acumulado é `M76,109.142 L149.636,100.275 …`, passo de 73,636 px (810 / 11); as colunas começam em `x=98.95` com largura 22, centro em 109,95 e passo de 67,5 px (810 / 12).

| Mês | Ponto da linha | Centro da coluna | Distância |
|---|---|---|---|
| jan/26 | 76,00 | 109,95 | 33,95 px |
| abr/26 | 296,91 | 312,45 | 15,5 px |
| ago/26 | 591,45 | 582,45 | 9,0 px, do outro lado |
| dez/26 (posição da escala) | 886,00 | 852,45 | 33,5 px |

O eixo X impresso embaixo, que os dois painéis partilham, vale só para as colunas: o ponto de jan/26 da linha nasce na borda do plano, a meia banda do rótulo `jan/26`. É o defeito que a EIX-12 descreve com o número da `08/03` (42 px), e alinhamento entre painéis bloqueia sempre pela 14.1. O `meta.json` e o item 13 da Anatomia afirmam "a mesma escala de categoria", e o render desmente.

**O que mudar.** Pôr `scale="band"` no objeto `xAxis` compartilhado (o painel de cima passa a centrar o ponto na banda; nos dois gráficos com `Bar` nada muda), como manda o corpo da EIX-12. Conferir no PNG que o ponto de jan/26 e a coluna de jan/26 caem na mesma coluna de pixels, e o de ago/26 também.

### Bloqueante 2. Pergunta 12, identificação das marcas (14.1) e ROT-3: nenhum painel diz o que mede

**Evidência.** No modo painéis, que é o padrão e o que o preview retrata, os textos da tela são a linha de leitura, a alternância, os tiques, `Meta anual R$ 12,0 mi`, `R$ 8,3 mi`, `Ritmo linear R$ 1,0 mi` e a nota do rodapé. As palavras "acumulado" e "receita" não aparecem em nenhum deles: a linha de cima só se deduz pela referência da meta, e o rótulo do fim dela é só o valor. Pior, no PNG as seis linhas de grade caem em y 280, 375, 470, 570, 665 e 760, com passo de 95 px e um vão de 100 px entre os painéis, e os tiques empilham `R$ 12,0 mi`, `R$ 6,0 mi`, `R$ 0`, `R$ 2,0 mi`, `R$ 1,0 mi`, `R$ 0` como se fossem um eixo só, que volta a subir no meio. O irmão `08/03_paineis-alinhados` resolve isso com um título por painel ("Investimento em mídia paga (R$)"), e a `v1` deste modelo com o título de cada eixo.

**O que mudar.** Um título curto por painel, em 12 px e `--text-secondary`, no mesmo padrão do `08/03` ("Acumulado do ano (R$)" em cima, "Receita do mês (R$)" embaixo), o que também separa os dois planos à vista. Refazer a conta da GEO-1 no `meta.json`, porque cada título come de 16 a 20 px do corpo, e o canvas é por número.

### Bloqueante 3. Pergunta 20, ACE-3 e ACE-2, saída da TOK-4 e da TOK-10: no modo duplo a linha some dentro das colunas

**Evidência.** O preview não retrata o modo duplo, então a medida sai do código e das cores dos dois previews. Em `dualChart` as colunas vão de 0 a R$ 2,0 mi e a linha de 0 a R$ 12,0 mi no mesmo plano, e a altura de cada uma, em fração do plano, é:

| Mês | jan | fev | mar | abr | mai | jun | jul | ago |
|---|---|---|---|---|---|---|---|---|
| Linha do acumulado | 6% | 16% | 23% | 34% | 42% | 55% | 64% | 69% |
| Coluna do mês | 37% | 56% | 43% | 67% | 48% | 79% | 52% | 34% |

Seis dos oito vértices da linha caem dentro da coluna do próprio mês. A linha em `--chart-1` mede **1,29:1 no escuro e 1,13:1 no claro** contra a coluna em `--positive`, e **1,73:1 e 1,06:1** contra a coluna em `--negative`. A ACE-3 pede 3:1 contra o fundo adjacente, e onde a linha cruza a coluna só o matiz as separa, o que a ACE-2 proíbe. A alternância é o que esta versão demonstra, então o modo duplo é entrega dela e não opcional.

**O que mudar.** Desenhar por baixo da linha do acumulado uma segunda `Line` com o mesmo `dataKey` e `yAxisId`, em `--surface-raised`, `strokeWidth` de 5 ou 6, `dot={false}`, sem rótulo, fora da dica e com `isAnimationActive` igual ao da linha, que é a saída da TOK-4 e a primeira da TOK-10. Conferir que o revestimento não cobre o topo de coluna nenhuma (a lição da `08/01 v4`) e renderizar o modo duplo uma vez em bancada antes de devolver o padrão `paineis`.

---

## v3_fechamentos-por-vertical-com-acumulado

```
Versão: 08_combinados-e-eixo-duplo/05_colunas-com-linha-de-acumulado/v3_fechamentos-por-vertical-com-acumulado
Data: 2026-10-14
Resultado: reprovada
Não: 20
Correções:
  20. ACE-3, ACE-2 (TOK-4, TOK-10): dar à linha do acumulado um segundo fundo em --surface-raised.
Não se aplica: 26, 27, 28, 29, 32
```

### Bloqueante único. Pergunta 20, ACE-3 e ACE-2, saída da TOK-4: a linha do acumulado some dentro do segmento de Renda fixa

**Evidência.** A linha em `--chart-7` é pintada depois das quatro `Bar` e não tem revestimento. Os vértices de jan/26 a jun/26 caem dentro das pilhas (jan e fev no Crédito estruturado, mar na divisa de Previdência com Renda fixa, abr em Renda fixa, mai em Previdência, jun em Imobiliário); só jul e ago ficam acima delas. Contra cada segmento, a linha mede:

| Tema | Crédito estruturado | Renda fixa | Previdência | Imobiliário |
|---|---|---|---|---|
| Escuro | 1,58:1 | **1,08:1** | 1,23:1 | 1,02:1 |
| Claro | 1,12:1 | **1,09:1** | 1,25:1 | 1,08:1 |

Nos outros segmentos o matiz ainda separa a linha (diferença de cor ΔE de 49 a 118). Em Renda fixa, não: violeta sobre azul dá ΔE de 16,5 no escuro e 19,4 no claro, e na coluna de pixels x=627 do PNG, centro de abr/26, a linha `(154, 139, 245)` passa sobre `(124, 156, 248)` no escuro e `(91, 71, 194)` sobre `(43, 91, 196)` no claro. O vértice de abr/26 do acumulado some nos dois temas, e a linha parece partida numa das duas pilhas mais altas do ano. É o sintoma da TOK-4, com a saída conhecida, e o caso que a 17.2 antecipa ao restringir `--chart-7` e `--chart-8`.

**O que mudar.** A mesma saída da `v2`: uma `Line` de revestimento em `--surface-raised` por baixo da linha do acumulado, com o mesmo `dataKey` e `yAxisId`, `strokeWidth` de 5 ou 6, sem ponto, sem rótulo e fora da dica. O topo de pilha mais próximo da linha é o de jun/26 (y 78,1), a 6,2 px dela onde ela sai da coluna, então um revestimento de até 2 px de cada lado não cobre topo nenhum. O vértice de mai/26 (y 104,4) passa a 1,4 px da divisa entre Previdência e Imobiliário (y 103,0): conferir no PNG que esse contorno de 1 px continua lido dos dois lados da linha. Trocar só a cor da linha não basta, porque a TOK-4 mediu que nenhum par categórico chega a 3:1 entre si.

---

## v4_estorno-e-meta-revisada

```
Versão: 08_combinados-e-eixo-duplo/05_colunas-com-linha-de-acumulado/v4_estorno-e-meta-revisada
Data: 2026-10-14
Resultado: reprovada
Não: 7, 20
Correções:
  7. EIX-8, emenda de 2026-09-28: imprimir a taxa de câmbio implícita entre os dois eixos e o que ela vira com um passo a mais.
  20. ACE-3, ACE-2 (TOK-4, TOK-10): dar à linha do acumulado um segundo fundo em --surface-raised.
Não se aplica: 6, 26, 27, 28, 29, 32
```

### Bloqueante 1. Pergunta 7, EIX-8, emenda de 2026-09-28: o eixo duplo é assumido de propósito e não imprime a taxa de câmbio implícita

**Evidência.** O `meta.json` diz que "aqui o eixo duplo é o assunto", e o rodapé escreve só "Os dois eixos partilham o zero, e nada além dele". É a forma que a emenda da EIX-8 descreve como verdadeira e insuficiente ("dizer no rodapé que as escalas são independentes é verdade e não convence, porque o leitor já viu o cruzamento"), e a mesma emenda manda imprimir a taxa "em qualquer versão que assuma o eixo duplo de propósito". O cruzamento existe e é exato: com os domínios de −R$ 200 mil a R$ 200 mil e de −R$ 1,6 mi a R$ 1,6 mi, o desenho equipara **R$ 1,00 do mês a R$ 8,00 do acumulado**. No `preview.svg` a coluna de ago/26 tem `y="49.125"` e o degrau da meta passa por `L477.25,49.125L537.75,49.125`: a meta de R$ 1,0 mi corre exatamente sobre o topo de uma coluna de R$ 125 mil, e o cartão parece dizer que agosto alcançou a meta. O degrau de R$ 1,2 mi também corta a coluna de mar/26 (topo em 31,8, meta em 36,75) e o de R$ 1,0 mi a de jun/26 (46,65 contra 49,125). A `v2` no modo duplo e a `v3` aplicam a técnica; esta versão a dispensa, e a régua não abre exceção para isso.

**O que mudar.** Calcular a taxa do próprio domínio (`aligned.right.max / aligned.left.max`, hoje 8) e a do passo seguinte (`RIGHT_STEP` a mais no topo da direita, R$ 2,0 mi contra R$ 200 mil, que dá 10), e escrevê-las no rodapé no padrão da `v3` ("o desenho equipara R$ 1,00 do mês a R$ 8,00 do acumulado, e um passo a mais na direita leva o empate a R$ 10,00"), mantendo a nota da meta vigente. No passo seguinte a mesma coluna de agosto sobraria acima da meta sem nenhum número do dado mudar, e é essa a demonstração que a emenda pede. O rodapé passa de uma linha: refazer a conta da GEO-1 no `meta.json`.

### Bloqueante 2. Pergunta 20, ACE-3 e ACE-2, saída da TOK-4 e da TOK-10: a linha do acumulado corre por dentro das colunas

**Evidência.** No `preview.svg` os vértices da linha estão em y 103,6, 97,7, 87,8, 81,0, 92,1, 84,1, 77,6 e 69,9, e os topos das colunas positivas em 51,6, 64,0, 31,8, 56,6, 46,65, 59,0 e 49,1, com a base em 111,0: o vértice de **todos os sete meses positivos** cai dentro da própria coluna, e só o de mai/26 fica sobre o cartão. A linha em `--chart-3` mede **1,47:1 no escuro e 1,03:1 no claro** contra a coluna em `--chart-1`, os mesmos números que a TOK-4 registra para o par. No claro só o matiz separa as duas marcas (ΔE de 60), e a ACE-2 proíbe a cor como único canal. O degrau da meta, em `--text-muted`, atravessa as colunas de mar/26 e jun/26 a 1,82:1 e 1,12:1, que é o sintoma da TOK-10.

**O que mudar.** Para a linha do acumulado, a saída da `v2` e da `v3`: uma `Line` de revestimento em `--surface-raised` por baixo dela, com `strokeWidth` de 5 ou 6. O topo de coluna mais próximo da linha fica a mais de 18 px (jul/26 e ago/26), então o revestimento não cobre topo nenhum. Para o degrau da meta, **não** usar revestimento, porque ele corre exatamente sobre o topo de ago/26 e o apagaria (a lição da `08/01 v4`): pintá-lo abaixo das colunas, com `zIndex` menor que o delas, como a linha de zero já faz, que é a segunda saída da TOK-10.

---

## Recomendado na mesma passada, sem peso de bloqueio

Registrado também no README do modelo, na seção de observações, com a data de hoje.

- `v2`: a raiz tem `role="img"` e contém o `radiogroup` da alternância, e filho de `img` é apresentacional para a tecnologia assistiva. Levar o `role="img"` e a frase acessível para o bloco do gráfico e deixar a alternância fora dele.
- `v2`: o modo duplo não desenha a `ReferenceLine` da meta anual que o modo painéis tem. Os dois modos deveriam carregar as mesmas anotações.
- `v3`: escrever `97 fechamentos` no rótulo final (NUM-6) nomeia a linha e dá à `--chart-7` o rótulo direto que a 17.2 pede; a legenda pode dizer que os valores são o total do ano (NUM-5).
- `v4`: um título curto por eixo, como o da `v1`, e um rótulo no fim do degrau da meta ligariam cada traço ao seu nome sem depender da nota do rodapé.
- README, Anatomia: o item 13 afirma a mesma escala de categoria nos dois painéis, o que só passa a ser verdade depois da correção da `v2`, e o item 14 limita a taxa de câmbio à `v2` e à `v3`, e precisa incluir a `v4` depois da correção dela. O README é do modelo, e quem corrige pode alinhá-lo.

## O que não mudar

- `v2`: o domínio do eixo do mês por `PACE_AT`, que põe o ritmo linear na metade do eixo; a cor da coluna pela polaridade da receita, com a posição contra o ritmo como segundo canal; os meses futuros como `null`; o modo painéis como padrão; a taxa de câmbio no rodapé do modo duplo.
- `v3`: o `slot` vindo do `data.ts`, na ordem 1, 3, 6, 5; o contorno de 1 px entre segmentos; a legenda de cima para baixo com a amostra na forma da marca; a taxa de câmbio no rodapé; nenhuma vertical em zero nos meses fechados.
- `v4`: `alignZero` e a linha de zero única em `--line-strong`; a meta vigente mês a mês no dado, desenhada em `stepAfter`; o sinal de menos tipográfico no tique; o rótulo do estorno ancorado em `y + height / 2`; a nota da meta vigente derivada do dado.

## Por que o check não acusou

- A `CONTRASTE-MARCA` mede cada marca contra o cartão, onde as três linhas passam folgadas (de 6,0:1 a 6,7:1). Nenhuma guarda mede marca contra marca, que é a TOK-9, nem linha que corre por dentro de coluna.
- Nenhuma guarda compara a posição da mesma categoria entre dois `<svg>` empilhados, e é isso que deixou a EIX-12 passar na `v2` com 34 px de diferença.
- O render retrata só o estado inicial. O modo duplo da `v2`, metade do que a versão demonstra, não tem preview, e foi medido aqui pelo código e pelas cores dos tokens.
- A emenda de 2026-09-28 da EIX-8 não tem guarda: a ausência da taxa de câmbio só se vê na leitura.
