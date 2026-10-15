# Status — Catálogo VISUAIS

_Atualizado em 2026-10-15, no fim da sessão de coerência pós-fechamento (Lote 25, livre, por delegação do dono)_

## Números

Saída de `npm run pendencias` com tipos e de `node _operacao/fila.mjs --resumo` em 2026-10-15, 14:07Z. **Os 24 lotes estão executados e o catálogo está em modo manutenção.** As 814 versões planejadas existem no disco e toda versão tem veredito.

| Contagem | Valor |
|---|---|
| Versões planejadas | 814 em 205 modelos e 27 famílias |
| Versões no disco | 814 (100%) |
| Versões prontas (check em zero erro e veredito aprovado válido) | **805** (eram 784 no fim do Lote 24; o Lote 25 corrigiu e aprovou 21 das 30 reprovadas e reaprovou 8 versões aprovadas que tinham defeito de número anotado) |
| Modelos completos (todas as versões no disco) | 205 de 205 |
| Versões em `reprovado, pendência conhecida` | **9, em 8 modelos**, todas cosméticas ou de régua, que ficam por decisão D13: `09/01` v4, `09/03` v2 e v4, `11/01` v2, `11/02` v3, `11/03` v2, `12/06` v2, `23/03` v3, `25/01` v2. A fila as imprime na faixa `corrigir` porque é o único motivo aberto; **não são trabalho automático** (ver "Modo manutenção" no ORQUESTRADOR) |
| Fila por faixa | corrigir 8 (as de cima), revisar 0, produzir 0 |
| `check -- . --sem-tipos` | 0 erros, **421 avisos**, 17 escapes (eram 436 avisos de manhã: 10 chaves quitadas limpas no F0.9, 2 no fechamento, 3 avisos a menos pelas correções) |
| Guardas do `check` | 16, todas em `checkVersion` (a `RAIO-CONTRA-AREA` entrou na fila das outras no F0.8; `check` e `pendencias` leem o mesmo resultado); cobertura da `RAIO-CONTRA-AREA` 43 de 814 |
| Fila de dívida | **82 peças** (eram 92: AGREGACAO-ZERO 41, EIXO-CALMO 19, OPACIDADE-MARCA 14, TEXTO-NA-MARCA 10, TAMANHO-TEXTO 10; a única peça da RAIO-CONTRA-AREA, `06/05` v1, foi consertada e saiu) |
| Provas do `selftest` | **665 em 11 blocos** (eram 658 em 10; entrou o bloco do lint com 7) |
| Galeria | 817 cartões (814 mais os 3 moldes), cada versão com o selo de veredito: **805 `aprovada`, 9 `reprovada, pendência conhecida`** |
| Lint do Farol sobre o catálogo (`npm run lint`, F0.11) | medido de manhã, antes das correções: **181 das 814 versões aprovadas falham, 264 erros em 12 regras**; advertência, não portão (D11) |
| Dossiê do produtor | teto de 110 KB com prova no `selftest`; o maior dos 205 é `24/01` com 112.578 B, folga de 62 B (D14) |

## Funcionando

- **Catálogo completo e consumível pela replicação:** 805 versões aprovadas em 205 modelos, 27 famílias com README, galeria com veredito por versão, `npm run lint -- <familia>/<modelo>` dizendo antes da colagem o que o lint do Farol vai cobrar (CONTRATO seção 16, passo 8).
- **Ferramenta coerente (F0.8 a F0.11, 2026-10-15):** todas as guardas em `checkVersion`, lista de guardas com fila igual a quem reparte pela fila, fila de dívida sem chave quitada, galeria lendo os vereditos, `npm run lint` com a régua do `app/eslint.config.js` resolvida de `app/node_modules`. Nota em [`validation/ferramenta_f0-8-a-f0-11-coerencia-pos-fechamento_2026-10-15.md`](validation/ferramenta_f0-8-a-f0-11-coerencia-pos-fechamento_2026-10-15.md).
- **Kit de operação por agente:** briefings em `.claude/agents/visuais-{produtor,revisor,corretor,ferramenta}.md`, protocolo em [`_operacao/ORQUESTRADOR.md`](_operacao/ORQUESTRADOR.md) (agora com a seção "Modo manutenção"), fila em `_operacao/fila.mjs`, decisões em [`_operacao/DECISOES_PENDENTES.md`](_operacao/DECISOES_PENDENTES.md), uma linha por agente em `_operacao/LOG.md`.
- **Segunda rodada de correção funcionou onde o defeito era de número ou de ruído:** 21 das 30 reprovadas aprovadas no mesmo dia, 7 delas depois de uma terceira passada com o conserto exato que o revisor apontou (`24/07` v2, `10/06` v4, `13/02` v4, `23/06` v2, `09/06` v1, `20/05` v3, `06/05` v1). As quatro versões aprovadas com defeito de número anotado (`06/05` v1, `07/01` v2, `13/02` v4, `15/03` v1, que arrastou v2 a v4) também foram corrigidas e reaprovadas. Lista no `PLAN.md`, Lote 25.

## Em construção

- Nada em produção. Trabalho novo só por pedido do dono: as 9 reprovadas cosméticas (D13), o F0.6 se a D5 for aceita, o portão de lint se a D11 mudar, e os retornos de régua do LOG que ainda não têm item (a 14.1 não pesa a faixa entre 0,5% e 2% de fidelidade; a EIX-6b não diz quantos px são "sair da linha de grade"; a 14.1 não diz se leiaute de linha condicional se julga pelo preview ou pelo ramo).

## Quebrado, pontos cegos e bloqueios

- **Pontos cegos declarados das guardas, que a sessão de hoje mediu de novo:** COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA não medem texto em HTML ou `foreignObject` (243, 231 e 231 versões fora); ESPESSURA-MARCA e CONTRASTE-MARCA desligam com `transform` (57 e 51); OPACIDADE-MARCA não lê preenchimento em `url(#…)`; REGUA-CONSTANTE pula anéis com `fill="none"`; nenhuma guarda pega rótulo trocado por índice (REC-5), ponto fora de contorno, marca coberta por marca ou texto cortado pela borda. Check verde não é medido; o revisor mede à mão e anota no README.
- **Render e guardas só olham o dado padrão.** Oito dos nove retornos de ferramenta de hoje foram isso: o ramo que reprovou (foco trocado, plataforma ausente fora da última posição, cliente sem lugar no mapa) só aparece com bancada em `_render/exemplos/99_bancada-*`, montada e apagada à mão. É a proposta E7, ainda em estudo, e o maior ponto cego da ferramenta.
- **Lint do Farol:** 22% das versões aprovadas falham na régua do destino (medido de manhã). Quem cola ajusta na cópia; não há retrofit planejado (D11).
- **Decisões do dono em aberto:** D4, D5, D7, D11, D12, D13, D14, cada uma com padrão adotado e recomendação em [`_operacao/DECISOES_PENDENTES.md`](_operacao/DECISOES_PENDENTES.md). D6 e D9 são do Farol, não do catálogo.
- O catálogo em `_estudo/catalogo/13_progresso-meta-e-gauge.json` ainda promete "trilho tracejado" para `13/02` v4, que a correção de hoje removeu; o dossiê repete o texto. `_estudo/` não se edita à mão: fica como divergência declarada no README do modelo.

## Contexto de nascimento de um agente

Medições de 2026-10-01, 2026-10-02 e 2026-10-12 (10,1 a 10,3 mil tokens com `omitClaudeMd` valendo) estão no histórico do git deste arquivo. Não remedido em 2026-10-15.
