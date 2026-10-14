# F0.4 Guarda `RAIO-CONTRA-AREA`

Data: 2026-10-02. Agente de ferramenta, sozinho. Sem commit.

## O que mudou

| Arquivo | Linhas | O quê |
|---|---|---|
| `_render/scripts/lib/area.mjs` (novo) | 1 a 586 | Leitor: fatia, setor de anel, símbolo do `Scatter` e `<circle>` do `preview.svg`; vetores numéricos do `data.ts`; a lei que cada grupo segue |
| `_render/scripts/lib/guardas.mjs` | 23, 30 a 31, 42, 53, 87, 1956 a 2064 | Linha na tabela do cabeçalho, código no `CODIGOS`, banner e `guardaRaioContraArea` |
| `_render/scripts/check.mjs` | 22, 26, 29 a 51, 85, 135 | Chamada da guarda e a chave `are` na cobertura |
| `_render/scripts/lib/divida-guardas.json` | 2, 115 a 117 | `06/05 v1` registrada com 1 mensagem; `_LEIA` cita a guarda |
| `_render/scripts/selftest.mjs` | 892 a 1004, 2153 a 2166 | 29 provas de guarda e 6 de extração |
| `ARMADILHAS.md` | 670 a 692 | A GEO-3 cita a guarda, o peso, a tolerância medida e o que ela não mede |

## Como a guarda decide

Agrupa as marcas (setores de mesmo centro, discos, bolhas de um `<svg>`), casa cada marca com o valor
por posto contra os vetores do `data.ts` e procura a lei. `area` e `area_com_piso` (sem furo) passam;
`raio_linear` e `meia_raiz` reprovam; grupo sem lei reconhecida não é julgado e sai contado, como
`valor_nao_casado` ou `comprimento_radial` (furo acima de meio raio, que é da GEO-5). Tolerância de
0,01 p.p. de participação: a lei certa fecha em até 0,0007 nas 60 leituras de grupo do acervo, e a
errada mais discreta (`07/06 v3`, 365 marcas) desvia 0,038. O veredito é o mesmo de 0,002 a 0,2.

## As duas medições

- `selftest`: antes 626 provas (118 de guarda, 432 de dossiê), verde. Depois 661 (147 e 438), verde.
- `check -- . --sem-tipos`: antes 0 erros e 388 avisos em 491 versões. Depois 0 erros e 389 avisos; o
  aviso a mais é a `06/05 v1`, na fila.
- Contrafactual, com a guarda ligada e a fila sem a linha nova: **1 erro em 491**,
  `06_pizza/05_pizza-de-raio-variavel/v1_investimento-e-cpl-qualificado-por-plataforma`, lei
  `meia_raiz` com piso de 32%: a marca de valor 2.500 tem 62,50% do total e desenha 54,57% da área
  acima do piso, desvio de 7,93 p.p. A peça está pronta e o README do modelo já registrava o defeito;
  entrou na fila, 91 peças para 92. Cobertura: 38 versões medidas, 408 `sem_marca_de_area`, 40
  `valor_nao_casado`, 5 `comprimento_radial` (`07/01 v2`, `07/04 v4`, `07/06 v1`, `v2` e `v3`).
- `07/07`: `v1`, `v2` e `v4` medidas e certas (desvio de 0,0000 p.p.). A `v3` sai `valor_nao_casado`
  por causa do mês cortado no teto de R$ 80 mil; conferida à mão, 35 dos 36 setores fecham em 0,2474
  px² por real. O fixture do `selftest` é a `v1` com a meia correção antiga, e a guarda devolve os
  números que a GEO-3 tinha medido à mão: 15,05% do valor, 12,89% da área, 2,16 p.p.
- Dossiê do produtor: nenhum dos 205 acima do teto de 112.640 B. O maior é `24/01`, com 112.578 B
  (antes 111.991): **folga de 62 B**. A guarda custou 587 B, 569 da linha da tabela e 18 no bloco do
  escape. Modelo de prova `16/05`: 106.272 B antes, 106.859 B depois.

## Provas

- Acusa: meia correção na rosa; espessura em linha com o valor; bolha de raio em linha; meia correção
  no raio da pizza de dois canais com três marcas; peça nova fora da fila; `check` de ponta a ponta.
- Passa, e passa medida: a raiz com o raio mínimo do lado de dentro; bolha pela raiz; bolha com piso de
  área; a pizza de dois canais com a coroa proporcional acima do piso. Passa sem medir, com motivo: a
  coluna radial da GEO-5 e o valor que não está no `data.ts`. Nenhuma prova antiga foi reescrita.

## O que ficou de fora

- `contract.mjs` está fora do escopo, então a guarda é chamada de `check.mjs` e não de `checkVersion`.
  `lib/pendencias.mjs` chama `checkVersion` direto e **não vê a guarda**: peça nova com o defeito
  falha no `check` e não ganha `check_erro` no `pendencias`. O conserto é mover uma chamada.
- `divida.mjs` está fora do escopo, e `GUARDAS_COM_FILA` não lista a guarda. A fila funciona; o que
  falta é o rótulo "com fila de dívida" no dossiê, que custa 21 B na linha do produtor.
- Sem veredito: os discos de `06/06 v1` (raio encolhido em 5 px pela margem do `PieChart` e arredondado
  ao pixel), setor com `cornerRadius` e valor que nasce de conta no `Chart.tsx`.
