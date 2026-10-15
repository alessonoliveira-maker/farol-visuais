# Revisão de 09_dispersao-e-bolhas/01_dispersao-simples, 2026-10-14

Versões julgadas: `v2_extremos-rotulados-com-destaque`, `v3_origens-com-envoltoria` e `v4_tempo-de-contato-em-escala-log`, todas `sem_revisao`. A `v1` já estava aprovada desde 2026-09-19 e não foi julgada de novo.

`npm run check -- 09_dispersao-e-bolhas/01_dispersao-simples`: 0 com erro, 10 avisos (EIXO-CALMO em fila de dívida nas quatro versões, FRASE-ACESSIVEL perto do teto na `v3` e na `v4`). PNGs de 2026-10-02, mais novos que os `Chart.tsx` de 2026-09-28.

Resultado: `v3` aprovada; `v2` reprovada por um bloqueante; `v4` reprovada por dois. Observações não bloqueantes foram para o README do modelo.

**Segunda passada, no mesmo dia, depois da rodada de correção:** `v2` aprovada; `v4` reprovada de novo por um bloqueante que a primeira passada não viu. O parecer dela está na seção final deste arquivo, "Segunda passada".

## Resumo para o corretor

* **`v2`, cor semântica pintando posição no ranking.** Pergunta 11; tabela 17.2 e COR-6; seção 14.1, papel de cor.
* **`v4`, ponto abaixo de 3:1 nos dois temas.** Pergunta 30; ACE-5; seção 14.1, contraste.
* **`v4`, a faixa do zero esconde 27 das 41 marcas.** Pergunta 3; EST-3; seção 14.1, encoding.

---

## v2_extremos-rotulados-com-destaque

```
Versão: 09_dispersao-e-bolhas/01_dispersao-simples/v2_extremos-rotulados-com-destaque
Data: 2026-10-14
Resultado: reprovada
Não: 11
Correções:
  11. 17.2 e COR-6: tirar `--positive` e `--negative` dos extremos e pintar os seis em `--chart-1`, um destaque só, ou ancorar o bom e o ruim numa base escrita.
Não se aplica: 6, 7, 13, 16 (conferida no código), 18 (dica conferida), 26, 27, 28, 29, 30, 32
```

### Bloqueante 1. Pergunta 11; tabela 17.2 e COR-6; seção 14.1 (papel de cor)

**Evidência.** `Chart.tsx:76-80` mapeia `alta: 'var(--positive)'` e `baixa: 'var(--negative)'`, e as linhas 296 a 298 desenham três `Scatter` com essas cores ("Menores win rate" e "Maiores win rate"). O papel de cada ponto sai da posição na lista ordenada (`Chart.tsx:227-231`: `index < quantos ? 'alta' : index >= medidos.length - quantos ? 'baixa' : 'meio'`). No preview, Murilo C., Talita V. e Renan A. saem verdes; Wagner C., Letícia G. e Sônia H. saem vermelhos, nos dois temas.

**Por que bloqueia.** A 17.2 dá ao papel semântico "o sentido do bom de uma variação; estado", com o limite "nunca pinta série; sempre acompanhado de sinal, ícone ou palavra". Aqui não há variação nem base: o verde e o vermelho dizem "bom" e "ruim" para quem está nas três primeiras ou nas três últimas posições do recorte. Nenhuma base está escrita (o win rate do time, 178 de 473, 37,6%, não aparece) e nenhum rótulo leva sinal, ícone ou palavra: o rótulo é só o nome. A pergunta 11 do checklist é literal: "um destaque só" e "semântica só em variação ou estado". E a 17.2 dá ao destaque o `--chart-1`, um por visual.

**A consequência é visível em outro recorte, não só no padrão.** Como o papel vem da posição, um recorte de dois executivos com 60% e 58% pinta o de 58% de vermelho (`quantos` vira 1). A cor afirma um estado ruim que o dado não tem. É o que a 14.1 chama de regra que decide o que o desenho afirma.

**O que mudar, em uma das duas formas.**

1. Pintar os seis extremos em `--chart-1` (o destaque da 17.2), mantendo o anel nos seis e o peso 700 nos dois extremos absolutos. A posição no eixo vertical já diz quem está em cima e quem está embaixo, e o rodapé já diz "3 maiores e 3 menores". A nuvem continua em `--text-muted`.
2. Se o bom e o ruim forem a mensagem, ancorar na base: `ReferenceLine` com o win rate do time e `ifOverflow="extendDomain"` (ANO-3), rótulo com nome e valor ("win rate do time 37,6%"), e a palavra ou o sinal no rótulo de cada extremo ("+24,3 p.p. contra o time"), com a base nomeada (NUM-4). O papel deixa de ser posição e vira estado contra uma base escrita.

### O resto da v2 confere

Nuvem em `--text-muted`, o neutro sem valor escrito da 17.2 (5,21:1 e 5,37:1). Destaque por cima da nuvem (REC-13), anel de 8,5 px como segundo canal (COR-2, ACE-2), peso 700 só nos dois extremos absolutos (TIP-3), rótulos com halo e sem colisão nos dois PNGs, nenhum halo encostando no anel. Win rate nasce do par `ganhas` sobre `oportunidades` (DAD-1); Dora W., sem oportunidade fechada, e Ivan Q., sem ticket, saem do plano e entram no rodapé (EST-1b, DAD-2). Eixos com domínio fixo terminando na primeira grade acima do maior valor (EIX-4), grade nos dois sentidos (EIX-3b), `ZAxis` com as duas pontas iguais (REC-15), dica por `ChartTooltip` com `formatRateWithVolume`. Frase acessível medida pela guarda, com quem lidera e quem fecha a lista.

---

## v4_tempo-de-contato-em-escala-log

```
Versão: 09_dispersao-e-bolhas/01_dispersao-simples/v4_tempo-de-contato-em-escala-log
Data: 2026-10-14
Resultado: reprovada
Não: 3, 30
Correções:
  30. ACE-5: levar o ponto a 3:1 nos dois temas, com fillOpacity de 0,66 ou mais ou com ponto opaco e contorno na cor da superfície.
  3. EST-3: a faixa do zero precisa mostrar a contagem de cada linha, e hoje desenha 14 das 41 marcas.
Não se aplica: 6, 7, 12 (série única, sem legenda), 13 (sem referência), 18 (dica conferida), 26, 27, 28, 29, 32
```

### Bloqueante 1. Pergunta 30; ACE-5; seção 14.1 (contraste)

**Evidência.** `Chart.tsx:55` declara `POINT_FILL_OPACITY = 0.35` e a linha 248 aplica sobre `var(--chart-1)`. Composta contra `--surface-raised`, com cada canal arredondado para inteiro (a convenção da 17.10):

| Pontos empilhados | Escuro | Claro |
|---|---|---|
| 1 (alfa 0,35) | 2,28:1 | 1,71:1 |
| 2 (alfa 0,58) | 4,01:1 | 2,56:1 |
| 3 (alfa 0,73) | 5,56:1 | 3,42:1 |

O ponto isolado fica abaixo de 3:1 nos **dois** temas, e no claro só a terceira camada passa. Não é marca de canto: os pontos isolados são a cauda à direita de 1 dia e as linhas de 6 a 9 tentativas, os 55 leads em que a linha de leitura apoia o "acima de 1 dia, 6". É a mesma inversão registrada em `09/03` em 2026-09-28: a marca isolada é a mais apagada, e o achado mora nela. No PNG claro essa cauda é a parte mais desbotada do plano.

**Por que a declaração não basta.** O `meta.json` e o README registram a tensão e seguem a especificação do catálogo. O dossiê manda o contrário: "se a especificação da versão e o contrato colidirem de fato, o contrato vence e o desvio se declara na nota do `meta.json`". O desvio a declarar é o da especificação (a opacidade de 0,35), não o do contrato.

**O que mudar.** Uma das saídas que a própria ACE-5 escreve:

1. `fillOpacity` de 0,66 ou mais, o mínimo que `medirOpacidadeMinima` calcula para `--chart-1` (o claro decide; 0,67 dá folga contra o arredondamento). A gradação de densidade encurta, e a variação de tinta deixa de ser o único sinal de massa; a linha de leitura com as medianas continua carregando a conclusão.
2. Ponto opaco em `--chart-1` com contorno de 0,5 a 1 px em `--surface-raised`, que separa vizinhos sem mexer no contraste do preenchimento. O argumento do README contra esta saída (1.697 traços num ponto de 2 px) vale medir antes de descartar: o contorno só é visível onde dois pontos se encostam, que é onde ele serve.

Na saída escolhida, atualizar a nota do `meta.json` e o item do README que hoje declara a tensão como aberta.

### Bloqueante 2. Pergunta 3; EST-3; seção 14.1 (encoding)

**Evidência.** `ZeroEdgeLayer`, `Chart.tsx:120-133`, posiciona cada marca em `x = base + (indice % ZERO_COLUMNS) * ZERO_COLUMN_GAP`, com `indice` contado sobre a lista **inteira** de zeros e `ZERO_COLUMNS = 4`. As marcas da mesma linha que passam de 4 caem em cima das anteriores. Medido no `preview.svg`: 41 retângulos de 2 por 6 px em **14 posições distintas**. Os 41 zeros do `data.ts` se dividem em 19 leads com 1 tentativa, 13 com 2, 7 com 3 e 2 com 4; o desenho mostra 4, 4, 4 e 2 marcas.

**Por que bloqueia.** O comentário da camada diz que as marcas vão "em coluna, porque 41 marcas na mesma altura viram uma só", isto é, uma marca por lead. Com o módulo, 27 delas desaparecem, e as linhas de 19, 13 e 7 leads ficam idênticas. O texto ao lado diz "41 em 0 min" e o olho conta 14. A distribuição por tentativa, que é o que a faixa existe para mostrar (o contato imediato concentrado em 1 tentativa reforça a conclusão do cartão), sai achatada. É constante de acabamento com consequência visível, e a 14.1 manda descrever pela consequência: marcas que somem e uma forma que sugere contagem que o dado não tem.

**O que mudar.** A EST-3 pede marca e número para o zero medido. Uma destas:

1. Uma marca por linha e a contagem escrita ao lado dela ("19", "13", "7", "2"), em 11 px, `font-display`, `--text-muted`, com halo onde cruzar a grade. O texto do topo pode virar "41 em 0 min, fora da escala, por tentativa".
2. Uma barra horizontal curta por linha, nascendo na borda esquerda da faixa, com comprimento proporcional à contagem da linha e o número escrito na ponta livre (ROT-2). A faixa tem 18 px úteis, então a escala cabe se o maior valor (19) ocupar a faixa inteira.

Contar os zeros por linha dentro da camada, e não pelo índice global, resolve a causa em qualquer das duas.

### O resto da v4 confere

Escala log com domínio positivo de 1 min a 7 dias e marcas em unidade humana (EIX-4, REC-21), aviso de escala escrito no rótulo do eixo, `padding` esquerdo reservando a faixa do zero e tracejado separando-a do plano, ausência de horário fora do plano e contada no rodapé (EIX-10, DAD-2), eixo vertical nomeado no rodapé, raio fixo pelo `ZAxis` (REC-15), medianas com `null` para lista vazia (EST-1b), estado vazio com `role="status"`. Texto do zero com `font-display` e halo, sem cobrir ponto nenhum. Os dois PNGs saem sem corte nem sobreposição de texto.

---

## Defeito de ferramenta notado

A OPACIDADE-MARCA não acusou a `v4`: ela conta o `Scatter` em `naoMedidos` como `marca_com_valor_escrito`. A causa está em `opacidade.mjs`, `temValorEscrito`: o sinal "irmão com texto na subárvore" encontra o `<Label>` filho do `<XAxis>`, irmão do `Scatter` dentro do `ScatterChart`, e aplica a isenção de "valor escrito ao lado" a uma nuvem que não escreve valor nenhum. O cabeçalho da função declara a leitura frouxa de propósito; fica registrado que, em `ScatterChart`, o rótulo de eixo basta para isentar qualquer marca.

---

# Segunda passada, 2026-10-14

Versões julgadas: `v2_extremos-rotulados-com-destaque` e `v4_tempo-de-contato-em-escala-log`, as duas `revisao_desatualizada` depois da rodada de correção. Julgados os arquivos de hoje, não as notas da primeira passada.

`npm run check -- 09_dispersao-e-bolhas/01_dispersao-simples`: 0 com erro, 10 avisos (EIXO-CALMO em fila de dívida nas quatro versões, FRASE-ACESSIVEL a 12 do teto na `v4`). PNGs das 10:26 e 10:27, mais novos que os `Chart.tsx` das 10:25 e 10:26.

Resultado: `v2` aprovada; `v4` reprovada por um bloqueante.

## v2_extremos-rotulados-com-destaque: aprovada

O bloqueante da primeira passada foi resolvido como pedido: `ROLE_COLOR` dá `--chart-1` aos seis extremos e `--text-muted` à nuvem. Conferido no preview: anel de 8,5 px e 1,5 px nos seis, peso 700 só em Murilo C. e Sônia H. (TIP-3), os outros quatro em 600, rótulos com halo e sem colisão nos dois temas, frase acessível de 226 caracteres. Observações no README.

## v4_tempo-de-contato-em-escala-log: reprovada

```
Versão: 09_dispersao-e-bolhas/01_dispersao-simples/v4_tempo-de-contato-em-escala-log
Data: 2026-10-14
Resultado: reprovada
Não: 1
Correções:
  1. REC-15 e REC-31 (14.1, versão que não demonstra o que o catálogo diz): fazer o raio de 2 px chegar ao desenho e reescrever o meta.json com o que a versão desenha.
Não se aplica: 6, 7, 12 (série única, sem legenda), 13 (sem referência), 26, 27, 28, 29, 32
```

Os dois bloqueantes da primeira passada estão resolvidos. Ponto em `--chart-1` a 0,7: composto contra o cartão, 5,30:1 no escuro e 3,25:1 no claro (pergunta 30). Faixa do zero com uma barra por linha e a contagem escrita, 19, 13, 7 e 2, que somam os 41 do texto (pergunta 3).

### Bloqueante 1. Pergunta 1; REC-15 e REC-31; seção 14.1 (versão que não demonstra o que o catálogo diz)

**Evidência no código.** `Chart.tsx:51-53` declara `POINT_RADIUS = 2` e `Z_RANGE = [π·2², π·2²]`, 12,57 px². A linha 252 aplica `<ZAxis range={[...Z_RANGE]} type="number" />`, sem `dataKey`.

**Evidência no desenho.** Nos dois previews, os 1.697 `path` do `Scatter` são `d="M4.514,0A4.514,4.514,…"`, com `width` e `height` de 9,027. O raio desenhado é 4,514 px, o padrão de 64 px² do Recharts (REC-31: "o padrão `range=[64,64]` dá exatamente 4,514 px de raio"). A área sai 5,1 vezes a declarada. No PNG, o ponto mede 9 px de diâmetro, não 4.

**Causa provável, pela leitura do pacote `recharts 3.10.1`.** `computeScatterPoints`, em `lib/cartesian/Scatter.js`, usa `zAxis ? zAxis.range : implicitZAxis.range`. O `zAxis` vem de `selectZAxisWithScale`, que devolve `undefined` quando a escala não existe. `combineConfiguredScale` devolve `undefined` quando o eixo não tem domínio, e um `ZAxis` sem `dataKey`, num `ScatterChart` onde nada alimenta o domínio dele, não tem domínio. A mesma linha funciona em outras peças: em `09/02/v2` o ponto sai com 4 px, como declarado. Então a única prova vale para a peça em questão, e ela é o `preview.svg`.

**Onde a afirmação falsa mora.** São quatro lugares:

* `meta.json`, `demonstrates`: "Ponto de raio 2 com opacidade 0,35 para volume alto". O desenho tem raio de 4,514 px e opacidade de 0,7 (`fill-opacity:0.7` no preview).
* `meta.json`, `notes`: "A opacidade de 0,35 … fica abaixo do piso de 3:1 da ACE-5 … tensão aberta". Isso declara uma violação que o código não tem mais. E o desvio que existe de fato, 0,7 no lugar dos 0,35 da especificação, não está declarado. A primeira passada pediu essa atualização. O `meta.json` não foi tocado desde o commit `f64df69a`.
* `README.md`, linha 44: "ponto de raio 2 com opacidade 0,7".
* O comentário de `Chart.tsx:51`.

**Por que bloqueia.** O catálogo dá à `v4` cinco demonstrações. O ponto pequeno para volume alto é uma delas, e não acontece. O cartão dela afirma dois números, raio 2 e opacidade 0,35, que o desenho não tem. Quem copiar a peça para ter um ponto menor recebe 4,514 px qualquer que seja o `POINT_RADIUS`. A consequência aparece no PNG: entre 10 min e 6 h, nas linhas de 1 a 5 tentativas, as marcas se fundem em faixas contínuas de 9 px de altura. É constante com consequência visível, e é a peça de referência ensinando um mecanismo que não funciona.

**O que mudar.**

1. Fazer o raio de 2 px valer, de um destes dois jeitos:
   * `shape` própria no `Scatter`, desenhando `<circle cx={cx} cy={cy} r={POINT_RADIUS} />` com o mesmo `fill` e `fillOpacity`. Pela REC-31 a forma nunca recebe `r`, então a constante passa a ser o raio.
   * Dar domínio ao `ZAxis`: um campo numérico constante em cada ponto e `dataKey` apontando para ele, mantendo `range` com as duas pontas iguais.
2. Conferir no `preview.svg` que o arco lê `M2,0A2,2` (ou `r="2"`). Olhar no PNG claro se a cauda isolada, além de 1 dia e de 6 a 9 tentativas, continua visível. O contraste composto não muda com o tamanho e segue em 3,25:1.
3. Reescrever o `meta.json`:
   * `demonstrates`: "Ponto de raio 2 com opacidade 0,7 para volume alto".
   * `notes`: declarar o desvio da especificação pela ACE-5. O catálogo pede 0,35, que compõe 1,71:1 no claro; 0,7 compõe 3,25:1. Tirar a frase da tensão aberta.
4. Conferir que a linha 44 do README e o comentário da linha 51 dizem o que o preview mede.

### O resto da v4 confere

Escala log de 1 min a 7 dias, com marcas em unidade humana e o aviso escrito no rótulo do eixo. `padding` de 44 px reservando a faixa do zero, com o tracejado a 36 px. Ausência de horário fora do plano e contada no rodapé. Medianas com `null` para lista vazia. Estado vazio com `role="status"`. Dica por `ChartTooltip`. Nenhum corte nem sobreposição de texto nos dois PNGs. As observações novas, TIP-1 e NUM-6 nas contagens e a escala fixa da faixa do zero, foram para o README.

## Defeito de régua notado nesta passada

A saída da REC-15, `<ZAxis range={[n, n]} />`, não garante o raio num `ScatterChart`. Quando nada dá domínio ao eixo z, o `range` é ignorado sem aviso, e nenhuma guarda compara o raio desenhado com o declarado: a ESPESSURA-MARCA e a CONTRASTE-MARCA não medem preview com `transform`, e todo ponto do `Scatter` tem um. No acervo, saem com 4,514 px versões que declaram outro raio: `09/01/v3` (3,2) e `09/08/v3` (1,5), além desta. A REC-31 lista duas condições em que o `range` não chega, e esta seria a terceira.
