# Revisão de 16_distribuicao/08_ridgeline

Data: 2026-10-05. Revisor independente. `npm run check -- 16_distribuicao/08_ridgeline`: 0 com erro,
9 avisos (8 de `AGREGACAO-ZERO` em limite de desenho, 1 de `CONTRASTE-MARCA` na `v2`).

| Versão | Resultado |
|---|---|
| `v1_ciclo-mes-a-mes` | aprovada |
| `v2_executivo-em-foco` | aprovada |
| `v3_cpl-por-campanha-em-18-meses` | aprovada |
| `v4_mes-sem-campanha` | reprovada, 1 bloqueante |

As observações não bloqueantes das quatro estão no README do modelo.

## v4_mes-sem-campanha

```
Versão: 16_distribuicao/08_ridgeline/v4_mes-sem-campanha
Data: 2026-10-05
Resultado: reprovada
Não: 1, 15
Correções:
  15. ESP-3: os traços do mês de amostra pequena precisam ficar inteiros, à frente da faixa seguinte.
  1. demonstrates 3: um traço por campanha tem de valer para qualquer dado, não só para o do preview.
Não se aplica: 6, 13, 18, 27, 28, 29, 30, 31, 32
```

### Bloqueante único: a faixa seguinte cobre os traços da amostra pequena

**Perguntas 15 e 1. Regra ESP-3 (sobreposição no render) e o terceiro item do `demonstrates`.**

Evidência, lida no `preview.svg` e vista nos dois PNGs:

- A linha de `abr/26` (n 11) desenha 11 traços de 12 px, de y 66,4 a y 78,4, dentro do próprio `<g>`.
- `mai/26` é desenhada depois, com preenchimento opaco e contorno de 1,5 px na cor do cartão. O pico
  dela chega a y 69,85, ou seja, 8,55 px acima da linha de base de `abr/26`.
- Resultado medido, traço a traço: R$ 33,10 mostra 9,32 px; R$ 36,60 mostra 5,06 px; R$ 50,30 mostra
  9,07 px; R$ 51,70 mostra 10,30 px; os outros 7 mostram os 12 px. Quatro de 11 traços cortados, o
  pior com 42% do comprimento.
- No PNG os traços de `abr/26` saem com alturas diferentes, e altura diferente num desenho de traços
  se lê como grandeza. O traço não codifica nada além da posição.
- O defeito é da geometria, não do dado de teste: a faixa de pico global sobe `PEAK_H * OVERLAP`,
  11,2 px, para dentro da linha de cima, e `MARK_H` é 12. Com a vizinha no pico global e uma campanha
  na moda dela, sobram 0,8 px menos 0,75 px de contorno, 0,05 px. O traço some e a linha continua
  escrevendo `n 11` com 10 traços na tela. É a versão que existe para mostrar "um traço por campanha".

O que mudar (uma correção, escolha do corretor entre as saídas, desde que o resultado se meça):

1. Os traços do mês pequeno saem do `<g>` da linha e vão para uma passada posterior a todas as curvas,
   ou a faixa seguinte deixa de invadir a linha de um mês sem curva.
2. Se forem para a frente, cada traço precisa de separação da curva de baixo: `--chart-1` sobre
   `--chart-1` some. Um traço de apoio em `--surface-raised` mais largo por baixo de cada um resolve,
   no mesmo par do corte da mediana.
3. Conferência pedida depois da correção: os 11 traços com os 12 px visíveis nos dois temas, e o mesmo
   resultado trocando `abr/26` por um mês vizinho da faixa de pico global.

### Mesmo conserto, sem consequência no preview (tratar na mesma passada)

- A linha pontilhada e o texto `sem campanha` de `mar/26` ficam no `<g>` da linha e seriam cobertos do
  mesmo jeito por uma curva em `abr/26`. Hoje não são, só porque `abr/26` não tem curva. O texto fica
  em x de 112 a 185, de R$ 4 a R$ 37, exatamente onde a subida de uma curva de CPL passa.
- O rótulo `amostra pequena` está 6 px à direita do maior traço, na altura de y 72,4; a cauda de uma
  faixa seguinte mais larga passaria por cima dele. Vale a mesma passada da frente, com halo (ROT-7).
- O ramo de amostra pequena da `v1`, da `v2` e da `v3` tem a mesma geometria e nenhum dado o exercita.
  Não reprova nenhuma delas; se o corretor consertar a `v4`, leve o mesmo trecho para as três.

### O que está certo na v4 e não deve ser mexido

Mês vazio sem linha de base sólida, sem `n` e fora da banda e do pico global; lista vazia no dado e
nenhum cálculo sobre ela; ordem cronológica mantida com o rótulo `mar/26` no lugar; régua única em
reais a partir do zero; rodapé que nomeia a pontilhada e os traços; frase acessível com a contagem de
mês sem campanha e de amostra pequena; conta do canvas `card` fechada sem sobra nem corte.
