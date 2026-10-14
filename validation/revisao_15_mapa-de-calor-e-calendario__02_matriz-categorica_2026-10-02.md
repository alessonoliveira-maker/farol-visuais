# Parecer de revisão: 15_mapa-de-calor-e-calendario/02_matriz-categorica

Data: 2026-10-02. Revisor independente. Versão julgada: `v1_win-rate-por-executivo-e-segmento`, pelo arquivo e pelos PNGs de hoje (render de 2026-10-02, com a linha de base herdada no `<style>`). As outras três versões não entraram. `npm run check`: 0 erros, 1 aviso (TAMANHO-TEXTO na v1, em fila de dívida).

## v1_win-rate-por-executivo-e-segmento: reprovada, dois bloqueantes

**Nenhum dos dois bloqueantes vem da mudança do botão.** Os dois já estavam no arquivo de 2026-09-24 e a ferramenta só passou a medir o primeiro em 2026-09-29, um dia depois do aceite anterior.

### O que motivou a revisão, e passou

Botões do alternador, medidos no `preview.svg` e olhados nos dois PNGs com ampliação de 3 vezes:

| Item | Medida | Resultado |
|---|---|---|
| Altura | 22 px nos dois botões (12 de linha, 4 mais 4 de recuo, 1 mais 1 de borda) | iguais |
| Texto | Manrope 12 px herdado; ativo em peso 500 e `--text-primary`, inativo em 400 e `--text-muted` | sem Arial, sem 13,33 px |
| Alinhamento | "Ordenar por", "Taxa geral" e "Semelhança de perfil" na mesma linha de base, texto centrado na pílula | íntegro |
| Corte | descendente do "g" e cedilha do "ç" dentro da pílula, com folga | sem corte |
| Colisão | 6 px entre os três itens; a linha de 22 px fica a 8,5 px da grade | sem colisão |
| Contraste do texto | ativo 14,53:1 e 17,96:1; inativo 5,21:1 e 5,37:1 (escuro e claro) | acima de 4,5:1 |

A mudança tocou só o texto dentro do botão: no preview do commit `4c22f6e0` a caixa do botão já tinha 22 px e a grade já saía em 451,78 por 367,5 px, os mesmos números de hoje. Diferença entre o SVG e a página no render de hoje: 0,19% no escuro e 0,21% no claro, dentro do teto de 0,5% da pergunta 21.

### Bloqueante 1. Pergunta 10, TIP-2, armadilha GEO-18 (texto abaixo do piso no próprio preview)

**Evidência medida no `preview.svg`, igual nos dois temas.** O `<svg>` da grade tem `viewBox="0 0 536 436"` e sai com `width="451.78" height="367.5"`: escala 0,843, governada pela altura. O corpo tem 441,5 px; botões (22), dois vãos de 8 e legenda de duas linhas (36) deixam 367,5 px para uma grade que pede 436.

| Texto | Declarado | Na tela | Quantos |
|---|---|---|---|
| Volume da célula ("18 de 27"), total da coluna ("184 fechadas"), `formatUnavailable()` | 11 px | 9,27 px | 55 |
| Nome de executivo e de segmento | 12 px | 10,11 px | 15 |
| Taxa da célula | 14 px | 11,80 px | 49 |

São 70 textos abaixo de 11 px, e o corpo fica com cinco tamanhos (12, 11,80, 11, 10,11 e 9,27 px) contra o teto de três. No PNG isso se vê: a legenda em HTML, a 11 px reais, sai maior que o volume dentro da célula, e "Ordenar por" sai maior que o nome do executivo. O texto mais encolhido é justamente o volume, que entrou em 2026-09-24 para tirar a reprovação por NUM-1.

**Consequência em cadeia.** Com a escala diferente de 1, a COLISAO-TEXTO, a CONTRASTE-TEXTO e a TEXTO-NA-MARCA não medem a versão (`preview_com_escala`). Medi os pares à mão e todos passam (ver o fim deste parecer), mas a peça segue sem guarda nesses três pontos enquanto a escala existir.

**A nota do `meta.json` afirma o contrário do que o render mede.** Ela diz que o canvas `alto` foi escolhido para não furar o piso de 11 px. O README, em Como colar, item 6, diz que no catálogo o texto está no piso; para a `v1`, com corpo de 574 px, não está.

**O que mudar** (saída da GEO-18, uma conta só):

1. Dar à grade os 436 px que ela pede: canvas por número no `meta.json`, perto de `{ "width": 640, "height": 632 }` (560 mais os 68,5 px que faltam, arredondado para múltiplo de 4). A largura já sobra: 536 contra 574.
2. Tirar a escala: o `<svg>` hoje é `h-full max-w-full` e esticaria para 1,008 no canvas novo. Fixar `width` e `height` no tamanho do `viewBox` (ou `max-h-full` com tamanho natural) para a escala sair exatamente 1 e as três guardas voltarem a medir.
3. Reescrever a nota do `meta.json` com a conta das linhas (GEO-1): botões, vãos, grade de 436 e legenda de 36.
4. Consertado, a chave `TAMANHO-TEXTO` desta versão sai de `_render/scripts/lib/divida-guardas.json`, como o próprio arquivo manda; o `check` avisa se o registro ficar sobrando.

O caminho contrário, encolher a célula até a grade caber em 367,5 px, não é recomendado: a célula de 38 px foi o que abriu lugar para as duas linhas de 14 e 11 px, e pela GEO-1 quem cede é a altura do canvas.

### Bloqueante 2. Pergunta 8, EST-1b (ausência como zero, seção 14.1: bloqueia sempre)

**Evidência no código.** `Chart.tsx:80` declara `function overallRate(row: ExecutiveRow): number` e `Chart.tsx:87` fecha com `return closed === 0 ? 0 : wins / closed;`. A EST-1b manda `number | null` e `null` para lista sem base, nunca `0`. O mesmo arquivo acerta o padrão em `rateOf` (linha 61) e em `segmentTotals` (linha 175).

**Por onde o zero falso chega à tela.** Não aparece com o `data.ts` padrão, em que todo executivo tem fechadas; aparece no ramo, que é onde a EST-1b diz que o defeito mora.

1. Ordenação (linhas 108 e 148): executivo sem nenhuma oportunidade fechada é ordenado como taxa zero medida, empatado com quem perdeu tudo, e a ordem estável decide quem fica acima.
2. Frase acessível (linha 187): `formatPercent(overallRate(leader), 1)`. Com um executivo sem fechadas na frente de outro com 0 de 5, a frase anuncia "lidera, com 0,0%" para quem não tem medição.
3. Semelhança (linhas 91 e 92): o `fallback` do par ausente é a taxa geral, que para esse executivo vira 0, e a cadeia o encosta nos perfis de taxa baixa.

**O que mudar.** `overallRate` devolve `number | null`; a ordenação põe o nulo por último, separado do zero medido; a frase só cita a taxa do líder quando ela existe; a `distance` trata o nulo sem trocar por zero (pular o par ou afastar o executivo, com a escolha escrita em comentário). O README do modelo já descreve este defeito na seção "O defeito que a v1 propaga, e a regra que vence": consertado, aquela seção pede uma linha datada dizendo que foi quitado.

### Medido à mão, porque três guardas não medem esta versão

Contraste de texto contra o fundo onde está, escuro e claro (piso 4,5:1):

| Par | Escuro | Claro |
|---|---|---|
| `--text-primary` sobre `--seq-1`, `--seq-2`, `--seq-3` | 12,69, 9,21 e 6,33:1 | 14,82, 12,05 e 9,35:1 |
| `--accent-cyan-contrast` sobre `--seq-6` | 7,38:1 | 5,45:1 |
| `--text-secondary` no cartão (nomes) | 8,16:1 | 8,13:1 |
| `--text-muted` no cartão (totais, ausência, legenda) | 5,21:1 | 5,37:1 |

Nenhum dado caiu na faixa `--seq-7`, então o par dela não foi exercitado. Colisão: cerca de 20 px (estimados pela largura do glifo, em unidades do `viewBox`) entre totais de colunas vizinhas, 8 px entre o nome do executivo e a primeira célula, nenhum texto encostando em outro nos dois PNGs. Contas conferidas contra o `data.ts`: os cinco totais de coluna, a ordem das dez linhas (Renan A. acima de Talita V. por 49,43% contra 49,40%; Fernando L. e Adriano M. empatados em 15 de 46), as cinco células de contorno cheio e a faixa de cor das células que amostrei em cada degrau usado.

### Registro

```
Versão: 15_mapa-de-calor-e-calendario/02_matriz-categorica/v1_win-rate-por-executivo-e-segmento
Data: 2026-10-02
Resultado: reprovada
Não: 8, 10
Correções:
  8. EST-1b: overallRate devolve number | null, com nulo por último na ordem e tratado na frase e na distância.
  10. TIP-2: desenhar a grade em escala 1 (canvas por número e svg no tamanho do viewBox) e corrigir a nota do meta.json.
Não se aplica: 3, 4, 6, 13, 18, 26, 27, 28, 29, 31, 32
```

A pergunta 19 leva ressalva e não "não": a frase acessível tem 167 caracteres e diz a conclusão, mas não começa pelo tipo do gráfico. É redação, foi para o README como observação, e convém acertar na mesma rodada.

## Nota de régua, para o dono

A AGREGACAO-ZERO mediu a `v1` e não acusou `overallRate`: a versão está na fila de dívida só por TAMANHO-TEXTO. Causa provável, lida no código e não testada: o filtro de nome em `agregacao.mjs` (`NOME_FAMILIA`) pede um caractere que não seja letra antes de `rate`, e `overallRate` tem o "l" de `overall` colado. O defeito está descrito no README do modelo desde 2026-09-28 e passa calado pela ferramenta.
