# Parecer de revisão: 27_rede-e-relacoes/02_grafo-bipartido

Data: 2026-10-13. Revisor independente, primeira passada, as quatro versões em `sem_revisao`, julgadas pelo arquivo e pelos PNGs de hoje (render das 14:47:32 às 14:47:43, posterior ao último `Chart.tsx`, das 14:47:20). `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes.

Resultado: três aprovadas e uma reprovada. A `v2` cai por um bloqueante que o retrato não mostra, porque mora no estado de cursor que a versão existe para demonstrar: com o cursor sobre o Executivo E, o rótulo `100% (16 de 16)` do SDR 3 não cabe na margem esquerda e o primeiro algarismo sai cortado na borda do corpo. Nenhuma versão tem defeito de conta, de ordem, de ausência ou de contraste: somas, percentuais, faixas e ordem por baricentro conferem com o `data.ts`. As observações não bloqueantes estão no README do modelo, seção `Observações da revisão (não bloqueantes)`.

| Versão | Resultado | Não |
|---|---|---|
| `v1_handoffs-sdr-para-executivo` | aprovada | nenhum |
| `v2_concentracao-do-sdr-selecionado` | reprovada | 15 |
| `v3_clientes-e-produtos-na-carteira` | aprovada | nenhum |
| `v4_executivo-sem-repasse` | aprovada | nenhum |

Não se aplica, nas quatro: perguntas 4, 13, 26, 27, 28, 29 e 31. Na `v1`, na `v3` e na `v4` também a 6 e a 30.

## O que foi medido e o que não foi

* **Refeito do `data.ts`, à mão:** na `v1`, os 22 pares, os 177 repasses e o total dos 13 nós. Na `v2`, os quatro percentuais do SDR 3 pelo maior resto (40, 30, 20 e 10, somam 100) e os 70% dos dois pares mais fortes (28 de 40). Na `v3`, as 58 ligações, o grau dos 7 nós de produto (18, 12, 9, 7, 5, 4 e 3) e o par mais frequente (emissão fiscal com controle de estoque, 11 de 24; o segundo é folha com conciliação, 6). Na `v4`, os 16 pares, os 140 repasses e o total dos 11 nós com ligação.
* **Baricentro, refeito fora do componente com a mesma regra:** a ordem desenhada confere com a dos PNGs nas quatro. Cruzamentos: 25 na `v1` e na `v2`, 11 na `v4` (30 com uma largada só) e 253 na `v3` (269 com uma largada só), como os `notes` dizem.
* **Faixas de espessura:** `buildBands(16)` dá 1 a 5, 6 a 10 e 11 a 16, o que a legenda escreve, e o último degrau é o maior peso observado (ROT-5b).
* **Escala do SVG:** 574 x 273,5 para viewBox de 574 x 272 na `v1`, 273 na `v2`, 373 para 372 na `v3` e 275 para 274 na `v4`. Escala 1 nas quatro, então os 11 px valem na tela (GEO-18).
* **Preview contra página:** de 0,000% a 0,015% de pixels diferentes nos oito pares de PNG.
* **Frase acessível, lida em `data-farol-ace`:** 214, 208, 223 e 214 caracteres, as quatro começando por "Grafo bipartido" e verdadeiras contra o dado.
* **Peso 700, contado no `preview.svg`:** nenhum na `v1` e na `v3`, dois na `v2` (nome e valor do SDR 3) e dois na `v4` (nome e valor do Executivo F).
* **Página viva da `v2`:** montada pelo mesmo pacote e servidor do `npm run render`, 640 x 460, nos dois temas, com o cursor levado a cada um dos 13 nós. Em cada estado: caixa de cada `<tspan>` contra a caixa do `<svg>`, número de ligações acesas, elementos em peso 700 e altura da linha de leitura. É daí que sai o bloqueante.
* **Recortes ampliados dos PNGs:** a zona de maior cruzamento da `v3` nos dois temas, as ligações acesas da `v2` no tema claro e a última linha da `v4` (ícone, nó vazado e rodapé).
* **Não medido pela ferramenta:** `ESPESSURA-MARCA` (`marca_fora_do_bar`), `EIXO-CALMO` (`sem_grade`), `OPACIDADE-MARCA` (`sem_opacidade_em_marca`) e `RAIO-CONTRA-AREA` (`sem_marca_de_area`) nas quatro. A `OPACIDADE-MARCA` se aplica à `v2`, que baixa as ligações por `strokeOpacity`, e foi conferida à mão, abaixo.
* **Não renderizado:** o estado vazio das quatro, a `v2` com `highlightId` inexistente e as dicas nativas (`<title>`). O que se diz deles é leitura do código.
* **Não testado:** a saída sugerida. As larguras citadas nela são medida de texto no navegador, não render da peça corrigida.

Pares de contraste, calculados de `app/src/styles/tokens.css` pela fórmula da WCAG:

| Par | Escuro | Claro | Onde |
|---|---|---|---|
| `--text-muted` contra o cartão | 5,21 | 5,37 | ligação, amostra da legenda, contorno do zero e ícone da `v4`, nó "Outros" da `v3` |
| `--text-secondary` contra o cartão | 8,16 | 8,13 | nó e nome do nó |
| `--text-muted` a 0,76 contra o cartão | 3,57 | 3,27 | ligação fora de foco da `v2` (ACE-5) |
| `--chart-1` contra o cartão | 9,50 | 6,00 | ligação acesa da `v2`, emissão fiscal da `v3` |
| `--chart-2` a `--chart-6` contra o cartão | 5,90 a 8,36 | 5,34 a 6,25 | os outros cinco produtos da `v3` |
| `--chart-1` contra a ligação fora de foco | 2,66 | 1,84 | aceso contra neutro na `v2` (TOK-9), declarado no `notes` |
| `--line-strong` contra o cartão | 1,79 | 1,83 | o token que o catálogo pedia para a ligação, trocado com razão (ACE-6) |

## `v2_concentracao-do-sdr-selecionado`: reprovada

O retrato está certo: quatro ligações acesas por cima das demais, 40, 30, 20 e 10 por cento escritos com o volume no nó de destino, `0% (0 de 40)` nos executivos sem ligação com o SDR 3, peso 700 em dois elementos, opacidade medida acima do piso nos dois temas e o par aceso contra neutro declarado no `notes`. O bloqueante está no estado que o retrato não fotografa.

### Bloqueante 1. Pergunta 15, `ESP-3` (texto cortado na borda do corpo, com o cursor sobre o Executivo E)

**O que o desenho faz.** Com o cursor num executivo, a coluna da esquerda troca o total de cada SDR pela parte dele no total daquele executivo, no formato `40% (16 de 40)`. O rótulo da esquerda é ancorado à direita em x = 84 (`MARGIN.left` de 92 menos `LABEL_GAP` de 8), então a linha tem 84 px até a borda do viewBox.

**Evidência, medida em página viva e não deduzida.**

* Cursor sobre `Executivo E`, que só recebe do SDR 3: o SDR 3 passa a escrever `100% (16 de 16)`. A linha mede **86,55 px** (Space Grotesk 500, 11 px, algarismo tabular) e começa em x = 30,45 px da página; o `<svg>` começa em 33 px. São **2,55 px fora do SVG**, nos dois temas.
* O `<svg>` tem `overflow: hidden` (estilo do navegador para `svg` que não é raiz, lido no estilo computado; o preflight do Tailwind não muda isso). O que passa da borda some: no recorte ampliado o primeiro "1" perde a bandeira e a metade esquerda do pé, e sobra a haste.
* Os outros 12 nós, medidos do mesmo jeito, não põem texto fora do SVG. A segunda linha mais larga é `57% (12 de 21)`, com 79,72 px.
* `Chart.tsx`, linhas 24 a 28: o comentário afirma que as duas margens "guardam a linha mais larga, 100% (16 de 16)". A direita guarda (96 menos 8, 88 px). A esquerda não (84 px).
* O preview não mostra porque é o estado padrão, com o SDR 3 aceso, em que a coluna da esquerda escreve `40 repasses` (63,92 px em peso 700).
* Atenuante, e ele não fecha a conta: o número ainda se lê como 100% pela haste que sobra e pelo `(16 de 16)` ao lado.

**Por que não é acabamento sem consequência.** A seção 14.1 nomeia texto cortado como a consequência que faz uma constante de acabamento reprovar, e manda descrever pela consequência, não pelo número. O corte acontece com o dado padrão, sem prop nenhuma, no gesto que a versão existe para demonstrar (o quarto item de `demonstrates` é o hover), e a peça colada no Farol como está corta o mesmo algarismo. O acervo já decidiu que defeito fora do retrato conta quando o assunto da versão é a interação: `11_fluxo-sankey/01_sankey-simples`, `v2`, em 2026-10-05, com medição em página viva.

**O que mudar.**

1. Levar `MARGIN.left` a 96 no mínimo: 88 px para a linha de 86,55 px, a mesma folga de 1,45 px da direita.
2. Melhor que a constante: derivar as duas margens da linha mais larga que o dado pode produzir, `100% (T de T)` com T o maior total de nó. Em 11 px tabular cada algarismo mede 6,82 px; com total de três algarismos a linha chega a 100,19 px, e nem os 88 px da direita bastam.
3. Corrigir o comentário das linhas 24 a 28 para o que foi medido.
4. Conferir do jeito que foi medido: montar, levar o cursor a cada um dos 13 nós e comparar a caixa de cada `<tspan>` com a do `<svg>`. Nenhum pode sair. Render nos dois temas e `npm run check` por último. O canvas não muda, porque a margem é interna ao viewBox.

**Na mesma passada, sem peso de bloqueio.** Estão no README e cabem na mesma edição:

* A altura do nó conta pares e o número ao lado é o total de repasses; uma frase na linha da legenda diz o que a altura mede.
* O período da legenda sai sem `tabular-nums` (TIP-1).

```
Versão: 27_rede-e-relacoes/02_grafo-bipartido/v2_concentracao-do-sdr-selecionado
Data: 2026-10-13
Resultado: reprovada
Não: 15
Correções:
  15. ESP-3: com o cursor sobre o Executivo E, o rótulo 100% (16 de 16) do SDR 3 começa 2,55 px fora do SVG e o primeiro algarismo sai cortado; levar MARGIN.left a 96 no mínimo, ou derivar a margem do maior total do dado.
Não se aplica: 4, 13, 26, 27, 28, 29 e 31
```

## `v1`, `v3` e `v4`: aprovadas

Nenhuma das três tem "não". O corretor não precisa tocar nelas; o que segue é o registro do que sustentou o aceite, e as observações de cada uma estão no README.

* **`v1`.** Ligação em `--text-muted` no lugar do `--line-strong` do catálogo, com o desvio declarado e o contraste conferido. Três faixas de espessura com a legenda na forma do traço e o intervalo calculado do maior peso. Total de cada nó escrito com o substantivo, linha de leitura e frase acessível com o par mais forte (SDR 3 com o executivo E, 16 de 177). Ponto a acompanhar, no README: a altura do nó conta pares e o número ao lado é o total, sem nada no cartão que diga isso.
* **`v3`.** Seis produtos em slot fixo na ordem 1, 3, 6, 5, 2, 4 e o sétimo nó agrupado em neutro com a contagem no nome (COR-4, COR-8), desvio do catálogo declarado. A altura do nó de produto é a contagem escrita ao lado. A ordem por baricentro separa as contas de emissão fiscal com estoque, no alto, das de folha com conciliação, embaixo, que é a segunda metade do caso de uso. Dois pontos pesados e deixados como observação: as 13 contas sem nome no desenho parado, que são especificação do catálogo com a regra escrita no cabeçalho, e os traços curtos das ligações de emissão fiscal sob o feixe de controle de estoque, que são da densidade (58 ligações, 253 cruzamentos) e não tiram a identificação, porque a cor nas duas pontas diz o produto.
* **`v4`.** Zero medido (contorno vazado, `0 repasses` escrito em peso 700) e ausência (ícone `Unplug` com o texto de `formatUnavailable()`) têm forma, palavra e posição próprias e não se confundem em nenhum tema; os dois vão para o fim da coluna com vão a mais. Rodapé com a contagem e o motivo, calculados. Pontos a acompanhar, no README: os totais somam só o medido, e o filtro defensivo da linha 242 faria zero de quem só recebeu de nó sem medição, ramo que o dado padrão não exercita.

```
Versão: 27_rede-e-relacoes/02_grafo-bipartido/v1_handoffs-sdr-para-executivo
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 13, 26, 27, 28, 29, 30 e 31
```

```
Versão: 27_rede-e-relacoes/02_grafo-bipartido/v3_clientes-e-produtos-na-carteira
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 13, 26, 27, 28, 29, 30 e 31
```

```
Versão: 27_rede-e-relacoes/02_grafo-bipartido/v4_executivo-sem-repasse
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 13, 26, 27, 28, 29, 30 e 31
```

## Régua e ferramenta

* O catálogo se contradiz na `v3`: o "Quando evitar" do modelo manda matriz acima de 20 nós por coluna e a versão planejada tem 24 contas; o caso de uso pede "cada uma das 24 contas" e o "o que demonstra" manda rotular só as de três produtos ou mais. A versão cumpre o "o que demonstra" e o README declara o limite.
* A seção 14.1 e a pergunta 15 falam do preview, que é um retrato do estado padrão. Texto cortado em estado de cursor não tem guarda nem pergunta que o alcance; só aparece montando a peça e movendo o cursor.
* A `OPACIDADE-MARCA` responde `sem_opacidade_em_marca` para a `v2`, que tem `strokeOpacity` vindo de uma constante (`DIM_OPACITY`). A guarda não segue a constante e o motivo impresso diz o contrário do que o arquivo faz.
