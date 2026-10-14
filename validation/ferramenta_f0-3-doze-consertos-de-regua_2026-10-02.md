# F0.3 Os doze consertos de régua levantados por produtores

Data: 2026-10-02. Agente de ferramenta, sozinho. Sem commit.

## A conta de doze

A lista do `../PLAN.md` tem 15 linhas. Doze são de régua (1 a 12); a 12 (`formatDecimal`) e a 13
(`formatPercentPoints`) já foram atendidas pelo F0.5 e pelo F0.5b; a 14 é o F0.4; a 15 é verificação.
Este item tratou as onze primeiras.

## O que mudou, com a prova de cada um

| # | Onde | Prova |
|---|---|---|
| 1 | `ARMADILHAS.md` `REC-24` (título, índice, corpo); sonda `ReferenceArea` em `dossie.mjs` | `recharts 3.10.1`: `ReferenceArea.js:45-46` e `:53-54`, `RechartsScale.js:55-56`, `Rectangle.js:143`, `combineRealScaleType.js:16-20`. `scaleBand` de 8 categorias em 622 px dá 77,75; `scalePoint` dá 0 |
| 2 | `ARMADILHAS.md` `REC-11`; sonda `Bar` em `dossie.mjs` | `Bar.js:664` (comentário), `:667` (condição), `:606-607` e `:635-636` (o `null` volta antes). O PLAN citava `:663` |
| 3 | `ARMADILHAS.md` `GEO-3` | Medido no `preview.svg` de `12/08` v1: 14 folhas com `r/√v` de 3,391 e desvio de 0,0008 p.p.; 4 anéis de −2,21 a +2,36 p.p. |
| 4 | `dossie.mjs`, `extrairFraseDoCarimbo` | Frase literal de `guardas.mjs:351`; `render.mjs:87` grava `data-farol-ace` no nó raiz |
| 5 e 6 | `ARMADILHAS.md`, dois itens novos em Fluxo; o dossiê recorta o primeiro | Acervo: 191 `sem_marca_de_barra`, 52 `marca_fora_do_bar` em 491. Guarda rodada em quatro previews sintéticos (ver provas) |
| 7 | `dossie.mjs`: frase da `GEO-1` recortada uma vez; texto por versão e o da moldura sem "por número"; `ARMADILHAS.md` `GEO-1` cita `meta.mjs:113` | `meta.mjs:113` é a linha do aviso |
| 8 | `ARMADILHAS.md` `GEO-19`; `medirCaixaDeTinta` em `dossie.mjs` | Constantes de `colisao.mjs`: 0,72 e 0,10 em. Em 11 px, 9,02 px; tinta real com descendente, 11,25 px |
| 9 | `CONTRATO.md`, emenda de 2026-10-02 na `EIX-6b`; o dossiê a recorta depois das regras | Bancada renderizada e apagada: `XAxis hide`, margem de 0 a 18 px. Até 11 px o `R$ 0` não sai; com 12 sai. `getTicks.js:169`, `:29-33`, `TickUtils.js:34`, `CartesianAxis.js:70` |
| 10 | `ARMADILHAS.md` `GEO-18`, caso inverso | Guarda: `viewBox` 480x240 em caixa 600x300 dá 13,75 px e cala; 480x400 dá 8,25 px e acusa; `COLISAO-TEXTO` desiste com `preview_com_escala` |
| 11 | `dossie.mjs`, `medirTextoSobreMarcaComposta` e parágrafo depois da matriz | `--surface-raised` sobre `--chart-1`: 6,00:1 opaco, 3,38:1 a 0,72 no claro. Mínima para o texto: 0,87, contra 0,66 da marca |

Arquivos: `ARMADILHAS.md` (linhas 64, 282 a 287, 429 a 447, 622, 661 a 669, 885 a 893, 911 a 920,
1295 a 1304), `CONTRATO.md` (640 a 653), `_render/scripts/lib/dossie.mjs` (21, 742 a 876, 1150 a 1169,
1985 a 1991, 2076 a 2117, 2225 a 2231, 2245 a 2250, 2329, 2818 a 2821, 3172 a 3179, 3333, 3425 a 3428,
3485, 3535), `_render/scripts/selftest.mjs` (392 a 419, 2129 a 2182).

## As duas medições

- `selftest`: antes 591 provas (110 de guarda, 405 de dossiê), verde. Depois 626 (118 e 432), verde.
- `check -- . --sem-tipos`: antes 0 erros e 388 avisos em 491 versões. Depois igual, nenhuma mensagem
  nova e nenhuma a menos. Nenhuma guarda nem limiar mudou; a fila de dívida não foi tocada.
- Dossiê do produtor do modelo de prova: 102.909 B antes, 106.272 B depois (teto de 112.640 B).
- Os 205 dossiês do produtor: nenhum acima do teto. O maior é `24/01 sparkline de linha`, com
  109,37 KB e **649 B de folga**. Uma primeira redação levou cinco modelos acima do teto e foi encurtada.

## Provas

- Acusa: caso misto da `GEO-18`; marca à mão de 16 px com rótulo dentro; par composto a 0,72; um passo
  abaixo da opacidade mínima; origem sem a frase ou sem a emenda cala o dossiê.
- Passa: `viewBox` menor nos dois eixos; marca de 20 px com rótulo dentro; par opaco; a frase da `GEO-1`,
  o carimbo, os motivos, a caixa e a emenda chegam aos papéis que os prometem.
- Nenhuma prova antiga foi reescrita. As de extração cobram o trecho lido da origem na hora.

## O que ficou de fora

- Itens 3 e 10: o texto novo está no `ARMADILHAS.md`, e o dossiê só imprime o título das armadilhas
  em qualquer papel. Levá-los custaria bytes que o teto não tem.
- O banner da `ESPESSURA-MARCA` em `guardas.mjs:464-467` continua explicando os dois motivos com um
  parêntese só. `guardas.mjs` está fora do escopo; a definição certa entrou pelo `ARMADILHAS.md`.
- A medição da margem do tique é do eixo de valor em pé; a peça deitada não foi medida.
- Item 15, só visto: `15/08` v1 tem 3 ocorrências de `--surface-overlay` no `Chart.tsx` (comentário,
  `color-mix` e gradiente da legenda) e a fila traz só `TAMANHO-TEXTO`. Nenhuma guarda as acusa hoje.
- O F0.4 vai acrescentar uma guarda à tabela do produtor, e 649 B não comportam uma linha dela.
