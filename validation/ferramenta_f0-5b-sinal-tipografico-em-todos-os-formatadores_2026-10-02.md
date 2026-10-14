# F0.5b Sinal tipográfico em todos os formatadores

Data: 2026-10-02. Item do lote livre da Fase 0 do `PLAN.md`. Sem commit e sem render do acervo.

## O que mudou
1. **`app/src/lib/format.ts`**: a troca do hífen pelo U+2212 saiu de `formatDecimal` e foi para um ponto
   só, `formatNumber` (`:50` a `:52`), o único que chama o `Intl` para número. Passam por ele `formatInt`
   (`:60`), `formatDecimal` (`:65`), `formatCurrency` (`:70`) e `formatPercent` (`:113`); os demais herdam.
   A moeda compacta (`:90`) e a de eixo (`:108`) montam o texto sobre o valor absoluto, com o sinal de
   `signOf` (`:55`) antes do `R$`. Cabeçalho do arquivo reescrito (`:11` a `:15`).
2. **`app/src/lib/format.test.ts`**: 27 testes novos (`:159` a `:350`) e 1 reescrito (`:142`).
3. **`CONTRATO.md` seção 8, linhas 280 a 284**: emenda de 2026-10-02 junto da de 2026-10-01, sem peso novo e sem guarda.

## Antes e depois, por formatador
| Formatador | Antes | Depois | Mudou |
|---|---|---|---|
| `formatInt(-20)` | `-20` | `−20` | glifo |
| `formatDecimal(-3.5)` e `formatHours(-1.5)` | `−3,5` e `−1,5 h` | iguais | nada (já eram do F0.5) |
| `formatCurrency(-340)` | `-R$ 340,00` | `−R$ 340,00` | glifo |
| `formatCurrencyCompact(-340)` e `formatCurrencyAxis(-340)` | `-R$ 340` | `−R$ 340` | glifo |
| `formatCurrencyCompact(-1200)` | `R$ −1,2 mil` | `−R$ 1,2 mil` | **posição** |
| `formatCurrencyAxis(-50000)` | `R$ −50 mil` | `−R$ 50 mil` | **posição** |
| `formatPercent(-0.092)`, e os dois nomes da escala de 0 a 100 herdam | `-9,2%` | `−9,2%` | glifo |
| `formatDays(-3)` e `formatFileSize(-8)` | `-3 dias` e `-8 B` | `−3 dias` e `−8 B` | glifo |
| `formatRateWithVolume(-7, 28)` | `-25,0% (-7 de 28)` | `−25,0% (−7 de 28)` | glifo |

A posição mudou só na moeda compacta e na de eixo a partir do milhar; positivo e zero saem iguais em todos.
`formatDate`, `formatMonthShort`, `formatMonthLong` e `formatUnavailable` não têm número com sinal: só prova que passa.

## Busca por dependência do hífen em `app/src` (aceite d), feita antes de mudar
Nenhuma: nenhum `parse`, `replace`, `startsWith`, `split` nem comparação de texto sobre saída de formatador,
e nenhum teste esperava hífen em texto formatado. **Nenhum teste alterado fora de `format.test.ts`.** Visto:
- `lib/csv.ts:59` e `:60`, `share/shareLink.ts:104` e `:109`, `lib/markdown.tsx:55`: hífen de arquivo, base64 e lista.
- `ScenariosPage.tsx:65`, `CargaExecutivo.tsx:311`, `PlacarKpis.tsx:42`, `ReceitaKpi.tsx:108`: sinal à mão
  com U+2212 sobre `Math.abs`; não leem o sinal do formatador e saem iguais.
- `platform/chat/canvasData.ts:122`, `:185` a `:187`, `:206` a `:208`: o canvas guarda texto formatado, e
  `ChatCanvas.tsx:61` a `:67` o exporta em CSV. Não é dependência de código e esses valores não são
  negativos; fica o registro de que um negativo ali iria ao CSV como texto com U+2212.

## Medições
| Medida | Antes | Depois |
|---|---|---|
| `npm run test` do app | 59 arquivos, 1028 testes, verde | 59 arquivos, 1055 testes, verde |
| `typecheck` do app; `eslint` e `prettier` nos dois tocados | não medido | limpo |
| `selftest` do catálogo | 511 provas, verde | 511 provas, verde |
| `check -- . --sem-tipos` (com tipos, depois: igual) | 0 erros, 1371 avisos, 982 de biblioteca | os mesmos, versão por versão |

## Provas
- **Contrafactual medido:** os testes novos rodaram antes contra o corpo antigo: 11 falharam (as dez provas
  que acusam dos formatadores com hífen, mais a de posição na moeda) e 34 passaram.
- **Acusa e passa por formatador:** `sinal de negativo em <nome>`, 12 pares. **Posição:** `o sinal vem antes
  do símbolo na forma inteira e na compacta` (acusa) e `a moeda positiva começa pelo símbolo` (passa).
- **Reescrita:** `quem monta o texto em cima do decimal herda o sinal` fixava `R$ −1,2 mi` e `R$ −50 mil`,
  o defeito consertado; ficou só com `formatHours`. **Dossiê** de `16/05`: 114,5 KB, o texto novo chegou.

## O que ficou de fora, para o dono
1. **Réguas fora da seção 8 que ficaram velhas:** `NUM-3` (`CONTRATO.md:676`, "devolve hífen"; a seção 8
   avisa), `ARMADILHAS.md:139` (`R$ −50 mil`) e `CONTRATO.md:564` a `:570` (larguras de `R$ -200 mil`).
2. **Zero negativo segue como o `Intl` devolve:** `formatInt(-0.4)` é `−0`. Nenhuma prova fixa esse texto.
3. **Largura:** o U+2212 é mais largo que o hífen; tique negativo pode pedir mais eixo. Não medi: é do F0.2c.
