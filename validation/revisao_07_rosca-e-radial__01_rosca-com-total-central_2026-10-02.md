# Parecer de revisão: 07_rosca-e-radial/01_rosca-com-total-central

Data: 2026-10-02. Revisor independente. Versões julgadas: `v2_perdas-por-motivo-com-fatia-ativa` e `v4_origem-com-fatia-minima-e-ausencia`, pelo arquivo e pelos PNGs de hoje (render de 2026-10-02, com a linha de base herdada no `<style>`). A v1 e a v3 não entraram. `npm run check`: 0 erros, 0 avisos. Resultado: v4 aprovada, v2 reprovada por um bloqueante.

## O que motivou a revisão, e passou nas duas versões

O botão da legenda desenha certo no preview atual, nos dois temas. Medido na página da ferramenta: cada `<button>` tem 325 por 16 px, Manrope 12 px com linha de 16 px, sem borda, sem preenchimento e sem padding; amostra de 10 por 10 px, nome em 213 px com `scrollWidth` igual a `clientWidth` (nenhuma reticência, inclusive com o nome em peso 700), contagem em 32 px e percentual em 40 px, os dois em Space Grotesk tabular alinhados à direita; passo de 26 px entre linhas. Sem corte, sem colisão, sem transbordo. Preview contra página, pixels acima da tolerância de 48: v2 com 9 (0,001%) no escuro e 24 (0,003%) no claro, todos no texto do centro e nenhum nos botões; v4 com 0 e 0. **A mudança do botão não criou defeito em nenhuma das duas.**

## v2_perdas-por-motivo-com-fatia-ativa: reprovada, um bloqueante

**O bloqueante não tem relação com a mudança do botão.** O código é o mesmo de 2026-09-18 e o defeito já existia; a revisão anterior olhou só o estado padrão.

### Bloqueante 1. Perguntas 13 e 20, ROT-7, ROT-6 e ACE-3 (colisão de texto com marca e contraste, seção 14.1: bloqueia sempre)

**O que acontece.** A versão existe para demonstrar que "o centro alterna do total ao item" e que "legenda e teclado também ativam a fatia". Com o `data.ts` da própria versão, ativar 3 dos 5 motivos faz o nome do centro sair do miolo e passar por cima do anel. O preview padrão não mostra porque o motivo aberto ao montar, `Sem fit de perfil`, é um dos dois que cabem.

**Evidência medida** (página da ferramenta, foco em cada botão da legenda, nos dois temas; anel lido do `preview.svg`: centro em x=112,5, raio interno 64,79 px, raio externo 77,33 px, ou 85,33 px na fatia ativa; o miolo tem 129,6 px no diâmetro e de 124 a 129 px de corda na faixa da primeira linha):

| Motivo em foco | Largura do nome (14 px, peso 600) | Passa do raio interno, por lado | Quanto do anel cobre |
|---|---|---|---|
| Sem fit de perfil | 104,9 px | cabe, folga de 12,4 px | nada |
| Preço acima do orçamento | 177,1 px (x de 24,2 a 201,3) | 23,8 px | a espessura toda, e sai 11,2 px além do raio externo |
| Escolheu concorrente | 147,1 px (x de 39,3 a 186,4) | 8,7 px | 70% da espessura |
| Sem resposta no follow-up | 178,0 px (x de 23,7 a 201,8) | 24,2 px | a espessura toda, e sai 11,7 px além do raio externo |
| Projeto adiado | 97,4 px | cabe, folga de 16,1 px | nada |

O texto é `--text-primary` sem halo, e cai sobre `Sem fit de perfil` às 3 horas e sobre `Escolheu concorrente` às 9 horas. Contraste do texto contra a fatia que ele cobre: 1,53:1 e 1,97:1 no escuro, 2,99:1 e 3,33:1 no claro, contra o piso de 4,5:1. A ROT-6 proíbe exatamente este par (`--text-primary` sobre categórica, de 1,53:1 a 3,37:1). O texto também tapa o trecho do anel por onde passa, então a marca fica partida nos dois lados.

**Por que o `check` não acusou.** A COLISAO-TEXTO e a CONTRASTE-TEXTO medem o `preview.svg`, que fotografa só o estado de montagem. Estado alcançado por foco ou ponteiro não tem guarda: a medição é do revisor.

**O que mudar.** Fazer o nome caber no miolo sem perder letra (a TIP-7 proíbe reticência em nome de marca):

1. Quebrar o nome em até duas linhas no `renderCenter`, por palavra, com largura máxima derivada do raio interno e nomeada no topo do arquivo (a corda na altura da linha menos 4 px de respiro por lado, cerca de 116 px). As quebras `Preço acima do` e `orçamento`, `Sem resposta no` e `follow-up`, `Escolheu` e `concorrente` cabem com folga. A quebra precisa ser determinística, por contagem de caracteres ou por tabela de largura, sem medir o DOM.
2. Reposicionar a linha de contagem (`54 perdas (25%)`, 11 px, peso 700) abaixo da segunda linha, e manter o bloco inteiro centrado na vertical: três linhas somam cerca de 49 px e a corda a 25 px do centro ainda tem 119,5 px.
3. Conferir os 5 estados nos dois temas, focando cada botão da legenda, e não só o preview padrão. Critério: a tinta de cada linha do centro fica dentro da corda do raio interno na altura dela, com 4 px de respiro por lado; na linha que passa pelo centro isso dá de x=51,7 a x=173,3 no `<svg>` de 225 px, e a 25 px do centro dá de x=56,8 a x=168,2.

Alternativa aceita, se a quebra não fechar: o centro passa a mostrar só contagem e percentual do item, com o nome em peso 700 na legenda. Nesse caso o `useCase` e o `demonstrates` do `meta.json` deixam de dizer "com nome no centro".

**O que não mudar.** O estado ativo por `shape` lendo `isActive`, o ganho de 8 px no raio, o atraso de saída de 100 ms, a ativação por ponteiro, foco e clique, os botões da legenda como estão, os slots de cor por `colorIndex`, a ordem decrescente a partir das 12 horas e o `activeId` vindo do `data.ts`. Tudo isso foi conferido e está certo.

### Não bloqueantes da v2, para alinhar na mesma rodada se o corretor quiser

Estão no README do modelo, na seção de observações. Os que custam uma linha cada: percentual da legenda pelo maior resto, como a v4 faz com `integerShares` (hoje a soma dá 100 por coincidência do dado, NUM-2); ícone `Filter` de 16 px no bloco de vazio (EST-1); margem do `PieChart` em constante `MARGIN` no topo (ESP-3); `font-medium` nas colunas `kpi-number` (TIP-4). Nenhum deles reprova.

### Registro no formato do checklist

```
Versão: 07_rosca-e-radial/01_rosca-com-total-central/v2_perdas-por-motivo-com-fatia-ativa
Data: 2026-10-02
Resultado: reprovada
Não: 13, 20
Correções:
  13. ROT-7: o nome do item ativo no centro não pode cobrir o anel; quebrar em até duas linhas dentro da corda do raio interno, sem reticência.
  20. ROT-6 e ACE-3: com o nome dentro do miolo, some o par text-primary sobre fatia categórica (1,53:1 no escuro, 2,99:1 no claro).
Não se aplica: 4, 7, 18, 26, 28, 29, 30, 31, 32
```

## v4_origem-com-fatia-minima-e-ausencia: aprovada

Sem bloqueante. Conferido no desenho de hoje e no código: 6 partes coloridas mais a ausência, slots 1, 3, 6, 5, 2 e o 4 reservado a `Outros (n=3)`; percentuais 41, 25, 14, 7, 1, 1 e 11, que somam 100 pelo maior resto; contagens 200, 120, 70, 32, 4, 6 e 54, que somam os 486 do centro; ausência vazada com contorno `--text-muted`, por último no anel e na legenda, fora de `Outros`; sem `minAngle`. O centro não muda com a ativação (26,4 e 66,5 px de largura, dentro do miolo em todos os 7 estados de foco), então o defeito da v2 não existe aqui. A fatia mínima ativa pelo foco ganha 6 px de raio e o nome em peso 700, sem deslocar a legenda. As observações estão no README.

```
Versão: 07_rosca-e-radial/01_rosca-com-total-central/v4_origem-com-fatia-minima-e-ausencia
Data: 2026-10-02
Resultado: aprovada
Não: nenhum
Correções:
  nenhuma
Não se aplica: 4, 7, 13, 18, 26, 28, 29, 30, 31, 32
```
