# Colunas em small multiples

## O que é

Em vez de amontoar várias séries num gráfico só, o mesmo gráfico de colunas pequeno se repete, um painel por série, numa grade HTML. Cada painel guarda a forma da própria série (pico, queda, sazonalidade) e a grade permite comparar formas, que é o que o agrupado com muitas séries destrói. A escala é comum a todos os painéis por padrão, calculada uma vez sobre o conjunto inteiro; o eixo de períodos aparece só na última linha da grade, e os painéis são ordenados por uma medida (total, win rate), nunca por ordem alfabética.

## Quando usar

- De 4 a 12 séries da mesma medida por período, que não cabem num gráfico só sem virar confusão.
- Comparar a forma de cada série mais que o valor exato de um período: quem subiu, quem caiu, quem é sazonal.
- Uma série por pessoa, origem ou plataforma, com escala compartilhada para a comparação ser honesta.
- Séries de histórico desigual, desde que o mês sem dado fique marcado como sem histórico e não como zero.

## Quando evitar

- Duas ou três séries: usar colunas agrupadas (modelo 02), que cabem lado a lado num eixo só.
- Escala livre por painel sem aviso: a comparação entre painéis vira mentira; manter escala comum ou avisar em cada painel que a escala é própria.
- Mais de 12 painéis num cartão: filtrar, paginar ou usar mapa de calor (família 15).
- O valor exato de cada período é a pergunta central: usar tabela visual (família 14) em vez de forma.
- Tendência de muitas séries em muitos períodos, quando o que importa é a trajetória contínua e não o volume de cada mês: pequenos múltiplos de linha (04/09).

## Anatomia

1. **Grade de painéis** do mesmo tamanho, em HTML com Tailwind (`grid grid-cols-3`), um `BarChart` mínimo do Recharts por célula.
2. **Escala numérica compartilhada**, calculada uma vez em TypeScript sobre todo o conjunto e aplicada a todos os painéis via `YAxis domain={[0, domainMax]}` oculto.
3. **Cabeçalho do painel** com o nome da série (`text-text-secondary`, `text-xs font-medium`) e o total ou a métrica de ordenação em algarismo tabular (`kpi-number`), altura fixa para os painéis alinharem entre si.
4. **Eixo de período só na última linha** da grade, com `formatMonthShort` e `interval={0}` (até 8 categorias, EIX-7) quando o painel é largo o bastante para os rótulos não se tocarem; em grade de muitas colunas (`v3`, três por linha num canvas mais estreito) o painel não cabe seis rótulos e o eixo usa `interval="preserveStartEnd"` (TIP-5 autoriza reduzir tiques que não cabem).
5. **Sem rótulo por coluna**: o painel é pequeno demais para escrever o valor em cada barra sem colidir com o vizinho; o valor exato mora na dica (`ChartTooltip`), quando a série não tem `null`.
6. **Ordenação por medida**, não por nome: total do período, win rate ou outra régua declarada no `meta.json` da versão.

## Versões

- **`v1_leads-por-origem-em-seis-paineis`**: seis origens de leads em escala comum, painéis ordenados pelo total, eixo de meses só na última linha.
- **`v2_origem-em-foco`**: a mesma grade com uma origem em destaque (cor e peso), cursor sincronizado entre painéis (`syncId`).
- **`v3_fechamentos-por-executivo`**: doze painéis de fechamento mensal ordenados por win rate, com o piso esperado dito uma vez no topo da grade e o executivo abaixo dele marcado em `negative`.
- **`v4_historico-curto-e-sem-volume`**: caso limite com mês sem histórico (nada desenhado) separado de mês com zero medido (marca mínima na base), sem depender da dica para a diferença.

Previews: `v1_leads-por-origem-em-seis-paineis/preview.svg`, `v2_origem-em-foco/preview.svg`, `v3_fechamentos-por-executivo/preview.svg`, `v4_historico-curto-e-sem-volume/preview.svg` (e as versões `-claro.svg` de cada um).

## Como colar no Farol

1. O `data.ts` de cada versão espera uma lista de séries com `monthly` no formato `{ month: 'YYYY-MM', value }`; troque pelo seletor real (leads por origem, fechamentos por executivo) mantendo a mesma forma.
2. `GRID_COLS`, `BAR_MAX` e `HEADER_H` são constantes de desenho no topo do arquivo: ajuste `GRID_COLS` se a página tiver menos ou mais colunas de largura disponível, e refaça a conta de `bottomRowStart` junto.
3. O domínio comum (`domainMax`) é recalculado a cada render a partir do `data` recebido: ao trocar o recorte da página, a escala dos doze painéis muda junto, sem código extra.
4. Em página estreita (celular), a grade de 3 colunas some qualquer painel útil; reduza `GRID_COLS` para 2 com `@container` antes de colar, ou reserve a versão para telas largas.
5. O piso de win rate (`v3`) e a lista de meses (`v1`, `v2`, `v4`) são props com default no `data.ts`: passe os valores reais da página em vez de reexportar o dado fictício.

## Referências

- Catálogo: [Datawrapper Academy, colunas empilhadas](https://www.datawrapper.de/academy/what-to-consider-when-creating-stacked-column-charts). Observar a indicação de split bars ou small multiples quando a comparação entre várias partes é o objetivo.
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary). Observar que o recurso de repetir painéis atravessa várias famílias em vez de ser um tipo próprio.
- Praticante: [Few, Quantitative Displays for Combining Time Series and Part to Whole Relationships (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/displays_for_combining_time-series_and_part-to-whole.pdf). Observar, ao abrir num leitor, os painéis repetidos como alternativa à pilha.
- Praticante: [Observable, the powerful simplicity of bar charts and histograms](https://observablehq.com/blog/simplicity-bar-charts). Observar a defesa da forma simples repetida em vez do gráfico único sobrecarregado.
- Implementação: [Recharts, BarChart](https://recharts.github.io/en-US/api/BarChart/). Observar `syncId`, usado na `v2` para sincronizar o cursor da dica entre os seis painéis.
- Portal de design: [Figma Community, Data Visualization Graphs and Charts Kit](https://www.figma.com/community/file/1199721318228257277/data-visualization-graphs-charts-kit). Observar as versões compactas do mesmo gráfico, que é o que a grade exige.

## Correções da rodada de 2026-09-18

- **`v1`, `v2`, `v3`, `v4` (EIX-9)**: o Recharts só reserva altura de eixo para o `XAxis` que não está `hide`; como o eixo de meses só aparecia na última linha via `hide={!showAxis}`, os painéis de cima cresciam mais que os de baixo na mesma escala (medido: até 3,22 px por lead contra 2,35 px, e em `v3` 22 px por fechamento contra 12 px). O eixo passou a ficar sempre presente (nunca `hide`) e só o tique some (`tick={false}`) nos painéis que não são da última linha, o que zera o texto sem zerar o espaço reservado. Conferido no `preview.svg`: os seis (`v1`, `v2`, `v4`) e os doze (`v3`) painéis medem a mesma altura de plotagem e o mesmo px por unidade, em qualquer linha da grade.
- **`v3` (checklist 15, ESP)**: `HEADER_H=40` não cabia as 3 linhas do painel marcado (nome, taxa com volume, aviso); o texto cortado comia a vírgula do percentual e a descendente de nomes como "Thiago R.". `HEADER_H` subiu para 56 e o `canvas` do `meta.json` subiu de 620 para 720 de altura para o corpo do gráfico não encolher junto; conferido nos dois temas, sem corte.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18, sobre os PNGs de conferência dos dois temas. Segunda leitura no mesmo dia, depois das correções de EIX-9 e de `HEADER_H`: as quatro versões seguem aprovadas, `npm run check` sai com 0 com erro e os itens abaixo continuam abertos, todos sem bloquear._

- **Todas as versões**: o total do cabeçalho de cada painel sai como número solto (`280`, `169`), sem o substantivo que a NUM-6 pede; escrever "280 leads" ou dizer a unidade uma vez no topo da grade resolveria.
- **`v1`, `v3`, `v4`**: a série única é pintada em `--line-strong`, que a 17.2 reserva ao neutro de contexto e que mede 1,79:1 e 1,83:1 contra o cartão; sem valor escrito em cada coluna, a marca fica abaixo dos 3:1 da ACE-3. Em série única sem destaque, `--chart-1` é a cor esperada; a `v2` usa o neutro corretamente, porque ali existe um painel em foco.
- **`v1`, `v2`, `v4`**: `GRID_COLS` é constante no topo, mas a grade usa a classe fixa `grid-cols-3` e `grid-rows-2`; mudar a constante, como o passo 2 de "Como colar no Farol" sugere, não muda o layout. Derivar a classe da constante ou dizer no README que os dois andam juntos.
- **`v3`**: as colunas dos quatro executivos abaixo do piso são pintadas inteiras em `--negative`. O catálogo pede ícone e palavra em negative, e a 17.2 diz que a cor semântica não pinta série; o estado já está dito pelo ícone e pela frase, então a cor da marca podia seguir neutra.
- **`v3`**: o aviso `ESPESSURA-MARCA` do check (coluna de 7,67 px, medido no desenho após a correção desta rodada; o valor antigo de 6,17 px ficou desatualizado) está declarado nas `notes` do `meta.json` como densidade esperada; a leitura confirma que a forma serve, mas vale registrar que este é o limite do modelo, e que 12 painéis de 6 meses é o teto prático desta grade.
- **`v4`**: o traço de 2 px do zero medido e o mês sem histórico só se distinguem pela presença da marca; funciona no PNG, mas quem colar em cartão menor perde o traço antes de perder o resto. Um piso mínimo em px para o traço deixaria a distinção explícita.
- **`v3` (proximidade do cabeçalho)**: nas linhas de valor baixo o `HEADER_H` fixo deixa um vão grande dentro da célula e as colunas caem mais perto do painel de baixo que do próprio nome. Medido no PNG escuro, linha da Patricia L.: 62 px entre o cabeçalho e o topo das colunas contra 45 px entre a base das colunas e o cabeçalho seguinte. A grade é regular e o leitor acerta o agrupamento depois do primeiro painel, mas ancorar o corpo do gráfico ao topo da célula, ou reduzir o `domainMax` do bloco, devolveria a proximidade ao lado certo.
- **`v3` (EIX-7)**: com `interval="preserveStartEnd"` a última linha imprime 3 dos 6 meses (mar, jun, ago), e os três tiques caem sob as colunas certas. A escolha está justificada em comentário pela TIP-5, e a leitura de forma não sofre; vale registrar que o modelo abre exceção à EIX-7, que pede todos os rótulos até 8 categorias.
- **`v1`, `v2`, `v3`, `v4` (texto de código)**: o comentário da EIX-9 repetido nas quatro versões está sem acento ("so", "paineis", "espaco"). Não é texto de tela, então não entra na regra da seção 9, mas destoa do resto do repositório.
- **`v4` (EST-2)**: o mês sem histórico é dito por palavra no cabeçalho ("sem histórico até jun/26") e não por `formatUnavailable()`. A frase é mais precisa que o rótulo genérico e a distinção fica clara no PNG; fica o registro de que o modelo resolve a ausência com texto próprio.
