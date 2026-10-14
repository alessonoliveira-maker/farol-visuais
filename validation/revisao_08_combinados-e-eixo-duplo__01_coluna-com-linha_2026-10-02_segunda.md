# Parecer da segunda revisão: 08_combinados-e-eixo-duplo/01_coluna-com-linha

Data: 2026-10-02. Revisor independente, segunda passada, depois da rodada de correção. Versões julgadas: `v2_fechamentos-com-media-movel` e `v4_meta-ausente-e-estorno`, as duas `revisao_desatualizada`, pelos arquivos e pelos PNGs de hoje (render das 11:32, posterior ao último `Chart.tsx`). A `v1` e a `v3` não entraram. `npm run check`: 0 com erro, 0 avisos; OPACIDADE-MARCA não mediu nenhuma por `sem_opacidade_em_marca`, e o código confirma. O parecer da primeira passada continua em `revisao_08_combinados-e-eixo-duplo__01_coluna-com-linha_2026-10-02.md`.

Resultado: `v4` aprovada; `v2` reprovada, com um bloqueante novo, criado pela própria correção. Os dois bloqueantes da primeira passada estão resolvidos. As observações estão no README do modelo, seção `Observações da revisão (não bloqueantes)`, subseção da segunda revisão.

## v2_fechamentos-com-media-movel: reprovada, um bloqueante

### O que a correção resolveu, conferido

- Calendário: `buildCalendar` gera as 12 segundas-feiras de 2026-07-13 a 2026-09-28 com `Date.UTC`, sem relógio. O `data.ts` tem 11 linhas e a semana de 2026-07-27 entra com `closings: null`: sem coluna, `sem dado` em duas linhas de 11 px sobre a base (x=155,5 no centro da banda, sem tocar as colunas vizinhas nem a grade do zero), `formatUnavailable()` na dica.
- Média: fatia o calendário. Nula em 2026-07-13, 07-20 e 07-27 por lista curta, de 2026-08-03 a 08-17 pela lacuna e em 09-28 pela parcial. Os cinco pontos conferem com o dado: 14,5; 15,75; 15,25; 15,5; 17,25 (no `preview.svg`, y de 77,3 a 53,65).
- O dado novo sustenta o título e o caso de uso: a janela de 2026-08-31 a 2026-09-21 (20, 16, 14, 19) não contém a lacuna, dá 17,25, e a linha de leitura escreve `19` contra `17,3`, "Acima do ritmo". A linha tem 5 pontos (`EIX-11`).
- Linha por trás das colunas: o `path` da média vem antes das 11 colunas no `preview.svg`, sem revestimento; nenhum topo coberto. Tiques `jul/26`, `ago/26` e `set/26` em x=69,5, 198,5 e 413,5, as semanas de 2026-07-13, 08-03 e 09-07.
- Item 3 do catálogo devolvido ao `meta.json`, à linha da versão no README e ao passo 4 de "Como colar no Farol".

### Bloqueante 1. `REC-5` e item 4 do catálogo: o valor da semana corrente sumiu do desenho

**Enquadramento.** Sem pergunta própria entre as 32; é a classe "versão que não demonstra o que o catálogo diz", a mesma da primeira passada. A pergunta mais próxima, pela consequência, é a 18 (`DIC-1`): o número da semana corrente passou a existir só na dica.

**Evidência no render.** Nos dois PNGs a coluna vazada de 2026-09-28 não tem nada escrito acima. No `preview.svg` e no `preview-claro.svg` há 10 elementos `<text>` (3 tiques de mês, 5 de valor, `parcial até` e `sem dado`) e nenhum em peso 700: a contagem de pesos do arquivo é 400, 500 e 600. No `preview.svg` do commit `4c22f6e0` existia o `<text>` `3`, em Space Grotesk 12 px, peso 700, com halo, em x=542,4 e y=168,2.

**Causa, lida no código e no pacote.** `Chart.tsx:339` a `341`: `renderPartialValue` procura a linha por `rows[index]`. O `index` que o `LabelList` entrega conta os retângulos desenhados, não as linhas do dado (`recharts/es6/component/LabelList.js:88`, sobre a lista que `Bar.js:667` a `687` filtra quando `y` ou `height` é nulo). Com a lacuna no índice 2, a coluna parcial é o retângulo 10 e `rows[10]` é 2026-09-21, que não é parcial: a função devolve `null`. É a `REC-5` literal, e o defeito aparece em qualquer recorte com lacuna antes da semana parcial, que é o caso que a versão passou a demonstrar.

**Consequência.**

1. O item 4 do catálogo, "Destaque da semana corrente com peso 700 além da cor", não é demonstrado e o desvio não está declarado. Pior: a seção "Colisões resolvidas a favor do CONTRATO" do README afirma que "a versão usa um, o valor escrito acima da coluna parcial", e o render não tem nenhum.
2. O caso de uso pergunta pela semana corrente, e o único número dela (3) saiu do desenho parado: não está no rótulo, nem na linha de leitura, nem na frase acessível. Sobra a dica.
3. A primeira passada listou "o peso 700 só no valor da semana parcial" em "O que não mudar".

**Por que o `check` não acusou.** Nenhuma guarda compara o rótulo que o código declara com o que o preview desenha; `content` que devolve `null` passa calado.

**O que mudar.** O rótulo não pode depender de `index`. Duas saídas, à escolha do corretor:

1. A da `REC-5`: campo próprio na `WeekRow` (por exemplo `partialLabel`, com `formatInt(closings)` na semana parcial e `null` nas demais) e `<LabelList dataKey="partialLabel" …>`; o `content` desenha quando `value` vem preenchido e usa o `x`, o `y` e a `width` do próprio retângulo.
2. Camada própria, como a `MissingWeekMarks` já faz: `xScale(week, { position: 'middle' })` e `yScale(closings)` menos `VALUE_LABEL_GAP`, para a linha com `partial`.

**Teste de aceite.** Com a lacuna de 2026-07-27 mantida no `data.ts`: os dois previews voltam a ter o `<text>` `3` em peso 700 acima da coluna vazada (x perto de 542,4; y perto de 168,2), e ele é o único elemento em 700 do corpo (`TIP-3`).

**Na mesma passada, sem peso de bloqueio.** O item 1 da Anatomia do README ainda diz "a coluna pintar primeiro e a linha por cima", o contrário do item 3 para a `v2` e a `v4`. O ponto isolado da linha nasce no `zIndex` 250 e fica atrás da coluna quando ela passa do valor. As demais observações estão no README.

**O que não mudar.** `buildCalendar`, `mondayOf` e a média sobre o calendário; a lacuna de 2026-07-27 no `data.ts`; a marca `sem dado` e a dica com `formatUnavailable()`; a linha por trás das colunas, sem revestimento; a coluna vazada tracejada e a nota `parcial até`; o tique por mês; o domínio de 0 a 20; a frase acessível de 200 caracteres.

### Registro no formato do checklist

```
Versão: 08_combinados-e-eixo-duplo/01_coluna-com-linha/v2_fechamentos-com-media-movel
Data: 2026-10-02
Resultado: reprovada
Não: nenhum das 32 por si; bloqueante de catálogo (item 4 de "o que demonstra"), a mais próxima é a 18
Correções:
  Catálogo e REC-5 (DIC-1 por consequência): tirar o rótulo da semana parcial da dependência de index, por dataKey próprio ou camada própria, para o 3 em peso 700 voltar ao desenho com a lacuna presente.
Não se aplica: 6, 13, 26, 27, 28, 29, 30
```

## v4_meta-ausente-e-estorno: aprovada, sem bloqueante

O corretor conferiu só nos PNGs; as medidas abaixo são do `preview.svg` (px a 1x, linha de 2,25 px, pintada antes das colunas) e de uma coluna de pixels em cada PNG (2x), nos dois temas.

| Mês | Receita contra meta | Topo da coluna (y) | Faixa da linha (y) | O que o desenho mostra |
|---|---|---|---|---|
| `jan/26` | R$ 412,3 mil contra R$ 450 mil | 59,64 | 49,75 a 52,00 | linha solta 7,6 px acima do topo |
| `fev/26` | R$ 468,9 mil contra R$ 450 mil | 46,48 | 49,75 a 52,00 | coluna cobre a linha, sem fio solto |
| `jun/26` | R$ 455,8 mil contra R$ 460 mil | 49,53 | 47,43 a 49,68 | linha pousada no topo, na metade direita: lê abaixo |
| `set/26` | R$ 503,1 mil contra R$ 480 mil | 38,53 | 42,78 a 45,03 | coluna cobre a linha, sem tampa solta |
| `nov/26` | R$ 486,4 mil contra R$ 480 mil | 42,41 | 42,78 a 45,03 | topo 0,36 px acima da borda de cima da linha; coluna cobre a linha |

No PNG, x=1073 (centro de `nov/26`): a coluna começa na linha 368 e segue inteira, sem pixel de linha nem da cor do cartão por dentro; fora dela, em x=1052, a linha ocupa as linhas 369 a 373. Em `jun/26`, x=680: linha de 378 a 382 e coluna a partir de 383, sem vão. O teste de aceite da primeira passada fecha nos quatro meses, nos dois temas.

Também conferido: o tique `−R$ 200 mil` em um `tspan` só, âncora em x=68, com `Y_AXIS_WIDTH = 82`; cinco tiques de −R$ 200 mil a R$ 600 mil com o zero entre eles; a coluna de `ago/26` desce do zero (y de 155,5 a 197,95) em `--negative`; a `ReferenceLine` do zero em `--line-strong`; `sem meta` em x=242,67 e y=29,67, a 8 px do topo de `mai/26`, sem cruzar marca; frase acessível de 211 caracteres; `meta.json` com 82 px e `−R$ 200 mil`. As observações estão no README.

```
Versão: 08_combinados-e-eixo-duplo/01_coluna-com-linha/v4_meta-ausente-e-estorno
Data: 2026-10-02
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 26, 27, 28, 29, 30
```

## Para quem cuida da régua

- Nenhuma guarda acusa rótulo declarado no código que o preview não desenha: `content` de `LabelList` que devolve `null` por índice deslocado (`REC-5`) passa em silêncio, e foi o que reprovou a `v2` nesta passada.
- O `check` continua sem comparar o `demonstrates` do `meta.json` e as afirmações do README com o `o_que_demonstra` do catálogo.
