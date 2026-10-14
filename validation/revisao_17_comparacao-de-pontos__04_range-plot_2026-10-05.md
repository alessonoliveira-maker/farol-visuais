# Parecer de revisão: 17_comparacao-de-pontos/04_range-plot

Data: 2026-10-05. Revisor independente, primeira passada. `npm run check`: 0 erros, 1 aviso (frase acessível da `v1` em 235 caracteres).

| Versão | Resultado | Não |
|---|---|---|
| `v1_amplitude-de-ticket-por-segmento` | aprovada | nenhum |
| `v2_distancia-entre-cpl-bruto-e-qualificado` | aprovada | nenhum |
| `v3_carga-das-filas-com-semana-atual-e-teto` | reprovada | 4 e 13 |
| `v4_colunas-de-faixa-de-entradas-por-semana` | aprovada | nenhum |

As observações não bloqueantes das quatro versões estão no README do modelo, seção `Observações da revisão (não bloqueantes)`. Este arquivo trata só do que reprova.

## v3_carga-das-filas-com-semana-atual-e-teto

Resultado: reprovada. Um bloqueante, e ele mora no ramo, não na foto: os dois PNGs do dado padrão estão corretos e legíveis.

### Bloqueante 1. O traço da semana atual e o rótulo do teto usam uma escala que o eixo abandona

Perguntas 4 e 13. Regras: seção 14.1 (domínio de eixo e encoding decidem o que o desenho afirma), EIX-9, ANO-3, armadilha REC-1.

**Evidência no código.**

- `Chart.tsx`, linha 106: `pixelOf` posiciona pelo quociente `Math.min(value, X_DOMAIN_MAX) / X_DOMAIN_MAX`, com `X_DOMAIN_MAX = 150` fixo.
- `pixelOf` decide a posição do traço da semana atual (linha 142) e do rótulo `teto de cada fila, 100%` (linha 155).
- O `XAxis` (linha 247) declara `domain={[0, X_DOMAIN_MAX]}` sem `allowDataOverflow`. Nesse modo o Recharts não respeita o teto do domínio: ele o estende até o maior dado.
- As cápsulas e a `ReferenceLine` do teto são posicionadas pelo eixo; o traço e o rótulo, pela constante. Enquanto o maior valor da faixa fica em 150 ou menos, as duas escalas coincidem. Passou disso, divergem.

**Medição.** Recharts 3.10.1, `parseNumericalUserDomain` de `lib/util/isDomainSpecifiedByUser.js`, a função que `axisSelectors.js` chama na linha 750:

| Domínio declarado | Domínio do dado | `allowDataOverflow` | Domínio usado pelo eixo |
|---|---|---|---|
| `[0, 150]` | `[0, 103]` (dado padrão) | `false` | `[0, 150]` |
| `[0, 150]` | `[0, 172]` | `false` | `[0, 172]` |
| `[0, 150]` | `[0, 172]` | `true` | `[0, 150]` |

**Consequência, com a área de plotagem de 322 px do preview.** Num recorte em que o maior da faixa é 172:

- Uma semana atual de 98% é desenhada em 98 / 150 = 65,3% da largura, e o eixo põe 98% em 98 / 172 = 57,0%. O traço cai 27 px à direita, na posição em que o eixo marca 112%: uma fila abaixo do teto aparece acima dele.
- O rótulo do teto vai para 66,7% da largura e a linha tracejada do teto fica em 58,1%: o rótulo se solta da linha que ele nomeia.
- Os tiques continuam em 0, 50, 100 e 150, sem tique no fim do eixo estendido.

**Por que não é hipótese remota.** O próprio `data.ts` leva a isso: `Reativação de base` tem semana atual de 172. Na semana seguinte esse valor entra na janela das últimas 8 semanas, o maior da faixa passa a 172 e o eixo se estende. O README manda colar a versão no Farol trocando só o dado.

**O que mudar.** Uma escala só para tudo o que se posiciona no eixo de valor. Dois caminhos, escolha um:

1. Manter o domínio fixo em 150 e declarar `allowDataOverflow` no `XAxis`. A faixa que passa do fim do eixo precisa então ser recortada no fim e sinalizada como a semana atual já é (seta de transbordo e valor escrito), porque cápsula cortada sem sinal esconde o maior valor.
2. Calcular o fim do domínio do dado (o maior entre 150, o maior da faixa e o teto, em passo redondo), gerar os tiques a partir dele e passar o mesmo número ao `pixelOf`. A seta de transbordo fica só para a semana atual que passa desse fim.

Em qualquer dos dois, o rótulo do teto continua na margem de cima, centrado na `ReferenceLine`, e a conferência é renderizar uma vez com um `max` acima de 150 antes de devolver o dado padrão.

### Observações da v3 que o corretor pode fechar na mesma passada

Não reprovam; estão também no README.

- DIC-1: `Reativação de base` tem 6 de 8 semanas medidas e isso só aparece na dica, enquanto a legenda afirma 8 semanas para todas as filas.
- TIP-4: o rótulo do teto em `font-display` sem `fontWeight`; declarar 500.
- TIP-3: peso 700 em toda fila acima do teto, sem limite de dois.
- A seta de transbordo para a 6 px do `172%`.

## Registro

```
Versão: 17_comparacao-de-pontos/04_range-plot/v3_carga-das-filas-com-semana-atual-e-teto
Data: 2026-10-05
Resultado: reprovada
Não: 4, 13
Correções:
  4. EIX-9 e seção 14.1: posicionar o traço da semana atual pela mesma escala que o eixo usa, e não por 150 fixo.
  13. ANO-3: o rótulo do teto acompanha a ReferenceLine em qualquer recorte.
Não se aplica: 6, 27, 28, 29, 30
```
