# F3.5 Devolver ao projeto 26: pedidos fechados e STATUS atualizado (2026-10-15)

Item de documentação do Lote 24. Nenhuma ferramenta, régua, versão ou dossiê mudou; `selftest`,
render e `check` não rodaram, por ordem da sessão (outro agente rodava galeria e `selftest`).

## O que mudou

- `replicacao/PEDIDOS_AO_CATALOGO.md`: uma linha "Fechamento do catálogo (2026-10-15):" em cada
  pedido P1 a P6, e a linha de Estado só no P1 (detalhe vencido de 2026-09-30) e no P5 (mudou de
  estado). Corpo dos pedidos intocado. `git diff --numstat`: 45 linhas a mais, 3 a menos.
- `STATUS.md` do projeto 26: entrada nova no topo de "Funcionando", 16 linhas, sem tocar nas antigas.

## Estado final de cada pedido e a evidência

| Pedido | Estado | Evidência no disco |
|---|---|---|
| P1 histograma | `produzido` | `_operacao/LOG.md`, linha "revisar (Lote 23, segunda passada)" de `16/01` v1: aprovada, "o modelo fecha pronto"; parecer `validation/revisao_16_distribuicao__01_histograma_2026-10-15.md` |
| P2 kanban | `aberto` | D4 sem risco em `_operacao/DECISOES_PENDENTES.md`; nenhuma pasta com "kanban" no catálogo fora de `node_modules`; `PLAN.md` sem a palavra |
| P3 `data-cross-key` | `aberto` | D5 sem risco; F0.6 do `PLAN.md` marcado `[!]` "Bloqueado pela decisão D5"; `CONTRATO.md` sem `data-cross-key` |
| P4 lint do Farol | `aberto` | `_render/scripts/` sem `eslint` nem `lint`; `CONTRATO.md` sem as três regras; sem item no PLAN nem D<n> |
| P5 cópia byte a byte | `aceito` | `CONTRATO.md` e `_render/scripts/` sem `prettier`, `printWidth` ou guarda de deriva contra a cópia; `lib/revisao.mjs` linhas 4 a 29: o sha1 compara a versão com ela mesma |
| P6 unidade e escala por prop | `aberto` | `CONTRATO.md` sem exigência de prop para unidade, domínio ou meta, nem regra de meta ausente; só EIX-1 e EIX-9 tocam domínio; sem item no PLAN nem D<n> |

## Decisões que não foram tomadas aqui

- P2 e P3 ficam `aberto` porque D4 e D5 são do dono; o desfecho cita o padrão adotado e o que o
  catálogo fez enquanto isso.
- P4 e P6 ficam `aberto` porque nada no disco mostra decisão: não foram tratados nos 24 lotes e não
  têm número em `DECISOES_PENDENTES.md`. Recusar ou aceitar seria decisão sem evidência.
- P5 vira `aceito` porque é observação sem trabalho pedido, não tem D<n>, e a busca mostrou que
  nada no catálogo a contradiz. É a única mudança de estado.
- O "P6" citado no D6 é a proposta de token P6 da seção 17.11 do CONTRATO, não o pedido P6 da
  replicação; o fechamento do P6 diz isso para evitar a confusão.

## Contagens citadas no STATUS

Vêm da medição da sessão em 2026-10-15 (`npm run pendencias` com tipos), não de medição deste item:
814 planejadas, 814 no disco, 784 prontas, 30 em pendência conhecida (`revisao_reprovada`) em
25 modelos, 205 de 205 modelos completos, extras 0. Decisões abertas no arquivo: D2 a D9.

## Fora de escopo, visto e deixado

- O cabeçalho do `STATUS.md` do projeto 26 segue "_Atualizado em 2026-09-30_".
- P1: não conferi se alguma versão de `16/01` anota o p90 e nomeia o balde de estouro (leitura das
  versões fora do permitido); a ressalva de 2026-09-30 continua no Estado do P1.
- P4 e P6 não têm D<n> nem item no PLAN; registrá-los é escolha do dono.
- A caixa do item F3.5 no `VISUAIS/PLAN.md` não foi marcada (fora do escopo).
