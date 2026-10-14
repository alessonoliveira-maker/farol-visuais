# Medidor de cobertura de dado

## O que é

Selo colado ao indicador que diz quanto do universo tem o dado que sustenta o número ao lado. Não
fala do negócio, fala do próprio indicador: um CPL qualificado calculado sobre 40% da base não é o
mesmo número que um calculado sobre 95%. Tem duas formas em HTML com Tailwind: a fração, com o
percentual e um trilho curto na proporção, e a barra de qualidade em três segmentos de ordem fixa
(válido, malformado, ausente). O denominador sempre vem em texto, o limiar que rebaixa o número é
declarado, e ausente é categoria própria, nunca zero.

## Quando usar

- Ao lado de qualquer número calculado sobre um campo que nem todo registro tem: CPL qualificado,
  leads por origem, ticket (v1).
- Campo com três estados que o time de dados trata de formas diferentes: válido, malformado e
  ausente (v2).
- Tabela de 10 a 20 origens em que a cobertura ordena a lista e rebaixa o indicador vizinho (v3).
- Investigar se cobertura baixa é defeito de coleta ou da base, pela forma da série mensal (v4).

## Quando evitar

- Fonte com cobertura sempre de 100% por construção: o selo vira ruído.
- Cobertura como painel próprio, por campo e por fonte: use a tabela com heatmap nas células
  (14/02_tabela-com-heatmap-nas-celulas).
- Presença ou ausência de vários atributos por entidade: use a matriz de cobertura binária
  (25/04_matriz-de-cobertura-binaria).
- Denominador não definido: sem base declarada, a cobertura é ambígua e não deve ser publicada.
- Progresso contra meta: use a barra de progresso (13/01_barra-de-progresso-linear).
- Largura mínima aplicada a segmento pequeno: quebra a soma de 100%; agregue antes do componente.

## Anatomia

1. **Número principal.** `kpi-number` com `formatCurrencyCompact`; vai para `text-text-muted` com
   `TriangleAlert` quando a cobertura fica abaixo do limiar (v1, v3).
2. **Trilho e preenchimento.** Trilho em `bg-surface-sunken` (não `bg-surface-overlay`, que no claro é
   o branco do cartão) e preenchimento em `bg-chart-1` na proporção (v1, v3).
3. **Segmentos.** `flex` com vão de 2 px (`gap-0.5`, COR-5): válido em `bg-chart-1`, malformado em
   `bg-warning`, ausente só em contorno `border-text-muted` (v2).
4. **Denominador em texto.** `formatRateWithVolume` ou contagem por `formatInt`, sempre com a base
   (v1, v2, v4).
5. **Limiar declarado.** Constante no dado ou na prop, com o corte escrito em texto (v1, v3).
6. **Colunas de mês.** `div` com altura em percentual de 0 a 100% e rótulo de valor acima; anotação
   por `formatDate` e guia tracejada na célula do salto (v4).
7. **Estado vazio.** `role="status"` com `Unplug` e frase; cobertura de universo zero é `null`,
   nunca 0%.

## Versões

- `v1_chip-de-cobertura-no-cpl-qualificado`: selo de fração colado ao CPL, limiar de 50% e par taxa
  com volume.
- `v2_telefone-em-tres-segmentos`: barra de três segmentos com ausente em contorno e percentuais
  que somam 100.
- `v3_origens-com-cpl-rebaixado-por-cobertura`: 14 origens, piores coberturas no topo, CPL rebaixado
  abaixo do limiar e sem origem declarada por último.
- `v4_salto-de-cobertura-por-mudanca-de-coleta`: 12 meses em colunas, salto de 23% a 61% anotado e
  rodapé que separa degrau de rampa.

## Como colar no Farol

1. Cada versão é o próprio selo ou tabela: embrulhe v2, v3 e v4 num `VisualCard` e use v1 ao lado do
   `KpiCard` do indicador, passando a contagem de registros com o campo e o total como props.
2. A cobertura chega pronta do dado; o componente só calcula a fração e compara com o limiar. Se o
   limiar vier de configuração, passe pela prop `threshold` (v3).
3. Estado vazio e indisponível dão lugar a `EmptyState` e `UnavailableState`, mantendo o texto.

## Referências

- Estudo da família em `_estudo/familias/24_microvisuais-sparklines.md`.
- Contrato do catálogo: seções 7, 8 e 17, e as regras DAD-1, DAD-2 e DAD-4.
- Farol: `app/src/lib/format.ts` (formatadores) e `app/src/styles/tokens.css` (tokens).
- Notas de desvio: v1 usa `--surface-sunken` no trilho em vez de `--surface-overlay`; v4 escreve a
  variação em pontos percentuais por `formatDecimal` com `p.p.`, e não por `formatPercentPoints`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, primeira passada. `v1`, `v2`, `v3` e `v4` aprovadas, sem bloqueante. Medidas tiradas dos PNGs de `_render/.qa/`, que têm 2 px de imagem por px de CSS. O `check` não mede colisão de texto, contraste de texto nem espessura de marca nesta peça, porque texto e marca são HTML, então as três foram medidas à mão nos dois temas.

* `v1`, ACE-1 e DAD-5: a frase acessível não diz o valor do CPL (`R$ 48`), e com `role="img"` o leitor de tela não desce aos filhos, então o número principal não é anunciado. A mesma frase escreve `1240` por `String(total)` (linha 46), sem `formatInt`, e omite os `720` que o corpo mostra. Incluir `formatCurrencyCompact(cpl)` e reaproveitar o texto de `formatRateWithVolume`.
* `v1`, NUM-1: o selo escreve `58%` e a linha logo abaixo `58,1% (720 de 1.240)`, a mesma medida em duas precisões a 40 px de distância. O catálogo pede as duas peças; a linha de baixo pode ficar só com `720 de 1.240 leads`.
* `v1`, seção 17.7: a moldura é `stage` e a raiz não desenha o cartão próprio (`p-4 rounded-lg border border-line-subtle`), então o selo fica solto sobre o canvas. O passo 1 de Como colar no Farol manda usar ao lado do `KpiCard`, mas a versão já desenha o número do KPI: decidir se ela é o cartão ou o selo. No tema claro a pílula em `--surface-overlay` mede 1,06:1 contra o canvas e some sobre cartão branco, sem perda de leitura, porque o trilho está em `--surface-sunken`.
* `v1`, DAD-10: o `demonstrates` do `meta.json` cita o ramo abaixo do limiar (tom mudo com aviso), que o dado padrão, com 58% de cobertura, não desenha, e que o catálogo não lista para esta versão. Quem mostra esse ramo é a `v3`.
* `v1`, EST-2, mora no ramo: com `cpl` nulo o `formatUnavailable()` sai em 30 px no tom do número e sem o ícone `Unplug`.
* `v1` e `v3`, pergunta 21: a fidelidade do SVG contra a página mede 0,74% e 0,78% na `v1` e 0,70% e 0,76% na `v3`, acima de 0,5% e abaixo dos 2% que reprovam. Na `v1`, 99% dos pixels diferentes estão no subtítulo que a moldura desenha; na `v3`, o subtítulo responde por 0,31 e 0,33 ponto e o corpo sozinho fica em 0,40% e 0,42%, quase todo na linha de rodapé. É deslocamento de cerca de 1,5 px no fim de linha longa em Manrope, sem efeito na leitura.
* `v2`, EST-2, mora no ramo: estado que não vem na lista escreve `sem dado` à mão na coluna de contagem (linha 123) e `0%` na coluna ao lado (linha 126), e a linha de leitura e a frase acessível contam esse estado como zero. Trocar as duas colunas por `formatUnavailable()` e tirar o estado da frase.
* `v2`, seção 8: a linha de leitura (linha 99) e a frase (linha 86) montam o percentual com `String(n)` mais `%`, e a coluna usa `formatPercent`. O texto sai igual hoje; chamar o formatador nos três lugares.
* `v2`, proporção: o contorno de 1 px do segmento ausente não entra na partilha do `flex`, e o segmento mede 155,0 px contra 153,6 px esperados, 0,25 ponto percentual a mais. Contorno desenhado por dentro, sem ocupar largura, acerta sem mexer na conta.
* `v2`, ROT-4: a amostra de 12 px com `rounded-sm`, que no Farol vale 6 px, se lê como círculo, e a marca é retângulo. Um raio de 2 px mantém a forma.
* `v2`, NUM-6 e NUM-7: o período `2026 T3` chega pronto do dado, sem formatador, e a contagem de cada linha não repete o substantivo `leads`, que só está no cabeçalho.
* `v3`, EST-2: o CPL sem registro (`Mensagem direta`) leva `TriangleAlert` em `--warning`, e não `Unplug` em `--text-muted`, porque a linha também está abaixo do limiar. Os dois estados caem no mesmo ícone e só a palavra separa.
* `v3`, EST-2, mora no ramo: origem sem leads escreve `formatUnavailable()` numa caixa `w-9` de 36 px (linha 106), e a palavra mede 69 px no PNG: transborda 33 px para a esquerda, por cima do vão e de 25 px do trilho. O trilho vazio desse ramo é o mesmo desenho do zero medido. O `notes` do `meta.json` promete esse caso e o dado padrão não o exercita.
* `v3`, ACE-2: o estado rebaixado chega ao leitor de tela só pela contagem da frase da raiz; o ícone é `aria-hidden` e a célula lê apenas o valor. Um texto oculto na célula, dizendo que a cobertura está abaixo do limiar, resolve.
* `v3`, resolução: o trilho de 32 px vale 3 pontos percentuais por pixel, então 18% e 20% desenham os mesmos 6 px, e 83% e 85% os mesmos 27 px. O número ao lado desempata; fica o registro de que a barra não ordena vizinhos próximos.
* `v4`, base das colunas: o `mt-1` entre a zona de 96 px e o eixo (linha 129) deixa as colunas 4 px acima da linha de base. As alturas conferem com o dado (20 px para 21%, 58 px para 61%), mas a coluna flutua; tirar a margem assenta a marca no zero desenhado.
* `v4`, dado: a mudança de coleta é de 15/06/2026 e junho inteiro já está em 61%, com a guia na borda esquerda do mês. Num mês partido ao meio a cobertura sairia perto de 43%. Ou a data vai para o dia 1º, ou junho fica intermediário e o rodapé explica o mês de transição.
* `v4`, redação: `lê como mudança de coleta` pede `se lê como`, nas duas orações do rodapé.
* `v4`, EST-1b, mora no ramo: sem mês anterior ao da mudança, a frase cai em `formatPercent(firstCoverage ?? 0, 0)` (linha 73) e troca cobertura nula por `0%`, além de continuar dizendo `salto` quando o mês da mudança não está na série. Mês sem leads fica sem coluna e sem palavra na célula.
* `v4`, TIP-2: o número de destaque usa `text-2xl`, 24 px, tamanho que a tabela 17.1 não lista (o KPI é de 30 px). Sem consequência visível.
* `v4`, DAD-4: Referências registra o desvio de `formatPercentPoints`, mas não o pedido de um formatador próprio de ponto percentual, que a saída da armadilha manda deixar escrito.
* `v2`, `v3` e `v4`, EST-1: o estado vazio usa o ícone `Unplug`, que é o do indisponível, e não `Filter`; e a frase acessível desse ramo tem de 58 a 72 caracteres, abaixo do piso de 100 (ACE-1, mora no ramo).
* Todas, TIP-1: número em Manrope dentro de frase corrida sai sem `tabular-nums` (`50%` e `set/26` na `v1`, a linha de leitura da `v2`, `7 de 14` na `v3`, a variação, a anotação e os tiques da `v4`). Sem consequência visível, porque nenhum deles está em coluna.
* Ferramenta, `v4`: no PNG do SVG, 9 das 12 colunas terminam 1 px acima das outras 3; no PNG da página todas assentam na mesma linha. É da serialização do preview, não do `Chart.tsx`.
