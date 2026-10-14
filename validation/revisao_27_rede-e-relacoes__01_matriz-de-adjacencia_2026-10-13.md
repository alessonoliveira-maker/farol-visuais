# Parecer de revisão: 27_rede-e-relacoes/01_matriz-de-adjacencia

Data: 2026-10-13. Revisor independente, primeira passada, as quatro versões em `sem_revisao`, julgadas pelo arquivo e pelos PNGs de hoje (render das 14:25, posterior ao último `Chart.tsx`, das 14:24:59). `npm run check` com tipos: 0 com erro, 3 avisos, 0 escapes.

Resultado: três aprovadas e uma reprovada. A `v2` cai por dois bloqueantes que moram no mesmo caso difícil, o SDR de base pequena: a frase acessível afirma um superlativo que a matriz desmente, e o pontilhado que avisa da base pequena mede abaixo do piso de contraste nos dois temas. Nenhuma versão tem defeito de geometria, de conta ou de ausência: os números das células, os quartis, os percentuais de linha e os totais conferem com o `data.ts`. As observações não bloqueantes estão no README do modelo, seção `Observações da revisão (não bloqueantes)`.

| Versão | Resultado | Não |
|---|---|---|
| `v1_coocorrencia-de-origens-na-jornada` | aprovada | nenhum |
| `v2_handoff-sdr-por-executivo` | reprovada | 19, 20 |
| `v3_motivos-de-perda-que-andam-juntos` | aprovada | nenhum |
| `v4_matriz-esparsa-e-par-sem-medicao` | aprovada | nenhum |

Não se aplica, nas quatro: perguntas 4, 13, 26, 27, 28, 29, 30, 31 e 32. Na `v1`, na `v3` e na `v4` também a 6; na `v3` e na `v4` também a 18.

## O que foi medido e o que não foi

* **Refeito do `data.ts`, à mão:** na `v1`, os 57 pares positivos, os 9 zeros, os tetos de quartil (9, 22, 57 e 412), o grau de cada origem e a ordem dentro de cada grupo, e os 45% de coocorrências dentro do grupo (1.175 de 2.617). Na `v2`, os 54 percentuais de linha pelo maior resto (as seis linhas somam 100), os 9 totais de coluna, os 6 de linha e o total de 213. Na `v3`, o bloco das posições 13 a 15 (68, 58 e 41 somam 167) e a melhor janela de três nos modos Nome (116) e Frequência (229). Na `v4`, os 52 pares positivos, os 9 nulos, os 719 zeros de 780 (92,2%), os tetos de quartil (9, 18, 34 e 94), a ordem por grau e a posição das 9 hachuras.
* **Baricentro da `v3`, refeito fora do componente com a mesma regra:** a ordem desenhada confere com a do PNG. A iteração não chega a ponto fixo: a partir do passo 7 alterna entre duas ordens e sai pelo teto de 24.
* **Recortes ampliados dos PNGs:** as linhas SDR 3 a SDR 6 da `v2`, nos dois temas, com a cor de cada pixel contada.
* **Preview contra página:** de 0,00% a 0,02% de pixels diferentes nos oito pares de PNG.
* **Frase acessível, lida em `data-farol-ace`:** 184, 184, 221 e 207 caracteres.
* **Não medido pela ferramenta:** `EIXO-CALMO` (`sem_grade`), `OPACIDADE-MARCA` (`sem_opacidade_em_marca`) e `RAIO-CONTRA-AREA` (`sem_marca_de_area`) nas quatro. Nenhuma das três se aplica a esta peça.
* **Não renderizado:** o realce de cursor da `v1` e da `v2`, os modos Frequência e Nome da `v3`, a rolagem abaixo de 480 px da `v3` e o estado vazio das quatro. O que se diz deles é leitura do código.
* **Não testado:** as saídas sugeridas. Os contrastes citados nelas são conta de token, não render.

Pares de contraste, calculados de `app/src/styles/tokens.css` pela fórmula da WCAG:

| Par | Escuro | Claro | Onde |
|---|---|---|---|
| `--text-primary` sobre `--seq-2` | 9,21 | 12,05 | número na faixa mais baixa, as quatro |
| `--text-primary` sobre `--seq-3` | 6,33 | 9,35 | número na segunda faixa, as quatro |
| `--accent-cyan-contrast` sobre `--seq-6` | 7,38 | 5,45 | número na terceira faixa, as quatro |
| `--accent-cyan-contrast` sobre `--seq-7` | 10,72 | 8,29 | número na faixa mais alta, as quatro |
| `--text-muted` sobre `--surface-sunken` | 5,98 | 4,65 | o 0 do zero medido, as quatro |
| `--text-muted` contra o cartão | 5,21 | 5,37 | legenda, hachura e contorno da `v4`, amostra do pontilhado da `v2` |
| `--chart-1` contra o cartão | 9,50 | 6,00 | contorno do destaque da `v2` e do bloco da `v3` |
| `--line-subtle` contra o cartão | 1,25 | 1,29 | diagonal da `v1`, da `v3` e da `v4`: estrutura, sem valor |
| `--surface-overlay` contra o cartão | 1,10 | 1,00 | realce de cursor da `v1` e da `v2` |
| `--text-muted` contra `--seq-7` | **1,94** | **1,54** | pontilhado da célula `71%`, `v2` |
| `--text-muted` contra `--seq-6` | **1,34** | **1,01** | pontilhado da célula `29%`, `v2` |

## `v2_handoff-sdr-por-executivo`: reprovada

A matriz está certa: seis linhas que somam 100, totais marginais conferidos, destaque no par certo com contorno fora da célula, peso 700 em dois elementos e anotação de 39 caracteres. Os dois bloqueantes estão no tratamento do SDR 6, que tem 7 agendas e 71% num executivo só.

### Bloqueante 1. Pergunta 19, `ACE-1` (a frase acessível afirma o que a matriz desmente)

**O que o desenho faz.** O destaque só concorre entre SDRs com 10 agendas ou mais (`MIN_BASE`), e por isso o par contornado é SDR 3 com o executivo C, 42%. Na tela a regra está escrita: a segunda linha da legenda diz "SDR com menos de 10 agendas, fora do destaque". A frase acessível tira a mesma conclusão e não diz a regra.

**Evidência.**

* `preview.svg`, `data-farol-ace`, 184 caracteres: "Matriz de repasses de 6 SDRs para 9 executivos em 2026-T3, com 213 agendas. O par mais concentrado é SDR 3 com o executivo C, com 42% da linha. SDR 3 repassou 70% para dois executivos."
* Nos dois PNGs, a célula de SDR 6 com C escreve `71%`, o maior número da matriz, na faixa mais alta da rampa. O `data.ts`, linhas 7 e 8, diz o mesmo: "cujo 71% num único executivo é o maior percentual da matriz".
* `Chart.tsx`, linhas 132 a 138: o laço descarta a linha com total abaixo de `MIN_BASE`. Linhas 151 a 156: a frase usa o resultado e não cita a base.
* O `<svg>` é `aria-hidden` e a raiz é `role="figure"` com `aria-label`: quem usa leitor de tela recebe só a frase. Para essa pessoa, "o par mais concentrado" com 42% é falso, porque existe um par com 71%, e o que torna a frase verdadeira, a base mínima, ficou só na parte que ela não lê.
* O acervo já decidiu este caso: em `22_unidades-waffle-e-pictograma/05_area-quadrada-proporcional`, `v2`, de 2026-10-13, frase acessível que afirma o que o dado desmente reprovou e não entrou como redação.

**O que mudar.**

1. Pôr a base na frase, calculada de `MIN_BASE`: "Entre os SDRs com 10 agendas ou mais, o par mais concentrado é SDR 3 com o executivo C, com 42% da linha." A frase passa de 184 para 222 caracteres, abaixo do aviso de 235 da guarda.
2. Usar `formatInt(MIN_BASE)`, o mesmo formatador da legenda, para a frase e o corpo não divergirem.
3. Render nos dois temas e `npm run check` por último, para a `FRASE-ACESSIVEL` medir o tamanho novo.

### Bloqueante 2. Pergunta 20, `ACE-3` e `ACE-8`, com a `TOK-9` (o pontilhado some contra a própria célula)

**O que o desenho faz.** As células do SDR de base pequena levam um contorno pontilhado em `--text-muted`, e a legenda dedica uma linha a ele. O traço é desenhado inteiro dentro da célula, em cima do preenchimento. Nas duas células que o dado padrão marca, o preenchimento é `--seq-7` (71%) e `--seq-6` (29%), e `--text-muted` quase não difere deles em luminância.

**Evidência.**

* `Chart.tsx`, linhas 282 a 294: `stroke="var(--text-muted)"`, `strokeWidth={1.5}`, `strokeDasharray="3 2"`, em `x + 0.75` com largura `CELL_W - 1.5`. O traço vai de `x` a `x + 1,5`, todo sobre o preenchimento.
* PNG escuro, célula `71%`: traço `rgb(127, 143, 171)` sobre `rgb(111, 214, 232)`, **1,94:1**. Célula `29%`: o mesmo traço sobre `rgb(45, 180, 210)`, **1,34:1**.
* PNG claro, célula `71%`: traço `rgb(92, 107, 135)` sobre `rgb(18, 85, 106)`, **1,54:1**. Célula `29%`: o mesmo traço sobre `rgb(36, 114, 139)`, **1,01:1**. Nesta última a luminância é a mesma e o pontilhado só se distingue pelo matiz.
* A amostra da legenda (linhas 386 a 396) é o mesmo traço sobre o cartão e mede 5,21:1 e 5,37:1. A amostra aparece e a marca que ela ensina a procurar não.
* Tabela 17.10: `--text-muted` como contorno de ausência está aprovado contra `--surface-raised`. Não há par aprovado de `--text-muted` sobre a rampa sequencial, e o piso de contorno da `ACE-3` é 3:1 contra o fundo adjacente.
* O próprio arquivo conhece a armadilha: o comentário do topo (linhas 15 a 17) e o item 1 do `notes` explicam que o contorno do destaque foi para fora da célula porque dentro dela `--chart-1` não se separa de `--seq-7`. O pontilhado ficou dentro.
* O item 2 do `notes` declara o papel da marca: "o pontilhado nas células dele avisa da base pequena".
* Atenuante, e ele não fecha a conta: o total `7` está escrito no fim da linha e a regra está escrita na legenda, então a informação não some. O que falha é a marca que a legenda nomeia, medida abaixo do piso nos dois temas, e a isenção da `ACE-3` pede o valor na marca ou junto dela, e o total fica a 162 px da célula `29%` e a 288 px da `71%`.

**O que mudar.**

1. Dar ao traço a cor do texto da faixa, que já está no arquivo: `stroke={CLASS_TEXT[bucket]}`. Passa a medir 7,38:1 e 5,45:1 sobre `--seq-6`, 10,72:1 e 8,29:1 sobre `--seq-7`, 9,21:1 e 12,05:1 sobre `--seq-2`, 6,33:1 e 9,35:1 sobre `--seq-3`. A amostra da legenda continua sobre o cartão em `--text-muted`.
2. A alternativa de levar o pontilhado para o vão, como o destaque, tem um custo: o vão tem 4 px e o contorno do destaque ocupa 2,5 px dele, então uma linha de base pequena vizinha do par destacado faria os dois traços se tocarem.
3. Escrever no `notes` o par medido marca contra marca nos dois temas, que é a saída da `TOK-9`.
4. Render nos dois temas, olhar a linha do SDR 6 nos dois PNGs e rodar `npm run check` por último.

**Na mesma passada, sem peso de bloqueio.** Estão no README e cabem na mesma edição:

* Cabeçalho dos totais marginais sem o substantivo (`NUM-6`): trocar `total` por `agendas`, ou dizer a unidade na nota de canto.
* Linha de SDR com total zero escreve `0%` em nove células (linha 305, `percent ?? 0`): percentual sem base não é zero medido (`EST-4`).
* Números em frase sem `tabular-nums` (`TIP-1`): anotação e legenda.
* Realce de cursor em `--surface-overlay`, que no tema claro é o branco do cartão.

```
Versão: 27_rede-e-relacoes/01_matriz-de-adjacencia/v2_handoff-sdr-por-executivo
Data: 2026-10-13
Resultado: reprovada
Não: 19, 20
Correções:
  19. ACE-1: dizer na frase acessível a base mínima do destaque (SDRs com 10 agendas ou mais), calculada de MIN_BASE.
  20. ACE-3, ACE-8, TOK-9: tirar o pontilhado de base pequena de --text-muted sobre a rampa (1,94 e 1,34:1 no escuro, 1,54 e 1,01:1 no claro) e pôr na cor do texto da faixa.
Não se aplica: 4, 13, 26, 27, 28, 29, 30, 31 e 32
```

## `v1`, `v3` e `v4`: aprovadas

Nenhuma das três tem "não". O corretor não precisa tocar nelas; o que segue é o registro do que sustentou o aceite, e as observações de cada uma estão no README.

* **`v1`.** Triângulo inferior com as 12 origens nomeadas na ponta da própria linha, sem texto girado e sem origem órfã (`GEO-13`). Grupos separados por faixa de espaço com o nome dentro. Quatro quartis com a contagem escrita em todas as células, zero medido em neutro com o 0. Desvios do catálogo declarados no `notes`: rampa de quatro degraus, diagonal em `--line-subtle`, SVG no lugar de grid CSS.
* **`v3`.** A ordem padrão põe as três famílias de motivo em bloco junto da diagonal, que é o que a versão existe para mostrar. Colunas por número de posição e nome na linha, com os 18 motivos nomeados; o desvio da `TIP-5` contra o catálogo está declarado. Seletor com a ordem padrão escrita. Ponto a acompanhar, registrado no README: o baricentro entra em ciclo de duas ordens no dado padrão e sai pelo teto de iterações. Os blocos de família aparecem nas duas, então a leitura que a versão promete se sustenta, mas o trio anotado depende da paridade do teto.
* **`v4`.** Zero medido (neutro com o 0 escrito) e par sem medição (hachura em `--text-muted` com contorno, sem número) não se confundem em nenhum dos temas, e a legenda tem item próprio para cada um. As 9 hachuras caem nos 9 pares nulos do `data.ts`. As 22 origens sem par saem da grade e voltam escritas no rodapé, com a contagem calculada.

```
Versão: 27_rede-e-relacoes/01_matriz-de-adjacencia/v1_coocorrencia-de-origens-na-jornada
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 13, 26, 27, 28, 29, 30, 31 e 32
```

```
Versão: 27_rede-e-relacoes/01_matriz-de-adjacencia/v3_motivos-de-perda-que-andam-juntos
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 13, 18, 26, 27, 28, 29, 30, 31 e 32
```

```
Versão: 27_rede-e-relacoes/01_matriz-de-adjacencia/v4_matriz-esparsa-e-par-sem-medicao
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 13, 18, 26, 27, 28, 29, 30, 31 e 32
```
