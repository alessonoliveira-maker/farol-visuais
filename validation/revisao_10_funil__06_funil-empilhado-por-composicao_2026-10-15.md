# Parecer de revisão: 10_funil/06_funil-empilhado-por-composicao

Data: 2026-10-15. Revisor independente. Segunda passada depois da segunda rodada de correção, autorizada
pelo dono em 2026-10-15. As duas versões estavam em `revisao_desatualizada` e foram julgadas pelo arquivo de
hoje (`Chart.tsx` das duas às 10:10, previews às 10:12), não pela nota de 2026-10-14. O parecer anterior,
com o histórico dos bloqueantes, está em `revisao_10_funil__06_funil-empilhado-por-composicao_2026-10-14.md`.

`npm run check -- 10_funil/06_funil-empilhado-por-composicao`, com tipos: 0 com erro, 1 aviso
(`CONTRASTE-MARCA` da `v4`, o `--line-strong` como preenchimento, pendência conhecida), 0 escapes. Render
refeito das duas versões: previews idênticos byte a byte aos do corretor, diferença entre preview e página
de 0,02% na `v2` e de 0,00% e 0,01% na `v4`. Os `data.ts` estão iguais aos do git.

| Versão | Resultado | Não |
|---|---|---|
| `v2_mix-em-100-com-indicacao-em-destaque` | aprovada | nenhum |
| `v4_sem-origem-cai-ao-longo-do-funil` | reprovada | 15 |

## Como a bancada foi feita

O dado padrão não alcança o ramo que esta rodada mexeu, então ele foi exercitado em cópia. As duas versões
foram copiadas para `_render/exemplos/10_funil/99_bancada-revisor/`, só o `data.ts` da cópia foi alterado,
o render rodou nos dois temas e o `check` rodou sem tipos; a cópia e os PNGs dela foram apagados em
seguida. Nenhum arquivo do modelo foi tocado. Coordenadas abaixo em px do `preview.svg` (1x).

| Caso | `v2` | `v4` |
|---|---|---|
| Ganho zerado (as sete contagens em 0) | ok, com observação | **COLISAO-TEXTO reprova** |
| Ganho sem lacuna (`noOrigin` 1 para 0) | ok | ok |
| Sem lacuna em todas as etapas | ok | não rodado |
| Funil todo zerado | observação | observação |

## v2_mix-em-100-com-indicacao-em-destaque: aprovada

```
Versão: 10_funil/06_funil-empilhado-por-composicao/v2_mix-em-100-com-indicacao-em-destaque
Data: 2026-10-15
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 13, 26, 28, 29, 31, 32
```

O bloqueante de 2026-10-14 (perguntas 8 e 27, `REC-11`) está resolvido. A `Bar` da lacuna declara `shape`
com `Rectangle`, que não desenha nada com largura zero, e o `LabelList` recebe toda etapa.

* Ganho sem lacuna: "16 leads" e os sete percentuais 44, 13, 19, 12, 6, 6 e 0, somando 100 pelo maior resto.
* Sem lacuna em todas as etapas: os cinco totais, as 35 colunas e o cabeçalho de amostras saem, com 0% na
  coluna da lacuna.
* Ganho zerado: "0 leads" e "sem lead nesta etapa", sem barra; a linha de leitura diz "evolui para
  indisponível nos ganhos".
* Dado padrão: 35 percentuais pelo maior resto (Lead 6, 38, 11, 7, 7, 3, 28 conferido à mão), cor por
  chave nos slots 1, 3, 6, 5, 2, 4, opacidade de 0,72 acima de 3:1 nos dois temas, frase de 214 caracteres.

As observações (âncora no 0% da etapa vazia, funil todo zerado fora do estado vazio) estão no README.

## v4_sem-origem-cai-ao-longo-do-funil: reprovada

```
Versão: 10_funil/06_funil-empilhado-por-composicao/v4_sem-origem-cai-ao-longo-do-funil
Data: 2026-10-15
Resultado: reprovada
Não: 15
Correções:
  15. ROT-9: na etapa sem lead, a ponta não escreve a segunda linha e o tique cabe na coluna do eixo.
Não se aplica: 13, 26, 28, 29, 30, 31, 32
```

**O que a correção resolveu, conferido.** O `REC-11` do bloqueante de 2026-10-14 saiu: com o Ganho sem
lacuna, a ponta escreve "16 leads" e "0% sem origem", o tique "100% com origem" e a linha de leitura "sobe
de 72% para 100%". Com o Ganho zerado, "0 leads" sai na ponta (zero medido, EST-3). O dado padrão segue
certo nos dois temas: cinco pares de cobertura e lacuna somando 100, "1.240 leads" na ponta, frase de 179
caracteres com a direção calculada.

### Bloqueante. Pergunta 15; ROT-9; seção 14.1 (sobreposição de texto)

**Evidência, bancada com o Ganho zerado, nos dois temas.** O tique do eixo escreve em duas linhas, "Ganho"
e "sem lead nesta etapa"; a segunda começa em x 0 com centro em y 192,7 e a tinta mede uns 110 px, numa
coluna que termina em x 102 (`MARGIN.left` 2 mais `STAGE_AXIS_WIDTH` 100). A ponta da barra de largura zero
fica em x 110 (`VALUE_LABEL_GAP` 8), e a segunda linha dela, "indisponível", tem centro em y 189,5: 3,2 px
de diferença, a mesma linha. A guarda `COLISAO-TEXTO` mede **0,14 px** entre as duas tintas e reprova a
cópia. No PNG o par lê "sem lead nesta etapa indisponível", uma frase só, com a mesma ausência escrita duas
vezes.

**Por que bloqueia.** A ROT-9 diz que dois textos na mesma linha sem respiro "não é feiura de acabamento" e
vale para tique de eixo; a guarda que a mede reprova. O ramo é exatamente o que esta rodada corrigiu, e o
README diz que ele foi conferido no PNG com o Ganho zerado. Mês sem ganho é o recorte comum de um funil
parcial, não um caso de laboratório.

**O que mudar.**

1. Na etapa sem lead (`gapPercentOf(row) === null`), `renderTail` escreve só "0 leads" e não desenha a
   segunda linha: a ausência já está no tique da esquerda, como o parecer de 2026-10-14 permitia ("a
   segunda linha pode sair").
2. O tique cabe na coluna do eixo: `STAGE_AXIS_WIDTH` que acomode "sem lead nesta etapa" com respiro, ou
   texto mais curto ("sem lead"), para a tinta não entrar na área do gráfico.
3. Conferir com render de bancada no Ganho zerado e no Ganho sem lacuna, sem gravar o `data.ts`, e rodar o
   `check` na cópia: a `COLISAO-TEXTO` tem de sair limpa, não só o PNG parecer bom.

## Ferramenta

* `OPACIDADE-MARCA` segue dizendo `sem_opacidade_em_marca` na `v2`, que tem `fillOpacity` de 0,72 por
  expressão condicional; a medida de 2026-10-14 foi à mão e o código não mudou nesse ponto.
* Não há render de bancada na ferramenta: o ramo fora do dado padrão só se julga copiando a versão para
  `_render/exemplos/`, e o corretor conferiu só pelo olho, sem o `check` na cópia, que teria pegado a colisão.
