# Parecer de revisão: 14_tabelas-visuais/08_tabela-com-linha-expansivel

Data: 2026-10-15. Revisor independente. Julgadas `v2` e `v3` por `revisao_desatualizada`: o
`Chart.tsx` das duas mudou em 2026-09-28 (trilho de `bg-surface-overlay` para `bg-surface-sunken`)
depois do aceite de 2026-09-19. Julgado o arquivo de hoje contra o contrato de hoje, que inclui as
emendas de 2026-09-28 (TIP-7, EST-1b) e de 2026-10-02 (EIX-6, REC-2). PNGs de 2026-10-02, posteriores
ao `Chart.tsx` das duas.

`npm run check` com tipos: 0 com erro, 4 avisos (`v2`: CONTRASTE-MARCA do `--line-strong` e EIXO-CALMO
nas linhas 148 e 155, dívida conhecida; `v3`: AGREGACAO-ZERO na linha 38).

Resultado: `v3` aprovada; `v2` reprovada com quatro bloqueantes.

## Resumo para o corretor

* `v2`, bloqueante 1: o nome do quarto motivo sai cortado por reticência. Perguntas 10, 15 e 27;
  TIP-7, GEO-2, ROT-10.
* `v2`, bloqueante 2: os tiques de moeda do eixo Y saem em duas linhas. Pergunta 15; EIX-6 com REC-2,
  e EIX-4 no conserto.
* `v2`, bloqueante 3: os ramos de ausência escrevem número ou travessão. Pergunta 8; EST-1b, EST-2,
  EST-1.
* `v2`, bloqueante 4: o empate de Renan A. vira um motivo principal só. Pergunta 11; COR-2 e seção
  14.1 (papel de cor).

Tudo se resolve no `Chart.tsx`. O `data.ts` fica como está: o nome longo e o empate são o caso
difícil que a versão precisa mostrar certo.

## v2_executivo-com-serie-e-motivos

```
Versão: 14_tabelas-visuais/08_tabela-com-linha-expansivel/v2_executivo-com-serie-e-motivos
Data: 2026-10-15
Resultado: reprovada
Não: 8, 10, 11, 15, 27
Correções:
  8. EST-1b, EST-2: total zero e série vazia escrevem a ausência pelo nome, nunca 0% nem travessão.
  10. TIP-7: nome do motivo inteiro, quebrando por palavra em até duas linhas, sem truncate.
  11. COR-2: destaque e "motivo principal" só para máximo único; no empate, nomear os empatados.
  15. EIX-6, REC-2: cada tique do eixo Y em uma linha, com ticks redondos calculados (EIX-4).
  27. ROT-10: toda parte da composição de motivos com nome inteiro e número na tela.
Não se aplica: 13, 18, 26, 28, 29, 30, 31, 32
```

### Bloqueante 1. Perguntas 10, 15 e 27; TIP-7, GEO-2, ROT-10; seção 14.1 (identificação das marcas)

**Evidência.** `Chart.tsx:178`: o rótulo do motivo tem `w-40 shrink-0 truncate`. Nos dois PNGs o
quarto motivo de Talita V. sai "Projeto cancelado internam…"; o nome inteiro, "Projeto cancelado
internamente", não aparece em lugar nenhum da tela nem da frase acessível (213 caracteres, nenhum
motivo citado). O `.diff.png` dos dois temas acusa diferença justamente nas últimas letras do rótulo
cortado: página e `preview.svg` não cortam no mesmo lugar.

**Por que bloqueia.** A barra de motivo é marca desenhada e o nome é a identificação dela. A TIP-7
(emenda de 2026-09-28, posterior ao aceite antigo) proíbe reticência em nome de marca; e a composição
de motivos soma 100, então a ROT-10 pede nome e número legíveis em toda parte, sem interação.

**O que mudar.** Tirar `truncate` e a largura fixa do nome; deixar quebrar por palavra inteira em até
duas linhas (saída da GEO-2), com o percentual alinhado à direita. Critério de aceite nos dois PNGs:
"Projeto cancelado internamente" inteiro, sem invadir a coluna de percentual.

### Bloqueante 2. Pergunta 15; EIX-6 com REC-2, EIX-4; seção 14.1 (constante com consequência no render)

**Evidência medida no `preview.svg`.** O `YAxis` tem `width={56}` (`Y_AXIS_WIDTH`, linha 23) e
`domain={[0, 'dataMax']}` sem `ticks` (linha 155). O Recharts desenha três tiques: `R$ 0` em um
`tspan`, e `R$ 140` sobre `mil` e `R$ 272` sobre `mil`, cada um em dois `tspan`. Nos dois PNGs a
unidade fica sozinha na linha de baixo, e no tique do meio a linha de grade passa entre o número e a
unidade. O topo do eixo é o próprio máximo (R$ 271,6 mil, escrito "R$ 272 mil"), e o passo sai
irregular: 140 mil e depois 131,6 mil.

**Por que bloqueia.** A emenda da EIX-6 de 2026-10-02 diz que tique quebrado não tem guarda e quem
cobra é a revisão; a saída da REC-2 é mudar largura ou unidade, "nunca o número de linhas". Mesmo
critério aplicado em `08_combinados-e-eixo-duplo/06` em 2026-10-02.

**O que mudar.**
1. Calcular `domain` e `ticks` no componente, em intervalo redondo, terminando na primeira linha de
   grade acima do maior valor (EIX-4): para Talita V., 0, 100, 200 e 300 mil.
2. Largura de eixo que mantenha o tique mais longo numa linha. Pela tabela da EIX-6, `R$ 700 mil`
   pede 70 px, e `R$ 300 mil` está na mesma faixa. Ou alargar e declarar o desvio da faixa de 48 a
   64 na `notes` do `meta.json`, como as irmãs de `08/06`, ou trocar a unidade do rótulo (REC-2).
3. Na mesma mão, `axisLine={false}` e `tickMargin={8}` depois do espalhamento de `AXIS_PROPS` nos dois
   eixos (EIX-5, aviso da guarda EIXO-CALMO).
4. Conferir no `preview.svg`: um `tspan` por tique, nos dois temas.

### Bloqueante 3. Pergunta 8; EST-1b, EST-2, EST-1; seção 14.1 (ausência exibida como número)

**Evidência no código.**
* `Chart.tsx:27`: `if (total <= 0) return counts.map(() => 0);`. Executivo com a lista de motivos
  preenchida e todas as contagens em zero (lista fixa de motivos vinda de agrupamento; o tipo
  admite) recebe 0 em todo percentual. O `reduce` das linhas 57 a 60 fica no índice 0, e a linha
  fechada escreve o primeiro motivo da lista com "0% das perdas", nomeando como principal um motivo
  sem perda nenhuma. O painel escreve "0%" em toda linha e pinta de `--chart-1` uma barra de largura
  zero.
* `Chart.tsx:105`: `percentages[dominantIndex] ?? 0`, mesmo efeito.
* `Chart.tsx:127`: série vazia escreve `—` na receita, e não `formatUnavailable()` (EST-2); e o
  painel monta o `LineChart` com `data` vazia, com grade e eixo, em vez do bloco `role="status"`
  (EST-1).

**Por que bloqueia.** Percentual sem base é ausência, e a EST-1b manda `null`. Ramo de ausência que
vira número na tela bloqueia pela 14.1, como em `10_funil/06` (função de partes do mesmo formato). O
dado fixo não chega a esses ramos, e é para isso que a EST-1b existe: o defeito mora no ramo, não na
foto.

**O que mudar.** `shares` devolve `null` quando o total não é positivo; a linha fechada e o painel
escrevem "sem perdas no período", o texto que a versão já usa para lista vazia. Série vazia: a
ausência escrita pelo nome na célula (`formatUnavailable()` com `Unplug` quando a origem falhou, frase
de vazio quando o recorte não tem meses), e o bloco `role="status"` com `Filter` no lugar do
`LineChart`, separando vazio de indisponível como a `v4`. Conferir com render de bancada (Talita V.
com as quatro contagens em zero, e com a série vazia), sem gravar o `data.ts`.

### Bloqueante 4. Pergunta 11; COR-2; seção 14.1 (papel de cor do destaque)

**Evidência.** `data.ts:74-75`: Renan A. tem "Fora do momento de compra" e "Optou pelo concorrente"
com 6 perdas cada. O `reduce` de `Chart.tsx:57-60` fica com o primeiro máximo, e a linha fechada de
Renan A., visível nos dois PNGs, escreve só "Fora do momento de compra" e "40% das perdas" na coluna
"Motivo principal de perda". Aberto o painel, `--chart-1` e o peso iriam para uma de duas barras de
mesmo comprimento.

**Por que bloqueia.** O caso de uso é "o motivo de perda que mais pesa", e para Renan A. a resposta
impressa deixa de fora um motivo com o mesmo peso; o destaque por cor passa a afirmar uma dominância
que o dado não tem. O empate é o caso difícil que o `data.ts` traz, e a versão o resolve pela ordem
da lista.

**O que mudar.** Destaque só para máximo único. No empate, a linha fechada nomeia os empatados ("Fora
do momento de compra e Optou pelo concorrente, 40% cada") e o painel não pinta nenhum de `--chart-1`,
ou pinta todos os empatados com o mesmo peso. Se a frase acessível passar a citar o motivo, segue a
mesma regra.

### Para aproveitar a mesma rodada (não bloqueante, detalhado no README)

* Peso do motivo dominante: catálogo e `meta.json` dizem 700, o código aplica `font-semibold` (600);
  alinhar o código ao catálogo (a TIP-3 permite dois elementos em 700).
* Frase acessível sem conclusão (ACE-1); total de perdas por executivo em lugar nenhum (DAD-1, DAD-7).
* "Receita do mês" sem dizer o mês; o último mês (ago/26) sem tique no eixo X com `interval={2}`.
* Margem do `LineChart` fora das constantes do topo (ESP-3); tiques e "% das perdas" sem algarismo
  tabular (TIP-1).
* O render de 2026-10-02 mediu mais de 0,5% entre página e `preview.svg` nos dois temas (pergunta
  21); parte é o `ChevronRight` sem giro (ferramenta, já registrado no README) e parte é o rótulo
  cortado, que sai com o bloqueante 1. Conferir que a medida volta a 0,5% ou menos.

### O que não mudar

O painel montado só com a linha aberta, `aria-expanded` e `aria-controls`; o maior resto que fecha
100 (50, 22, 17 e 11, conferidos à mão); o domínio Y a partir do zero; a linha em `--chart-1`, com
10,09:1 no escuro e 5,69:1 no claro contra o fundo do painel; o vazio da tabela com `role="status"` e
`Filter`; os pares de texto, todos acima de 5,09:1 nos dois temas.

## v3_filas-com-mapa-de-entradas

```
Versão: 14_tabelas-visuais/08_tabela-com-linha-expansivel/v3_filas-com-mapa-de-entradas
Data: 2026-10-15
Resultado: aprovada
Não: nenhum
Correções:
  nenhuma
Não se aplica: 3, 6, 18, 26, 27, 28, 29, 30, 31, 32
```

Conferido: escala do mapa calculada sobre as quatro filas (EIX-9) e declarada na legenda dentro do
painel; os cinco degraus da TOK-2 (`--seq-1` a `--seq-3`, `--seq-6` e `--seq-7`) com número em toda
célula, medidos de 5,45:1 (`--accent-cyan-contrast` sobre `--seq-6`, claro) a 14,82:1; textos do
painel acima de 5,09:1; bullet de capacidade do zero a 130%, comum às quatro linhas, com o teto
marcado; SLA acima da meta com `AlertTriangle` e `--negative`; vazio com `role="status"` e `Filter`.
As observações (ramo de `min` e `max` da linha 38, frase sem conclusão, legenda sem unidade, teto sem
rótulo) estão no README.
