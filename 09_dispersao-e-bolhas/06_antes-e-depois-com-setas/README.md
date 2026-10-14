# Dispersão de antes e depois com setas

## O que é

Cada entidade aparece em dois momentos, um ponto de origem e um de destino, e uma seta liga a posição antiga à nova nas duas medidas ao mesmo tempo. A forma responde quem se moveu, para onde e quanto, e quem cruzou uma divisória entre os dois períodos. As setas são SVG puro sobre um plano cartesiano: a conversão de dado para pixel usa os mesmos domínios lineares dos dois eixos, a cor viria da direção do movimento quando o modelo compara melhora e piora, e a ponta da seta recua um pouco antes do ponto de destino para não sumir sob a marca cheia.

## Quando usar

- Mudança de posição de várias entidades entre dois momentos, como canais de aquisição de um trimestre para o outro.
- Mostrar quem saiu ou entrou numa região de meta entre dois períodos.
- Até cerca de 15 setas legíveis; acima disso, filtrar para quem mudou de região ou rotular só as maiores.
- Medidas em escala linear com domínio explícito e idêntico nos dois períodos.

## Quando evitar

- Muitos momentos por entidade: use dispersão conectada (modelo 05).
- Uma medida só entre dois momentos: use dumbbell ou slope (família 17).
- Escala logarítmica ou domínio automático: a conversão para pixel deixa de bater com os eixos.
- Seta sem indicação de qual ponta é o início: a leitura inverte; a legenda tem que dizer.

## Anatomia

1. Eixo X (CPL) e eixo Y (taxa de qualificação) numéricos, com domínio explícito e idêntico nos dois trimestres e unidade em cada tique (`formatCurrencyAxis`, `formatPercent`), pela EIX-4 e EIX-6.
2. Grade nos dois sentidos, desenhada como `line` em `var(--line-subtle)`, pela exceção da EIX-3 para a família: a leitura é a posição conjunta nos dois eixos.
3. Geometria de seta calculada em TypeScript (`scaleX`, `scaleY`): domínio linear explícito, o mesmo dos eixos, nunca escala logarítmica.
4. Marcador de ponta (`<marker>` em `<defs>`) referenciado por `useId()`, para duas instâncias do componente na mesma página não colidirem no id.
5. Recuo de 5 px do fim da linha antes do ponto de destino, para a ponta do marcador não sumir sob o círculo cheio (ponto delicado do modelo).
6. Origem em anel vazado (`fill` da superfície do cartão, `stroke` na cor da série) e destino em ponto cheio, a mesma linguagem da dispersão conectada (modelo 05).
7. Rótulo do nome do canal posicionado por anticolisão calculada em TypeScript (`placeLabels`): oito direções em raios crescentes ao redor do próprio ponto, a primeira caixa livre de outro rótulo, de qualquer ponto e de qualquer traço de seta. Sem halo, porque o halo de `strokeWidth: 4` apaga por inteiro um traço fino como o da seta (exceção da marca fina na ROT-7, 2026-09-19); quem sai do lugar é o rótulo, nunca a marca. O raro nome sem posição livre em 32 tentativas vira placa numa fileira reservada acima do plano, com linha de chamada até o ponto.
8. Legenda com os dois símbolos (anel e ponto cheio) dizendo qual ponta é o antes e qual é o depois, porque a forma sozinha não é óbvia sem explicação (ROT-4).
9. Linha de leitura (ANO-5) calculada do dado: nomeia o canal com a maior melhora conjunta de CPL e qualificação.
10. Cor da seta por token de dado, nunca por token de linha: a seta liga o antes ao depois e some com a relação se for apagada, então ela é dado e a `ACE-6` cobra 3:1 dela. O neutro de contexto é `--text-muted` (5,21:1 no escuro, 5,37:1 no claro), a piora é `--negative` (5,50:1 e 6,36:1), a melhora é `--positive` (7,36:1 e 5,34:1) e a série única é `--chart-1` (9,50:1 e 6,00:1). `--line-strong` está fora: mede 1,79:1 e 1,83:1.
11. Polaridade declarada no `data.ts`, não escrita no componente (`v2`): `cplGoodDirection` é `down` e `qualGoodDirection` é `up`, e o que conta como piorar sai daí, pela COR-6.
12. Divisória fixa em `--text-muted` tracejado (papel Referência da 17.2; `--line-strong` mede 1,79:1 e 1,83:1) com o número escrito ao lado (`v3`): ela é referência e não dado, pelo teste da ACE-6, porque tapada a posição das setas continua dizendo quem está abaixo. A TOK-5 só a libera com o valor escrito, e é o que o rótulo `meta 25%` faz.
13. Rótulo racionado (`v3`): a pergunta é quem cruzou, então todas as setas que cruzaram a divisória têm nome, mais as acima do percentil 75 de deslocamento; sem posição livre junto do ponto, o nome vai para a caixa livre mais próxima com linha de chamada em `--text-muted`. O percentil devolve `null` para lista vazia, nunca zero (EST-1b).
14. As três formas sem seta inteira (`v4`): anel tracejado para quem não tem período anterior, x no lugar do ponto de destino para quem foi encerrado, e anel duplo no ponto médio para deslocamento abaixo de 12 px. As três vão para a legenda, porque seta ausente lida sem explicação vira não mudou.
15. Taxa derivada de contagens declaradas no `data.ts` (`v1`, `v2`, `v3`, `v4`): o `data.ts` traz leads e leads qualificados, e o componente calcula a taxa, o que torna impossível o percentual escrito divergir do volume escrito (DAD-1).
16. Marcador de ponta em `markerUnits="userSpaceOnUse"` com 9 px: sem isso o SVG escala a ponta pela espessura do traço, e a seta de destaque de 2 px ganha uma ponta de 14 px que engole o ponto de destino.

## Versões

- `v1_canais-entre-trimestres`: CPL e taxa de qualificação de 8 canais fictícios entre T2/2026 e T3/2026, em canvas largo. Demonstra a geometria de seta em TypeScript com escalas lineares e domínio explícito, a origem em anel vazado com marcador de ponta referenciado por `useId`, o recuo de 5 px antes do destino para a ponta não sumir sob o ponto, a anticolisão de rótulo calculada em TypeScript longe de setas e pontos (nomes mais longos escolhem primeiro, para o nome ficar junto do próprio ponto), a taxa com volume derivada de contagens, e a legenda que diz qual ponta é o antes e qual é o depois.
- `v2_piorou-nas-duas-medidas`: os mesmos 8 canais, agora com a pergunta invertida. Demonstra a direção boa ou ruim calculada pela polaridade que cada métrica declara no `data.ts`, as setas que pioraram nas duas medidas em cor semântica com a palavra piorou escrita no rótulo, as demais em neutro de contexto que mede 3:1, e a taxa derivada de contagens para o percentual sair com o par de volume.
- `v3_origens-cruzando-a-meta`: 12 origens de lead entre ago/26 e set/26, por volume e qualificação. Demonstra a divisória fixa na meta idêntica nos dois períodos, a cor só nas setas que cruzaram a divisória, a anotação com a contagem de quem entrou e de quem saiu da faixa crítica, o nome em todas as setas que cruzaram e nas de maior deslocamento e o percentil que devolve nulo para lista vazia.
- `v4_entidade-nova-ou-encerrada`: 8 campanhas em que a seta nem sempre existe. Demonstra a campanha nova como ponto com anel tracejado e a palavra nova no rótulo, a encerrada (legenda: encerrada no fim do T3/2026) como seta que termina num x, a mudança abaixo de 12 px trocada por anel, e os três casos explicados na legenda para seta ausente não ser lida como não mudou.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/ChannelArrows/`.
2. Troque o `import` do `./data` pelos canais reais e os dois períodos comparados; `periodBeforeLabel` e `periodAfterLabel` viram texto vindo da página, não do `data.ts`.
3. Ajuste `DOMAIN_X`, `TICKS_X`, `DOMAIN_Y` e `TICKS_Y` para a faixa real das duas métricas nos dois períodos; um domínio fixo evita que a mesma posição signifique valores diferentes de um filtro para outro.
4. Não é preciso reconferir rótulo a rótulo a cada troca de dado: `placeLabels` recalcula a posição de cada nome em tempo de render a partir dos pontos e das setas reais. Vale reconferir apenas `LABEL_RADII` e `CHAR_WIDTH_FACTOR` se o novo dado tiver muito mais canais ou nomes muito mais longos que os oito deste catálogo.
5. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-64">`) ou passe `height`.
6. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Observable Plot, arrow (documentação fonte)](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/arrow.md): duas observações por cidade ligadas por seta, cor por direção e as opções `bend`, `headLength` e `inset`.
- [Observable Plot, arrow mark](https://observablehq.github.io/plot/marks/arrow): `insetEnd`, que aqui vira o recuo calculado à mão para a ponta não sumir sob o destino.
- [Observable Plot, link](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/link.md): o mesmo dado com linha simples e cor pela direção.
- [Recharts, guia de customização](https://recharts.github.io/en-US/guide/customize/): componentes próprios como filhos do gráfico, referência de método mesmo não usando `ScatterChart` nesta versão.


## Observações da revisão (não bloqueantes)

- `v1_canais-entre-trimestres`: nenhum dos dois eixos se nomeia no desenho. Que X é CPL e Y é taxa de qualificação vem do subtítulo do cartão e da linha de leitura, não do próprio plano.
- `v1_canais-entre-trimestres`: a legenda é desenhada abaixo do plano, e a ROT-4 escreve que a legenda fica acima ou ao lado do gráfico. Não engana a leitura, mas é a letra da regra; se for para ficar embaixo, vale registrar a escolha.
- `v1_canais-entre-trimestres`: a taxa de qualificação aparece sem volume em nenhum canto do desenho, e o "volume junto da taxa" é item do que não se muda. A base não existe no dado do catálogo; quem colar no Farol precisa trazer o denominador por canal.
- `v1_canais-entre-trimestres`: revisão de 2026-09-19 trocou o halo por anticolisão de rótulo (`placeLabels`) e o canvas de card para largo; ver a nota do `meta.json` e o histórico em `_render/.qa/revisao/09_dispersao-e-bolhas__06_antes-e-depois-com-setas.json`.
- `v1_canais-entre-trimestres`: o par Eventos corporativos e Mídia programática institucional é o mais apertado do desenho. O nome de Mídia sai no raio de 44 px, enquanto a tinta do nome de Eventos passa a cerca de 14 px do ponto de Mídia; a leitura se resolve pela centralização exata do nome sobre o próprio ponto e pela adjacência lateral de Eventos, mas é o único lugar em que o rótulo mais próximo de um ponto não é o dele. Penalizar o raio grande, ou aumentar o `POINT_BUFFER`, deixaria o par sem dúvida.
- `v1_canais-entre-trimestres`: a linha de leitura sai inteira em 400 e `--text-secondary`, e a 17.1 com a TIP-3 pedem nome e número em 500 ou 600 e `--text-primary`. Não muda a leitura, e o acervo tem precedente na `05/10`, mas é a letra da régua tipográfica.
- `v1_canais-entre-trimestres`: a linha de chamada da fileira de reserva usa `--line-strong` tracejado, e nenhum papel da 17.2 nomeia a linha de chamada (a de referência é `--text-muted`). É caminho não exercido pelo dado fixo, ou seja, decisão latente que o preview não prova; vale escolher o token junto com a ROT-11 quando a fileira aparecer em algum recorte.
- `v1_canais-entre-trimestres`: a guarda `ESPESSURA-MARCA` (ESP-2) não mede esta versão por causa do `transform` da legenda. A régua é de barra e não se aplica a seta e ponto, mas quem ler o resumo do check vai ver "não medida" sem saber que é por não aplicar.
- `v1_canais-entre-trimestres`: `READING_LINE_Y = 13` e `FALLBACK_ROW_Y = 27` são ímpares, e a ESP-1 pede distância em múltiplo de 2 px. São posições de linha de base, não vãos entre peças, e nada no desenho encosta por causa disso.

- `v2`, `v3` e `v4`: a legenda fica **acima** do plano, e não abaixo como na `v1`. Onde o vizinho e a regra divergem, vence a regra: a ROT-4 escreve que a legenda fica acima ou ao lado do gráfico.
- `v2` e `v4`: o texto de tela escreve **custo por lead** por extenso, e não a sigla CPL, por medição feita em 2026-09-28. Com a sigla, o SVG aberto sozinho divergia do desenho da página em 0,97% dos pixels na `v2` e 0,24% na `v4`, e em todas as linhas a divergência começava exatamente no caractere seguinte à sigla, inclusive no subtítulo que a própria moldura escreve. Trocada a sigla pela forma por extenso nas três linhas longas, as duas versões foram a 0,00%. A `v1` ainda usa a sigla e não foi tocada.
- `v2`, `v3` e `v4`: nenhuma delas usa `transform`, ao contrário da `v1`, cuja legenda transladada cega a leitura de marca do `check`. Sem `transform`, a `CONTRASTE-MARCA` mede as três e aprova.
- `v2`, `v3` e `v4`: a guarda `ESPESSURA-MARCA` sai `sem_marca_de_barra`, e isso é correto, não omissão: o piso geral da ESP-2 é o outro lado do `maxBarSize` do `<Bar>` do Recharts e não governa seta nem ponto. Medido à mão: a marca mais fina é o traço de 1,5 px das setas de contexto, o ponto tem 8 px de diâmetro, e nenhum rótulo é escrito dentro de marca, que é o piso que de fato reprova.
- `v2`, `v3` e `v4`: a guarda `EIXO-CALMO` sai `sem_grade`, porque ela procura `CartesianGrid` do Recharts e aqui a grade é desenhada à mão. Medido à mão: a grade sai nos dois sentidos em `--line-subtle`, sem tique e sem linha de eixo, que é o que a EIX-5 com a EIX-3b pedem.
- `v2`: cinco dos oito canais ficam sem nome, por desenho da própria especificação, e a legenda declara isso na entrada "demais canais, contexto". Quem colar no Farol e precisar identificar todos troca o critério de rótulo pelo da `v1`, que nomeia os oito.
- `v3`: o sentido do cruzamento tem dois canais além da cor, a geometria da seta atravessando a divisória e a anotação com as duas contagens, mas não tem um terceiro que distinga **entrou** de **saiu** sem ler a direção. Em impressão monocromática as duas ficam iguais.
- `v3`: a quarta maior distância do dado fixo é de uma origem que **não** cruzou a divisória, e ela fica a 0,20 px do corte do percentil 75, que mede 63,37 px contra os 63,17 px dela. O caso misto, cor de contexto com nome, existe no modelo e não está desenhado neste recorte.
- `v4`: a fileira reservada de 12 px acima do plano não é exercida pelo dado fixo, porque as oito campanhas encontram posição livre. É espaço reservado para dado com mais nomes ou nomes mais longos, e sai como um vão vazio no preview.
- `v2`, `v3` e `v4`: os `y` de linha de base (13, 31, 49, 67) são ímpares em relação ao passo de 2 px da ESP-1. São posições de linha de base, não vãos entre peças, e o `COLISAO-TEXTO` mede os quatro sem acusar par.

Revisão de 2026-10-05, rodada da emenda ACE-6. As setas das quatro versões medem de 5,21:1 a 9,50:1 nos dois temas e passam. Os bloqueantes estão em `validation/revisao_09_dispersao-e-bolhas__06_antes-e-depois-com-setas_2026-10-05.md`; o que segue não reprova.

- `v1`: a linha de chamada da fileira de reserva está em `--line-strong`. Ela liga nome a ponto e, pelo teste da ACE-6, carrega relação; o dado fixo não a desenha, mas a `v4` já usa `--text-muted` no mesmo papel.
- `v1`: o marcador de ponta não declara `markerUnits="userSpaceOnUse"`, ao contrário das três irmãs. Em 1,5 px de traço a ponta sai com 10,5 px e não engole o destino no preview; fica dependente da espessura.
- `v1`: a tela escreve a sigla CPL, e as irmãs escrevem custo por lead por extenso.
- `v2`, `v3` e `v4`: rótulo sem halo atravessa linha de grade (`Busca paga, piorou` sobre a de R$ 200 na `v2`, `Redes sociais` sobre a de 30% na `v3`). A grade em `--line-subtle` mede 1,25:1 e não atrapalha a leitura; a exceção da marca fina da ROT-7 explica a falta de halo.
- `v2`, `v3` e `v4`: item sem base de leads é descartado em silêncio pelo `flatMap`, e a contagem da frase acessível passa a ser a dos desenhados. O dado fixo não exercita o caso.
- `v3`: os nomes em cor semântica não levam palavra, e a `v2` escreve "piorou". Entrou e saiu se leem pela legenda e pelo sentido da seta.
- `v3`: o tique do eixo X é número solto; o substantivo "leads" vem só do rodapé de eixos.
- `v4`: singular fixo na linha de leitura e na frase acessível ("1 campanha é nova"); com outro recorte a concordância quebra.
- `v4`: campanha encerrada com deslocamento abaixo de 12 px vira anel de mudança pequena e perde o x, porque o teste de `SMALL_MOVE_PX` vem antes do `ended`. O dado fixo não exercita o caso.

Revisão de 2026-10-05, segunda passada, sobre o código corrigido. A `v4` foi aprovada; a `v1` e a `v3` seguem reprovadas por nome estacionado junto do ponto de outra entidade, e o bloqueante está no mesmo arquivo de `validation/`. O que segue não reprova.

- `v1`: a taxa da linha de leitura e da frase acessível sai com zero casas (`26% (52 de 200)`), e a NUM-1 pede uma casa com o volume; a `v3` escreve `15,0%`.
- `v1`: a guarda de vazio troca o gráfico inteiro por "Nenhum canal neste recorte" quando um único canal vem sem base de leads; as irmãs descartam só o item. O dado fixo não exercita o caso.
- `v1`: a frase acessível mede 236 caracteres, a 14 do teto da ACE-1, e cresce com o nome do canal líder.
- `v3`: a linha de chamada de `Webinar técnico` não declara `strokeWidth` e sai com 1 px por padrão; a da `v4` declara. Sem diferença visível.
- `v4`: o começo de `Conteúdo técnico` fica a 16,3 px do próprio ponto e a 17,6 px do ponto de Webinar de produto. O nome próprio ainda é o mais próximo e os dois nomes saem na mesma direção, mas a margem é de 1,3 px; a recusa por ponto alheio mais próximo, pedida para a `v1` e a `v3`, protegeria este par também.
