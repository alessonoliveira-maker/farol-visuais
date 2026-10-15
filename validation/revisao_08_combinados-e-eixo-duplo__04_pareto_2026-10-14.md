# Revisão de 08_combinados-e-eixo-duplo/04_pareto, 2026-10-14

Revisor independente. Versões julgadas: `v2_corte-em-80-por-cento`, `v3_quantidade-contra-valor-por-etapa`
e `v4_cauda-longa-e-poucos-motivos`, as três `sem_revisao`. A `v1` não estava no pedido.

`npm run check` do modelo: 0 com erro, 4 avisos (FRASE-ACESSIVEL da `v1`, 239 caracteres, e
CONTRASTE-MARCA do `--line-strong` como preenchimento nas outras três, isento pela ACE-3 porque o valor
está escrito junto de cada marca). PNGs de 2026-10-02, mais novos que os `Chart.tsx` de 2026-09-29;
os seis foram abertos e ampliados nos trechos citados abaixo. As medidas estão em px de CSS (o PNG é
2x; o número do PNG vai entre parênteses quando ajuda a conferir).

| Versão | Resultado | Não |
|---|---|---|
| `v2_corte-em-80-por-cento` | reprovada | 31 |
| `v3_quantidade-contra-valor-por-etapa` | reprovada | 31 |
| `v4_cauda-longa-e-poucos-motivos` | reprovada | 31 |

As observações das três (11 itens) estão no README do modelo, seção `## Observações da revisão (não
bloqueantes)`, parágrafo de 2026-10-14.

## A causa comum

As três versões têm um bloqueante só, e é o mesmo: **um rótulo de texto com halo assentado em cima
da linha do percentual acumulado**. O halo de `strokeWidth: 4` pinta a superfície do cartão por baixo
do glifo e apaga o traço de 2 px da linha, e o ponto da linha fica solto, separado do resto da curva.

Regra: pergunta 31 ("nenhum halo de rótulo corta uma marca de traço fina [...] linha, e nenhum
rótulo começa em cima do ponto de outra série"); ROT-7, exceção da marca fina, medida em 2026-09-19:
"onde o rótulo cruzaria uma marca de traço, quem sai do lugar é o rótulo, por posicionamento
anticolisão calculado em TypeScript"; armadilha GEO-4 ("em marca fina, quem sai do lugar é o texto,
nunca a marca"). Pela seção 14.1 é constante de posição com consequência visível, **marca partida**,
e por isso bloqueia. A linha passa no teste da ACE-6: tapada, some o acumulado, que é metade do
pareto.

Mesmo peso já dado no acervo: `27_rede-e-relacoes/03_grafo-em-grade` (11 a 11,5 px de traço sob o
halo), `20_cronograma-e-linha-do-tempo/04_jornada-por-entidade` (11,5 e 9,5 px),
`18_radar/04_radar-de-ciclo`. Aqui os vãos medem de 12 a 20 px.

O README e as notas do `meta.json` registram o vão como tensão aceita ("a alternativa seria tirar o
rótulo da primeira marca"). A régua não oferece essa troca: o rótulo não sai, ele **muda de lugar**.

Como medi: amostrei o PNG ao longo do segmento da linha, do centro de um ponto ao centro do seguinte,
e contei os pixels com a cor exata do fundo do cartão (`#121c2e` no escuro, `#ffffff` no claro) onde
devia haver tinta da linha (`#7c9cf8` e `#2b5bc4`).

## v2_corte-em-80-por-cento: reprovada

### Bloqueante 1. Pergunta 31; ROT-7, exceção da marca fina; GEO-4

**Evidência no PNG.** O primeiro trecho da linha do acumulado vai do ponto de Sem fit (42%) ao de
Preço (65%) e mede 84 px. O rótulo `84 perdas`, centrado na coluna e 6 px acima dela
(`VALUE_LABEL_GAP`), fica exatamente sobre esse trecho, porque o primeiro ponto cai por construção na
ponta da primeira coluna e a linha sobe para a direita pelo meio da palavra "perdas".

* Escuro: depois de 5 px de linha visíveis junto do ponto, 20 px (40 de 168 no PNG) saem com a cor do
  fundo ou com glifo por cima; a linha só volta depois do "s".
* Claro: o mesmo, 20,5 px (41 de 168 no PNG).
* O ponto de Sem fit fica por baixo do "p" de "perdas", com cerca de 0,5 px entre a descendente e a
  borda do ponto. Lê como um ponto solto embaixo do rótulo, e não como o começo da curva.

**Evidência no código.** `renderCountLabel` (linhas 226 a 250) desenha todo rótulo de contagem com
`style={HALO}` e `textAnchor="middle"` no centro da coluna, sem saber onde a linha passa. No PNG o
texto sai pintado por cima da linha (declarada depois, na linha 350), então o halo vence o traço.

**O que mudar.**

1. Tirar o rótulo da primeira coluna de cima do traço por posição calculada, não por halo. No pareto
   em colunas a linha sai do topo da primeira coluna e sobe para a direita, então um rótulo ancorado
   pelo fim (`textAnchor="end"`) a alguns px à esquerda do primeiro ponto, na mesma altura, já fica do
   lado onde a linha não passa. O caminho geral, que serve às três versões: calcular em TypeScript a
   altura da linha nos dois extremos da caixa do rótulo, a partir dos `acumPct` vizinhos e da escala
   (o eixo é fixo de 0 a 100, então a conta é exata), e trocar de posição quando houver interseção.
2. Rótulo que não cruza mais a linha não precisa de halo sobre ela. O halo pode continuar onde o texto
   cruza a linha de referência do corte, que é guia e não dado (ROT-7, corpo principal).
3. Conferir depois do render, nos dois temas, que nenhum outro rótulo de contagem passou a cruzar a
   linha (hoje só o primeiro cruza; o topo de `46 perdas` fica mais de 35 px abaixo do traço).

**O que está certo e não deve mudar.** O eixo das colunas de zero ao total: a primeira coluna toca o
primeiro ponto (topo da coluna e ponto a 42%, conferidos contra os tiques de 40% e 60%). O corte
calculado no laço (3 motivos, 81,5%), a cor por `shape`, o neutro com o valor escrito, o peso 700 só
no nome e no valor do líder (dois elementos, TIP-3), a `ReferenceLine` com `extendDomain` e o rótulo
na margem esquerda sem corte, a frase acessível de 208 caracteres e o estado vazio.

```
Versão: 08_combinados-e-eixo-duplo/04_pareto/v2_corte-em-80-por-cento
Data: 2026-10-14
Resultado: reprovada
Não: 31
Correções:
  31. ROT-7 (marca fina), GEO-4: tirar o rótulo 84 perdas de cima da linha do acumulado por posição calculada, sem halo sobre o traço.
Não se aplica: 6, 8, 26, 27, 28, 29, 30
```

## v3_quantidade-contra-valor-por-etapa: reprovada

### Bloqueante 1. Pergunta 31; ROT-7, exceção da marca fina; GEO-4

Aqui o rótulo que corta a linha não é o da primeira barra (o `VALUE_LABEL_GAP` de 10 px resolveu
esse, e `62 perdas` e `14 perdas` passam limpos), e sim o **nome da própria série**.

**Evidência no PNG.** `Acumulado 100,0%` é ancorado pelo fim (`textAnchor="end"`) no x do último
ponto e 10 px acima dele (`ACUM_LABEL_GAP`). Na barra horizontal a linha chega ao último ponto vindo
de cima e da esquerda, então o fim do rótulo, o "0%", cai em cima do último trecho da curva.

* Painel Pré-vendas, escuro: o último trecho (de 89,4% a 100%) mede 58 px; a partir de 37 px dele,
  12 px (24 de 117 no PNG) saem com a cor do fundo ou com o glifo "%" por cima. Claro: 12,5 px (25 de
  117).
* Painel Vendas, escuro: o último trecho (de 87,5% a 100%) mede 60 px; 12 px (24 de 121 no PNG) somem
  no mesmo lugar.
* O "%" tem a mesma cor da linha e fica alinhado com ela: no PNG ampliado a curva parece entrar no
  rótulo e o ponto de 100% aparece solto embaixo do texto, ligado só por um toco de cerca de 10 px, ponto incluso.
* Nos dois painéis o mesmo rótulo atravessa também a linha tracejada do corte. Ali o halo é
  permitido (guia, não dado) e não é o motivo da reprovação.

**Evidência no código.** `renderAcumLabel` (linhas 276 a 293): `x={Number(x)}`,
`y={Number(y) - ACUM_LABEL_GAP}`, `textAnchor="end"`, `style={HALO}`. A posição é fixa em relação ao
ponto e não sabe de onde a linha vem. No modo valor a geometria se repete: Outros vale 9,7% da
pré-vendas e 8,8% de vendas, o último trecho fica ainda mais inclinado e passa pelo mesmo "%".

**O que mudar.**

1. Pôr o nome da série onde o traço não passa, calculado do dado nos dois modos. Na barra horizontal,
   à esquerda do último ponto e na altura dele (`textAnchor="end"`, `dominantBaseline="central"`, a 8
   ou 10 px do ponto) a linha não chega: na faixa de ±5 px em volta do ponto ela fica a menos de 3 px
   dele na horizontal. Conferir que ali o rótulo não encosta no valor da barra Outros (hoje
   `18 perdas` termina perto de 92 px do plano e o rótulo começaria perto de 140 px) e deixar o halo
   só onde ele cruza o tracejado do corte.
2. Se a saída for outra (abaixo do ponto, por exemplo), vale a mesma conta: caixa do rótulo contra os
   dois segmentos que chegam ao ponto, em TypeScript, com a escala fixa de 0 a 100.
3. Na mesma passada, olhar o primeiro rótulo de valor no modo valor. Pela geometria do código,
   `R$ 3,4 mi` de vendas nasce a 10 px da ponta da barra, onde a linha está 7,2 px abaixo do centro
   do rótulo: a folga até o halo fica entre zero e 1 px. Não há render desse estado, então é
   projeção; se a anticolisão do item 1 for geral, ela cobre este caso também.

**O que está certo e não deve mudar.** A alternância em HTML sem misturar as grandezas, o domínio
de 0 a 100 comum aos dois painéis com as barras de zero ao total da etapa (a primeira barra toca o
primeiro ponto: 36,5% e 35% conferidos contra os tiques), o corte recalculado por etapa e por modo
com a contagem no título, Outros sempre no fim, os nomes inteiros em barra horizontal, o primeiro
item no alto sem `reversed`, a frase acessível de 216 caracteres e o estado vazio.

```
Versão: 08_combinados-e-eixo-duplo/04_pareto/v3_quantidade-contra-valor-por-etapa
Data: 2026-10-14
Resultado: reprovada
Não: 31
Correções:
  31. ROT-7 (marca fina), GEO-4: tirar Acumulado 100,0% de cima do último trecho da própria linha, nos dois painéis e nos dois modos, por posição calculada.
Não se aplica: 6, 8, 26, 27, 28, 29, 30
```

## v4_cauda-longa-e-poucos-motivos: reprovada

### Bloqueante 1. Pergunta 31; ROT-7, exceção da marca fina; GEO-4

**Evidência no PNG.** É o defeito da `v2` no canvas largo. O primeiro trecho da linha vai do ponto de
Sem fit (18,8%) ao de Preço (33,1%) e mede 80 px; o rótulo `58 perdas`, centrado na coluna e 6 px
acima dela, fica em cima dele.

* Escuro: depois de 12,5 px de linha junto do ponto, 17,5 px (35 de 160 no PNG) saem com a cor do
  fundo ou com glifo por cima; a linha volta depois do "s".
* Claro: os mesmos 17,5 px.
* O ponto de Sem fit fica por baixo de "pe", colado à descendente do "p", e lê como ponto solto.

**Evidência no código.** `renderCountLabel` (linhas 261 a 279), com `style={HALO}` e
`textAnchor="middle"` no centro da coluna, igual à `v2`.

**O que mudar.** O mesmo das duas outras: o rótulo da primeira coluna sai de cima do traço por
posição calculada (ancorado à esquerda do primeiro ponto, ou pela conta geral da caixa do rótulo
contra os segmentos vizinhos), sem halo sobre a linha. A conta só vale no modo pareto: abaixo de 4
motivos a linha sai e o rótulo pode voltar ao centro da coluna.

**O que está certo e não deve mudar.** O top 10 com a cauda de 30 motivos somada no fim e a contagem
na segunda linha do tique, o eixo das colunas de zero ao total (coluna e ponto de Sem fit a 18,8%,
conferidos contra o tique de 20%), o `minPointSize` que deixa a coluna de 2 perdas com 3 px visíveis,
o neutro da cauda com o valor escrito, a troca para colunas simples abaixo de 4 motivos (domínio de
zero ao maior valor, linha e eixo de percentual fora, aviso com ícone) e o estado vazio, os dois
lidos no código porque o dado padrão não passa por eles, e a frase acessível de 192 caracteres.

```
Versão: 08_combinados-e-eixo-duplo/04_pareto/v4_cauda-longa-e-poucos-motivos
Data: 2026-10-14
Resultado: reprovada
Não: 31
Correções:
  31. ROT-7 (marca fina), GEO-4: tirar o rótulo 58 perdas de cima da linha do acumulado por posição calculada, sem halo sobre o traço.
Não se aplica: 6, 8, 13, 26, 27, 28, 29, 30
```

## Para o corretor

* É uma correção só, aplicada em três arquivos. Vale escrever a função de posição uma vez (caixa do
  rótulo contra os segmentos da linha que chegam ao ponto, com a escala fixa de 0 a 100) e usá-la nas
  três, e alinhar a `v1` na mesma passada, que tem o mesmo cruzamento e foi aprovada em 2026-09-19.
* Depois do render, ampliar os trechos citados nos dois temas: a linha precisa sair contínua do
  primeiro ponto ao segundo (`v2`, `v4`) e do penúltimo ao último (`v3`, nos dois painéis).
* Nenhuma guarda do `check` mede halo de texto sobre linha de série: a COLISAO-TEXTO mede texto
  contra texto e a TEXTO-NA-MARCA mede texto sobre marca preenchida. O `check` vai sair limpo antes e
  depois da correção; quem confirma é o PNG.
