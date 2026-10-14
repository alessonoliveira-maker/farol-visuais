# Áreas sobrepostas

## O que é

Duas áreas da mesma unidade partindo do zero, uma atrás da outra, sem `stackId`: a de fundo é o
envelope (capacidade, teto, total possível) e a da frente é a parte (realizado, atendido,
demanda). A transparência é o que sustenta a leitura, e é também o seu ponto fraco: sem contorno
forte e preenchimento leve, a interseção das duas cores cria uma terceira cor que ninguém pediu e
que passa a ser lida como categoria. Por isso toda versão deste modelo declara, em texto, qual
camada está à frente e qual está ao fundo; a cor sozinha não carrega essa informação porque a
frente sempre parece menor do que é onde cobre o fundo, o defeito clássico de duas áreas com
transparência. Quando a medida protagonista é a demanda ou a projeção, ela vira `Line` saturada
por cima da área pálida da capacidade, no lugar de uma segunda `Area`.

## Quando usar

- Exatamente duas grandezas na mesma unidade, uma contida na outra: capacidade e realizado,
  demanda e atendimento, teto e uso.
- Capacidade ou envelope em área clara e a medida protagonista em linha saturada por cima, quando
  a pergunta pede acompanhar o traço mais do que a massa.
- Capacidade planejada conhecida até o fim do período e demanda real que para em hoje, com o
  resto do horizonte projetado.
- Capacidade que muda por contratação ou por decisão, desenhada em degrau (`stepAfter`) em vez de
  interpolar uma rampa que o dado não tem.
- De 10 a cerca de 60 pontos no tempo; com menos pontos a leitura de tendência não se sustenta
  (EIX-11).

## Quando evitar

- Três ou mais séries: a sobreposição de preenchimentos vira ruído antes da terceira camada; usar
  múltiplas séries em linha (`04_linhas/02_multiplas-series`).
- Unidades diferentes: usar painéis alinhados com o mesmo eixo X
  (`08_combinados-e-eixo-duplo/03_paineis-alinhados`).
- A pergunta é quanto uma passou da outra, não quanto uma ocupou da outra: usar área de diferença
  contra meta (`07_area-de-diferenca`), que separa o espaço acima e abaixo da referência.
- A parte pode passar do todo sem que isso seja erro de dado: dessa vez as duas grandezas não
  estão contidas uma na outra, e o modelo certo é linha, não área.
- Transparência que, ao natural, cria uma terceira cor lida como categoria: reduzir para uma linha
  ou separar em painéis antes de forçar a sobreposição.

## Anatomia

1. **Área de fundo (envelope)** em `--line-strong`, contorno de 1 a 1,5 px e preenchimento leve
   (`fillOpacity` entre 0,14 e 0,16): é o teto, sempre a primeira `Area` no JSX, para ficar atrás.
2. **Área ou linha da frente (parte)** em `--chart-1`, mais saturada: `Area` com `fillOpacity`
   entre 0,5 e 0,6 quando a leitura é de massa, ou `Line` de 2 px quando a leitura é de traço.
3. **Contorno nas duas camadas**, sempre, para a interseção não depender só da transparência: o
   traço aparece mesmo onde o preenchimento se mistura.
4. **Declaração explícita de ordem**, em texto: a linha de leitura ou a frase acessível nomeia qual
   camada é o fundo e qual é a frente, porque a cor sozinha nunca resolve isso (a de trás sempre
   parece menor do que é sob a de frente).
5. **Toda marca com Line própria ganha nome visível**, em legenda com amostra na forma da marca
   (`ROT-4`) ou na linha de leitura: uma `Line` sem nome no visual é a marca mais forte do quadro
   ficando invisível para quem lê, o defeito que já reprovou uma versão de outra família.
6. **Rótulo direto dentro de cada área**, no ponto de maior separação (para a de fundo) e no ponto
   de maior ocupação (para a de frente), sempre com halo (`ROT-7`), para não precisar de legenda
   quando as duas marcas cabem lidas assim.
7. **Grade só horizontal**, domínio do eixo de valor a partir do zero (EIX-1, EIX-2), com a unidade
   no próprio tique.
8. **Ausência com desenho próprio**: capacidade ou realizado medidos em zero desenham a marca e
   escrevem 0 (EST-3); semana sem coleta quebra a área com `null` e `connectNulls={false}` (EIX-10)
   e ganha uma `ReferenceArea` nomeando o motivo, nunca a mesma marca do zero medido.
9. **No máximo duas anotações por visual** (ANO-1): trecho projetado, corte de "hoje", recesso e
   lacuna de coleta disputam esse teto, e cada versão escolhe quais cabem.

## Versões

- **`v1_capacidade-e-agendas-realizadas`**: o caminho feliz. Duas `Area` sem `stackId`, capacidade
  ao fundo em `--line-strong` e realizado à frente em `--chart-1`, 37 semanas de janeiro a
  setembro de 2026. Rótulo direto dentro de cada área (sem legenda), no ponto de maior separação e
  no de maior ocupação, e a linha de leitura escreve a ocupação média com `formatPercent` e nomeia
  qual camada está à frente.
- **`v2_demanda-em-linha-contra-capacidade`**: absorve a área com linha. `ComposedChart` com a
  capacidade em `Area` clara e degrau (`stepAfter`, muda por contratação) desenhada antes da
  demanda, que vai em `Line` saturada por cima. Semanas em que a demanda passa a capacidade ganham
  um ponto na cor negativa com o excedente escrito ao lado (sinal e palavra, não só cor) e uma
  legenda nomeia as duas marcas, para a linha não ficar sem nome.
- **`v3_capacidade-anual-com-projecao`**: a capacidade planejada cobre o ano inteiro em área de
  degrau; a demanda vem em duas `Line` da mesma cor, uma sólida até hoje e outra tracejada depois,
  com uma `ReferenceLine` vertical marcando o corte. O selo de premissa do trecho projetado fica no
  `VisualCard` (ANO-6): o Chart só desenha o traço tracejado e nomeia o trecho na linha de leitura.
- **`v4_recesso-e-semana-sem-coleta`**: as duas ausências lado a lado, cada uma com desenho e
  `ReferenceArea` própria. Recesso é capacidade e realizado em zero medido, a marca desce ao chão e
  escreve 0 (EST-3); a semana seguinte sem coleta quebra a área do realizado com `null` (EIX-10),
  enquanto a capacidade daquela semana segue normal. A frase acessível nomeia as duas semanas e o
  motivo de cada uma.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e troque o dado padrão pelas duas séries reais
   vindas do seletor da página, mantendo a mesma unidade nas duas.
2. Confirme que a série de fundo é sempre a que contém a de frente: se a página pode entregar um
   recorte em que o realizado passa a capacidade, o modelo certo não é este, é área de diferença
   (`07_area-de-diferenca`).
3. Em `v3`, a semana de corte (`asOfWeek`) deve vir do relógio da página, não do `data.ts` fixo;
   troque por uma prop.
4. Dê altura ao pai (`h-64` ou `h-96` em `v3`, que é canvas `largo`) ou passe `height`; sem altura
   o `ResponsiveContainer` desenha zero.
5. Embrulhe no `VisualCard` do Farol: o `title` do `meta.json` vira o título do cartão, o
   `useCase` pode virar o `subtitle`, e o selo de premissa da `v3` vem do `metricId` do registry,
   não do Chart.

## Referências

- [Datawrapper Academy, Customizing your area chart](https://www.datawrapper.de/academy/customizing-your-area-chart):
  áreas não empilhadas e o controle de opacidade.
- [Datawrapper, What to consider when creating area charts](https://www.datawrapper.de/blog/area-charts):
  quando preferir linha a área sobreposta.
- [Data Viz Catalogue, Area Graph](https://datavizcatalogue.com/methods/area_graph.html): áreas
  agrupadas sobre base comum, a técnica deste modelo.
- [AG Charts, Area Chart With Negative Values](https://www.ag-grid.com/charts/gallery/area-with-negative-values/):
  várias áreas sobrepostas com opacidade e traço, referência de acabamento para o contorno forte
  que a `COR-9` deste catálogo exige no lugar do gradiente.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18, conferida de novo sobre os `Chart.tsx` e os PNGs correntes dos dois temas.
Itens que não reprovam nenhuma versão e ficam registrados para a próxima rodada de acabamento._

- **`v1`**: a capacidade sobe em três degraus por contratação (40, 48, 52, 58) e é desenhada em
  `type="monotone"`, então cada degrau vira uma rampa de uma semana. A leitura da ocupação não se
  altera, mas a `v2` e a `v3` usam `stepAfter` para o mesmo dado; vale unificar.
- **`v1`**: o eixo de tempo usa `interval={4}`, que é um tique a cada cinco semanas e não um tique
  por mês; por isso a sequência sai `jun/26` e depois `ago/26`, sem `jul/26`. Cada rótulo está na
  posição correta do seu dado, então nada engana, mas a cadência aparenta ser mensal.
- **`v2`**: das quatro semanas acima da capacidade, só as duas de pico levam o excedente escrito;
  as outras duas ficam apenas com o ponto na cor negativa. É o teto de duas anotações da `ANO-1`
  sendo respeitado, e a frase acessível informa a contagem completa.
- **`v2`**: a amostra da legenda da capacidade usa `opacity: 0.35` sobre `--line-strong`, o que a
  deixa quase invisível no tema escuro. O nome ao lado resolve a identificação da série.
- **`v3`**: o `demonstrates` fala em tiques mensais, mas o `interval={4}` entrega um tique a cada
  cinco semanas e `jul/26` não aparece. Mesmo caso da `v1`.
- **`v3`**: a projeção de fim de ano passa o teto da capacidade e isso fica só na forma e na frase
  acessível; nenhuma anotação escreve em quanto. O teto de duas anotações já está ocupado pelo
  corte de hoje, então é escolha de espaço, não descuido.
- **`v4`**: com duas `ReferenceArea` mais o rótulo `0` do recesso, o visual fica no limite do teto
  de duas anotações da `ANO-1`.
- **`v4`**: as duas `ReferenceArea` são declaradas com `x1` igual a `x2`, então o retângulo sai com
  largura zero e nada é pintado: os dois `preview.svg` não têm nenhum `rect` de referência, só os
  rótulos `recesso` e `sem coleta` flutuando no topo do corpo, sem faixa `--surface-sunken` e sem
  traço que ligue o rótulo à semana. Cada rótulo cai na coluna certa (`x = 277,3` e `x = 419,6`,
  as posições exatas das duas semanas) e a leitura se sustenta, mas a Anatomia e o `demonstrates`
  do `meta.json` descrevem uma faixa que o desenho não entrega.
- **`v4`**: a linha de leitura diz `sem coleta em jul/26`, e as duas ausências caem em julho (o
  recesso em 06/07 e a falta de coleta em 27/07), então a forma curta do mês não separa uma da
  outra; a frase acessível, que usa `formatDate`, separa.
- **`v4`**: o `null` de uma semana quebra os dois trechos vizinhos do `stepAfter`, então o vão do
  realizado ocupa de 20/07 a 03/08 e aparenta duas semanas sem coleta, não uma.
- **`v2`**: o passo redondo da grade sobe o topo do domínio para 100 quando o maior valor do dado é
  82, então o terço superior do corpo fica vazio e a distância entre a demanda e a capacidade sai
  mais achatada do que precisaria.
- **`v3`** e **`v4`**: a área neutra de capacidade (`--line-strong`, que mede 1,79:1 no escuro e
  1,83:1 no claro) não tem o valor escrito na marca; ela é lida pelo tique alinhado do eixo e pela
  linha de leitura, que nomeia a camada. A `v1` escreve `Capacidade 40` na própria área e é a que
  mais se apoia na isenção da 17.2.
- **`v2`** e **`v4`**: o tique de tempo sai de `formatDate(value).slice(0, 5)`, isto é, `04/05` sem
  o ano. A forma é comum e as duas séries cabem num ano só, mas o corte acontece depois do
  formatador e não dentro dele.
