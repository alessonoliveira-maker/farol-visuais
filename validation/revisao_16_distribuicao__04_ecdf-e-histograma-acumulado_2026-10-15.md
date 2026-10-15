# Revisão de 16_distribuicao/04_ecdf-e-histograma-acumulado, 2026-10-15

Versões julgadas: `v2`, `v3` e `v4`, as três sem veredito anterior. `v3` e `v4` aprovadas, com
observações no README do modelo. `v2` reprovada por um bloqueante, que mora no ramo do sentido −1: o
preview desenha o sentido 1 e está correto nos dois temas.

`npm run check`: 0 com erro, 2 avisos, os dois da `v1` (fila de dívida da EIXO-CALMO).

## v2_histograma-acumulado-com-tres-limiares: reprovada

### Bloqueante 1. No sentido −1 o ponto cai dentro da coluna e o rodapé afirma o contrário do desenho

Pergunta 1 (a versão não demonstra o que o catálogo diz: "Parâmetro de sentido 1 ou menos 1"), com
reflexo na 17. Regras: seção 14.1 (identificação das marcas, regra que decide o que o desenho
afirma) e ANO-5 (texto calculado do dado). O peso é o mesmo da EST-1b: o defeito mora no ramo, não na
foto.

**Evidência no código.**

* Linha 106: o bin é fechado à direita (`Math.ceil(value / width) - 1`), então no −1 a coluna i mede
  `total - before` (linha 124), a fração com valor **acima** de i × 5 min.
* Linha 142: a leitura do −1 conta `value >= minutes`, maior ou igual.
* Linha 190: o ponto vai para a coluna que **termina** no limiar, nos dois sentidos.
* Linha 308: o rodapé escreve "a última coluna é a faixa aberta acima de 2 h e fecha a soma em 100%"
  sem consultar `sense`.

**Evidência por execução.** `buildBins`, `shareAtThreshold` e o centro do ponto copiados literalmente
e rodados sobre o `data.ts` publicado (520 leads). Pixels pelo plano medido no PNG escuro, 177,5 px de
100% a 0%.

| Limiar | Ponto e rótulo no −1 | Coluna marcada | Altura dela | Distância |
|---|---|---|---|---|
| 5 min | 92,31%, "92% em 5 min ou mais" | 0, de 0 a 5 min | 100,00% | 7,69 p.p., cerca de 13,6 px dentro da barra |
| 30 min | 28,85%, "29% em 30 min ou mais" | 5, de 25 a 30 min | 35,00% | 6,15 p.p., cerca de 10,9 px dentro da barra |
| 120 min | 2,50%, "3% em 2 h ou mais" | 23, de 115 a 120 min | 2,50% | coincide só porque não há lead entre 116 e 119 |

No −1 a primeira coluna mede 100% e a última, a faixa aberta, mede 2,31%; o rodapé segue dizendo que
ela fecha a soma em 100%. No sentido 1 as três leituras caem exatamente no topo da coluna (10,96%,
72,12% e 97,69%), que é o que o preview mostra.

**Por que bloqueia.** A peça se apoia em "a altura da coluna marcada é a leitura" (comentário do topo,
linhas 10 a 13). No −1 o ponto fica dentro da barra, o número escrito à direita discorda da coluna sob
o ponto, e o rodapé descreve uma coluna que o desenho não tem. O sentido é item do "O que demonstra" do
catálogo e do `meta.json`; quem colar a peça no Farol e trocar o sentido herda o erro calado.

**O que mudar.**

1. No −1, bin fechado à esquerda (`Math.floor(value / width)`, o limiar abrindo a coluna seguinte),
   para que a coluna que **começa** em t meça a fração com valor maior ou igual a t, que é o que
   `shareAtThreshold` conta. A faixa aberta passa a ser "de 2 h ou mais" nesse sentido.
2. No −1, o ponto vai para a coluna que começa no limiar, centro em `t / width + 0,5`; o de 120 min cai
   na faixa aberta.
3. O trecho do rodapé sai do sentido: no 1, a última coluna fecha em 100%; no −1, a primeira mede 100%
   e a faixa aberta guarda só os leads de 2 h ou mais.
4. Render de bancada com o default de `sense` trocado para −1, sem gravar, nos dois temas: cada ponto no
   topo da sua coluna e cada rótulo igual à altura dela. Depois volta ao 1 e o preview sai de novo.

**Na mesma passada, sem peso de bloqueio** (detalhe no README do modelo): a faixa aberta ocupa de 120 a
125 min no eixo linear sem tique próprio, e só o rodapé diz que ela é aberta; a grade vertical contraria
a segunda emenda da EIX-3b (histograma tem base ancorada, grade só na direção da leitura); o eixo
escreve 120 onde o rótulo escreve 2 h.

## v3 e v4: aprovadas

`v3`: 77 de 1.100 (7,00%) conferido no dado, a curva desenhada em R$ 400 pelo `stepBefore` mede o mesmo
7,00%, erro máximo da reamostragem 0,45% (346 valores distintos, 162 pontos). `v4`: 100 de 244 no zero
(40,98%), maior receita R$ 440.200, rótulo abaixo da guia, onde a curva nunca chega.
