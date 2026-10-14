# F0.7 Chaves quitadas fora da fila de dívida (2026-10-02)

Item do PLAN.md, Fase 0, lote livre de 2026-10-02. Escopo: `_render/scripts/lib/divida-guardas.json`.

## O que mudou

Uma chave saiu da fila, a única que o `check -- .` acusava como registro sobrando:

| Versão | Chave removida | Registro |
|---|---|---|
| `15_mapa-de-calor-e-calendario/02_matriz-categorica/v1_win-rate-por-executivo-e-segmento` | `TAMANHO-TEXTO` | 1 |

O objeto da versão ficou vazio, então a linha saiu junto (regra do próprio arquivo: a linha só sai quando o objeto fica vazio). Nenhuma outra chave foi tocada.

Arquivo e linhas: `_render/scripts/lib/divida-guardas.json`, três linhas apagadas (antigas 248 a 250).

## Por que a chave estava quitada

A guarda mede o `preview.svg` e o `preview-claro.svg`. Na medição de hoje a versão tem 129 trechos de texto, o menor em 11 px, nenhum abaixo do piso da TIP-2. O `check` emitia o aviso de limpeza ("está na fila de dívida com 1 mensagem(ns) e não acusa mais nenhuma").

## Medições

| | Antes | Depois |
|---|---|---|
| `selftest` | 586 provas, verde | 586 provas, verde |
| `check -- . --sem-tipos` | 0 erros, 389 avisos | 0 erros, 388 avisos |
| `check -- .` (com tipos) | não medido antes | 0 erros, 388 avisos |
| Aviso de registro sobrando | 1 | 0 |
| Fila: versões (linhas) | 92 | 91 |
| Fila: chaves de guarda | 106 | 105 |

Diferença de avisos: menos 1, exatamente o aviso de limpeza da chave removida. Os 390 avisos do commit `4c22f6e0` já tinham caído para 389 pelas correções de versão do dia, antes deste item.

## Prova de que nada devido saiu

Cruzamento das 105 chaves restantes contra a saída do `check`: as 105 ainda emitem aviso de dívida conhecida na própria versão. Nenhuma chave silenciosa (registrada, sem aviso de dívida e sem aviso de limpeza) e nenhuma chave apontando para versão inexistente.

## Sem prova nova no selftest

O item não cria nem emenda comportamento: só encurta dado. Os quatro comportamentos da fila (aviso, barra, cresce, quita) já têm prova e seguem verdes.

## Fora do escopo, visto e deixado

`06_pizza/04_pizzas-em-small-multiples/v1_agendas-em-quatro-semanas` tem `TEXTO-NA-MARCA: 3` registrado e acusa 1 mensagem hoje. A chave continua devida, então fica. O mecanismo só avisa quando a dívida zera, não quando diminui: o registro de 3 deixa folga para a versão voltar a acumular 2 mensagens sem reprovar. Baixar o número para 1 é decisão do dono, e avisar dívida que diminuiu seria mudança em `lib/divida.mjs`, fora deste item.
