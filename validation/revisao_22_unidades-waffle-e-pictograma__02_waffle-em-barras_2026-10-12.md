# Parecer de revisão: 22_unidades-waffle-e-pictograma/02_waffle-em-barras

Data: 2026-10-12. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 08:36, posterior ao `Chart.tsx` das quatro, de 08:35 e 08:36). `npm run check` com tipos: 0 com erro, 1 aviso (ESPESSURA-MARCA na `v4`, o filete da célula parcial de 20%, que é esperado).

Resultado: as quatro reprovadas, cada uma por **um** bloqueante. `v1`, `v2` e `v4` caem pelo mesmo defeito, que se conserta com uma constante. A `v3` cai por outro, de papel de cor. As 14 observações não bloqueantes estão no README do modelo. O encoding das quatro está certo e não precisa de mudança: a lista do que foi conferido fecha este parecer.

## Peso dos bloqueantes

* **`v1`, `v2` e `v4`: descendente do tique cortado.** Pergunta 15, seção 14.1. Altura de eixo é constante de acabamento, e a 14.1 só deixa bloquear quando o desvio aparece no render. Aparece: é texto cortado, medido em linhas do PNG, igual nos dois temas e na página viva. É bloqueante leve, de 1 px, e entra pelo mesmo critério que reprovou `19_cascata-waterfall/05` por 0,5 px de descendente dentro da marca. A palavra continua legível; o que não serve de referência é a constante, que quem copiar a peça leva junto.
* **`v3`: ausência desenhada como se fosse uma quinta origem.** Perguntas 11, 12 e 19. Papel de cor e identificação das marcas bloqueiam sempre pela 14.1, e a regra está escrita em três lugares (tabela 17.2, ACE-2 e ROT-4).

## O que foi medido e o que não foi

* **Medido:** os oito PNGs de conferência e os oito da página; a contagem de células de cada coluna, refeita do `data.ts` e conferida no desenho (`v1` 12, 17, 21, 24 e 7; `v2` 15, 13, 21, 18 e 9; `v3` 199 células, 71, 59, 21, 45 e 3 por origem; `v4` 21,2, 27,8, 34,7 e 15,6 células); a posição dos textos e da linha da meta no `preview.svg`; as linhas de tinta dos tiques por varredura de pixels; o contraste do neutro contra as categóricas, calculado de `app/src/styles/tokens.css`.
* **Não medido pela ferramenta:** EIXO-CALMO (sem grade), OPACIDADE-MARCA (sem opacidade) e RAIO-CONTRA-AREA (sem marca de área) nas quatro. Conferido à mão que não se aplicam.
* **Não renderizado:** o vazio das quatro; na `v3`, mês com zero vitória; na `v4`, a unidade de 1 lead e o recorte com todos os meses sem coleta; na `v2`, meta que não é múltiplo de 3. O que se diz desses ramos é leitura do código.
* **Não testado:** as saídas sugeridas abaixo. São conta sobre o `preview.svg`, não render.

## Bloqueante comum a `v1`, `v2` e `v4`

**Pergunta 15; seção 14.1 (acabamento com consequência no render: texto cortado), EIX-6b e ESP-3.**

**O que se vê.** Nos tiques do eixo de categoria, toda letra que desce da linha de base sai cortada pela borda de baixo do gráfico. O "g" de `Segunda` e de `ago/26` perde o fecho do gancho e sobra em dois pontos soltos; a cedilha de `Terça` perde o gancho e fica só a haste; o "j" de `jul/26` perde a ponta.

**No código.** As três versões declaram `MARGIN` com `bottom: 0` e `X_AXIS_HEIGHT = 24` (`v1`, `Chart.tsx:40` e `41`; `v2` e `v4`, `Chart.tsx:43` e `44`).

**No `preview.svg`.** O `<svg>` do gráfico mede 574 por 214 px e tem `overflow:hidden`. A faixa do eixo começa em y=190. O tique nasce em `y="204"`, isto é, 190 mais 6 px de `tickSize`, que o Recharts reserva mesmo com `tickLine={false}`, mais 8 de `tickMargin`. Dali desce `dy="0.71em"` em 11 px: linha de base em 211,81. Sobram 2,19 px até a borda, e o descendente da Manrope em 11 px mede 3 px.

**Nos PNGs, por varredura de linhas de tinta.** A borda do gráfico é a linha 656 da imagem (duas vezes 114 mais 214). A referência sem corte é a própria `v3`, que usa o mesmo corpo de 11 px num eixo de 44 px.

| Versão | Tique | Linha de base | Última linha com tinta | Linhas de descendente |
|---|---|---|---|---|
| `v1` e `v2` | Segunda, o "g" | 651 | 655 | 4 |
| `v1` e `v2` | Terça, a cedilha | 651 | 655 | 4, sem o gancho |
| `v4` | ago/26, o "g" | 651 | 655 | 4 |
| `v4` | jul/26, o "j" | 651 | 655 | 4 |
| `v3`, sem corte | ago/26, o "g" | 694 | 700 | 6 |
| `v3`, sem corte | jul/26, o "j" | 694 | 699 | 5 |

O "g" perde 2 linhas de imagem das 6, isto é, 1 px dos 3 px de descendente; o "j" perde 1 linha, 0,5 px. Os quatro PNGs de cada versão (`.png`, `.claro.png`, `.pagina.png` e `.claro.pagina.png`) dão o mesmo número, então o corte é da peça e não do serializador do preview.

**Por que bloqueia.** A 14.1 lista altura de eixo entre as constantes de acabamento e texto cortado entre as consequências que fazem a constante reprovar. A pergunta 15 pede os dois PNGs sem corte. O defeito é pequeno e é medido, não estimado.

**O que mudar.** Dar ao descendente os 3 px que ele mede. A conta é 6 de `tickSize`, mais 8 de `tickMargin`, mais 7,81 de subida, mais 3 de descendente: 24,81 px, e hoje há 24. Dois caminhos, nenhum testado: `MARGIN.bottom` de 0 para 4, ou `X_AXIS_HEIGHT` de 24 para 28. As duas constantes já entram em `plotHeight`, então o domínio e o passo da célula acompanham sozinhos. Depois do render, repetir a varredura: o "g" precisa de 6 linhas de tinta abaixo da linha de base, nos dois temas.

## `v1_agendas-por-dia-util`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 15, seção 14.1 e EIX-6b (o comum, acima)

`Chart.tsx:40` e `41`. Tiques atingidos: `Segunda` e `Terça`.

Nada mais a levar na rodada. As duas observações da `v1` (vão de 20% e valor do topo sem substantivo) estão no README e não pedem mudança agora.

## `v2_agendas-contra-meta-diaria`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 15, seção 14.1 e EIX-6b (o comum, acima)

`Chart.tsx:43` e `44`. Tiques atingidos: `Segunda` e `Terça`.

### Para levar na mesma rodada (não bloqueiam)

1. **`faltaram N` encostado na linha da meta, em segunda e terça.** No `preview.svg` a linha da meta está em y=61,43 e a linha de base de `faltaram 3` e `faltaram 5` em y=59,21, a 2,21 px do centro do traço. No PNG a tinta do rótulo acaba na linha 346, as linhas 347 e 348 ficam livres, a franja de cima do traço (linha 349) some debaixo do halo e o traço cheio ocupa a 350 e a 351. São 1,5 px entre a letra e o traço cheio: nada é cortado e os dois se leem, mas a linha passa a parecer sublinhado do rótulo, com o `15` do outro lado dela. A causa está em `Chart.tsx:161`: o rótulo sobe 15 px fixos a partir do valor e não olha onde a linha está. Com passo de célula entre 22 e 33 px, a linha atravessa o rótulo, e ali a exceção da marca fina da ROT-7 manda mover o rótulo em vez de confiar no halo. Saída, não testada: calcular a posição do rótulo contra o y da meta e, quando a tinta ficar a menos de 4 px do traço, subir o rótulo até 4 px acima dele.
2. **Meta que não é múltiplo de 3.** A prop `goal` aceita qualquer número. Com 17 ou 20 a linha cai no meio de uma linha de células, some atrás delas e pode atravessar o valor do topo, por baixo do halo dele. O `notes` já diz que 18 é múltiplo de 3; falta dizer na prop, ou tratar o caso.
3. **TIP-1.** `faltaram N` (`Chart.tsx:161`) e `meta 18 por dia` (`Chart.tsx:170`) usam `font-sans` sem `tabular-nums`.
4. **TOK-9.** Registrar no `notes` o par medido do destaque contra o neutro: `--chart-1` contra `--text-muted`, 1,82:1 no escuro e 1,12:1 no claro. O segundo canal existe (a anotação `faltaram N` e a posição sob a linha), então isto é só o registro que a armadilha pede.

## `v3_vitorias-por-mes-e-origem`: reprovada, um bloqueante

Esta versão não tem o corte do eixo: o tique é próprio, em eixo de 44 px, e o "g" sai inteiro.

### Bloqueante 1. Perguntas 11, 12 e 19; papel Ausência da tabela 17.2, ACE-2, ROT-4 e seção 14.1 (papel de cor e identificação das marcas)

**O que se vê.** As três vitórias sem origem declarada (uma em mar/26, uma em mai/26 e uma em jul/26) são células cheias, do mesmo tamanho e do mesmo canto das outras 196, pintadas de cinza. A amostra da legenda também é um quadrado cheio. A ausência lê como uma quinta origem.

**No código.** `NEUTRAL = 'var(--text-muted)'` (`Chart.tsx:49`); `originColor` devolve `NEUTRAL` quando o `slot` é nulo (`Chart.tsx:64` a `66`); a célula recebe `fill={originColor(origin)}` (`Chart.tsx:161`) e a amostra da legenda recebe o mesmo valor em `backgroundColor` (`Chart.tsx:287`).

**No `preview.svg`.** 199 `rect` com `role="button"`: 71, 59, 21, 45 e 3 por cor. Os 3 da ausência têm `fill:rgb(127, 143, 171)` no escuro e `rgb(92, 107, 135)` no claro, e nenhum dos 199 tem contorno.

**Medido, do `tokens.css`.** `--text-muted` contra cada origem:

| Par | Escuro | Claro |
|---|---|---|
| contra `--chart-1`, Indicação | 1,82:1 | 1,12:1 |
| contra `--chart-3`, Site | 1,24:1 | 1,15:1 |
| contra `--chart-6`, Evento | 1,42:1 | 1,00:1 |
| contra `--chart-5`, Prospecção ativa | 1,13:1 | 1,16:1 |

A TOK-9 avisa que razão de luminância entre categóricas não é a régua, e não é por ela que a versão cai. O número serve para mostrar o que a armadilha conclui: sem diferença de luminância, quem separa a ausência das origens é só o matiz, e por isso o segundo canal é obrigatório.

**Por que bloqueia.** A tabela 17.2 dá à ausência um papel próprio, com `Sem origem declarada` como exemplo: contorno `--text-muted` sem preenchimento. A ACE-2 repete: ausência com forma vazada e palavra. A ROT-4 pede a amostra vazada na legenda. O preenchimento cheio em `--text-muted` é outro papel da mesma tabela, o do neutro de dado. A palavra existe (na legenda); a forma não. A 14.1 põe papel de cor e identificação das marcas entre as regras que bloqueiam sempre. As irmãs já fazem assim: `22/01_waffle/v2` hachura a ausência e `07_rosca-e-radial/01` a desenha vazada.

**O que mudar.**

1. Célula de ausência sem preenchimento, com contorno `var(--text-muted)` de 1,5 px desenhado para dentro (recuar x, y, largura e altura em meio traço), para o lado de fora ficar igual ao das células cheias. O contorno mede 5,21:1 e 5,37:1 contra o cartão.
2. A célula continua sendo botão: com `fill="none"` o miolo deixa de receber clique, então manter a área clicável (por exemplo `pointerEvents="all"`).
3. Amostra da legenda vazada, com borda contínua em `--text-muted`. O tracejado fica para `sem coleta`, que é o que ele quer dizer na `v4`.
4. Ajustar o `notes` do `meta.json` ("A ausência de origem fica em --text-muted e por último") e o item 1 da Anatomia do README, que dizem neutro cheio.

Nenhum dos quatro passos foi testado.

### Para levar na mesma rodada (não bloqueiam)

1. **`parcial` sem a data (EIX-10, armadilha DAD-9).** O eixo escreve `out/26` e `parcial` (`Chart.tsx:198` a `200`). Até que dia o mês foi contado, 12/10/2026, só a frase acessível diz. A EIX-10 pede a nota `parcial até` seguida de `formatDate`. Cabe na segunda linha do tique ou na legenda.
2. **Comentário do `data.ts`.** Diz que falta origem em quatro meses; o dado tem três.
3. **Botão sem ação.** Sem `onOpenOpportunity`, as 199 células seguem com `role="button"` e `tabIndex={0}` (`Chart.tsx:165` e `167`). Tirar papel e foco quando a prop não vem.

## `v4_leads-por-mes-em-celulas-de-dez`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 15, seção 14.1 e EIX-6b (o comum, acima)

`Chart.tsx:43` e `44`. Tiques atingidos: `jul/26` e `ago/26`.

### Para levar na mesma rodada (não bloqueia)

1. **Todos os meses sem coleta caem no bloco de vazio.** `totalOf` devolve nulo quando nenhum mês foi medido (`Chart.tsx:68` a `71`), e a raiz troca o gráfico pelo bloco com `Filter` (`Chart.tsx:240` a `247`). Lista vazia e meses sem coleta são coisas diferentes: a primeira pede o bloco de vazio, a segunda pede o desenho tracejado de cada mês com `formatUnavailable()`. O preview não exercita o ramo.

## O que foi conferido e está certo, para não mexer

* **Encoding das quatro.** Coluna nasce na base (`y + height`), domínio do eixo oculto em `[0, linhas x células por linha]`, mesma quantidade de células por linha em todas as colunas, valor do topo lido do dado e não da contagem de células. Contagens batem com o `data.ts` célula a célula.
* **`v2`, a meta.** `ReferenceLine` com `ifOverflow="extendDomain"`, traço em `--text-muted`, rótulo com nome e valor na margem direita reservada (termina 10 px antes da borda). A linha cai no vão entre a sexta e a sétima linha de células e aparece inteira nesse vão; a quinta-feira, com 18 exatos, fica em neutro e a legenda diz `na meta ou acima`. O neutro em `--text-muted` no lugar do `--line-strong` do catálogo está certo e declarado (TOK-5). O destaque tem segundo canal.
* **`v3`, a composição.** Cor por chave, do `slot` do dado (1, 3, 6 e 5, a ordem da COR-8); ausência por último e fora de qualquer agrupamento; legenda com contagem que soma 199, igual à soma dos totais do topo; vão de 2 px entre vizinhas (COR-5); raiz `role="group"` com a frase, células com rótulo que cita a oportunidade, a origem e o mês.
* **`v4`, ausência e zero.** Julho sem coleta é contorno tracejado com `Unplug` e `formatUnavailable()`, sem coluna; agosto com zero medido é a régua da base com o 0 escrito; a célula parcial tem aviso e amostra na legenda; 347 no topo com 34 células cheias e uma de 70%. A unidade sobe para 10 porque junho passa de 300, e a legenda diz.
* **Comum.** Vazio com `role="status"`, `Filter` de 16 px e frase em `--text-muted`; frase acessível de 189 a 206 caracteres começando pelo tipo; dica por `ChartTooltip` sem animação; raiz `h-full w-full min-w-0`; constantes nomeadas no topo; dado fictício e fixo; README com as sete seções e as quatro versões do catálogo em disco, então a seção da VER-1 não se aplica.

## Régua e ferramenta

1. **O piso de 23 px da EIX-6b corta descendente quando `margin.bottom` é 0.** A regra soma `tickMargin` e tinta (8 mais 15) e não conta os 6 px de `tickSize` que o Recharts reserva antes do `tickMargin`, mesmo com `tickLine={false}`. O produtor declarou 24, acima do piso, e o corte veio assim mesmo. A conta medida aqui dá 25 px para uma linha de 11 px.
2. **Nenhuma guarda mede texto cortado pelo próprio `<svg>` do gráfico.** O aviso `Conteudo passa da area do corpo` do render não dispara, porque a tinta não passa: é aparada pelo `overflow:hidden`. O `check` saiu com 0 erros nas três versões cortadas. Uma guarda de preview que compare a linha de base do tique, mais o descendente, com a altura do `<svg>` pegaria isto.
3. **Catálogo desatualizado na `v2`.** O `demonstrates` do catálogo ainda manda os dias na meta em `--line-strong`, que a CONTRASTE-MARCA recusa como marca. O produtor desviou certo; o texto do catálogo é que ficou para trás.
4. **A seção 7 e a tabela 17.2 dizem coisas diferentes sobre a ausência.** A seção 7 diz "tom neutro (`--line-strong` ou `--text-muted`), fica visível e vai por último", sem falar em forma; a 17.2 diz contorno sem preenchimento. A `v3` seguiu a seção 7. Vale alinhar o texto da seção 7.
