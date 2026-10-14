# Matriz de comparação com status

## O que é

Entidades ou opções nas linhas, critérios qualitativos nas colunas e um símbolo de status em
cada cruzamento: cumpriu, parcial, não cumpriu, não se aplica ou sem dado, cada um com forma e
rótulo acessível próprios, nunca só cor. A variante com bolas de Harvey substitui o símbolo
binário por um arco preenchido em quartos, calculado em SVG, para atributos que admitem grau
intermediário. Lê se linha por linha (o perfil de uma entidade nos critérios) e coluna por
coluna (quem falha mais num critério).

## Quando usar

* Cumprimento de 4 a 10 critérios qualitativos por 5 a 25 entidades.
* Comparação de 3 a 8 opções contra critérios com direção escrita, com o número junto do glifo.
* Checklist de etapas ou requisitos em que a pendência por linha e por coluna é a pergunta.
* Quadro de metas por área em que o sim, parcial ou não é a decisão, não o valor por trás dele.

## Quando evitar

* Quando existe o número por trás do status e ele importa: mostre o número (tabela com barras
  inline, `14/01`, ou tabela com heatmap, `14/02`).
* Matriz sem texto e com valor contínuo: é heatmap (família `15`).
* Status só por cor, ou "não se aplica" tratado como "sem dado": dê forma e palavra a cada estado.
* Mais de 25 linhas por 10 critérios: agrupe por pendência ou filtre antes de desenhar.

## Anatomia

1. **Coluna de identidade.** Nome da entidade ou do critério, à esquerda, em `<th scope="row">`
   ou `<th scope="col">`; nunca truncado por reticência (o nome inteiro está sempre na tela ou
   na frase acessível).
2. **Célula de status.** Um ícone `lucide-react` por estado, nunca vazia: `Check` (cumpriu,
   `--positive`), `CircleDot` (parcial, `--warning`), `X` (não cumpriu, `--negative`), `Minus`
   (não se aplica, `--text-muted` sobre chip preenchido `bg-surface-sunken`) e `CircleDashed`
   (sem dado, `--text-muted` sobre chip com contorno `border-line-strong`, nunca preenchido com
   `bg-surface-overlay`, que no tema claro tem o mesmo valor do cartão e o chip desapareceria).
   Cada célula carrega um `<span className="sr-only">` com o rótulo por extenso.
3. **Bola de Harvey (v2).** `<circle>` de contorno em `--line-subtle` mais um `<path>` de arco
   preenchido em `--chart-1`, calculado por `harveyPath(frac)` para `frac` em `0, 0.25, 0.5,
   0.75, 1`; nunca caractere Unicode de bola.
4. **Contorno de líder.** Um traço `--text-primary` de 1,5 a 2 px desenhado como geometria
   própria (`border` real em HTML, `<circle>` extra em SVG), nunca a classe `ring` do Tailwind:
   ela é box-shadow e não sobrevive à serialização do preview em SVG. Marca a célula (ou a bola)
   com o maior grau entre as aplicáveis da linha ou da coluna; todo empate leva o mesmo
   contorno, sem escolher uma.
5. **Legenda dos símbolos.** Uma linha no topo do corpo, com ícone mais rótulo por extenso para
   cada estado que a versão usa, escrita uma vez, nunca célula a célula.
6. **Contagem por linha e por coluna.** `X de Y` em `kpi-number`, com `Y` excluindo "não se
   aplica" e "sem dado" quando a versão os usa; célula sem nenhum critério aplicável escreve a
   frase por extenso, nunca `0 de 0`.
7. **Direção do critério (v2).** Ícone `TrendingUp` ou `TrendingDown` mais a faixa de
   normalização declarada, sob o nome do critério, no cabeçalho da coluna.

## Versões

* [`v1_metas-do-ano-por-area`](./v1_metas-do-ano-por-area/) ([preview](./v1_metas-do-ano-por-area/preview.svg), [claro](./v1_metas-do-ano-por-area/preview-claro.svg)):
  6 metas de 2026 por 9 áreas fictícias, com `Check`, `CircleDashed` e `X`; contagem por área
  como "5 de 6" e por meta no rodapé; a meta mais frágil é calculada do dado, não fixada no
  texto.
* [`v2_cenarios-com-bolas-de-harvey`](./v2_cenarios-com-bolas-de-harvey/) ([preview](./v2_cenarios-com-bolas-de-harvey/preview.svg), [claro](./v2_cenarios-com-bolas-de-harvey/preview-claro.svg)):
  4 cenários de 2027 em 6 critérios de unidades diferentes, cada um com faixa de normalização
  própria; a fração da bola se inverte nos critérios em que menor é melhor, e o critério de
  investimento empata dois cenários no contorno de líder.
* [`v3_checklist-de-handoff-por-oportunidade`](./v3_checklist-de-handoff-por-oportunidade/) ([preview](./v3_checklist-de-handoff-por-oportunidade/preview.svg), [claro](./v3_checklist-de-handoff-por-oportunidade/preview-claro.svg)):
  18 oportunidades fictícias contra os 7 critérios do handoff de pré-vendas, ordenadas da mais
  para a menos pendente; o critério mais descumprido (orçamento estimado, pendente em 16 de 18)
  ganha destaque calculado no próprio cabeçalho.
* [`v4_nao-se-aplica-sem-dado-e-empate`](./v4_nao-se-aplica-sem-dado-e-empate/) ([preview](./v4_nao-se-aplica-sem-dado-e-empate/preview.svg), [claro](./v4_nao-se-aplica-sem-dado-e-empate/preview-claro.svg)):
  5 plataformas fictícias contra 8 critérios, com os cinco estados completos; "não se aplica" e
  "sem dado" nunca desenham célula vazia, cada um com chip de fundo próprio, e o denominador da
  contagem por linha muda conforme quantos critérios são aplicáveis; um rodapé decifra o anel de
  líder, como o da `v2`.

## Como colar no Farol

1. `html-tailwind` puro: nenhuma dependência de Recharts. Copie `Chart.tsx` e `data.ts` para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. A bola de Harvey (`v2`) tem a função `harveyPath` dentro do próprio `Chart.tsx`; se mais de
   uma versão da página precisar dela, promova a função para um utilitário compartilhado antes
   de copiar de novo, em vez de duplicar o cálculo.
3. Ao trocar `data` pelo seletor real, mantenha a proporção de estados por linha: uma linha só
   com "não se aplica" e "sem dado" tem denominador zero e precisa do texto por extenso, não de
   `0 de 0` (seção 17, EST-2).
4. Se a página real tiver mais entidades do que a versão mostra, pagine ou filtre pelas
   pendências antes de desenhar: nenhuma versão do catálogo trata rolagem de tabela.
5. Embrulhe no `VisualCard` do destino; o Chart não desenha título nem moldura (seção 17,
   ANO-6, ESP-4).

## Referências

* [Wikipedia, Harvey balls](https://en.wikipedia.org/wiki/Harvey_balls): observar o uso em
  tabelas de comparação e a limitação de renderização por fonte, que motiva o arco em SVG em
  vez do caractere Unicode.
* [Junk Charts, alternativas ao radar](https://www.junkcharts.com/alternatives-to-radar-chart-1/):
  observar a tabela realçada com cor, negrito e símbolos vencendo o radar para comparar poucas
  opções em vários critérios.
* [Tremor, Tracker](https://www.tremor.so/docs/visualizations/tracker): observar cor e rótulo
  por bloco de status, base do padrão de legenda por extenso desta família.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19, sobre os PNGs dos dois temas._

* `v1`: o glifo `CircleDashed` marca "Cumpriu em parte", enquanto a Anatomia acima reserva
  `CircleDashed` para "sem dado" e `CircleDot` para parcial, que é o que a `v4` faz; a legenda
  da própria `v1` resolve a leitura, mas o mesmo símbolo carrega dois sentidos dentro do modelo.
* `v1`: a nota do `meta.json` diz que a meta mais frágil está "no rodapé"; ela só existe na
  frase acessível, e o rodapé traz apenas a contagem por coluna de onde ela sai.
* `v1` e `v3`: a contagem por linha vai para a tela por `String(n)` interpolado, fora de
  `@/lib/format`; o rodapé da `v1` usa `formatInt` no mesmo tipo de número.
* `v2`: a direção de cada critério chega só pelo ícone `TrendingUp` ou `TrendingDown`, e o
  catálogo pede a direção escrita; a palavra não aparece na tela.
* `v2`: o contorno de líder segue a fração arredondada em quartos, então R$ 2,5 mi e R$ 3,0 mi
  empatam em 0,75 e os dois recebem o anel; a nota de rodapé ganharia em dizer que o empate é do
  glifo, não do valor escrito ao lado.
* `v2`: "faixa 5,0 a 9,0" é o único cabeçalho sem unidade (NUM-6), porque satisfação do time é
  índice; vale dizer de que índice se trata.
* `v3`: o ícone de alerta no cabeçalho de "Orçamento" não tem entrada na legenda; a contagem de
  16 no rodapé o explica, mas por dedução do leitor.
* `v3`: "Comércio Porto Seguro" usa um topônimo que também é marca conhecida no Brasil; outro
  nome genérico deixaria o dado fictício sem dúvida.
* `v4`: a frase oculta da célula escreve "líder empatado neste critério" mesmo quando há um
  líder só na linha.
* `v4`: nenhuma linha do dado exercita o denominador zero, então a frase "sem plataforma
  aplicável" prevista na Anatomia não é provada por nenhum dos dois PNGs.
* `v4`: a frase acessível mede 246 caracteres, a 4 do teto de 250 da ACE-1, e é o aviso que o
  `npm run check` imprime; ela cresce com o número de critérios e de plataformas.

_Segunda leitura de 2026-09-19, revisão independente sobre os mesmos PNGs._

* `v1`: a contagem por linha escreve "5 de 6" e o rodapé da mesma tabela escreve "7/9"; são duas
  notações para o mesmo tipo de contagem dentro de um visual só.
* `v2`: a frase acessível fixa "nos 6 critérios" em texto, enquanto `criteria` é propriedade do
  componente; trocado o recorte, a frase passa a dizer um número que a tabela não mostra.
* `v2`: a direção do critério chega só pelo ícone, que é `aria-hidden`, e a frase acessível não
  repete a direção; quem lê por leitor de tela fica sem saber em que critério menor é melhor.
* `v2`: quando o cabeçalho quebra em três linhas, a seta de direção desgruda do texto "faixa" e
  fica na borda esquerda da célula, perto da coluna anterior; o ícone junto da primeira linha do
  nome do critério manteria o par visível.
* `v4`: a nota do `meta.json` ainda cita `surface-overlay` para "não se aplica", enquanto o
  código já usa `surface-sunken` com contorno `line-strong` e explica no comentário por quê.
* `v1`, `v2`, `v3` e `v4`: nenhuma trata `data` vazio com o bloco `role="status"` da EST-1; a
  `v4` cobre só o caso vizinho, a linha sem critério aplicável.
