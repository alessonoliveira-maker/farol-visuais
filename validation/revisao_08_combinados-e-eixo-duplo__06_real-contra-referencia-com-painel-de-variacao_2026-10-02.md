# Parecer de revisão: 08_combinados-e-eixo-duplo/06_real-contra-referencia-com-painel-de-variacao

Data: 2026-10-02. Revisor independente. Julgadas as quatro versões pelo arquivo e pelos PNGs de hoje (render de 2026-10-02, 11:13, posterior ao `Chart.tsx` de todas). `npm run check` com tipos: 0 com erro, 1 aviso (`AGREGACAO-ZERO` em `v1`, `Chart.tsx:110`, que orienta e não reprova).

Resultado: `v2` e `v4` aprovadas; `v1` e `v3` reprovadas. Três bloqueantes no total, todos abaixo.

## O que motivou a revisão: tique quebrado e texto cortado, nas quatro versões e nos dois temas

Medido nos oito `preview.svg` (contagem de `tspan` por tique e posição contra a caixa de cada painel) e conferido nos oito PNGs.

| Versão | Eixo declarado | Tiques de moeda em duas linhas | Tiques declarados contra desenhados | Texto cortado pela borda |
|---|---|---|---|---|
| `v1` | 58 px (`Chart.tsx:32`) | 8 de 9, nos dois temas | principal 7 contra 6; variação 5 contra 3 | nenhum |
| `v2` | 84 px | nenhum | 5 de 5 e 5 de 5 | nenhum |
| `v3` | 84 px | nenhum | 5 de 5 nos três painéis | nenhum; o `−R$ 150 mil` do painel do meio tem linha de base em y=119,9 numa caixa de 124 px |
| `v4` | 84 px | nenhum | 4 de 4 e 5 de 5 | nenhum |

O conserto do corretor fechou a quebra e o corte na `v2`, na `v3` e na `v4`. A `v1` não tem eixo de 80 px, como dizia a nota que abriu esta revisão: o arquivo declara 58 px e o preview confirma (âncora do tique em x=50).

## v1_custo-realizado-contra-orcado: reprovada, um bloqueante

### Bloqueante 1. Pergunta 15, EIX-6 com REC-2 e REC-29 (seção 14.1: constante de acabamento com consequência no render, tique perdido)

**Evidência no código.** `Chart.tsx:32` declara `Y_AXIS_WIDTH = 58`. Nenhum dos dois `YAxis` (`Chart.tsx:312` e `341`) tem `interval={0}`, e a margem do painel principal tem `bottom: 0` (`Chart.tsx:31`) com o eixo de categoria escondido.

**Evidência medida, igual nos dois temas.**

1. Oito tiques de moeda saem em duas linhas: `R$ 100` a `R$ 600` sobre `mil` no painel principal (os seis desenhados) e `R$ 100` e `−R$ 100` sobre `mil` no de variação. Só o `R$ 0` da variação cabe em uma linha.
2. O painel principal declara sete tiques em `buildDomain` e desenha seis: o `R$ 0` da base das colunas não é escrito. O eixo começa a falar em `R$ 100 mil`.
3. O painel de variação declara cinco tiques em `buildSymmetricDomain` e desenha três: `R$ 50 mil` e `−R$ 50 mil` somem.

**Por que reprova agora.** A 14.1 nomeia tique perdido como consequência que bloqueia, e a emenda da EIX-6 de 2026-10-02 diz que tique quebrado não tem guarda e quem cobra é a revisão. As três irmãs foram corrigidas hoje pelo mesmo sintoma; a `v1` é a irmã que o dossiê manda copiar e tem o sintoma em todos os tiques de milhar. As notas antigas trataram isso como observação; o desenho de hoje foi julgado sem elas.

**O que mudar.**

1. Largura do eixo que mantenha `−R$ 100 mil` e `R$ 600 mil` em uma linha. O limiar medido na EIX-6 para o negativo de centenas de milhar é 81 px; as irmãs usam 84. Declarar a tensão com o teto de 64 px na nota do `meta.json`, como elas fazem.
2. `interval={0}` nos dois `YAxis` e margem inferior de 8 px no painel principal, para o `R$ 0` da base caber (é o que a `v2` faz em `MAIN_MARGIN`).
3. No painel de variação o plano tem 65 px. Com cinco tiques forçados o passo é de 16 px e o tique `R$ 50 mil` cai na altura do rótulo `+R$ 12,0 mil` de janeiro, que com o eixo de 84 px começa onde o tique termina. A saída da REC-29 é mudar o passo declarado: três tiques (`−R$ 100 mil`, `R$ 0`, `R$ 100 mil`) bastam, porque todo desvio já está escrito na coluna.
4. Refazer a conta da ESP-6: com 84 px o plano cai de 604 para 578 px, o passo para 48,17 px e o sólido central para 12,52 px, meio pixel acima do piso de 12. Se o render medir menos, alargar o canvas para 760 como a `v2`. Atualizar a nota do `meta.json`, o comentário do topo e a linha da `v1` no README.
5. Conferir no `preview.svg` e nos dois PNGs: uma linha por tique, sete tiques no principal, nenhum rótulo de variação encostado em tique.

**O que não mudar.** A coluna fantasma e a legenda acima do painel, o domínio do zero, o domínio simétrico com o zero em `--line-strong`, a cor pela polaridade, o afastamento alternado dos rótulos e a linha de leitura sem `truncate`. Tudo conferido e certo.

### Registro no formato do checklist

```
Versão: 08_combinados-e-eixo-duplo/06_real-contra-referencia-com-painel-de-variacao/v1_custo-realizado-contra-orcado
Data: 2026-10-02
Resultado: reprovada
Não: 15
Correções:
  15. EIX-6, REC-2, REC-29: eixo que mantenha o tique em uma linha (84 px, tensão declarada), interval={0} nos dois YAxis, margem de baixo para o R$ 0 e passo da variação redeclarado em três tiques.
Não se aplica: 6, 26, 27, 28, 30, 32
```

## v3_vertical-contra-orcamento-e-ano-anterior: reprovada, dois bloqueantes

### Bloqueante 1. Perguntas 15 e 31, ROT-7 (marca que o halo alcança) com GEO-4 e ROT-9 (seção 14.1: identificação das marcas e leitura apertada)

**O que se vê nos dois PNGs.** No painel "Desvio contra o orçamento", o rótulo `−12% contra R$ 704,0 mil orçado` pertence a Serviços, nasce à direita da coluna dela e termina debaixo da coluna de Energia. A palavra `orçado` fica colada na base dessa coluna e o rótulo lê como legenda de Energia, cujo desvio é outro (−R$ 44,0 mil, 8,6% abaixo de R$ 512,0 mil).

**Evidência medida.**

| Elemento, no `preview.svg` do painel do meio | x | y |
|---|---|---|
| Coluna de Serviços | 273,23 a 293,23 | 68 a 94,88 |
| Coluna de Energia | 432,57 a 452,57 | 68 a 82,08 |
| Rótulo anotado (âncora no início, 11 px, halo de 4 px) | começa em 297,23; tinta até 471,5 | linha de base em 88,88 |

A tinta do rótulo mede 173 px e cobre a largura inteira da coluna de Energia, passando 19 px dela. No PNG a 2x, nas colunas de pixel de `orç` (x de 936 a 955), sobram 2 a 3 px de cartão entre a base da coluna e a tinta, isto é, 1 a 1,5 px na tela; o halo de 2 px alcança a borda da marca. Igual nos dois temas.

**Evidência no código.** `Chart.tsx:283` a `288`: no desvio negativo o rótulo vai para `bottom − LABEL_GAP`, ao lado da coluna, e corre para a direita ou para a esquerda conforme a metade da série. Nada confere as colunas vizinhas, então a folga depende do dado: com Energia em −R$ 60 mil a tinta entra na marca.

**Por que o `check` não acusou.** A `COLISAO-TEXTO` mede texto contra texto e a `CONTRASTE-TEXTO` resolve o fundo pelo halo. Nenhuma guarda mede rótulo de uma categoria contra a marca de outra. O README já registrava esta folga como a menor do visual.

**O que mudar.** Levar o rótulo do desvio negativo para além da ponta da própria coluna, como a `v1` e a `v4` fazem: `bottom + LABEL_GAP` com `dominantBaseline="hanging"`. Neste dado a tinta fica entre y=101 e y=109, o plano termina em 116 e nenhuma outra coluna desce além de 82. Manter o halo, porque ali o rótulo pode cruzar a grade. Se a posição ao lado for mantida, calcular a folga contra cada coluna vizinha e garantir 4 px de qualquer marca. Conferir nos dois PNGs que o rótulo não fica debaixo de coluna de outra vertical.

### Bloqueante 2. Pergunta 14, NUM-4 (seção 14.1: o que o desenho afirma)

**Evidência.** `Chart.tsx:472` monta a linha de leitura com `${divergente.vertical} sobe ${signedPercent(fracaoDivergente)} e fica abaixo do orçado`, e a tela escreve `Energia sobe +38% e fica abaixo do orçado`. A variação não nomeia a base. Nesta versão há duas bases, orçamento e 2025, e a peça existe para mostrar que elas discordam: é o único lugar do acervo deste modelo em que a base omitida muda a leitura. A frase acessível, em `Chart.tsx:480`, já escreve `sobre 2025`.

**O que mudar.** Nomear a base na linha visível, no mínimo `sobre 2025` como a frase acessível, de preferência com o valor (R$ 340,0 mil). A linha mede hoje 515 px numa caixa de 574 px e o acréscimo de `sobre 2025` soma cerca de 62 px: medir a tinta e, se passar, encurtar a primeira oração em vez de deixar quebrar, ou refazer a conta de altura da nota do `meta.json`. Manter a mesma chamada `signedPercent(fracaoDivergente)` nos dois textos.

**O que não mudar.** O eixo de 84 px e os tiques em uma linha, o alinhamento dos três painéis (centro da coluna em x=123,9 nos três), as três marcas num `shape` só, as duas escalas declaradas nos títulos, a margem de 8 px do painel do meio e o rótulo do painel de baixo, que fica 6 px acima da própria coluna e não passa perto de nenhuma outra.

### Registro no formato do checklist

```
Versão: 08_combinados-e-eixo-duplo/06_real-contra-referencia-com-painel-de-variacao/v3_vertical-contra-orcamento-e-ano-anterior
Data: 2026-10-02
Resultado: reprovada
Não: 14, 15, 31
Correções:
  15 e 31. ROT-7, GEO-4, ROT-9: rótulo do desvio negativo para além da ponta da própria coluna, ou 4 px garantidos de qualquer coluna vizinha.
  14. NUM-4: a linha de leitura nomeia a base do +38% (2025), como a frase acessível.
Não se aplica: 6, 26, 27, 28, 30, 32
```

## v2_receita-contra-ano-anterior e v4_orcado-zero-e-troca-de-versao: aprovadas

Sem bloqueante nas 32 perguntas. O que foi conferido além do motivo da revisão:

1. `v2`: domínio do zero no principal e simétrico na variação, 5 linhas de grade em cada painel, os dois maiores desvios anotados (`+R$ 196,0 mil contra R$ 18,0 mil em fev/25`, absoluto porque a base está abaixo do piso; `−33% contra R$ 574,0 mil em nov/25`), contas conferidas no `data.ts`. O rótulo de novembro termina 4 px antes da própria coluna e passa a 15 px da coluna de setembro.
2. `v4`: os sete percentuais conferidos no `data.ts`; abril sem percentual e com `R$ 0` escrito; maio sem coluna, com a faixa vazada e a frase "sem base"; faixa da versão com texto na margem; dica com `formatUnavailable()` no mês sem orçado. O rótulo `+R$ 900,0 mil` fica a 3 px da borda tracejada da faixa vizinha, sem tocar.

As observações das duas, e as das reprovadas que não bloqueiam, estão no README do modelo, no bloco de 2026-10-02 (15 itens).

## Para quem cuida da régua e da ferramenta

1. A nota que abriu a revisão dizia que o eixo da `v1` "segue em 80 px". O arquivo declara 58 px e a medição do F0.2c também registra 58. O veredito foi dado sobre o arquivo.
2. Nenhuma guarda mede rótulo de uma categoria contra a marca de outra categoria. A `v3` passou no `check` com 1 a 1,5 px entre os dois. É a mesma lacuna de família do tique quebrado e do texto cortado pela borda: o defeito só existe no desenho.

## Vereditos registrados

Quatro chamadas de `npm run revisao` em 2026-10-02: `v1` reprovado, `v2` aprovado, `v3` reprovado, `v4` aprovado. Arquivo: `_render/.qa/revisao/08_combinados-e-eixo-duplo__06_real-contra-referencia-com-painel-de-variacao.json`.
