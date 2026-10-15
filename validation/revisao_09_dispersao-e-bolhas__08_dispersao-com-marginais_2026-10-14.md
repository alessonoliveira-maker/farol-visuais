# Revisão de 09_dispersao-e-bolhas/08_dispersao-com-marginais, 2026-10-14

Primeira passada de três versões nunca julgadas: `v2_corte-no-pico-da-distribuicao`,
`v3_leads-com-tempo-em-escala-log` e `v4_cauda-longa-recolhida`. A v1 já estava aprovada desde
2026-09-19 e não foi julgada de novo.

* `npm run check -- 09_dispersao-e-bolhas/08_dispersao-com-marginais`: 4 versões, 0 com erro, 0 aviso.
  ESPESSURA-MARCA e CONTRASTE-MARCA não medem nenhuma versão (`preview_com_transform`), então a
  espessura e o contraste de marca foram conferidos à mão contra as notas do `meta.json`.
* Diferença entre `preview` e `pagina` nos PNGs, limiar de 48 por canal: v2 0,003% nos dois temas,
  v3 0,000%, v4 0,000% e 0,002%.
* Resultado: v2 aprovada; v3 e v4 reprovadas, um bloqueante cada. As observações que não reprovam
  foram para o README do modelo, no parágrafo datado de hoje.

## v3_leads-com-tempo-em-escala-log: reprovada

### Bloqueante 1. Pergunta 1 (o que o catálogo diz que a versão demonstra); REC-31 e REC-15

**Evidência.** O catálogo põe entre o que a versão demonstra "Pontos com opacidade 0,25 e raio
pequeno para volume alto". A opacidade foi trocada por 0,70 com a ACE-5 medida e declarada, e isso
está certo: o contrato vence. O raio não. O `Chart.tsx` declara `POINT_RADIUS = 1.5` (linha 75) e o
comentário diz "Raio de 1,5 px para 2.000 marcas"; a nota do `meta.json` diz "A versão fica com 0,70
e raio de 1,5 px". No `preview.svg` e no `preview-claro.svg` os 2.000 pontos saem com
`d="M4.514,0A4.514,4.514,..."`, isto é, **raio de 4,514 px**, três vezes o declarado e nove vezes a
área. É exatamente `√(64/π)`, o padrão do `implicitZAxis` do Recharts que a REC-31 descreve.

A causa provável está no pacote: `Scatter.js:401` usa `zAxis ? zAxis.range : implicitZAxis.range`, e
`selectZAxisWithScale` (`state/selectors/axisSelectors.js:1389` a `:1392`) devolve `undefined` quando
o eixo não tem escala, o que acontece com o `<ZAxis range={...} type="number" />` sem `dataKey`. O
`03_bolhas/v1`, com `dataKey`, desenha raios variados; as quatro versões deste modelo e
`01_dispersao-simples/v4`, sem `dataKey`, desenham todas 4,514 px.

A consequência aparece nos dois PNGs: com pontos de 9 px de diâmetro, as linhas de 2 a 5 tentativas
viram faixas contínuas de tinta entre cerca de 10 min e 3 h, e a peça mostra a mesma marca que a v2
usa para 48 campanhas. A versão não demonstra o "raio pequeno para volume alto" que o catálogo
promete, e o arquivo afirma um número que o desenho não tem (a classe da DAD-10).

**O que mudar.** Fazer o raio desenhado ser o declarado: ou uma `shape` própria que desenhe
`<circle cx cy r={POINT_RADIUS} />` com a cor e a opacidade de hoje, ou um `ZAxis` com `dataKey`
apontando para um campo constante, com domínio e `range` fixos. Conferir no `preview.svg` que o `d`
do path passa a ser `M1.5,0A1.5,...` e refazer a conta da ACE-5 se a cor ou a opacidade mudarem.
Nada mais nesta versão precisa mudar para ela passar.

## v4_cauda-longa-recolhida: reprovada

### Bloqueante 1. Pergunta 1; condição central do modelo (README, Anatomia 5 e Quando evitar); COR-3

**Evidência.** O catálogo pede, como primeiro item do que a versão demonstra, "Barra final acima de
com a contagem dos valores além do P99 no marginal". No dado fixo o P99 é 191 dias e os valores além
dele são cinco, os mesmos cinco que passam dos 200 dias do domínio: 238, 305, 441, 617 e 902 dias. A
versão não desenha essa barra. Em vez dela, a oitava faixa do marginal do topo virou faixa aberta,
"175 dias ou mais", e escreve **51**, em `--chart-5`.

Três coisas decorrem disso, e todas aparecem nos dois PNGs:

1. A barra de 51 fica sobre a coluna de 175 a 200 dias do plano, e essa coluna tem **46** pontos. O
   modelo existe para que a barra conte o que está debaixo dela; o próprio README, em Quando evitar,
   diz que com domínio diferente do plano "as barras deixam de corresponder aos pontos". É o que
   acontece aqui, na faixa exata de que a versão trata.
2. As cinco recolhidas estão desenhadas na reserva de 72 px à direita do plano, e o marginal do topo,
   que repete essa reserva, fica vazio sobre elas (de 447 a 519 px no PNG, em pixel de CSS). Elas são
   contadas numa coluna e desenhadas em outra.
3. A chave dá o rosa a "Recolhidas na borda, 5 oportunidades", com amostra de triângulo, e o mesmo
   rosa pinta uma barra de 51 que a chave não nomeia. Quem liga a cor à chave lê 51 recolhidas; quem
   resolve a contradição precisa do rodapé. Uma cor com dois referentes é papel de cor, que a 14.1
   manda reprovar sempre.

O rodapé e a nota do `meta.json` declaram a faixa aberta, e a declaração está correta; o problema é
que ela declara um desvio da condição do modelo em vez de cumpri-la, e o item do catálogo não foi
entregue, só reescrito no `demonstrates`.

**O que mudar.** Manter a faixa de 175 a 200 dias como faixa comum de 25 dias, com 46, em
`--line-strong` e com a contagem escrita, e desenhar na reserva do marginal do topo, alinhada sobre
os triângulos, uma barra própria "acima de 200 dias" com a contagem das recolhidas (5) em
`--chart-5`, com o limiar escrito junto dela. A conta de posição pode ser a mesma `usePlotArea` da
`ClampedEdgeLayer`. Rodapé e frase acessível passam a citar essa barra, e não mais a faixa aberta
(hoje a frase termina em "a última faixa conta 51", sem substantivo). Na mesma passada, sem que isso
reprove: o raio declarado de 3 px sai 4,514 px pelo mesmo motivo da v3, e a amostra da chave usa 3.

## Registro do parecer

```
Versão: 09_dispersao-e-bolhas/08_dispersao-com-marginais/v2_corte-no-pico-da-distribuicao
Data: 2026-10-14
Resultado: aprovada
Não: nenhum
Não se aplica: 6, 26, 27, 28, 30, 32

Versão: 09_dispersao-e-bolhas/08_dispersao-com-marginais/v3_leads-com-tempo-em-escala-log
Data: 2026-10-14
Resultado: reprovada
Não: 1
Correções:
  1. REC-31 e REC-15: fazer o raio desenhado ser o de 1,5 px declarado e conferir o d no preview.svg.
Não se aplica: 6, 13, 18, 26, 27, 28, 31, 32

Versão: 09_dispersao-e-bolhas/08_dispersao-com-marginais/v4_cauda-longa-recolhida
Data: 2026-10-14
Resultado: reprovada
Não: 1, 9
Correções:
  1. Anatomia 5 do modelo: faixa de 175 a 200 dias comum, com 46, e barra própria acima de 200 dias, com 5, na reserva do topo.
  9. COR-3: o rosa passa a pintar só as recolhidas, triângulo e a nova barra, que a chave já nomeia.
Não se aplica: 6, 13, 18, 26, 27, 28, 30, 32
```

## O que foi pesado e não reprovou

* **Tique da borda fora da linha de grade (as três).** `40%` em 11,25 px contra a grade em 8 px e
  `R$ 200` com o centro 10,7 px à esquerda da última linha na v2; `7 dias` cerca de 7,5 px na v3;
  `R$ 400 mil` 3,25 px na v4. É o `preserveEnd` da emenda de 2026-10-02 da EIX-6b, com peso de
  constante de acabamento. Os quatro continuam sobre a linha que nomeiam e ninguém lê valor errado,
  o mesmo critério da revisão de `21/06` de 2026-10-13. Observação.
* **Divisórias da v2 sem rótulo próprio.** O corte de R$ 90 é nomeado na linha de leitura e os dois
  valores estão no rodapé; a divisória vertical atravessa a faixa acesa, que é o segundo canal da
  COR-2. Falta o rótulo junto da linha (ANO-2, ANO-3), e isso vai como observação.
* **Faixa vazia da v2 sem `0`.** A faixa de R$ 0 a R$ 25 não desenha barra nem número (REC-11). A
  altura zero é o encoding certo e os sete números somam 48. Mesma decisão da v1. Observação.
* **Eixo vertical da v3 sem unidade.** "Tentativas" está no título e no rodapé, como no precedente
  de `01_dispersao-simples/v3`; o caso que reprovou em `03_bolhas` foi a palavra ausente do cartão
  inteiro. Observação.
* **Raio de 4,514 px na v2 e na v4.** Declarados 4 e 3, sem colisão nem perda de leitura. Observação;
  na v3 o raio é item do catálogo, e ali reprova.
* **Cor da cauda na v4.** `--chart-5` fora da ordem da COR-8 e o texto das recolhidas em cor
  categórica, com contraste medido acima de 4,5:1. Observação.

## Defeito de régua notado

A saída da REC-15 manda `<ZAxis range={[n, n]} />`, e no `recharts 3.10.1` instalado esse `ZAxis`,
sem `dataKey`, não chega ao `Scatter`: o raio cai no padrão de 4,514 px. A REC-31 lista duas condições
em que o `range` não chega, e esta não está entre elas. O acervo já tem a consequência sem ninguém
ter visto: `01_dispersao-simples/v4` declara 2 px e desenha 4,514, e as quatro versões deste modelo
também. Nenhuma guarda compara o raio declarado com o desenhado.
