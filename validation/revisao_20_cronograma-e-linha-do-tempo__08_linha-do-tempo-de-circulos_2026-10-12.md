# Parecer de revisão: 20_cronograma-e-linha-do-tempo/08_linha-do-tempo-de-circulos

Data: 2026-10-12. Revisor independente, primeira passada das quatro versões. `npm run check`: 0 erros, 4 avisos (`AGREGACAO-ZERO`, um por versão; conferido que o zero do ramo sem denominador só vira geometria e não chega a texto).

Como foi medido: nos PNGs de `_render/.qa/20_cronograma-e-linha-do-tempo/08_linha-do-tempo-de-circulos/`, que têm 2 px de imagem por px de CSS, lidos pixel a pixel nos dois temas; nos `preview.svg` de cada versão (raio e caminho de cada símbolo); e no pacote instalado `recharts 3.10.1`. Contraste pela fórmula da WCAG. A diferença entre página e arquivo ficou em no máximo 0,07% dos pixels nas oito imagens.

| Versão | Resultado | Não |
|---|---|---|
| `v1_fechamentos-por-executivo` | aprovada | nenhum |
| `v2_receita-por-produto-com-maior-mes` | aprovada | nenhum |
| `v3_regua-micro-de-eventos-sob-sparkline` | reprovada | 12 |
| `v4_estornos-e-meses-sem-coleta` | aprovada | nenhum |

As observações não bloqueantes das quatro estão no README do modelo, seção `Observações da revisão (não bloqueantes)`. Este arquivo trata do que reprova e do que foi pedido na mesma passada.

Não se aplica, nas quatro: perguntas 6, 26, 27, 28, 31 e 32. A 13 só se aplica à `v2` e à `v4` (rótulo com halo, sem corte). A 29 só se aplica à `v3` e passa. A 30 se aplica à `v1`, à `v2` e à `v4` e passa, com os números no README.

## v3_regua-micro-de-eventos-sob-sparkline

Resultado: reprovada. Um bloqueante, igual nos dois temas, e um conserto pedido na mesma passada. O resto confere com o dado: os dois painéis dividem domínio e margem e caem na mesma coluna de pixels (pergunta 29: 10/02 em x de 158, 16/03 em 237, o grupo em 282, 08/06 em 433, 20/07 em 531 e 24/08 em 613, em px de imagem, todos a menos de 1 px da conta feita com 572 px de plotagem para 245 dias; o joelho do sparkline em 06/04 cai em 287); a queda de R$ 120 para R$ 104 e os 3 eventos a até 14 dias batem com o `data.ts`; o contador usa `--accent-cyan-contrast` sobre `--chart-1` (ROT-6); sparkline sem área (EIX-2); frase acessível de 217 caracteres; estado vazio da EST-1 com menos de 3 semanas (EIX-11).

### Bloqueante único. Pergunta 12. ROT-4 e identificação das marcas (seção 14.1)

**O que o desenho faz.** A legenda tem quatro entradas, e duas delas são o mesmo desenho: um disco liso em `--chart-1`. "Verba" é um disco de 8 px e "Agrupados" é um disco de 10 px, sem contador. Na régua, a marca agrupada é outra coisa: um disco de 14,5 px com o algarismo dentro. A amostra de "Agrupados" não se parece com a marca que ela nomeia e se parece com a amostra de outra categoria.

**Evidência.**

* `Chart.tsx`, linha 150: `r={count === undefined ? 4 : 5}`. A única diferença entre a amostra de "Verba" e a de "Agrupados" é 1 px de raio.
* `Chart.tsx`, linhas 261 a 264: `<Swatch count={2} shape="circle" />` com o texto "Agrupados". O `count` não é desenhado, só escolhe o raio.
* `Chart.tsx`, linhas 135 a 145: `GroupMark` desenha `<circle r={GROUP_RADIUS}>` com `GROUP_RADIUS = 8` e o texto do contador por cima.
* PNG, igual nos dois temas, caixa de tinta de cada mancha na cor da marca: amostra "Verba" 8 por 8 px; amostra "Agrupados" 10 por 10 px; na régua, verba 7 a 7,5 px, marca agrupada 14 a 14,5 px com o "3".
* A marca agrupada usa o círculo, que é a forma de "Verba", para um grupo que no dado padrão tem um canal, uma verba e um criativo. O `notes` do `meta.json` declara que ela "vale para tipos misturados"; a legenda era o lugar de dizer isso, e hoje não diz.

**Por que pesa.** Identificação das marcas está na lista da seção 14.1 que bloqueia sempre, e a ROT-4 pede amostra na forma da marca. Quem lê só a legenda vê dois discos lisos da mesma cor com nomes diferentes, separados por 2 px de diâmetro, e nenhum deles é a marca com contador que aparece na régua. O leitor chega a "Agrupados" por eliminação, não pela amostra, e o "3" dentro de um disco, que é a forma de "Verba", se lê como três verbas, o que é falso neste dado. Foi pesado o que joga a favor: a dica lista os três eventos e a linha de leitura fala em "3 eventos". A dica não conta no desenho parado, e a linha de leitura não liga o número à forma.

**O que mudar.**

1. Desenhar a amostra de "Agrupados" na forma da marca: o mesmo disco de 16 px com um algarismo dentro, vazado em `--accent-cyan-contrast`, saído de `formatInt` para não acordar a `NUMERO-CRU`. A linha da legenda tem cerca de 16,5 px de altura e ocupa cerca de 253 dos 294 px de largura, então cabe sem mexer no canvas.
2. Ou, no lugar disso, dar à marca agrupada uma forma que nenhum tipo usa (anel, cápsula), na régua e na legenda. Em qualquer das duas saídas, "Verba" e "Agrupados" precisam se separar por forma, não por 2 px de diâmetro.
3. Conferir nos dois PNGs que a legenda continua numa linha e que o corpo de 302 por 195,5 px fecha.

### Na mesma passada: o `ZAxis` de range fixo não entrega o range

Sozinho este ponto seria observação pela seção 14.1, porque a diferença é de 0,21 px de raio e não se vê. Entra aqui porque o terceiro item do `demonstrates` é exatamente esta técnica ("ZAxis de range fixo quando o evento não tem magnitude"), e hoje a linha está inerte: quem copiar a versão e trocar `SINGLE_AREA` não vê nada mudar.

**Evidência.**

* `Chart.tsx`, linha 51: `SINGLE_AREA = 70`. Linha 231: `<ZAxis range={[SINGLE_AREA, SINGLE_AREA]} type="number" />`, sem `dataKey` e sem `domain`.
* `preview.svg`: os dois círculos saem com raio de 4,514 px, área de 64,01 px²; os triângulos saem como `M0,-7.019L6.079,3.51L-6.079,3.51Z`, área de 64,0 px²; o losango sai como `M0,-7.445L4.298,0L0,7.445L-4.298,0Z`, área de 64,0 px². Com 70 px² o raio do círculo seria 4,720 px.
* 64 px² e 4,514 px são os números que a `REC-31` do `ARMADILHAS.md` dá como sinal de que o `range` não chegou. O comentário da linha 230 cita a `REC-15` e a `REC-31` como resolvidas, e o preview mostra que não estão (`DAD-10`: revisar contra o desenho, nunca contra o comentário).
* Leitura do pacote `recharts 3.10.1`, não testada em render: `selectZAxisWithScale` (`lib/state/selectors/axisSelectors.js`, linha 1441) devolve indefinido quando o eixo Z não tem escala, e sem `dataKey` nem `domain` não há domínio de onde tirar a escala; aí `computeScatterPoints` lê `implicitZAxis.range`, que é `[64, 64]` (`lib/cartesian/Scatter.js`, linha 409).

**O que mudar.**

1. Fazer o `ZAxis` ganhar escala: um `domain` explícito (por exemplo `domain={[0, 1]}`) ou um `dataKey` de valor constante. É o caminho provável pela leitura do pacote; quem decide é o `preview.svg`.
2. Conferir no `preview.svg` que o raio do círculo virou 4,720 px, que é `√(70/π)`. Se a escolha for ficar com 64 px², declarar 64 na constante e tirar a promessa do comentário.
3. Refazer a conta do limiar de agrupamento se a área mudar: hoje a meia base do triângulo mede 6,08 px e o raio do círculo 4,51 px.

**Régua.** O mesmo 64,0 aparece no preview de `16_distribuicao/03_strip-plot-e-beeswarm/v1` (declara 46) e no losango de `16_distribuicao/13_q-q-plot/v1` (declara 50). Não investiguei as duas; fica o indício de que a saída da `REC-15`, `<ZAxis range={[n, n]} />` sem mais nada, não entrega no pacote instalado, e de que a `REC-31` tem uma terceira condição além das duas que lista.

## O que foi pesado e não reprovou

* **Grade nos dois sentidos na `v1`, na `v2` e na `v4`.** A EIX-3b não se aplica pela letra, porque o eixo Y é faixa e não grandeza. Não está na lista da 14.1 que bloqueia sempre e não produz colisão, corte nem tique perdido; o acervo tratou o mesmo caso como observação em `09_dispersao-e-bolhas/04_bolhas-em-grade-categorica/v1`.
* **Anel do estorno sobre a bolha na `v4`**, 1,01:1 no escuro e 1,86:1 no claro. A ACE-3 isenta a marca com o valor escrito junto dela, e o rótulo com sinal está logo abaixo; em simulação de daltonismo o par continua separado pela cor.
* **"Total em 24 meses" escrito à mão na `v2`.** Verdadeiro no dado padrão, então o desenho não afirma nada falso; envelhece com outro recorte.
* **Contorno de 1 px que come área das bolhas pequenas**, nas três versões com área. O caminho mede exato e a `RAIO-CONTRA-AREA` passa; é a convenção da família 09.
* **Título "por semana" na `v1`** com um círculo por fechamento. Redação do catálogo; a legenda e a linha de leitura dizem o que o círculo é.

## Registro

```
Versão: 20_cronograma-e-linha-do-tempo/08_linha-do-tempo-de-circulos/v3_regua-micro-de-eventos-sob-sparkline
Data: 2026-10-12
Resultado: reprovada
Não: 12
Correções:
  12. ROT-4: desenhar a amostra de "Agrupados" na forma da marca, com o contador, ou dar ao agrupado forma que nenhum tipo usa.
  Na mesma passada. REC-31: fazer o ZAxis entregar os 70 px² declarados, ou declarar os 64 que o desenho usa.
Não se aplica: 6, 13, 26, 27, 28, 30, 31, 32
```
