# 10_funil: funil de etapas

> Estudo da família para o catálogo VISUAIS do Farol. Pesquisa feita em 2026-09-14.
> Casos de uso com dados 100% fictícios, sem marca real e sem dado pessoal.
> Stack conferida no `app/`: React 18.3.1, TypeScript 5.9 strict, Recharts 3.10.1 (tipagem lida em `app/node_modules/recharts/types`), Tailwind 4.3, lucide-react.
> Tokens de cor citados são os do Farol: `--chart-1..8` (categórica), `--seq-1..7` (sequencial), `--positive`, `--negative`, `--accent-cyan`, `--accent-amber`, `--surface-canvas|raised|sunken|overlay`, `--text-primary|secondary|muted`, `--border`.

---

## 1. O que a família responde

Um funil mostra quantas unidades sobrevivem a cada etapa de um processo ordenado e onde a perda se concentra. Três leituras convivem e costumam ser confundidas; o modelo precisa dizer qual está mostrando:

1. **Volume por etapa**: quantos chegaram.
2. **Conversão de passo**: dos que estavam na etapa anterior, quantos passaram para esta.
3. **Conversão acumulada**: dos que entraram, quantos chegaram até aqui.

Um funil só é honesto quando as etapas formam uma sequência real e a população é a mesma (coorte, leitura de fluxo). Quando o dado é um retrato do pipeline num dia (leitura de estoque), a diferença entre duas etapas não é perda: uma parte está em andamento. Todo modelo desta família precisa deixar essa distinção visível, com um segmento ou um rótulo "em andamento".

### Perguntas típicas no Farol

- **Comercial**: das 420 oportunidades abertas no trimestre, quantas viraram proposta e quantas foram ganhas; em qual passagem a taxa caiu contra o trimestre anterior; onde se perde mais e por qual motivo.
- **Pré-vendas**: das entradas da semana, quantas tiveram conexão, agenda marcada, agenda realizada e handoff aceito; qual passo está fora do SLA.
- **Marketing**: de impressões a lead qualificado, qual plataforma converte melhor em cada passo; qual CPL e CPL qualificado resultam.
- **Diretoria**: o funil realizado cabe na meta de ganhos; quanto falta em cada etapa para fechar a meta do período.

### Regras transversais da família

- Etapas sempre na ordem do processo, nunca ordenadas por valor.
- Valor absoluto escrito em toda etapa; taxa de passo e acumulada identificadas pelo nome ("passo" ou "da entrada").
- Etapa sem dado é marcada como tal e nunca interpolada.
- Em 400 px de largura, preferir modelos horizontais empilháveis (10.2, 10.11); funis centralizados perdem os rótulos.
- Alternativa tabular acessível (tabela etapa, valor, passo, acumulado) disponível no menu do visual.

---

## 2. Tabela de modelos

| # | Modelo | Quando usar | Quando evitar | Erro comum |
|---|---|---|---|---|
| 10.1 | Funil clássico trapezoidal | Capa de apresentação, leitura rápida de 4 a 6 etapas monotônicas | Quando a decisão depende de comparar etapas ou recortes | Deixar a última etapa em triângulo e usar gargalo fixo, o que distorce os valores finais |
| 10.2 | Funil em barras horizontais com taxa de conversão | Padrão analítico: achar o passo que precisa de conserto | Etapas com ordens de grandeza muito diferentes num painel só | Domínio automático, que faz o trilho de fundo deixar de ser 100% da entrada |
| 10.3 | Funil de barras centralizadas com conectores de perda | Manter a metáfora do funil com escala proporcional | Comparações finas entre etapas vizinhas | Esquecer que a centralização remove a linha de base comum |
| 10.4 | Funil com perdas por etapa | Perguntar onde e por qual motivo se perde | Dados de retrato de pipeline sem o segmento "em andamento" | Tratar a diferença entre etapas como perda |
| 10.5 | Funil comparativo entre períodos ou segmentos | Trimestre contra trimestre, PF contra PJ, executivo contra executivo | Recortes de tamanho muito diferente sem normalizar | Comparar volume quando a pergunta é taxa |
| 10.6 | Funil espelhado (borboleta) | Duas populações lado a lado com a mesma escala | Mais de dois recortes | Escalas diferentes em cada lado, ou sinal negativo vazando no tooltip |
| 10.7 | Funil em colunas com drop off | Sequência lida da esquerda para a direita, com a perda desenhada entre colunas | Mais de 7 etapas ou largura de celular | Cunha que não termina exatamente no topo da coluna seguinte |
| 10.8 | Funil cônico contínuo | Visão de conjunto do afunilamento com área de perda | Quando os valores intermediários importam | Interpolar com curva suave e sugerir valores entre etapas |
| 10.9 | Funil com meta sobreposta | Acompanhar realizado contra meta por etapa | Meta sem origem declarada | Desenhar a meta com escala diferente do realizado |
| 10.10 | Funil empilhado por composição | Ver como o mix de origem ou plataforma muda ao longo do funil | Mais de 6 categorias | Misturar "sem origem" com "outros" |
| 10.11 | Funil em cartões de etapa | Faixa de KPIs no topo de página, leitura numérica | Quando a proporção visual é a mensagem principal | Cartões sem nenhuma pista de magnitude |
| 10.12 | Funil com tempo e SLA entre etapas | Pré-vendas e handoff com prazo | Processos sem carimbo de data confiável | Mediana calculada só com quem já passou, sem avisar |

---

## 3. Modelos

### 10.1 Funil clássico trapezoidal

**Descrição.** Faixas empilhadas de cima para baixo, centralizadas, com largura proporcional ao volume; cada trapézio parte da largura da etapa e termina na largura da seguinte, de modo que a inclinação sugere a perda.

**Anatomia.** Trapézio por etapa; rótulo da etapa; valor absoluto; taxa (passo ou acumulada); forma da última etapa; tooltip; cor por etapa ou cor única com destaque.

**Abordagem na stack.** `recharts-nativo`. `FunnelChart` com `Funnel dataKey="valor" nameKey="etapa" lastShapeType="rectangle"`, `LabelList position="right" dataKey="etapa"` para o nome, `LabelList position="inside"` para o valor, `Cell` por etapa e `Tooltip`. A forma padrão é o componente `Trapezoid`, exportado pela biblioteca.

**Ponto delicado.**
- O padrão de `lastShapeType` é `"triangle"` (conferido na tipagem 3.10.1): a última etapa vira ponta e o valor final some da largura. Usar `"rectangle"`.
- A largura do trapézio vai do valor da etapa ao valor da seguinte. Se uma etapa tiver valor maior que a anterior (retrato com janelas diferentes, por exemplo agenda realizada maior que agenda marcada no mês), o trapézio abre para baixo sem aviso. Validar monotonicidade no preparo do dado e cair para o 10.2 quando falhar.
- O componente não calcula conversão. Taxa de passo e acumulada entram prontas no dado e são lidas no `LabelList` por `formatter` ou `content`.
- Não usar gargalo fixo. No demo do Highcharts o funil tem `neckWidth: '30%'` e `neckHeight: '25%'`, o que desenha as últimas etapas com a mesma largura qualquer que seja o valor; a análise do Graphtelling mediu uma última etapa com 6,2% do volume ocupando 35% da largura desenhada.

**Versões sugeridas.**
1. **Básico.** Comercial, "Funil do trimestre 2026-T3": Aberta 420, Diagnóstico 268, Proposta 131, Negociação 64, Ganha 29. Rótulo à direita com valor e percentual da entrada.
2. **Com destaque.** Mesma base; a passagem com pior taxa de passo (Proposta para Negociação, 48,9%) em `--accent-amber`, as demais etapas em `--chart-1` com opacidade 0,45 e anotação "pior passagem do trimestre".
3. **Caso limite: etapa sem registro.** Uma unidade não registra "Negociação": a faixa aparece tracejada em `--text-muted` com rótulo "sem registro", e a taxa de Negociação para Ganha aparece como "n/d" em vez de ser calculada sobre Proposta.

**Referências.**
- Catálogo: [Recharts, API Funnel](https://recharts.github.io/en-US/api/Funnel/): observar `lastShapeType`, `reversed`, `shape` e `activeShape`.
- Catálogo: [Recharts, exemplo de funil](https://recharts-recharts.mintlify.app/examples/funnel-chart): observar `LabelList` dentro e fora e `Cell` por segmento.
- Catálogo: [Highcharts, JSFiddle do funil](https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/funnel/): observar como `neckWidth` e `neckHeight` fixos desproporcionam as etapas finais.
- Catálogo: [Data Viz Project, Funnel Chart](https://datavizproject.com/data-type/funnel-chart/) (não abriu).
- Praticante: [Storytelling with Data, #SWDchallenge funnel chart (2024-06-03)](https://www.storytellingwithdata.com/blog/swdchallenge-funnel-chart): as três ressalvas (centralização, diferença de magnitude, uso sem progressão real).
- Praticante: [Graphtelling, Funnel Chart Alternatives](https://graphtelling.com/blog/funnel-chart-alternatives/): a medição da distorção do funil estilizado.
- Portal de design: [Behance, Style Guidelines for data visualisation: dark & light](https://www.behance.net/gallery/82482589/Style-Guidelines-for-data-visualisation-dark-light): funil incluído num guia com variação de tema escuro.

---

### 10.2 Funil em barras horizontais com taxa de conversão

**Descrição.** Barras horizontais alinhadas à esquerda numa escala comum, com um trilho de fundo que representa a entrada (100%) e a taxa de passo escrita entre uma barra e a seguinte. É a forma recomendada quando alguém precisa decidir qual passo consertar.

**Anatomia.** Rótulo de etapa no eixo categórico; barra de volume; trilho de fundo; valor à direita da barra; taxa de passo entre barras; taxa acumulada no fim do trilho; marca da maior queda.

**Abordagem na stack.** `recharts-custom`. `BarChart layout="vertical"`, `XAxis type="number" hide domain={[0, entrada]}`, `YAxis type="category" dataKey="etapa" width={120}`, `Bar dataKey="valor" background={{ fill: 'var(--surface-sunken)' }}` e `LabelList content={RotuloConversao}`. Quando houver até 6 etapas e nenhuma interação de eixo, a variante `html-tailwind` (`div` com `style={{ width: \`${pct}%\` }}`) é mais leve e empilha melhor no celular.

**Ponto delicado.**
- A taxa entre barras sai do `content` do `LabelList`, que recebe `x, y, width, height, index, value`. Escrever em `y + height + gap` exige `barCategoryGap` suficiente e não pode rodar no último índice.
- Fixar `domain={[0, entrada]}`. Com domínio automático o Recharts arredonda o máximo para um número "bonito" e o trilho deixa de ser 100% da entrada.
- Nunca escala logarítmica: comprimento deixa de ser proporcional. Quando topo e fundo diferem por ordens de grandeza, dividir em dois painéis ou mostrar as taxas normalizadas.

**Versões sugeridas.**
1. **Básico.** Pré-vendas, semana 2026-W37: Entradas 1.180, Tentativa 1.020, Conexão 612, Agenda marcada 248, Agenda realizada 187, Handoff aceito 142; taxa de passo entre barras.
2. **Com destaque.** A passagem Conexão para Agenda marcada (40,5%) está abaixo do alvo de 45%: taxa em `--negative` com o ícone `TriangleAlert` do lucide; demais taxas em `--text-muted`.
3. **Caso denso e real.** Marketing em painéis pequenos por plataforma (Mídia social, Busca paga, Rede profissional), cada um com Impressões, Cliques, Leads e Leads qualificados normalizados em percentual da etapa anterior, volumes absolutos nos rótulos, CPL e CPL qualificado no rodapé de cada painel.
4. **Caso limite: dado parcial.** A etapa "Leads com origem" tem 72% de cobertura: parte medida em barra sólida, parte estimada em faixa hachurada, rótulo "72% com origem registrada".

**Referências.**
- Catálogo: [AG Charts, Funnel Series](https://www.ag-grid.com/charts/javascript/funnel-series/): com `dropOff.enabled: false` o funil vira barras segmentadas; observar `spacingRatio` e `stageLabel`.
- Praticante: [Graphtelling, Funnel Chart Alternatives](https://graphtelling.com/blog/funnel-chart-alternatives/): mesma linha de base, trilho de fundo com a população inicial, taxa de passo e queda absoluta.
- Praticante: [Towards Data Science, Telling your data story with funnel visualizations](https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/): funil em barras para achar atrito na jornada.
- Portal de design: [Behance, Sales Conversions KPI Dashboard](https://www.behance.net/gallery/137208383/Sales-Conversions-KPI-Dashboard): projeto marcado como funil de vendas em painel de conversão.

---

### 10.3 Funil de barras centralizadas com conectores de perda

**Descrição.** Barras centralizadas em escala proporcional, ligadas por áreas translúcidas que vão da base de uma barra ao topo da seguinte. Fica no meio do caminho entre metáfora e medida.

**Anatomia.** Barra por etapa; conector de perda com a cor da barra em opacidade baixa; rótulo de etapa lateral; valor e taxa; espaçamento entre barras.

**Abordagem na stack.** `svg-puro`. Geometria: banda vertical por etapa; `x0 = cx - (v / vmax) * W / 2` e `x1 = cx + (v / vmax) * W / 2`; o conector é um polígono com os cantos inferiores da barra i e os superiores da barra i+1. Há um caminho `recharts-custom` com `Bar` empilhada e um segmento transparente de deslocamento `(vmax - v) / 2`, mas o conector precisa da geometria da barra seguinte e o segmento invisível contamina tooltip e legenda.

**Ponto delicado.**
- A centralização remove a linha de base comum; compensar com valor e taxa escritos em toda etapa.
- Na variante Recharts, o segmento de deslocamento precisa de `legendType="none"` e de tooltip customizado que o ignore.
- Etapa com valor zero vira barra de 0 px: desenhar um traço de 1 px e o rótulo "0"; o conector vira triângulo.

**Versões sugeridas.**
1. **Básico.** Comercial 2026-T3 com as cinco etapas do 10.1 e conectores em `--chart-1` a 25%.
2. **Com destaque.** O conector da maior perda absoluta (Diagnóstico para Proposta, queda de 137) em `--negative` a 35% com anotação "137 oportunidades saíram aqui".
3. **Caso limite: zero na etapa final.** Semana sem nenhum ganho: traço de 1 px, rótulo "0 ganhos" e conector em triângulo, sem esconder a etapa.

**Referências.**
- Catálogo: [AG Charts, Funnel Series](https://www.ag-grid.com/charts/javascript/funnel-series/): áreas de drop off com a cor da barra em opacidade reduzida.
- Catálogo: [nivo, Funnel](https://nivo.rocks/funnel/): observar separadores, `shapeBlending`, `interpolation` suave ou linear e o hook `useFunnel` como referência de cálculo.
- Catálogo: [Apache ECharts, issue 21302](https://github.com/apache/echarts/issues/21302): discussão de funil com altura dinâmica e `sort: 'none'`.
- Praticante: [Storytelling with Data, #SWDchallenge funnel chart](https://www.storytellingwithdata.com/blog/swdchallenge-funnel-chart): por que a centralização atrapalha a comparação.
- Portal de design: [Behance, busca "funnel chart dashboard"](https://www.behance.net/search/projects/funnel%20chart%20dashboard): página de busca, usar só para varredura de estilos de conector.

---

### 10.4 Funil com perdas por etapa

**Descrição.** Cada etapa vira uma barra dividida em "avançou", "perdido" e "em andamento"; o perdido pode ser quebrado por motivo.

**Anatomia.** Barra empilhada horizontal por etapa; segmento avançou; segmentos de perda por motivo; segmento em andamento; total da etapa; legenda de motivos; taxa de perda da etapa.

**Abordagem na stack.** `recharts-nativo` para o empilhamento: `BarChart layout="vertical"` com uma `Bar stackId="etapa"` por segmento e `LabelList` no último segmento para o total. `recharts-custom` quando o motivo precisa de rótulo interno condicionado à largura (`LabelList content` que só escreve se `width >= 48`).

**Ponto delicado.**
- Fechamento obrigatório: avançou + perdido + em andamento = volume da etapa. Em retrato de pipeline, `v(i) - v(i+1)` não é perda; sem o segmento "em andamento" o gráfico inventa perda.
- Motivos com cauda longa: no máximo 5 cores (`--chart-1..5`) e o resto em "Outros motivos". "Sem motivo registrado" sempre em neutro e separado, porque é lacuna de dado e não motivo.
- Ordem dos segmentos idêntica em todas as etapas (avançou, perdas na ordem fixa da legenda, em andamento), senão o olho não compara.

**Versões sugeridas.**
1. **Básico.** Comercial 2026-T3: cada etapa com avançou, perdido e em andamento.
2. **Com destaque.** Perdas por motivo (Sem perfil, Sem contato, Timing, Concorrência, Preço); o maior motivo de cada etapa com rótulo interno.
3. **Caso denso e real.** Pré-vendas com motivo de descarte por etapa e o alternador "apenas clientes novos" do Farol recalculando as barras.
4. **Caso limite: motivo ausente.** 38% das perdas sem motivo: segmento neutro hachurado, rótulo "sem motivo: 38%" e aviso de cobertura no cabeçalho do visual.

**Referências.**
- Catálogo: [AG Charts, Funnel Series](https://www.ag-grid.com/charts/javascript/funnel-series/): a perda como área própria entre etapas.
- Praticante: [Graphtelling, Funnel Chart Alternatives](https://graphtelling.com/blog/funnel-chart-alternatives/): queda absoluta por passo ao lado da taxa.
- Praticante: [Towards Data Science, funnel visualizations](https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/): barras para evidenciar onde o usuário sai.
- Portal de design: [Behance, Sales Conversions KPI Dashboard](https://www.behance.net/gallery/137208383/Sales-Conversions-KPI-Dashboard): composição de painel de conversão.

---

### 10.5 Funil comparativo entre períodos ou segmentos

**Descrição.** O mesmo funil para dois ou mais recortes, em barras agrupadas por etapa ou em painéis pequenos com escala comum.

**Anatomia.** Etapa no eixo; uma barra por recorte; valor; taxa de passo por recorte; delta entre recortes; legenda de recortes.

**Abordagem na stack.** `recharts-nativo` para volume (`BarChart layout="vertical"` com duas `Bar` sem `stackId`). `recharts-custom` para escrever o delta de taxa com seta (`LabelList content`). Painéis pequenos em `html-tailwind` (`grid grid-cols-2 lg:grid-cols-4`) com um `BarChart` por célula e domínio compartilhado.

**Ponto delicado.**
- Recortes de tamanho diferente (PF com 900 entradas, PJ com 280) não se comparam em volume. Oferecer alternância "volume" e "% da entrada", com o modo atual escrito no título.
- Convenção fixa de cor: período atual em `--chart-1` sólido, anterior em `--chart-1` a 45%. Em segmentos, cada segmento mantém a mesma cor em todas as telas.
- Nos painéis pequenos, domínio igual em todos; se um executivo tiver volume muito maior, normalizar em vez de soltar a escala.

**Versões sugeridas.**
1. **Básico.** Comercial 2026-T3 contra 2026-T2, barras agrupadas por etapa.
2. **Com destaque.** Delta de taxa de passo com seta e cor (`--positive` subiu, `--negative` caiu) apenas onde a variação passa de 5 pontos.
3. **Caso denso e real.** Oito executivos (Executivo A a H) em grade 4 por 2, cada painel em percentual da entrada, ordenados pela taxa final, com a mediana do time como linha de referência.
4. **Caso limite: amostra pequena.** Executivo com 7 oportunidades: painel em opacidade reduzida, taxas escondidas e aviso "menos de 10 oportunidades".

**Referências.**
- Catálogo: [Recharts, API Funnel](https://recharts.github.io/en-US/api/Funnel/): vários `Funnel` no mesmo `FunnelChart` como alternativa de comparação lado a lado.
- Catálogo: [Apache ECharts, Funnel Compare](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/funnel-align.ts): quatro séries posicionadas para comparação.
- Praticante: [Storytelling with Data, #SWDchallenge funnel chart](https://www.storytellingwithdata.com/blog/swdchallenge-funnel-chart): magnitude diferente entre topo e fundo dificulta a leitura.
- Portal de design: [Behance, busca "funnel chart dashboard"](https://www.behance.net/search/projects/funnel%20chart%20dashboard): varredura de comparativos em painéis.

---

### 10.6 Funil espelhado (borboleta)

**Descrição.** Dois funis encostados num eixo central, um para cada lado, com a mesma escala; mostra assimetria entre duas populações etapa a etapa.

**Anatomia.** Eixo central com rótulos de etapa; barras para a esquerda (recorte A) e para a direita (recorte B); valores nas pontas; taxa de passo de cada lado; título de cada lado.

**Abordagem na stack.** `recharts-custom`. `BarChart layout="vertical" stackOffset="sign"`, as duas `Bar` com o mesmo `stackId`, a série da esquerda com valores negativos, `XAxis tickFormatter={(v) => fmt(Math.abs(v))}`, `LabelList formatter` com valor absoluto e `ReferenceLine x={0}`.

**Ponto delicado.**
- O sinal negativo é artifício de desenho: tooltip, rótulos e exportação CSV precisam do valor absoluto.
- Domínio simétrico obrigatório (`domain={[-m, m]}` com `m` igual ao maior dos dois lados); com domínio automático o lado menor parece maior.
- Etapa que não existe para um dos lados deve aparecer como "não se aplica", não como zero.

**Versões sugeridas.**
1. **Básico.** Comercial, Família (PF) à esquerda e Empresa (PJ) à direita, cinco etapas.
2. **Com destaque.** A etapa em que a razão PF sobre PJ inverte recebe realce e anotação.
3. **Caso limite: etapa inexistente.** PJ não passa por "Diagnóstico": o lado direito da linha mostra "não se aplica" em `--text-muted`.

**Referências.**
- Catálogo: [Apache ECharts, Funnel Compare](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/funnel-align.ts): `funnelAlign: 'right'` e `'left'` para funis e pirâmides espelhados.
- Praticante: não localizado nesta rodada.
- Portal de design: não localizado nesta rodada.

---

### 10.7 Funil em colunas com drop off

**Descrição.** Colunas verticais decrescentes da esquerda para a direita; entre cada coluna e a seguinte, uma cunha translúcida liga o topo de uma ao topo da outra, com a taxa de passo escrita na cunha.

**Anatomia.** Coluna por etapa; cunha de perda; rótulo de etapa no eixo; valor no topo; taxa de passo dentro da cunha.

**Abordagem na stack.** `recharts-custom`. `BarChart` com `barCategoryGap={0}` e `Bar dataKey="valor" shape={ColunaComCunha}`. O `shape` recebe a banda inteira em `x, y, width, height` e o `payload`; a coluna ocupa 55% da largura e a cunha os 45% restantes. A altura do topo seguinte sai de `hProx = height * (payload.proximo / payload.valor)`, então a cunha é o polígono `(x + 0,55w, y)`, `(x + w, y + height - hProx)`, `(x + w, y + height)`, `(x + 0,55w, y + height)`. Alternativa `svg-puro` quando não precisar de eixo nem tooltip.

**Ponto delicado.**
- Com `barCategoryGap` diferente de zero, a cunha não encosta na coluna seguinte; a regra dos 55% e 45% só funciona com a banda inteira.
- A última coluna não tem `payload.proximo`: não desenhar cunha.
- Valor zero numa coluna intermediária torna `hProx` indefinido na etapa anterior a ela: tratar divisão por zero antes do desenho.

**Versões sugeridas.**
1. **Básico.** Marketing, agosto de 2026: Cliques 38.600, Leads 1.240, Leads qualificados 318, Agendas 96 (impressões ficam fora porque dominariam a escala).
2. **Com destaque.** A cunha de pior taxa em `--negative` e as demais em `--text-muted` a 20%.
3. **Caso limite: ordens de grandeza.** Incluir Impressões (2,4 milhões) esmaga as colunas finais. Solução: título "taxas de passo" com colunas em percentual e volumes nos rótulos, ou dois painéis; nunca quebra de eixo.

**Referências.**
- Catálogo: [AG Charts, Funnel Series](https://www.ag-grid.com/charts/javascript/funnel-series/): `direction: 'horizontal'` gira o funil de barras com drop off.
- Praticante: [Towards Data Science, funnel visualizations](https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/): funil em colunas passo a passo.
- Portal de design: [Behance, Sales Conversions KPI Dashboard](https://www.behance.net/gallery/137208383/Sales-Conversions-KPI-Dashboard): colunas de conversão em painel comercial.

---

### 10.8 Funil cônico contínuo

**Descrição.** Uma forma contínua, espelhada em torno de um eixo, cuja espessura em cada etapa é proporcional ao valor; a área entre etapas é a perda.

**Anatomia.** Ponto marcado por etapa; contorno superior e inferior; área preenchida; rótulo de etapa sob o eixo; tooltip com valor e taxa em relação à entrada.

**Abordagem na stack.** `recharts-custom`. `AreaChart` com duas `Area stackId="cone" type="linear"`: a de baixo com `base = (vmax - v) / 2` e `fill="transparent"`, a de cima com `v`. Isso produz uma faixa simétrica com eixo e tooltip do Recharts. Alternativa `svg-puro` com polígono de pontos `(xi, cy - hi/2)` e `(xi, cy + hi/2)`.

**Ponto delicado.**
- Etapas são discretas: `type="monotone"` inventa valores entre elas. Usar `type="linear"` e marcar os pontos.
- A série de base precisa sair do tooltip e da legenda (`legendType="none"` e tooltip filtrado).
- Etapa crescente quebra o cone (a forma abre): mesma validação de monotonicidade do 10.1.

**Versões sugeridas.**
1. **Básico.** Pré-vendas, semana 2026-W37, as seis etapas do 10.2 num cone.
2. **Com destaque.** Meta semanal como contorno tracejado sobre o cone realizado.
3. **Caso limite: etapa crescente.** Agenda realizada (260) maior que agenda marcada (248) no recorte mensal: o visual mostra o alerta "etapa maior que a anterior: janelas diferentes" e troca para barras.

**Referências.**
- Catálogo: [AG Charts, Cone Funnel](https://www.ag-grid.com/charts/gallery/simple-cone-funnel/): linha por etapa com áreas de perda; tooltip com taxa relativa à entrada.
- Catálogo: [nivo, Funnel](https://nivo.rocks/funnel/): contraste entre interpolação suave e linear.
- Praticante: [Graphtelling, Funnel Chart Alternatives](https://graphtelling.com/blog/funnel-chart-alternatives/): por que a forma que sempre afunila sugere falha em toda etapa.
- Portal de design: não localizado nesta rodada.

---

### 10.9 Funil com meta sobreposta

**Descrição.** Realizado e meta por etapa no mesmo desenho: o realizado como barra cheia, a meta como marcador ou contorno.

**Anatomia.** Barra realizada; marcador de meta; percentual de atingimento; cor por faixa de atingimento; origem da meta (histórico ou premissa).

**Abordagem na stack.** `recharts-custom`. `BarChart layout="vertical"`, `XAxis type="number" domain={[0, dominioMax]}`, `Bar dataKey="realizado" background shape={BarraComMeta}`. No `shape`, a posição da meta sai do retângulo de fundo, que o Recharts passa em `background` com `x` e `width`: `metaX = background.x + background.width * (payload.meta / dominioMax)`. Desenhar um traço vertical de 2 px em `--text-primary` e o rótulo "meta 160".

**Ponto delicado.**
- Calcular a meta pela largura da barra realizada falha quando o realizado é zero; por isso usar `background`, que existe mesmo com barra vazia, e domínio fixo.
- Meta acima do domínio precisa de seta "fora da escala", não de corte silencioso.
- Meta derivada de trás para frente (ganhos meta divididos pelas taxas históricas) e meta digitada são coisas diferentes: rotular "premissa" quando não houver medição por trás.

**Versões sugeridas.**
1. **Básico.** Diretoria, metas de 2026-T4 por etapa comercial com realizado até 2026-09-14.
2. **Com destaque.** Cor por atingimento: 100% ou mais em `--positive`, 80 a 99% em `--accent-amber`, abaixo de 80% em `--negative`.
3. **Caso denso e real.** Meta de 36 ganhos desdobrada para trás pelas taxas dos últimos quatro trimestres, mostrando quantas oportunidades faltam em cada etapa hoje.
4. **Caso limite: meta sem histórico.** Etapa criada no trimestre, sem taxa histórica: marcador vazado e rótulo "premissa, sem medição".

**Referências.**
- Catálogo: [Apache ECharts, Customized Funnel](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/funnel-customize.ts): séries "Expected" e "Actual" sobrepostas com opacidade e borda.
- Praticante: [Stephen Few, Our Irresistible Fascination with All Things Circular (2010)](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): o argumento a favor do bullet graph linear contra medidores, que é a base do marcador de meta.
- Portal de design: [Behance, busca "funnel chart dashboard"](https://www.behance.net/search/projects/funnel%20chart%20dashboard): varredura de marcadores de meta.

---

### 10.10 Funil empilhado por composição

**Descrição.** Cada etapa é uma barra dividida pelas categorias de um atributo (origem, plataforma, produto), mostrando como o mix muda ao longo do funil.

**Anatomia.** Barra por etapa; segmentos por categoria; legenda; alternância volume e 100%; categoria de lacuna ("sem origem") no fim.

**Abordagem na stack.** `recharts-nativo`. `BarChart layout="vertical"` com uma `Bar stackId="mix"` por categoria; versão 100% com `stackOffset="expand"` e eixo em percentual.

**Ponto delicado.**
- Volume e mix respondem perguntas diferentes: o absoluto mostra onde se perde; o 100% mostra quem sobrevive. Não misturar no mesmo título.
- "Sem origem" é cobertura de dado: cor neutra, sempre no fim da pilha, nunca somada a "Outros".
- Mais de 6 categorias vira ruído; agrupar a cauda.

**Versões sugeridas.**
1. **Básico.** Marketing, leads de 2026-08 por origem (Mídia social, Busca paga, Rede profissional, Orgânico, Indicação, Evento, Sem origem) do lead ao ganho, em volume.
2. **Com destaque.** Versão 100%: Indicação vai de 6% das entradas para 41% dos ganhos, com anotação.
3. **Caso limite: viés de preenchimento.** 28% sem origem na entrada caem para 3% no ganho: aviso de que quem avança tende a ter cadastro mais completo, então o mix do fundo não é comparável ao do topo.

**Referências.**
- Catálogo: [FT Visual Vocabulary](https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary): barras empilhadas e proporcionais na categoria parte do todo.
- Praticante: [Datawrapper, A friendly guide to choosing a chart type](https://www.datawrapper.de/blog/chart-types-guide): barras empilhadas como alternativa mais legível para partes.
- Praticante: [Towards Data Science, funnel visualizations](https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/): o funil em rosca só aguenta dois ou três grupos, argumento para barras.
- Portal de design: [Behance, busca "funnel chart dashboard"](https://www.behance.net/search/projects/funnel%20chart%20dashboard): varredura de composições.

---

### 10.11 Funil em cartões de etapa

**Descrição.** Sequência horizontal de cartões KPI, um por etapa, ligados por setas e chips de conversão. Sem codificação de área, os números fazem o trabalho; uma microbarra dentro de cada cartão dá a proporção.

**Anatomia.** Cartão com valor, rótulo e microbarra; chip de taxa entre cartões; seta; variação contra o período anterior; métricas de custo quando for Marketing.

**Abordagem na stack.** `html-tailwind`. `grid grid-cols-1 sm:grid-cols-5 gap-3`; cartão `rounded-lg bg-[var(--surface-raised)] border border-[var(--border)]`; microbarra `h-1 rounded bg-[var(--accent-cyan)]` com largura em percentual da primeira etapa; chip com `ChevronRight` do lucide, que vira `ChevronDown` quando o grid empilha.

**Ponto delicado.**
- Em 400 px os cartões empilham: a seta muda de direção e o chip vai para baixo do cartão.
- Números com `tabular-nums` para as casas alinharem.
- Sem a microbarra o leitor perde a magnitude; sem o valor absoluto a microbarra engana.

**Versões sugeridas.**
1. **Básico.** Topo da página de Marketing: Impressões 2,4 mi, Cliques 38,6 mil, Leads 1.240, Qualificados 318, com CPL R$ 96 e CPL qualificado R$ 374.
2. **Com destaque.** Chip em `--negative` no passo que piorou contra o mês anterior, com tooltip do delta.
3. **Caso limite: sem medição.** Plataforma sem evento de conversão configurado: cartão "Leads" com traço e "sem medição"; taxas vizinhas "n/d".

**Referências.**
- Catálogo: [AG Charts, Cone Funnel](https://www.ag-grid.com/charts/gallery/simple-cone-funnel/): o tooltip que combina valor absoluto e taxa sobre a entrada.
- Praticante: [Graphtelling, Funnel Chart Alternatives](https://graphtelling.com/blog/funnel-chart-alternatives/): taxa de passo como número principal.
- Portal de design: [Behance, Sales Conversions KPI Dashboard](https://www.behance.net/gallery/137208383/Sales-Conversions-KPI-Dashboard): faixa de KPIs de conversão.
- Portal de design: [Behance, Style Guidelines for data visualisation: dark & light](https://www.behance.net/gallery/82482589/Style-Guidelines-for-data-visualisation-dark-light): tratamento de cartões e funil em tema escuro.

---

### 10.12 Funil com tempo e SLA entre etapas

**Descrição.** Etapas como marcos, com o tempo mediano (e o p90) de passagem escrito nos conectores e colorido pelo SLA.

**Anatomia.** Marco por etapa com volume; conector com mediana e p90; cor do conector pela faixa de SLA; contagem "passaram / ainda na etapa"; unidade de tempo (horas úteis ou corridas).

**Abordagem na stack.** `html-tailwind` com SVG inline mínimo para os conectores; `svg-puro` quando os conectores tiverem comprimento proporcional ao tempo.

**Ponto delicado.**
- Censura: a mediana calculada só com quem já passou ignora quem está parado na etapa e sai otimista. Mostrar "n que passou / n ainda na etapa" ao lado.
- SLA em horas úteis e em horas corridas dão cores diferentes; a unidade vai no rótulo.
- Conector com comprimento proporcional ao tempo só funciona se todos os tempos estiverem na mesma unidade.

**Versões sugeridas.**
1. **Básico.** Pré-vendas: Entrada para primeira tentativa, mediana 38 min (SLA 1 h útil); Conexão para agenda marcada, mediana 2,1 dias.
2. **Com destaque.** p90 da primeira tentativa em 5 h, fora do SLA: conector em `--negative` com o p90 em destaque.
3. **Caso limite: etapa sem passagem.** Nenhum handoff aceito na semana: conector neutro "sem passagens no período", sem mediana.

**Referências.**
- Catálogo: [nivo, Funnel](https://nivo.rocks/funnel/): separadores antes e depois de cada parte, espaço natural para anotar a passagem.
- Catálogo: [AG Charts, Funnel Series](https://www.ag-grid.com/charts/javascript/funnel-series/): `stageLabel` com posição e formatação próprias.
- Praticante: não localizado nesta rodada.
- Portal de design: não localizado nesta rodada.

---

## 4. Modelos que moram melhor em outra família

| Modelo | Família sugerida | Motivo |
|---|---|---|
| Pirâmide proporcional (altura proporcional ao valor, como a série pyramid do AG Charts ou o `sort: 'ascending'` do ECharts) | 22_unidades-waffle-e-pictograma ou 02_barras-horizontais | Sem ordem de processo, é parte do todo |
| Funil de área quadrada (alternativa preferida no SWD) | 22_unidades-waffle-e-pictograma | Codifica por área em grade |
| Funil em rosca | 07_rosca-e-radial | Codificação angular |
| Funil em Sankey (caminhos não lineares) | 11_fluxo-sankey | Ramificação e fusão de caminhos |
| Cascata de perdas (entrada menos perdas até ganhos) | 19_cascata-waterfall | Degraus de soma e subtração |
| Taxa de conversão de passo ao longo do tempo | 04_linhas | Série temporal |
| Coorte de conversão (safra de entrada por etapa alcançada) | 15_mapa-de-calor-e-calendario | Matriz de células |
| Barra de progresso de meta única | 13_progresso-meta-e-gauge | Uma medida contra um alvo |

---

## 5. Fontes consultadas

Abertas nesta pesquisa:
- https://recharts.github.io/en-US/api/Funnel/
- https://recharts-recharts.mintlify.app/examples/funnel-chart
- https://nivo.rocks/funnel/
- https://www.ag-grid.com/charts/javascript/funnel-series/
- https://www.ag-grid.com/charts/gallery/simple-cone-funnel/
- https://www.ag-grid.com/charts/javascript/pyramid-series/
- https://www.highcharts.com/demo/highcharts/funnel (página abriu, demo renderizada por JavaScript e sem texto útil)
- https://jsfiddle.net/gh/get/library/pure/highcharts/highcharts/tree/master/samples/highcharts/demo/funnel/
- https://github.com/apache/echarts/issues/21302
- https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/funnel-align.ts
- https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/funnel-customize.ts
- https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary (sem funil no vocabulário; fluxo e parte do todo)
- https://www.storytellingwithdata.com/blog/swdchallenge-funnel-chart
- https://graphtelling.com/blog/funnel-chart-alternatives/
- https://towardsdatascience.com/telling-your-data-story-with-funnel-visualizations-1bea6d0f64df/
- https://www.datawrapper.de/blog/chart-types-guide (não trata funil)
- https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf
- https://ui.shadcn.com/charts (não tem funil; só área, barra, linha, pizza, radar e radial)
- https://www.behance.net/search/projects/funnel%20chart%20dashboard
- https://www.behance.net/gallery/137208383/Sales-Conversions-KPI-Dashboard
- https://www.behance.net/gallery/82482589/Style-Guidelines-for-data-visualisation-dark-light
- Tipagem local: `app/node_modules/recharts/types/cartesian/Funnel.d.ts`, `cartesian/Bar.d.ts` e `index.d.ts` (Recharts 3.10.1)

Apareceram em busca e não abriram:
- https://datavizproject.com/data-type/funnel-chart/ (não abriu, 403)
- https://www.effectivedatastorytelling.com/post/measurement-over-metaphor-rethinking-the-conversion-funnel (não abriu, domínio bloqueado para o coletor)
- https://github.com/recharts/recharts/issues/925 (não abriu)
