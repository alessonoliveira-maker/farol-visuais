# Parecer de revisão: 17_comparacao-de-pontos/02_dot-plot-com-intervalo

Data: 2026-10-05. Revisor independente. `npm run check`: 0 com erro, 1 aviso (v2, frase acessível com 239 caracteres, a 11 do teto).

Resultado: `v1` e `v2` aprovadas; `v3` e `v4` reprovadas. Este arquivo é o insumo do corretor para as duas reprovadas. Há uma única rodada de correção: os itens marcados "corrigir junto" não reprovam sozinhos, mas saem na mesma passada.

## v3_primeiro-contato-com-leads-ao-fundo: reprovada

Não: 3, 20, 30.

### Bloqueante 1. Perguntas 20 e 30, ACE-3 e ACE-5: os casos ficam abaixo de 3:1 nas linhas de zebra do tema claro

Evidência. `CASE_OPACITY = 0.72` sobre `--text-muted`, e o comentário diz "mínimo para passar de 3:1 nos dois temas". A conta foi feita só contra `--surface-raised`. Três das seis linhas (as de posição ímpar: Caio M., Renan A., Talita V.) têm `ReferenceArea` em `--surface-sunken` atrás dos pontos, e o fundo adjacente da marca ali é a zebra, não o cartão. Medido com os hex de `app/src/styles/tokens.css`:

| Tema | 0,72 sobre `--surface-raised` | 0,72 sobre `--surface-sunken` |
|---|---|---|
| Escuro | 3,35:1 | 3,58:1 |
| Claro | 3,05:1 | **2,79:1** |

Vale também para os triângulos de estouro, que usam o mesmo `fillOpacity`. A guarda OPACIDADE-MARCA passou porque só compõe contra o cartão.

O que mudar. Medir a opacidade contra o pior fundo que a marca recebe. No claro sobre `--surface-sunken`: 0,75 dá 2,93:1, 0,78 dá 3,10:1, 0,80 dá 3,22:1. Subir `CASE_OPACITY` para 0,80 ou mais, ou tirar a zebra desta versão. Corrigir o comentário da constante e a nota do `meta.json`, que citam 0,72 como mínimo, e o item 4 da Anatomia no README segue o novo número (o README é do produtor).

### Bloqueante 2. Pergunta 3, especificação da versão ("deslocamento vertical por hash do id"): a nuvem sai em duas fileiras por SDR

Evidência. `hash01` é FNV-1a sem mistura final, aplicado a ids sequenciais (`lead-0001` a `lead-0900`). Trocar o último dígito move o hash em cerca de 0,004, então os ids vizinhos de um mesmo SDR caem quase no mesmo deslocamento. Medido no `preview.svg`, deslocamento em px a partir do centro da linha, de 21 px disponíveis (`JITTER_SPAN` 0,7 x 30 px):

| Linha | n desenhado | Deslocamentos ocupados | Pontos separáveis (centro a 1,5 px ou mais de outro) |
|---|---|---|---|
| Renan A. | 175 | de −5 a −1 e de 5 a 9 | 115 |
| Murilo C. | 196 | de −6 a −2 e de 4 a 9 | 117 |
| Talita V. | 218 | de −9 a −5 e de 1 a 7 | 97 |

No PNG cada SDR aparece como dois cordões paralelos de contas, com um vão vazio no meio. A forma sugere dois subgrupos por pessoa que o dado não tem, e mais da metade dos 218 casos de Talita V. some debaixo de outro ponto, quando a versão existe para mostrar quantos casos sustentam a mediana.

O que mudar. Dar avalanche ao hash antes de dividir (por exemplo o finalizador de 32 bits `h ^= h >>> 16; h = Math.imul(h, 0x85ebca6b); h ^= h >>> 13; h = Math.imul(h, 0xc2b2ae35); h ^= h >>> 16`), continuando determinístico e sem `Math.random`. Conferir no render que os deslocamentos ocupam a faixa inteira de 21 px em todas as linhas.

### Corrigir junto (não bloqueantes)

* `meta.json` diz "mediana opaca de 6 px"; `MEDIAN_RADIUS = 3.5` desenha 7 px, mais o contorno. Alinhar o texto ou o raio.
* A nota de rodapé escreve "leads de agosto" à mão no `Chart.tsx`, e o `data.ts` não carrega o período; a frase acessível não cita o mês (DAD-9 ao contrário). Levar o período para o dado ou tirá-lo do Chart.
* TIP-1: o `120 min` da nota de rodapé sai em Manrope sem `tabular-nums`.

## v4_ticket-por-origem-com-amostra-pequena: reprovada

Não: 15, 20, 30.

### Bloqueante 1. Perguntas 20 e 30, ACE-3 e ACE-5: os casos ficam abaixo de 3:1 nas linhas de zebra do tema claro

Evidência. Mesma constante e mesma conta da `v3`: `CASE_OPACITY = 0.72` mede **2,79:1** no claro sobre `--surface-sunken`. As linhas de posição ímpar com casos são Indicação de clientes, Eventos e congressos e Redes sociais. Em Redes sociais os 4 pontos são a única marca de dado da linha (sem faixa e sem mediana), e é exatamente o caso que a versão demonstra.

O que mudar. Igual à `v3`: 0,80 ou mais, ou sem zebra; corrigir o comentário e a nota do `meta.json`.

### Bloqueante 2. Pergunta 15, EIX-4 e ESP-3: o eixo não termina onde o código declara, e o maior caso encosta na borda

Evidência. `X_DOMAIN = [0, 120_000]`, mas o Recharts estende o domínio numérico até o maior dado quando não há `allowDataOverflow`. No `preview.svg` o tique de R$ 120 mil cai em x = 512,24 e a borda direita da área em x = 546, com o zero em x = 160: o eixo vai de fato até R$ 131,5 mil, que é o maior ticket de Indicação de clientes. Consequência visível nos dois PNGs: uma linha de grade a mais na borda direita, sem tique e a uma distância diferente das outras, e o ponto de R$ 131,5 mil desenhado em cima dela. O domínio passa a depender do recorte, o contrário do que o comentário e o README prometem ("o domínio não pode mudar com o filtro").

O que mudar. Fechar o eixo num valor redondo acima do maior caso, com tique: por exemplo domínio de 0 a 150 mil com tiques de 50 em 50 mil (4 linhas), calculado do dado no componente como pede a EIX-4. Não usar `allowDataOverflow` para cortar o caso.

### Corrigir junto (não bloqueantes)

* O mesmo `hash01` sem avalanche da `v3`: as quatro origens grandes saem em duas fileiras e Parcerias, Redes sociais e Mailing frio saem com todos os casos num deslocamento só (−2, −4 e +8 px). Em 31 casos de Inbound do site, 27 ficam separáveis. Aplicar o mesmo finalizador.
* Os rótulos de valor nascem em cima de casos da própria linha: 3 pontos sob `R$ 38,0 mil`, 2 sob `R$ 72,0 mil` e 1 sob `R$ 64,0 mil`, meio apagados pelo halo. Ancorar o rótulo depois do maior caso da linha, como já é feito para `sem faixa`, ou numa coluna à direita.
* O halo em `--surface-raised` sobre linha de zebra aparece como mancha clara em volta de `sem faixa` (Redes sociais).
* A frase acessível não diz nenhum valor de ticket; `lead` é calculado e só serve de teste. Citar a maior mediana publicada.
* TIP-1 e ROT-8: `5` e `10` da linha de leitura e do rodapé sem `tabular-nums`; "n" no rodapé é jargão, prefira "número de negócios".
