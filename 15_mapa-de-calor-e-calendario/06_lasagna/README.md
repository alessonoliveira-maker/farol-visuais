# Lasagna (entidades por tempo)

## O que é

Uma linha por entidade, uma coluna por período, cor pelo valor. É o que resolve o caso em que linhas
sobrepostas viram emaranhado, porque há entidades demais, e barras viram parede, porque há períodos
demais. O nome vem das camadas: a leitura horizontal conta a história de uma entidade no tempo, e a
vertical mostra o dia em que todas sofreram junto, que é o sinal de causa comum.

## Quando usar

- Acompanhar de 8 a algumas centenas de entidades ao longo de dias ou semanas: filas, SDRs,
  oportunidades abertas, campanhas.
- Achar evento sistêmico: a coluna inteira que muda de cor é queda de ferramenta, feriado ou campanha,
  não mérito individual.
- Medir cumprimento de régua, quando a cor é categoria de serviço e não magnitude.
- Mostrar quem entrou depois, porque a linha começa onde a entidade começou.

## Quando evitar

- Menos de umas cinco entidades com valor contínuo: linhas sobrepostas leem melhor e dão o valor exato.
- Necessidade de valor exato por período: a coluna tem poucos pixels e não cabe número.
- Entidade com histórico muito desigual, em que quase toda a grade é ausência.
- Comparação fina entre duas entidades: aí é slope, dumbbell ou par de linhas.

## Anatomia

1. **Rótulo da entidade** à esquerda, sem reticência, ordenado por uma estatística da própria linha.
2. **Faixa de células**, uma por período, sem vão horizontal quando o período é curto, para a linha
   ler como uma faixa contínua.
3. **Cor por faixa nomeada**, quando existe régua de serviço, ou rampa sequencial, quando a pergunta
   é de magnitude. A legenda diz qual das duas.
4. **Célula ausente hachurada**, para o período em que não havia o que medir. Nunca pintada com a
   faixa mais favorável.
5. **Eixo de tempo esparso**, com rótulo e linha de grade só na virada de mês.
6. **Coluna de resumo à direita**, com a estatística que ordena as linhas escrita por extenso.
7. **Legenda**, com as faixas, a hachura e o que a coluna da direita mede.

## Versões

- `v1_sla-diario-por-fila`: 12 filas por 90 dias, cor pela faixa de SLA de primeiro contato, dia sem
  entrada hachurado, filas ordenadas pela mediana e a mediana escrita à direita.
- `v2_ocupacao-semanal-por-sdr`: 9 SDRs por 26 semanas, escala divergente centrada em 100% da
  capacidade, contorno em `--warning` acima do teto, semana em curso tracejada e fora da média, e a
  ocupação média escrita à direita de cada linha.
- `v3_dias-parados-das-oportunidades-abertas`: 200 oportunidades por 120 dias, dias seguidos na mesma
  faixa fundidos num `rect` só, cinco faixas sequenciais contadas a partir do último movimento anterior à janela (ou da criação, se não houver) e reiniciando a cada movimento, nenhuma célula
  antes da criação e a fronteira do vazio desenhada em escada.
- `v4_inicio-tardio-e-agregacao-semanal`: 7 SDRs por 182 dias num cartão, com prop de granularidade
  que agrega em 26 semanas, e os três estados separados no desenho: vazio antes da admissão, hachura
  sem registro, zero medido com marca e número.

### O que as quatro combinadas ensinam

1. **A cor da grade tem três regimes, e a versão escolhe um.** Régua de serviço em faixas nomeadas
   (v1), escala divergente com centro declarado (v2) e rampa sequencial de magnitude (v3 e v4). O que
   nunca muda é a legenda dizer qual dos três está no desenho.
2. **A rampa sequencial não carrega ordem sozinha.** Medidos contra `--surface-raised`, os degraus
   `--seq-1` a `--seq-7` dão 1,14 / 1,58 / 2,29 / 3,38 / 4,89 / 6,96 / 10,12 no tema escuro e 1,21 /
   1,49 / 1,92 / 2,60 / 3,72 / 5,45 / 8,29 no claro: só três passam de 3:1 nos dois temas. Onde cabe
   número na célula a peça pode usar mais degraus (não é o caso de nenhuma versão daqui); onde não
   cabe, ou se fica em três (v4), ou se usa mais e se declara que quem ordena é o texto e a posição,
   com um segundo canal para o degrau mais baixo (v3, que o desenha mais fino e desenha a fronteira).
3. **Vazio, hachura e zero são três coisas, e o desenho precisa separar as três.** A v4 é a versão
   que existe só para isso; a v1 e a v2 separam duas delas.
4. **Desenhe no `viewBox` do tamanho do corpo medido.** `viewBox` maior que a caixa encolhe todo o
   texto, e o piso de 11 px passa a valer só no papel.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/QueueSlaLasagna/`.
2. Cada `hours` tem uma posição por dia da janela, na ordem, sem buraco. Dia sem medição é `null`,
   nunca zero: zero é resposta instantânea e pinta de verde.
3. As faixas de `SLA_BANDS` são o contrato de serviço da operação, não decisão de design. Mudou o
   SLA, muda a constante, e a legenda acompanha sozinha.
4. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
5. Acima de uns 120 dias ou 20 filas, agregue por semana antes de desenhar. O SVG aguenta milhares de
   `rect`, mas a coluna de 4 px deixa de ser clicável muito antes disso.
6. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.
7. Nas versões v2, v3 e v4 o `viewBox` do `<svg>` é o corpo medido do canvas, escrito em constante no
   topo do arquivo (`VIEW_W` e `VIEW_H`). Ao colar num cartão de outro tamanho, recalcule os dois pela
   conta da moldura (`canvas − 2 × recuo` na largura, `canvas − 2 × recuo − cabeçalho − 12` na altura)
   em vez de deixar o SVG esticar: esticado, o texto declarado em 11 px chega menor à tela.
8. Na v2 a capacidade da semana sai de `CAPACITY_HOURS_PER_DAY`, `WORKDAYS_PER_WEEK` e
   `CURRENT_WEEK_ELAPSED_DAYS` do `data.ts`. Mudou a jornada, mudam as constantes, e a legenda e a
   semana parcial acompanham sozinhas.
9. Na v3 o `data.ts` guarda datas, não dias parados: a contagem é derivada no componente, parte do último movimento anterior à janela, ou da criação quando o dado não tem nenhum, e reinicia a
   cada movimento. Guardar o derivado esconderia a régua que produz a cor.
10. Na v4 o discriminador do vazio é a data de `admission`, nunca o valor guardado. Ao trocar a fonte,
    garanta que a admissão venha junto, senão os três estados voltam a virar um só.

## Referências

- Catálogo: [Vega-Lite, lasagna plot](https://vega.github.io/vega-lite/examples/rect_lasagna.html): observar o eixo de tempo com rótulos esparsos e a célula sem vão horizontal.
- Praticante: [Stephen Few, Heatmaps: to bin or not to bin?](https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf): observar o limite de faixas que o olho separa, que é o que fixa as cinco daqui.
- Catálogo: [From Data to Viz, heatmap](https://www.data-to-viz.com/graph/heatmap.html): observar os erros de normalização e de ordenação de linhas.

## Correção de 2026-09-28

**v1, a faixa mais frequente quase sumia contra o cartão (TOK-7).** As cinco faixas de SLA são
categorias de serviço, e duas delas pegavam cor emprestada da rampa sequencial: `--seq-6` em "até
4 h" e `--seq-3` em "até 24 h". Os degraus `--seq-*` são feitos para receber texto por cima dentro de
uma célula, não para contrastar com a superfície do cartão. Medido contra `--surface-raised`,
`--seq-3` dá 2,29:1 no escuro e 1,92:1 no claro, contra 5,3:1 a 8,4:1 das outras faixas: como "até
24 h" é a faixa mais frequente do desenho, cinco das doze filas quase desapareciam no tema claro e a
peça sugeria falta de dado onde havia desempenho pior. A rampa ainda inverte de um tema para o outro,
então o miolo da escala virava o ponto mais claro dela e a escala deixava de ordenar.

O que mudou: as cinco faixas passaram a sair das cores de papel, `--positive`, `--chart-1`,
`--chart-3`, `--warning` e `--negative`. Medidas contra o cartão, ficam entre 5,3:1 e 9,5:1 nos dois
temas. A distância entre cores vizinhas, em ΔE76, vai de 34 a 121 na visão comum; em deuteranopia o
par mais fraco é `--positive` contra `--negative`, com 9,0 no escuro e 10,9 no claro, e ele é
justamente o par das duas pontas da escala, que nunca aparece lado a lado: quem não separa verde de
vermelho continua lendo a peça pela ordem das filas e pela mediana escrita à direita de cada uma.
`--chart-2` e `--chart-4` ficaram de fora porque repetem o hex de `--warning` e `--positive` (COR-8).

**v1, a fila sem nenhum dia medido nascia como a mais rápida (EST-1b).** `medianOf` devolvia `0` para
lista vazia, e zero hora de espera é um valor plausível: a fila sem entrada nenhuma no recorte subia
ao topo da ordenação com "0,0 h" escrito ao lado. Agora a função devolve `number | null`, a fila sem
medição sai da ordenação por valor e vai para o fim, a coluna da direita escreve `formatUnavailable()`
e o percentual de dias acima de 24 h também vira ausência quando não há base. A coluna da direita
passou de 46 px para 64 px porque `indisponível` mede cerca de 59 px em 11 px de texto e, no espaço
antigo, o texto entraria por cima da grade.

## Observação de 2026-09-29

**A v1 está na fila de dívida da `TAMANHO-TEXTO`, e as três irmãs novas não entraram.** A v1 desenha
num `viewBox` de 908 x 254 (`v1_sla-diario-por-fila/Chart.tsx`, linhas 137 e 138, aplicado na linha
154) dentro de uma caixa de 894 x 257,5 px, medida no próprio `preview.svg`. A escala é a menor das
duas razões, 894 / 908 = 0,9846, então os 27 trechos declarados em 11 px chegam à tela em
**10,83 px**, abaixo do piso da TIP-2. É a armadilha `GEO-18`, e o efeito colateral é o que custa
caro: a `COLISAO-TEXTO`, a `CONTRASTE-TEXTO` e a `TEXTO-NA-MARCA` desistem da peça com o motivo
`preview_com_escala`, de modo que a v1 perde três guardas de uma vez. O `check` hoje **avisa** ali,
porque a versão já estava na fila de dívida antes desta leva; não é erro e não se conserta agora.

O conserto, quando alguém for quitar a dívida, é o que as três irmãs fazem: `VIEW_W` e `VIEW_H`
iguais ao corpo medido do canvas, com o SVG ocupando o corpo inteiro e a legenda desenhada dentro
dele em vez de num bloco HTML irmão. Medido nesta leva: com a escala em 1, as quatro guardas de
preview passaram a medir a v2, a v3 e a v4, e nenhuma delas acusou.

## Observações da revisão (não bloqueantes)

**2026-10-15, revisor independente, primeira passada da v2, da v3 e da v4.** A v2 foi aprovada; a v3
e a v4 foram reprovadas, e os bloqueantes estão em
`validation/revisao_15_mapa-de-calor-e-calendario__06_lasagna_2026-10-15.md`. O que segue não reprova.

- v2: a escala divergente não tem ordem de luminância a partir do centro. No claro, "até 70%", "90% a 100%" e "mais de 115%" medem 6,00, 5,37 e 6,36:1 contra o cartão (de 1,06 a 1,18:1 entre si); no escuro, "70% a 90%", "90% a 100%" e "mais de 115%" medem 5,30, 5,21 e 5,50:1. Quem separa é só o matiz.
- v2: em simulação de daltonismo, "até 70%" contra "90% a 100%" no claro dá ΔE 4,2 (deuteranopia e protanopia), e "70% a 90%" contra "90% a 100%" no escuro dá 5,3 e 2,7: para esse leitor o centro some no braço frio. A pergunta do cartão segue legível, porque acima de 100% há contorno e matiz quente (ΔE de 20 ou mais) e a média está escrita à direita.
- v2: o degrau "até 70%" usa `--chart-1` pleno e é a marca mais saliente da peça no escuro (9,50:1); o olho vai primeiro para quem está folgado, não para quem passou do teto.
- v2: o contorno em `--warning` mede 1,11:1 contra "mais de 115%" no claro e 1,52:1 no escuro. Aparece pelo matiz (ΔE 47 e 69) e pela borda contra o vão, não por luminância (TOK-10).
- v2: a legenda diz "semana em curso, parcial" sem o "parcial até" com data da EIX-10, e não diz que a semana fica fora da média escrita à direita, embora o `notes` afirme que diz.
- v2: a borda esquerda da moldura tracejada cai de 1,5 a 2,5 px dentro da coluna anterior, por cima das células, e não no vão; onde a célula tem luminância próxima de `--text-muted` o traço some (linha de Ivan P. no claro).
- v2: a legenda fica abaixo do gráfico, e a ROT-4 diz acima ou ao lado. É a mesma escolha da v1, já aprovada.
- v3: a amostra de "até 2 dias" na legenda é um bloco cheio de 14 x 10 px, e a marca é uma faixa com 46% da altura da linha (1,16 px). O segundo canal que a versão declara, o degrau mais fino, não é ensinado na legenda (ROT-4, amostra na forma da marca).
- v3: "até 2 dias" é o degrau mais frequente (37% dos dias pintados) e chega à tela com 1,16 px a 1,92:1 no claro, então a textura se lê como vão. Está declarado no `notes` e neste README (TOK-8).
- v3: "47 paradas há 30 dias ou mais" sai sem o substantivo (NUM-6): "47 oportunidades paradas há 30 dias ou mais".
- v3: posições da legenda escritas como número solto no JSX (168, 180, 320, 250 e o 9 de `LEGEND_TWO - 9`), fora das constantes do topo.
- v3: a linha de hoje coincide com a borda direita da grade e mede 1,79 e 1,83:1; quem carrega o sentido é a palavra "hoje".
- v4: na granularidade semanal a marca "primeiro dia" fica na borda da semana da admissão e não no dia: Otávio S., admitido em 01/07/2026, tem a marca em 29/06/2026, sob "jun/26". Ou a legenda diz "semana da admissão", ou a marca anda dentro da coluna na proporção do dia.
- v4: a frase acessível diz "agregado em 26 colunas de 182 dias", que se lê como colunas de 182 dias cada.
- v4: `SLOT_TWO_B + 20` com número solto no JSX.

**2026-10-15, revisor independente, segunda passada da v3 e da v4, depois da rodada de correção.** A v4
foi aprovada; a v3 foi reprovada, e o bloqueante está na seção "Segunda passada" do mesmo parecer em
`validation/`. O que segue não reprova.

- v3: "vazio: ainda não existia" não tem amostra, e a fronteira em escada em `--text-muted`, que é a marca que desenha o vazio, não aparece na legenda (ROT-4, amostra na forma da marca).
- v3: o `useCase` do `meta.json` pergunta "quantas seguem há 30 dias ou mais", e o catálogo ainda pergunta "quais nunca voltaram a andar". A tela responde a primeira; alinhar o catálogo ou o `meta.json`.
- v4: a data da nota de escala é montada à mão com `slice` (`Chart.tsx`, linha 179) em vez de `formatDate` (NUM-7). A saída na tela é a mesma, 30/03/2026.
- v3 e v4: a legenda fica abaixo do gráfico, e a ROT-4 diz acima ou ao lado. É a mesma escolha da v1 e da v2.
- v3 e v4: as observações da primeira passada continuam valendo no arquivo de hoje ("47 paradas" sem substantivo, números soltos no JSX, amostra cheia para a faixa fina, linha de hoje a 1,79 e 1,83:1; marca do primeiro dia na borda da semana, "26 colunas de 182 dias" na frase).

**2026-10-15, revisor independente, terceira passada da v3, depois da segunda rodada de correção.** A v3
foi aprovada: a contagem parte do último movimento anterior à janela, ou da criação na falta dele, e a
cor bate com o `data.ts` em todo dia. O que segue não reprova.

- v3: o movimento anterior à janela entrou em 55 das 81 oportunidades antigas, mas o vão até 01/06 vai de 2 a 48 dias sem relação com o ritmo de cada uma: em 45 das 53 que andam mais de uma vez na janela, o vão que cruza 01/06 é maior que qualquer intervalo delas dentro dela (opp-019 anda a cada 2 dias e chega com 36; opp-062 anda a cada 3 e chega com 47). Por isso 37 das 81 abrem em "mais de 29 dias" em 01/06 (46%), contra 21% em 08/06, 10% em 01/07 e 24% hoje, e a borda esquerda ainda escurece no claro (clareia no escuro). O desenho é fiel ao dado; é o dado fictício que fabrica uma retomada geral na primeira semana de junho. Tirar o vão anterior do próprio ritmo de cada oportunidade.
- v3: o `meta.json` não acompanhou a correção. O `notes` dá 36%, 24%, 12%, 10% e 18% pelos cinco degraus, e o dado de hoje dá 36%, 25%, 12%, 10% e 17%; e nem o `notes` nem o item "contados desde a criação" do `demonstrates` dizem que a contagem parte do último movimento anterior à janela quando ele existe.
- v3: as observações das passadas anteriores seguem valendo (vazio e faixa fina sem amostra própria na legenda, "47 paradas" sem substantivo, números soltos no JSX, legenda abaixo do gráfico, linha de hoje a 1,79 e 1,83:1, `useCase` do `meta.json` diferente do catálogo).
