# Parecer de revisão: 08_combinados-e-eixo-duplo/01_coluna-com-linha

Data: 2026-10-02. Revisor independente. Versões julgadas: `v2_fechamentos-com-media-movel`, `v3_fila-por-etapa-contra-teto` e `v4_meta-ausente-e-estorno`, as três `sem_revisao`, pelos arquivos e pelos PNGs de hoje (render de 2026-10-02, posterior ao último `Chart.tsx`). A `v1` não entrou. `npm run check`: 0 com erro, 0 avisos; a guarda OPACIDADE-MARCA não mediu nenhuma das quatro por `sem_opacidade_em_marca`, e o código confirma que não há opacidade em marca.

Resultado: `v3` aprovada; `v2` e `v4` reprovadas, com um bloqueante cada. As observações que não reprovam estão no README do modelo, seção `Observações da revisão (não bloqueantes)`, parágrafo de 2026-10-02.

## v2_fechamentos-com-media-movel: reprovada, um bloqueante

### Bloqueante 1. A versão não demonstra o item 3 do catálogo, e não declara o desvio

**Enquadramento.** Não há pergunta própria entre as 32; é a classe "versão que não demonstra o que o catálogo diz", que reprova por si. A pergunta mais próxima, pela consequência, é a 8 (`EIX-10`).

**Evidência no catálogo.** `_estudo/catalogo.json:4138` lista, para esta versão, "Calendário completo gerado em TypeScript no eixo categórico". O estudo da família (`_estudo/familias/08_combinados-e-eixo-duplo.md:68`) chama isso de ponto delicado, e `04_linhas/README.md:16` define a técnica: "Eixo categórico só mostra as categorias presentes e liga os vizinhos de um mês faltante. Gerar a série inteira em TypeScript com `null` onde não houve coleta". É a única versão do catálogo inteiro que carrega esse item.

**Evidência no código.** `Chart.tsx:202` a `205` mapeia as linhas de `data` como vêm. `movingAverage` (`Chart.tsx:118` a `124`) fatia por **índice de linha** (`rows.slice(Math.max(0, index - MOVING_WINDOW + 1), index + 1)`), não por semana do calendário. `monthAnchorTicks` (`Chart.tsx:127` a `137`) só percorre as linhas presentes. O `data.ts:19` a `32` traz as 12 segundas-feiras digitadas à mão e contíguas, então o preview nunca exercita uma semana ausente. Nada gera o calendário e nada confere a contiguidade.

**Evidência do desvio calado.** O `meta.json` trocou o item por "Um tique por mês presente, ancorado na primeira semana daquele mês" e a nota não cita o calendário. A seção "Colisões resolvidas a favor do CONTRATO" do README declara seis desvios desta leva e não este. Aqui não há colisão com o contrato: nenhuma regra impede gerar o calendário.

**Consequência.** Página que passe o resultado de uma consulta agrupada, em que semana sem fechamento não tem linha, recebe um eixo com as colunas igualmente espaçadas e uma semana a menos, sem sinal nenhum, e uma "Média de 4 semanas" que cobre cinco ou mais. Com o próprio dado padrão: sem a linha de `2026-09-14`, o ponto de `2026-09-21` vira (12 + 20 + 16 + 19) / 4 = 16,75, somando de `2026-08-24` a `2026-09-21`, cinco semanas de calendário sob o rótulo de quatro.

**O que mudar.**

1. Gerar o calendário semanal no componente, em função pura: da primeira à última segunda-feira do recorte, de 7 em 7 dias, por aritmética sobre a data do dado (`Date.UTC`), sem relógio.
2. Semana que o calendário tem e `data` não traz entra como **lacuna declarada no tipo**, não como zero: sem coluna, com marca escrita no desenho parado (`DIC-5`) e `formatUnavailable()` na dica (`EIX-10`, `EST-2`). Se a página sabe que linha ausente é zero medido, ela passa o zero.
3. `movingAverage` devolve `null` quando a janela de quatro semanas do calendário contém lacuna, como já faz com a semana parcial (`EST-1b`).
4. O `data.ts` exercita ao menos uma semana ausente, longe da semana parcial, para a técnica aparecer no preview. Se o dono preferir o recorte cheio, a nota do `meta.json` diz que o caso não é exercitado.
5. Devolver o item ao `demonstrates` do `meta.json` (hoje são 5 de 6 possíveis), à linha da versão no README e ao passo da `v2` em "Como colar no Farol".

**Saída que não é do corretor.** Se o dono decidir que a técnica sai desta versão, o catálogo muda e o desvio passa a constar na nota do `meta.json` e nas colisões do README. Sem essa decisão, é omissão.

**O que não mudar.** A média nula nas três primeiras semanas e na semana parcial; a coluna vazada com contorno tracejado e a nota "parcial até"; o tique por mês ancorado na primeira semana; a legenda de três itens no lugar do rótulo de fim de linha; o domínio de 0 a 20 em cinco tiques; o peso 700 só no valor da semana parcial. Tudo conferido nos dois temas.

**Recomendado na mesma passada, sem peso de bloqueio.** O revestimento de 6 px da linha tem aqui, latente, o defeito que reprova a `v4`: aplicar a mesma saída. E alinhar o texto "quatro semanas anteriores" (comentário do topo e README) ao cálculo, que inclui a própria semana.

### Registro no formato do checklist

```
Versão: 08_combinados-e-eixo-duplo/01_coluna-com-linha/v2_fechamentos-com-media-movel
Data: 2026-10-02
Resultado: reprovada
Não: nenhum das 32; bloqueante de catálogo (item 3 de "o que demonstra")
Correções:
  Catálogo, EIX-10 por consequência: gerar o calendário semanal em função pura, tratar semana ausente como lacuna declarada com média nula na janela que a contém, e devolver o item ao meta.json e ao README.
Não se aplica: 6, 13, 26, 27, 28, 29, 30
```

## v4_meta-ausente-e-estorno: reprovada, um bloqueante

### O que motivou a passagem pelo corretor, e passou

O tique `−R$ 200 mil` sai em **uma linha só** com `Y_AXIS_WIDTH = 82`, nos dois temas. No `preview.svg` ele é um único `tspan`, com âncora à direita em x=68; no PNG a tinta começa cerca de 10 px depois da borda esquerda do corpo, sem corte. Os cinco tiques são `R$ 600 mil`, `R$ 400 mil`, `R$ 200 mil`, `R$ 0` e `−R$ 200 mil`, com o U+2212 antes do símbolo. A largura acima da faixa da `EIX-6` é desvio com consequência medida (com 80 o tique quebra, e a tabela da emenda de 2026-10-02 dá 81 como o menor eixo em uma linha), então pela 14.1 não reprova. A linha de leitura e a frase acessível escrevem `−R$ 182,6 mil` na mesma ordem de sinal e símbolo.

### Bloqueante 1. Pergunta 15, `TOK-10`, seção 14.1: o revestimento da linha cobre o topo da coluna e inverte a leitura de novembro

**Evidência no código.** `Chart.tsx:75` declara `TARGET_UNDERLAY_WIDTH = 6`, e `Chart.tsx:361` a `370` desenha a linha de revestimento em `--surface-raised` por cima das colunas, 3 px para cada lado do centro da linha da meta. As colunas não levam valor escrito.

**Evidência medida no `preview.svg`** (px a 1x; plano de 186 px para R$ 800 mil, isto é 0,2325 px por R$ 1 mil):

| Mês | Receita | Meta | Topo da coluna (y) | Linha da meta (y) | Topo contra a linha | O que o desenho mostra |
|---|---|---|---|---|---|---|
| `fev/26` | R$ 468,9 mil | R$ 450 mil | 46,48 | 50,88 | 4,39 px acima | fio solto de 1,39 px acima do revestimento |
| `jun/26` | R$ 455,8 mil | R$ 460 mil | 49,53 | 48,55 | 0,98 px abaixo | 2,02 px do topo cobertos na metade direita |
| `set/26` | R$ 503,1 mil | R$ 480 mil | 38,53 | 43,90 | 5,37 px acima | tampa solta de 2,37 px |
| `nov/26` | R$ 486,4 mil | R$ 480 mil | 42,41 | 43,90 | 1,49 px acima | topo inteiro coberto; coluna visível só de y=46,90 para baixo |

**Evidência no PNG** (2x, coluna de pixels x=1062, dentro da coluna de `nov/26`, nos dois temas): a linha ocupa as linhas 369 a 373, a cor do cartão ocupa 374 a 376 e a coluna só começa em 377. Não há nenhum pixel de coluna acima da linha; o topo verdadeiro cairia em 368,5. Em `fev/26` (x=339) o fio ocupa as linhas 377 a 379, três pixels a 2x.

**Consequência.** Novembro **bateu** a meta por R$ 6,4 mil e o desenho o mostra terminando 3 px **abaixo** da linha, com um vão da cor do cartão entre os dois, o que lê como cerca de R$ 467 mil, R$ 13 mil abaixo da meta. A dica do mesmo mês escreve `+R$ 6,4 mil`: desenho e dica discordam no sinal. O modelo promete exatamente essa comparação ("lê se cada coluna passou ou ficou abaixo do que a linha marca"), e ela é o que o desenho afirma. O defeito é sistemático: toda coluna cujo topo fique até 3 px acima da linha, R$ 12,9 mil nesta escala ou 2,7% da meta, aparece como abaixo dela. São os meses de "bateu por pouco", que são os que o leitor mais quer distinguir. O README já anotava o entalhe como preço da `TOK-10`; o que a anotação não mediu é que em novembro o entalhe engole o topo.

**Por que o `check` não acusou.** Nenhuma guarda mede marca coberta pelo revestimento de outra marca; a CONTRASTE-MARCA mede cada marca contra o cartão.

**O que mudar.** O revestimento não pode cobrir o topo de coluna nenhuma. Duas saídas, à escolha do corretor:

1. A segunda saída da `TOK-10`, que a própria entrada chama de mais honesta quando a guia é limiar e a barra é o dado: a linha não atravessa a coluna. Pintada antes das colunas, ou quebrada em trechos, a coluna que passa da meta cobre a linha e a que fica abaixo a deixa visível por cima, sem revestimento nenhum.
2. Manter a linha por cima, tirar o revestimento contínuo e dar anel na cor do cartão só ao ponto (raio 2,5 mais anel de 1,5, 8 px numa coluna de 16), o que deixa 4 px de topo visíveis de cada lado.

**Teste de aceite, nos dois PNGs.** `nov/26` encosta na linha ou passa dela, sem vão da cor do cartão entre a coluna e a linha; `fev/26` e `set/26` sem fio solto de menos de 2 px; `jun/26` continua lendo abaixo. Medir no `preview.svg` e escrever os números na nota do `meta.json`. Se a saída mudar a ordem de pintura, os itens 1 e 3 da Anatomia do README mudam junto.

**Na mesma passada, sem peso de bloqueio.** A nota do `meta.json` ainda declara `Y_AXIS_WIDTH` de 80, cita o tique como `R$ -200 mil` e afirma que "só em 80 px ele volta a caber numa linha só"; o arquivo usa 82 e com 80 o tique quebra. O quinto item de `demonstrates` e o comentário de `Chart.tsx:114` dizem que o formatador entrega hífen, o que deixou de ser verdade em 2026-10-02. A `MissingTargetNote` só acerta a posição com vão contíguo.

**O que não mudar.** `Y_AXIS_WIDTH = 82`; `buildSignedDomain` e os cinco tiques com o zero entre eles; a `ReferenceLine` do zero em `--line-strong`; `connectNulls={false}` com a nota "sem meta" acima da coluna mais alta do vão; o mês do estorno em `--negative`, sem rótulo, com o valor na linha de leitura; a frase acessível de 211 caracteres.

### Registro no formato do checklist

```
Versão: 08_combinados-e-eixo-duplo/01_coluna-com-linha/v4_meta-ausente-e-estorno
Data: 2026-10-02
Resultado: reprovada
Não: 15
Correções:
  15. TOK-10, seção 14.1: tirar o revestimento da linha de cima do topo das colunas, de modo que nov/26 (R$ 486,4 mil contra meta de R$ 480 mil) encoste na linha ou passe dela nos dois temas.
Não se aplica: 6, 26, 27, 28, 29, 30
```

## v3_fila-por-etapa-contra-teto: aprovada, sem bloqueante

Não precisa de correção; fica aqui só o que foi conferido, para o corretor não mexer no que está certo.

- Os 26 totais conferem com a soma do `data.ts`. Seis passam de 260 (264, 261, 278, 277, 292 e 274), o mesmo número da linha de leitura e da frase acessível (206 caracteres), e o pico de 292 cai em `2026-08-31`. A semana de total 260 fica fora da conta, coerente com "passaram o teto".
- Pilha a partir do zero, domínio de 0 a 300 em quatro tiques, um `YAxis`. Slots 1, 3, 6 e 5 por chave, vindos do dado. Vão de 2 px entre camadas, aberto na base de cada segmento, com o topo no valor exato.
- Teto por `ReferenceLine` com `ifOverflow="extendDomain"`, rótulo com nome, valor e unidade na faixa reservada do topo. Legenda desenhada à mão na ordem visual da pilha, desvio do catálogo declarado na nota e no README.
- A semana de `2026-08-10`, com zero em Agenda marcada, leva o total 246 no topo da pilha: a série âncora funciona.
- Pesos 400, 500 e 600, nenhum 700; textos em 12 e 11 px.

O que ficou como observação no README: o halo do total apaga o tracejado do teto em seis semanas e deixa tocos de traço junto dos algarismos; o teto não tem amostra na legenda; o revestimento tracejado abre janelas dentro das colunas; plural fixo; vermelho do rótulo vizinho do slot 5. Nenhum desses pontos faz o desenho afirmar algo falso, porque o total está escrito em toda coluna e o estado acima do teto tem cor, peso e posição.

## Para quem cuida da régua

- Nenhuma guarda mede marca coberta pelo revestimento de outra marca, e a saída da `TOK-10` pelo halo não avisa que ele pode engolir a ponta que codifica o valor. Foi o que reprovou a `v4` e está latente na `v2`.
- O `check` não compara o `demonstrates` do `meta.json` com o `o_que_demonstra` do catálogo, então item do catálogo abandonado sem declaração passa em silêncio. Foi o que reprovou a `v2`.
