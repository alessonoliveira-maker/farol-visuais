# Revisão de 09_dispersao-e-bolhas/10_matriz-de-dispersao, 2026-10-14

Revisor independente. Julgadas `v2`, `v3` e `v4`, todas `sem_revisao`. A `v1` segue aprovada desde 2026-09-19 e não foi julgada aqui.

`npm run check -- 09_dispersao-e-bolhas/10_matriz-de-dispersao`: 0 com erro, 3 avisos (ESPESSURA-MARCA da barra do histograma da diagonal, 8 e 9 px, minigráfico de densidade, esperado). COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA não medem nenhuma das três (`texto_em_html`); a sobreposição da `v4` abaixo foi medida à mão no `preview.svg`.

Medido nas três, por script sobre o `preview.svg`: as linhas de grade dão **um conjunto só** por coluna e um por linha (119, 110 e 119 linhas), as barras da diagonal caem a no máximo 0,2 px do centro das seis faixas do domínio da coluna, e nenhum ponto sai do retângulo da própria célula. Alinhamento entre painéis, domínio compartilhado e escala log não têm reparo.

## v2_plataforma-destacada-em-todas-as-celulas: reprovada

```
Versão: 09_dispersao-e-bolhas/10_matriz-de-dispersao/v2_plataforma-destacada-em-todas-as-celulas
Data: 2026-10-14
Resultado: reprovada
Não: 19
Correções:
  19. ACE-1 e seção 11: a conclusão da frase acessível é texto fixo e o dado padrão a desmente; calcular do dado.
Não se aplica: 13, 18, 27, 28, 32
```

**Bloqueante 1. Pergunta 19, ACE-1 (frase calculada do dado, seção 11).**

- Evidência no código, `Chart.tsx` linha 193: a frase termina em texto fixo, `... da plataforma B acendem nas dezesseis células e ocupam a faixa de investimento alto e CPL baixo.` Só a contagem é calculada.
- Evidência no dado (`data.ts`, as 16 de `selectedIds` contra as 48 demais):
  - investimento: mediana R$ 18,3 mil na B contra R$ 19,7 mil nas demais; média R$ 19,5 mil contra R$ 21,9 mil. 6 das 16 da B investem menos de R$ 10 mil, e a faixa de R$ 50 a 60 mil não tem nenhuma da B (o próprio histograma da diagonal mostra isso);
  - CPL: mediana R$ 108,55 na B contra R$ 103,70 nas demais; média R$ 101,37 contra R$ 102,12;
  - quadrante "investimento acima e CPL abaixo da mediana geral" (R$ 19,7 mil e R$ 105,05): 6 de 16 da B e 18 de 48 das demais, **37,5% nos dois grupos**.
- Evidência no PNG: na célula Investimento contra CPL as cheias percorrem a diagonal inteira, de cima à esquerda até embaixo à direita, como as vazadas.
- Por que bloqueia: o leitor de tela ouve uma relação que o desenho não tem. É a frase afirmando o falso, o mesmo peso de encoding desonesto pela 14.1, e a mesma frase vai para o Farol com qualquer seleção que a página passar.
- O que mudar: calcular a conclusão comparando selecionadas e restante medida a medida, por exemplo mediana das duas contra a faixa da medida, e escrever a medida em que elas mais se separam ou, quando não se separam, "espalhadas como as demais". Com o dado de hoje a única medida em que a B se distingue é a taxa de qualificação, de 9,2% a 31,8% contra 3,0% a 42,6% das demais. Outra saída, se o caso de uso pede um grupo que ocupa um lugar só: trocar o `data.ts` para a B ocupar de fato uma região, e calcular a frase do mesmo jeito. Aproveitar para trocar "as 25,0% (16 de 64)", que não concorda, por "16 das 64 campanhas (25,0%)".

Conferido e sem reparo na `v2`: neutro em contorno `--text-muted`, que é o papel "neutro de dado, sem valor escrito" da 17.2 (CONTRATO.md, linha 520), com 5,21 e 5,37 contra o cartão; destaque por forma e tamanho, cheio de 4 px contra vazado de 2,6 px, como manda a saída da `TOK-9`; a legenda na ordem das marcas com amostra na forma da marca e 25,0% mais 75,0% somando 100; estado vazio com `role="status"`; tamanhos de 12 e 11 px; nenhum 700; nenhuma opacidade.

## v4_medida-com-muitos-ausentes: reprovada

```
Versão: 09_dispersao-e-bolhas/10_matriz-de-dispersao/v4_medida-com-muitos-ausentes
Data: 2026-10-14
Resultado: reprovada
Não: 15, 31
Correções:
  15. ESP-3 e 17.7: o selo do n cobre um ponto de dado; reservar faixa própria para ele fora da área de plotagem.
  31. ROT-7 (marca fina) e GEO-4: o texto começa em cima de um ponto; quem sai do lugar é o texto, nunca a marca.
Não se aplica: 6, 12, 13, 18, 27, 28, 32
```

**Bloqueante 1. Perguntas 15 e 31, ROT-7 na exceção da marca fina, armadilha GEO-4.**

- Evidência no código, `Chart.tsx` linha 280: o n é um `<span className="absolute right-0 top-0 ... bg-surface-raised">` pintado **depois** do `ResponsiveContainer`, dentro da área de plotagem e com fundo opaco. O canto que ele ocupa é o de X alto e Y alto, onde a entidade mais extrema nas duas medidas cai por construção.
- Evidência medida no `preview.svg` (o mesmo nos dois temas): na célula CPL contra CTR (linha 2, coluna 3) o selo ocupa x de 475,67 a 516,50 e y de 196,63 a 213,13. O ponto de `camp-31` (CTR 2,8%, CPL R$ 149,7) tem centro em (477,30; 207,37) e raio 3: o centro fica **1,63 px dentro** da borda esquerda do selo, e cerca de **83% da área** do ponto some sob ele. Os outros 15 selos não cobrem ponto com o dado de hoje.
- Evidência no PNG: nos dois temas sobra uma lasca à esquerda do texto que lê como `ı n = 45`, um glifo e não um ponto. A célula anuncia 45 pontos e mostra 44 inteiros.
- O README, nas notas do produtor, afirma que o ponto "encosta na borda esquerda do halo sem entrar nele". A medida diz o contrário.
- Por que bloqueia: é sobreposição com consequência visível no preview (marca coberta), e o defeito é estrutural. Com o dado do Farol, a campanha de maior valor nas duas medidas da célula é a que some, e ela costuma ser a que interessa.
- O que mudar: tirar o n de dentro do plano. Por exemplo, aumentar `CELL_MARGIN.top` para a altura do selo mais 2 px (16,5 px do selo de 11 px, então 20 px) e assentar o selo nessa faixa, acima da linha de grade do topo, sem fundo; ou levar o n para uma faixa de rótulo própria da célula. Qualquer saída em que nenhuma posição do domínio caia sob o texto serve. Feito isso, o fundo `bg-surface-raised` deixa de ser necessário e o canto da grade de cada célula volta a aparecer. Corrigir a nota do README que descreve o ponto encostado.

Conferido e sem reparo na `v4`: ausência fora só das 7 células que dependem do CTR, nunca como zero (`number | null` no tipo, `pairs` exige as duas medidas); n por célula calculado do dado (64 e 45 conferidos contra o `data.ts`, 19 nulos); domínio de CTR não recalculado sobre os presentes; rodapé com medida, contagem e células calculadas; frase de 198 caracteres; contraste do texto `--text-muted` sobre `--surface-raised` (5,21 e 5,37); ponto `--chart-1` contra o cartão (9,50 e 6,00).

## v3_cinco-medidas-da-pre-vendas: aprovada

Sem bloqueante. Observações registradas no README do modelo, seção final, parágrafo de 2026-10-14.
