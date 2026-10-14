# Parecer de revisão: 27_rede-e-relacoes/06_grafo-radial-e-circular

Data: 2026-10-13. Revisor independente, primeira passada, as quatro versões em `sem_revisao`, julgadas pelos arquivos e pelos PNGs de hoje (render das 18:25:52 em diante, posterior ao último `Chart.tsx`, das 18:25:21). `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes.

Resultado: três aprovadas e uma reprovada. A `v2` cai por um defeito só, de desenho: a ligação acesa e o revestimento dela são pintados por cima das ligações baixadas que dividem um nó com ela, e como toda curva sai do nó na mesma direção (o controle é o centro), a baixada corre por baixo da acesa em vez de cruzá-la. Três das 14 ligações baixadas perdem cerca de metade ou mais do caminho, nos dois temas, e a legenda continua escrevendo 14. A `v1`, a `v3` e a `v4` passam nas 32 perguntas. As observações não bloqueantes estão no README do modelo, seção `Observações da revisão (não bloqueantes)`, e uma delas, a do ramo não fotografado da `v4`, tem peso.

| Versão | Resultado | Não |
|---|---|---|
| `v1_egocentrica-parceiro-de-indicacao` | aprovada | nenhum |
| `v2_circular-coocorrencia-de-origens` | reprovada | 15, 32 |
| `v3_equipes-que-compartilham-oportunidades` | aprovada | nenhum |
| `v4_parceiro-sem-indicacao-no-periodo` | aprovada | nenhum |

Não se aplica, nas quatro: perguntas 3, 4, 6, 7, 26, 27, 28 e 29. A 30 só se aplica à `v2`, e nela passa.

## O que foi medido e o que não foi

* **Refeito do `data.ts`, à mão:** na `v1`, 9 diretas, 14 indiretas e a ordem do primeiro anel (3, 3, 3, 2, 2, 1, 0, 0, 0). Na `v2`, os 19 pares, o grau das 12 origens, a ordem dentro de cada grupo e a divisão 2, 2 e 1 das parceiras da busca paga. Na `v3`, os 18 pares, o grau das 16 equipes e as 3 isoladas. Na `v4`, a ordem do histórico por data, os 3 trimestres distintos e a última indicação.
* **Contraste, recalculado contra `tokens.css`:** `--text-muted` contra o cartão 5,21:1 e 5,37:1; `--text-muted` a 0,76 dá 3,57:1 no escuro e 3,27:1 no claro (o README escreve 3,58 e 3,28, diferença de arredondamento); `--chart-1` contra a ligação baixada 2,66:1 e 1,84:1; `--chart-1` contra `--text-secondary` 1,16:1 e 1,35:1.
* **Geometria da `v2` e da `v3`, refeita fora do componente com a mesma regra** (vagas de `buildLayout`, curva `M xi,yi Q cx,cy xj,yj`, 400 segmentos por curva): distância de cada ponto de uma ligação ao eixo das outras.
* **Tinta visível na `v2`, por varredura dos dois PNGs:** amostras ao longo de cada ligação baixada, fora do raio do nó, vizinhança de 3 por 3 pixels de dispositivo. Deslocamento do `<svg>` no PNG calibrado em (28,2; 95,4) px, com 260 de 260 amostras cinza nas quatro ligações que nenhuma acesa toca.
* **Rótulos, por conta sobre as constantes e conferência nos recortes ampliados:** posição dos 15 rótulos da `v2`, dos 16 da `v3`, dos 14 do segundo anel da `v1` e dos 5 da `v4`; nenhum sai do corpo nem encosta em outro.
* **Frase acessível, lida em `data-farol-ace` do `preview.svg`:** 202, 219, 229 e 229 caracteres, as quatro começando pelo tipo de grafo e verdadeiras contra o dado.
* **Não medido pela ferramenta:** `ESPESSURA-MARCA`, `EIXO-CALMO`, `OPACIDADE-MARCA` e `RAIO-CONTRA-AREA` nas quatro, e `FORMATO-ACESSIVEL` na `v1` e na `v4`. Nenhuma guarda mede ligação coberta por outra ligação: a `v2` saiu do `check` com 0 avisos.
* **Não renderizado:** o estado vazio das quatro, a `v2` sem `highlightId` válido, e a `v4` com carteira não carregada e com indicação no trimestre. O que se diz deles é leitura do código.
* **Não testado em render:** a saída sugerida abaixo. Os números dela são simulação fora do componente.

## `v2_circular-coocorrencia-de-origens`: reprovada

### Bloqueante único. Perguntas 15 e 32, regra ACE-6 (com a TOK-4 e a marca fina da ROT-7)

**O que se vê.** No canto de baixo à esquerda, a ligação de Indicação com Base de e-mail sobe de Indicação, faz a volta do laço e some: a metade de volta está inteira debaixo da ligação acesa que desce de Busca paga para Base de e-mail. Sobra um toco cinza que termina no meio da ligação acesa, nos dois temas. No topo, a ligação de Redes pagas com Display não aparece como marca própria em trecho nenhum. À direita, a de Busca orgânica com Acesso direto fica reduzida a um nó de traços entre as duas ligações acesas. A legenda escreve "14 outras ligações entre as origens" e o desenho deixa ler 11.

**Por que acontece.** Com o ponto de controle no centro, a tangente de toda curva no nó aponta para o centro. Duas ligações do mesmo nó saem coladas e só se separam adiante. Enquanto as duas são baixadas, elas se fundem na mesma cor e nada se perde (é o caso da `v3`). Quando uma é acesa, ela tem 2,5 px, é pintada por último e leva 1 px de revestimento na cor do cartão de cada lado: a baixada, de 1,2 px, fica coberta no trecho inteiro em que corre a menos de 2,25 px do eixo da acesa. O revestimento foi posto para separar cruzamento (TOK-4), e aqui o encontro é tangente. Não é acidente deste dado: o círculo é ordenado por grupo, as parceiras da origem selecionada tendem a ser vizinhas na volta e ligadas entre si, e são essas as ligações que somem.

**Medido.** Geometria refeita e varredura dos dois PNGs:

| Ligação baixada | Comprimento | Sob o revestimento (geometria) | Sob tinta acesa (PNG escuro e claro) | Trecho próprio à vista |
|---|---|---|---|---|
| Redes pagas com Display | 128,7 px | 73,1% | 59,6% e 59,6% | 0 px |
| Busca orgânica com Acesso direto | 115,1 px | 71,8% | 53,4% e 53,4% | 19,8 px |
| Indicação com Base de e-mail | 115,1 px | 50,8% | 48,4% e 48,4% | 35,2 px, sem a volta |
| Display com Acesso direto | 169,5 px | 41,2% | 26,4% e 26,0% | 83,7 px |
| Redes pagas com Redes orgânicas | 215,9 px | 27,8% | 23,5% e 23,1% | 110,6 px |
| Base de e-mail com Busca orgânica | 197,0 px | 26,2% | 18,4% e 17,7% | 111,8 px |
| outras 4 que dividem nó com uma acesa | 128,7 a 161,5 px | 16,7% a 21,7% | 9,7% a 14,4% | 17,6 a 74,6 px |
| as 4 que não tocam nenhuma acesa | 115,1 a 144,9 px | 0% | 0% | 43,7 a 62,7 px |

"Trecho próprio" é o comprimento a mais de 2,85 px do eixo de qualquer acesa e a mais de 1,2 px de qualquer outra baixada. Na primeira linha, os 27% que escapam do revestimento correm fundidos com a ligação de Redes pagas com Marketplace. Tirar só o revestimento não resolve: 66,5%, 64,8% e 35,3% das três primeiras ficam debaixo do próprio traço aceso.

**Por que reprova.** A ligação é o dado (ACE-6), e a própria peça defende isso ao segurar a baixada acima de 3:1. Traço coberto é traço apagado: quem olha não sabe que Redes pagas e Display dividem jornada, e lê em Indicação uma ligação que acaba no nada. É sobreposição com consequência visível nos dois PNGs, e não constante de acabamento.

**O que mudar.** Fazer as ligações do mesmo nó saírem em ângulos diferentes, para a acesa cruzar as baixadas em vez de correr por cima delas. O caminho mais curto é tirar o ponto de controle do centro em direção ao meio da corda do par, tanto mais quanto mais próximos os dois nós estão na volta. O catálogo pede o controle no centro; aqui o contrato vence (ACE-6), e o desvio se declara no `notes` do `meta.json` e no README, como já foi feito com o rótulo girado e com `--line-strong`. Outra saída que cumpra o critério abaixo também serve.

**Simulação da saída, fora do componente e sem render.** Controle em `centro + k × (meio da corda − centro)`:

| Regra de `k` | Pior cobertura pelo revestimento | Pior trecho próprio | Laço de vizinhos chega a |
|---|---|---|---|
| 0, a de hoje | 73,1% | 0% | 53 px do centro |
| 0,5 fixo | 54,8% | 4% | 80 px do centro |
| 0,75 × (1 − distância angular ÷ 180) | 37,6% | 37% | 89 px do centro |
| 1 − distância angular ÷ 180 | 21,6% | 67% | 101 px do centro |

Com a última regra o par de vizinhos vira um arco raso a 7 px do arco de grupo, que tem 2 px e fica no raio dos nós (108 px): confira no render se os dois não se confundem, e se for o caso segure `k` um pouco abaixo. O valor fixo não basta.

**Critério de aceite, proposto pelo revisor porque o contrato não escreve número para isso.** Nos dois PNGs: (1) nenhuma ligação baixada com mais de um quarto do caminho debaixo de tinta acesa; (2) toda ligação baixada com trecho próprio que inclua o meio dela, de modo que nenhuma termine em cima de uma acesa; (3) as ligações contadas na legenda são as que se conseguem contar no desenho.

**O que fica como está.** A opacidade de 0,76 da baixada, os 2,5 px e o revestimento da acesa nos cruzamentos, os arcos de grupo, a vaga do nome do grupo, o rodapé e a frase acessível passam e não precisam mudar.

**O que acompanha a mudança.** Em `meta.json`: a linha de `demonstrates` que fala em controle no centro e o `notes`. No README: o primeiro parágrafo, o item 5 da Anatomia, a seção de desvios declarados e a pendência do laço estreito. Render nos dois temas e `check` de novo; a colisão de rótulos não muda, porque os nós ficam onde estão.

### O que não reprova na `v2`

Está no README, em três linhas: legenda abaixo do desenho e contagem fora de coluna (ROT-4, ROT-5), par nó aceso contra nó comum sem medida no `notes` (TOK-9), e o comentário do `data.ts` que conta dois empates onde há três.

## Notas para quem corrige

* **A `v3` usa a mesma curva e não está reprovada.** Nela não há ligação acesa nem revestimento, a cor é uma só e os quatro laços de vizinhos se leem pela volta. Mas 95% do caminho de Vendas A com Vendas B e 85% do de Vendas C com Vendas D correm a menos de 1,2 px de outra linha. Se a `v2` mudar o ponto de controle, o modelo fica com duas geometrias; alinhar a `v3` é desejável e pede nova revisão dela, porque o código muda.
* **A `v4` tem um ramo não fotografado que colide, pela conta do código.** Os dois anéis partem da mesma costura. Com 1 indicação no trimestre e as 5 do histórico do dado, o nó novo fica a 180 graus, em cima do raio tracejado de C58: o rótulo dele ocupa de cerca de 37 a 57 px em x, o halo cobre o tracejado entre os dois nós e a caixa encosta no anel vazado de C58, que vai de 29 a 39 px. O mesmo acontece sempre que os dois anéis têm a mesma quantidade de nós. Ficou como observação porque o estado que a versão demonstra, o zero medido, está correto nos dois temas, e porque não foi medido em render. Se a rodada de correção abrir o arquivo, girar o anel do trimestre para os vãos do histórico resolve.
* **Nenhum outro bloqueante foi achado nas quatro.** A varredura cobriu as 32 perguntas e as regras TIP, COR, EIX, ROT, NUM e ACE que cada versão exercita antes de este parecer ser escrito.
