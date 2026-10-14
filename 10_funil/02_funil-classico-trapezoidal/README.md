# Funil clássico trapezoidal

## O que é

Faixas empilhadas de cima para baixo e centralizadas: cada trapézio parte da largura da etapa anterior e termina na largura da etapa seguinte, e a inclinação da lateral sugere a perda. É a metáfora mais reconhecível de funil e serve para uma leitura de conjunto, de capa, com poucas etapas monotônicas. Este é o caso mais grave do viés do funil na família: a área do trapézio não corresponde ao valor (a área cresce com o quadrado da largura, o valor cai de forma linear), e o estreitamento visual sugere uma perda proporcional que o dado às vezes não tem. Por isso toda versão deste modelo escreve o valor de cada etapa e a taxa com o denominador nomeado ao lado do desenho; a forma nunca é a única fonte da leitura.

## Quando usar

- Capa de tela ou de apresentação para a Diretoria, com 4 a 6 etapas e leitura de conjunto, não de detalhe.
- Processo em que cada etapa é subconjunto real da anterior e a série é monotônica no recorte escolhido.
- Visão do afunilamento como forma contínua, quando o formato pesa mais que os valores intermediários e o texto ao lado carrega os números (versão cônica).

## Quando evitar

- Comparar etapas vizinhas ou recortes lado a lado: a centralização remove a linha de base comum entre trapézios; use o `01_funil-em-barras-com-taxa-de-passo` ou o `04_funil-comparativo`. **Isto vale para quase toda decisão de passagem:** sempre que a pergunta for "em qual etapa a conversão caiu mais" e não "qual é a forma do conjunto", barras horizontais com o valor escrito na ponta leem mais rápido e não distorcem área, porque o comprimento de uma barra é proporcional ao valor e a área de um trapézio não é.
- Etapa com valor maior que a anterior, comum quando as janelas de data diferem (agenda realizada de julho contando em agosto, por exemplo): o trapézio abre para baixo sem aviso; a versão `v4` desta pasta mostra a validação e a troca automática para barras no mesmo caso.
- Gargalo de largura fixa ou última etapa em triângulo: distorcem os valores finais; use sempre `lastShapeType="rectangle"` e largura proporcional ao valor, nunca um "pescoço" de largura fixa.
- Cartão de 400 px de largura: os rótulos ao lado do trapézio não cabem; use o `07_funil-em-cartoes-de-etapa`.

## Anatomia

1. Trapézio por etapa, com largura proporcional ao valor (`Funnel dataKey nameKey`) e `lastShapeType="rectangle"` para a última etapa não virar ponta.
2. Cor da faixa por `Cell`: uma cor única (`--chart-1`) quando não há destaque, ou destaque em `--chart-1` contra neutro em `--line-strong` quando uma etapa carrega a mensagem (COR-2), sempre com contorno de 1 px em `--surface-raised` separando as faixas (COR-5).
3. Rótulo à direita de cada faixa, fora do desenho: nome da etapa (`text-secondary`/`text-primary`, 12 px) e, na linha de baixo, o valor com a taxa da entrada ou do passo, sempre por `formatRateWithVolume` (denominador nomeado, nunca só o percentual).
4. Linha de leitura opcional no topo do corpo (`aria-hidden`), calculada do dado: a pior taxa de passo, a maior perda absoluta, ou quantas etapas ficam abaixo de uma meta.
5. Aviso escrito no lugar da linha de leitura quando a série deixa de ser monotônica, explicando a causa (janela de data) e avisando a troca de forma.
6. Estado vazio: bloco `role="status"` com o ícone `Filter`, sem eixo nem grade (EST-1).

## Versões

- `v1_trapezios-do-trimestre`: funil comercial do trimestre 2026 T3 (Aberta 420, Diagnóstico 268, Proposta 131, Negociação 64, Ganha 29). Demonstra o `FunnelChart` nativo básico, `lastShapeType="rectangle"`, `Cell` de cor única e o rótulo à direita com valor e taxa da entrada com denominador nomeado.
- `v2_pior-passagem-em-destaque`: mesmo funil comercial, com a etapa de destino da pior taxa de passo (Negociação para Ganha) em destaque. Demonstra `Cell` por regra de dado (destaque contra neutro), o cálculo da pior taxa de passo e da maior perda absoluta no próprio componente, e a distinção entre as duas leituras na linha de leitura.
- `v3_cone-continuo-com-meta-semanal`: esteira de pré-vendas da semana 2026 W37 (Entradas 1.180 a Handoff aceito 142) contra a meta semanal de cada etapa (de 1.100 a 190). Demonstra a variação em área contínua (duas `Area` empilhadas, uma base transparente e uma faixa visível) com contorno tracejado da meta, eixo de valor oculto de propósito e o valor de cada etapa escrito no eixo de categoria, nunca inferido da altura.
- `v4_etapa-maior-que-a-anterior`: pré-vendas de 2026-08, em que Agenda realizada (260) soma mais que Agenda marcada (248) porque inclui agendas de julho. Demonstra a validação de monotonicidade antes de desenhar, o aviso escrito com a causa, a troca automática para barras horizontais na mesma ordem de processo, e a taxa acima de 100% escrita pelo mesmo formatador, sem truncar.

## Como colar no Farol

1. Escolha a versão pelo `useCase`: capa de conjunto (`v1`), destaque de uma passagem (`v2`), impressão de forma contra meta (`v3`) ou dado que pode quebrar a ordem (`v4`, que já embute o `BarChart` de troca).
2. Ao ligar o dado real, mantenha a ordem de processo no array de entrada: nenhuma versão deste modelo ordena por valor, porque a ordem *é* a informação.
3. Se a página vai comparar duas ou mais passagens lado a lado (SDR contra SDR, mês contra mês), prefira o `01_funil-em-barras-com-taxa-de-passo` em vez de duplicar este trapézio: a leitura de comparação é o ponto fraco declarado do modelo.
4. A `v4` decide sozinha entre funil e barras a cada render; ao colar no Farol, mantenha essa validação no componente em vez de decidir na página, porque o dado real muda de recorte para recorte.

## Referências

- [Recharts, API Funnel](https://recharts.github.io/en-US/api/Funnel/): `lastShapeType` (o padrão é triângulo), `reversed`, `shape`, `activeShape`.
- [Recharts, exemplo de funil](https://recharts-recharts.mintlify.app/examples/funnel-chart): `LabelList` dentro e fora da faixa e `Cell` por segmento.
- [Highcharts, JSFiddle do funil](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/funnel/): antiexemplo, `neckWidth` e `neckHeight` fixos desproporcionam as etapas finais.
- [Data Viz Project, Funnel Chart](https://datavizproject.com/data-type/funnel-chart/) (não abriu): ficha do formato clássico.
- [Storytelling with Data, #SWDchallenge funnel chart (2024-06-03)](https://www.storytellingwithdata.com/blog/swdchallenge-funnel-chart): as três ressalvas do modelo (centralização, diferença de magnitude, uso sem progressão real).
- [Graphtelling, Funnel Chart Alternatives](https://graphtelling.com/blog/funnel-chart-alternatives/): a medição da distorção de área que justifica escrever valor e taxa ao lado de todo trapézio.
- [Behance, Style Guidelines for data visualisation: dark & light](https://www.behance.net/gallery/82482589/Style-Guidelines-for-data-visualisation-dark-light): funil incluído num guia com variação de tema escuro e claro.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. Os pontos abaixo não reprovam nenhuma versão; os bloqueantes ficam registrados no veredito de cada uma. Rodada de correção de 2026-09-18: resolvidos o corte da linha de leitura em `v2` e do aviso em `v3`/`v4` (texto encurtado e classe `truncate` trocada por `line-clamp-2`, que reserva até duas linhas em vez de sumir sem rastro), a ausência de rótulo no contorno da meta em `v3` (ROT-3), a palavra "esteira" ambígua em `v3` e a cor `--text-muted` do aviso em `v4` (trocada por `--warning`); a faixa realizada da `v3` agora também marca cada etapa com ponto, não só o contorno da meta. Detalhe de cada correção no changelog abaixo._

- `v1`: o rótulo da primeira etapa escreve `100,0% (420 de 420)`, que é tautológico; o topo poderia trazer só o volume com o substantivo (`420 oportunidades`), como faz a `v4`.
- `v1`: a frase acessível abre com "Funil com 5 etapas do funil comercial", repetindo a palavra funil na mesma oração.
- `v2`: o catálogo pede `--accent-amber` na etapa de destino da pior passagem; a versão usa `--chart-1` contra o neutro `--line-strong`, que é o que a 17.2 manda. A divergência está no catálogo, não na versão.
- `v2`: o destaque cai na etapa `Ganha`, que o leitor pode ler como conquista em vez de destino da pior passagem; a linha de leitura, agora legível por inteiro, é quem desfaz a ambiguidade.
- `v4`: por construção, o preview desta versão nunca mostra o trapézio, só o desvio para barras (o dado fixo do exemplo quebra a monotonicidade de propósito); quem abrir a galeria vê barras dentro do modelo trapezoidal. É o comportamento pretendido da versão, não um defeito de render.

_Segunda leitura, revisor independente, 2026-09-18: `npm run check` sai com 0 com erro e 0 aviso nas quatro versões, os dois temas saem sem corte, sobreposição ou transbordo, e nenhuma versão tem bloqueante. Os pontos abaixo são de acabamento e de redação._

- `v2`, `v3` e `v4`: os números da linha de leitura e do aviso vivem em Manrope dentro de um `<p>` sem `tabular-nums`, então só o texto em `font-display` do desenho tem algarismo tabular (TIP-1). Acrescentar a classe no parágrafo alinharia o dígito.
- `v3`: a faixa cheia do realizado é a única série sem nome escrito; a meta ganhou rótulo no fim do contorno e a identificação da faixa depende do texto do eixo e da frase acessível. Um rótulo curto no fim da faixa fecharia a leitura sem legenda.
- `v3`: a linha de leitura diz a mesma fração duas vezes, em contagem e em percentual (`5 de 6 etapas` e `83,3% delas`); sobre seis itens o percentual acrescenta pouco, e a NUM-1 pede percentual de composição inteiro.
- `v4`: o mês aparece na tela como `2026-08` dentro do aviso; a NUM-7 reserva `YYYY-MM` para o dado e pede `formatMonthShort` (`ago/26`) no texto de tela.
- `v4`: a troca para barras mantém o rótulo `104,8% (260 de 248)` na etapa que quebra a ordem, o que está certo, mas a barra dessa etapa não se distingue das demais; o aviso do topo é o único canal que aponta qual etapa é a anômala.

## Pendências conhecidas

- `v1`: rótulo tautológico da primeira etapa e repetição da palavra "funil" na frase acessível (observações acima); fora do escopo desta rodada, que tratou só as versões reprovadas.
- `v2`: destaque na etapa `Ganha` pode ainda ser lido, num primeiro relance, como conquista em vez de destino da pior passagem; a linha de leitura corrige na segunda leitura, mas a ambiguidade visual do destaque em si não tem solução dentro deste modelo (mudar a cor do destaque é o que o catálogo já pede e está registrado como divergência do catálogo, não da versão).
- `v4`: o preview nunca mostra o funil trapezoidal em si, só a troca para barras, porque o dado de exemplo existe para provar essa troca; quem quiser ver o trapézio deste componente olha `v1`, `v2` ou `v3`.
