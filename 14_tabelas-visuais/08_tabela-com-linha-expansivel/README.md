# Tabela com linha expansível

## O que é

Uma tabela HTML comum em que cada linha resume uma entidade e, ao lado do resumo, um botão com
seta abre um painel de detalhe na largura inteira da tabela, sem trocar de tela e sem esconder as
demais linhas. É o foco com contexto do TableLens: uma região ganha mais profundidade enquanto o
resto da lista continua à vista para comparação. O painel é caro de montar (série, mapa de
entradas, lista de etapas) e por isso só existe enquanto a linha está aberta; fechar a linha
desmonta o painel, não só o esconde.

## Quando usar

* Lista de 10 a 50 entidades em que o detalhe interessa a uma ou duas por vez, não a todas.
* Resumo por linha com histórico, série ou composição que não cabe numa célula da própria linha.
* Tela de trabalho em que trocar de página quebraria o contexto: o leitor quer voltar à lista sem
  perder a posição.
* Detalhe caro de montar (gráfico, grade) que não deve ser renderizado na carga para as 50 linhas,
  só para a que foi pedida.

## Quando evitar

* Detalhe que o leitor precisa comparar entre linhas: traga a métrica para uma coluna com marca
  inline ([modelo 01](../01_tabela-com-barras-inline/)) ou sparkline por linha
  ([modelo 03](../03_tabela-com-serie-por-linha/)); painel expansível não abre duas linhas lado a
  lado para comparação direta.
* Detalhe grande o bastante para uma tela própria: use a gaveta de detalhe do Farol, não um painel
  dentro da tabela.
* Tabela com poucas linhas em que todo detalhe cabe aberto: pequenos múltiplos lado a lado lê mais
  rápido que abrir uma por uma.
* Painel que monta todos os gráficos na carga da tabela, mesmo com a linha fechada: é o erro mais
  caro do modelo e o motivo da renderização condicional da Anatomia, item 3.

## Anatomia

1. **Botão de expandir**, `ChevronRight` de `lucide-react` girando 90° por classe (`rotate-90`)
   quando aberto, com `aria-expanded` no estado atual e `aria-controls` apontando para o `id` do
   painel daquela linha.
2. **Linha resumo**, com o texto que a lista sempre mostra e uma pista curta do que o painel traz
   (`--text-muted`, 11 px), presente mesmo com a linha fechada: quem lê a tabela fechada já sabe se
   vale abrir e o que vai encontrar, sem precisar clicar para descobrir.
3. **Painel de detalhe**, uma linha de tabela própria (`<tr>` com `<td colSpan>` na largura
   inteira), montada só quando `aria-expanded` é verdadeiro. Fechar a linha desmonta o conteúdo do
   painel, não só o esconde com CSS.
4. **Indicador de linhas abertas**, quando mais de uma linha pode abrir ao mesmo tempo: contagem
   em texto no topo do corpo (`X de Y abertas`), calculada do estado, não do dado fixo.
5. **Foco de teclado**, do botão para o painel ao abrir e de volta ao botão ao fechar, porque o
   conteúdo que aparece e desaparece precisa acompanhar quem navega sem mouse.
6. **Total e contagem do rodapé** calculados sobre a lista inteira, nunca sobre o subconjunto de
   linhas abertas: expandir ou recolher uma linha não pode mudar o que o total diz.
7. **Estados do painel**: histórico completo (a forma comum), sem histórico no recorte
   (`role="status"`, `Filter`, frase própria) e histórico indisponível (`Unplug`,
   `formatUnavailable()`), cada um com texto que não se confunde com os outros dois.

## Versões

* [`v1_oportunidades-perdidas-com-historico`](./v1_oportunidades-perdidas-com-historico/) ([preview](./v1_oportunidades-perdidas-com-historico/preview.svg)):
  oportunidades perdidas em agosto de 2026; a linha fechada já anuncia quantas etapas existem, a
  linha aberta mostra a etapa, a data de entrada e os dias em cada uma, e o total perdido do
  rodapé soma sempre as cinco linhas, abertas ou não.
* [`v2_executivo-com-serie-e-motivos`](./v2_executivo-com-serie-e-motivos/) ([preview](./v2_executivo-com-serie-e-motivos/preview.svg)):
  ao abrir um executivo, um `LineChart` do Recharts com a receita dos 12 meses até agosto de 2026
  ao lado da barra de motivos de perda, motivo dominante em `--chart-1` e peso 700, os demais em
  `--line-strong` com o percentual escrito, somando 100 pelo maior resto.
* [`v3_filas-com-mapa-de-entradas`](./v3_filas-com-mapa-de-entradas/) ([preview](./v3_filas-com-mapa-de-entradas/preview.svg)):
  filas de pré-vendas com volume, SLA e bullet de capacidade contra o teto na linha resumo; o
  painel abre a grade de entradas por dia e faixa de horário, com escala sequencial comum às
  quatro filas e a legenda da escala dentro do painel, não no cabeçalho da tabela.
* [`v4_detalhe-sem-dado-e-varias-abertas`](./v4_detalhe-sem-dado-e-varias-abertas/) ([preview](./v4_detalhe-sem-dado-e-varias-abertas/preview.svg)):
  três das cinco linhas abertas ao mesmo tempo, uma com histórico completo, uma sem histórico no
  recorte e uma com histórico indisponível, cada painel com o texto certo para o seu caso, mais o
  foco de teclado indo do botão para o painel e voltando ao fechar.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida; o botão de expandir e o painel já são a peça
   de produção, sem `VisualCard` nem `DataTable.tsx` do kit por baixo.
2. Troque `data` pela lista real vinda da página; o total e a contagem do rodapé recalculam
   sozinhos porque vêm de `reduce`/`filter` sobre o array recebido, nunca de um valor fixo.
3. Se o painel de alguma linha depender de uma chamada própria (a série de 12 meses de um
   executivo, por exemplo), mantenha a montagem condicional ao `isOpen`: só busque o detalhe da
   linha que está sendo aberta, não das 50 de uma vez.
4. Se mais de uma linha puder abrir ao mesmo tempo (como no `v4`), mantenha a contagem de abertas
   visível; se só uma linha pode abrir por vez, a versão vira um acordeão e a contagem sai.
5. Os três estados do painel (histórico, sem histórico no recorte, indisponível) já têm tratamento
   embutido no `v4`; ao ligar dado real, mapeie a origem de cada oportunidade para um desses três
   casos em vez de inventar um quarto texto.

## Referências

* [Ramana Rao, TableLens (acervo Perceptual Edge)](https://www.perceptualedge.com/articles/b-eye/tablelens.pdf): foco com contexto, a base do modelo, e a ideia de abrir uma região sem perder as demais de vista.
* [shadcn/ui, Data Table](https://ui.shadcn.com/docs/components/data-table): padrão de ações por linha e composição sobre uma tabela, referência de como o Farol já organiza `DataTable.tsx`.
* [Behance, plataforma de relatórios e analytics](https://www.behance.net/gallery/176149443/ReportPro-Reporting-and-Analytics) **[aberto só em texto]**: projeto com tags de tabela, relatório e CRM; observar a hierarquia entre resumo e detalhe, sem imagem verificada.

## Observações da revisão (não bloqueantes)

* `v1`: na coluna estreita de valor, `R$ 310,0 mil` quebra em duas linhas ("R$ 310,0" e "mil") nas
  cinco linhas e no cabeçalho "Valor perdido"; legível, mas uma coluna um pouco mais larga
  resolveria a quebra.
* `v1`: o cartão de etapa mostra a duração só em texto, então 34 dias e 5 dias ocupam a mesma
  largura; quem lê rápido perde qual etapa travou o negócio.
* `v2`: o rótulo do quarto motivo sai truncado ("Projeto cancelado internam…") por causa do
  `w-40 truncate`; a categoria ainda se identifica, mas o texto completo não aparece em lugar nenhum
  da tela.
* `v2`: quando a série do executivo vem vazia, a célula de receita escreve um travessão em vez de
  `formatUnavailable()`, que é o que a EST-2 pede; o dado fixo nunca chega nesse caminho, então nada
  aparece no preview.
* `v2`: o render mediu diferença acima de 0,5% entre o `preview.svg` e a página nos dois temas
  (arquivos `.diff.png` em `_render/.qa/`); é deslocamento de cerca de um pixel nas linhas abaixo do
  painel, sem mudança de conteúdo.
* `v2`: o `LineChart` do painel não passa `accessibilityLayer={false}` mesmo com a raiz já trazendo
  `role` e frase calculada.
* `v2`: em Renan A. os dois primeiros motivos empatam em 6 ocorrências e a linha fechada anuncia só
  o primeiro como principal, sem dizer que houve empate.
* `v2`: as barras dos motivos não dominantes ficam em `--line-strong` sobre o trilho, o que mede
  1,83:1 no tema claro; a ACE-3 permite porque o percentual está escrito ao lado, mas a marca quase
  desaparece.
* `v3`: o degrau de cor é calculado entre o menor e o maior valor de todas as filas; aqui o menor é
  zero e a escala nasce no zero, mas com outro recorte o tom mais claro deixaria de significar
  ausência de entrada.
* `v4`: corrigido em 2026-09-19 (checklist 23): `company` da linha `op-02` trazia a marca real
  Bitrix24 dentro de uma frase; virou `Metalúrgica Serra Azul` e o motivo do vazio (migração
  recente de CRM) foi para a pista da linha fechada ("sem histórico: migração recente de CRM"), no
  lugar da frase genérica anterior. O painel de falha e o de vazio seguem com textos distintos e a
  ordem de foco continua do botão para o painel e de volta.

Revisão independente de 2026-09-19, quatro versões aprovadas, nenhum bloqueante; os itens abaixo
somam ao que já estava registrado acima.

* Todas as versões: o `ChevronRight` da linha aberta gira na página viva (`.pagina.png` em
  `_render/.qa/`) mas aparece sem girar no `preview.svg` e nos PNGs de conferência. A causa está na
  ferramenta compartilhada, em `_render/page/serialize.ts`: o ramo de estilo de SVG copia
  `transform` só quando `el.localName !== 'svg'` e nunca copia a propriedade `rotate`, então a
  classe `rotate-90` do ícone se perde na serialização. Nada a corrigir nas versões; quem revisar o
  modelo pelo PNG precisa ler o estado de aberto pelo painel, não pela seta.
* `v2`: o `YAxis` do painel usa `domain={[0, 'dataMax']}` sem `ticks` próprios, então a escala sai
  em 0, R$ 140 mil e R$ 272 mil, sem o intervalo redondo que a EIX-4 pede.
* `v2`: com `interval={2}` no eixo de mês, o último mês da série (ago/26) fica sem tique, embora o
  caso de uso cite justamente os 12 meses até agosto de 2026.
* `v2`: o `meta.json` afirma peso 700 no motivo dominante, enquanto o código aplica `font-semibold`,
  que é 600; a distinção visual funciona, só o texto do metadado é que promete mais.
* `v1` e `v4`: a pista da linha fechada escreve "etapas percorridas" sempre no plural, então uma
  oportunidade com uma etapa só leria "1 etapas"; o dado fixo não chega nesse caso.
* `v3`: acima do teto, os 114% se distinguem por cor e por peso, e o segundo canal exigido pela
  ACE-2 fica por conta do peso; o ícone de alerta que a coluna de SLA já usa deixaria a leitura mais
  firme sem custo de espaço.

## Pendências conhecidas

* Nenhuma pendência aberta nesta rodada de correção (2026-09-19): o único bloqueante apontado
  (marca real em `v4`) foi resolvido e o `check` segue em 0 erro para as quatro versões.
