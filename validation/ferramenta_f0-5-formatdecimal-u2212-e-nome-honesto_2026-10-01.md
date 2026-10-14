# F0.5 `formatDecimal` com U+2212 e `formatPercentPoints` com nome honesto

Data: 2026-10-01. Item da Fase 0 do `PLAN.md`. Sem commit e sem render.

## O que mudou

1. **`formatDecimal` devolve U+2212 em negativo** (`app/src/lib/format.ts:23` e `:53` a `:58`). O `Intl`
   do pt-BR devolve U+002D (Node 24.15, ICU 78.2); a troca é `.replace(/^-/, MINUS)`. Herdam dele
   `formatCurrencyCompact` e `formatCurrencyAxis` a partir do milhar, e `formatHours`.
2. **Nome honesto `formatPercentFromScale100`** (`format.ts:116` a `:119`). `formatPercentPoints` segue
   exportada, com o corpo intacto e a marca `@deprecated` (`:121` a `:124`). Nenhuma chamada mudou.
3. **Testes no app** (`app/src/lib/format.test.ts:117` a `:172`): cinco testes novos em dois blocos.
4. **`CONTRATO.md` seção 8, linhas 279 a 283**: o que cada formatador devolve em negativo, o aviso de
   que `formatPercentPoints` escreve percentual, e o estado do nome novo. Sem peso novo e sem guarda.

## Medições

| Medida | Antes | Depois |
|---|---|---|
| `npm run test` do app | 59 arquivos, 1023 testes, verde | 59 arquivos, 1028 testes, verde |
| `typecheck` do app; `eslint` e `prettier` nos tocados e nos três chamadores | não medido | limpo |
| `selftest` do catálogo | 511 provas, verde | 511 provas, verde |
| `check -- . --sem-tipos` | 0 erros, 389 avisos | 0 erros, 1371 avisos |
| `check -- .` com tipos | não medido | 0 erros, 1371 avisos, nenhum erro de tipo |
| `pendencias` | 308 prontas | 308 prontas |

**O número pedido pelo aceite: 982 previews, nas 491 versões, com `preview desatualizado
(biblioteca)`.** O delta de avisos é exatamente 982, e os outros 389 são os mesmos, versão por versão. É
o acervo inteiro porque o carimbo é um hash só: diz que a biblioteca mudou, não que o desenho mudou.

**Quem deve desenhar diferente, por leitura estática (não renderizei):** 10 versões têm hoje hífen
antes de dígito no texto do `preview.svg`: `03/05` v1, v3 e v4; `05/07` v1; `08/01` v4; `08/06` v1 a
v4; `15/08` v1. Parte é `formatInt` (`-20`), que não mudou; `R$ -50 mil` e `-0,57` vêm do que mudou.
296 das 491 versões citam ao menos um formatador alcançado.

**Chamadas de `formatPercentPoints`: 15 versões hoje, não 13** (o 13 é de 2026-09-29). Todas compilam
no `check` com tipos. `08/05` v4 troca o hífen com `.replace('-', MINUS)`: ficou sem efeito, não quebra.

## Provas

- **Acusa:** `o negativo sai com o menos tipográfico, e nenhum hífen sobra`. Com o corpo antigo a saída
  é `-3,5` em U+002D (medido direto no `Intl`, sem reverter o arquivo), e o teste falharia.
- **Passa:** `positivo e zero saem sem sinal nenhum, como antes`.
- **Os dois nomes:** `o nome antigo continua valendo e devolve o mesmo texto`.
- Nenhuma prova nova no `selftest.mjs`: ele está fora do escopo do item, e o aceite pede teste no app.
- **Dossiê** de `16_distribuicao/05_histograma-comparativo`: 112,8 KB; o texto novo chegou (seção 8 e
  tabela de formatadores, por `Grep`). O item acrescenta cerca de 2,5 KB ao dossiê do produtor.

## O que ficou de fora, para o dono

1. **O nome novo não pode ser importado pelo catálogo.** `ALLOWED_CHART_IMPORTS` (`contract.mjs:43`), a
   tabela da seção 6 do contrato e `FORMATADORES_DE_GRANDEZA` (`formato.mjs:66`) não o conhecem, e os
   três estão fora do escopo. A seção 8 diz isso; a frase sai quando a lista for emendada.
2. **Textos fora do escopo que citam o estado antigo:** `dossie.mjs:2529` a `:2536` (fixa "13 chamam o
   formatador" e não cita o nome novo) e a `DAD-4` do `ARMADILHAS.md`.
3. **`formatInt`, `formatPercent` e `formatCurrency` seguem com hífen**, e a moeda compacta fica mista:
   `-R$ 340` abaixo do milhar, `R$ −1,2 mil` acima. O item nomeia só `formatDecimal`.
4. **Zero negativo:** `formatDecimal(-0.04)` devolvia `-0,0` e agora devolve `−0,0`. Só o glifo mudou.
5. **O nome `formatPercentFromScale100` é escolha minha**, ainda sem chamada: trocar agora não custa.
6. **Os 982 previews avisados** ficam como estão: renderizar ou não é decisão do dono.
