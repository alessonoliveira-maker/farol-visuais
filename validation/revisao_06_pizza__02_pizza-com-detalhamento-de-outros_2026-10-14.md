# Parecer de revisão: 06_pizza/02_pizza-com-detalhamento-de-outros

Data: 2026-10-14. Revisor independente, primeira passada das três versões em `sem_revisao` (a `v1` já estava aprovada desde 2026-09-19 e não entrou nesta rodada). Julgadas pelos arquivos de hoje e pelos PNGs de 2026-10-02, posteriores ao último `Chart.tsx` (2026-09-29). `npm run check` com tipos: 0 com erro, 7 avisos, todos da `v1` e todos já em fila de dívida; `v2`, `v3` e `v4` saem `ok`.

Resultado: duas aprovadas e uma reprovada. A `v3` cai por um defeito só, de papel de cor: a atribuição de slots pula o `--chart-1` sem destaque que o reserve e, no nível de cima, pinta uma composição de 4 motivos com `--chart-2`, o que a COR-8 existe para impedir. A `v2` e a `v4` passam nas 32 perguntas. As observações não bloqueantes das três estão no README do modelo, seção `Observações da revisão (não bloqueantes)`, parágrafo de 2026-10-14.

| Versão | Resultado | Não |
|---|---|---|
| `v2_parceiro-cresceu-dentro-de-outros` | aprovada | nenhum |
| `v3_motivos-de-perda-com-drilldown` | reprovada | 11 |
| `v4_cauda-de-23-categorias` | aprovada | nenhum |

Não se aplica: 3, 7, 18, 25, 26, 29 e 30 nas três; 4, 13, 28, 31 e 32 na `v3`, que não tem barra nem conector.

## O que foi conferido à mão

* **Percentual pelo maior resto, refeito do `data.ts`:** `v2` 37, 25, 14, 12 e 12 sobre 385 leads; `v3` 38, 23, 18, 12 e 9 sobre 226 perdas no nível de cima e 48, 32 e 20 sobre 86 no nível de Preço; `v4` 32, 24, 18, 14 e 12 sobre 839 leads. Todos somam 100.
* **Fechamento do painel:** `v2` 18 + 13 + 9 + 6 = 46; `v4` 65 nas 10 barras mais 34 na linha do resto = 99, com a maior escondida em 4 leads.
* **Conectores (ROT-11):** na `v2` e na `v4`, as bordas de "Outros" ficam em +180f e −180f graus, e a direção de cada reta faz menos de 90 graus com a normal de fora do disco no ponto de saída (cerca de 50 graus na `v4`), então nenhuma das duas reentra no disco nem cruza outra fatia. As pontas param 8 px antes do texto do painel e abraçam o painel inteiro, do cabeçalho à última linha.
* **Slots de cor contra `chartTheme.ts`** (índice 0 é `--chart-1`): `v2` 2, 5, 4, 1 na pizza e `--chart-1` no destaque; `v3` 2, 5, 4, 1 no nível de cima e 2, 5, 4 nos dois níveis filhos; `v4` 0, 2, 5, 4.
* **Não renderizado:** o nível de cima da `v3` (o preview abre em Preço) e os estados vazio e indisponível das três. O que se diz deles é leitura do código.

## `v3_motivos-de-perda-com-drilldown`: reprovada

### Bloqueante único. Pergunta 11, regra COR-8 (papel de cor, que a 14.1 manda bloquear sempre)

**O que está no código.** O `data.ts` atribui os slots `2, 5, 4, 1` aos quatro motivos coloridos (Preço, Sem decisor no processo, Timing da decisão, Concorrente escolhido) e `2, 5, 4` aos submotivos de Preço e de Outros. Pelo `CHART_SERIES_COLORS`, isso é `--chart-3`, `--chart-6`, `--chart-5` e `--chart-2` no nível de cima, e `--chart-3`, `--chart-6` e `--chart-5` nos níveis filhos. A COR-8 manda `1, 3, 6, 5` para quatro categorias e `1, 3, 6` para três.

**Por que reprova.** A COR-8 põe `--chart-2` e `--chart-4` no fim da ordem porque `--chart-2` repete o hex de `--warning` e de `--prov-premissa`, "assim uma composição de até 4 categorias nunca parece 'boa' ou 'medida' ao lado do selo do `VisualCard`". O nível de cima é exatamente uma composição de 4 categorias coloridas, e "Concorrente escolhido" (26 perdas, 12%) sai na cor do selo de premissa. Não há destaque nesta versão que justifique reservar o `--chart-1`: o pulo foi correto na `v2`, onde o slot 1 acende Parceiro, e parece ter vindo dela junto com o comentário do `data.ts` ("na ordem da COR-8"), sem o motivo. A `v1` e a `v4` do mesmo modelo usam `0, 2, 5, 4`.

**O que o preview mostra.** O PNG fotografa só o nível filho, em `--chart-3`, `--chart-6` e `--chart-5`, onde a troca de ordem não tem consequência à vista. O nível de cima, com o `--chart-2`, é o estado que a trilha "Todos" abre com um clique e o que a página do Farol mostra se não passar `focusId`.

**O que mudar, só no `data.ts`:**

* motivos: `preco` slot 0, `sem-decisor` slot 2, `timing` slot 5, `concorrente` slot 4;
* submotivos de Preço e de Outros: slots 0, 2 e 5, na ordem em que estão.

Com isso o nível de cima fica em `1, 3, 6, 5` e os filhos em `1, 3, 6`. Na volta da pizza do nível de cima, `--chart-1` (Preço) encosta em `--chart-3` e no neutro de Outros, e `--chart-5` (Concorrente) encosta em `--chart-6` e no neutro, então o par mais fraco da COR-8 (1 e 5) não fica lado a lado. O texto vazado sobre `--chart-1` já passa a `TEXTO-NA-MARCA` na `v4`. Depois da troca: `npm run render -- 06_pizza/02_pizza-com-detalhamento-de-outros --tema ambos`, `npm run check` e conferir que o 38% da trilha não mudou (a cor não entra na conta).

**Fora do bloqueante, para não perder na mesma rodada:** a observação antiga do README sobre "Acima do orçamento" repetir a cor de Preço continua valendo depois da troca (os dois passam a `--chart-1`); não reprova, porque os níveis nunca dividem a tela e a trilha declara o nível.
