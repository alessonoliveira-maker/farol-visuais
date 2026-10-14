# Perímetro aninhado

## O que é

Formas contidas umas nas outras, mercado total, endereçável, alcançável e participação, alinhadas no canto inferior esquerdo, com o lado de cada nível proporcional à raiz quadrada do valor para que a área compare de verdade. Lê-se de fora para dentro: cada quadrado é um subconjunto do anterior, e o menor, a participação, é o destaque.

## Quando usar

- Participação de mercado com perímetro declarado: total, endereçável, alcançável e fatia própria.
- Mostrar quanto cada nível representa do nível acima, com etiqueta de procedência por nível.
- Comparar dois perímetros quando a definição de mercado muda.

## Quando evitar

- Níveis que não estão contidos uns nos outros: use barras ordenadas (família 02).
- Ordens de grandeza tão distantes que a forma interna some sem painel ampliado: acrescente o zoom lateral ou use barras em escala logarítmica anotada.
- Perímetro desenhado sobre território: família 23, modelo 05.
- Quando a série no tempo da participação é a mensagem, não o tamanho do perímetro: use linhas (família 04).

## Anatomia

1. **Quadrado do mercado total.** Contorno tracejado `border-dashed border-chart-1`, ocupa o quadro inteiro; é a base da escala, contra a qual o lado dos demais níveis é calculado. Tracejado porque é a estimativa mais ampla e menos firme da cascata.
2. **Quadrado do endereçável.** Contorno sólido `border-chart-1`, lado igual à raiz quadrada da razão entre o valor do nível e o do mercado total, em percentual do lado do quadro.
3. **Quadrado do alcançável.** Mesmo cálculo de lado, contorno sólido `border-2 border-chart-1`, mais grosso, para marcar o perímetro que de fato importa para a meta.
4. **Quadrado da participação.** Preenchido em `bg-chart-1`, o único destaque do visual; nesta versão mede cerca de 2,8% do lado do quadro, quase um ponto. Um contorno de separação de 1,5 px em `--surface-raised` (`shadow`) o distingue do traço do alcançável, que é o mesmo `--chart-1` e encostaria sem essa borda (COR-5). Todo o quadro usa um hue só, `--chart-1`, com contraste acima de 3:1 nos dois temas sem depender de isenção de contorno fraco (COR-1, ACE-3).
5. **Lista de identificação.** Ao lado do quadro, um cabeçalho "% do nível acima" em 11 px `--text-muted` declara a base da última coluna (NUM-4), e um item por nível traz a cor do contorno ou preenchimento, o rótulo, o valor por `formatCurrencyCompact` e o percentual sobre o nível imediatamente anterior por `formatPercent` inteiro, ou `formatUnavailable()` no primeiro nível, que não tem base (EST-2). Uma nota curta sob o item da participação, "quase um ponto nesta escala", substitui o desenho fora de proporção em vez de inflar a forma para caber; colada ao próprio item, não depende de seta para se ligar à marca.
6. **Linha de leitura.** No topo do corpo, calculada do dado: a participação em reais e o percentual dela sobre o alcançável, `aria-hidden` porque a frase acessível da raiz já diz o mesmo.
7. **Nota do perímetro.** Uma linha no rodapé, colada ao visual, dizendo o que entra e o que fica fora da medição de cada nível.
8. **Painel ampliado (`v2`).** Um segundo quadro do mesmo lado em px que o quadro geral, desenhando um nível só. Com os dois lados iguais a ampliação sai do dado em vez de ser escrita à mão: ela é a raiz da razão entre o mercado total e o nível ampliado, e vai declarada dentro do próprio painel, em lado e em área. O cone de duas linhas finas que liga um ao outro é `--text-muted`, porque traço que carrega a relação é dado e mede 3:1 (ACE-6); onde ele passa por trás de um contorno do quadro geral o contorno pinta em cima e o traço se interrompe, que é a saída da TOK-10 para guia que cruza marca.
9. **Contorno de meta (`v2`).** Quadrado tracejado em `--text-muted` dentro do painel, com o lado pela raiz da meta em fração do nível ampliado. Sai do hue do dado porque é referência, não série, e a distância até ele vai escrita em reais e em pontos percentuais, com `formatCurrencyCompact` e `formatDecimal` mais a unidade "p.p." à mão.
10. **Escala comum a dois quadros (`v3`).** Quando a versão compara dois perímetros, o lado de todo quadrado sai da razão contra o **maior valor dos dois recortes**, nunca contra o total de cada quadro: é o que torna a comparação de área entre eles legítima (EIX-9), e é a razão de o quadro do perímetro menor nascer com lado menor.
11. **Etiqueta de procedência por nível (`v3`, `v4`).** Uma linha de 11 px sob o rótulo de cada nível, em `text-prov-medido`, `text-prov-derivado`, `text-prov-premissa` ou `text-prov-lacuna`, com a palavra e a fonte escritas ("medido, fonte pública"). Ela não é a etiqueta do cartão que a ANO-6 reserva ao `VisualCard`: aqui a cascata mistura graus de confiança diferentes em cada nível, e uma etiqueta única diria o grau errado para três deles.
12. **Nível sem estimativa (`v4`).** Não recebe lado, porque lado é valor. Ele aparece como contorno tracejado em `--text-muted` no único limite conhecido, o nível acima, recuado 4 px para dentro para os dois contornos não se anularem, com o rótulo e o selo lacuna ao lado; o percentual que dependia dele sai por `formatUnavailable()` com o ícone `Unplug`, nunca zero e nunca calculado sobre o limite.

## Versões

- `v1_mercado-total-enderecavel-alcancavel`: mercado total de R$ 120 bi até a participação de R$ 96 mi (4% do alcançável), com os quadrados calculados pela raiz quadrada do valor, a lista de identificação com valor e percentual por nível, a nota de escala da participação quase invisível e a nota do perímetro colada ao rodapé. Previews: [preview.svg](./v1_mercado-total-enderecavel-alcancavel/preview.svg) (escuro) e [preview-claro.svg](./v1_mercado-total-enderecavel-alcancavel/preview-claro.svg) (claro).
- `v2_zoom-do-alcancavel-com-meta`: o mesmo cenário com um painel ampliado do nível alcançável ao lado, ligado ao quadro geral por um cone de duas linhas finas, a meta de 6% como contorno tracejado dentro do painel, a ampliação declarada no próprio painel (lado 7,1 vezes, área 50 vezes, as duas saindo do dado) e a distância até a meta escrita em reais e em pontos percentuais. Previews: [preview.svg](./v2_zoom-do-alcancavel-com-meta/preview.svg) (escuro) e [preview-claro.svg](./v2_zoom-do-alcancavel-com-meta/preview-claro.svg) (claro).
- `v3_perimetro-alterado-lado-a-lado`: dois perímetros na mesma escala de área, com o lado de todo quadrado medido contra o maior valor dos dois recortes, a participação repetindo os mesmos R$ 96 mi nos dois quadros, a queda de 4,0% para 3,0% só por denominador, a etiqueta de procedência por nível e a nota do que passou a entrar. Previews: [preview.svg](./v3_perimetro-alterado-lado-a-lado/preview.svg) (escuro) e [preview-claro.svg](./v3_perimetro-alterado-lado-a-lado/preview-claro.svg) (claro).
- `v4_nivel-sem-estimativa`: o alcançável sem estimativa, desenhado como contorno tracejado no limite que se conhece em vez de quadrado de tamanho inventado, com o selo lacuna, os níveis medidos mantidos em escala e o percentual da participação saindo por `formatUnavailable()`. Previews: [preview.svg](./v4_nivel-sem-estimativa/preview.svg) (escuro) e [preview-claro.svg](./v4_nivel-sem-estimativa/preview-claro.svg) (claro).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a página de destino; a prop `data` segue o tipo `NestedPerimeterData`, sempre com exatamente quatro níveis, do mais amplo ao mais estreito.
2. Troque os quatro níveis fixos pela consulta real (mercado total, endereçável, alcançável, participação), mantendo a ordem: o índice 3 é sempre o destaque em `bg-chart-1`.
3. Ajuste `perimeterNote` para o texto real do que entra e do que fica fora do perímetro medido na página; ele não pode ficar genérico quando a definição de mercado for específica do cenário.
4. Se a participação real não ficar quase invisível como neste dado, a nota "quase um ponto nesta escala" sob o item da lista deixa de fazer sentido; troque por um rótulo direto dentro do próprio quadrado quando ele tiver ao menos a espessura do piso da ESP-2.
5. Dê altura ao pai (`h-64` na grade, por exemplo) ou passe `height`, porque o quadro do perímetro usa `aspect-square` sobre a altura recebida.
6. As `v2`, `v3` e `v4` desenham num bloco de tamanho fixo em px, centrado no corpo, em vez de `aspect-square`: ali o cone, a lista e os rótulos precisam de posição absoluta conhecida. Trocar o canvas dessas versões pede refazer a conta que está na nota do `meta.json` de cada uma, porque o bloco não encolhe sozinho.
7. Na `v2` o par `OVERVIEW` e `PANEL` tem de continuar igual: é o que faz a ampliação declarada sair do dado. Se a página precisar de painel maior que o quadro geral, multiplique os dois pelo mesmo fator.
8. Na `v3` a base da escala é o maior valor dos dois recortes, calculada no componente: não substitua por uma constante, ou os dois quadros deixam de ser comparáveis no primeiro recorte diferente.
9. Na `v4` o nível sem estimativa é o que vem sem `value` no dado; a posição dele na cascata é livre, e o contorno do limite nasce do nível imediatamente acima. Nível sem `value` e sem nível acima sai sem contorno, de propósito.

## Referências

- Catálogo: [From Data to Viz, Circular Packing](https://www.data-to-viz.com/graph/circularpacking.html): contenção como codificação de hierarquia.
- Catálogo: [Data Visualisation Catalogue, Circle Packing](https://datavizcatalogue.com/methods/circle_packing.html): contenção representa nível hierárquico.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): preferir quadrados alinhados a círculos quando a área precisa ser comparada.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-20. Correção de 2026-09-20: `v1` reprovada por #15/ROT-9 (a tinta da nota
"quase um ponto nesta escala" caía sobre o contorno tracejado do mercado total, nos dois temas) e
#14/NUM-4 (a coluna de percentual não declarava a base, e "13%" podia ser lido como fatia do
mercado total em vez de fatia do nível acima). As duas causas foram corrigidas no `Chart.tsx`: a
nota saiu do canto do quadro e passou a viver colada ao item "Participação" da lista, sem depender
de seta ou de proximidade a 300 px; e um cabeçalho "% do nível acima" em 11 px `--text-muted`
nasceu acima da lista, declarando a base da coluna. O mesmo lote fechou as quatro observações não
bloqueantes já registradas nesta revisão: o percentual ausente do primeiro nível trocou o
travessão solto por `formatUnavailable()` (EST-2); o quadrado da participação ganhou um contorno
de separação de 1,5 px em `--surface-raised` contra o traço do alcançável, do mesmo `--chart-1`
(COR-5); o rótulo de nível deixou de usar `truncate`, porque nem os quatro nomes vivem na frase
acessível (TIP-7); e o "O que é" corrigiu "Lê se" para "Lê-se"._

_`npm run check` segue sem medir COLISAO-TEXTO nem CONTRASTE-TEXTO nesta versão (`texto_em_html`,
porque o corpo inteiro mora em `foreignObject`), então o silêncio das duas guardas não vale como
aprovação; a conferência do cabeçalho novo, da linha "R$ 120,0 bi indisponível" e da nota sob
"Participação" foi visual, nos dois PNGs de `_render/.qa/`, e não achou colisão nem par abaixo do
piso de contraste._

Revisão independente de 2026-09-20, versão `v1_mercado-total-enderecavel-alcancavel` aprovada, sem
bloqueante. Os pontos abaixo ficam para quem tocar o arquivo depois.

- `v1`: a coluna de valor não fecha à direita entre as linhas. "indisponível" é bem mais larga que
  a reserva de 36 px do percentual e empurra "R$ 120,0 bi" cerca de 50 px à esquerda das outras
  três moedas, o que contraria a coluna de número alinhada à direita da TIP-6; a leitura não muda,
  porque cada valor continua ao lado do seu rótulo.
- `v1`: o percentual do primeiro nível sai como `formatUnavailable()`, mas ali não falta medição,
  falta base: nenhum nível está acima do mercado total. "indisponível" pode ser lido como dado que
  existe e não veio; um texto de não se aplica descreveria melhor a ausência de denominador.
- `v1`: a linha de leitura repete os dois números que a lista imprime a poucos centímetros
  (R$ 96,0 mi e 4%). Ela ganharia dizendo o que a lista não diz, como quanto falta em reais para
  cada ponto de participação.
- `v1`: a nota "quase um ponto nesta escala", no item da lista e também dentro da frase acessível,
  é texto fixo, não calculado do dado. Com outra participação a afirmação deixa de ser verdadeira
  e nada no componente acusa; hoje só o passo 4 de "Como colar no Farol" avisa.
- `v1`: a nota do perímetro no rodapé tem cerca de 190 caracteres, muito acima dos 50 da ANO-2. Ela
  é exigida pelo modelo e pelo catálogo, então fica como está, mas uma versão mais curta caberia
  em uma linha só no canvas `card`.

## Observações do produtor da leva de `v2` a `v4` (não bloqueantes)

_Escritas em 2026-09-29, ao entregar as três irmãs. Nenhuma delas tem consequência medível no
preview, então pela 14.1 do contrato ficam como observação, para quem tocar os arquivos depois._

- `v2`: a linha de cima do cone atravessa o interior do quadrado do endereçável antes de chegar ao
  painel. É consequência da geometria: o nível ampliado mora no canto inferior esquerdo e o painel
  fica à direita, então qualquer reta entre os dois cruza o que estiver no caminho. O traço é
  desenhado antes dos quadrados, então cada contorno pinta por cima e a guia se interrompe ali, que é
  a saída da TOK-10; quem preferir um desenho mais limpo pode partir o cone da borda direita do quadro
  geral, ao custo de deixar de apontar o quadrado de origem.
- `v2`: a nota do perímetro cabe em uma linha só porque tem 96 caracteres contra os 776 px do bloco.
  Texto mais longo quebra em duas linhas e come 15 px da folga de 31,5 px do canvas, sem que nada
  acuse: é a GEO-14, e o lugar de conferir é o PNG.
- `v3`: os rótulos "perímetro atual" e "perímetro novo" aparecem duas vezes, sobre cada quadro e sobre
  cada coluna de valor da lista. É repetição deliberada, porque a lista fica a 28 px da direita do
  segundo quadro e sem cabeçalho de coluna a ordem das duas colunas seria adivinhação (GEO-12).
- `v4`: o contorno do limite entra 4 px para dentro do nível acima. O número é acabamento, não valor,
  e está declarado na nota do `meta.json`: sem ele os dois contornos se anulariam na tela. Ele
  subestima o limite em cerca de 5% do lado, o que é visível só com régua e não muda a leitura, que é
  "cabe aqui dentro".
- Nas três, `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA` saem `texto_em_html`, como na `v1`:
  o corpo inteiro mora em `foreignObject`. O silêncio delas não vale como aprovação, e a conferência
  foi visual nos dois PNGs de cada versão, mais a medição de contraste escrita na nota do `meta.json`.
