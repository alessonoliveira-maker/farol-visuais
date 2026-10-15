# Parecer de revisão: 11_fluxo-sankey/03_alluvial

Data: 2026-10-14. Revisão independente de `v2`, `v3` e `v4`, as três com motivo `sem_revisao`. Julgado o arquivo de hoje (Chart.tsx de 2026-09-28, PNGs de 2026-10-02), com `npm run check -- 11_fluxo-sankey/03_alluvial` em 0 erros e 2 avisos (AGREGACAO-ZERO na `v1`, fora deste julgamento, e CONTRASTE-MARCA na `v2`).

Resultado: `v3` e `v4` aprovadas; `v2` reprovada. Há uma única rodada de correção, e os dois bloqueantes abaixo são todos os encontrados. As observações não bloqueantes das três versões estão no README do modelo, seção final.

## v2_leads-quentes-que-esfriaram: reprovada

Não: 32, 20, 11, 15.

**Bloqueante 1. Perguntas 32, 20 e 11; regras ACE-6, ACE-3 e tabela 17.2 (papel "Neutro de dado, com valor escrito"); armadilha TOK-5.**
Evidência: `Chart.tsx:73` define `NEUTRAL_RIBBON = 'var(--line-strong)'` e `Chart.tsx:232` pinta com ele toda faixa fora de `highlight`: são 14 das 16 faixas. O check mede esse preenchimento em 1,79:1 no escuro e 1,83:1 no claro contra o cartão, nas 14 marcas, abaixo dos 3:1. A tabela 17.2 só aceita `--line-strong` como dado "quando cada marca carrega o próprio número", e aqui nenhuma das 14 faixas tem número: o que está escrito é o total de cada bloco (`Chart.tsx:384`), não a contagem da faixa. As contagens 132, 15, 38, 165, 45, 20, 12, 58, 288, 44, 3, 9, 25 e 115 não aparecem em lugar nenhum da tela. Teste da ACE-6: tapadas as faixas neutras, some quem foi de Morno para Frio (45) e de Frio para Morno (58), e somem também Quente para Quente (132) e Quente para Descartado (15), que completam os 214 Quentes da pergunta e que o próprio `data.ts` separa de "esfriar". A ACE-6 nomeia "a ligação de um Sankey" como traço que carrega a relação. Precedente da família: `02_sankey-multietapa/v1` caiu pelo mesmo motivo em 2026-10-05.
O que mudar: trocar `NEUTRAL_RIBBON` para `var(--text-muted)` opaco (5,21:1 no escuro e 5,37:1 no claro contra o cartão, o neutro que `v3` e `v4` já usam). Atualizar junto o que hoje afirma a isenção: o comentário do topo do `Chart.tsx` (nota 1), o `notes` do `meta.json`, o item 12 da Anatomia e o item `v2` da seção de colisões do README.

**Bloqueante 2. Pergunta 15; regra COR-5; armadilha TOK-4.**
Evidência: as faixas fora de foco saem com `stroke='none'` e `strokeWidth={0}` (`Chart.tsx:318` e `319`), e as 14 são da mesma cor. No PNG, nos dois temas, elas se fundem numa massa só: na chegada ao bloco Quente de ago/26, as quatro faixas que entram (132, 38, 12 e 3 leads, cerca de 18,9, 5,4, 1,7 e 0,4 px na escala de 0,143 px por lead) formam uma faixa contínua de cerca de 26 px sem divisa; e a faixa de Quente para Descartado (15 leads, cerca de 2,1 px), que sai da base do bloco Quente de jul/26, não se acompanha até o bloco Descartado de ago/26, porque atravessa a massa sem borda. Com o neutro trocado para `--text-muted` pelo bloqueante 1, a massa fica ainda mais sólida.
O que mudar: dar a toda faixa, acesa ou neutra, o contorno `var(--surface-raised)` de 1,5 a 2 px que a COR-5 autoriza entre vizinhos que não contrastam (a saída da TOK-4), mantendo as acesas pintadas por último (`orderedRibbons`, já correto). Conferir depois, nos dois PNGs, que a faixa de Quente para Descartado se acompanha da saída à chegada.

**Medição que a correção precisa fazer, pela TOK-9 (não é bloqueante hoje, vira consequência da correção).** Calculado dos hex de `app/src/styles/tokens.css`, `--chart-1` contra `--text-muted` mede 1,82:1 no escuro e 1,12:1 no claro: depois da troca, no tema claro a faixa acesa e as neutras têm quase a mesma luminância, e o destaque passa a depender de matiz. O peso 700 na origem e as duas anotações já são segundo canal fora da faixa; falta um na própria faixa. A saída que a revisão de `18_radar/06_coordenadas-paralelas/v2` aceitou é revestimento em `--surface-raised` mais largo sob a faixa acesa do que o contorno das neutras. Medir o par marca contra marca nos dois temas e escrever o número no `notes`.

Conferido e sem bloqueante: população fecha 1.036 nas duas colunas (214, 268, 402 e 152 em jul/26; 185, 278, 379 e 194 em ago/26); espessura das faixas acesas confere com o dado (46 leads em cerca de 6,6 px, 21 em cerca de 3,0 px); peso 700 em dois elementos (nome e contagem da origem, TIP-3); duas anotações com nome e contagem em 11 px `--text-muted` (ANO-1, ANO-2); taxa com volume por `formatRateWithVolume` (NUM-1); frase acessível de 196 caracteres, começando pelo tipo e dizendo quantos esfriaram de qual total (ACE-1); vazio e soma zero no mesmo portão `role="status"` (EST-1, EST-1b); textos sobre o cartão, sem colisão nem corte nos dois temas; cor por `slot` do dado (COR-3, COR-8).

## v3_faixa-de-receita-dos-clientes-em-quatro-trimestres: aprovada

Sem bloqueante. População fecha 312 nas quatro colunas, nas duas perspectivas de cada coluna do meio; base de 204, 212, 218 e 220 confere com o cabeçalho; faixas em categóricas na ordem 1, 3, 6, 5 e as duas de fora da base em `--text-muted` a 5,21 e 5,37:1; ausência vazada e por último; desvio da rampa `--seq-N` medido e declarado no `notes`. Observações no README.

## v4_classificacao-que-passou-a-existir: aprovada

Sem bloqueante. 1.240 fecha nas três colunas; Morno sem bloco em jun/26, com presença declarada no dado e não deduzida de total zero; ausência vazada em `--text-muted` por último, com as faixas que saem dela em neutro a 5,21 e 5,37:1; anotação única do nascimento. Observações no README.

---

# Segunda passada: v2 depois da rodada única de correção

Data: 2026-10-14. Revisor independente, motivo `revisao_reprovada`. Julgado o arquivo de hoje: `Chart.tsx` e `meta.json` de 2026-10-14 12:51, `data.ts` sem mudança. `npm run check -- 11_fluxo-sankey/03_alluvial` com 0 erros e 1 aviso (AGREGACAO-ZERO na `v1`, fora deste julgamento). Render refeito com `--tema ambos`: diferença de 0,03% no escuro e 0,04% no claro.

Resultado: `v2_leads-quentes-que-esfriaram` reprovada. Não: 15, 32.

**O que a correção resolveu.** O bloqueante 1 da primeira passada: `NEUTRAL_RIBBON` agora é `var(--text-muted)` opaco, e o preview pinta as 14 faixas neutras com rgb(127, 143, 171) no escuro e rgb(92, 107, 135) no claro, 5,21 e 5,37:1 contra o cartão. A massa fundida do bloqueante 2 também acabou: as faixas neutras grossas têm divisa entre si.

## Bloqueante. Perguntas 15 e 32; ACE-6, COR-5, seção 14.1 (constante com consequência visível, identificação das marcas, encoding); armadilhas GEO-16 e GEO-4

O contorno e o revestimento que a correção acrescentou apagam marcas de dado. Medido nos dois PNGs por perfil de pixels, com o `viewBox` mapeado pelo SVG aninhado do `preview.svg` (x 33, y 158, 574 por 189,5 px, PNG a 2x). Os números são iguais nos dois temas.

**1. A saída do bloco Quente de jul/26 não mostra a partição dos 214, que é a pergunta da versão.** Entre vx 145 e 175, logo depois do bloco:

| Faixa | Dado | Espessura do dado | Desenhada na saída |
|---|---|---|---|
| Quente para Quente | 132 | 18,9 px | 15,0 a 15,5 px |
| Quente para Morno (acesa) | 46 | 6,6 px | 3,5 a 4,5 px |
| Quente para Frio (acesa) | 21 | 3,0 px | 2,5 a 3,0 px |
| Quente para Descartado | 15 | 2,1 px | 0 px |

Causa: `HALO_STROKE_WIDTH = 5` nas faixas acesas, pintadas por último (`Chart.tsx:71` e `316`). Os 2,5 px que o revestimento de Quente para Frio avança para fora cobrem a base de Quente para Morno e Quente para Descartado inteira, porque as quatro saem borda a borda do mesmo bloco. Quente para Morno só volta a 6,0 a 6,5 px a partir de vx 200. Consequência: as duas faixas acesas saem do bloco na razão de 1,4 em vez de 2,2 (46 contra 21), e os 15 descartados não deixam rastro na saída. O bloco Quente emite três faixas e uma banda na cor do cartão. A conferência que a primeira passada pediu ("a faixa de Quente para Descartado se acompanha da saída à chegada") falha: 0 px na saída, cerca de 0,4 px na chegada a Descartado de ago/26 (um fio de cabelo), e no meio uma linha na cor do cartão.

**2. As faixas finas somem dentro do próprio contorno.** `RIBBON_STROKE_WIDTH = 1.75` (`Chart.tsx:69`) é centrado na borda e come 0,875 px de cada lado de toda faixa neutra. As acesas não têm contorno. Três faixas são mais finas que o próprio contorno e ficam sem preenchimento nenhum: Frio para Quente (12 leads, 1,71 px), Descartado para Morno (9, 1,29 px) e Descartado para Quente (3, 0,43 px). Na tela elas viram linhas na cor do cartão, brancas no claro e quase pretas no escuro, a 1:1 contra o cartão, e se leem como vão e não como faixa. A chegada de Descartado para Quente ao bloco Quente de ago/26 fica ainda debaixo do revestimento de Quente para Morno. Morno para Descartado (20, 2,86 px) e Descartado para Frio (25, 3,57 px) ficam com no máximo 1,11 e 1,82 px. Então a faixa neutra de 25 leads sai mais fina que a acesa de 21 (3,0 px), e a espessura deixa de ordenar a contagem entre neutro e aceso.

Teste da ACE-6: quatro ligações, somando 39 leads, já aparecem tapadas. É o sintoma da GEO-16 (respiro absoluto, e a marca pequena paga tudo) e da GEO-4 (o revestimento apaga a marca fina que devia deixar ver).

**O que mudar.**
- **Contorno que separa sem comer a faixa.** `paintOrder: 'stroke'` em toda faixa, para o traço ficar sob o próprio preenchimento e só avançar para fora. Faixas neutras pintadas da mais grossa para a mais fina, e as acesas por último (`orderedRibbons`).
- **Segundo canal do destaque (TOK-9) que não cubra a vizinha.** Tirar o revestimento de 5 px ou trocá-lo por um que não avance sobre as faixas da mesma borda. Peso 700 e anotações com contagem já existem. Se o canal na própria faixa continuar, o contorno da acesa fica com no máximo 1,75 px em `paintOrder: 'stroke'`.
- **Faixa que ainda saia abaixo de 1 px de preenchimento.** Piso de espessura com o desvio escrito no `notes` (saída da GEO-16).
- **Critério de aceite, nos dois PNGs.** Na saída de Quente de jul/26, as quatro faixas medem proporcionais a 132, 46, 21 e 15, com no máximo 1 px de perda cada. Quente para Descartado se vê em preenchimento neutro da saída à chegada. Cada uma das 16 faixas mostra o próprio preenchimento em algum trecho do caminho. As medidas vão para o `notes`.

**Origem do defeito.** O revestimento mais largo veio do parecer da primeira passada, que levou a saída da TOK-4 e da TOK-9 (aceita em `18_radar/06_coordenadas-paralelas/v2`, onde as linhas se cruzam) para faixas empilhadas borda a borda. Aqui ele come a vizinha. A saída precisa dessa ressalva no `ARMADILHAS.md`.

## Conferido e sem bloqueante

A população fecha em 1.036 nas duas colunas. A cor vem do `slot`, na ordem 1, 3, 6, 5 (COR-3, COR-8). O peso 700 aparece em dois elementos (TIP-3), e o tamanho fica em 12 e 11 px com algarismo tabular. As anotações são duas, com contagem (ANO-1, ANO-2). A taxa vai com o volume (NUM-1). Vazio e soma zero passam pelo mesmo `role="status"` (EST-1, EST-1b). A frase acessível mede 196 caracteres. Todo texto fica sobre o cartão em pares aprovados, sem colisão nem corte nos dois temas. O `notes` está atualizado para o neutro novo. Observações não bloqueantes vão no README.
