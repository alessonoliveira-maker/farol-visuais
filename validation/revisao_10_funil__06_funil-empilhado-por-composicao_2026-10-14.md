# Parecer de revisão: 10_funil/06_funil-empilhado-por-composicao

Data: 2026-10-14. Revisor independente. As quatro versões em `revisao_desatualizada`, julgadas pelo
arquivo de hoje (`Chart.tsx` de 2026-09-28) e pelos PNGs de 2026-10-02, mais novos, nos dois temas. A
nota antiga de 2026-09-19 não foi usada como base.

`npm run check -- 10_funil/06_funil-empilhado-por-composicao`, com tipos: 0 com erro, 4 avisos
(`AGREGACAO-ZERO` na `v2` e duas na `v4`, `CONTRASTE-MARCA` na `v4`), 0 escapes. Diferença entre
preview e página de 0,00% a 0,05% nos oito pares de PNG.

| Versão | Resultado | Não |
|---|---|---|
| `v1_origem-do-lead-ao-ganho-em-volume` | aprovada | nenhum |
| `v2_mix-em-100-com-indicacao-em-destaque` | reprovada | 8, 14, 20, 27, 30 |
| `v3_cauda-longa-de-campanhas-agrupada` | aprovada | nenhum |
| `v4_sem-origem-cai-ao-longo-do-funil` | reprovada | 8, 17, 19 |

Coordenadas em px do `preview.svg` (1x); "PNG" é o arquivo 2x de `_render/.qa/`. Contraste pela
fórmula da WCAG sobre as cores lidas no `preview.svg` e no `preview-claro.svg`, com a cor composta
arredondada por canal, como manda a convenção da tabela 17.10.

## O que foi medido e o que não foi

* **Refeito do `data.ts`:** totais por etapa (1.240, 318, 96, 41, 17 na base de origem; 540, 150, 46,
  20, 9 na de campanhas), aninhamento de cada categoria etapa a etapa, os percentuais do catálogo (6%
  e 41% de Indicação, 38% e 12% de Mídia social, 28% e 6% sem origem) e o maior resto de cada etapa.
* **Lido no código e não renderizado:** os ramos de etapa com zero lead da `v2` e da `v4`. O que se
  diz deles é conta sobre o código, que é determinístico.
* **Não medido pela ferramenta:** `OPACIDADE-MARCA` declarou `sem_opacidade_em_marca` na `v2`, que tem
  `fillOpacity` de 0,35 por expressão condicional; a conta foi feita à mão e está abaixo.
* **Ordem da dica:** o `ChartTooltip` não reordena o `payload`, e o Recharts 3.10 só aplica o
  `itemSorter="name"` no conteúdo padrão; a dica sai na ordem das `Bar`, que é a da pilha (DIC-4).

Pares de contraste da `v2`, cor a 0,35 composta contra o cartão, e opacidade mínima para 3:1:

| Token | Escuro a 0,35 | Claro a 0,35 | Mínimo no escuro | Mínimo no claro |
|---|---|---|---|---|
| `--chart-3` | 1,93 | 1,72 | 0,57 | 0,65 |
| `--chart-6` | 1,99 | 1,64 | 0,54 | 0,71 |
| `--chart-5` | 1,78 | 1,77 | 0,62 | 0,63 |
| `--chart-2` | 2,09 | 1,67 | 0,50 | 0,68 |
| `--chart-4` | 2,02 | 1,67 | 0,54 | 0,70 |

O `--chart-5` a 0,63 bate com o número que a ACE-5 cita para esse token.

---

## v2_mix-em-100-com-indicacao-em-destaque

```
Versão: 10_funil/06_funil-empilhado-por-composicao/v2_mix-em-100-com-indicacao-em-destaque
Data: 2026-10-14
Resultado: reprovada
Não: 8, 14, 20, 27, 30
Correções:
  30 e 20. ACE-5, ACE-3: levar as origens atenuadas e as amostras a 3:1 nos dois temas (opacidade de 0,71 ou mais).
  27 e 14. ROT-10, NUM-5, catálogo: escrever o percentual de cada origem em cada etapa, com a etapa identificada.
  8. EST-1b: etapa sem lead escreve ausência, nunca 1% por origem nem NaN%.
Não se aplica: 13, 26, 28, 29, 31, 32
```

### Bloqueante 1. Perguntas 30 e 20; ACE-5 e ACE-3; seção 14.1 (contraste)

**Evidência.** `Chart.tsx:191` pinta as cinco origens fora do destaque com `fillOpacity` de 0,35, e
`:224` repete a mesma opacidade na amostra da legenda. Composta contra o cartão, a marca mede de 1,78:1
a 2,09:1 no escuro e de 1,64:1 a 1,77:1 no claro (tabela acima), todas abaixo do piso de 3:1 da
WCAG 1.4.11 que a ACE-5 cobra da cor composta. A isenção da ACE-3 (valor escrito na marca ou junto
dela) não alcança: nenhuma das 20 partes atenuadas de Lead, Qualificado, Agenda e Proposta tem número
na tela, e as 5 do Ganho têm o número na legenda, a mais de 150 px da marca.

**Por que bloqueia.** Contraste está na lista da 14.1 que bloqueia sempre, e o acervo já decidiu assim
com opacidades parecidas (`05_areas/07` a 0,30, `09_dispersao-e-bolhas/01` com o mesmo 0,35 pedido
pelo catálogo).

**O que mudar.** `FADED_OPACITY` de 0,71 ou mais, o maior mínimo dos cinco tokens (o `--chart-6` no
claro), ou uma opacidade por token tirada da tabela; a amostra da legenda acompanha. O destaque de
Indicação fica com dois canais que não dependem da atenuação: o número escrito (bloqueante 2) e a
linha de leitura. Conferir nos dois PNGs que a pilha atenuada ainda se distingue da cor cheia.

### Bloqueante 2. Perguntas 27 e 14; ROT-10, NUM-5 e o catálogo; seção 14.1 (identificação das marcas)

**Evidência.**

* O catálogo e o `meta.json` dizem que a versão demonstra "Percentuais de cada etapa somam 100 pelo
  maior resto (NUM-2)". `Chart.tsx:125` calcula `percentSharesOf` só para a última etapa, e as linhas
  228 a 231 imprimem esses percentuais e contagens. Os de Lead, Qualificado, Agenda e Proposta não
  existem em lugar nenhum: nem na tela, nem na dica, que escreve contagem (`valueFormat="int"`). O
  único é o 6,0% de Indicação em Lead, pela linha de leitura.
* A legenda não diz de que etapa são os números. Ela ocupa de y 152 a 324 e a primeira linha,
  "Indicação 41% 7", tem o centro perto de y 160, à altura da barra de Lead (centro em 156,2), onde
  Indicação é 6%. "Busca paga 17%" lido contra Lead (11%) vira divergência que o dado não tem.
* A ROT-10 lista a barra 100% e pede nome e número de cada parte sem interação; 27 das 35 partes
  ficam só com o nome.

**O que mudar.** Pôr na tela os sete percentuais de cada etapa, pelo maior resto, com a etapa
identificada. Pelo dado padrão: Lead 6, 38, 11, 7, 7, 3, 28; Qualificado 15, 31, 13, 9, 6, 4, 22;
Agenda 24, 25, 15, 9, 6, 4, 17; Proposta 32, 19, 17, 10, 5, 5, 12; Ganho 41, 12, 17, 12, 6, 6, 6. Um
arranjo que cabe no `largo`: a legenda de nomes sobe para uma linha acima do gráfico, como na `v1`
(perto de 660 px), e à direita de cada barra, depois de "N leads", vai uma grade de sete colunas
alinhada com a barra, com a amostra de cor no cabeçalho de cada coluna, na ordem da pilha (perto de
28 px por coluna a 11 px). O produtor escolhe o arranjo; o que precisa ser verdade é a soma de 100 em
cada etapa impressa e a etapa dita pela linha ou por cabeçalho.

### Bloqueante 3. Pergunta 8; EST-1b e DAD-6; seção 14.1 (ausência exibida como número)

**Evidência no código.** `Chart.tsx:81`: `exact = total > 0 ? ... : 0`. Com a última etapa em zero
lead (mês sem ganho, o caso comum num recorte parcial), os sete pisos dão 0, sobram 100 pontos, e o
laço das linhas 86 a 90 dá 1 ponto a cada uma das sete partes antes de acabar a lista: a legenda
escreve "1%" em todas, somando 7, com contagem 0. A frase acessível da linha 131 divide 0 por 0 e
lê "sobe de 6% para NaN%". A guarda acusou a linha 81 como limite de desenho e pediu para conferir
se o zero chega a texto: chega, pela coluna de percentual da legenda.

**Por que bloqueia.** Percentual de etapa sem base é ausência, e a EST-1b manda `null`. Ramo de
ausência que vira número na tela bloqueia pela 14.1, como em `15_mapa-de-calor-e-calendario/02` e
`08_combinados-e-eixo-duplo/02`.

**O que mudar.** `percentSharesOf` devolve `null` quando o total é zero; a coluna de percentual
escreve `formatUnavailable()` (ou "sem lead nesta etapa") e a frase acessível diz a ausência pelo
nome. A barra de uma etapa sem lead não se desenha a 100%. Conferir com um render de bancada com o
Ganho zerado, sem gravar o `data.ts`.

---

## v4_sem-origem-cai-ao-longo-do-funil

```
Versão: 10_funil/06_funil-empilhado-por-composicao/v4_sem-origem-cai-ao-longo-do-funil
Data: 2026-10-14
Resultado: reprovada
Não: 8, 17, 19
Correções:
  19 e 17. ACE-1, ANO-5: tirar do dado a direção da frase e a conclusão da linha de leitura.
  8. EST-1b: cobertura e lacuna de etapa sem lead saem como ausência, nunca 0%.
Não se aplica: 13, 26, 28, 29, 30, 31, 32
```

### Bloqueante 1. Perguntas 19 e 17; ACE-1 e ANO-5; seção 14.1 (o que o desenho afirma)

**Evidência no dado padrão.** A frase acessível gravada no `preview.svg` abre com "Barras horizontais
empilhadas com a queda de cobertura de origem em 5 etapas" e termina com "a cobertura de origem sobe
de 72% para 94%". A cobertura sobe; quem cai é a lacuna. Quem usa leitor de tela ouve as duas
direções na mesma frase, e a primeira é falsa.

**Evidência no código.** `Chart.tsx:92` a `94`: "queda", "cai" e "sobe" são literais, não saem da
comparação entre a primeira e a última etapa. `:97` e `:98`: a linha de leitura inteira é texto fixo,
"Quem avança tende a ter cadastro mais completo: o mix do fundo não é comparável ao do topo", sem
número e sem consulta ao dado. Com a lacuna crescendo para o fundo, ou parada, as duas frases
afirmam o contrário do cartão.

**Por que bloqueia.** A ANO-5 pede linha de leitura calculada do dado, com a conclusão, e a pergunta
17 repete. Esta versão existe para dar o aviso de viés, e o aviso é a parte não calculada; é o caso
de `09_dispersao-e-bolhas/07/v3`, reprovada hoje com o dado padrão certo. A frase falsa no próprio
preview pesa como em `22_unidades-waffle-e-pictograma/05/v2`.

**O que mudar.**

1. A frase acessível começa pelo tipo sem afirmar direção ("com a cobertura de origem em 5 etapas")
   e escolhe "sobe", "cai" ou "fica em" pela comparação de `coverageOf(first)` com `coverageOf(last)`.
2. A linha de leitura sai do mesmo cálculo, com os números: "Cobertura de origem sobe de 72% para
   94%: o mix do fundo não se compara ao do topo" (perto de 84 caracteres, que cabem nos 574 px do
   `card` a 12 px). Com a cobertura parada no mesmo percentual inteiro, dizer que o mix se compara.
3. Sem `truncate`: a cauda da linha carrega a conclusão, e a TIP-7 não admite reticência ali.

### Bloqueante 2. Pergunta 8; EST-1b e DAD-6; seção 14.1 (ausência exibida como zero)

**Evidência no código.** `Chart.tsx:61`: `coverageOf` devolve `0` quando a etapa não tem lead, e a
linha 109 escreve esse valor embaixo do nome da etapa como "0% com origem". `:120`: `share` faz o
mesmo, e a linha 127 escreve "0% sem origem" na ponta. Uma etapa sem lead (mês sem ganho) sai com
"0% com origem" e "0% sem origem", duas partes que somam 0 e não 100, e a frase da linha 94 leria
"sobe de 72% para 0%". A guarda tratou a linha 61 como limite de desenho; ela chega a texto pelo
`renderStageTick`.

**Por que bloqueia.** Cobertura de etapa sem lead não é zero, é ausência (EST-1b). Mesmo critério do
bloqueante 3 da `v2`.

**O que mudar.** `coverageOf` e a parte da lacuna devolvem `number | null`; no `null`, a etapa
escreve `formatUnavailable()` ou "sem lead nesta etapa" no lugar dos dois percentuais, o total
continua "0" (zero medido, EST-3) e a frase acessível e a linha de leitura do bloqueante 1 tratam o
nulo pelo nome. Conferir com um render de bancada com o Ganho zerado, sem gravar o `data.ts`.

---

## Correções da mesma rodada, sem peso de bloqueio

As duas versões voltam de qualquer jeito, e estes pontos custam pouco na mesma passada. Estão também
nas observações do README.

* `v4`, DAD-10: a dica não traz o valor de cada origem, porque são só duas `Bar` (com origem somada e
  sem origem). O comentário do topo (linhas 17 a 19 e 38 a 40), o `notes` do `meta.json` e o README
  dizem que traz. A saída da DAD-10: quando o rótulo não existe, quem muda é o texto; ou a dica passa
  a listar as seis origens.
* `v4`, NUM-6: a palavra leads não aparece no cartão; escrever `1.240 leads` na ponta.
* `v4`, NUM-2: escrever a cobertura como 100 menos o percentual impresso da lacuna, para o par nunca
  somar 101 num meio ponto exato.
* `v2`, TIP-1: `tabular-nums` na coluna de contagem da legenda e nos números da linha de leitura.
* `v4`, TIP-3: cinco totais em 700, e a regra admite dois elementos; 600 resolve.

## v1 e v3, aprovadas

* `v1_origem-do-lead-ao-ganho-em-volume`. Totais de 1.240, 318, 96, 41 e 17 conferidos; cada origem
  cai etapa a etapa; cor por chave nos slots 1, 3, 6, 5, 2 e 4; lacuna em contorno `--text-muted` no
  fim da pilha e fora do teto de seis; legenda na ordem da pilha; total na ponta livre, sem corte;
  vazio com `role="status"`; frase acessível de 191 caracteres com o líder da entrada e do ganho.
  Não se aplica: 13, 17 (sem linha de leitura), 26 a 32. A pergunta 27 foi lida como não se aplica:
  a pilha é em volume, fora da lista da ROT-10.
* `v3_cauda-longa-de-campanhas-agrupada`. 540 leads, 418 nas cinco nomeadas, 32 na cauda de nove e 90
  sem campanha; o agrupamento sai do volume da entrada; cauda e lacuna nunca somadas; seis cores mais
  o contorno da lacuna; dica com a lista da cauda; linha de leitura calculada (7 de 9 no ganho).
  Não se aplica: 13, 26 a 32, e a 27 pelo mesmo motivo da `v1`.

As observações das duas (peso 700 nos totais, amostra redonda, COR-5 sem vão, contagem sem
substantivo na ponta, cor por posto na `v3`) estão no README do modelo.

## Ferramenta

* `OPACIDADE-MARCA` declarou `sem_opacidade_em_marca` na `v2`, que tem `fillOpacity={key ===
  highlightKey ? 1 : FADED_OPACITY}`: o leitor não resolve opacidade por expressão condicional e
  cala em vez de dizer "não medida". É o mesmo silêncio registrado em `06_pizza/01` hoje.
* `AGREGACAO-ZERO` rotulou a linha 61 da `v4` e a 81 da `v2` como "limite de desenho"; nas duas o
  zero chega a texto. A regra de classificação não segue o valor até o JSX.

---

## Segunda passada, 2026-10-14, depois da rodada única de correção

Motivo: `v2` e `v4` reprovadas acima e corrigidas hoje (`Chart.tsx` da `v4` às 13:00 e da `v2` às 13:01,
`meta.json` da `v4` às 12:59). Foi julgado o arquivo de hoje, não a nota antiga. O corretor declarou que não rodou
o render de bancada com o Ganho zerado que este parecer pediu; esta passada rodou.

`npm run check -- 10_funil/06_funil-empilhado-por-composicao`, com tipos: 0 com erro, 2 avisos, ambos na
`v4` (`AGREGACAO-ZERO` pedindo para tirar a versão da fila de dívida, porque não acusa mais nada, e
`CONTRASTE-MARCA` do `--line-strong`), 0 escapes. Render refeito das duas: previews idênticos byte a
byte aos do corretor, diferença entre preview e página de 0,02% na `v2` e de 0,00% e 0,01% na `v4`.

| Versão | Resultado | Não |
|---|---|---|
| `v2_mix-em-100-com-indicacao-em-destaque` | reprovada | 8, 27 |
| `v4_sem-origem-cai-ao-longo-do-funil` | reprovada | 8, 25 |

### Como a bancada foi feita

Cópia das duas versões em `_render/exemplos/10_funil/99_bancada-revisor/`, só com o `data.ts` da cópia
alterado, render nos dois temas e cópia apagada em seguida, com os PNGs dela. Nenhum arquivo do
modelo foi tocado. Dois casos por versão:

* **Ganho zerado:** as sete contagens do Ganho em 0.
* **Ganho sem lacuna:** só `noOrigin` do Ganho de 1 para 0, o resto igual (16 ganhos, todos com
  origem). É o caso que a própria `v4` narra: a lacuna cai do topo ao fundo, e chegar a zero no Ganho
  é o fim natural dessa queda.

A causa, nas duas versões, é a armadilha `REC-11`: o total e o que vai à direita da barra moram no
`LabelList` da `Bar` da lacuna (`noOrigin`), e essa `Bar` não declara `shape`. O Recharts 3.10.1 descarta
o retângulo de largura zero antes de numerar o `LabelList` (`node_modules/recharts/lib/cartesian/Bar.js:676`,
`!hasCustomShape && (width === 0 || height === 0)`), então o `content` não é chamado para a etapa em
que a lacuna é zero. O ramo de ausência que o corretor escreveu existe no código e não é alcançado.

---

### v2_mix-em-100-com-indicacao-em-destaque: reprovada

```
Versão: 10_funil/06_funil-empilhado-por-composicao/v2_mix-em-100-com-indicacao-em-destaque
Data: 2026-10-14
Resultado: reprovada
Não: 8, 27
Correções:
  8 e 27. EST-2, EST-3, ROT-10, armadilha REC-11: total e colunas da etapa não podem depender de a lacuna ter largura.
Não se aplica: 13, 26, 28, 29, 31, 32
```

**O que a correção resolveu, conferido.**

* ACE-5: `FADED_OPACITY` de 0,72. Medido sobre as cores do `preview.svg` e do `preview-claro.svg`,
  composta contra o cartão e arredondada por canal: escuro de 3,65:1 (`--chart-5`) a 4,90:1, claro de
  3,07:1 (`--chart-6`) a 3,62:1. A amostra da legenda usa a mesma opacidade em `<span>` sem texto
  (ACE-4), e as sete amostras do cabeçalho das colunas também.
* ROT-10 e NUM-2 no dado padrão: os 35 percentuais estão na tela, nas colunas à direita, na ordem da
  pilha e da legenda, e cada etapa soma 100 (Lead 6, 38, 11, 7, 7, 3, 28; Qualificado 15, 31, 13, 9, 6,
  4, 22; Agenda 24, 25, 15, 9, 6, 4, 17; Proposta 32, 19, 17, 10, 5, 5, 12; Ganho 41, 12, 17, 12, 6, 6, 6).
  A etapa de cada número é a linha da barra; a amostra no cabeçalho liga a coluna à legenda de nomes.
* `percentSharesOf` devolve `null` com total zero; a frase acessível e a linha de leitura tratam o
  nulo pelo nome (na bancada: "evolui para indisponível nos ganhos").
* Frase acessível de 210 caracteres, começando pelo tipo; `tabular-nums` nas colunas e na linha de
  leitura; amostra com raio de 2 px; destaque com cor cheia e coluna em 600 e `--text-primary`.

**Bloqueante. Perguntas 8 e 27; EST-2, EST-3, ROT-10; seção 14.1 (ausência e identificação das
marcas).**

*Evidência, Ganho zerado (bancada, PNG escuro).* A linha do Ganho sai em branco: o nome da etapa no
eixo e mais nada. Não há "0 leads", não há "sem lead nesta etapa", as sete colunas ficam vazias. O
ramo das linhas 201 a 205 nunca roda, pelo `REC-11` acima. A EST-2 diz "nunca zero, nunca barra
zerada" e manda escrever a ausência no lugar do número; o bloqueante 3 da primeira passada pedia
exatamente isso na coluna de percentual, e o que saiu é a barra zerada sem texto.

*Evidência, Ganho sem lacuna (bancada, PNG escuro).* O Ganho tem 16 leads e barra cheia até 100%, mas
perde o total e os sete percentuais (seriam 44, 13, 19, 12, 6, 6 e 0 pelo maior resto), inclusive o de Indicação, que é
o número que a versão existe para mostrar. São sete partes de um todo sem número na tela (ROT-10), e o
zero medido da lacuna não é escrito (EST-3). Num recorte sem nenhum lead sem origem, como num CRM com
origem obrigatória, as cinco etapas perdem total e colunas, e o cabeçalho de amostras some junto,
porque ele é desenhado pelo rótulo de índice 0.

*Por que bloqueia.* A ausência que vira barra zerada sem texto é a mesma classe do bloqueante 3 da
primeira passada, que a correção declarou resolvido sem conferir; e o caso sem lacuna apaga os números
de uma etapa com dado real, num recorte plausível para a mesma base (1 ganho sem origem em 17). O
texto do `Chart.tsx` (linha 23) e o item da `v2` em Versões, no README, afirmam o que o render não faz.

**O que mudar.**

1. Pendurar o total e as sete colunas em algo que exista em toda etapa, com ou sem lacuna. Dois
   caminhos, o produtor escolhe: a saída da `REC-11`, `shape` própria na `Bar` da lacuna que não
   desenha nada com largura zero, para o `LabelList` receber a linha; ou um eixo de categoria à
   direita com `tick` próprio, como o eixo da esquerda da `v4`, que na bancada escreveu "sem lead nesta
   etapa" no Ganho zerado.
2. Ancorar o total e as colunas na borda direita da área do gráfico (o x do 100%), não em
   `x + width`: com `stackOffset="expand"` a etapa vazia fica em [0, 0], e o texto cairia no x do 0%,
   dentro do desenho e fora das colunas. O `LabelList` entrega `parentViewBox`, que tem essa borda.
3. Etapa sem lead: "0 leads" no lugar do total (zero medido, EST-3) e "sem lead nesta etapa", ou
   `formatUnavailable()`, no lugar das sete colunas, sem barra.
4. O cabeçalho de amostras não pode depender do rótulo de índice 0.
5. Atualizar o item 4 da Anatomia do README, que manda pôr o total "no último segmento, que é
   sempre a lacuna".
6. Conferir com render de bancada em três casos, sem gravar o `data.ts`: Ganho zerado; Ganho com
   `noOrigin` 0; e `noOrigin` 0 em todas as etapas.

---

### v4_sem-origem-cai-ao-longo-do-funil: reprovada

```
Versão: 10_funil/06_funil-empilhado-por-composicao/v4_sem-origem-cai-ao-longo-do-funil
Data: 2026-10-14
Resultado: reprovada
Não: 8, 25
Correções:
  8 e 25. EST-3, ROT-2, armadilha REC-11: o total da etapa não pode sumir quando a lacuna dela é zero.
Não se aplica: 13, 26, 28, 29, 30, 31, 32
```

**O que a correção resolveu, conferido.**

* ACE-1 e ANO-5: a frase acessível (178 caracteres) começa pelo tipo sem afirmar direção, e o verbo da
  frase e da linha de leitura sai da comparação da cobertura da primeira com a última etapa (sobe,
  cai ou fica). No dado padrão: "Cobertura de origem sobe de 72% para 94%: o mix do fundo não se
  compara ao do topo". Sem `truncate`.
* EST-1b: `gapPercentOf` e `coveragePercentOf` devolvem `number | null`. Na bancada com o Ganho
  zerado, o eixo da esquerda escreve "Ganho / sem lead nesta etapa" e a linha de leitura diz
  "Cobertura de origem: indisponível em etapa sem lead"; nenhum 0% aparece.
* NUM-2: cobertura como 100 menos a lacuna impressa; os cinco pares somam 100 (72 e 28, 78 e 22, 83 e
  17, 88 e 12, 94 e 6). NUM-6: "1.240 leads" na ponta. TIP-3: totais em 600. DAD-10: comentário do
  topo, `notes` e README dizem que a dica traz as duas partes da pilha, e é o que ela traz.

**Bloqueante. Perguntas 8 e 25; EST-3, ROT-2, "volume junto da taxa"; seção 14.1 (identificação
das marcas e zero medido).**

*Evidência, Ganho sem lacuna (bancada, PNG escuro).* Com os 16 ganhos todos com origem, a ponta do
Ganho perde as duas linhas: "16 leads" e "0% sem origem" não são escritos. Fica "100% com origem"
embaixo do nome e uma barra de cerca de 5 px (16 de 1.240 em 364 px), sem eixo de valor (`XAxis hide`), então o volume da etapa não
está em lugar nenhum do cartão. É a taxa sem a base, justamente onde a versão avisa que a base pesa:
100% de 16 e 100% de 1 são leituras diferentes. E é o caso que o título narra, a lacuna caindo até
zero no fundo.

*Evidência, Ganho zerado (bancada).* A ausência está escrita pelo eixo da esquerda, que é o que o
bloqueante 2 da primeira passada pedia em substância; mas o "0 leads" que ele também pedia na ponta
("o total continua 0, zero medido, EST-3") não sai, pela mesma causa.

*Por que bloqueia.* A ROT-2 tira o eixo de valor porque o valor está escrito na ponta; sem a ponta, a
barra do fundo fica sem número e sem régua. O zero medido da lacuna apaga o rótulo da etapa inteira
(`REC-11`), e a taxa de cobertura fica sem o volume, o que o "O que NÃO mudar" do Farol veda.

**O que mudar.**

1. A saída da `REC-11`: `shape` própria na `Bar` da lacuna, que desenha o contorno quando há largura e
   nada quando ela é zero, para o `renderTail` rodar em toda etapa. Na etapa sem lacuna, "16 leads" e
   "0% sem origem"; na etapa vazia, "0 leads", e a segunda linha pode sair, porque o eixo da esquerda
   já diz "sem lead nesta etapa".
2. Conferir com render de bancada nos dois casos, sem gravar o `data.ts`: Ganho com `noOrigin` 0 e
   Ganho zerado.

**Da mesma rodada, sem peso de bloqueio:** tirar a chave `AGREGACAO-ZERO` da `v4` em
`_render/scripts/lib/divida-guardas.json`, como o `check` pede; `tabular-nums` em "NN% sem origem" e
na linha de leitura (TIP-1).

### Ferramenta, segunda passada

* `OPACIDADE-MARCA` segue dizendo `sem_opacidade_em_marca` na `v2`, que tem `fillOpacity` de 0,72 por
  expressão condicional; a medida acima foi à mão.
* Não há render de bancada na ferramenta: para julgar um ramo fora do dado padrão foi preciso copiar a
  versão para `_render/exemplos/` e apagar depois.
