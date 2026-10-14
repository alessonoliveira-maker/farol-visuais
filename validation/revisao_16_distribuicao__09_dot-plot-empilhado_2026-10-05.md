# Parecer de revisão: 16_distribuicao/09_dot-plot-empilhado

Data: 2026-10-05. Revisor independente. As quatro versões estavam em `sem_revisao`.

`npm run check -- 16_distribuicao/09_dot-plot-empilhado`: 0 com erro, 0 avisos. Os dois PNGs de cada
versão foram abertos, e as medidas abaixo saem do `preview.svg` e do `data.ts`.

| Versão | Resultado | Bloqueantes |
|---|---|---|
| `v1_dias-ate-primeira-reuniao` | aprovada | 0 |
| `v2_tentativas-ate-a-agenda-com-fila-de-revisao` | aprovada | 0 |
| `v3_quantile-dotplot-de-cenarios-de-midia` | reprovada | 1 |
| `v4_cada-ponto-vale-dez-leads` | aprovada | 0 |

As observações não bloqueantes das quatro versões estão no README do modelo, na seção final.

## v3_quantile-dotplot-de-cenarios-de-midia: reprovada

O desenho com o dado padrão está certo. Os 20 quantis de cada cenário foram recalculados fora do
componente e as contagens batem: 14, 9, 3 e 0 desfechos acima do teto de 120, com o quantil de
exatamente 120,00 do cenário de mais 30% contado do lado de dentro, como o código promete. O que
reprova está no ramo que o próprio componente decidiu tratar.

### Bloqueante 1. Pergunta 8, EST-1b e EST-2 (ausência como zero, seção 14.1: bloqueia sempre)

- **Evidência no código.** `Chart.tsx:84` a `88` declara `Row.over` como `number`. `Chart.tsx:108`
  grava `over: values === null ? 0 : values.filter(...).length`, isto é, o cenário cujo simulador não
  devolveu amostra recebe zero desfecho acima do teto. `quantile` e `outcomes` acertam o padrão e
  devolvem `null`; o zero nasce uma linha depois.
- **Por onde o zero falso chega a quem lê.** Três caminhos, todos a partir de um cenário com
  `samples: []`:
  1. `Chart.tsx:110` ordena por `b.over - a.over`, então o cenário sem simulação vai para a última
     linha, a do menor risco, e a legenda afirma "cenários em ordem de desfechos acima do teto".
  2. `Chart.tsx:144` toma `calmest = rows[rows.length - 1]` e `Chart.tsx:150` escreve na frase
     acessível "<nome> ... em 0". Quem usa leitor de tela ouve que o cenário sem simulação passa do
     teto em 0 desfechos, e é o único canal dessa pessoa, porque o `<svg>` é `aria-hidden`.
  3. `Chart.tsx:155` e `156`: com todos os cenários sem amostra, `worst.over === 0` e a linha de
     leitura afirma "Nenhum cenário passa do teto de 120 entradas qualificadas por mês".
- **Não aparece no PNG.** O `data.ts` padrão traz 40 amostras em cada cenário. É o caso que a EST-1b
  descreve: o defeito mora no ramo, não na foto. O ramo existe de propósito, porque a linha
  `simulação indisponível` está implementada em `Chart.tsx:171` a `174`.
- **O que mudar.**
  1. `Row.over` passa a `number | null`, com `null` quando `values === null`.
  2. A ordem de risco considera só as linhas com valor; as sem simulação vão depois, e a legenda
     continua verdadeira.
  3. `worst` e `calmest` saem só das linhas com valor. A frase acessível nomeia à parte o cenário
     sem simulação, com `formatUnavailable()`, e nunca com contagem.
  4. A linha de leitura só diz "Nenhum cenário passa do teto" quando existe ao menos um cenário
     simulado; com todos ausentes, o corpo é o estado de indisponível.

### Para alinhar na mesma passada (não reprovam sozinhos)

- A linha de simulação ausente leva o ícone `Unplug` em `--text-muted` junto do texto (EST-2).
- Quantil fora da régua de 40 a 200 hoje é desenhado fora da área útil. A área útil termina em
  x 746 e a coluna das contagens começa em x 758, então o ponto cairia sobre o texto. O dado padrão
  já tem amostra de 201. Saída das irmãs: contar o que ficou fora e dizer na legenda, como a `v1`
  faz com `beyond` e a `v2` com `outside`.
- O `<text>` do nome do cenário recebe `tabular-nums`, porque o nome traz número (TIP-1).

### Registro

```
Versão: 16_distribuicao/09_dot-plot-empilhado/v3_quantile-dotplot-de-cenarios-de-midia
Data: 2026-10-05
Resultado: reprovada
Não: 8
Correções:
  8. EST-1b, EST-2: over vira number | null; o cenário sem simulação sai da ordem de risco, da frase acessível e da linha de leitura.
Não se aplica: 6, 18, 27, 28, 29, 30, 31, 32
```
