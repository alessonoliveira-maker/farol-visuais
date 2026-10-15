# Decisões pendentes do dono, catálogo VISUAIS

> Consolidado em 2026-09-30 a partir de `PRODUCAO.md`, do `PLAN.md` do projeto 26, de `replicacao/PEDIDOS_AO_CATALOGO.md` e da memória de sessões; **revisto em 2026-10-15**, depois do fechamento dos 24 lotes, com o que a produção tornou sem efeito riscado e o que a sessão de coerência acrescentou. Cada item traz o **padrão adotado até a decisão**, para que nenhum agente pare esperando. Decidiu: risque o item, escreva a decisão e a data, e mude o lugar indicado em "onde entra".

## Abertas

| # | Decisão | Opções | Padrão até decidir | Onde entra |
|---|---|---|---|---|
| D4 | Pedido P2 da replicação: quadro kanban como família nova | aceitar; recusar | **Recusar** (recomendação já escrita no pedido: ferramenta pessoal, não leitura de cadeira). Os 24 lotes fecharam sem família de kanban. **Recomendação da sessão de 2026-10-15: confirmar a recusa** e passar o P2 a `recusado`. | `replicacao/PEDIDOS_AO_CATALOGO.md`, estado do P2 |
| D5 | Pedido P3: toda marca desenhada em versão nova leva `data-cross-key` com o id do dado | aceitar como emenda da seção 2 do CONTRATO, sem retrofit; recusar | **Aceitar sem retrofit**; sem efeito visual, não muda preview, barateia a colagem no Farol. Com a produção encerrada, a emenda só alcança versão nova ou correção; **recomendação: aceitar e executar o F0.6 (regra de observação, uma tarde de agente)**, ou recusar e fechar o P3 com a colagem acrescentando o atributo, como já faz. | item F0.6 do PLAN, que só roda após a decisão |
| D7 | `EIX-6`: teto de 64 px para tique de eixo é inatingível para moeda sob dígito tabular (`R$ 1,7 mi` pede 65,84 px; `−R$ 200 mil` pede 81) | elevar o teto; permitir `R$1,7mi` sem espaço; manter e desviar por peça pela 14.1 | **Manter, desvio declarado por peça**; já está no dossiê como tensão declarada. **Recomendação: elevar o teto a 84 px**, que é o que `08/06` usa aprovado e cobre o tique negativo; muda só o texto da EIX-6 e a tabela de larguras, sem tocar versão. | CONTRATO 17.3, EIX-6 |
| D11 | **`npm run lint` (F0.11) vira portão para versão nova?** Em 2026-10-15 a régua do Farol acusa 181 das 814 versões aprovadas; o comando existe e é só advertência. | ligar no `check` para versão nova com fila de dívida das 181; manter advertência e exigir no briefing do produtor; manter só advertência | **Advertência.** Quem cola roda o comando antes e ajusta na cópia (CONTRATO 16, passo 8). Nenhuma produção nova está planejada, então o portão não compra nada hoje. | `.claude/agents/visuais-produtor.md` (passo de entrega) e `_render/scripts/check.mjs` se virar portão |
| D12 | **Pedido P6: unidade, domínio de eixo, meta e rótulo de série por prop**, com o valor de hoje como default. Três dos oito primeiros corpos colados desenharam errado com o dado da página por fixarem isso no corpo. | emenda da seção 17 para versão nova; regra da colagem (parametrizar na cópia, já autorizada pela regra 3 do `00_METODO.md`); retrofit das candidatas | **Regra da colagem**, como a replicação já faz. Retrofit de 814 versões não compensa (cada toque derruba o veredito). **Recomendação: fechar o P6 como regra da colagem**, escrevendo-a no passo 4 da seção 16 do CONTRATO. | CONTRATO seção 16, passo 4; `replicacao/PEDIDOS_AO_CATALOGO.md`, estado do P6 |
| D13 | **As versões reprovadas que ficam em pendência conhecida depois da sessão de 2026-10-15** (as de defeito cosmético ou de régua, não de número nem de ruído; lista no STATUS) | terceira rodada; aceitar como estão; retirar do catálogo | **Ficam como estão**, com o selo `reprovada, pendência conhecida` na galeria e a linha no README do modelo; a replicação não as usa. | `fila.json` e README dos modelos |
| D14 | **Teto do dossiê do produtor em 110 KB**, com 62 B de folga em `24/01`: a próxima emenda de régua estoura. | subir para 120 KB; cortar uma seção; cobrir os 205 modelos na prova | **Subir para 120 KB quando estourar**, sem cortar regra (a decisão de 2026-10-02 diz que 10 KB de regra custam menos que uma rodada de correção). Só importa se houver produção nova. | `_render/scripts/lib/dossie.mjs` (`TETO_DO_PRODUTOR`) e a prova do `selftest` |

## Fora do catálogo (tokens do Farol): registradas aqui, decididas lá

| # | Decisão | Padrão adotado |
|---|---|---|
| D6 | Tokens herdados: separar o hex de `--chart-2` e `--chart-4` do semântico; neutro de dado com 3:1 contra o cartão no claro (P7 da seção 17.11); fundos do selo de variação e rederivar `--chart-7` e `--chart-8`; selo de procedência como semântica na COR-8; `clampTickLabel` e `FORCED_TICK_LIMIT` nos imports permitidos | **Nada muda no Farol pelo catálogo.** Produtor declara o desvio no `notes` do `meta.json`; `CONTRASTE-MARCA` entre marcas segue como aviso (102 avisos no acervo em 2026-10-15). Quem decide é a frente do Farol (`app/`), em `app/src/styles/tokens.css`. |
| D9 | `CONTRASTE-MARCA` sem estreitamento acusa marca contra marca, porque os 8 categóricos foram calibrados contra o cartão e nunca entre si (melhor par contra `--chart-1` dá 1,30) | **Manter aviso**; recalibrar é decisão de token do Farol, não do catálogo. |

## Fechadas

| # | Decisão | Desfecho |
|---|---|---|
| ~~D1~~ | Versões por modelo | **Decidido em 2026-10-01: todas as versões planejadas, 4 por modelo.** As 814 estão no disco. |
| ~~D2~~ | LLM do produtor (sonnet por padrão, opus em 17 modelos de geometria) | **Sem efeito desde 2026-10-15:** a produção dos 81 modelos terminou no Lote 18. O campo `llm` de `fila.json` fica como registro. |
| ~~D3~~ | Ordem de produção dos 81 modelos vazios | **Sem efeito desde 2026-10-15:** produção encerrada; a ordem seguida foi a de `fila.json`. |
| ~~D8~~ | `22/01 waffle`: catálogo pede `html-tailwind`, molde é SVG puro, v3 planejada com 900 `div` | **Seguiu o padrão (o catálogo, com a v3 reduzida ao teto e declarada no README) e as 4 versões de `22/01` estão aprovadas** (Lote 12). Fechada em 2026-10-15 sem decisão nova. |
| ~~D10~~ | Commit e push | **Decidido em 2026-10-01: autorizados**, um commit por lote. |

## Já decidido, registrado aqui só para rastreio

- **Segunda rodada de correção das reprovadas** (2026-10-15): o dono delegou à sessão a triagem das 30 versões em pendência conhecida; a sessão mandou ao corretor e ao revisor as que mentem sobre número ou falham com ruído (texto cortado, desenho fora da área, rótulo atribuído ao ponto errado, ausência escrita como zero), mais quatro versões aprovadas com defeito de número anotado no README ou na fila de dívida (`06/05` v1, `07/01` v2, `13/02` v4, `15/03` v1). O resultado está no STATUS e no LOG.
- **Escrita em `app/src/`** (`formatDecimal` devolver U+2212, `withSign`, `HALO`): autorizada em 2026-09-25, executada nos F0.5, F0.5b e F0.5c.
- **Guarda nova vale só para peça nova**; acervo existente entra na fila de dívida (2026-09-25).
- **Dos 27 defeitos vivos com check verde, consertar só os 13 que mentem sobre número** (2026-09-25); 11 consertados em 2026-09-28 e revisados.
- **As 129 versões extras das famílias fora do núcleo ficam no plano** (2026-09-15); confirmadas pela D1 e produzidas.
- **Réguas de "ganho", pipeline como percurso, oportunidade como unidade** (2026-09-02): não afetam o catálogo, que é dado fictício.
