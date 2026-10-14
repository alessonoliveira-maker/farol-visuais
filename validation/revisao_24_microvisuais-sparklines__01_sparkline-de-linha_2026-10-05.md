# Parecer de revisão: 24_microvisuais-sparklines/01_sparkline-de-linha

Data: 2026-10-05. Revisor independente, primeira passada. `npm run check`: 0 erros, 0 avisos.

Como foi medido: nos PNGs de `_render/.qa/24_microvisuais-sparklines/01_sparkline-de-linha/`, que têm 2 px de imagem por px de CSS, e na geometria do `preview.svg`. Os três defeitos de desenho abaixo aparecem iguais no `.pagina.png`, que é a página viva, então são do componente e não do serializador. Contraste pela fórmula da WCAG sobre a cor lida no pixel.

| Versão | Resultado | Não |
|---|---|---|
| `v1_receita-com-extremos-e-valor-final` | reprovada | 15 e 19 |
| `v2_tempo-de-resposta-com-faixa-de-sla` | aprovada | nenhum |
| `v3_meta-2027-com-cauda-de-projecao` | reprovada | 13, 20 e 30 |
| `v4_origens-em-area-com-lacuna-de-coleta` | reprovada | 8, 14, 19, 20 e 30 |

As observações não bloqueantes das quatro versões estão no README do modelo, seção `Observações da revisão (não bloqueantes)`. Este arquivo trata só do que reprova. Não se aplica, nas quatro: perguntas 6, 18, 26, 27, 28, 31 e 32.

## v1_receita-com-extremos-e-valor-final

Resultado: reprovada. Dois bloqueantes, os dois visíveis no dado padrão.

### Bloqueante 1. O ponto final sai cortado pela borda direita do gráfico

Pergunta 15. Regras: ESP-3 (nada encosta na borda do corpo) e seção 14.1, constante de acabamento com consequência no render (marca partida).

**Evidência.**

- `Chart.tsx`, linha 19: `MARGIN` de 2 px nos quatro lados. Linha 126: o ponto final tem `r={3.5}` e contorno de 1,5 px, então ocupa 4,25 px para cada lado do centro.
- `preview.svg`: o `<svg>` do gráfico mede 294 por 39 px e tem `overflow:hidden`; o ponto final está em `cx="292"`. A marca iria até 296,25 e o SVG acaba em 294.
- Nos dois PNGs o ponto ocupa as colunas 645 a 653 e as linhas 398 a 407. Da esquerda para a direita as colunas têm 5, 8, 9, 10, 10, 10, 10, 9 e 8 px de altura: o lado esquerdo arredonda e o direito termina reto, numa coluna de 8 px. A tinta de `--chart-1` perde 0,75 px de CSS e o contorno some inteiro desse lado.
- É a marca de destaque da versão (primeiro item de cor do `demonstrates`), e o corte aparece igual no tema escuro e no claro.

**O que mudar.** Margem horizontal que contenha a maior marca: raio mais meio contorno dá 4,25 px, então 6 px em `left` e `right` (múltiplo de 2, ESP-1). O ponto de extremo tem 3 px de alcance e hoje só não é cortado à esquerda porque o pior mês está no índice 1; a mesma margem resolve os dois. Vale levar `top` e `bottom` para 6 px também, para o caso em que o último mês é o pico. Ajustar no `meta.json` o texto `margem de 2 px`.

### Bloqueante 2. A mesma alta sai com duas precisões, uma para quem vê e outra para quem ouve

Pergunta 19, com reflexo na 14. Regras: ACE-1 e armadilha DAD-5. A guarda `FORMATO-ACESSIVEL` trata essa divergência como erro, sem camada de aviso (`guardas.mjs`, linha 1505), e não a viu aqui porque o corpo chega ao formatador por uma função local.

**Evidência.**

- `Chart.tsx`, linha 104: o corpo escreve `signedPercent(delta)`, que usa zero casa a partir de 10% (linhas 29 a 34). Na tela: `+32%`.
- `Chart.tsx`, linha 78: a frase acessível escreve `formatPercent(Math.abs(delta), 1)`, sempre com uma casa. No `data-farol-ace` do preview: `Alta de 32,1% contra set/25`.
- A distância do melhor mês repete o desenho (linha 83 contra linha 148) e só coincide hoje porque 7,4% fica abaixo de 10%.
- É o sintoma literal da DAD-5: a tela mostra `+12%` e o leitor de tela lê `Alta de 12,4%`.

**O que mudar.** Calcular o texto de cada percentual uma vez e usar nos dois lugares, como manda a saída da DAD-5: uma função que devolve o percentual sem sinal já com os dígitos da NUM-1, usada pela frase e pelo `signedPercent`. Aproveitando a passada, a frase pode levar a base que o corpo mostra; por exemplo `Alta de 32% contra R$ 1,6 mi em set/25`, que deixa a frase em 212 caracteres.

## v3_meta-2027-com-cauda-de-projecao

Resultado: reprovada. Um bloqueante. Encoding, domínio, cor do selo, junção das linhas e contagem da linha de leitura conferem com o dado.

### Bloqueante 1. A seta que avisa o recorte do cenário alto fica por baixo da faixa

Perguntas 13, 20 e 30. Regras: ROT-7 (marca coberta por outra), ACE-3 (marca a 3:1), ACE-5 (opacidade em marca) e armadilha REC-13.

**Por que pesa.** O cenário alto de `Crédito estruturado` vai a R$ 609 mil e o domínio do cartão acaba em R$ 504 mil. A faixa é cortada, e a seta é o único sinal de que ela continua fora da caixa: é ela que mantém o recorte honesto, e o rodapé manda procurar a `Seta no topo`.

**Evidência.**

- `Chart.tsx`, linha 113: o `ChevronUp` vem antes do `ResponsiveContainer` (linha 114) dentro do mesmo `div relative`. Posicionado em absoluto e sem `z-index`, ele é pintado primeiro e o SVG do gráfico é pintado por cima.
- `Chart.tsx`, linhas 118 a 125: a `Area` da faixa não declara `fillOpacity` e herda 0,6 do pacote (`fill-opacity:0.6` no `preview.svg`). A faixa cobre a seta com 60% de `--surface-sunken`.
- `preview.svg`: a seta ocupa de x 602 a 618 e o SVG do gráfico de 342 a 617, com 4 px de margem direita. A faixa cobre a seta até x 613; só os últimos px ficam fora dela.
- Tema escuro: o corpo da seta sai em `rgb(71, 79, 95)`, que mede **2,07:1** contra o cartão e 2,28:1 contra a faixa. A ponta direita sai em `rgb(167, 180, 204)`, o `--text-secondary` inteiro.
- Tema claro: o corpo sai em `rgb(166, 175, 191)`, que mede **2,21:1** contra o cartão e 2,02:1 contra a faixa. A ponta direita sai em `rgb(65, 80, 107)`.
- Resultado nos dois temas: marca abaixo de 3:1 e partida em dois tons, um trecho apagado e uma ponta escura de cerca de 2 px.

**O que mudar.**

1. Pintar a seta por cima do gráfico: mover o `ChevronUp` para depois do `ResponsiveContainer`, ou dar a ele uma classe de `z-index`. Sobre a faixa opaca, `--text-secondary` mede 7,04:1 no claro e 9,36:1 no escuro.
2. Declarar `fillOpacity={1}` na `Area` da faixa, como a `v2` faz na `ReferenceArea`. Hoje a faixa mede 1,09:1 no claro e 1,10:1 no escuro; opaca, mede 1,15:1, o mesmo da `v2`. Opacidade herdada não aparece no código e a guarda `OPACIDADE-MARCA` não a mede.
3. Conferir nos dois PNGs que a seta sai inteira, numa cor só, e que não encosta no tracejado da projeção (hoje há 5 px entre os dois em `Crédito estruturado`).

## v4_origens-em-area-com-lacuna-de-coleta

Resultado: reprovada. Quatro bloqueantes. A escala comum de 0 a 560, a quebra de traço e área nos meses sem coleta, os totais e os 48% da linha de leitura conferem com o dado.

### Bloqueante 1. O zero medido fica coberto pela linha de base e quase igual ao mês sem coleta

Perguntas 8 e 20. Regras: EST-3 (zero medido desenha a marca), EIX-10 (lacuna não é zero), ACE-3 (marca a 3:1) e armadilha REC-13, emenda de 2026-09-29.

**Por que pesa.** A pergunta da versão é onde a coleta falhou, `sem confundir falha com zero`, e o rodapé ensina a diferença: `Traço colado na base: zero medido. Vazio: mês sem coleta`. No desenho as duas coisas quase não se separam.

**Evidência.**

- `Chart.tsx`, linha 78: a `ReferenceLine` da base é declarada antes da `Area` (linha 79), e o comentário conta com isso. No Recharts 3.10.1 a ordem do JSX não decide a pintura entre tipos: `ReferenceLine` tem `zIndex` 400 e `Area` tem 100 (`DefaultZIndexes.js`).
- `preview.svg`, linha de `Eventos presenciais`: o caminho da área, depois o caminho do traço (`L14.706,26`, com 1,5 px), e por último a `<line>` da base em `y 26`, com 1 px. A base é pintada sobre o miolo do traço.
- PNG do tema claro, mês com zero medido (x 480, 600 e 730): uma linha de `rgb(128, 178, 188)`, que mede **2,19:1** contra o fundo, duas de `rgb(220, 227, 239)` a 1,21:1 e outra de 2,19:1. Sobra do traço uma franja de 0,25 px de CSS de cada lado.
- PNG do tema claro, mês sem coleta (`Redes sociais`, x 660): só as duas linhas de `rgb(220, 227, 239)` a 1,21:1.
- Tema escuro: franja de `rgb(27, 115, 132)` a 3,42:1 e miolo de `rgb(31, 46, 71)` a 1,37:1; o mês sem coleta mostra só o miolo.
- `Eventos presenciais` tem 14 meses com zero em 18, e `Webinários` tem 10. É o caso que a versão existe para mostrar.

**O que mudar.** A base precisa ficar por baixo da área e do traço. O caminho curto é passar `zIndex` menor que 100 na `ReferenceLine` (a prop existe em `ReferenceLine.d.ts`); a alternativa é desenhar a base fora do SVG, como borda inferior do contêiner. Depois, medir no PNG claro: o mês com zero tem de mostrar o traço de 1,5 px em `--chart-1`, que mede 5,65:1 contra o fundo, e o mês sem coleta só a base. Corrigir o comentário da linha 77.

### Bloqueante 2. No tema claro a área mede 2,89:1 contra o fundo em que ela está

Perguntas 30 e 20. Regras: ACE-5 e seção 13 (moldura).

**Evidência.**

- `meta.json`: `"frame": "stage"`. A seção 13 reserva essa moldura ao visual que já é o próprio cartão, e o `Chart.tsx` não desenha cartão: a raiz (linha 162) não tem fundo. A tabela fica direto sobre `--surface-canvas`.
- `Chart.tsx`, linha 23: `FILL_OPACITY = 0.66`, com o comentário e a nota do `meta.json` dizendo que é o piso da ACE-5. Esse piso foi calculado contra `--surface-raised`, e a peça não está sobre `--surface-raised`.
- PNG do tema claro: a área sai em `rgb(91, 157, 168)` sobre o fundo `rgb(246, 248, 252)`, **2,89:1**. No escuro, `rgb(34, 146, 164)` sobre `rgb(11, 18, 32)`, 5,10:1.
- A guarda `OPACIDADE-MARCA` passou porque compõe a cor contra `--surface-raised`, seja qual for a moldura.
- No acervo, as 36 versões de `14_tabelas-visuais` usam moldura `card`, e esta é uma de duas peças `stage` sem `bg-surface-raised`.
- Colada no Farol como `stage`, a tabela iria direto na grade, sem `VisualCard` e sem o selo de procedência dele (seção 16, passo 5).

**O que mudar.** Pôr a tabela sobre a superfície do cartão. O caminho que acompanha o acervo é `"frame": "card"` com o canvas por número, pela conta da GEO-1: o corpo pede 441 px de altura (linha de leitura, cabeçalho, 10 linhas de 36 px e rodapé de duas linhas), e a moldura `card` desconta 135 px com o caso de uso em duas linhas. Atenção à largura: o cabeçalho da escala mede 205 px e leva `truncate`; as colunas fixas somam 380 px e a moldura `card` desconta 66 px, então abaixo de 652 px de canvas o teto da escala some por reticência. Refazer a nota do `meta.json` com a conta nova e medir a área no PNG claro depois do render: tem de dar 3:1 ou mais contra o fundo em que ela de fato fica.

### Bloqueante 3. `6 de 18 meses` sob o cabeçalho `Meses sem coleta` afirma o contrário do dado

Pergunta 14. Regras: NUM-6 (o número leva o que ele conta) e seção 14.1, unidade.

**Evidência.**

- `Chart.tsx`, linha 172: o cabeçalho da última coluna é `Meses sem coleta`. Linha 111: na origem de série curta a célula dessa coluna escreve `formatInt(measured)` de `formatInt(origin.leads.length)` meses, isto é, os meses **medidos**.
- Nos dois PNGs, a linha de `Chat do site` lê `Meses sem coleta: 6 de 18 meses`. No `data.ts` a origem tem 6 meses medidos e 12 vazios.
- As outras linhas da coluna (`2 meses`, `3 meses`, `1 mês`, `completa`) contam meses sem coleta, então nada avisa que nesta a conta inverteu.
- O próprio código trata os 12 meses vazios como história que não existia, e não como falha de coleta (linha 53); a tela diz 6 meses de falha.

**O que mudar.** A célula tem de dizer o que conta sem depender do cabeçalho, por exemplo `só 6 medidos`. Cabe conferir a largura: a coluna tem 112 px e o `span` leva `truncate`, e `6 de 18 meses medidos` passa disso em 12 px.

### Bloqueante 4. A frase acessível não diz onde a coleta falhou, e o catálogo promete que diz

Pergunta 19. Regras: ACE-1 (a frase diz a conclusão) e seção 14.1, versão que não demonstra o que o catálogo diz.

**Evidência.**

- Catálogo e `meta.json`, sexto item do `demonstrates`: `Frase acessível contando os meses sem coleta de cada origem`.
- `data-farol-ace` do preview, 227 caracteres: `A coleta falhou em 3 origens, 6 meses no total. 1 origem tem série curta e fica sem traço.` Conta o total e não nomeia nenhuma origem.
- `Chart.tsx`, linhas 166 e 174: o cabeçalho e as dez linhas da tabela são `aria-hidden`. Para quem ouve, a frase é tudo o que existe, e a metade `onde a coleta falhou` do caso de uso não chega.

**O que mudar.** Nomear cada origem com os meses dela, dentro do teto de 250 caracteres. Uma redação que cabe em 233: `Tabela de leads de 10 origens em 18 meses, escala comum de 0 a 560 por mês. Busca paga e busca orgânica somam 48% dos leads. Sem coleta: busca orgânica 2 meses, redes sociais 3 e indicação de clientes 1. Chat do site tem série curta.` Como a lista cresce com o dado, limitar a enumeração (as três maiores e `mais N`) para o teto valer em outro recorte. De passagem, `1 origem tem` é singular escrito à mão e sai errado com duas.

## O que a segunda passada vai conferir

- `v1`: o ponto final redondo dos dois lados nos dois PNGs, e o mesmo percentual no corpo e no `data-farol-ace`.
- `v3`: a seta inteira e numa cor só sobre a faixa, a 3:1 ou mais, nos dois temas.
- `v4`: o traço do zero medido visível em `--chart-1` e distinto do mês sem coleta; a área a 3:1 ou mais contra o fundo real no tema claro; a célula de `Chat do site` sem leitura invertida; a frase nomeando as origens sem coleta.
- A `v2` está aprovada e não precisa ser tocada. Se for, o veredito dela vira `revisao_desatualizada`.

## Pontos cegos de guarda achados nesta revisão

- `FORMATO-ACESSIVEL` não segue função local que embrulha o formatador: na `v1` o corpo usa `signedPercent`, a frase usa `formatPercent`, e a divergência de precisão passou como medida e sem achado.
- `OPACIDADE-MARCA` só lê opacidade escrita no `Chart.tsx`. A `Area` do Recharts nasce com `fillOpacity` 0,6, e na `v3` a guarda respondeu `sem_opacidade_em_marca`.
- `OPACIDADE-MARCA` compõe sempre contra `--surface-raised`. Em peça de moldura `stage` sem cartão próprio o fundo é `--surface-canvas`, e o piso gerado para o cartão não vale (na `v4`, 2,89:1 no claro com o alfa que a guarda aprova).
