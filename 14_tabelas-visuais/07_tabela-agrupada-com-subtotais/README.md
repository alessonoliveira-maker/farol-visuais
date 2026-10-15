# Tabela agrupada com subtotais e linha fixa

## O que é

Uma tabela HTML em que as linhas se agrupam por uma dimensão curta (time, área, canal): cada
grupo abre com um rótulo e um subtotal, as linhas filhas ficam recuadas logo abaixo, e uma linha
de referência (média da casa, total geral) fica fixa por `position: sticky` dentro do contêiner
de rolagem, sem sair da tela ao rolar. Quando as colunas também têm grupo, o cabeçalho ganha uma
segunda linha com o bloco por cima das colunas de valor. Ordenar por uma coluna ordena dentro de
cada grupo e preserva os grupos; subtotal e total geral ficam fora do domínio de qualquer marca
inline, porque são sempre maiores (ou, no caso de uma mediana, de outra natureza) que qualquer
linha isolada.

**O subtotal muda de tipo entre as versões, e isso é o ponto central do modelo.** Soma, média e
mediana aparecem lado a lado no mesmo lugar visual (a linha de grupo) em ferramentas diferentes, e
confundir uma pela outra produz um número que não fecha com as linhas de baixo. Este catálogo usa
os três: v1 e v3 somam (pipeline, fechamentos, custo), v2 tira a média ponderada de uma taxa, v4
tira a mediana de uma duração. Cada versão diz o tipo por extenso na linha de grupo e no `notes`
do `meta.json`.

## Quando usar

* Hierarquia curta de dois níveis, com 2 a 6 grupos e 3 a 12 linhas por grupo.
* Comparar cada linha contra uma referência que não pode sair da tela ao rolar (média da casa,
  meta, teto).
* Colunas agrupadas em blocos (camadas de custo, trimestres) com cabeçalho duplo.
* Subtotal por grupo que o leitor consulta tanto quanto as linhas individuais.

## Quando evitar

* Grupos de uma linha só na maioria dos casos: uma tabela plana com coluna de grupo lê mais rápido.
* Hierarquia com mais de dois níveis: treemap ou árvore (família 12).
* Detalhe por linha que o leitor abre sob demanda: linha expansível (14/08).
* Ordenação que precisa quebrar os grupos: isso é outro modo, com controle explícito próprio;
  este modelo só ordena dentro de cada grupo.

## Anatomia

1. **Cabeçalho da tabela**, simples ou duplo quando as colunas também têm grupo (v3): a segunda
   linha nomeia a coluna, a primeira nomeia o bloco com `colSpan`.
2. **Linha de grupo**, com o rótulo do grupo num `<th scope="rowgroup">` e o subtotal ao lado, em
   `font-display font-semibold text-text-primary`, sobre `bg-surface-overlay/60`. O subtotal diz o
   próprio tipo quando não é soma ("mediana 18 dias").
3. **Linhas filhas**, recuadas com `pl-6`, texto em `text-text-secondary`, sem borda entre elas:
   grupos se separam por espaço (uma linha em branco de altura fixa), nunca por borda interna.
4. **Marca inline por linha**, quando a coluna comporta (v1 barra simples, v2 barra divergente
   contra a média): o domínio da escala vem só das linhas filhas, nunca do subtotal.
5. **Linha fixa de referência**, `position: sticky` (`top-0` para a média no topo em v2, `bottom-0`
   para o total geral no rodapé em v3) com fundo próprio (`bg-surface-sunken`), dentro de um único
   contêiner com `overflow-y-auto`. Nenhum ancestral entre a linha fixa e esse contêiner usa
   `overflow: hidden`, senão o `sticky` para de funcionar.
6. **Casos limite do agrupamento** (v4): grupo com uma única linha não repete o subtotal, que
   seria redundante com a própria linha; grupo vazio no recorte aparece recolhido, com a frase
   "nenhuma linha neste recorte" em `text-text-muted`, sem borda vermelha nem sumir da tabela.
7. **Rodapé de contagem**, `aria-hidden`, porque a frase acessível da raiz já diz o total.

## Versões

* [`v1_pipeline-por-time-comercial`](./v1_pipeline-por-time-comercial/) ([preview](./v1_pipeline-por-time-comercial/preview.svg)):
  três times comerciais, cada um com subtotal por **soma** de pipeline aberto e de fechamentos do
  trimestre; barra inline por executivo com domínio calculado só sobre as linhas filhas; grupos
  separados por espaço, sem borda interna.
* [`v2_media-da-casa-fixa-no-topo`](./v2_media-da-casa-fixa-no-topo/) ([preview](./v2_media-da-casa-fixa-no-topo/preview.svg)):
  a taxa de ganho de 7 executivos contra a **média ponderada da casa**, fixa no topo do contêiner
  de rolagem; desvio de cada linha em barra divergente com sinal escrito e taxa com volume por
  `formatRateWithVolume`.
* [`v3_custo-em-tres-camadas-por-area`](./v3_custo-em-tres-camadas-por-area/) ([preview](./v3_custo-em-tres-camadas-por-area/preview.svg)):
  custo de 2026 em três camadas, colunas agrupadas com cabeçalho duplo, subtotal por área e um
  total geral por **soma**, fixo no rodapé; nenhuma cor semântica nas camadas, porque custo não
  tem bom nem ruim aqui.
* [`v4_grupo-unitario-e-grupo-vazio`](./v4_grupo-unitario-e-grupo-vazio/) ([preview](./v4_grupo-unitario-e-grupo-vazio/preview.svg)):
  dias até o fechamento por time, com subtotal por **mediana** (um negócio muito lento distorceria
  a média); um time com um único executivo sem subtotal redundante, um time vazio recolhido no
  recorte, e o total geral recalculado só com as linhas visíveis.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida; a marca e a linha fixa já são a peça de
   produção, sem `VisualCard`, `ChartFrame` nem `DataTable.tsx` do kit por baixo.
2. Troque `data` pela lista real, já agrupada por time ou área na página que consome o componente;
   subtotal, domínio da marca e total geral são recalculados sozinhos a cada render, porque vêm de
   `useMemo` sobre o array recebido.
3. Mantenha o container pai com `overflow-x-auto` quando a tabela puder ficar mais larga que a
   coluna do dashboard.
4. Se o recorte real tiver muito mais linhas que o dado de exemplo, o mesmo contêiner de rolagem
   (`overflow-y-auto` com `maxHeight`) passa a rolar de verdade, e a linha fixa continua no topo
   ou no rodapé sem precisar de nenhuma mudança no componente.
5. Grupo unitário e grupo vazio (v4) já têm tratamento embutido; não é preciso embrulhar com
   `EmptyState` do Farol para esses dois casos específicos.

## Referências

* [Datawrapper Academy, customizando a tabela](https://www.datawrapper.de/academy/customizing-your-table): linhas fixas, cabeçalho duplo e listras para tabelas largas.
* [Storytelling with Data, o que é uma tabela](https://www.storytellingwithdata.com/blog/2020/9/24/what-is-a-table): rótulos de supercategoria para reduzir repetição.
* [shadcn/ui, Data Table](https://ui.shadcn.com/docs/components/data-table): composição sobre TanStack Table com ordenação, filtro e visibilidade de colunas, a referência de como o Farol implementaria o agrupamento interativo.

## Observações (não bloqueantes)

* Em v1, v2 (linhas de time) e v3, o fundo `bg-surface-overlay/60` que realça a linha de grupo some no
  tema claro, onde o token vale `#ffffff`, o mesmo branco do cartão (o mesmo achado já registrado no
  README de `14/01`). A leitura não se perde, porque o peso semibold e o recuo das linhas filhas
  continuam distinguindo o grupo, e a checagem manual de contraste de texto (seção 17.10) segue acima
  de 4,5:1 nos dois temas em todas as combinações usadas aqui. A correção começa pelo catálogo.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-09-19; as quatro versões passaram sem bloqueante, com `npm run check`
em 0 com erro e 0 aviso._

* Em v3 a linha de grupo vem **depois** das linhas filhas, ao contrário de v1, v2 e v4 e do que a
  seção O que é deste README descreve (o grupo abre com rótulo e subtotal). A leitura em contabilidade
  de itens seguidos de subtotal é legítima e o recuo das filhas resolve a atribuição, mas vale alinhar
  a redação da Anatomia ou a ordem, para o modelo não ensinar duas posições para a mesma peça.
* Em v2 e v3 o contêiner de rolagem leva `rounded-md border border-line-subtle`, o que desenha uma
  segunda moldura dentro do `VisualCard` (ESP-4 e ESP-5 pedem espaço, não borda). A raiz continua
  limpa e a borda tem função de delimitar a área que rola; v1 e v4 não têm nenhuma, então a família
  entrega dois acabamentos diferentes para o mesmo modelo.
* Em v1 o rodapé afirma que o fundo realçado marca o subtotal do time; no tema claro esse fundo não
  existe (o achado já está na seção acima), então a frase aponta para um sinal ausente em metade dos
  renders. Trocar a frase por peso e recuo, que são os canais que de fato sobrevivem, custa uma linha.
* Em v1 o cabeçalho Pipeline aberto fica alinhado à esquerda sobre a barra, enquanto os valores da
  mesma coluna saem à direita dentro do vão fixo de 100 px. Não confunde, porque a barra ocupa o meio,
  mas foge da TIP-6.
* Em v4 a frase acessível diz que o time maior soma mediana de 18 dias; mediana não soma, e a
  contagem de grupos vazios não concorda em número quando passa de um. Os dois pontos são de redação,
  a informação continua correta e completa.

_Revisão independente de 2026-10-14, só de v1 (o `Chart.tsx` mudou em 2026-09-28: o trilho da barra
passou de `bg-surface-overlay` para `bg-surface-sunken` e agora aparece no claro); aprovada sem
bloqueante, com `npm run check` em 0 com erro e o aviso de AGREGACAO-ZERO da fila de dívida, que aqui
é largura de desenho e não chega a texto._

* v1: o rodapé ainda diz "Fundo realçado marca o subtotal do time", e no claro esse fundo sai
  `rgba(255, 255, 255, 0.6)` sobre o branco do cartão, ou seja, não existe. A troca do trilho não
  alcançou a frase. Reescrever pelos canais que sobrevivem nos dois temas (linha em semibold, sem
  recuo, com a soma do time) resolve isto e ainda nomeia o agregado, como pede a NUM-5.
* v1: o subtotal de pipeline sai `text-left`, no início da coluna da barra, enquanto os valores das
  filhas saem à direita do vão fixo de 100 px; os dois números da mesma grandeza ficam em eixos de
  alinhamento diferentes (TIP-6). Soma com o ponto já registrado do cabeçalho Pipeline aberto.
* v1: os números do rodapé ("9 executivos em 3 times") saem em Manrope sem `tabular-nums` (TIP-1);
  sem consequência visível, porque não alinham com nada.
* v1: o vazio tem `role="status"` e a frase em 12 px `text-text-muted`, mas falta o ícone `Filter` de
  16 px que a EST-1 descreve.
* v1: a frase acessível diz que Comercial SP lidera com R$ 929,2 mil e 6 fechamentos, mas Comercial SC
  empata em 6 fechamentos; quem ouve pode entender liderança também na segunda coluna.
* v1: o trilho tem cerca de 68 px e o vão do valor reserva 100 px para uma tinta de cerca de 70 px;
  passar a sobra para o trilho dá mais resolução à comparação entre executivos.
* v1: um time que chegue com a lista de executivos vazia imprime R$ 0 e 0 na linha de grupo, lidos como
  zero medido; quando o recorte puder esvaziar um time, o tratamento a copiar é o de v4.
