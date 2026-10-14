# Matriz agregada de células (2x2, 3x3)

## O que é

A grade que fica quando os pontos somem: cada célula nomeia um grupo e carrega a contagem, a soma da medida de negócio e, quando cabe, cartões com os itens. Linhas e colunas são categorias ou faixas declaradas, e a caixa de cada item é derivada por regra auditável, nunca arrastada. Lê-se pelo número escrito na célula e pela posição: nenhuma célula tem área proporcional ao valor. Construída em HTML com CSS Grid e Tailwind, sem Recharts, cada célula é um botão com `aria-label` que filtra o painel.

## Quando usar

- A pergunta é quanto cai em cada grupo e ninguém vai procurar item individual (2x2 de 4 números em cartão pequeno).
- Calibração de carteira em três faixas por eixo, até 9 células, com zonas diagonais de ação.
- Itens acionáveis distribuídos por regra em quatro caixas, cada uma com um verbo, até 6 cartões visíveis por caixa e o resto como +n.
- Os dois eixos já são categóricos ou foram cortados em faixas declaradas.

## Quando evitar

- É preciso achar uma entidade pela posição, ou os eixos são medidas contínuas: matriz 2x2 de quadrantes (família 25, modelo 01).
- A célula existe para ler intensidade por gradiente: matriz categórica em cor (família 15, modelo 02).
- Área da célula proporcional ao valor: mosaico e marimekko (família 26).
- Caixa que vira lista sem limite de cartões visíveis: limite em 6 e abra a lista no painel.
- Largura abaixo de cerca de 360 px, onde a grade empilha e deixa de ser matriz.

## Anatomia

1. **Grade** em CSS Grid com `gap-px` sobre `bg-line-subtle` (v1, v3) ou contorno de 1 px em `--line-subtle` (v4); fundo da célula `bg-surface-sunken`, ou as três faixas baixas da rampa `--seq-1`, `--seq-2` e `--seq-3` nas zonas diagonais da v3, onde `--text-primary` passa de 4,5:1 nos dois temas.
2. **Eixos fora da grade**, com seta lucide e rótulo (v1, v4; a v3 escreve a ordem por extenso, "da maior para a menor", sem seta); eixo de julgamento humano leva contorno tracejado em `--line-strong` e a frase avaliação do time, não medição (v4).
3. **Célula como botão**, com `aria-label` calculado do dado e `aria-pressed` quando filtra (v1, v4); na v3, `tabIndex` móvel e setas movem o foco.
4. **Conteúdo da célula**: número em `kpi-number`, contagem com o substantivo, participação por `formatPercent` pelo maior resto (soma 100), soma por `formatCurrencyCompact`.
5. **Estados de exceção em canais diferentes**: zero medido é célula em `--surface-raised` com o 0 escrito em `--text-muted`; ausência é faixa tracejada ou pontilhada com ícone `Unplug`; a pior caixa leva `ring` em `--chart-3` e ícone.
6. **Regra no rodapé** (v2): limiares de SLA e valor escritos com `formatHours` e `formatCurrencyCompact`, os mesmos que a função `boxOf` usa.

## Versões

- `v1_leads-por-origem-e-documento-em-2x2`: 2x2 de leads por origem e documento, número grande e participação, caixa pior com borda em `--chart-3`, canvas `card`.
- `v2_fila-da-sdr-em-eisenhower`: 64 leads em quatro caixas derivadas por SLA e valor, até seis cartões por vencimento e +n, relógio nos vencidos, faixa dos leads sem valor, canvas `alto`.
- `v3_carteira-em-abc-e-xyz`: 3x3 de 180 contas com critério no cabeçalho, zonas diagonais, receita e participação por célula, célula A e Z destacada, navegação por setas, canvas `quadrado`.
- `v4_nine-box-com-celula-vazia-e-lotada`: 60 contas por potencial e relacionamento, eixos tracejados, célula com 0 contas e célula com 41 (seis chips, +35, Abrir lista), faixa sem avaliação, canvas `alto`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão e troque o `import` do `./data` pelo dado real agregado. A caixa é derivada no componente por regra (`boxOf` na v2, faixas por nota na v4): passe os itens, não a caixa.
2. Ligue o clique das células ao filtro da página: o estado `selected` vive no componente; para controlar de fora, suba-o para a página. Na v4, `onOpenList` abre a lista de contas.
3. As constantes de regra (`URGENT_HOURS`, `HIGH_VALUE`, `MID_FROM`, `HIGH_FROM`) vêm da regra de negócio da página, com a procedência escrita.
4. Na v3 e na v4 os cortes e as notas são fictícios e já agregados (v3) ou julgamento do time (v4): troque pela fonte real e mantenha o rótulo que diz qual dos dois é.
5. Coloque o componente no corpo de um `VisualCard` com altura definida no pai, ou passe `height`.
6. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- Estudo da família: `_estudo/familias/25_matriz-e-quadrantes.md`, de onde saem a regra de derivação auditável, a faixa para item sem atributo e o eixo de julgamento tracejado.
- Matriz de Eisenhower (urgente e importante), análise ABC e XYZ de estoque e carteira, e a matriz GE e McKinsey de nove caixas, como desenhos de origem.
- Molde de estrutura: `15_mapa-de-calor-e-calendario/02_matriz-categorica` e `14_tabelas-visuais/02_tabela-com-heatmap-nas-celulas`.
- Nenhum pedido de formatador ou de dependência fora da lista da seção 6 do contrato.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-06, as quatro versões julgadas pela primeira vez: `v1` e `v2` aprovadas, `v3` e `v4` reprovadas, com o parecer em `validation/revisao_25_matriz-e-quadrantes__02_matriz-agregada-de-celulas_2026-10-06.md`. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

- `v1`, `v2`, `v3` e `v4`: as guardas CONTRASTE-TEXTO, COLISAO-TEXTO e TEXTO-NA-MARCA não mediram nenhuma das quatro (`texto_em_html`). Conferido à mão pelos tokens e pelos PNGs: `--text-muted` sobre `--surface-sunken` é par aprovado (5,98:1 e 4,65:1), `--text-primary` sobre `--seq-3` dá 6,33:1 no escuro e 9,35:1 no claro, e nenhum texto encosta em outro.
- `v1`, `v2`, `v3` e `v4`: número escrito dentro de frase sai em Manrope sem `tabular-nums` (TIP-1): linha de leitura e rodapé da `v1`; cabeçalho de coluna, contagem da caixa, faixa e regra da `v2`; critério de faixa da `v3`; faixa sem avaliação da `v4`. Os números de célula e de coluna usam `kpi-number` ou `font-display`.
- `v1`: a contagem da caixa (163, 412, 47 e 88) vai sem o substantivo (NUM-6). A unidade vem da linha de leitura ("dos leads") e do `aria-label` do botão; "163 leads" fecha a caixa sozinha.
- `v1` e `v3`: no ramo em que uma caixa vem `null` e não é a melhor nem a pior (`v1`) nem a A e Z (`v3`), `sharesOf` reparte 100 entre as caixas medidas, e a linha de leitura e a frase acessível escrevem o percentual e o total como se fossem do todo. A caixa nula mostra `formatUnavailable()`, mas falta dizer "entre as caixas medidas" (DAD-2, EST-4). O preview não desenha esse ramo.
- `v1`: há dois contornos coloridos sem legenda: o da melhor caixa, em `--chart-1` de 1 px, que o catálogo não pede, e o da pior, em `--chart-3` de 2 px com ícone. A 17.2 fala em um destaque por visual, e o peso 700 do 412 já marca a melhor.
- `v2`: os quatro verbos das caixas estão em peso 700, e a TIP-3 admite dois por visual. Peso 600 nos quatro resolve sem mudar a leitura.
- `v2`: a frase acessível começa por "Fila de 64 leads em quatro caixas", e não pelo tipo (ACE-1). "Matriz de Eisenhower com 64 leads" atende.
- `v2`: `slaText` arredonda o prazo em dias para o inteiro mais próximo, então 60 h sairia como "em 3 dias". Prazo se arredonda para baixo, ou vai com uma casa.
- `v2`: o rodapé termina em "Por vencimento.", frase sem sujeito; "Cartões por ordem de vencimento" diz o que está ordenado. A coluna de valor também não tem nome além de "valor alto" e "valor baixo" no canto da caixa.
- `v2`: as caixas são `section` sem clique, e o "O que é" deste README diz que cada célula é um botão que filtra. Ou a `v2` ganha o botão, ou o texto passa a dizer que nela a caixa só agrupa.
- `v3`: as amostras da legenda de zona medem 2,29:1, 1,58:1 e 1,14:1 contra o cartão no escuro e 1,92:1, 1,49:1 e 1,21:1 no claro; a de Revisar quase some. É a dívida da emenda em estudo E5 (amostra de legenda sem isenção), que hoje não reprova. Contorno em `--text-muted` na amostra resolve.
- `v3`: o divisor de 1 px em `--line-subtle` entre duas células da mesma zona mede 1,83:1 e 1,49:1 em Proteger, mas 1,09:1 no escuro e 1,06:1 no claro em Revisar, onde as três células leem como um bloco só (COR-5). O número de cada célula mantém a separação.
- `v3`: o subtítulo diz "Cortes fixos de negócio, não por quantil", e o ABC é corte por receita acumulada: as linhas somam 80%, 15% e 5% da receita por construção. Vale dizer isso no subtítulo, porque é a leitura que o tipo de corte existe para proteger.
- `v3`: "Zona pela soma dos índices" não diz quais índices nem os limiares (0 a 1, 2, 3 ou mais), e "variação até 0,5" não diz que é coeficiente de variação. A zona de cada célula só está no tom e no `aria-label`; tom contra tom mede 1,38:1 e 1,45:1 no escuro e 1,23:1 e 1,29:1 no claro.
- `v4`: o contorno tracejado dos títulos de eixo está em `--line-strong`, 1,79:1 no escuro e 1,83:1 no claro, e a legenda do rodapé aponta para ele pela palavra "Tracejado". A informação sobrevive no texto, por isso não reprova; `--text-muted` no contorno (5,21:1 e 5,37:1) dá referente visível à legenda.
- `v4`: o contorno do botão "Abrir lista" também está em `--line-strong`, 2,05:1 e 1,59:1 sobre a célula. O texto identifica o controle; `tokens.css` tem `--control-border` para esse papel.
- `v4`: a linha do meio tem 174 px e as outras 60 px, então as três células de potencial médio têm quase o triplo da área das demais. O comentário do código diz que a altura é regra de conteúdo; o cartão não diz, como a `v1` diz no rodapé. Sobram ainda cerca de 33 px vazios entre a grade e a faixa.
- `v4`: o `aria-label` da célula escreve "1 contas", sem a concordância que o texto visível faz.
- `v4`: a célula mais cheia sempre ganha chips, "+n" e "Abrir lista", mesmo com seis contas ou menos, caso em que sairia "+0 contas". Falta o limiar a partir do qual a célula conta como lotada.

Revisão de 2026-10-06, segunda passada, depois da rodada de correção: `v3` e `v4` julgadas de novo pelo arquivo e pelos PNGs atuais (render das 12:00, posterior aos dois `Chart.tsx`) e aprovadas, sem bloqueante. Os três bloqueantes da primeira passada foram conferidos como resolvidos: a `v3` trocou as setas pela ordem escrita, "da maior para a menor", nos dois eixos, e a `v4` passou a desenhar estável com traço e a nomear, no rodapé e na frase acessível, os três estados e a nota do chip com a escala. As linhas de `v3` e `v4` do parágrafo acima continuam valendo no arquivo de hoje, com um ajuste: na `v4` a distância entre a grade e a faixa caiu de cerca de 33 px para 17 px, 8 px deles do vão, porque o rodapé passou a ter duas linhas. Itens novos, nenhum reprova:

- `v3` e `v4`: número em `font-display` sem classe de peso pede Space Grotesk 400, que não é carregado (TIP-4): receita e participação na `v3`, nota do chip e "+35 contas" na `v4`. O preview embute só 500 e 600 e desenha em 500, sem consequência visível; `font-medium` deixa o peso escrito.
- `v3`: o ramo de célula sem medição, que o preview não desenha, mantém o tom da zona. Na zona Revisar o texto de `formatUnavailable()` cairia sobre `--seq-1`, que a tabela 17.2 tira de "sem dado", e o ícone `Unplug` sai em `--text-primary`, não em `--text-muted` (EST-2). Com só a receita nula, o texto vai sem ícone.
- `v3`: o cartão não diz o período da receita nem a janela em que a variação mensal foi medida; "reconhecida em 2026" só existe no comentário do `data.ts` (DAD-9).
- `v3`: a legenda de zona fica abaixo da grade, e a ROT-4 fala em acima ou ao lado. São duas linhas e nada colide.
- `v4`: a frase acessível subiu para 237 caracteres com a frase dos chips, e o `check` avisa. Com a célula lotada sendo "Atender no padrão" e duas células vazias ela chega a 251 e passa do teto de 250 da ACE-1. Encurtar a parte fixa, a que começa em "Chips:", devolve a folga.
- `v4`: os cortes das faixas (alto a partir de 7, médio de 4 a 6,9) só existem em `MID_FROM` e `HIGH_FROM`. O rodapé diz a escala de zero a dez e não diz onde uma faixa vira a outra, como a `v2` faz com a regra dela; um chip com 6,8 na linha Médio não mostra a que distância está de Alto.
- `v4`: "sobe", "estável" e "cai" não dizem em qual dos dois eixos a posição prevista se move, e o comentário do `data.ts` também não.
- `v4`: o título no `meta.json` é "Nine-box com célula vazia e lotada", e o do catálogo é "Nine-box com célula vazia e célula lotada".
- `v4`: a caixa do título "Potencial" mede 77,5 px e a coluna de rótulos (`LABEL_W`) tem 72 px. Ela invade 5,5 px do recuo da coluna seguinte e para a 7,5 px da caixa de "Relacionamento", sem colisão.
