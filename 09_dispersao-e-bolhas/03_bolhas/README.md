# Bolhas

## O que é

Dispersão em que a área de cada círculo codifica uma terceira medida de magnitude. X e Y continuam sendo a leitura principal, a posição de cada campanha no plano; a área é a pior lida das três e por isso exige uma legenda de tamanho com círculos de referência. O `ZAxis` do Recharts trabalha em área, em px², com domínio começando em zero, e as bolhas maiores são desenhadas antes das pequenas para não escondê-las.

## Quando usar

- Terceira medida de magnitude por entidade, como o investimento de cada campanha sobre CPL contra taxa de qualificação.
- Entre 5 e cerca de 60 bolhas no cartão, com contorno fino na cor do cartão separando vizinhas.
- Narrar a evolução de posição e tamanho de poucas entidades mês a mês, com rastro da selecionada.
- Mostrar onde está o dinheiro dentro de uma nuvem de eficiência.

## Quando evitar

- Comparação precisa da terceira medida: o olho compara mal áreas; use barras ordenadas (família 02).
- Mais de cerca de 60 bolhas: a sobreposição esconde as pequenas; use dispersão simples ou pequenos múltiplos.
- Bolhas sem eixos, só para mostrar tamanho: use bolhas empacotadas (família 12).
- Leitura analítica fina de mudança entre períodos: use antes e depois com setas (modelo 06).
- Tamanho pelo raio, não pela área: exagera as bolhas grandes.

## Anatomia

1. Eixos X e Y numéricos, com nome, tique formatado (`formatCurrencyAxis` no CPL, `formatPercent` na qualificação, `formatInt` na contagem) e domínio explícito (CONTRATO, EIX-4, EIX-6).
2. Grade nos dois sentidos com `CartesianGrid`, porque a leitura é a posição conjunta nos dois eixos; é a exceção que a EIX-3 abre para a família 09, e ela vem com `tickLine={false}` e `axisLine={false}`, que a `v1` ainda herda ligada de `AXIS_PROPS`.
3. Círculos de cor cheia com contorno fino na cor do cartão (`stroke="var(--surface-raised)"`), que separa bolhas vizinhas sem tocar no contraste do preenchimento (COR-5, TOK-4, TOK-6). Opacidade em bolha é perda de contraste medida: `--chart-1` a `fillOpacity` 0,55 compõe para 2,43:1 no tema claro, abaixo do piso de 3:1 da ACE-5.
4. `ZAxis` com `dataKey` do investimento, `domain` a partir de zero e `range` em área, com piso e teto de raio declarados. Piso alto (a partir de cerca de 5 px) precisa ir escrito na régua, com a distorção calculada do dado.
5. Dados ordenados do maior investimento para o menor antes de entrar no `Scatter`, para as bolhas pequenas ficarem visíveis por cima das grandes (REC-13). Havendo grupos, a ordem externa é o papel de desenho: neutro primeiro, destaque por último.
6. Régua de tamanho abaixo do gráfico, com dois círculos de valor redondo mais o máximo observado, calculados pela mesma conta de raio do `ZAxis` e alinhados pela base (ROT-5b).
7. Dica própria (`ChartTooltip` com `payload` remapeado) trazendo o nome da campanha e as três medidas já formatadas.
8. Linha de leitura acima do gráfico, calculada do dado, com a conclusão do recorte (ANO-5).
9. Rótulo direto quando há poucas marcas a nomear, numa camada dentro do `ScatterChart` que usa `usePlotArea`, `useXAxisScale` e `useYAxisScale`: o deslocamento das candidatas sai do RAIO de cada bolha, porque respiro constante entra por dentro da bolha grande e joga o texto sobre a marca.

## Versões

- `v1_campanhas-por-cpl-e-qualificacao`: CPL, taxa de qualificação e investimento de 36 campanhas fictícias do trimestre. Demonstra `ZAxis` com domínio a partir de zero e `range` em área, dados ordenados do maior investimento para o menor, legenda de tamanho com três círculos de valor redondo e contorno na cor do cartão separando bolhas vizinhas.
- `v2_campanhas-acima-do-teto-de-cpl`: 24 campanhas contra um teto de CPL e uma meta de qualificação. Demonstra destaque em cor cheia com o resto em neutro desenhado por baixo, `ReferenceLine` de teto e de meta com `ifOverflow="extendDomain"` e rótulo em margem reservada, anotação com o investimento somado das que passaram do teto, e anticolisão de rótulo com deslocamento derivado do raio.
- `v3_plataformas-mes-a-mes-com-rastro`: três plataformas de mídia ao longo de 12 meses de 2025. Demonstra estado de mês trocando os dados com a bolha casada pelo `id`, rastro dos meses anteriores da selecionada em pontos de raio fixo, cor categórica por slot fixo do dado, régua de tamanho comum aos 12 meses com o domínio do `ZAxis` no máximo do ano, e o mês exibido escrito no canto vazio do plano.
- `v4_investimento-zero-e-valores-desiguais`: 18 campanhas em que a maior verba é 233 vezes a menor, três têm zero medido e duas não têm verba apurada. Demonstra zero medido em anel tracejado do tamanho mínimo com `shape` próprio, ausência fora do plano e contada no rodapé, e piso de área declarado na régua com a distorção medida do dado.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/CampaignBubbles/`.
2. Troque o `import` do `./data` pelo dado real da página, já sem campanhas sem CPL, qualificação ou investimento registrados.
3. Ajuste `DOMAIN_CPL`, `TICKS_CPL`, `DOMAIN_TAXA`, `TICKS_TAXA` e `LEGEND_REFERENCES` para a faixa real da métrica; um domínio fixo evita que o plano mude de forma a cada filtro. O último degrau da régua não se ajusta: ele sai do dado, por `legendValues(max)`.
4. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-64">`) ou passe `height`.
5. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Data Visualisation Catalogue, bubble chart](https://datavizcatalogue.com/methods/bubble_chart.html): observar o alerta de área e não raio e o limite de quantidade de bolhas.
- [Recharts, Bubble Chart](https://recharts.github.io/en-US/examples/BubbleChart/): observar `ZAxis range={[16, 225]}`.
- [Observable Plot, dot](https://raw.githubusercontent.com/observablehq/plot/main/docs/marks/dot.md): observar escala `sqrt` no raio e ordenação por raio decrescente.
- [Storytelling with Data, what is a bubble chart](https://www.storytellingwithdata.com/blog/2021/5/11/what-is-a-bubble-chart): observar a dificuldade de comparar áreas e a recomendação de construir o gráfico em partes.
- [From Data to Viz, bubble](https://www.data-to-viz.com/graph/bubble.html): observar a legenda de tamanho obrigatória e a escolha de qual variável vai na área.

## Onde a especificação do catálogo cedeu ao CONTRATO

_Leva de 2026-09-28, ao produzir a `v2`, a `v3` e a `v4`._

- **Opacidade em bolha, nas quatro versões.** O catálogo pede bolha translúcida para deixar ver a pilha, e a `ACE-5` cobra que a cor COMPOSTA siga acima de 3:1 nos dois temas. Medido aqui: `--chart-1` a `fillOpacity` 0,55 dá 3,76:1 no tema escuro e 2,43:1 no claro, que é o mesmo número que a emenda da `ACE-5` registra para `09/04`. As demais saem com cor cheia (`--chart-1` em 9,50:1 no escuro e 6,00:1 no claro) e contorno de 1 px na cor do cartão, que é a saída da `TOK-6`. A `v1` também saiu para cor cheia na correção de 2026-10-05, reprovada pela `ACE-5` a 0,55.
- **Peso 700 em três rótulos, na `v2`.** O catálogo pede peso 700 nos rótulos das campanhas acima do teto, que são três; a `TIP-3` dá dois elementos por visual. Só a de maior CPL leva 700, as outras duas ficam em 600.
- **Régua de tamanho constante, na `v2`.** O catálogo pede R$ 5 mil, R$ 20 mil e R$ 50 mil; pela `ROT-5b` o último degrau é o máximo observado. Ficou R$ 5 mil, R$ 20 mil e o máximo do recorte, montado por `legendValues(max)`.
- **Neutro de dado, na `v2`.** A tabela 17.2 indica `--line-strong` como neutro, com a ressalva de que a isenção de contraste vale só com o valor escrito na marca ou junto dela. Com 21 bolhas sem valor escrito a isenção não existe, então o neutro é `--text-muted` (5,21:1 no escuro, 5,37:1 no claro) e não `--line-strong` (1,79:1 e 1,83:1).
- **Contorno para a ausência, na `v4`.** A `DAD-2` atribui o contorno à ausência e o neutro ao zero medido; aqui os dois papéis se invertem de propósito, porque a ausência não é desenhada e vai ao rodapé, então nenhuma forma da tela fica em disputa.
- **Linha de eixo, nas três versões.** A exceção que a `EIX-3` abre para a família 09 pede grade nos dois sentidos "sem tique e sem linha de eixo", e `AXIS_PROPS` traz `axisLine` ligado. As três novas passam `axisLine={false}`; a `v1` ainda herda a linha, e isso já estava registrado nas observações abaixo.
- **Ferramenta, e vale para qualquer versão com controle em HTML.** O serializador do preview escreve só as propriedades que DIFEREM do pai, então um estado que usa a cor herdada do tema sai do SVG sem `color` nenhum. Na fileira de meses da `v3` isso invertia o destaque: os 11 meses não selecionados carregavam `text-text-muted` explícito e o selecionado, em `text-text-primary`, saía sem cor e lia mais apagado que eles no tema escuro. A saída é pôr a cor do estado comum no CONTÊINER e deixar só o estado destacado com classe própria, que aí difere do pai e é serializada. Achado por leitura do `preview.svg`, não pelo `check`, que mede esse texto como `texto_em_html` e não o alcança.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19._

- `v1_campanhas-por-cpl-e-qualificacao`: os eixos não trazem nome no desenho, só tique com unidade (`R$` no X, `%` no Y). A anatomia deste README promete "eixos com nome"; hoje quem nomeia as duas medidas é o título do cartão mais a linha de leitura, o que é suficiente para decodificar, mas deixa o plano mudo se o visual for recortado do cartão.
- `v1_campanhas-por-cpl-e-qualificacao`: a frase acessível lista as faixas de CPL, de qualificação e o investimento somado, e não a conclusão da nuvem (CPL maior anda junto de qualificação maior, e o investimento se concentra nas campanhas caras). Atende o tamanho da ACE-1, ganha com a conclusão escrita.
- `v1_campanhas-por-cpl-e-qualificacao`: `LEGEND_VALUES` é constante fixa e `maxInvestimento` sai do dado. Com dado real em que o maior investimento fique abaixo de R$ 150 mil, o maior círculo da legenda passa do teto de área das bolhas do plano. O passo 3 de "Como colar no Farol" já manda ajustar a constante; um teto declarado no cálculo tornaria a proteção automática.
- `v1_campanhas-por-cpl-e-qualificacao`: o piso de área (`AREA_MIN = 12`) faz o menor investimento ocupar 4,2% da área da maior bolha contra 2,9% do valor. A distorção é pequena e inerente ao `range` do `ZAxis`, mas só está escrita no código; a legenda não diz que existe piso.
- `v1_campanhas-por-cpl-e-qualificacao`: grade nos dois sentidos e linha de eixo herdada de `AXIS_PROPS` contrariam a leitura literal da EIX-3 e da EIX-5, escritas para coluna, linha e barra. Na dispersão a leitura é a posição conjunta, então a escolha se sustenta; fica o registro para não virar precedente fora da família.
- Ferramenta: a guarda `ESPESSURA-MARCA (ESP-2)` sai como "não medida: preview_com_transform" nesta versão, então a espessura da marca não tem aferição automática aqui. Conferido a olho nos dois PNGs.
- Ferramenta: sobraram `crop_check.png` e `crop_check2.png` em `_render/.qa/09_dispersao-e-bolhas/03_bolhas/`, fora do conjunto de conferência gerado pelo render.

_Revisão de 2026-10-05._

- `v1_campanhas-por-cpl-e-qualificacao`: o eixo Y declara cinco tiques em `TICKS_TAXA` e o render desenha três (0%, 30% e 60%), com a grade junto, porque o plano fica com cerca de 109 px de altura no preset `card` (REC-29, GEO-1). A grade de três linhas segue regular e dentro da EIX-4, então não reprova; canvas por número, como nas irmãs, ou três tiques declarados alinham o código ao desenho.
- `v1_campanhas-por-cpl-e-qualificacao`: a linha de eixo segue herdada de `AXIS_PROPS` nos dois eixos (aviso EIXO-CALMO do `check`, EIX-5). Sem consequência visível, porque cai sobre a borda da grade; falta `axisLine={false}` depois do espalhamento.
- `v1_campanhas-por-cpl-e-qualificacao`: o `meta.json` e a lista de versões deste README ainda dizem "3 círculos de valor redondo"; a régua hoje tem dois degraus redondos e o máximo observado (R$ 182,0 mil), pela ROT-5b.
- `v1_campanhas-por-cpl-e-qualificacao`: a chave `OPACIDADE-MARCA` desta versão continua em `_render/scripts/lib/divida-guardas.json` depois do conserto, e o `check` pede que quem consertou a apague.
- `v2_campanhas-acima-do-teto-de-cpl`: o rótulo "Webinar ao vivo" cai sobre a linha do teto e o halo interrompe o tracejado; um resto de traço aparece entre "ao" e "vivo". A anticolisão não conta as linhas de referência como obstáculo, e a candidata em diagonal para cima e à direita estava livre.
- `v2_campanhas-acima-do-teto-de-cpl`: teto, meta e a nota do rodapé somam três anotações, contra as duas da ANO-1. A soma do rodapé caberia na linha de leitura.
- `v3_plataformas-mes-a-mes-com-rastro`: os doze botões de mês vivem dentro da raiz com `role="img"`, que torna os filhos decorativos para leitor de tela; o controle merece ficar fora do nó da imagem.
- `v3_plataformas-mes-a-mes-com-rastro`: o mês exibido aparece três vezes (linha de leitura, canto do plano e botão marcado).
- `v3_plataformas-mes-a-mes-com-rastro`: ramos de borda sem tratamento próprio: em janeiro a frase acessível diz "rastro dos 0 meses anteriores"; `trailId` ausente do mês deixa "rastro de" sem nome na régua; e trocar o `data` com o estado de mês antigo cai no bloco de vazio mesmo havendo dado.
- `v3_plataformas-mes-a-mes-com-rastro`: o rastro são pontos soltos de raio fixo, sem ordem escrita; serve aqui porque o caminho é monótono, e num caminho que volte sobre si a direção se perde.
- `v3_plataformas-mes-a-mes-com-rastro`: a guarda `RAIO-CONTRA-AREA` não mediu (`valor_nao_casado`). Conferido à mão no PNG de dezembro: diâmetros de 34, 27 e 20 px para R$ 128 mil, R$ 82 mil e R$ 43 mil, que é a conta de área com o máximo do ano.
- `v4_investimento-zero-e-valores-desiguais`: a nota "R$ 900 lê 9% da área e vale 0,4%" não diz de quê; "da maior bolha" fecha a frase.
- `v4_investimento-zero-e-valores-desiguais`: sem nenhuma campanha com verba acima de zero, o bloco de vazio substitui o plano e as de zero medido somem junto, o que contraria o espírito da EST-3 nesse ramo.
- `v4_investimento-zero-e-valores-desiguais`: a nota das campanhas sem verba apurada usa `formatUnavailable()` dentro da frase, sem o ícone `Unplug` da EST-2.
- As quatro versões: na régua de tamanho, a palavra "Investimento" fica centrada na altura da caixa e os valores ficam na base dos círculos, cerca de 9 px abaixo; as duas linhas de base não coincidem.
- `v1` e `v3`: os eixos seguem sem nome no desenho e dependem do título e do subtítulo do cartão para dizer qual medida é qual. Na `v2` e na `v4` a mesma falta virou bloqueante, porque ali nenhum texto visível nomeia a medida.

_Revisão de 2026-10-05, segunda passada, sobre o retorno da correção da `v2` e da `v4`._

- `v2_campanhas-acima-do-teto-de-cpl` e `v4_investimento-zero-e-valores-desiguais`: `Y_AXIS_WIDTH` passou de 48 para 68, fora da faixa de 48 a 64 da EIX-6. Sem colisão nem corte no preview; a largura só existe para abrigar o nome girado do eixo, e volta à faixa quando o nome sair de pé (o giro é o bloqueante desta passada, pela TIP-5).
- `v2_campanhas-acima-do-teto-de-cpl`: o eixo X segue sem nome próprio; quem o identifica é o rótulo `teto R$ 120` mais a linha de leitura, que termina em "de CPL". Basta para decodificar.
- `v2_campanhas-acima-do-teto-de-cpl`: o halo de "Webinar ao vivo" continua interrompendo o tracejado do teto, com o resto de traço entre "ao" e "vivo"; a observação da primeira passada segue aberta.
- `v2_campanhas-acima-do-teto-de-cpl` e `v4_investimento-zero-e-valores-desiguais`: a nota do `meta.json` não cita o nome de eixo que entrou nem a nova largura do eixo Y; na `v4` a conta de linhas da nota ainda fala em 256 px de plano, e o plano hoje mede 191 px de altura, porque a margem de baixo cresceu para 36 px.
- `v4_investimento-zero-e-valores-desiguais`: em "Leads gerados (contagem)" o parêntese repete o que o substantivo já diz; "Leads gerados" fecha a NUM-6 sozinho.
- Ferramenta: nenhuma guarda do `check` acusa `angle` em `label` de eixo, e o texto girado ainda tira a versão das guardas `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA` (`preview_com_transform`), que seguem medindo a `v1` e a `v3`. Colisão e contraste de texto da `v2` e da `v4` foram conferidos a olho nos dois PNGs e pelas coordenadas do `preview.svg`.
