# F0.5c `formatPercentFromScale100` liberado no catálogo, e a régua que citava o sinal antigo

Data: 2026-10-02. Item do lote livre da Fase 0 do `PLAN.md`. Sem commit, sem render do acervo, sem tocar em `app/`.

## O que mudou
1. **Lista de imports** (`_render/scripts/lib/contract.mjs:50` a `:52`): o nome novo entrou; o antigo fica.
2. **Guarda `FORMATO-ACESSIVEL`** (`lib/formato.mjs:73`, `:79` a `:91`, `:109` a `:124`, `:215` a `:222`): conhece o
   nome novo e compara pelo nome canônico; sem isso, um nome na frase e o outro no corpo seria acusado à toa.
3. **Dossiê** (`lib/dossie.mjs:1467` a `:1500` e `:2535` a `:2555`): quem escreve `p.p.` e quem importa cada nome
   saem da varredura dos `Chart.tsx`; o nome novo só é citado se `format.ts` o exporta.
4. **`CONTRATO.md`**: seção 6 (`:209`); seção 8 (`:279`, sem a frase provisória e com o peso declarado, não
   bloqueia; `:283`); `EIX-6` (`:564` a `:571`, `:574` a `:577`, emenda nova em `:587` a `:623`); `NUM-3` (`:720`).
5. **`ARMADILHAS.md`**: `REC-2` (`:139`, emenda em `:147` a `:154`); `DAD-4` (`:1137` a `:1141`).

## Medições
| Medida | Antes | Depois |
|---|---|---|
| `selftest` | 511 provas, verde | 521 provas, verde |
| `check -- . --sem-tipos` | 0 erros, 1371 avisos, 982 de biblioteca | os mesmos, versão por versão (0 diferenças) |
| `check -- .` com tipos | não medido neste item | 0 com erro, 1371 avisos, 0 escapes |
| Dossiê de `16/05`, produtor | 114,5 KB (nota do F0.5b) | 115,3 KB; texto novo nas linhas 319, 385, 389 e 661 |
| `Chart.tsx` alterados; contagens do dossiê | | nenhum; 17 escrevem `p.p.`, 15 importam o nome antigo, 0 o novo |

## Larguras medidas de novo (bancada em `_render/.tmp/`, fora do acervo, apagada no fim)
`npm run render`, tique padrão do Recharts (`AXIS_PROPS`, `tickMargin` de 8), eixo de 46 a 90 px de 1 em 1.

| Tique | Tinta em Manrope, por glifo (navegador) | Menor eixo em uma linha |
|---|---|---|
| `R$ 60 mil` | 46,20 (45,83) | 62 |
| `R$ 700 mil` | 51,39 (51,23) | 70 |
| `−R$ 50 mil`, e também `−R$ 75 mil`, `−R$ 0,2 mi`, `−R$ 1,5 mi` | 51,72 (51,30) no primeiro | 72 |
| `−R$ 200 mil`, e também `100`, `150`, `300` e `750 mil` | 58,43 (57,92) no primeiro | 81 |
| `R$ -200 mil`, o texto antigo | 57,15 (56,59) | 76 |

- **O `+18` da `EIX-6` não é constante:** 15,8 px no positivo; 20,3 a 22,6 no negativo, subestimado em 2,3 a 4,6.
- **Motivo, medido:** o `<Text>` do Recharts mede cada palavra num vão solto no `body` (15 px) e, no primeiro
  desenho, na fonte de reserva. Essa soma reproduz os limiares: 61,64; 69,73; 71,91; 80,00; 75,73.
- **`R$ -0,2 mi` "pede 62,69 px e cabe" não se confirma:** pede 72. Faixa, peso e ausência de guarda não mudaram.

## Guarda que reconhece o negativo pelo hífen, e o que o F0.2c vai encontrar
- **Nenhuma em `formato.mjs`:** ele compara chamadas na árvore sintática e não lê texto de saída. Fora dele:
  `contract.mjs:246` aceita os dois sinais; `guardas.mjs:201` lê só dígito; `colisao.mjs:180` tem o U+2212 em
  Space Grotesk e em Manrope cai em `LARGURA_PADRAO` (0,55 em; medido 0,554). **O render do F0.2c não faz
  nenhuma guarda acusar nem calar por causa do sinal.**
- **Mas 4 versões aprovadas vão quebrar o tique em duas linhas com o `check` verde:** `08/01` v4 e `08/06` v2, v3
  e v4 têm tique padrão em eixo de 80 px com negativo de centenas de milhar (lido nos `preview.svg` de hoje).
  O texto antigo pede 76 e cabe; o novo pede 81. `08/05` v4 (84 px) cabe; `08/06` v1 (58 px) já está quebrado.

## Provas (10 novas, nenhuma reescrita; fila de dívida sem mudança)
- **Acusa:** formatador fora da lista da seção 6; duas precisões no nome novo; os dois nomes com casas diferentes.
  **Passa:** a versão que importa o nome novo; o nome antigo; um nome na frase e o outro no corpo.
- **Extração, por presença:** nomes liberados contra a tabela da seção 6; contagem do dossiê contra contagem
  independente, sem fixar número; ausência do "13" fixado; nome honesto só quando exportado.
  **Contrafactual** contra o último commit: importar o nome novo dava 1 erro; a guarda dava 0 achados nele.

## Fora do escopo, visto e deixado
1. `dossie.mjs:2189` a `:2246` cita `R$ −200 mil` (posição antiga) e explica os 18 px por `tickSize` mais
   `tickMargin`, o que a bancada não confirma; `selftest.mjs:1809` usa a mesma string. As somas seguem certas.
2. Preview e Farol podem quebrar o tique em larguras diferentes: o limiar depende de a fonte já ter carregado
   quando o Recharts mede. O Farol não foi medido. Tique quebrado segue sem guarda: decisão do dono.
