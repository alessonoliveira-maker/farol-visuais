# Dispersão com distribuições marginais

## O que é

O plano de dispersão ganha um histograma da medida do eixo horizontal no topo e um histograma
da medida do eixo vertical à direita, com os mesmos domínios e as margens alinhadas ao pixel.
A leitura responde duas perguntas ao mesmo tempo: como as duas medidas se relacionam e como
cada uma se distribui sozinha, o que a nuvem de pontos sobreposta esconde. O canto vazio da
grade de 2 por 2 carrega o `n` do conjunto.

## Quando usar

* Ver a relação e a forma de cada medida juntas, como ticket contra ciclo com a cauda longa do ticket.
* Nuvem densa de 500 a cerca de 3.000 pontos, em que os marginais mostram o que a sobreposição esconde.
* Conferir se a divisória de um quadrante cai no pico da distribuição.
* Cartão com pelo menos 520 px de largura e altura parecida.

## Quando evitar

* Cartão pequeno ou estreito: abaixo de 520 px desligue as marginais e fique com a dispersão simples (modelo 01).
* Pergunta só sobre a distribuição de uma medida: use histograma (família 16).
* Histogramas com domínio ou margens diferentes do plano: as barras deixam de corresponder aos pontos.
* Nuvem enorme sem forma: use densidade 2D (modelo 09).

## Anatomia

1. **Histograma de X**, no topo: contagem por faixa do eixo horizontal, barras em `--line-strong`, sem eixo de valor visível, com a contagem escrita acima de cada faixa por `formatInt`.
2. **Plano de dispersão**, ao centro: `ScatterChart` com pontos em `--chart-1`, grade nos dois sentidos em `--line-subtle` pela EIX-3b e eixos formatados por `@/lib/format`.
3. **Histograma de Y**, à direita, deitado: contagem por faixa do eixo vertical, mesma cor neutra do histograma de X, com a contagem escrita à direita de cada faixa.
4. **Canto vazio**, acima do histograma de Y: o `n` do conjunto em algarismo tabular, calculado do dado.
5. **Domínio e margem compartilhados**: os três gráficos leem as mesmas constantes de domínio e de margem do lado que precisa alinhar, e as faixas **azulejam o domínio inteiro em largura igual**. É essa condição, e só ela, que faz o passo band do `BarChart` coincidir com o passo linear do plano; sem ela o histograma conta uma distribuição que não é a do plano ao lado.
6. **Uma só conta de posição** (v2 e v4): `fractionOf(valor, domínio)` devolve a fração de 0 a 1, e é a função que a divisória do plano, a divisória das faixas e o marcador da borda chamam. Duas contas de posição no mesmo arquivo divergem no primeiro descuido de edição.
7. **Faixa acesa** (v2): a que contém o corte sai em `--chart-1` e as outras em `--line-strong`, com o corte nomeado na linha de leitura e no rodapé, porque a cor não é o único canal (COR-2).
8. **Faixa de razão constante** (v3): em escala logarítmica a faixa é de razão e não de largura, e o centro dela é a média **geométrica**, o único ponto que cai no meio dela em pixel.
9. **Reserva da borda** (v4): a margem direita reserva pixels para o que passou do domínio; o marcador tem forma própria, cor própria e o valor real escrito ao lado, e o marginal do topo repete a mesma reserva para a última faixa terminar onde o plano termina; nela, uma barra própria em `--chart-5` conta as recolhidas.

## Versões

* `v1_ticket-contra-ciclo-com-histogramas`: ticket e ciclo de 60 oportunidades ganhas fictícias, com histograma de cada medida nas bordas, correlação de Pearson calculada do dado e o canto com o `n` do conjunto. Preview: [escuro](./v1_ticket-contra-ciclo-com-histogramas/preview.svg), [claro](./v1_ticket-contra-ciclo-com-histogramas/preview-claro.svg).
* `v2_corte-no-pico-da-distribuicao`: 48 campanhas por custo por lead e qualificação, com a divisória do quadrante repetida no plano e nas duas faixas, a faixa que contém o corte acesa e a nota de quantas campanhas ficam a menos de um décimo do corte. Preview: [escuro](./v2_corte-no-pico-da-distribuicao/preview.svg), [claro](./v2_corte-no-pico-da-distribuicao/preview-claro.svg).
* `v3_leads-com-tempo-em-escala-log`: 2.000 leads por tempo até o primeiro contato, em escala logarítmica, e tentativas até a agenda, com as faixas do marginal em razão constante e a moda que a sobreposição apaga. Preview: [escuro](./v3_leads-com-tempo-em-escala-log/preview.svg), [claro](./v3_leads-com-tempo-em-escala-log/preview-claro.svg).
* `v4_cauda-longa-recolhida`: 520 oportunidades ganhas por ciclo e ticket, com o domínio parando no P99 medido, a última faixa comum de 175 a 200 dias, as cinco de ciclo mais longo recolhidas numa reserva da borda, com o valor real escrito, e uma barra própria acima do corte na reserva do marginal do topo. Preview: [escuro](./v4_cauda-longa-recolhida/preview.svg), [claro](./v4_cauda-longa-recolhida/preview-claro.svg).

## Como colar no Farol

1. Copiar a pasta da versão para o componente de destino; `Chart.tsx` e `data.ts` seguem sem alteração.
2. Trocar `data` pela consulta real; mantendo os nomes dos campos, os bins recalculam sozinhos.
3. Na v1, na v2 e na v3, revisar os pares de domínio, tique e largura de faixa: eles **não** se ajustam ao dado sozinhos, porque o alinhamento entre plano e histogramas depende de um domínio fixo e conhecido, não do maior valor de cada recorte, e os tiques precisam continuar redondos e terminar acima do novo maior valor (EIX-4). A regra que não se pode quebrar ao mexer neles é uma só: a contagem de faixas tem de dividir o domínio em larguras iguais sem sobra, e na v3 em razões iguais sem sobra.
4. Na v4 nada disso é preciso: o domínio sai do P99 do próprio recorte e os tiques saem do domínio; ali a única constante é a largura da faixa.
5. Embrulhar num `VisualCard` com pelo menos 520 px de largura; abaixo disso, esconder os dois histogramas e cair para a dispersão simples do modelo 01.

## Referências

* Catálogo: [From Data to Viz, scatter](https://www.data-to-viz.com/graph/scatter.html): observar as distribuições marginais como variação recomendada.
* Catálogo: [ECharts, histogram with custom series](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-histogram.ts): histogramas das duas dimensões calculados a partir dos mesmos pontos.

## Pendências conhecidas

* `v1_ticket-contra-ciclo-com-histogramas`: o dado fixo tem 60 pontos; o próprio "Quando usar" deste modelo pede de 500 a 3.000 para o ganho do marginal (a leitura da sobreposição) aparecer de verdade. A v3 (2.000) e a v4 (520) já ficam na faixa; trocar o dado da v1 por um maior é a próxima rodada, não esta correção.
* `v2_corte-no-pico-da-distribuicao`: 48 campanhas também ficam abaixo da faixa de 500 a 3.000, e aqui por desenho, porque o número vem da especificação da versão no catálogo. Com 48 pontos a sobreposição não é o problema que o marginal resolve; o que ele resolve é a outra pergunta da versão, onde a divisória caiu.

## Observações da revisão (não bloqueantes)

* `v1_ticket-contra-ciclo-com-histogramas`: o `meta.json` promete no `demonstrates` um canto com "o número de oportunidades e a correlação calculada do dado", mas o canto imprime só o `n` e a palavra oportunidades; a correlação vive apenas na frase acessível. Ou o canto passa a escrevê-la, ou a linha do `demonstrates` deixa de prometê-la. O catálogo, esse, pede só o número de oportunidades, e isso a versão entrega.
* `v1_ticket-contra-ciclo-com-histogramas`: o bin de R$ 400 a 500 mil tem contagem zero e o Recharts não desenha barra nem rótulo ali. A altura zero é o encoding certo e não engana, mas um `0` escrito na posição deixaria explícito que a faixa foi medida e está vazia, no espírito da EST-3. Vale para as três versões novas também: nenhuma delas tem faixa vazia no dado fixo, mas nenhuma escreve o zero se aparecer uma.
* `v1_ticket-contra-ciclo-com-histogramas`: as contagens dos dois marginais saem como número puro, sem o substantivo que a NUM-6 pede. A leitura fecha porque o canto escreve "60 oportunidades" e os cinco rótulos do topo somam 60, e o acervo tem precedente aprovado de contagem sem substantivo; ainda assim, uma nota única de 11 px dizendo que a faixa conta oportunidades fecharia a leitura sem repetir a palavra treze vezes. As três versões novas seguem o mesmo padrão, e nelas o rodapé escrito é que carrega a unidade.
* `v1_ticket-contra-ciclo-com-histogramas`: o respiro entre o rótulo de contagem e a ponta da barra está escrito como `4` literal em dois lugares do `Chart.tsx`; a 17.7 nomeia esse respiro em `VALUE_LABEL_GAP = 6` e a ESP-1 pede constante nomeada. Não muda a leitura, e o acervo aprovado tem literais parecidos, mas a constante deixaria o padrão copiável sem releitura. Nas versões novas o respiro já é a constante `LABEL_GAP`, com o valor 4 da v1 preservado para as quatro terem a mesma silhueta; alinhar as quatro em 6 é conserto de uma rodada só.
* `v1_ticket-contra-ciclo-com-histogramas`: os 60 pontos ficam abaixo da faixa de 500 a 3.000 que o modelo declara, então o marginal revela menos do que revelaria no volume de projeto. Já registrado em Pendências conhecidas.
* Correção de uma observação da rodada anterior: a conta do comentário de `BAR_CATEGORY_GAP` está certa. O `preview.svg` mede 23 px de espessura no topo com passo de 58,33 px, que é exatamente `58,33 x (1 menos 2 x 0,30)`; a leitura anterior, de vão perto de 60% contra os 30% declarados, confundiu vão total da banda com vão por lado.
* Ferramenta compartilhada: o `npm run check` não mede `ESPESSURA-MARCA` nem `CONTRASTE-MARCA` em nenhuma versão deste modelo, porque o preview sai com transform, então a conferência é à mão. Na v1: 23 px no topo e 13,85 px à direita, as duas acima do piso de 12 px da ESP-2. Nas versões novas os números medidos estão na nota do `meta.json` de cada uma. Anotado aqui só para a próxima revisão não ler o silêncio da guarda como aprovação.
* `v3_leads-com-tempo-em-escala-log`: a especificação da versão no catálogo pede opacidade 0,25 nos pontos, e a ACE-5 não deixa. Medido contra o cartão, `--chart-1` a 0,25 mede 1,77:1 no escuro e 1,46:1 no claro, contra o piso de 3:1; a 0,70 mede 5,30:1 e 3,25:1 e passa. A versão ficou com 0,70, o contrato venceu a especificação e o desvio está declarado no `meta.json`. A mesma tensão está aberta em `01_dispersao-simples/v4`, que ficou com 0,35 e declarou a reprovação como tensão em vez de corrigir; peça nova é barrada pela fila de dívida, então aqui não havia essa saída.
* `v3_leads-com-tempo-em-escala-log`: o eixo de tentativas vai de 0,5 a 10,5 e não de 0 a 10, porque as faixas do marginal são centradas no inteiro. Não é folga de desenho, é a condição de alinhamento: com domínio de 1 a 10 o centro da primeira faixa cairia em 1,5 e o marginal ficaria meia faixa deslocado do plano. Quem mexer no domínio precisa mexer no par.
* `v4_cauda-longa-recolhida`: a última faixa do ciclo deixou de ser aberta: conta só o que está no plano (175 a 200 dias) e as recolhidas têm barra própria na reserva do marginal do topo, com a contagem escrita (corrigido na rodada de revisão).
* `v4_cauda-longa-recolhida`: as cinco recolhidas ficam numa reserva de 72 px **fora** da área de plotagem, o que é escolha deliberada contra desenhá-las na borda de dentro: dentro elas cairiam sobre a nuvem do fim do domínio e o valor escrito precisaria de halo sobre marca, que é o defeito da GEO-4. Fora, a leitura fica limpa e a fronteira do domínio continua sendo a última linha de grade.
* As quatro versões usam `Math.max(1, ...)` para o teto do eixo de contagem dos marginais. O `1` é piso de folga e não queda de lista vazia, porque a contagem de faixas é fixa e maior que zero em todas; a `AGREGACAO-ZERO` mede as quatro e não acusa. Registrado porque a forma se parece com a que a EST-1b proíbe.
* Espessura de marca medida à mão nas quatro versões, já que a guarda sai `preview_com_transform` em todas: v1 23,0 px no topo e 13,85 px à direita, v2 21,0 e 15,0, v3 21,0 e 14,0, v4 17,0 e 15,0, iguais nos dois temas e todas acima do piso de 12 px da ESP-2. A da v3 só chegou lá depois de uma correção de canvas: a 560 px de altura a faixa das tentativas media 10,0 px, porque 10 faixas com vão de 30% não cabem num plano de 250 px, e a altura subiu para 660 px. A conta que serve para o próximo: `espessura = (altura do plano ÷ número de faixas) × 0,4`, e ela precisa dar 12 px ou mais antes de o canvas ser declarado.
* O `preview.svg` e o `preview-claro.svg` da v1 mudaram nesta rodada sem ninguém tocar na v1: o modelo foi renderizado inteiro de uma vez, como o fluxo do contrato recomenda, e o serializador ganhou desde o último render da v1 uma regra de herança de fonte no prelúdio do `<style>`. A diferença é uma linha do SVG e o `check` da v1 segue limpo.
* Aviso de ferramenta registrado, não contornado: o `render` acusa divergência de kerning por sigla de duas ou mais maiúsculas, medida em **0,594 px no par P para L de "CPL"**, que aparece no título e no eixo da v2. A divergência total do preview contra a página ficou em 0,00% a 0,01% dos pixels nas oito imagens, muito abaixo do teto de 0,5%. A sigla não foi trocada por texto por extenso de propósito, porque isso seria contornar um defeito de ferramenta com uma mudança de conteúdo.

Revisão de 2026-10-14, primeira passada da v2, da v3 e da v4 (v2 aprovada; v3 e v4 reprovadas, parecer em `validation/revisao_09_dispersao-e-bolhas__08_dispersao-com-marginais_2026-10-14.md`). O que segue não reprova:

* `v2_corte-no-pico-da-distribuicao`: a faixa de R$ 0 a R$ 25 tem zero campanhas e sai sem barra e sem `0` escrito (REC-11, EST-3). A leitura não erra, porque os sete números somam 48, mas isto corrige a observação acima que dizia que nenhuma versão nova tinha faixa vazia: a v2 tem.
* `v2_corte-no-pico-da-distribuicao`: o tique do topo, `40%`, sai em 11,25 px contra a linha de grade em 8 px, e o `R$ 200` sai com o centro 10,7 px à esquerda da última linha vertical, pelo `preserveEnd` do Recharts (EIX-6b, emenda de 2026-10-02). Os dois continuam lidos como os da linha certa. `margin.top` de 12 e margem direita que cubra meia largura medida do tique resolvem. O mesmo vale para `7 dias` na v3 e para `R$ 400 mil` na v4.
* `v2_corte-no-pico-da-distribuicao`: as duas divisórias não têm rótulo com nome e valor junto da linha (ANO-2, ANO-3); o 28% só aparece no rodapé. Um "corte R$ 90" e um "corte 28%" na margem reservada, como em `25_matriz-e-quadrantes/01/v2`, fechariam a leitura sem depender do rodapé.
* `v2_corte-no-pico-da-distribuicao`: o comentário de `DividerX` justifica não usar `ReferenceLine` porque o marginal teria escala band, mas os dois marginais usam eixo `type="number"`, onde a `ReferenceLine` desenha. A decisão de uma só `fractionOf` continua boa; o motivo escrito é que está errado, e sem `extendDomain` um corte fora do domínio desenha a linha fora da área de plotagem.
* `v2_corte-no-pico-da-distribuicao`: a frase acessível usa `cplDestaque?.count ?? 0`; com o corte fora do domínio ela sairia "com 0 campanhas de ," (zero no lugar de ausência, num ramo que o dado fixo não exercita). E o `makeBins` joga em silêncio na faixa da ponta o valor que passa do domínio fixo.
* `v2_corte-no-pico-da-distribuicao`: "vale" é tudo que não é a faixa mais cheia. No dado fixo a faixa de 25 a 30% é de fato um mínimo local (6, 5, 11), mas um ombro da distribuição sairia chamado de vale.
* `v2_corte-no-pico-da-distribuicao`: "8 de 5 pontos na qualificação" usa "pontos" num gráfico em que pontos são as marcas; "5 pontos percentuais" lê sem ambiguidade. E o eixo vertical não tem nome na tela: "qualificação" só aparece no rodapé.
* `v2_corte-no-pico-da-distribuicao`: o raio declarado de 4 px sai 4,514 px, o padrão de 64 px² do Recharts, porque o `ZAxis` sem `dataKey` não chega ao `Scatter` (o mesmo acontece na v1). Aqui não tem consequência visível; na v3 tem, e foi bloqueante.
* `v2_corte-no-pico-da-distribuicao`: o aviso de kerning de "CPL" no título e no eixo, logo acima, ficou velho: o título atual é "Corte de custo por lead no pico da distribuição" e o `preview.svg` não tem "CPL" em lugar nenhum.
* `v3_leads-com-tempo-em-escala-log`: o eixo vertical imprime 2 a 10 soltos, sem unidade, e "tentativas" só aparece no título e no rodapé (NUM-6). Mesmo caso de `01_dispersao-simples/v3`; "Eixo vertical: tentativas até a agenda" no rodapé, como fez a `01/v4`, fecha.
* `v3_leads-com-tempo-em-escala-log`: o filtro `minutos <= 0` descarta o contato imediato em silêncio, e o `n` do canto passa a ser menor que o recorte sem dizer por quê. O dado fixo não tem zero, e o `data.ts` declara a escolha; ao colar no Farol, contar os descartados no rodapé ou tratar o zero numa faixa própria, como a `01/v4`.
* `v4_cauda-longa-recolhida`: o raio declarado de 3 px sai 4,514 px pelo mesmo motivo da v2, e a amostra da chave usa `r={3}`. Sem colisão; alinhar na rodada de correção.
* `v4_cauda-longa-recolhida`: o ciclo das recolhidas é escrito em `--chart-5`, texto em cor categórica; a 17.10 aprova `--chart-1` a `--chart-6` como marca, e a guarda mede o texto acima de 4,5:1 nos dois temas. O padrão da ROT-3 é o texto em `--text-secondary` com o marcador na cor.
* `v4_cauda-longa-recolhida`: a cauda usa `--chart-5`, quando a ordem da COR-8 daria `--chart-3` à segunda classe, e 1 contra 5 é o par mais fraco dos quatro primeiros em deuteranopia. Forma, posição e chave carregam a diferença, por isso não reprova.
* `v4_cauda-longa-recolhida`: os rótulos das recolhidas não têm anticolisão: duas com tickets a menos de cerca de 10 px uma da outra sobrepõem os textos, e um ciclo de quatro algarismos ("1.024 dias") passa da reserva de 72 px. O dado fixo não exercita nenhum dos dois casos.
* `v4_cauda-longa-recolhida`: `AXIS_WIDTH = 72` fica acima da faixa de 48 a 64 da EIX-6, com a medição só no comentário do `Chart.tsx`; a quebra foi medida em 52 e não em 64. Vale repetir a conta na nota do `meta.json`. E "P99", no rodapé e na frase acessível, lê melhor como "percentil 99" para quem não é de estatística.

Revisão de 2026-10-14, segunda passada da v3 e da v4 (as duas aprovadas: a v3 desenha os 2.000 pontos com o raio de 1,5 px declarado, e a v4 tem a faixa comum de 175 a 200 dias com 46 e a barra própria de 5 na reserva do topo). O que segue não reprova:

* `v3_leads-com-tempo-em-escala-log` e `v4_cauda-longa-recolhida`: `MARGIN_BOTTOM = 30` abaixo da reserva de 28 px do eixo deixa cerca de 45 px vazios entre os tiques de baixo e o rodapé, medidos nos dois PNGs. Na v3 a altura de 660 px foi escolhida para a faixa das tentativas passar do piso de 12 px, e devolver essa margem ao plano engrossaria a faixa sem crescer o canvas. Quem mexer precisa mexer junto no `bottom` do marginal da direita, que repete a soma.
* `v3_leads-com-tempo-em-escala-log`: a frase acessível usa `tempoTopo?.count ?? 0`, o mesmo ramo de zero no lugar de ausência que a v2 tem. Com 14 faixas fixas o ramo nunca roda, mas a forma é a que a EST-1b evita; montar a frase dentro do mesmo teste de `null` da linha de leitura fecha.
* `v4_cauda-longa-recolhida`: a nota do `meta.json` ficou da rodada anterior. Ela ainda diz que "o rodapé diz que ela é aberta e conta 175 dias ou mais" e que sem isso "a última faixa seria lida como uma faixa comum de 25 dias, e ela não é", o contrário do que o `Chart.tsx` desenha hoje; e o comentário de `TAIL_FILL` fala em "última faixa do marginal" quando a cor agora pinta a barra da reserva. É a classe da DAD-10, sem efeito no desenho; reescrever o trecho para a barra própria é a primeira coisa a alinhar.
* `v4_cauda-longa-recolhida`: a barra da reserva tem 24 px de largura (`BAR_MAX_SIZE`) e as faixas comuns 17 px, medidos no `preview.svg`. A largura não codifica nada e a barra é de outra classe, mas a largura medida da banda deixaria as nove com a mesma silhueta. A altura de 2,0 px (5 sobre um teto de 144) é o encoding certo, e o 5 escrito carrega a leitura.
* `v4_cauda-longa-recolhida`: o limiar não vai escrito junto da barra da reserva, como a primeira passada sugeria. O 5 se liga às recolhidas pela cor, pela posição sobre os triângulos e pela chave, e os 200 dias estão na chave, no último tique e no rodapé, então a leitura fecha.
* `v4_cauda-longa-recolhida`: a frase acessível termina em "a última faixa comum conta 46", contagem sem substantivo (NUM-6), e não menciona a barra da reserva; "46 oportunidades" fecha a primeira parte.
* `v4_cauda-longa-recolhida`: o raio de 3 px agora é o desenhado (515 paths `M3,0A3` nos dois previews), o que encerra a observação acima sobre os 4,514 px; a amostra da chave usa o mesmo 3, mas como literal `r={3}` e não como `POINT_RADIUS`.
