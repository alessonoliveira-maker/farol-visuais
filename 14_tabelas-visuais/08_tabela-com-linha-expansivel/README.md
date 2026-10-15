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
  ao lado da barra de motivos de perda, motivo dominante em `--chart-1` e peso 700 (só com máximo único; no empate a linha fechada nomeia os empatados e as barras empatadas levam o mesmo destaque), os demais em
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
* `v2`: o render mediu diferença acima de 0,5% entre o `preview.svg` e a página nos dois temas
  (arquivos `.diff.png` em `_render/.qa/`); é deslocamento de cerca de um pixel nas linhas abaixo do
  painel, sem mudança de conteúdo.
* `v2`: o `LineChart` do painel não passa `accessibilityLayer={false}` mesmo com a raiz já trazendo
  `role` e frase calculada.
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
* `v2`: com `interval={2}` no eixo de mês, o último mês da série (ago/26) fica sem tique, embora o
  caso de uso cite justamente os 12 meses até agosto de 2026.
* `v1` e `v4`: a pista da linha fechada escreve "etapas percorridas" sempre no plural, então uma
  oportunidade com uma etapa só leria "1 etapas"; o dado fixo não chega nesse caso.
* `v3`: acima do teto, os 114% se distinguem por cor e por peso, e o segundo canal exigido pela
  ACE-2 fica por conta do peso; o ícone de alerta que a coluna de SLA já usa deixaria a leitura mais
  firme sem custo de espaço.

Correção de 2026-10-15 em `v2`: nome do motivo inteiro em até duas linhas (TIP-7); eixo Y com ticks redondos (0 a 300 mil) em largura de 70 px, um tique por linha (EIX-4, EIX-6); `shares` devolve `null` sem perdas e a ausência é escrita pelo nome, série vazia vira bloco `role="status"` e `formatUnavailable()`; empate nomeia os empatados (COR-2); `axisLine={false}`, `tickMargin={8}` e margem em constante. Sem desvio declarado de largura além dos 70 px da tabela da EIX-6.

Revisão independente de 2026-10-15 (`v2` e `v3`, código de 2026-09-28): `v3` aprovada, `v2`
reprovada com o parecer em `validation/revisao_14_tabelas-visuais__08_tabela-com-linha-expansivel_2026-10-15.md`.
Os itens abaixo não bloqueiam e somam ao que já estava registrado.

* `v2`: a frase acessível descreve a estrutura e não diz conclusão nenhuma (ACE-1); caberia, por
  exemplo, a subida de Talita V. e o peso do motivo dominante.
* `v2`: os tiques do eixo Y saem em Manrope sem algarismo tabular, e "50% das perdas" também (TIP-1);
  os percentuais são montados com `String()` e não com `formatPercent`.
* `v2`: o total de perdas de cada executivo não aparece em lugar nenhum, então "73% das perdas" de 11
  casos parece mais forte que "50% das perdas" de 18 (DAD-1, DAD-7).
* `v2`: o cabeçalho "Receita do mês" não diz qual mês; dá para derivá-lo do último ponto da série com
  `formatMonthShort` (NUM-5, DAD-9).
* `v2`: cada painel tem o domínio Y do próprio executivo; com dois abertos, a mesma altura vale
  valores diferentes (EIX-9); se o modelo admite várias abertas, vale declarar ou usar escala comum.
* `v2`: o `series()` do `data.ts` troca mês faltante por zero (`?? 0`) e o tipo não admite `null`, então
  um mês sem medição viraria receita zero na linha (EIX-10, DAD-2).
* `v3`: com todas as filas sem grade de entradas, `min` e `max` caem em 0 e 1 (`Chart.tsx:38`, aviso da
  `AGREGACAO-ZERO`) e chegam à legenda e à frase acessível ("de 0 a 1 entradas"); mesmo critério de
  `14/06 v2`, observação: devolver `null` e omitir a faixa (EST-1b).
* `v3`: a frase acessível não diz a conclusão (ACE-1): Santa Catarina acima do teto (114%) e do SLA
  (5,8 h contra 4 h), e o pico das 13h.
* `v3`: "(meta 4 h)" e os extremos "0" e "27" da legenda saem em Manrope sem `tabular-nums` (TIP-1).
* `v3`: a legenda da escala não tem unidade ("0 a 27 entradas") e o painel não diz se a célula é o
  total do mês (NUM-5, NUM-6); a grade de Santa Catarina soma 306 entradas contra 268 em
  "Volume/mês", incoerência que só aparece com o painel dela aberto.
* `v3`: a marca do teto do bullet não tem rótulo com valor (ANO-2) e, sobre a barra de 114%, mede
  1,82:1 no escuro e 1,12:1 no claro contra `--chart-1`; o percentual escrito cobre a leitura (ACE-3).
* `v3`: capacidade acima de 130% é cortada em `CAPACITY_DOMAIN_MAX` sem sinal no desenho; o dado
  fixo não chega nesse caso.

Revisão independente de 2026-10-15, segunda passada (`v2` depois da correção do mesmo dia): `v2`
aprovada. Os quatro bloqueantes do parecer anterior estão resolvidos no arquivo de hoje (nome inteiro
em duas linhas, tiques de 0 a 300 mil em uma linha cada, `shares` nulo sem perdas, empate nomeado e
com o mesmo destaque). Os itens abaixo não bloqueiam e somam ao que já estava registrado.

* `v2`: com a série vazia, a célula "Receita do mês" escreve `formatUnavailable()` em
  `--text-primary` e sem `Unplug`, enquanto o painel da mesma linha diz "Nenhum mês com receita neste
  recorte." com `Filter`; o dado fixo não chega ao ramo, mas a linha diria indisponível e vazio ao
  mesmo tempo. Escrever na célula a frase de vazio em `--text-muted` e reservar `formatUnavailable()`
  com `Unplug` para um estado de falha explícito no tipo, como na `v4` (EST-1, EST-2, Anatomia item 7).
* `v2`: `Y_AXIS_WIDTH` de 70 px fica acima da faixa de 48 a 64 da EIX-6 sem desvio declarado no
  `meta.json`; no render os tiques saem em uma linha, sem consequência. Declarar o desvio ou seguir a
  REC-2.
* `v2`: o render de hoje mede 1,92% (escuro) e 1,95% (claro) entre página e `preview.svg`, acima de
  0,5% e abaixo do teto de 2,00% da ferramenta. O painel sai idêntico; o vermelho do `.diff.png` está
  na seta sem giro, no kerning por face que a própria ferramenta avisa (FIDELIDADE) e num deslocamento
  de 1 px das linhas abaixo do painel.
* `v2`: o trilho dos motivos mede 58 px, então 1 p.p. vale 0,58 px; com raio de 6 px numa barra de
  12 px de altura, a de 22% (12,75 px) sai como círculo e a de 11% (6,4 px) como cápsula. O percentual
  escrito sustenta a leitura; nome antes do trilho (ROT-2), trilho mais largo e raio menor devolvem a
  forma de barra.
* `v2`: a linha da série e o motivo dominante dividem `--chart-1` no mesmo painel (17.2, um destaque
  por visual); a linha em `--text-secondary` deixaria o ciano só para o motivo destacado.
* `v2`: o empate escreve "40% cada das perdas"; "40% das perdas cada" lê melhor. Com empate que o
  maior resto arredonda diferente (contagens 1, 1 e 1 viram 34, 33 e 33) a linha fechada escreveria
  "34% cada"; o dado fixo não chega.
* `v2`: a pista "receita mensal e motivos de perda" é igual nas quatro linhas e quebra deixando "perda"
  sozinha em cada uma; calculada do dado (o total de perdas, por exemplo) ela caberia numa linha e
  responderia à observação de DAD-1 acima. O cabeçalho "Receita do mês" também quebra em duas linhas.
* `v2`: continuam valendo as observações anteriores: frase acessível sem conclusão (ACE-1), tiques do
  eixo Y e "% das perdas" sem algarismo tabular (TIP-1), mês da "Receita do mês" não dito, domínio Y
  por executivo, `?? 0` no `series()` do `data.ts`, ago/26 sem tique e `accessibilityLayer` ligado.

## Pendências conhecidas

* Nenhuma pendência aberta nesta rodada de correção (2026-09-19): o único bloqueante apontado
  (marca real em `v4`) foi resolvido e o `check` segue em 0 erro para as quatro versões.
