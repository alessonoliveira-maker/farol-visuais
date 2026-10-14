# Parlamento (hemiciclo)

## O que é

Assentos em fileiras concêntricas de um semicírculo, um ponto por lugar, coloridos por grupo em ordem angular, da esquerda para a direita. A forma codifica contagem: cada ponto vale uma unidade (ou dez, quando o conjunto é grande, e aí a peça avisa por escrito), e o tamanho de cada cunha é o número de pontos dela. Serve quando o conjunto tem um número fixo de lugares (contas de uma carteira com teto, vagas, vitórias do ano) e a pergunta é quem ocupa quanto, com a linha da metade ou a folga até o teto como referência. Lê-se como uma plateia vista de cima: o total fica no centro da base, a cunha de cada grupo abre a partir da ponta esquerda, e o número de cada grupo vem escrito na legenda ou na ponta da cunha, nunca só no arco.

## Quando usar

- Composição de um conjunto com teto natural de lugares, de 10 a cerca de 400 assentos.
- Pergunta de maioria: quais grupos juntos passam da metade, com a linha do meio desenhada.
- Ocupação de capacidade com os lugares vazios visíveis, como a carteira contra o teto de contas.
- Peça de apresentação para diretoria, com o total no centro da base e até 6 grupos coloridos mais a categoria de ausência.

## Quando evitar

- Contagem sem teto natural: use o waffle em barras (`22/02`).
- Mais de cerca de 400 assentos: os pontos somem; use o waffle (`22/01`) ou suba a unidade do ponto, como na `v4`.
- Menos de 10 lugares: a forma vira uma fileira só e um número com frase resolve melhor (`01_cards-e-kpis`).
- Composição comparada entre vários grupos: waffles comparativos (`22/01`) ou barra 100% (`02_barras-horizontais`).
- Diferenças finas entre grupos: barras horizontais ordenadas (`02/01`), porque a cunha não deixa comparar 17 com 18.
- Dois ou três grupos sem maioria em jogo: a semi rosca (`07/02`) diz o mesmo com menos tinta.

## Anatomia

1. **Faixa de assentos.** Constantes `BAND_INNER` e `BAND_OUTER` dizem onde a tinta dos pontos começa e termina; o miolo aberto pelo raio de dentro guarda o total.
2. **Função `hemicycle`.** Experimenta de 1 a `MAX_ROWS` fileiras e fica com a que dá o maior ponto, então o número de fileiras nasce do total. Em cada tentativa (`fitRows`) as fileiras enchem a faixa, os assentos de cada uma são proporcionais ao raio pelo maior resto (`largestRemainder`) e o raio do ponto é o menor entre o passo radial e a metade do menor espaçamento entre vizinhos (`tightestChord`), menos o vão `SEAT_GAP` de 2 px (COR-5). Abaixo de `SINGLE_ROW_BELOW` lugares a fileira é uma só e encosta na borda de fora.
3. **Ordem angular global.** Todos os assentos são ordenados pelo ângulo, da esquerda para a direita, e só então os grupos são atribuídos em sequência. É isso que faz cada grupo sair em cunha, e não em faixa por fileira.
4. **Ponto por grupo.** Cor por slot fixo da categoria (`CHART_SERIES_COLORS` ou `seriesColor`, na ordem 1, 3, 6, 5, 2, 4 da COR-8). A categoria de ausência e o lugar vazio saem em ponto vazado com contorno de `--text-muted`, sempre por último. O estado de atenção da `v2` é anel de contorno com miolo em `--warning`: a forma diz o papel sem a cor.
5. **Total no centro da base.** Número em `font-display` de 14 px por `formatInt`, com o substantivo em 11 px logo abaixo.
6. **Identificação das partes.** Legenda ao lado com amostra em círculo, nome, contagem por `formatInt` e percentual inteiro por `formatPercent`, somando 100 pelo maior resto (`v1`, `v3`, `v4`); ou rótulo direto na ponta de cada cunha quando são até três grupos (`v2`).
7. **Referência.** Linha da metade tracejada em `--text-muted`, passando por um corredor central aberto entre os assentos, com o rótulo e o valor no topo; colchete por fora do arco abraçando só os assentos somados, ligado por uma chamada à linha de leitura (`v3`).
8. **Linha de leitura.** Frase de 12 px no topo, calculada do dado, com nomes e números em `--text-primary`.
9. **Estados.** Lista vazia troca o gráfico por um bloco com `role="status"` e o ícone `Filter`; total não informado escreve `formatUnavailable()` com o ícone `Unplug` no lugar do arco (`v4`).
10. **Escala.** O `viewBox` de cada versão é o corpo medido do canvas dela, para a escala sair 1 e o texto chegar no tamanho declarado (GEO-18).

## Versões

- `v1_contas-da-carteira-por-segmento`: 120 contas de uma carteira em cinco segmentos, um deles sem cadastro. Demonstra a função `hemicycle` com assentos por fileira proporcionais ao raio, os grupos atribuídos pela ordem angular global, o raio do ponto pelo menor espaçamento entre vizinhos, o total no centro da base e a legenda com contagem e percentual.
- `v2_ocupacao-do-teto-de-contas`: os 120 lugares do teto da carteira, com 91 contas ativas, 13 em risco e 16 lugares livres. Demonstra o lugar vazio desenhado como parte do conjunto, as três formas de ponto (cheio, anel com miolo, vazado), o texto "104 de 120" no centro, a folga escrita ao lado dos lugares livres e a dica por grupo com a taxa sobre o teto por `formatRateWithVolume`.
- `v3_vitorias-do-ano-e-linha-de-maioria`: 74 vitórias do ano por origem. Demonstra a linha da metade atravessando a faixa pelo corredor central, as duas origens somadas entrando primeiro pela esquerda, o colchete que abraça os 41 assentos da soma ligado à anotação, a cor pelo slot fixo da origem e o grupo sem origem por último, em ponto vazado.
- `v4_hemiciclo-com-7-e-com-900-lugares`: três conjuntos lado a lado, com 7 lugares, com 900 e sem total informado. Demonstra a fileira única de pontos grandes, o número de fileiras calculado do total, a troca de unidade para um ponto a cada 10 com o aviso escrito, e `formatUnavailable` no lugar do arco.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para a pasta do visual na página e troque o `import` de `./data` pelo seletor real, mantendo os nomes exportados (`data`, `totalCaption`, `coalitionIds`, `seatNoun`) ou passando as props na chamada.
2. Confira o tamanho do corpo antes de colar. O `viewBox` foi desenhado no corpo do canvas da versão (574 x 241,5 no `card` de uma linha, 574 x 225 no `card` de duas, 894 x 281,5 no `largo`). Num `VisualCard` de outra proporção o desenho escala inteiro e o texto escala junto: ajuste `VIEW_WIDTH`, `VIEW_HEIGHT`, `CENTER_X`, `BASELINE_Y` e a faixa para o corpo real, de modo que a escala continue 1.
3. Mantenha o `slot` de cada categoria igual ao do restante da página: a cor pertence à categoria. Sem `slot`, vale a ordem de entrada do dado, nunca a do ranking.
4. A contagem de cada grupo precisa ser inteira e a soma dos grupos é o total. Acima de 400 lugares use a `v4`, que sobe a unidade do ponto; um grupo menor que meia unidade pode ficar sem ponto e continua escrito na legenda.
5. Na `v2`, a dica usa `useState` e a posição do cursor dentro da caixa do SVG; não depende do tamanho da janela. Na `v3`, a linha da metade pede total par para ficar inteira: com total ímpar o assento do meio da fileira de fora é o da maioria e a linha para logo abaixo dele.
6. Ao colar, troque o bloco de vazio por `EmptyState` e o de ausência por `UnavailableState`, mantendo o sentido do texto (EST-6), e rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Parliament diagram tool (Wikimedia Toolforge)](https://parliamentdiagram.toolforge.org/): as disposições em arco, a opção de fileiras compactas e a saída em SVG.
- [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): a definição de arco como hemiciclo para resultado de parlamento.
- [Highcharts, parliament chart](https://www.highcharts.com/demo/highcharts/parliament-chart): a série de itens em arco como tipo próprio numa biblioteca fora da stack.
- Farol: `_estudo/familias/22_unidades-waffle-e-pictograma.md`, seção do parlamento, e o molde `_render/exemplos/22_unidades-waffle-e-pictograma/01_waffle-10x10/v1_composicao-por-origem`, de onde vêm o maior resto, o slot fixo de cor e o ponto vazado da ausência.
- Guia de produção: `07_rosca-e-radial/02_semi-rosca/v1_agendas-do-mes-por-resultado`, pelo total sobre a base e pelo rótulo na ponta do arco.

## Observações da revisão (não bloqueantes)

**2026-10-13, revisão independente das quatro versões.** `v1`, `v2`, `v3` e `v4` aprovadas, com `npm run check` em 0 erros e 0 avisos e a fidelidade do render em no máximo 0,13%. O `Chart.tsx` da `v4` era das 06:40 e o preview das 06:38, então o render foi refeito antes do julgamento. Pontos contados nos dois previews de cada versão, e o vão entre bordas de pontos vizinhos mede 2,00 px nas quatro. Nenhum item abaixo reprova.

- `v1`, `v3` e `v4`: a contagem da legenda sai sem substantivo na linha (NUM-6). A unidade vem da nota acima da coluna ("cada ponto é uma conta", "cada ponto é uma vitória", "cada ponto vale 10 contas") e do total no centro da base, e por isso a leitura fecha.
- `v1` e `v3`: a legenda lateral com valor ocupa 120 px dos 241,5 px do corpo (50%) na `v1` e 144 px (60%) na `v3`. O teto de 30% da ROT-4 foi lido como regra da legenda que tira altura do gráfico; a lateral da ROT-5 não tira, e é a identificação que a ROT-10 pede.
- `v1`, `v2` e `v3`: o `demonstrates` do `meta.json` não repete o texto do catálogo. Na `v1` o raio do ponto sai de toda fileira e não só da interna; na `v2` o lugar vazio é ponto vazado em `--text-muted` e não `--surface-overlay`; na `v3` a cor sai do slot da origem e não de `seriesColor(i)`, e o grupo sem origem é vazado em `--text-muted` e não `--line-strong` (1,79:1 e 1,83:1, TOK-5). Os três desvios estão certos pelo contrato e declarados no `notes`; quem precisa de emenda é o catálogo.
- `v2`: a dica é feita à mão, porque em `svg-puro` não há `<Tooltip>` do Recharts onde montar o `ChartTooltip` da DIC-2 (pergunta 18 com ressalva). Segue a saída da REC-6, mas com `border-line-subtle`, sem sombra e com `px-2.5 py-1.5`, enquanto o `ChartTooltip` usa `border-line-strong`, `shadow-lg` e `px-3 py-2`. No tema claro `--surface-overlay` é o mesmo branco do cartão, e fora dos pontos a caixa fica delimitada só pela borda fraca. Não aparece no preview, e nada essencial vive nela.
- `v2`: o dado padrão não exercita dois ramos de `callouts`, o grupo com zero lugares (rótulo na ponta direita da base) e dois rótulos do mesmo lado a menos de 18 px (empilhamento por `LABEL_STEP`). Lidos no código sem defeito achado; pergunta 23 com ressalva, porque o caso difícil da versão é a folga desenhada como parte do teto.
- `v3`: o colchete nasce em x = 0 do corpo, porque o raio dele (168) é igual a `CENTER_X`. A metade de fora do traço de 1,5 px é cortada pela borda do SVG nos primeiros 16 px a partir da base: medido no PNG, 49% da tinta na base e traço inteiro a 16 px dela, nos dois temas. A marca não parte e a leitura não muda; recuar 1 px o raio do colchete ou avançar `CENTER_X` resolve.
- `v3`: a linha da metade usa traço de 1,5 px tracejado `4 3`, e a tabela 17.2 dá 1 px `3 3` à referência. Sem consequência no preview: o traço passa a 2,69 px do assento mais próximo de cada lado do corredor.
- `v3`: no tema claro, `--chart-6` (Prospecção ativa) contra `--chart-2` (Formulário do site) mede delta E76 de 22,8, e de 4,1 em deuteranopia e 5,1 em protanopia pela simulação de Machado (no escuro, 27,2, 16,8 e 12,8). A ordem dos slots é a da COR-8, os dois grupos não são vizinhos no arco e a legenda segue a ordem angular com a contagem, então o segundo canal existe. Falta o par medido no `notes` (TOK-9).
- `v3`: o dado é o ano em curso até 2026-09-30 e a tela diz só "vitórias no ano". Ao colar, o corte vai no subtítulo do `VisualCard` (EIX-10, DAD-9), porque a maioria de hoje pode não ser a do fim do ano.
- `v3`: a frase acessível tem 229 caracteres no dado padrão. Uma origem de nome mais longo passa do aviso de 235 e encosta no teto de 250 (ACE-1).
- `v3`: com total ímpar a linha para sob o assento do meio e o rótulo "metade das vitórias" continua acima dele, separado da linha pelo ponto. Fora do dado padrão e descrito no passo 5 de "Como colar no Farol".
- `v4`: com 900 lugares, os 90 pontos saem 52, 27 e 11, isto é, 57,8%, 30,0% e 12,2% do arco, e a legenda escreve 57%, 30% e 13% das contagens reais. A diferença de até 0,8 ponto percentual é o arredondamento da unidade, avisado por escrito em "cada ponto vale 10 contas".
- `v4`: a frase acessível diz total, fileiras e unidade de cada conjunto, que é a conclusão do caso de uso, e não cita os grupos (Varejo, Indústria, Serviços), que ficam só na legenda.
