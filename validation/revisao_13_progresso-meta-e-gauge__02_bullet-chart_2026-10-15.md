# Parecer de revisão: 13_progresso-meta-e-gauge/02_bullet-chart

Data: 2026-10-15. Revisor independente. Julgadas `v3_painel-de-metas-comerciais` e
`v4_orcamento-por-plataforma-em-coluna`, as duas com motivo `revisao_desatualizada` depois da correção
do mesmo dia (na `v4`, `percent` passou a `number | null` e a plataforma sem veiculação ganhou
`formatUnavailable()` com `Unplug` sobre a base da banda; nas duas, estado vazio com `role="status"` e
`Filter`). PNGs de 2026-10-15 10:27, na mesma hora dos `Chart.tsx`. `npm run check` com tipos: 0 com
erro, 3 avisos, todos na `v4` (FRASE-ACESSIVEL com 245 caracteres, COLISAO-TEXTO de 3,67 px entre
"+3 pp de 105%" e "R$ 33,6 mil", AGREGACAO-ZERO em `Chart.tsx:129`), 0 escapes.

Resultado: `v3` aprovada; `v4` reprovada por dois bloqueantes. As observações não bloqueantes das duas
estão no README do modelo, seção `Observações da revisão (não bloqueantes)`, parágrafo de 2026-10-15.

| Versão | Resultado | Não |
|---|---|---|
| `v3_painel-de-metas-comerciais` | aprovada | nenhum bloqueante (a 13 segue como observação, ANO-2 e ANO-3) |
| `v4_orcamento-por-plataforma-em-coluna` | reprovada | 8 e 12 (B1); seção 14.1, versão contra catálogo (B2) |

## O que foi medido e como

* **Bancada** em `_render/exemplos/13_progresso-meta-e-gauge/99_bancada-revisor/`, apagada depois, com
  o `Chart.tsx` de hoje copiado sem mudança e cinco dados: a plataforma sem veiculação no meio da lista
  (Social, Display, Busca, Profissional); `platforms: []` na `v4`; `metrics: []` na `v3`; Busca com
  gasto 0; e todas as plataformas sem veiculação. Render nos dois temas, 0 com erro.
* **Vazio (EST-1):** nas duas versões o bloco substitui o gráfico inteiro, sem eixo nem grade, com
  `Filter` de 16 px e frase de 12 px em `--text-muted`, centrado e legível nos dois temas. O render
  avisa que a raiz do vazio não tem `aria-label`; é o `role="status"` que a EST-1 pede, com o texto
  visível como conteúdo, e não reprova.
* **Gasto zero (EST-3):** "R$ 0" sai escrito na base da banda, distinto do "indisponível" da Display. O
  ramo `pxPerUnit = 0` da linha 129 não chega à tela: o rótulo cai em `base − 8`, o mesmo lugar do
  ramo natural.
* **Recharts conferido no pacote** (`recharts 3.10.1`, `lib/cartesian/Bar.js`): o item cujo valor é
  `null` volta nulo e a lista de retângulos é compactada por `.filter(Boolean)` (linha 696); o
  `BarLabelListProvider` (linhas 157 a 180) monta o `LabelList` sobre essa lista compactada, e o
  `index` que chega ao `content` é a posição nela (`component/LabelList.js`, linha 117).

## `v4_orcamento-por-plataforma-em-coluna`: os bloqueantes

### B1. Perguntas 8 e 12; EST-2, ROT-2, seção 14.1 (identificação das marcas); armadilha REC-5

**O que o desenho faz.** `renderValue` (`Chart.tsx:124` a `126`) acha a linha do rótulo por
`rows[index]`. O `index` que o `LabelList` entrega conta os retângulos desenhados, não as linhas do
array. Desde a correção, a plataforma sem veiculação tem `percent: null`, o Recharts não cria
retângulo para ela, e todo índice depois dela anda uma casa. No dado padrão a Display é a última da
lista e nada aparece; em qualquer outra posição o rótulo de uma plataforma vai para a coluna de outra.

**Evidência** (bancada, ordem Social, Display, Busca, Profissional, nos dois temas): a coluna de Busca
(96% do planejado, `rect x=324,55`) sai sem rótulo; a coluna de Profissional (79%, `rect` de `x=432,05`
a `456,05`) sai com "R$ 33,6 mil", que é o gasto de Busca, centrado em `x=444,05`; o gasto real de
Profissional, R$ 14,2 mil, não aparece em lugar nenhum. A conta de `metaPixelY` (linhas 129 a 133)
também passa a misturar o percentual de Busca com a altura da coluna de Profissional.

**Por que bloqueia.** É número errado escrito sobre a marca de outra categoria, num ramo que a própria
correção abriu: antes o `percent` nunca era nulo e todo retângulo existia. A ordem das plataformas
vem do dado da página, e nada no tipo prende a plataforma ausente no fim da lista.

**O que mudar.** A saída da REC-5: dar ao `LabelList` um `dataKey` que identifique a linha (`id`, por
exemplo) e, no `content`, achar a linha pelo `value` recebido, que o Recharts lê do `payload` do
próprio retângulo; ou desenhar o rótulo dentro do `shape` da coluna, que já recebe o `payload`.
Conferir em bancada com a plataforma ausente no começo e no meio da lista, nos dois temas.

### B2. Seção 14.1 (versão que não demonstra o que o catálogo diz); armadilha DAD-10

**O que está escrito.** O item 3 de `demonstrates` no `meta.json` segue dizendo "Plataforma sem
veiculação com trilho tracejado e formatUnavailable, nunca 0% pintado", que é também o texto do
catálogo (`_estudo/catalogo/13_progresso-meta-e-gauge.json`, linha 148).

**Evidência.** Desde 2026-10-15 a versão não desenha trilho nenhum: nos dois PNGs a Display tem só o
ícone `Unplug` e "indisponível" sobre a base da banda. O cartão da galeria promete uma peça que o
desenho não tem.

**O que mudar.** Reescrever o item com o que está na tela (sem coluna, `formatUnavailable()` com
`Unplug`, nunca 0% pintado) e declarar em `notes` o desvio do catálogo e o motivo (o trilho de altura
cheia lia como a peça mais alta do gráfico; correção pedida pelo dono em 2026-10-15), como fez
`10_funil/06_funil-empilhado-por-composicao` `v4` com a hachura.

### No mesmo código, sem bloquear (detalhe no README)

* Com todas as plataformas sem veiculação (bancada), a faixa de conforto, a linha "meta 100%" e os dois
  rótulos somem; com `ifOverflow="extendDomain"` na `ReferenceArea` e na `ReferenceLine` (ANO-3),
  conferido em bancada, as duas voltam. É uma prop em dois lugares, perto de onde o B1 mexe.
* Planejado zero faz `spent / planned` virar `Infinity`, e o domínio vai junto; `percent` nulo também
  quando `planned <= 0` fecha o ramo pelo mesmo tipo que a correção criou.

## `v3_painel-de-metas-comerciais`: por que aprova

A única mudança do dia é o estado vazio, e ele cumpre a EST-1 na bancada. A guarda testa
`data.metrics`, a mesma lista que alimenta `rows` e o domínio (DAD-6); `Math.max(130, ...)` nunca
recebe lista vazia, e nenhuma agregação devolve zero (EST-1b). O tipo não tem campo de ausência, então
a EST-2 não se exercita. O resto do arquivo é o mesmo das duas leituras anteriores, e os pontos que
continuam de pé (linha de 100% sem rótulo, escala sem número, taxa sem volume, meta zero) estão no
README como observação: nenhum faz o desenho afirmar algo falso.

## Registro

```
Versão: 13_progresso-meta-e-gauge/02_bullet-chart/v4_orcamento-por-plataforma-em-coluna
Data: 2026-10-15
Resultado: reprovada
Não: 8, 12; mais o item de catálogo da seção 14.1
Correções:
  8 e 12. EST-2, ROT-2 (REC-5): achar a linha do rótulo pelo id da plataforma, nunca pelo índice do LabelList.
  14.1. DAD-10: reescrever o item 3 de demonstrates e declarar em notes o desvio do catálogo.
Não se aplica: 6, 18, 26, 27, 28, 29, 30
```

```
Versão: 13_progresso-meta-e-gauge/02_bullet-chart/v3_painel-de-metas-comerciais
Data: 2026-10-15
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 18, 26, 27, 28, 29, 30
```
