# Matriz 2x2 de quadrantes

## O que é

Duas medidas numéricas nos eixos, uma divisória vertical, uma horizontal e um ponto por entidade: é a dispersão que virou classificação. A pergunta deixa de ser se X e Y se relacionam e passa a ser em que região cada entidade caiu e que ação essa região pede. O limiar é a decisão inteira, então toda divisória diz o que é, o valor e a procedência (MEDIDO em traço sólido, PREMISSA tracejado), e cada região mostra quantos itens tem e, quando faz sentido, quanto eles somam. Construído com `ScatterChart`, duas `ReferenceLine` e `ReferenceArea` de fundo entre 4% e 7% de opacidade, sobre domínio fixo amarrado a constantes.

## Quando usar

- Classificar de 8 a 60 entidades por duas medidas, com uma ação nomeada para cada região (`v1`, 12 executivos no plano; `v2`, 29 campanhas; `v3`, 79 oportunidades com lista ao lado).
- Existe corte com procedência: mediana da própria série, meta, SLA, break-even ou teto de capacidade.
- Terceira medida aditiva (investimento, receita, fila) que pesa na leitura da região, em bolha (`v2`).
- O leitor precisa do plano e da lista de itens ao mesmo tempo, em cartão largo (`v3`).
- Os dois eixos são variações com sinal entre dois períodos e o zero é o corte natural (`v4`).

## Quando evitar

- A pergunta é a relação entre X e Y, não o grupo: dispersão simples (`09_dispersao-e-bolhas/01_dispersao-simples`).
- Só interessam os quatro números, sem procurar item: matriz agregada de células (modelo 02 desta família).
- Mais de cerca de 120 entidades, onde o rótulo morre: densidade 2D (`09_dispersao-e-bolhas`, modelo 09).
- Movimento de cada entidade entre dois períodos: dispersão de antes e depois com setas.
- A regra de decisão é razão ou produto dos dois eixos: plano com iso-linhas (modelo 03 desta família).
- A mesma classificação repetida por segmento ou período: pequenos múltiplos de dispersão.
- Quase toda a amostra cai numa só região: trocar o corte ou passar a postos antes de insistir no 2x2.

## Anatomia

1. Pontos ou bolhas em `ScatterChart` com `ZAxis` de tamanho fixo (`range` com a área de raio 4) em `v1`, `v3` e `v4`, e com `domain` de zero ao máximo do dado em `v2`, onde a área é o investimento e as maiores são desenhadas antes (ARMADILHAS, REC-15 e REC-31).
2. Quatro `ReferenceArea` de fundo, lendo as constantes do domínio e nunca `dataMax`, com `ifOverflow="extendDomain"`: a região de ação em `--chart-1` a 7% e as outras em `--text-muted` a 4%. A tinta não passa 3:1 contra o cartão, e a guarda `OPACIDADE-MARCA` é escapada com motivo em cada linha: é fundo de região, nomeada em texto, e os cortes são linhas opacas.
3. Duas `ReferenceLine` em `--line-strong` com `ifOverflow="extendDomain"`: sólida para o corte medido ou registrado e tracejada para premissa (`v2` e `v3`).
4. Camada própria dentro do `ScatterChart`, com `usePlotArea`, `useXAxisScale` e `useYAxisScale`: nome de cada corte nas margens reservadas (nunca o `label` nativo, REC-4), títulos dos eixos e títulos de ação nos cantos externos das regiões, em `font-display`, com halo na cor do cartão (ROT-7).
5. Rótulo direto por ponto com posição calculada fora do `LabelList` (`v1` e `v4`): lado direito, lado esquerdo, acima e abaixo, sem tocar outro ponto, outro rótulo, a linha de corte nem um título de região; o nome que não encontra lugar livre não é desenhado, porque rótulo sobreposto não tem dono.
6. Contagem por região escrita na própria região (`v1`, `v3`, `v4`) ou em blocos de HTML sobre o gráfico (`v2`), com a taxa da região recalculada sobre os totais, nunca média das médias.
7. Eixos numéricos com domínio e `ticks` fixos, grade nos dois sentidos em `--line-subtle`, `axisLine` desligado depois do spread do `AXIS_PROPS`, `tickMargin` 8 e a unidade escrita no tique: `formatCurrencyAxis`, `formatPercent`, `formatDays` e, nas variações, o sinal escrito à mão sobre o valor absoluto (`+` e `−`, NUM-3) com `p.p.` por `formatDecimal` (DAD-4).
8. Dica própria com `ChartTooltip` acrescentando o que o corpo não escreve: o par volume e taxa por `formatRateWithVolume` (DIC-1).
9. Linha de leitura calculada do dado no topo e rodapé com `n` no plano e `n` fora por dado ausente, em `--text-muted`; ausência nunca vira ponto no zero (EST-1b, DAD-2).
10. Estado vazio com `role="status"` e o ícone `Filter` quando nenhuma entidade tem as duas medidas.

## Versões

- `v1_ticket-e-conversao-por-executivo`: 14 executivos, 12 no plano, ticket médio contra conversão. Demonstra os cortes na mediana calculada em TypeScript com o valor escrito, `ReferenceArea` amarrada ao domínio fixo, rótulo direto com posição calculada fora do `LabelList`, título de ação e contagem em cada região, e o rodapé com os dois fora do plano por dado ausente.
- `v2_campanhas-contra-break-even-com-bolhas`: 30 campanhas, 29 no plano, custo por lead contra qualificação com o investimento em bolha. Demonstra o corte de premissa tracejado ao lado do corte sólido, `ZAxis` de zero ao máximo com as maiores desenhadas antes e a régua de tamanho, os blocos de resumo em HTML desenhados acima do SVG com halo na cor do cartão, com contagem, investimento e participação fechada em 100 pelo maior resto, a taxa da região sobre os totais, as 8 bolhas de Escalar nomeadas por rótulo direto (coluna à esquerda com fio fino e antidescolisão, e o nome da bolha mais alta ao lado em duas linhas) e a classificação pelo centro da bolha.
- `v3_forecast-parado-com-lista-sincronizada`: 84 oportunidades, 79 no plano, valor contra dias parada, com lista. Demonstra o clique na região filtrando a lista, o hover acendendo o ponto por um segundo `Scatter` de um item, a faixa de indiferença de 8% com os itens da fronteira em ponto oco, o bloco da região crítica com a participação no pipeline vivo e as sem data de movimento no fim da lista.
- `v4_variacao-de-origens-centrada-no-zero`: 22 origens, 20 no plano, variação de volume contra variação de qualificação. Demonstra o domínio simétrico calculado em TypeScript com teto, os ticks com sinal e a unidade de cada eixo, a origem com +480% presa na borda com marca própria e o valor real, a base mínima de 30 leads e a ação nos quatro quadrantes sem verde nem vermelho.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/<Nome>/`, e troque o `import` do `./data` pelo dado real já agregado por entidade.
2. Ajuste as constantes de domínio e de `ticks` do topo do arquivo à faixa real das duas medidas; domínio fixo evita que a nuvem mude de forma a cada filtro e é o que mantém a `ReferenceArea` viva.
3. Os cortes são props ou constantes: em `v1` a mediana sai do próprio dado, em `v2` e `v3` o corte vem do `data.ts` (`breakEvenCpl`, `qualificationGoal`, `valueCut`, `daysCut`) e deve vir da regra de negócio da página, com a procedência escrita.
4. A camada de texto (`PlaneLayer`) só funciona dentro do `ScatterChart`, porque depende de `usePlotArea` e das escalas. Mantenha a ordem dos filhos: áreas, linhas, `Scatter`, camada.
5. Em `v2` os blocos de resumo são HTML posicionado pelas constantes `MARGIN`, `Y_AXIS_WIDTH` e `X_AXIS_HEIGHT`: se mudar uma, mude a outra conta. Mantenha os cantos livres de bolha.
6. Em `v3` o estado do filtro e do destaque vive no componente; para ligar a lista a outro painel, suba `selected` e `hoverId` para a página.
7. Coloque o componente no corpo de um `VisualCard` com altura definida no pai ou passe `height`; o canvas de cada versão está no `meta.json` com a conta.
8. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Recharts, ScatterChart](https://recharts.github.io/en-US/api/ScatterChart/) e [ReferenceArea](https://recharts.github.io/en-US/api/ReferenceArea/): a área de fundo e o comportamento de `ifOverflow`, que descarta a área quando o domínio encolhe.
- [Recharts, hooks de escala](https://recharts.github.io/en-US/api/hooks): `usePlotArea`, `useXAxisScale` e `useYAxisScale`, que dão à camada própria os pixels do plano.
- Estudo da família: `_estudo/familias/25_matriz-e-quadrantes.md`, de onde saem as regras de limiar declarado, procedência no corte, contagem por região e fronteira como zona.
- Nenhum pedido de formatador ou de dependência fora da lista da seção 6 do contrato: a mediana, os mínimos e o desconflito de rótulos são implementação local em cada `Chart.tsx`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-06, as quatro versões julgadas pela primeira vez: `v1`, `v3` e `v4` aprovadas, `v2` reprovada, com o parecer em `validation/revisao_25_matriz-e-quadrantes__01_matriz-2x2-de-quadrantes_2026-10-06.md`. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

- `v1`, `v2` e `v3`: as linhas de corte estão em `--line-strong`, que mede 1,79:1 no escuro e 1,83:1 no claro contra o cartão, e de 1,56:1 a 1,74:1 sobre as regiões tingidas. A tabela 17.2 dá `--text-muted` ao papel de referência (média, meta, teto), mas esse token já é o neutro dos pontos no mesmo visual. Os cortes se veem nos dois PNGs e cada um tem o valor escrito na margem; o tracejado da `v2` no tema claro é o mais fraco. Na `v4` o corte é o zero, e ali `--line-strong` sólido é o que a 17.2 pede.
- `v1`, `v2`, `v3` e `v4`: a guarda CONTRASTE-MARCA não mediu nenhuma das quatro (`preview_com_transform`). Medido à mão com os tokens: `--chart-1` sobre a região de ação dá 8,29:1 no escuro e 5,44:1 no claro, e `--text-muted` sobre as outras dá 4,94:1 e 5,10:1. Destaque contra neutro mede 1,82:1 e 1,12:1 (TOK-9); o segundo canal é a posição na região tingida, o título dela e o peso do rótulo.
- `v1`: o rótulo `Helena B.` cai uma linha abaixo do próprio ponto, debaixo do ponto e do rótulo de `Renan A.`. O dono se lê por eliminação, porque é o único ponto sem nome ao lado.
- `v1`: no `data.ts`, `Vera K.` tem ticket de R$ 44,8 mil com zero vendas ganhas, o que contradiz o comentário do próprio arquivo (ticket nulo para quem não fechou venda). O ticket dela não chega à tela.
- `v1`: o rótulo diz "mediana do time", e a mediana sai dos 12 executivos do plano, não dos 14. O `notes` declara; o cartão só diz "12 de 14 no plano".
- `v1`: o item 5 da Anatomia descreve o desconflito da `v4` (acima, abaixo, título de região como obstáculo, nome omitido quando não há lugar). Na `v1` o rótulo tenta a direita e a esquerda, depois desce de linha em linha, e é sempre desenhado.
- `v2`: o rótulo do corte horizontal escreve "meta 18,0%" e, embaixo, "META", que repete a palavra e não é uma das quatro procedências. A frase acessível e o subtítulo dizem "18%" (DAD-5). O `meta.json` trocou o "corte medido sólido" do catálogo por "corte fixo sólido".
- `v2`: o texto em `--text-muted` dos blocos mede 4,55:1 no tema escuro sobre a região de ação tingida a 7%, e 4,87:1 no claro. Com 8%, teto que o catálogo admite, cai para 4,45:1.
- `v2`: o contorno de 1,5 px na cor do cartão tira 0,75 px do raio visível de toda bolha: 4% do raio na maior e 15% na menor (R$ 5,2 mil, raio de 5,1 px), enquanto a régua de tamanho soma 0,75 px por fora (no espírito da GEO-16). A área declarada confere com o investimento, com desvio de 0,0004 p.p.
- `v2`: "maiores desenhadas antes" vale dentro de cada `Scatter`. A série de Escalar é pintada inteira depois das demais, então uma bolha grande de Escalar cobriria uma pequena vizinha de outra região. No dado fixo não acontece.
- `v2`: a legenda de tamanho fica acima da linha de leitura, e a ANO-5 põe a linha de leitura no topo do corpo.
- `v3`: a contagem sai sem substantivo nos quatro cantos do plano e nos cinco botões ("Proteger o ritmo · 13"), e a NUM-6 pede "13 oportunidades". A unidade se lê na linha de leitura e no bloco da região crítica.
- `v3`: `op-60` e `op-80` têm as mesmas coordenadas (35 dias, R$ 200 mil). O plano mostra 14 pontos na região que o título conta como 15; a lista separa os dois.
- `v3`: os pontos não têm contorno, e nos dois quadrantes de baixo os vizinhos se fundem em manchas. A contagem escrita fecha a leitura; o contorno na cor do cartão, que a `v2` usa, separaria.
- `v3`: no tema claro a faixa de indiferença horizontal mede 1,05:1 contra a região de ação e 1,10:1 contra as outras. Ali quem carrega a faixa são os pontos ocos e o rodapé; a vertical se vê.
- `v3`: o rótulo do corte de valor diz "R$ 150,0 mil" e "PREMISSA", sem dizer o que é; o de dias diz "30 dias parada".
- `v3`: `Y_AXIS_WIDTH` de 76 px, acima da faixa de 48 a 64 da EIX-6, com o motivo no código e no `notes` (o tique "R$ 400 mil" não cabe em 64). Sem consequência no render.
- `v3`: o 15 da região crítica aparece quatro vezes (linha de leitura, bloco, botão e canto do plano), e as outras quatro contagens, duas vezes cada.
- `v3`: a lista abre com 7 das 15 críticas. As outras 8, o nome longo do `data.ts` e o selo "sem data" só aparecem depois de "Ver todas", e a ordem da lista (região, depois valor) não está escrita no cartão (GEO-12).
- `v3`: a região do plano não é clicável, o filtro vem dos botões da coluna, e o cursor sobre um ponto só acende a linha se ela estiver entre as visíveis. O mesmo ponto oco serve à fronteira e ao que o filtro tirou.
- `v3`: o `meta.json` diz "itens da fronteira em cinza", como o catálogo, e o desenho usa ponto oco com contorno cinza.
- `v4`: o `Scatter` das origens presas na borda é sempre `--chart-1`. Uma origem acima do teto com qualificação em alta cairia em Escalar pintada com a cor da região de ação.
- `v4`: o percentual é montado com `formatInt` e "%" escrito à mão, onde a NUM-3 cita `formatPercent` sobre o valor absoluto. A saída é a mesma.
- `v4`: o rodapé escreve "origem nova" no singular para qualquer contagem.
- `v4`: o nome que não acha lugar livre não é desenhado, e nada no cartão diz quantos ficaram sem nome. No dado fixo os 8 da região de ação estão escritos.
- `v4`: o `notes` fala em 580 de altura e o canvas declarado tem 560. A frase acessível mede 236 caracteres, a 14 do teto da ACE-1.

Revisão de 2026-10-06, segunda passada, só a `v2`, julgada pelo arquivo das 10:52 (depois da correção): os três bloqueantes da primeira passada estão resolvidos (oito nomes no desenho, participações de 23, 18, 34 e 25 que somam 100, blocos de resumo acima do SVG com halo), e a versão segue reprovada por dois bloqueantes novos nos fios dos rótulos, descritos na seção "Segunda passada" do mesmo parecer em `validation/`. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

- `v2`: os sete rótulos da coluna têm passo de 12 px com texto de 11 px, 2,98 px de tinta a tinta (aviso COLISAO-TEXTO do `check`, 6 pares). Nos dois PNGs cada nome se lê solto e o halo de um não corta a perna do de cima.
- `v2`: o nome "Redes sociais, base própria", escrito ao lado da bolha dele, fica a 5 px dessa bolha e a 2,3 px do topo da bolha de Busca institucional, que está logo abaixo. O dono se lê porque o texto está centrado na altura da própria bolha e a de baixo tem fio.
- `v2`: a coluna de rótulos fecha com as constantes ajustadas ao dado fixo (`LABEL_COLUMN`, `COLUMN_TOP`, `LABEL_GAP`). Com oito nomes na coluna o primeiro sobe para 92,9 px, dentro do bloco de resumo de Escalar, que vai até 96,5 px; e nome com mais de cerca de 26 caracteres passa da borda esquerda do plano. Nada no cartão declara nenhum dos dois casos.
- `v2`: o halo dos rótulos de bolha tem 3 px de traço, e a ROT-7 escreve 4. Sem consequência: a grade de 30% passa por dentro de "Indicação premiada" e o nome se lê inteiro nos dois temas.
- `v2`: a grade vertical de R$ 2 e a de R$ 6 ainda cruzam a terceira linha de três blocos de resumo. Com o bloco acima do SVG e o halo, a linha aparece só nos vãos entre os glifos e os números se leem.
- `v2`: o rodapé escreve "29 de 30 no plano" sem o substantivo (NUM-6); "campanhas" está na linha de leitura, acima do plano.
- `v2`: as 21 bolhas das outras três regiões só têm nome na dica. O caso de uso pergunta pelas de Escalar, que estão nomeadas; quem for agir em Pausar ou em Renegociar o custo depende do cursor.
- `v2`: o domínio é fixo em R$ 0 a R$ 8 e 0% a 40%, sem marca de fora da escala como a da `v4`. O dado fixo vai até R$ 6,90 e 31,0% e não exercita o caso.
- `v2`: seguem valendo, conferidas no arquivo de hoje, as observações da primeira passada: corte em `--line-strong`, "meta 18,0%" com "META" embaixo e "18%" na frase acessível, texto em `--text-muted` a 4,56:1 na região de ação no tema escuro, contorno de 1,5 px contra o raio visível (a menor bolha mostra 0,051 da área da maior, e o investimento dela é 0,065), ordem de pintura entre as duas séries e legenda acima da linha de leitura.
