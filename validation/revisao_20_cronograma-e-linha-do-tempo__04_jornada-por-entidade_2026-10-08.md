# Parecer de revisão: 20_cronograma-e-linha-do-tempo/04_jornada-por-entidade

> Data: 2026-10-08. Revisor independente. Insumo do corretor: existe uma única rodada de correção, e tudo o que bloqueia está listado aqui.

| Versão | Resultado | Bloqueantes |
|---|---|---|
| `v1_oportunidades-ganhas-por-etapa` | reprovada | 1 |
| `v2_tempo-parado-em-destaque` | aprovada | 0 |
| `v3_alinhada-pelo-dia-zero` | reprovada | 1 |
| `v4_marey-com-retorno-de-etapa` | reprovada | 2 |

`npm run check -- 20_cronograma-e-linha-do-tempo/04_jornada-por-entidade`: 0 com erro, 0 avisos, nenhum escape de guarda em uso. Os PNGs julgados são os de 2026-10-08 16:40, mais novos que os quatro `Chart.tsx`. Os números impressos nas quatro versões foram refeitos a partir do `data.ts` e conferem.

As observações não bloqueantes das quatro versões estão no README do modelo, na seção `## Observações da revisão (não bloqueantes)`. Quem corrigir a v1, a v3 e a v4 pode aproveitar o arquivo aberto para alinhar as que são dela.

O bloqueante da v1 e o da v3 são o mesmo defeito e pedem a mesma saída nas duas, para o modelo não ficar com duas paletas de etapa.

## v1_oportunidades-ganhas-por-etapa: reprovada

```
Versão: 20_cronograma-e-linha-do-tempo/04_jornada-por-entidade/v1_oportunidades-ganhas-por-etapa
Data: 2026-10-08
Resultado: reprovada
Não: 20 (com reflexo na 11)
Correções:
  20. ACE-3, TOK-8: a etapa Qualificação em var(--seq-4) mede 2,60:1 contra o cartão no tema claro, sem número escrito; usar cor que passe de 3:1 nos dois temas.
Não se aplica: 4 (barra de intervalo no tempo, sem zero), 6, 13 (sem linha de referência), 26, 27, 28, 29, 30
```

### Bloqueante 1. A etapa de qualificação fica abaixo do piso de contraste no tema claro

- **Pergunta e regra:** 20, com reflexo na 11; ACE-3 (marca de dado e amostra medem 3:1 contra o fundo adjacente, salvo com o valor escrito na marca ou junto dela); armadilha TOK-8 ("só `--seq-5`, `--seq-6` e `--seq-7` passam de 3:1 nos dois temas"); seção 14.1, em que contraste bloqueia sempre.
- **Evidência no código:** `STAGE_COLORS = ['var(--seq-4)', 'var(--seq-5)', 'var(--seq-6)', 'var(--seq-7)']` (Chart.tsx, linha 55). O comentário das linhas 50 a 54 e a nota do `meta.json` dizem que "os degraus 1 a 3 medem menos de 3:1 contra o cartão (TOK-8), então a rampa parte do 4". A TOK-8 diz outra coisa: o degrau 4 mede 3,38:1 no escuro e 2,60:1 no claro.
- **Evidência medida nos PNGs** (primeira linha, um pixel por segmento, contra o pixel do cartão):

| Etapa | Token | Escuro | Contraste | Claro | Contraste |
|---|---|---|---|---|---|
| Qualificação | `--seq-4` | `#1d7894` | 3,38:1 | `#63aac4` | **2,60:1** |
| Diagnóstico | `--seq-5` | `#2495b3` | 4,89:1 | `#3d8ea9` | 3,72:1 |
| Proposta | `--seq-6` | `#2db4d2` | 6,96:1 | `#24728b` | 5,45:1 |
| Negociação | `--seq-7` | `#6fd6e8` | 10,12:1 | `#12556a` | 8,29:1 |

- **Alcance:** no `preview-claro.svg` são 15 segmentos com `fill:rgb(99, 170, 196)`, um por oportunidade, mais a amostra `Qualificação` da legenda e a da dica. É a etapa de entrada de toda linha. Na `Oportunidade 11`, em que a qualificação dura 1 dia, sobra cerca de 1,3 px de tinta a 2,60:1.
- **Por que a isenção não vale aqui:** nenhum segmento tem número escrito nele ou ao lado. A duração de cada etapa só existe no comprimento da barra e na dica.
- **Por que o check não acusou:** a guarda CONTRASTE-MARCA só julga degrau `--seq-*` quando a peça desenha menos de três degraus distintos; com quatro ela trata o uso como rampa e não mede o piso (o segmento sai contado como `marca_de_token_nao_julgado`). Fora do escopo da guarda a medição é do revisor. É o mesmo defeito reprovado em 2026-10-05 em `16_distribuicao/06_densidade-kde/v3` e em `24_microvisuais-sparklines/04_faixa-de-status-tracker/v2`.
- **O que mudar:** toda etapa precisa medir 3:1 contra o cartão nos dois temas. A rampa do Farol só tem três degraus assim e o funil tem quatro etapas, então a ordem não pode morar na cor (o README já declara isso em Quando evitar). Duas saídas medidas, escolher uma e usar a mesma na v1 e na v3:
  1. **Recomendada, com precedente em `11_fluxo-sankey/03_alluvial/v3`:** a cor volta a ser identidade da etapa, por chave, nos slots categóricos 1, 3, 6 e 5 da COR-8 (todos acima de 5:1 nos dois temas). A ordem fica na posição fixa e na legenda escrita, que já estão na ordem do funil. O contorno `--surface-raised` entre vizinhos continua (COR-5).
  2. **Alternativa:** manter `--seq-5`, `--seq-6` e `--seq-7` nas três últimas etapas e dar à qualificação a receita neutra da v2, `--surface-sunken` com contorno `--text-muted` de 1,5 px (5,21:1 e 5,37:1). Cuidado com dois efeitos: o contorno do vizinho pintado depois cobre a borda direita do neutro, e forma vazada é o papel de ausência da 17.2.
- **Junto com a troca:** amostra da legenda e amostra da dica saem do mesmo mapa; corrigir o comentário do topo de `STAGE_COLORS`, o item 2 do desvio na nota do `meta.json`, o item 2 do `demonstrates` se a rampa sair, e no README o item 3 da Anatomia e a linha da v1 em Versões. Conferir nos dois temas que o losango `--positive` continua separado da última etapa pelo contorno.

### Conferido e aprovado na v1, para não mexer

Pivotagem da tupla em vão da criação mais quatro durações em dias, declarada no `meta.json`; medianas por etapa de 7, 14, 15 e 21 dias e ciclo mediano de 60 dias, que conferem com a linha de leitura e com a frase acessível (186 caracteres); linhas ordenadas pela criação; losango de fechamento em `--positive` com forma própria e palavra na legenda (ACE-2); tiques mensais por `Date.UTC` com `formatMonthShort`; grade só vertical (EIX-3) e eixo calmo (EIX-5); `interval={0}` nos 15 nomes; margem direita de 20 px que segura o tique `out/26` e o losango de 2026-09-30; barra de 12 px; vazio com `role="status"` e `Filter`; dica montada à mão pela saída da REC-6; dado fictício e sem relógio.

## v3_alinhada-pelo-dia-zero: reprovada

```
Versão: 20_cronograma-e-linha-do-tempo/04_jornada-por-entidade/v3_alinhada-pelo-dia-zero
Data: 2026-10-08
Resultado: reprovada
Não: 20 (com reflexo na 11)
Correções:
  20. ACE-3, TOK-8: a etapa Qualificação em var(--seq-4) mede 2,60:1 contra o cartão no tema claro, sem número escrito; usar a mesma saída da v1.
Não se aplica: 6, 26, 27, 28, 29, 30
```

### Bloqueante 1. A etapa de qualificação fica abaixo do piso de contraste no tema claro

- **Pergunta e regra:** as mesmas da v1: 20, com reflexo na 11; ACE-3; TOK-8; seção 14.1.
- **Evidência no código:** `STAGE_COLORS` começa em `var(--seq-4)` (Chart.tsx, linha 50), com o mesmo comentário da v1 nas linhas 45 a 49 e a mesma frase no fim da nota do `meta.json`.
- **Evidência medida nos PNGs** (quarta linha, um pixel por segmento): escuro `#1d7894` 3,38:1, `#2495b3` 4,89:1, `#2db4d2` 6,96:1 e `#6fd6e8` 10,12:1; claro `#63aac4` **2,60:1**, `#3d8ea9` 3,72:1, `#24728b` 5,45:1 e `#12556a` 8,29:1.
- **Alcance:** no `preview-claro.svg` são 40 segmentos com `fill:rgb(99, 170, 196)`, o começo de todas as 40 linhas, mais a amostra da legenda e a da dica. Aqui pesa mais que na v1: as linhas não têm nome nem número, e a pergunta do caso de uso é justamente quanto cada etapa ocupa do ciclo.
- **O que mudar:** a mesma saída escolhida para a v1, com as mesmas cores por etapa. Depois da troca, conferir nos dois temas que as quatro linhas de mediana continuam visíveis sobre as quatro cores novas; o fio de 4 px em `--surface-raised` por baixo da linha (TOK-10) já garante isso e não precisa mudar. Corrigir o comentário de `STAGE_COLORS` e a última frase da nota do `meta.json`.

### Conferido e aprovado na v3, para não mexer

Medianas acumuladas de 8, 19,5, 39,5 e 57 dias e medianas por etapa de 8, 13, 19 e 17,5 dias, que conferem com as quatro linhas, com a linha de leitura e com a frase acessível (207 caracteres); linhas ordenadas pelo ciclo, de 16 a 98 dias; barra a partir do zero com domínio de 0 a 100 dias, tiques de 25 em 25 e unidade em todo tique (EIX-1, EIX-4, NUM-6); `ReferenceLine` com `ifOverflow="extendDomain"` e fio de superfície por baixo, a saída da TOK-10; nenhum dos 160 segmentos fica com menos de 3 px de tinta por causa desse fio (conferido por conta, com 5,24 px por dia); rótulos de mediana numa margem reservada de 20 px, sem cruzar marca; margens esquerda e direita que seguram os tiques de borda com o eixo de categoria escondido (emenda da EIX-6b); canvas por número declarado na nota; barras de 12 a 12,5 px em passo de 16,5 a 17 px; nome da oportunidade só na dica, como o catálogo pede; vazio com `role="status"`.

## v4_marey-com-retorno-de-etapa: reprovada

```
Versão: 20_cronograma-e-linha-do-tempo/04_jornada-por-entidade/v4_marey-com-retorno-de-etapa
Data: 2026-10-08
Resultado: reprovada
Não: 3, 31
Correções:
  31. ROT-7 (marca fina), GEO-4: o halo dos dois rótulos de retorno apaga 11,5 px e 9,5 px do degrau de outras duas oportunidades; quem sai do lugar é o rótulo.
  3. Seção 14.1 (identificação das marcas), ACE-2: o anel do retorno da Oportunidade 06 cai sobre a linha em destaque da Oportunidade 03; desenhar o anel no trecho descendente da própria linha e na cor dela.
Não se aplica: 4, 6, 13 (sem linha de referência), 26, 27, 28, 29, 30
```

### Bloqueante 1. O halo dos rótulos de retorno corta o degrau de duas outras oportunidades

- **Pergunta e regra:** 31; ROT-7, exceção da marca fina; armadilha GEO-4 ("em marca fina, quem sai do lugar é o texto, nunca a marca", e esses rótulos não levam halo). O degrau é dado pelo teste da ACE-6: tapado, some a mudança de etapa daquela oportunidade.
- **Evidência medida nos PNGs em 2x, igual nos dois temas** (faixa entre o nível de diagnóstico, y=578, e o de qualificação, y=658):

| Rótulo | Tinta do rótulo em x | Degrau cortado | Coluna | Traço com tinta em y | Sem traço |
|---|---|---|---|---|---|
| `volta em 24/08/2026` | 840 a 1058 | `Oportunidade 07` entra em diagnóstico em 2026-08-17 | 945 | 580 a 594 e 618 a 657 | 23 px, isto é 11,5 px dos 40 px do degrau |
| `volta em 02/09/2026` | 1176 a 1394 | `Oportunidade 09` entra em diagnóstico em 2026-09-07 | 1257 | 580 a 598 e 618 a 657 | 19 px, isto é 9,5 px |
| controle, fora dos rótulos | | `Oportunidade 08`, 2026-08-26 | 1079 | 580 a 657, contínuo | 0 |

  O primeiro degrau atravessa a data entre o `2` e o `4`; o segundo passa entre `em` e `02`. É o defeito reprovado hoje em `01_gantt/v1`, lá com 7 px.
- **Causa:** `Marks` ancora o rótulo em `y + MARK_RADIUS + 13` (Chart.tsx, linha 177), na faixa entre dois níveis, que é por onde sobem os degraus de todas as outras oportunidades. A alternância de lado por `order % 2` (linhas 175 e 176) evita rótulo contra rótulo, não rótulo contra degrau, e o `style={HALO}` (linha 174) apaga o traço de 1,5 px.
- **O que mudar:** o rótulo sai, o traço fica. Antes de posicionar, listar o x de todo degrau que cruza a faixa onde o rótulo vai (todo movimento de toda oportunidade entre aqueles dois níveis) e escolher lado e deslocamento em que a caixa estimada do texto não contenha nenhum. Se nenhuma posição servir, levar o rótulo para uma pista reservada fora das linhas, com linha de chamada curta até o anel: a folga de `Y_TOP_PADDING` acima do último nível já é uma pista assim, e abaixo do nível de qualificação cabe outra. Rótulo em pista livre não precisa de halo. A decisão se toma pelo que o dado pode produzir, não pela posição dos dois retornos do dado padrão.

### Bloqueante 2. O anel do retorno da Oportunidade 06 cai sobre a linha em destaque da Oportunidade 03

- **Pergunta e regra:** 3 (nenhuma forma sugere algo que o dado não tem); seção 14.1, identificação das marcas; ACE-2 e ROT-3 (marcador na cor da série).
- **Evidência no dado:** há dois retornos, um por oportunidade. A `Oportunidade 03`, que é a mais lenta e está em azul, volta de proposta para diagnóstico em 2026-08-24 e fica lá até 2026-09-07. A `Oportunidade 06`, cinza, volta para o mesmo nível em 2026-09-02, dentro desse intervalo.
- **Evidência medida nos PNGs em 2x, igual nos dois temas** (linha y=578, nível de diagnóstico): o primeiro anel tem centro em x=1050 e o segundo em x=1184; o traço azul de 3 px ocupa de x=1063 a 1171 e de x=1197 a 1260, isto é dos dois lados do segundo anel. Os dois anéis são idênticos (miolo do cartão, contorno `--text-primary` de 2 px). O que separa o segundo anel da linha azul é só a descida cinza de 1,5 px que chega nele por cima (coluna x=1184, `#7f8fab` no escuro e `#5c6b87` no claro), enquanto a descida do primeiro é azul (coluna x=1051).
- **O que o desenho afirma:** dois anéis sobre a mesma linha azul leem como "a mais lenta voltou duas vezes, em 24/08 e em 02/09". A linha de leitura diz "2 de 10 voltaram de etapa" e a legenda só diz "retorno de etapa". Quem responde à pergunta do caso de uso, quais voltaram, sai com uma oportunidade onde o dado tem duas.
- **O que mudar:** o marcador precisa carregar de quem ele é.
  1. Desenhar o anel **sobre o trecho descendente da própria linha**, a meia altura entre o nível de saída e o de chegada, onde nenhum trecho horizontal de outra oportunidade passa (os horizontais só existem nos cinco níveis).
  2. Contorno do anel em `colorOf(track)`: `--chart-3` ou `--chart-1` quando a linha é uma das duas em destaque, `--text-muted` nas demais. Para isso `returns` precisa levar a oportunidade junto com o ponto.
  3. O rótulo da data acompanha o anel e obedece à regra do bloqueante 1.
- **Não mudar o dado para esconder o caso:** dois retornos para o mesmo nível em datas vizinhas é o caso difícil que a versão precisa continuar demonstrando.

### A alinhar na mesma rodada (observações da v4, também no README)

- Os horizontais se cobrem: a mais rápida some sob a mais lenta em qualificação de 06/07 a 09/07 (em y=658 o ciano vai de x=265 a 323 e o azul assume de x=325 a 533, quando a mais rápida só sai em x=369). Um deslocamento vertical de 2 px nas duas linhas em destaque resolve.
- Nenhuma oportunidade é nomeada no desenho parado; o rótulo de fim de linha comporta o nome.
- Os rótulos de fim de linha não têm marcador na cor da série (ROT-3), e `mais lenta, 92 dias` fica acima da chegada de duas linhas cinza.
- A grade desenha as duas bordas do domínio além das cinco etapas; `syncWithTicks` deixa só as cinco.

### Conferido e aprovado na v4, para não mexer

Contagens que conferem com o dado: 6 ganhas e 4 abertas, 28 dias da mais rápida e 92 da mais lenta, 2 de 10 com retorno; extremos medidos só entre as ganhas, declarado na nota; linhas diárias com `stepAfter`, que põem cada degrau no dia da mudança; tracejado `4 4` da última mudança até hoje, com "aberta até hoje" e a data por `formatDate` na legenda (EIX-10); `null` fora da vida da oportunidade, sem ligar lacuna; destaque em `--chart-1` e `--chart-3` com espessura de 3 contra 1,5 px e rótulo direto (TOK-9); neutro em `--text-muted`, 5,21:1 e 5,37:1 (ACE-6); peso 700 só nos dois rótulos de fim de linha (TIP-3); eixo Y com o nome das cinco etapas e eixo X em meses por `formatMonthShort`; margem direita de 68 px que segura `em aberto`; vazio com `role="status"`; frase acessível de 166 caracteres; `today` vindo do dado.

## v2_tempo-parado-em-destaque: aprovada

```
Versão: 20_cronograma-e-linha-do-tempo/04_jornada-por-entidade/v2_tempo-parado-em-destaque
Data: 2026-10-08
Resultado: aprovada
Não: nenhum
Correções:
  nenhuma
Não se aplica: 4 (barra de intervalo no tempo, sem zero), 6, 13 (sem linha de referência), 26, 27, 28, 29, 30
```

Sem bloqueante nas 32 perguntas. Conferido à mão: 5 de 12 oportunidades com etapa acima de 30 dias (58, 51, 42, 37 e 36 dias), a `Oportunidade 09` com exatos 30 dias fica fora, como manda o "passou de"; linhas ordenadas pela pior parada e depois pela criação; rótulos de 914 a no máximo 1178 em 2x, a 18 px da borda do corpo e a 9,5 px da ponta tracejada; hachura e rótulo em `--negative` (5,50:1 e 6,36:1), com forma e palavra além da cor (ACE-2); neutro em `--surface-sunken` com contorno `--text-muted` (5,21:1 e 5,37:1), que é quem carrega a marca; etapa não alcançada sem segmento nenhum, e não segmento zerado; ponta tracejada dentro do comprimento real da etapa aberta, terminando em hoje.

As observações da v2 estão no README. A que mais merece atenção de quem colar no Farol é a do `truncate`: a linha de leitura termina a 22,5 px da borda, e com `qualificação` como maior parada a reticência corta o nome da etapa.

## Defeitos de régua e de ferramenta notados

- **CONTRASTE-MARCA não mede o piso de degrau `--seq-*` quando a peça desenha três degraus ou mais.** Mediu as quatro versões e saiu sem aviso com `--seq-4` a 2,60:1 em 55 marcas do tema claro. Já anotado em 2026-10-05; continua aberto.
- **As tabelas 17.2 e 17.10 do contrato só citam `--seq-1` a `--seq-3` como abaixo do piso.** O produtor seguiu a tabela, começou a rampa no 4 e caiu no piso do tema claro, que só a TOK-8 registra. O dossiê do produtor herdou a frase.
- **O catálogo pede o que o contrato proíbe em dois pontos deste modelo:** rampa de `--seq-2` a `--seq-6` na v1, e quatro linhas de mediana rotuladas na v3 contra o teto de duas anotações da ANO-1.
- **O Marey em `stepAfter` sobre eixo numérico de etapa sobrepõe todos os horizontais por construção.** O catálogo pede essa forma; a identificação das linhas cinza fica impossível com qualquer dado de 10 oportunidades, e a das duas em destaque depende de deslocamento que o catálogo não menciona.
