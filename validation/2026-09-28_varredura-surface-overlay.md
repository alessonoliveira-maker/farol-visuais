# Varredura por token: `--surface-overlay` no catálogo VISUAIS

_2026-09-28 · varredura por TOKEN, não por peça · 78 ocorrências em 61 arquivos `Chart.tsx`_

## Por que esta varredura existe

O `--surface-overlay` foi redescoberto como defeito por 18 modelos, virou emenda no `CONTRATO.md`
(seção 17.2, nota abaixo da tabela de tokens) e virou a armadilha `TOK-1`. Continuava vivo porque
**toda varredura anterior foi por versão e o defeito é de token**: a peça em que ele mora não é a
peça em que se está olhando.

A régua que sustenta a proibição: `--surface-overlay` como marca mede **1,00:1 no tema claro** e
1,10:1 no escuro contra `--surface-raised`, porque no claro os dois tokens são o mesmo `#ffffff`.
Uma marca com 1,00:1 não existe.

---

## 1. O placar das 78

| Classe | Ocorrências |
|---|---|
| Legítimo, fica como está | 32 |
| Defeito consertado | 39 |
| Defeito adiado, exige redesenho | 3 |
| Não é uso: o token aparece só em comentário | 4 |
| **Total** | **78** |

O discriminador usado é o mesmo que a guarda `CONTRASTE-MARCA` aplica no ramo HTML: **se há texto
próprio ou descendente com texto, é fundo e é legítimo; se não há, o token está fazendo papel de
marca ou de estrutura e é defeito.** A conferência que valida o critério: a contagem de defeitos que
eu classifiquei por peça bate, peça por peça, com a contagem que a fila de dívida já registrava.

---

## 2. O token substituto, escolhido por PAPEL e medido

Contraste medido com a própria `_render/scripts/lib/contraste.mjs`, sempre contra
`--surface-raised`, que é o que a guarda usa de fundo.

| Papel | Token escolhido | Escuro | Claro | Por que este |
|---|---|---|---|---|
| Trilho de barra, trilho de anel, poço, célula de zero medido | `--surface-sunken` | **1,15:1** | **1,15:1** | O contrato chama o token de "poço rebaixado dentro do cartão", e um trilho **é** um poço. A guarda não julga tokens de superfície, então a linha de dívida some de fato. |
| Cursor de barra na dica | `--line-subtle` | **1,25:1** | **1,29:1** | `DIC-3` nomeia literalmente `cursor={{ fill: 'var(--line-subtle)' }}`. Não houve escolha a fazer: o contrato já dizia o par exato. |
| Corpo da caixa do box plot, que afirma presença | `--line-subtle` | **1,25:1** | **1,29:1** | Precedente medido em `16_distribuicao/BRIEFING.md`, pegadinha 6: "faixa de ausência continua em `--surface-sunken`; faixa que afirma presença vai em `--line-subtle`". O intervalo interquartil afirma presença. |

**Dois tokens, e a razão de serem dois está escrita acima:** não é preferência por peça, é a régua
de ausência contra presença que o acervo já tinha medido, mais a letra da `DIC-3` para o cursor.

### O que os números dizem, e é desconfortável

**Nenhum dos dois candidatos alcança o piso de 3:1 da guarda** (`MARCA_PISO`, WCAG 2.1 SC 1.4.11).
`--surface-sunken` mede 1,15:1 e `--line-subtle` mede 1,25:1 e 1,29:1. A linha de dívida é quitada
porque a guarda **isenta tokens de superfície por decisão de projeto** (`julgado === null`, que cai
em `marca_de_token_nao_julgado`), e não porque o contraste passou a ser adequado.

Isso corrige uma leitura otimista do briefing desta tarefa, que descrevia `--line-subtle` como o que
"funciona nos dois temas". Ele funciona no sentido de **existir** nos dois temas, porque fica mais
claro que o cartão no escuro e mais escuro no claro, o que `--surface-overlay` não fazia em nenhum.
Ele não funciona no sentido de medir 3:1. E `--line-subtle` como preenchimento é, pela própria
guarda, um **aviso** permanente (`nivel: 'aviso'`), enquanto `--surface-sunken` é silêncio. Foi o que
decidiu o trilho a favor do `--surface-sunken`.

O Farol não tem hoje nenhum token neutro que chegue a 3:1 contra o cartão. Enquanto não tiver,
estrutura neutra visível é um compromisso declarado, não um problema resolvido.

---

## 3. As 39 consertadas, ocorrência por ocorrência

### 3.1 Trilho, anel, poço e célula de zero → `--surface-sunken` (33)

Classe utilitária `bg-surface-overlay` → `bg-surface-sunken` (18):

| Arquivo (`.../Chart.tsx`) | Linha | O que era |
|---|---|---|
| `02_barras-horizontais/09_bar-list/v3_criativos-com-leads-e-cpl` | 110 | trilho da microbarra de CPL |
| `13_progresso-meta-e-gauge/01_barra-de-progresso-linear/v1_receita-do-trimestre-contra-meta` | 50 | trilho da barra de progresso |
| `13_.../01_barra-de-progresso-linear/v2_agendas-no-ritmo-do-mes` | 50 | trilho da barra de progresso |
| `13_.../01_barra-de-progresso-linear/v3_cota-por-executivo` | 101 | trilho por executivo |
| `13_.../01_barra-de-progresso-linear/v4_filas-contra-teto-com-estouro` | 72 | trilho da fila |
| `14_tabelas-visuais/01_tabela-com-barras-inline/v1_receita-por-executivo` | 92 | trilho da barra inline |
| `14_.../01_tabela-com-barras-inline/v3_resultado-por-origem-com-desvio-e-mix` | 125, 133 | dois trilhos inline |
| `14_.../01_tabela-com-barras-inline/v4_ausente-zero-outlier-e-faixa` | 125, 142 | trilho de CPL e de volume |
| `14_.../04_scorecard-tabular/v4_cobertura-denominador-pequeno-e-lacuna` | 61 | trilho da pílula de cobertura |
| `14_.../05_ranking-com-variacao-de-posicao/v3_executivos-com-tres-variacoes` | 115 | trilho sob o nome |
| `14_.../06_tabela-cruzada-com-totais-marginais/v2_heatmap-no-miolo-e-barras-nas-margens` | 123, 143 | trilho da margem em linha e em coluna |
| `14_.../07_tabela-agrupada-com-subtotais/v1_pipeline-por-time-comercial` | 101 | trilho da barra inline |
| `14_.../08_tabela-com-linha-expansivel/v2_executivo-com-serie-e-motivos` | 170 | trilho do detalhe aberto |
| `14_.../08_tabela-com-linha-expansivel/v3_filas-com-mapa-de-entradas` | 115 | trilho do mapa de entradas |
| `15_mapa-de-calor-e-calendario/03_cohort-em-triangulo/v1_agenda-por-cohort-mensal-de-entrada` | 123 | trilho do cohort |

Valor de `var()` → `var(--surface-sunken)` (15):

| Arquivo (`.../Chart.tsx`) | Linha | O que era |
|---|---|---|
| `07_rosca-e-radial/02_semi-rosca/v4_agendas-acima-da-meta-semanal` | 150 | `background` da semi rosca |
| `07_rosca-e-radial/04_barra-radial/v1_agendas-por-sdr-na-semana` | 22 | `TRACK_FILL` |
| `07_rosca-e-radial/04_barra-radial/v2_sdr-em-foco-no-ranking` | 25 | `TRACK_FILL` |
| `07_rosca-e-radial/04_barra-radial/v3_entradas-da-semana-por-status-de-sla` | 24 | `TRACK_FILL` |
| `07_rosca-e-radial/04_barra-radial/v4_origem-zerada-e-origem-dominante` | 22 | `TRACK_FILL` |
| `13_.../03_progresso-radial-de-anel-unico/v3_meta-de-receita-por-origem` | 19 | `TRACK_FILL` |
| `13_.../04_aneis-concentricos/v1_tres-metas-da-semana` | 35 | `TRACK_FILL` |
| `13_.../04_aneis-concentricos/v2_quem-fechou-as-tres-metas` | 38 | `TRACK_FILL` |
| `13_.../04_aneis-concentricos/v3_meta-proporcional-e-sem-meta` | 39 | `TRACK_FILL` |
| `13_.../05_gauge-de-arco-preenchido/v1_meta-de-agendas-em-arco` | 121 | `background` do arco |
| `13_.../05_gauge-de-arco-preenchido/v2_fechamentos-acima-da-meta` | 148 | `background` do arco |
| `13_.../05_gauge-de-arco-preenchido/v3_filas-na-mesma-escala` | 69 | `background` do arco coletado |
| `15_.../04_calendario-estilo-contribuicoes/v1_fechamentos-por-dia-em-2026` | 36 | `ZERO_COLOR` |
| `15_.../05_calendario-mensal-em-grade/v1_reunioes-realizadas-em-setembro` | 31 | `ZERO_COLOR` |
| `15_.../07_matriz-de-transicao/v1_movimentos-entre-etapas-no-trimestre` | 45 | `STAY_COLOR` |

As quatro constantes chamadas `TRACK_FILL` são exatamente o caso que o briefing desta tarefa
apontou: a palavra *track* no nome da constante, apontando para o token cuja regra diz "nunca
trilho". O nome estava certo; o token, não.

**Uma nota sobre os três últimos.** Em `15_.../05` e `15_.../07` a mesma constante serve dois
lugares: a célula, que **tem** texto por cima (legítimo), e a amostra da legenda ou a célula de
diagonal, que **não tem** (defeito). Trocar a constante resolve o defeito e mantém a coerência entre
célula e legenda, que é o que o leitor casa com o olho. O texto sobre o novo fundo continua acima do
piso: `--text-muted` sobre `--surface-sunken` mede 5,98:1 no escuro e 4,65:1 no claro, pela própria
tabela da seção 17.2 do contrato.

### 3.2 Cursor de barra → `--line-subtle`, pela `DIC-3` (5)

| Arquivo (`.../Chart.tsx`) | Linha |
|---|---|
| `10_funil/06_funil-empilhado-por-composicao/v1_origem-do-lead-ao-ganho-em-volume` | 146 |
| `10_funil/06_funil-empilhado-por-composicao/v2_mix-em-100-com-indicacao-em-destaque` | 184 |
| `10_funil/06_funil-empilhado-por-composicao/v3_cauda-longa-de-campanhas-agrupada` | 178 |
| `10_funil/06_funil-empilhado-por-composicao/v4_sem-origem-cai-ao-longo-do-funil` | 152 |
| `16_distribuicao/01_histograma/v1_ciclo-de-fechamento` | 205 |

Nas quatro peças do `10_funil/06` o valor era
`cursor={{ fill: 'var(--surface-overlay)', fillOpacity: 0.5 }}` e passou a ser
`cursor={{ fill: 'var(--line-subtle)' }}`. **O `fillOpacity: 0.5` saiu de propósito:** a `DIC-3`
nomeia o par exato e não inclui opacidade, e meia opacidade sobre um token que já mede 1,25:1
devolveria o cursor ao patamar invisível de que se está saindo. É a mesma conta que a `ACE-5` faz
quando diz que opacidade em marca é perda medida.

### 3.3 Corpo da caixa do box plot → `--line-subtle` (1)

`16_distribuicao/02_box-plot/v1_primeiro-contato-por-sdr`, linha 65, `BOX_FILL`. A caixa é
delimitada por um traço em `--chart-1`, mas o miolo dela carrega o intervalo interquartil, que é
valor. Pela pegadinha 6 do `16_distribuicao/BRIEFING.md`, faixa que afirma presença vai em
`--line-subtle`.

---

## 4. As 32 legítimas, que ficam como estão

Todas têm texto próprio ou descendente com texto, que é o uso que a seção 17.2 sanciona: "dica,
selo neutro, fundo de destaque de linha".

**Dica montada à mão, com borda e texto (7):** `03_colunas-verticais/02_colunas-agrupadas/v1` :140 e
`/v3` :90; `16_distribuicao/01_histograma/v1` :197, `/v2` :475, `/v3` :363, `/v4` :382;
`16_distribuicao/05_histograma-comparativo/v1` :389.

**Selo e pílula com texto (5):** `02_barras-horizontais/08_divergente-empilhada-likert/v4` :160
("n baixo"); `02_barras-horizontais/09_bar-list/v3` :99 ("pausado");
`07_rosca-e-radial/05_anel-segmentado-em-unidades/v4` :94;
`09_dispersao-e-bolhas/02_dispersao-com-linha-de-referencia/v1` :136;
`01_cards-e-kpis/07_grade-e-tira-de-kpis/v2` :116 (opção ativa do seletor de janela).

**Estado de interação de controle (3):** `02_barras-horizontais/10_corrida-de-barras/v1` :159,
`/v2` :161, `/v3` :188, todos `hover:bg-surface-overlay` em botão de navegação. É cromo de
controle, não marca de dado, e não aparece no preview parado.

**Fundo de destaque de linha em tabela (14):**
`14_tabelas-visuais/01_tabela-com-barras-inline/v1` :64, `/v2` :80, `/v3` :94, `/v4` :85;
`14_.../04_scorecard-tabular/v3` :94 (faixa de grupo, com o nome da área dentro);
`14_.../07_tabela-agrupada-com-subtotais/v1` :83, `/v2` :87, `/v3` :104, `/v4` :73 e :85;
`14_.../08_tabela-com-linha-expansivel/v1` :62, `/v2` :86, `/v3` :61, `/v4` :68.

**Selo neutro desenhado em SVG (3):** `12_hierarquia/02_treemap-aninhado/v1` :321 (selo do grupo) e
:358 (selo da folha); `12_hierarquia/04_arvore-de-indicadores/v1` :235 (círculo do operador, com
borda em `--line-subtle` e o glifo por cima). **Estes três são legítimos pela letra do contrato e
continuam acusados pela guarda**, pelo motivo da seção 6 abaixo.

---

## 5. As 3 adiadas, e por que não foram tocadas

Todas são o mesmo caso: `--surface-overlay` é o **ponto neutro de uma rampa de cor**, e trocá-lo
recalcula a rampa inteira, a legenda e as medições de contraste que os próprios arquivos já
documentam. É redesenho de peça, não troca de token.

1. **`12_hierarquia/02_treemap-aninhado/v1_pipeline-por-executivo-e-produto` :153.** O
   `color-mix(in oklab, var(<cor>) <pct>%, var(--surface-overlay))` é o fim claro da rampa das
   folhas. O arquivo documenta, nas linhas 70 a 79, uma correção anterior que **encurtou a rampa
   para 80% justamente para preservar o piso da `ACE-3`** e declara em texto que a correção
   "encurta a rampa, não troca o neutro do fim dela". Trocar o neutro agora reabre essa conta e
   muda a cor de toda folha. Precisa de quem redesenhe a rampa com as duas medições na mão.
2. **`15_mapa-de-calor-e-calendario/08_heatmap-de-correlacao/v1_seis-medidas-de-midia` :70.** Mesmo
   `color-mix`, agora como **meio de uma rampa divergente** entre `--negative` e `--positive`.
   Correlação zero deve ler como neutro; no claro ela vira o branco do cartão. Escolher outro meio
   é escolher outra divergente.
3. **`15_.../08_heatmap-de-correlacao/v1` :193.** O `linear-gradient` da legenda da mesma peça, que
   tem de continuar igual à rampa do miolo. Anda junto com o item 2 e não faz sentido sozinho.

---

## 6. Achados que contradizem o enunciado da tarefa

**a. Eram 33 linhas de `CONTRASTE-MARCA` na fila, não 32, e uma delas não é deste token.**
`01_cards-e-kpis/03_kpi-com-regua-de-meta/v3_filas-da-pre-vendas-contra-o-teto` está na fila por
`CONTRASTE-MARCA`, mas **não contém `--surface-overlay`**: ela usa `--seq-1`, `--seq-2` e `--seq-3`
como faixas, que é a armadilha **TOK-7** e não a TOK-1. Fora do escopo desta varredura, e a linha
dela fica.

**b. O piso da guarda é 3:1 e nenhum substituto o alcança.** Está medido na seção 2. A fila encurta
porque a guarda isenta superfície, não porque o contraste ficou bom.

**c. A guarda é cega para o selo desenhado em SVG, e isso deixa 2 linhas na fila que o contrato
considera legítimas.** A isenção "tem texto por cima" está implementada **só no ramo HTML** do
leitor `marca.mjs`. No ramo SVG, o `<text>` é irmão do `<rect>`, não descendente, então um selo
neutro perfeitamente legal, com o texto em cima, é contado como marca. É o caso de
`12_hierarquia/02_treemap-aninhado/v1` e `12_hierarquia/04_arvore-de-indicadores/v1`, cujas linhas
**não removi**: trocar o token ali seria obedecer à guarda contra o contrato, e criar um escape
seria transformar item de fila em escape por conveniência, que o próprio arquivo de dívida proíbe.
Fica como decisão do dono da régua, entre ensinar o ramo SVG a ver o texto irmão e assumir o escape.

**d. `--render` e `--check` aceitam só um alvo por chamada.** Passar vários caminhos faz a
ferramenta processar silenciosamente **apenas o primeiro** ("empacotando 1 versao(oes)"). Custou uma
peça nesta varredura: `07_rosca-e-radial/02_semi-rosca/v4` ficou sem re-render e apareceu como se o
conserto não tivesse pegado. Quem varrer em lote precisa de laço, não de lista.

---

## 7. O próximo token com o mesmo problema, medido e não consertado

**`--line-strong` como preenchimento de área.** Ele mede **1,79:1 no escuro e 1,83:1 no claro**
contra o cartão, abaixo do mesmo piso de 3:1, e a guarda já o acusa como aviso em pelo menos sete
peças que passaram por aqui: `07_rosca-e-radial/04_barra-radial/v2` (5 marcas),
`10_funil/06/v4` (5), `13_.../01_barra-de-progresso-linear/v4` (3),
`14_.../01_tabela-com-barras-inline/v3` (10), `14_.../05_ranking.../v3` (5 e 5),
`14_.../08_tabela.../v2` (3) e `16_distribuicao/01_histograma/v1`.

**Não mexi em nenhuma**, e a razão é que aqui duas regras do contrato se cruzam de verdade: a
`TOK-1` endossa `--line-strong` como contorno e a `DAD-2` pede neutro **fora da rampa** para o zero
medido, e no Farol esse neutro só existe nestes dois tokens de linha. Não é um caso de token errado
usado por descuido, como era o `--surface-overlay`; é uma lacuna da paleta. Vira varredura própria,
com escopo próprio, e provavelmente termina em token novo em vez de troca.

---

## 8. A fila de dívida, antes e depois

| | Antes | Depois |
|---|---|---|
| Linhas de versão no arquivo | 67 | **47** |
| Versões com registro `CONTRASTE-MARCA` | 33 | **3** |

**20 linhas de versão desapareceram** do `_render/scripts/lib/divida-guardas.json`, porque nelas o
`CONTRASTE-MARCA` era o único registro. Nas outras 10 a chave `CONTRASTE-MARCA` saiu e o registro de
`AGREGACAO-ZERO` ficou intacto. **30 registros da guarda quitados.**

Os 3 que restam: um é TOK-7 e não desta varredura (achado 6a), dois são o ponto cego da guarda no
SVG (achado 6c).

### Verificação

As 36 versões tocadas foram re-renderizadas nos **dois temas** e passaram por `npm run check`:
**zero peça com erro**. Nas 30 quitadas, a mensagem que o próprio check emitia
("esta versão está na fila de dívida e não acusa mais nenhuma. Apague a linha dela") desapareceu
depois da limpeza, que é a confirmação de que a fila e o código voltaram a concordar.

O veredito de revisão dessas 36 cai por mudança no `Chart.tsx` e elas voltam para a fila do revisor
humano. É o mecanismo funcionando.
