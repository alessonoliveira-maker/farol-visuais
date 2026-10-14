# Decisões pendentes do dono, catálogo VISUAIS

> Consolidado em 2026-09-30 a partir de `PRODUCAO.md`, do `PLAN.md` do projeto 26, de `replicacao/PEDIDOS_AO_CATALOGO.md` e da memória de sessões. Cada item traz o **padrão adotado até a decisão**, para que nenhum agente pare esperando. Decidiu: risque o item, escreva a decisão e a data, e mude o lugar indicado em "onde entra".

| # | Decisão | Opções | Padrão até decidir | Onde entra |
|---|---|---|---|---|
| ~~D1~~ | **Decidido em 2026-10-01: todas as versões planejadas, 4 por modelo.** | | `regras.versoes_por_modelo = todas` em `fila.json` | fechada |
| D2 | LLM do produtor | sonnet em tudo; opus em tudo; misto | **Misto:** sonnet por padrão e opus em 17 modelos de SVG puro com geometria (violino, iso-linhas, parlamento, stellar, coordenadas paralelas, nuvem, árvore de palavras, coroplético, perímetro, marimekko, e seis de rede) | campo `llm` de cada linha de `fila.json` |
| D3 | Ordem de produção dos 81 modelos vazios | por família em ordem numérica; por reuso provável; por custo | **Reuso provável primeiro e geometria pesada por último:** 16 (resto), 17, 24, 19, 25, 20, 22, 18, 21, 23, 26, 27 | campo `ordem` de `fila.json` |
| D4 | Pedido P2 da replicação: quadro kanban como família nova | aceitar; recusar | **Recusar** (recomendação já escrita no pedido: ferramenta pessoal, não leitura de cadeira) | `replicacao/PEDIDOS_AO_CATALOGO.md`, estado do P2 |
| D5 | Pedido P3: toda marca desenhada em versão nova leva `data-cross-key` com o id do dado | aceitar como emenda da seção 2 do CONTRATO, sem retrofit; recusar | **Aceitar sem retrofit**; sem efeito visual, não muda preview, barateia a colagem no Farol | item F0.6 do PLAN, que só roda após a decisão |
| D6 | Tokens herdados: separar o hex de `--chart-2` e `--chart-4` do semântico (P6); neutro de dado com 3:1 contra o cartão no claro (P7); fundos do selo de variação e rederivar `--chart-7` e `--chart-8` (P2/P5); selo de procedência conta como semântica na COR-8; entrada de `clampTickLabel` e `FORCED_TICK_LIMIT` nos imports permitidos | decidir cada um | **Nada muda no Farol.** Produtor declara o desvio no `notes` do `meta.json`; `CONTRASTE-MARCA` entre marcas segue como aviso | `app/src/styles/tokens.css` (do Farol) e CONTRATO seções 6 e 17.2 |
| D7 | `EIX-6`: teto de 64 px para tique de eixo é inatingível para moeda sob dígito tabular (`R$ 1,7 mi` pede 65,84 px) | elevar o teto a 72 px; permitir `R$1,7mi` sem espaço; manter e desviar por peça pela 14.1 | **Manter, desvio declarado por peça**; já está no dossiê como tensão declarada | CONTRATO 17.3, EIX-6 |
| D8 | `22/01 waffle`: catálogo pede `html-tailwind`, o molde da ferramenta é SVG puro, e a v3 planejada soma 900 `div` acima do teto de cerca de 400 | seguir o catálogo e reduzir a grade da v3; trocar a abordagem do modelo para `svg-puro` no catálogo | **Seguir o catálogo** com a v3 reduzida ao teto, declarado no README | `_estudo/catalogo/22_unidades-waffle-e-pictograma.json` se trocar |
| D9 | `CONTRASTE-MARCA` sem estreitamento acusa 153 de 344 peças, porque os 8 categóricos foram calibrados contra o cartão e nunca entre si (melhor par contra `--chart-1` dá 1,30) | recalibrar os categóricos no Farol; manter aviso entre marcas | **Manter aviso**; recalibrar é decisão de token do Farol, não do catálogo | tokens do Farol; guarda em `_render/scripts/lib/marca.mjs` |
| ~~D10~~ | **Decidido em 2026-10-01: commit e push autorizados.** O acervo e o kit foram commitados nesse dia; daí em diante a sessão orquestradora faz **um commit por lote** no passo 5, com `feat(26/VISUAIS): lote N, <o que entrou>`, e dá push. | | passo 5 do ORQUESTRADOR | fechada |

## Já decidido, registrado aqui só para rastreio

- **Escrita em `app/src/`** (`formatDecimal` devolver U+2212, `withSign`, `HALO`): autorizada em 2026-09-25, **condicionada ao carimbo da biblioteca** (F0.2 do PLAN).
- **Guarda nova vale só para peça nova**; acervo existente entra na fila de dívida (2026-09-25).
- **Dos 27 defeitos vivos com check verde, consertar só os 13 que mentem sobre número** (2026-09-25); 11 foram consertados em 2026-09-28 e revisados; os que sobraram estão na faixa `corrigir` da fila.
- **As 129 versões extras das famílias fora do núcleo ficam no plano** (2026-09-15).
- **Réguas de "ganho", pipeline como percurso, oportunidade como unidade** (2026-09-02): não afetam o catálogo, que é dado fictício.
