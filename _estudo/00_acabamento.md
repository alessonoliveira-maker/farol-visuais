# Acabamento: o que separa um dashboard de alto nível da média

> Estudo do catálogo VISUAIS do Farol, feito em 2026-09-14. Estudo de referência: não é especificação e não entra no build.
> Stack alvo: React 18.3 + TypeScript strict + Recharts 3.10 + Tailwind 4 + lucide-react. Nada de d3, nivo, visx, echarts ou similares; o que o Recharts não faz vira SVG puro em React com geometria calculada em TypeScript, ou HTML com Tailwind.
> Todos os exemplos são fictícios. Sistemas de design, publicações e produtos aparecem só como **fonte**; nenhum entra na identidade do Farol. Nomes de designers, de clientes e contatos das páginas de portfólio foram omitidos; os slugs das URLs ficam como estão.

## Resumo em cinco regras

Se só der para aplicar cinco coisas, são estas (detalhe e fonte na seção 2):

1. **Nenhum número sozinho.** Todo KPI traz comparação explícita (meta, período anterior ou faixa), com delta que tem sinal, ícone e base nomeada ("+12% vs. mês anterior"). Cor nunca é o único portador do bom e do ruim.
2. **Cinza por padrão, uma cor de destaque, cor fixa por série.** A cor sai de token com valor para claro e para escuro; a paleta semântica (bom, ruim, proveniência) é separada da categórica; marca de dado com 3:1 contra o card e texto com 4,5:1.
3. **Texto que lê o gráfico pelo usuário.** Título com a conclusão, subtítulo com medida, recorte e período, rótulo direto no lugar da legenda, texto sempre horizontal, algarismos tabulares e precisão na medida da decisão (R$ 7 mi, não R$ 7.018.596,00).
4. **Codificação honesta, eixos calmos.** Barra e área começam em zero; grade só horizontal e rala; linha do zero mais forte que a grade; lacuna de dado quebra a linha; nada de eixo duplo; projeção tracejada na mesma cor do realizado.
5. **Estados desenhados como telas de verdade.** Esqueleto com a forma e a altura do card; vazio que substitui o gráfico e diz por que e o que fazer; "indisponível" e LACUNA com texto distinto de "zero".

---

## Como ler este documento

**Marcação de cada link:**

| Marca | Significado |
|---|---|
| **[aberto]** | Página aberta e lida nesta pesquisa. |
| **[PDF]** | PDF baixado nesta pesquisa; o texto foi extraído do arquivo. |
| **[aberto via leitor]** | O acesso direto veio vazio (página renderizada no navegador) ou com HTTP 403; o mesmo endereço foi lido pelo leitor `r.jina.ai`. |
| **[repositório]** | O site abriu truncado no leitor; o texto foi lido na fonte do próprio site no GitHub, pela API. |
| **(não abriu)** | Tentei abrir e não carregou (verificação humana ou 403). O link vem da varredura irmã [00_portais-de-design.md](00_portais-de-design.md), onde apareceu em resultado de busca. |

**Limites desta pesquisa, ditos às claras:**

* A cota de buscas da sessão (200 buscas) já estava esgotada quando este estudo começou. A descoberta foi feita por endereço canônico das fontes pedidas, pelos links da varredura irmã e pela busca interna de um dos sites. Endereço que devolveu 404 não entrou no documento.
* **Não consegui ler:** o guia de gráficos do Salesforce Lightning (a página responde só com a moldura, também pelo leitor), a página pública do Polaris Viz (404; li o repositório, que está descontinuado), o artigo de modo escuro do Datawrapper (não achei o endereço), a notação de cenários do IBCS (a página aberta é só a visão geral) e as páginas do Dribbble (verificação humana, também pelo leitor).
* Na seção 2.2 há uma **auditoria dos tokens de cor do próprio Farol** (`app/src/styles/tokens.css`), calculada por script nesta sessão. O método está descrito lá.

---

## 1. Princípios, com fonte

| # | Princípio | O que muda na tela | Fonte |
|---|---|---|---|
| P1 | **Número precisa de contexto.** "R$ 736 mil no trimestre" não diz se é bom. | Todo KPI ganha meta, histórico ou faixa qualitativa ao lado; o bullet graph existe para isso. | Few, Common Pitfalls #2; Few, Bullet Graph Spec; Nightingale, Dashboard Psychology ("two numbers side by side") |
| P2 | **Hierarquia antes de estética.** O olho deve ir primeiro ao que mais importa. | O mais importante no topo à esquerda, seguindo o padrão de leitura em F ou Z; logo e navegação recuam. | Carbon, Dashboards; ONS, Dashboards; Few, Pitfalls #9 e #10 |
| P3 | **Tinta para o dado, não para a moldura.** | Eixo, grade, borda e fundo aparecem "só o suficiente para cumprir o papel". Sem 3D, sombra, textura ou fundo decorado. | Tufte, sparklines ("max[data], min[design]"); Few, Practical Rules for Color, regra 7 e 9; Few, Pitfalls #11 |
| P4 | **Cor é sinal.** Cor diferente sugere significado diferente. | Cinza para contexto, uma cor para destaque; cor distinta só quando a diferença existe no dado. | Few, Rules for Color, regras 3, 4 e 5; Datawrapper, Colors, regra 4; Atlassian (Do: "single color as the default") |
| P5 | **Consistência vence variedade.** | Mesma pergunta, mesmo tipo de gráfico; mesma série, mesma cor em todo o dashboard; legendas sempre na mesma posição. | Few, Pitfalls #6; Carbon, Dashboards ("Consistency is key"); Datawrapper, Colors, regra 2; Nightingale, Dashboard Redesign |
| P6 | **Precisão na medida da decisão.** | Card mostra R$ 3,8 mi, não R$ 3.848.305,93; tabela de detalhe pode mostrar mais. | Few, Pitfalls #3; Datawrapper, Text ("12.8k" em vez de "12,831") |
| P7 | **Mostre a medida que a pessoa quer, não os insumos dela.** | Se a pergunta é "quanto falta para a meta", exiba a variação (−10%), não dois números para subtrair de cabeça. | Few, Pitfalls #4 |
| P8 | **Codificação honesta.** O comprimento da barra é o dado. | Barra e área em zero; linha e dispersão podem recortar o eixo; nunca interpolar lacuna. | Carbon, Axes and labels; ONS, Axes and gridlines; Analysis Function; Material |
| P9 | **Rotule perto do dado.** Legenda obriga ida e volta. | Rótulo direto sempre que couber; legenda só quando não couber. | Carbon, Legends; Urban Institute; Datawrapper, Text; Analysis Function |
| P10 | **O título conta a conclusão.** | Título afirmativo e curto; subtítulo com medida, recorte e período. | Urban Institute ("active, concise titles"); ONS, Chart text; Datawrapper ("main statement first") |
| P11 | **A mensagem não pode depender de interação.** | Tooltip complementa; o valor que importa já está visível. Animação nunca é o único caminho. | ONS, Interactive charts and animations |
| P12 | **Cor nunca sozinha.** | Todo estado ou categoria tem também texto, ícone, forma ou textura. | WCAG 2.2, SC 1.4.1; Material; Atlassian; Carbon, Legends (textura) |

---

## 2. Regras concretas de acabamento

Cada regra tem código para ser citada em revisão de PR. **(Farol)** marca proposta deste estudo, derivada das fontes mas não escrita por elas.

### 2.1 Tipografia numérica e hierarquia

* **T1. Algarismos tabulares em todo número.** Card, tabela, tick de eixo e tooltip usam `tabular-nums` (Tailwind: `font-variant-numeric: tabular-nums`). A propriedade é herdada, então `className="tabular-nums"` no contêiner do gráfico chega aos `<text>` do SVG do Recharts. Sem isso, números que atualizam "dançam" e colunas não alinham. (Tailwind, font-variant-numeric; Farol)
* **T2. Dois níveis de texto no gráfico, bem distintos.** O Datawrapper recomenda só dois níveis claramente diferentes, "como 12px cinza e 14px preto". O Urban Institute, para web, usa título 20px, subtítulo 16px, eixo e rótulo de dado 12px, legenda 14px e fonte/nota 11px. Proposta para card do Farol: **KPI 28 a 32px semibold**; título do card 14px medium em `--text-primary`; subtítulo, unidade e legenda 12px em `--text-secondary`; tick 11 a 12px em `--text-muted`; nota e fonte 11px em `--text-muted`. (Datawrapper, Text; Urban; Farol)
* **T3. Negrito em um ou dois elementos por card, não mais.** Negrito em tudo apaga a hierarquia. (Material, Data visualization)
* **T4. KPI é número mais descrição curta.** "15,250 browsers", "$1.3M revenue" no exemplo do Carbon; no Farol, "R$ 7 mi receita reconhecida". (Carbon, Chart anatomy)
* **T5. Formatação compacta em pt-BR com `Intl.NumberFormat`.** Conferido nesta sessão no Node: `new Intl.NumberFormat('pt-BR', { notation: 'compact', maximumFractionDigits: 1 })` devolve `7 mi`, `7,5 mi`, `12,8 mil`, `1,2 bi`; com `style: 'currency', currency: 'BRL'` devolve `R$ 7 mi`; percentual com `signDisplay: 'exceptZero'` devolve `-10%` e `+12%`. **O sinal de menos sai como hífen (U+002D)**; troque por menos tipográfico `−` (U+2212) no formatador para alinhar com o `+` e não confundir com traço. (Farol, verificado)
* **T6. Precisão:** card com 2 ou 3 algarismos significativos; percentual inteiro, salvo quando a decisão mora na casa decimal (taxa de conversão de 1,8% contra 2,1%). (Few, Pitfalls #3; Datawrapper, Text)
* **T7. Unidade em todo lugar onde o número aparece:** eixo, tooltip, anotação. Símbolos `%` e `R$` vão no próprio rótulo do eixo, não só no título. (Datawrapper, Text; ONS, Chart text)
* **T8. Números alinhados à direita** em tabela e nos ticks do eixo Y, "unidades sobre unidades". (Analysis Function)
* **T9. Texto sempre horizontal.** Nunca girar rótulo de eixo. Se não cabe: abreviar, reduzir ticks ou trocar coluna por barra horizontal. (Analysis Function; Material)
* **T10. Rótulo de marco temporal** (virada de mês ou de ano no eixo) em seminegrito. (Carbon, Axes and labels)
* **T11. Título com até 15 palavras**, afirmativo, com a conclusão; subtítulo na ordem "medida, recorte, período" com o período por extenso. Exemplo fictício: título "Pré-vendas passou do teto em três das quatro semanas"; subtítulo "Entradas por semana contra o teto da fila, todas as origens, 2026-08-03 a 2026-08-30". (ONS, Chart text; Urban)
* **T12. Alinhamento à esquerda** para título, subtítulo e nota; texto centralizado cria vãos irregulares. (Datawrapper, Text)

### 2.2 Cor e paletas para tema escuro e claro

**Regras**

* **C1. Neutro por padrão, uma cor de destaque.** Série de contexto em cinza (`--text-muted` ou um neutro próprio de série); a série que carrega a mensagem em cor. (Few, Rules for Color, regra 5; Datawrapper, Colors, regra 4; Atlassian)
* **C2. Teto de cores por gráfico: 5 a 6.** Acima disso, agrupe em "Outros" ou troque o tipo de gráfico. O Datawrapper tolera até 7. (Atlassian; Datawrapper, Colors, regra 1; Nightingale, Tips: 6 a 7 por dashboard)
* **C3. Paleta categórica em ordem fixa, e a cor pertence à série, não à posição.** Mapeie por chave (`Record<SerieKey, string>` apontando para `var(--chart-n)`), nunca pelo índice do array: filtrar uma série não pode recolorir as outras. O `ChartConfig` do shadcn é desacoplado dos dados justamente para isso. (Carbon, Color palettes; Atlassian, "Follow the numbered sequence"; shadcn, Chart)
* **C4. Sequencial = um matiz variando luminosidade.** Em tema claro, o mais escuro é o maior valor; **em tema escuro, o mais claro é o maior valor**. Nunca use gradiente no lugar de paleta sequencial. (Carbon, Color palettes; Few, Rules for Color, regra 6; Datawrapper, Colors, regras 8 a 10)
* **C5. Divergente = dois matizes com centro cinza claro** no valor de referência (meta, zero, média). O Carbon observa que as divergentes não mudam entre temas. (Datawrapper, Colors, regra 11; Carbon)
* **C6. Tema escuro não é preto.** Superfície em cinza escuro (o Material usa `#121212`), elevação por superfície mais clara (sobreposição branca de 0% a 16%), cores **dessaturadas** (saturada vibra contra fundo escuro e não passa 4,5:1 em texto) e texto em três ênfases (87%, 60% e 38% de opacidade). O Farol já segue a lógica: `--surface-canvas #0b1220`, `--surface-raised #121c2e`, `--surface-overlay #18243a`. (Material, Dark theme)
* **C7. Todo token de cor tem valor para cada tema.** Série, semântica e sequencial trocam de hex entre claro e escuro; a regra do shadcn é declarar `--chart-1` em `:root` e sobrescrever no tema escuro, e referenciar `var(--chart-1)` (no Recharts 3, sem envolver em `hsl()`). (shadcn, Chart; Atlassian: "Each token maps to a different value for each theme")
* **C8. Monte escalas em espaço perceptual, não em HSL.** Em HSL, amarelo e azul com a mesma "luminosidade" parecem diferentes. Com escala em CIELAB, LCH ou OKLCH dá para garantir contraste por distância de degraus: no sistema descrito pela fonte, **cinco degraus de distância garantem 4,5:1 e quatro garantem 3:1**, sem conferir caso a caso. (Stripe, Accessible color systems; Linear, UI redesign em LCH; shadcn usa `oklch`)
* **C9. Cor semântica segue a polaridade da métrica, não o sinal.** Receita subindo é bom; CPL subindo é ruim. No bullet graph de despesa, Few inverte a ordem das faixas. (Few, Bullet Graph Spec)
* **C10. Paleta de status separada da categórica.** Vermelho, laranja, amarelo e verde para estado; série de dado nunca usa exatamente o hex de um estado. (Carbon, Alert palette; Atlassian, tokens `color.chart.success` etc. separados de `color.chart.categorical.*`)
* **C11. Nunca vermelho e verde como única distinção.** Cerca de 10% dos homens e 1% das mulheres têm alguma deficiência de cor, segundo Few. (Few, Rules for Color, regra 8; Few, Pitfalls #12; Datawrapper, Colors, regra 5)
* **C12. Nada de gradiente em fundo, barra ou card.** O fundo precisa ser uniforme para que a mesma cor pareça a mesma em todo o gráfico. (Few, Rules for Color, regra 1; Carbon, Gradient use)
* **C13. Coisa fina ou pequena pede cor mais forte ou marca maior.** Linha de 1px e ponto pequeno em tom médio somem; engrosse para `strokeWidth={2}` ou use o tom mais saturado da série. (Few, Rules for Color, regra 5)

**Auditoria dos tokens do Farol** (`app/src/styles/tokens.css`, blocos `[data-theme='dark']` e `[data-theme='light']`)

Método: contraste pela fórmula da WCAG; L\* e ΔE76 em CIELAB (D65); simulação de deuteranopia e protanopia com as matrizes de Machado, Oliveira e Fernandes (2009) em severidade 1, aplicadas em RGB linear. Script temporário no scratchpad da sessão, não versionado. **O limiar "ΔE76 abaixo de 10 é difícil de separar em marca pequena" é heurística deste estudo**, não regra de fonte; confirme num simulador antes de alterar token.

| Tema | Verificação | Resultado | Leitura |
|---|---|---|---|
| Escuro | `--chart-1` a `--chart-8` contra `--surface-raised` | 5,90:1 a 9,50:1 (contra `--surface-overlay`: 5,38:1 a 8,65:1) | Passam os 3:1 da WCAG 1.4.11 com folga. |
| Escuro | `--chart-3` `#7c9cf8` contra `--chart-7` `#9a8bf5` | ΔE76 16,5 na visão típica; **1,5 em deuteranopia**; ΔL\* 2,3 | Para quem tem deuteranopia são a mesma cor. |
| Escuro | `--chart-1` contra `--chart-8` | ΔE76 20,3; 9,4 em deuteranopia | Próximos. |
| Escuro | `--positive` contra `--negative` | ΔE76 104,3; **11,4 em deuteranopia**; ΔL\* 9,1 | Verde e vermelho quase se fundem; o delta precisa de sinal e ícone. |
| Escuro | `--prov-derivado` contra `--prov-prototipo` | mesmo par de chart-3 e chart-7 (1,5 em deuteranopia) | A etiqueta de proveniência não pode depender da cor. |
| Escuro | `--seq-1`, `--seq-2`, `--seq-3` contra o card | 1,14:1; 1,58:1; 2,29:1 | Os três degraus baixos se confundem com o card. |
| Escuro | `--line-subtle` / `--line-strong` contra o card | 1,25:1 / 1,79:1 | Serve para grade (não essencial); linha do zero pede `--line-strong` ou mais. |
| Escuro | `--control-border` | 3,41:1 | Passa 3:1 para contorno de controle e anel de foco. |
| Escuro | `--text-muted` | 5,21:1 no card; 4,75:1 no overlay | Passa 4,5:1; é o piso, não escurecer mais. |
| Claro | `--chart-1` a `--chart-8` contra `#ffffff` | 4,50:1 (`--chart-8`) a 6,72:1 | Passam 3:1; chart-8 é o mais fraco. |
| Claro | `--chart-1` `#0b6d7d` contra `--chart-8` `#3d7f95` | **ΔE76 9,7 na visão típica** | Parecidos até sem daltonismo. |
| Claro | `--chart-3` contra `--chart-7`; `--chart-2` contra `--chart-6` | 1,2 e 4,1 em deuteranopia | Mesmo problema do escuro, mais um par. |
| Claro | L\* das oito séries | 38,9 a 49,9 | Luminosidade quase igual: sob daltonismo só resta o matiz. |
| Claro | `--seq-1` a `--seq-4` contra o card | 1,21:1 a 2,60:1 | Idem ao escuro. |
| Ambos | Reuso de hex | `--chart-2` = `--warning` = `--prov-premissa`; `--chart-4` = `--positive` = `--prov-medido`; `--chart-3` = `--info` = `--prov-derivado`; `--chart-7` = `--prov-prototipo` | Série pintada em chart-4 ao lado de uma etiqueta MEDIDO sugere relação que não existe (fere C10). |

**O que fazer com isso (Farol):**

* **C14.** Num mesmo gráfico, use no máximo `--chart-1` a `--chart-6`; `--chart-7` e `--chart-8` só com rótulo direto em cada série.
* **C15.** Card que exibe etiqueta de proveniência pinta as séries em neutro mais um destaque, sem cor semântica; a etiqueta sempre traz o texto (MEDIDO, PREMISSA, DERIVADO, LACUNA), nunca só a bolinha.
* **C16.** Delta sempre com sinal (`+`/`−`) e ícone lucide (`TrendingUp`/`TrendingDown` ou `ArrowUpRight`/`ArrowDownRight`), além da cor.
* **C17.** Mapa de calor: o degrau mais baixo pode recuar (é o menor valor, e a WCAG isenta a marca quando o valor está escrito na célula), mas **"sem dado" nunca usa `--seq-1`**: vira célula vazia com contorno `--line-subtle` ou hachura, e a legenda diz o que é.
* **C18.** Se a paleta for revista, alterne luminosidade na ordem categórica para que vizinhos difiram também em L\*, não só em matiz; é o que sobra para quem não distingue matiz.

### 2.3 Contraste

* **K1. Marca de dado necessária para entender o gráfico: 3:1 contra a cor adjacente.** Linhas precisam de 3:1 contra o fundo, mas não entre si. Se o valor está escrito sobre a marca (rótulo de dado), a marca fica isenta. (WCAG 2.2, SC 1.4.11)
* **K2. Texto de tick, rótulo e nota: 4,5:1.** O Datawrapper fala em 4:1 para texto pequeno e 2,5:1 para grande; o Farol adota o piso da WCAG. (WCAG; Material, Dark theme; Datawrapper, Colors, regra 5)
* **K3. Segmentos vizinhos que não contrastam entre si** (pilha, rosca, barras coladas) ganham separador na cor da superfície: `stroke="var(--surface-raised)"` com `strokeWidth={1}` a `{2}`. As cores de gráfico do Atlassian passam 3:1 contra a superfície "mas não entre si", e a correção prescrita é espaço ou borda. O Analysis Function pede borda branca entre fatias. (Atlassian; Analysis Function)
* **K4. Anel de foco com 3:1** contra o fundo, em legenda clicável, barra clicável e controles do card. No Farol, `--control-border` passa. (WCAG 2.2, SC 1.4.11)
* **K5. Texto sobre célula colorida escolhe cor pela luminância da célula.** Few mostra um mapa de calor em que os valores mais importantes (vermelho e verde escuros) são os mais difíceis de ler, porque o texto preto não contrasta com o fundo escuro. Calcule a luminância em TypeScript e escolha `--text-primary` ou o token `-contrast`. (Few, Rules for Color)
* **K6. Teste de contraste é por tema.** O mesmo componente passa no escuro e falha no claro (ver `--chart-8`). Rode a verificação nos dois blocos de token. (Farol)

### 2.4 Grid e eixos

* **G1. Barra e área começam em zero.** Linha e dispersão podem recortar; ao recortar, deixe respiro entre o início do eixo e o menor ponto (a ONS sugere algo entre um quarto e um terço). Se a escala de uma barra precisa começar acima de zero, troque a barra por ponto. (Carbon, Axes and labels; ONS, Axes and gridlines; Few, Bullet Graph Spec)
* **G2. Grade só na direção da leitura do valor.** Colunas e linhas: grade horizontal (`<CartesianGrid vertical={false} />`, padrão do shadcn); barras horizontais: grade vertical tênue ou nenhuma. (shadcn, Chart)
* **G3. Quantidade de linhas de grade.** A ONS pede 6 a 10 no desktop e 3 a 6 no celular; o Analysis Function limita a 10. Um card de dashboard com 200 a 280px de altura está mais perto do celular: **3 a 5 linhas**. (ONS; Analysis Function; Farol)
* **G4. Intervalos redondos** (0, 5, 10, 15). Calcule o domínio "arredondado" em TypeScript e passe `domain` e `ticks` explícitos; `allowDecimals={false}` em contagem. O eixo termina na próxima linha de grade depois do maior valor. (ONS)
* **G5. Linha do zero mais forte que a grade:** `<ReferenceLine y={0} stroke="var(--line-strong)" />`. Com valores negativos, pelo menos uma linha de grade abaixo e uma acima do zero. (ONS)
* **G6. Sem linha de eixo nem marca de tick quando há grade:** `tickLine={false}`, `axisLine={false}`, `tickMargin={8}` a `{10}`. (shadcn, Chart)
* **G7. Lacuna de dado nunca é interpolada.** Valor ausente vai como `null` com `connectNulls={false}`; o intervalo sem dado é marcado no início e no fim (`ReferenceArea` com texto "sem dado"). (Carbon, Axes and labels, Gaps in data)
* **G8. Incremento de tempo constante.** Se precisar comprimir, a quebra de eixo é visível (o Carbon usa 16px de quebra). (Carbon)
* **G9. Sem eixo duplo.** Dois gráficos empilhados com o mesmo eixo X e o mesmo `syncId`, que sincroniza tooltip e brush no Recharts. (ONS; Analysis Function; Recharts, BarChart)
* **G10. Escala compartilhada quando os gráficos vão ser comparados** (um card por executivo, lado a lado). Domínio calculado sobre o conjunto, não por card. (Few, Best Practices for Scaling Sparklines; Nightingale, Dashboard Redesign)
* **G11. Realizado sólido, projeção tracejada, mesma cor.** Muda a textura da linha, não a cor: `strokeDasharray="4 4"` na série de forecast. Few sugere a projeção como segmento adicional do bullet graph. (Material: "Vary a line's texture to represent different data types"; Few, Bullet Graph Spec, Optional features)
* **G12. Período corrente incompleto** (o mês ainda aberto) é marcado: último segmento tracejado ou ponto vazado, com nota "parcial até YYYY-MM-DD". (Farol, aplicando G11)
* **G13. Largura da coluna alinhada entre cards da mesma coluna do grid:** `YAxis width` fixo (por exemplo 48) e `margin` explícito no gráfico. O padrão do Recharts é `margin` de 5 em cada lado e `barCategoryGap` de `"10%"`, apertado para card; ver D6. (Recharts, BarChart; Farol)

### 2.5 Rótulo direto contra legenda

* **L1. Uma série: sem legenda.** O título já diz o que é. (Carbon, Legends)
* **L2. Até umas quatro séries em linha: rótulo no fim de cada linha.** Custom `label` no `<Line>` que só desenha no último índice, ou `LabelList` filtrado. Rótulo em texto neutro escuro ou claro com marcador na cor da série; texto colorido perde contraste. (Datawrapper, Text; Urban; Analysis Function: "Use black or dark grey text for labels")
* **L3. Barras: nome junto da barra, valor na ponta.** Com o valor escrito, eixo de valor e grade podem sair. (Urban: "omit y-axis labels and gridlines" quando há rótulo de dado)
* **L4. Quando precisar de legenda:** no topo, logo abaixo do título, na mesma ordem visual das séries; até duas linhas, com "ver mais"; nunca mais alta que 30% da altura do gráfico. (Urban: "stretched across the top"; Carbon, Legends: topo ou base em dashboard, duas linhas, 30%)
* **L5. Legenda interativa:** hover numa entrada reduz as outras séries a 30% de opacidade; clique isola a série e marca a entrada como selecionada; com todas selecionadas, volta ao padrão. (Carbon, Legends)
* **L6. Sem siglas** em legenda, título e eixo. (Carbon, Legends)
* **L7. Rosca e pizza, quando couberem:** até 5 categorias, ordenadas por tamanho a partir de 12 horas, rótulo em porcentagem; fatia abaixo de 3 graus usa chamada com linha; o Carbon nem desenha fatia abaixo de 1 grau, então o Farol agrupa em "Outros" antes. Número grande no centro da rosca é o total. (Analysis Function; Carbon, Chart anatomy)
* **L8. Mobile:** o Material põe a legenda abaixo no desktop e acima no celular, para ficar visível durante a interação. Esconder legenda só com uma série. (Material; Carbon, Hidden legends)

### 2.6 Anotação

* **A1. Anote o que muda a leitura:** meta, teto, mudança de regra, evento, pico, vale, lacuna. (Carbon, Dashboards; Urban: "one of the most important ways to improve your data communication")
* **A2. Curta:** cerca de 50 caracteres (10 a 12 palavras), uma frase. (ONS, Annotations)
* **A3. Perto do dado, com respiro, sem cobrir marca.** (ONS; Carbon: "Avoid annotations that obstruct the view of data")
* **A4. Meta e teto como `ReferenceLine` com rótulo, e `ifOverflow="extendDomain"`.** O padrão do Recharts é `"discard"`: **se a meta estiver acima do maior valor, a linha simplesmente não aparece**. Rótulo com `position` explícita e texto em `--text-secondary`. (Recharts, ReferenceLine)
* **A5. Período ou intervalo como faixa** (`ReferenceArea`) em opacidade baixa, sempre com texto explicando. (ONS; Datawrapper, Area chart: faixa semitransparente para chamar atenção a um período)
* **A6. Informação essencial da anotação também aparece no texto** do card ou na nota. (ONS)
* **A7. Proveniência é anotação de primeira classe:** a etiqueta (MEDIDO, PREMISSA, DERIVADO, LACUNA) fica colada ao número que qualifica, não num rodapé. A varredura irmã não achou precedente disso em portal de design; é desenho do Farol. (Farol)
* **A8. Benchmark responde "preciso me preocupar com isso?"** Faixa de normalidade ou referência explícita permite priorizar sem ler cada número. (Nightingale, Dashboard Psychology)

### 2.7 Densidade e espaçamento

* **D1. O essencial acima da dobra.** Few defende tudo numa tela; a ONS aceita rolagem desde que o mais importante esteja visível. Síntese: faixa de KPIs e o gráfico principal sem rolar; detalhe abaixo. (Few, Pitfalls #1; ONS, Dashboards)
* **D2. Ver o todo, focar, descer ao detalhe.** O dashboard mostra o panorama e sinaliza o que pede atenção; o detalhe vem por link ou drill. Métrica não essencial sai da primeira tela. (Few, Pitfalls, introdução; Carbon, "Limit the number of metrics")
* **D3. Espaço separa grupos; borda pesada não.** Borda forte em elemento que não é dado rouba atenção. (Carbon, "Use white space"; Few, Pitfalls #10)
* **D4. Grid uniforme:** todos os cards com o mesmo padding, raio, posição de título e de legenda. (Carbon, Exploration dashboard)
* **D5. Escala de espaçamento de 4px (Farol):** padding de card 16 a 20px; gap entre cards 16px; título a gráfico 12px; KPI a delta 4px. Relacionados ficam juntos (KPI ao lado da própria série histórica, não do outro lado da tela). (Farol; Few, Pitfalls #9)
* **D6. Barras respiram.** Troque o `barCategoryGap` padrão de `"10%"` por algo entre `"30%"` e `"40%"`; limite a espessura com `maxBarSize` para que três barras num card largo não virem blocos. A família 02 deste catálogo traz a regra de Few sobre largura e vão. (Recharts, BarChart; [familias/02_barras-horizontais.md](familias/02_barras-horizontais.md))
* **D7. Microvisual tem tamanho de palavra:** o padrão do Tremor para sparkline é `h-12 w-28` (48 por 112px) e o exemplo em card usa `h-8 w-20`. (Tremor, SparkChart; Tufte)
* **D8. Ordem de leitura:** KPIs no topo, gráficos no meio, filtros no topo ou na lateral, sempre no mesmo lugar em todas as telas. (Nightingale, Tips; Carbon, padrão F)

### 2.8 Estados de carregamento, vazio e indisponível

* **E1. Carregando: esqueleto com a forma e a altura do componente final.** Esqueleto só em contêiner e componente de dado (card, tabela, lista); nunca em toast, menu, modal ou no próprio indicador de carga; dura poucos segundos. Mantenha a altura exata do card para a página não pular quando o dado chega. (Carbon, Loading pattern; Farol)
* **E2. Dashboard com várias fontes carrega em lotes:** primeiro a estrutura e o texto fixo, depois os dados. (Carbon, Progressive loading: "Pages that source data from multiple sources, such as dashboards")
* **E3. Pulso do esqueleto respeita movimento reduzido:** `motion-safe:animate-pulse`, estático com `prefers-reduced-motion: reduce`. (MDN, prefers-reduced-motion)
* **E4. Vazio substitui o gráfico inteiro.** Nada de eixos e grade sem dados: o estado vazio ocupa o lugar do elemento, também para o leitor de tela não percorrer uma estrutura vazia. Anatomia: título curto e positivo, corpo com o porquê e a próxima ação, ação opcional. Em card pequeno, bloco alinhado à esquerda; havendo vários vazios na tela, ação em botão terciário. (Carbon, Empty states)
* **E5. Três estados, três textos.** O Carbon separa vazio por falta de dado, vazio por ação do usuário (filtro sem resultado) e vazio por erro (permissão, sistema, configuração). No Farol isso vira: **"sem registros no período"** (vazio legítimo), **"nenhum resultado para estes filtros"** com ação de limpar filtro, **"fonte indisponível desde YYYY-MM-DD"** (erro) e **LACUNA** (o dado não é coletado). (Carbon, Empty states; Farol)
* **E6. Zero não é vazio.** Se o valor medido é 0, desenhe 0. Se não há medição, não desenhe 0. (Farol)
* **E7. Vários widgets falhando ao mesmo tempo:** o Carbon manda considerar quantos estados vazios aparecem juntos; a proposta do Farol é um aviso único no topo da tela, mais um estado discreto em cada card afetado. (Carbon; Farol)
* **E8. Dado atrasado ou parcial se anuncia:** carimbo "atualizado em YYYY-MM-DD" no card e período incompleto marcado (G12). (Farol)

### 2.9 Tooltip, hover e seleção

* **H1. O tooltip repete o valor dos dois eixos e o que mais for relevante** (unidade, comparação, proveniência). (Carbon, Chart anatomy)
* **H2. Nada essencial só no tooltip.** A ONS nem conta tooltip como interatividade. (ONS, Interactive charts)
* **H3. Mesma função de formatação no card e no tooltip:** `formatter` e `labelFormatter` do `<Tooltip>` chamam o formatador de T5. (Recharts, Tooltip; Datawrapper, Text)
* **H4. Ordem dos itens igual à ordem visual.** O padrão do Recharts é `itemSorter="name"`, **ordem alfabética**; passe uma função que siga a pilha ou o valor. (Recharts, Tooltip)
* **H5. Nulo vira "sem dado", não some.** `filterNull` é `true` por padrão e esconde o item; para LACUNA, use `content` customizado que escreve o estado. (Recharts, Tooltip; Farol)
* **H6. Indicador do item combina com a marca:** ponto para barra, linha para série, tracejado para projeção (as três variantes `dot`, `line` e `dashed` do tooltip do shadcn). (shadcn, Chart)
* **H7. Cursor discreto:** em barra, faixa de fundo `cursor={{ fill: 'var(--surface-overlay)' }}`; em linha, `cursor={{ stroke: 'var(--line-strong)' }}`; ponto ativo `activeDot={{ r: 4 }}`. (Recharts, Tooltip: `cursor` padrão `true`; Farol)
* **H8. Animação curta ou nenhuma.** `isAnimationActive` do tooltip é `"auto"` (respeita preferência de movimento) com `animationDuration` 400ms; para dashboard, 150 a 200ms ou desligado; séries sem animação de entrada a cada troca de filtro. (Recharts, Tooltip; MDN; Farol)
* **H9. Tooltip de card pequeno pode sair do gráfico no eixo Y:** `allowEscapeViewBox={{ x: false, y: true }}` (padrão é `false` nos dois). (Recharts, Tooltip; Farol)
* **H10. Hover destaca por subtração:** a série ou barra em foco mantém cor; as demais caem para cerca de 30% de opacidade. (Carbon, Legends)
* **H11. Gráficos ligados:** filtro ou recorte num gráfico reflete nos gráficos que mostram o mesmo dado; tooltip sincronizado com `syncId`. (Carbon, Linked charts; Recharts, BarChart)
* **H12. Seleção tem estado visível e reversível:** marca de seleção (check ou contorno), e um jeito óbvio de limpar. (Carbon, Legends; Farol)

### 2.10 Microvisuais

* **M1. Sparkline:** gráfico do tamanho de palavra, sem moldura e sem eixos; ponto no último valor (e, se útil, no máximo e no mínimo); faixa cinza para o intervalo normal; valor final escrito ao lado. Inclinação média perto de 45 graus dá a leitura mais clara de tendência. (Tufte, Sparkline theory and practice)
* **M2. Escala da sparkline depende da pergunta:** sozinha, preenche a altura (padrão, só tendência); numa série que será comparada, escala comum do menor ao maior valor do conjunto; se a magnitude importa, escala comum a partir do zero com área preenchida; faixa de referência fixa (por exemplo 90% a 100% de SLA) quando essa faixa dá sentido. (Few, Best Practices for Scaling Sparklines)
* **M3. Sparkline no Farol:** `LineChart` sem `XAxis`, `YAxis`, grade e tooltip, `dot={false}` e um `ReferenceDot` no último ponto; ou SVG de uma `path` com geometria em TypeScript quando for dezenas numa tabela. (Farol; Tremor, SparkChart sem eixos nem tooltip)
* **M4. Bullet graph no lugar de gauge.** Componentes: rótulo, escala linear, medida principal, uma ou duas medidas comparativas, 2 a 5 faixas qualitativas (ideal 3). A barra principal tem cerca de **um terço da espessura** do contêiner; a meta é um **traço curto perpendicular**, menos dominante que a barra (a segunda comparativa a 75% do preto); faixas em intensidades de **um único matiz**, com as de 3 faixas a 40%, 25% e 10% de preto e a mais escura para o pior estado; ordem invertida para custo; escala acima de zero troca a barra por ponto ou X; projeção opcional como segmento. (Few, Bullet Graph Spec; SWD, What is a bullet graph)
* **M5. Bullet graph em tema escuro (Farol):** traduza "intensidade de preto sobre branco" para "intensidade de claro sobre o card": três faixas com sobreposição branca decrescente, a mais clara para o pior estado, preservando a lógica de que a zona ruim chama mais atenção; barra principal em `--text-primary` ou na cor de destaque; meta em `--text-primary`. No Recharts: `BarChart layout="vertical"` com as faixas como barras de fundo e `ReferenceLine` para a meta; ou SVG puro. Com público não acostumado, anote as partes. (Farol; SWD)
* **M6. Lista de barras (top N):** rótulo dentro da barra, valor alinhado à direita, ordenada do maior para o menor, clicável quando filtra o resto. Em HTML + Tailwind, largura em `%`. Serve para perdas por motivo, leads por origem, criativos. (Tremor, BarList)
* **M7. Trilha de status diária:** fileira de blocos pequenos, um por dia, cor por estado e tooltip por bloco. Serve para SLA diário de pré-vendas. Com C11: bloco de falha também muda de forma ou ganha marca, não só de cor. (Tremor, Tracker; Farol)
* **M8. Pílula de variação:** `+12%` ou `−8%` com ícone, cor pela polaridade (C9) e base escrita ("vs. mês anterior"). Produtos de analytics exibem a comparação com o período anterior como pílula de variação percentual junto do número principal. (PostHog, Charts; Few, Pitfalls #2)
* **M9. Número principal escolhe o agregado explicitamente:** total, média ou último valor, dito no rótulo. (PostHog, Charts: "Headline value" Total, Average ou Latest)

### 2.11 Acessibilidade

* **X1. Cor nunca é o único meio.** Texto, ícone, forma, textura ou tracejado acompanham. (WCAG 2.2, SC 1.4.1; Material; Atlassian; Carbon, textura em legenda)
* **X2. Pisos de contraste:** 3:1 para marca de dado, contorno e foco; 4,5:1 para texto. (WCAG 2.2, SC 1.4.11; ver 2.3)
* **X3. `accessibilityLayer` fica ligado.** No Recharts 3 ele já vem `true` (navegação por teclado e leitor de tela); não desligue. (Recharts, BarChart; shadcn, Chart)
* **X4. Alternativa textual de cada gráfico:** `<figure>` com `<figcaption>` contendo título e uma frase de 100 a 200 caracteres no formato "Gráfico de [tipo] mostrando que [conclusão]". A frase diz o que entender, não repete o título nem lista pontos. (ONS, Chart text; Analysis Function)
* **X5. Tabela de dados sob demanda** ("ver como tabela") em todo card de gráfico: é o que o Carbon reconhece como único caminho para dado que não vira marca visível. (Carbon, Chart anatomy; Analysis Function)
* **X6. Texto é texto:** título, subtítulo e nota em HTML, fora do SVG, nunca em imagem. (Analysis Function, critério 1.4.5)
* **X7. Movimento:** `prefers-reduced-motion` desliga ou suaviza animação; animação nunca é o único meio e pode ser pausada. (MDN; ONS)
* **X8. Teste de daltonismo antes de fixar paleta.** A auditoria da seção 2.2 mostra por que: pares que parecem distintos na visão típica colapsam em deuteranopia. (Few, regra 8; Datawrapper, Colors, regra 12; Farol)
* **X9. Contraste alto:** a biblioteca de gráficos do Fluent declara suporte a modo de alto contraste do sistema; no Farol, os tokens precisam de um bloco `forced-colors` antes de afirmar o mesmo. (Fluent UI react-charting; Farol)

---

## 3. Guias de estilo, publicações e produtos: link e o que aproveitar

### 3.1 Sistemas de design

**IBM Carbon, Data visualization** · [repositório]
* https://carbondesignsystem.com/data-visualization/color-palettes/ · https://carbondesignsystem.com/data-visualization/chart-anatomy/ · https://carbondesignsystem.com/data-visualization/dashboards/ (abriram truncados no leitor; o texto foi lido em `carbon-design-system/carbon-website`, pastas `src/pages/data-visualization/` e `src/pages/patterns/`)
* **Aproveitar:** o guia mais operacional da lista. Ordem categórica fixa; sequencial invertida no tema escuro; paleta de alerta separada; legenda com regras numéricas (duas linhas, 30% da altura, 30% de opacidade no hover, clique isola); circular com chamada abaixo de 3 graus; eixos (zero em barra, recorte em linha, lacuna nunca interpolada, quebra de 16px, rótulo de marco em seminegrito); dashboards de apresentação contra exploração; padrões de **carregamento** e de **estado vazio** com tipos e anatomia.
* **Limite:** as páginas avisam que a guia é trabalho em andamento; os valores hex das paletas vivem em componentes, não no texto.

**Material Design (M2), Data visualization e Dark theme** · [aberto via leitor]
* https://m2.material.io/design/communication/data-visualization.html
* https://m2.material.io/design/color/dark-theme.html
* **Aproveitar:** tema escuro com números (superfície `#121212`, sobreposição de 0% a 16% por elevação, cores dessaturadas, 15,8:1 entre superfície e texto branco, ênfases de texto 87/60/38%); textura de linha para tipo de dado; canto arredondado sutil que não tira precisão do topo da barra; legenda abaixo no desktop e acima no celular; ícone sempre com rótulo.

**Atlassian Design System, Data visualization color** · [aberto via leitor]
* https://atlassian.design/foundations/color-new/data-visualization-color
* **Aproveitar:** o modelo de tokens mais próximo do Farol: `color.chart.brand` para gráfico de uma cor, `color.chart.neutral`, `color.chart.categorical.1` a `.8` em sequência, tokens de status separados, valores por tema. Admite por escrito que as cores passam 3:1 contra a superfície **mas não entre si** e prescreve espaço ou borda. Limite de 5 a 6 cores.

**Shopify Polaris Viz** · [aberto]
* https://github.com/Shopify/polaris-viz
* **Aproveitar:** a arquitetura: mesmas estruturas de dados e utilitários de acessibilidade e de visão de cor para web e nativo, temas claro e escuro, movimento como parte do desenho.
* **Limite:** o próprio repositório declara o pacote **descontinuado**; serve como referência de ideia, não de dependência (e a stack do Farol não admite dependência nova).

**Microsoft Fluent UI, react-charting** · [aberto]
* https://github.com/microsoft/fluentui/tree/master/packages/charts/react-charting
* **Aproveitar:** a lista do que uma biblioteca de gráficos corporativa declara em acessibilidade: navegação por teclado, leitor de tela e modo de alto contraste (X9). É construída sobre d3, então só o critério serve ao Farol.

**UK Government Analysis Function, Data visualisation: charts** · [aberto]
* https://analysisfunction.civilservice.gov.uk/policy-store/data-visualisation-charts/
* **Aproveitar:** regras curtas e verificáveis: dois títulos (mensagem e formal), no máximo dez linhas de grade em cinza claro, texto sempre horizontal, números alinhados à direita, pizza com até 5 fatias ordenadas a partir de 12 horas e borda entre fatias, sem eixo duplo, sem 3D, alternativa textual logo abaixo do gráfico.

**ONS Service Manual, Data visualisation** · [aberto]
* https://service-manual.ons.gov.uk/data-visualisation
* https://service-manual.ons.gov.uk/data-visualisation/guidance/axes-and-gridlines
* https://service-manual.ons.gov.uk/data-visualisation/guidance/chart-text
* https://service-manual.ons.gov.uk/data-visualisation/guidance/annotations
* https://service-manual.ons.gov.uk/data-visualisation/guidance/interactive-charts-and-animations
* https://service-manual.ons.gov.uk/data-visualisation/guidance/dashboards
* **Aproveitar:** os números mais concretos da pesquisa: 6 a 10 linhas de grade no desktop e 3 a 6 no celular; linha do zero enfatizada; anotação de cerca de 50 caracteres; título com até 15 palavras; subtítulo "medida, recorte, período"; alternativa textual de 100 a 200 caracteres; mensagem principal nunca atrás de interação.
* **Limite:** a página de cores abriu, mas remete a outro documento e não traz a paleta.

**Urban Institute, Data Visualization Style Guide** · [aberto]
* https://urbaninstitute.github.io/graphics-styleguide/
* **Aproveitar:** escala tipográfica completa para web (20/16/12/12/14/11px), título ativo com exemplo lado a lado, rótulo direto como padrão, legenda no topo, zero em barra, anotação tratada como parte central da comunicação, paleta sequencial de 8 tons por família.

**shadcn/ui, Chart** · [aberto]
* https://ui.shadcn.com/docs/components/chart
* https://ui.shadcn.com/charts
* **Aproveitar:** é Recharts, então vira código direto: `ChartConfig` desacoplado do dado, `--chart-n` por tema com `var()` no Recharts 3, tooltip com indicador `dot`, `line` ou `dashed`, padrões `CartesianGrid vertical={false}`, `tickLine={false}`, `axisLine={false}`, `tickMargin={10}` e `accessibilityLayer`. A galeria tem sete famílias (área, barra, linha, pizza, radar, radial e tooltip).

**Tremor** · [aberto]
* https://www.tremor.so/docs/visualizations/spark-chart
* https://www.tremor.so/docs/visualizations/barlist
* https://www.tremor.so/docs/visualizations/tracker
* **Aproveitar:** três microvisuais de dashboard com anatomia e tamanhos prontos (sparkline `h-12 w-28` sem eixos nem tooltip; lista de barras com rótulo dentro e valor à direita; trilha de status por dia). Os três se reproduzem em HTML + Tailwind ou em Recharts sem dependência nova.

**IBCS** · [aberto]
* https://www.ibcs.com/ibcs-version-2-0/
* **Aproveitar:** existe um padrão de notação para relatório de negócio (alinhado à ISO 24896), útil para realizado, orçado, ano anterior e forecast. **Lacuna:** a página aberta é só a visão geral; a notação em si não foi lida e nenhuma regra desta pesquisa se apoia nela.

### 3.2 Publicações e referências técnicas

**Stephen Few, Perceptual Edge** · [PDF]
* https://www.perceptualedge.com/articles/Whitepapers/Common_Pitfalls.pdf · os 13 erros comuns de dashboard; base da seção 5.
* https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf · especificação do bullet graph com proporções e intensidades (M4).
* https://www.perceptualedge.com/articles/visual_business_intelligence/rules_for_using_color.pdf · regras práticas de cor (fundo uniforme, cor só com propósito, três paletas de saliência, sequencial em um matiz, não dado recua, sem vermelho e verde, sem efeitos).
* https://www.perceptualedge.com/articles/visual_business_intelligence/best_practices_for_scaling_sparklines.pdf · cinco formas de escalar sparklines conforme a comparação (M2).
* O livro *Information Dashboard Design* (2006) é a origem do white paper; citado só como referência bibliográfica, sem link.

**Edward Tufte** · [aberto]
* https://www.edwardtufte.com/notebook/sparkline-theory-and-practice-edward-tufte/
* **Aproveitar:** definição e anatomia da sparkline (tamanho de palavra, pontos no último valor e nos extremos, faixa normal em cinza, sem moldura, inclinação perto de 45 graus). A ideia de razão dado/tinta vem de *The Visual Display of Quantitative Information*, citado sem link.

**Storytelling with Data** · [aberto]
* https://www.storytellingwithdata.com/chart-guide · guia de mais de 20 tipos de gráfico.
* https://www.storytellingwithdata.com/blog/what-is-a-bullet-graph · cores (medida escura, faixas claras no mesmo matiz), meta como traço e o alerta de que público não acostumado precisa de anotação.

**Datawrapper** · [aberto]
* https://www.datawrapper.de/blog/colors/ (o endereço antigo `blog.datawrapper.de/colors/` redireciona para este) · doze regras de cor, com teto de 7 cores e cinza para contexto.
* https://www.datawrapper.de/blog/text-in-data-visualizations · hierarquia em dois níveis, alinhamento, precisão, unidade em eixo, tooltip e anotação.
* https://www.datawrapper.de/academy/customizing-your-area-chart · faixa de destaque semitransparente e formato de número do tooltip independente do eixo.
* **Lacuna:** não achei o artigo sobre modo escuro.

**Financial Times, Visual Vocabulary** · [aberto]
* https://github.com/Financial-Times/chart-doctor/tree/main/visual-vocabulary
* **Aproveitar:** a escolha começa pela relação que se quer mostrar (desvio, correlação, ranking, distribuição, mudança no tempo, magnitude, parte do todo, espacial, fluxo). Serve de índice para as famílias do catálogo; é escolha de forma, não de acabamento.

**Nightingale (Data Visualization Society)** · [aberto]
* https://nightingaledvs.com/dashboard-psychology-effective-feedback-in-data-design/ · compromisso e contraste: meta ao lado do número, benchmark, e visual "tolerante" (média móvel, linha dessaturada) para público pouco engajado.
* https://nightingaledvs.com/dashboard-redesign-a-look-at-chart-choices/ · antes e depois: 3D e velocímetro viram barras; orientação consistente; cor agrupa, então quebrar a sequência cria significado falso.
* https://nightingaledvs.com/tips-tricks-to-improve-dashboard-design/ · ordem em Z (KPIs no topo), 6 a 7 cores por dashboard, evitar vermelho/verde e azul/amarelo. **Ressalva:** o artigo também recomenda fundo com imagem e marca, o que contraria Few (Pitfalls #11); essa parte não foi adotada.

**W3C, WCAG 2.2** · [aberto]
* https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html · 3:1 para gráfico; linhas contra fundo e não entre si; isenção quando o valor está escrito; foco.
* https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html · cor não pode ser o único meio.

**MDN e Tailwind** · [aberto]
* https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion
* https://tailwindcss.com/docs/font-variant-numeric

**Recharts (API)** · [aberto]
* https://recharts.github.io/en-US/api/BarChart/ · `accessibilityLayer` padrão `true`; `barCategoryGap` padrão `"10%"`; `barGap` 4; `margin` 5 por lado; `syncId`.
* https://recharts.github.io/en-US/api/Tooltip/ · `itemSorter` padrão `"name"`; `filterNull` `true`; `isAnimationActive` `"auto"`; `animationDuration` 400; `allowEscapeViewBox` falso nos dois eixos.
* https://recharts.github.io/en-US/api/ReferenceLine/ · `ifOverflow` padrão `"discard"`; `label` aceita componente.

### 3.3 Produtos reconhecidos por design (páginas públicas)

**Stripe, Designing accessible color systems** · [aberto]
* https://stripe.com/blog/accessible-color-systems
* **Aproveitar:** por que HSL engana, escala em CIELAB e a garantia de contraste por distância de degraus (C8).

**Linear, How we redesigned the Linear UI** · [aberto]
* https://linear.app/now/how-we-redesigned-the-linear-ui
* **Aproveitar:** tema gerado em LCH a partir de três entradas (base, destaque e **contraste**), o que dá tema de alto contraste de graça; menos cromia na interface; texto mais escuro no claro e mais claro no escuro. Modelo para gerar os tokens do Farol em vez de escolher hex a mão.

**Vercel, Geist colors e Web Analytics** · [aberto]
* https://vercel.com/geist/colors · escala de 10 degraus com papel fixo por degrau: 100 a 300 fundo (padrão, hover, ativo), 400 a 600 borda (padrão, hover, ativo), 700 e 800 fundo de alto contraste, 900 texto secundário, 1000 texto principal. Útil para nomear os estados de hover e seleção dos cards.
* https://vercel.com/docs/analytics · painéis de "top" (páginas, origens) em número ou porcentagem do total, com "View All" e exportação em CSV de até 250 linhas: o padrão de lista de barras com saída para o detalhe.

**PostHog, Charts** · [aberto]
* https://posthog.com/docs/product-analytics/trends/charts
* **Aproveitar:** gráfico de número com agregado explícito (total, média, último) e pílula de variação contra o período anterior (M8, M9); fatia de pizza com escolha entre rótulo, valor ou nada.

**Mixpanel, Insights** · [aberto]
* https://docs.mixpanel.com/docs/reports/insights
* **Aproveitar:** a regra de uso escrita no produto: "linha mostra tendência; os outros gráficos mostram o agregado"; métrica isolada como tipo de gráfico; anotação em série temporal.

**Stripe Dashboard, documentação** · [aberto]
* https://docs.stripe.com/dashboard/basics
* **Limite:** a página descreve navegação e widgets personalizáveis, sem regra de desenho de gráfico; entra só como registro de que foi consultada.

**Não lidos:** Amplitude (endereço devolveu 404) e as telas autenticadas de todos os produtos.

---

## 4. Referências visuais

Critério: projeto, arquivo ou shot específico; o que observar é sempre acabamento aplicável ao Farol. Nomes de designers e de clientes omitidos. **Behance** abre direto, mas a página chega em texto: onde o designer não escreveu nada, isso está dito e a observação vale para as imagens. **Figma Community** devolve 403 direto e abriu pelo leitor. **Dribbble** não abriu nesta pesquisa.

### Behance

| # | Link | Marca | O que observar |
|---|---|---|---|
| 1 | https://www.behance.net/gallery/82482589/Style-Guidelines-for-data-visualisation-dark-light | [aberto] | Guia de estilo de dashboard com paleta para escuro e claro, especificação para desenvolvedor e regras escritas para eixo duplo e funil. Referência de como documentar acabamento para quem implementa. |
| 2 | https://www.behance.net/gallery/253236163/Data-Visualization-Guidelines | [aberto] | Sistema para instituição pública com 18 modelos de gráfico, cobrindo cor, contraste, tipografia, hierarquia, espaçamento e anotação. Observar como anotação vira componente do sistema. |
| 3 | https://www.behance.net/gallery/253697973/Dark-Themed-Business-Management-Dashboard-UI | [aberto] | Painel escuro com KPIs, área de receita e tabela de pedidos com indicador de status; acentos vibrantes só na hierarquia. Conferir se o status tem mais que cor. |
| 4 | https://www.behance.net/gallery/254994285/DataGrid-Dashboard-Kit-Pro-Interactive-UI-Kit | [aberto] | Kit em React 18, TypeScript e Tailwind com modo escuro: mesma stack do Farol. Observar tabela densa, estados de linha e contraste do texto secundário. |
| 5 | https://www.behance.net/gallery/81085955/Data-Visualization-Dashboard-UI-Kit | [aberto] | Mesmo kit em claro e escuro, nove variações. Bom para testar C7: o que muda de hex entre os temas e o que fica. |
| 6 | https://www.behance.net/gallery/253051769/Taski-SaaS-Task-Project-Management-Dashboard | [aberto] | Escuro com paleta de dois acentos, azul e âmbar, igual à lógica ciano e âmbar do Farol; cards de estatística; versão da direita para a esquerda. Observar como dois acentos bastam. |
| 7 | https://www.behance.net/gallery/227919755/Line-Chart-Card-Design | [aberto] | Estudo só de card de linha; a página não tem texto. Observar a anatomia nas imagens: título, número, delta, gráfico e tooltip no mesmo card. |
| 8 | https://www.behance.net/gallery/212978419/Interactive-Hover-Bar-Chart-for-Job-Statistics | [aberto] | Microinteração de hover em barras; a página não descreve a mecânica. Observar destaque da barra ativa contra as demais (H10). |
| 9 | https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard | [aberto] | Forecast de vendas B2B: saúde do pipeline, progresso de quota e precisão de forecast. Público Comercial e Diretoria. Observar como realizado, meta e projeção se distinguem (G11). |
| 10 | https://www.behance.net/gallery/255169531/Sales-Marketing-Analytics-Dashboard-SaaS-UIUX | [aberto] | Vendas e marketing juntos; a página não tem texto. Observar a divisão por canal e a densidade da faixa de KPIs. |
| 11 | https://www.behance.net/gallery/245170427/Modern-Website-Analytics-Platform-UXUI-Case-Study | [aberto] | Estudo de caso de analytics cuja tese declarada é reduzir sobrecarga e priorizar métricas de decisão. Observar o que foi cortado da primeira tela (D2). |
| 12 | https://www.behance.net/gallery/176149443/ReportPro-Reporting-and-Analytics | [aberto] | Plataforma de relatório financeiro com formatação de tabela e propriedades de dimensão. Observar alinhamento numérico e hierarquia em tabela (T1, T8). |
| 13 | https://www.behance.net/gallery/255536599/DEALPORT-Sales-Management-SaaS-Dashboard-UI-Design- | [aberto] | Gestão de vendas; a página traz só título e tags. Observar etapas do pipeline e cards de negócio. |
| 14 | https://www.behance.net/gallery/65301405/Theme-and-UI-Design-for-Charts-Gauges-and-Maps | [aberto] | Tema visual para gráficos, gauges e mapas; a página não tem texto. Olhar o tema (grade, tipografia, paleta) e **descartar os gauges** (seção 5, item 2). |

### Figma Community

| # | Link | Marca | O que observar |
|---|---|---|---|
| 15 | https://www.figma.com/community/file/1328496497617715352/chart-ui-kit-v2-0 | [aberto via leitor] | 20 tipos de gráfico em claro e escuro, CC BY 4.0. Comparar o tratamento de grade e rótulo entre os dois temas. |
| 16 | https://www.figma.com/community/file/1212977094398360391/data-visualisation-ui-kit-150-charts-36-chart-types-10-color-palettes | [aberto via leitor] | Mais de 150 componentes, 36 tipos e 10 paletas; comentários registram que passaram a ser componentes editáveis. Útil para testar paletas candidatas contra a auditoria da seção 2.2. |
| 17 | https://www.figma.com/community/file/1528308765361625218/mobile-dashboard-charts-kpi-widgets | [aberto via leitor] | Cards de KPI com acompanhamento de meta e **estados vazios desenhados**, CC BY 4.0. Uma das poucas referências de E4. |
| 18 | https://www.figma.com/community/file/1577537133533397367/kpi-dashboard-with-micro-interactions | [aberto via leitor] | Cards de KPI com hover e transição de valor, em mais de um tema, CC BY 4.0. Observar duração e se a transição atrapalha a leitura (H8). |
| 19 | https://www.figma.com/community/file/1481885761542814198/dashboard-cards | [aberto via leitor] | Cards de analytics, CC BY 4.0. Observar a anatomia do card de estatística. |
| 20 | https://www.figma.com/community/file/1621990878990665091/modern-dashboard-ui-kit-dark-admin-panel-productivity-analytics-app-design-figma | [aberto via leitor] | Kit escuro com layouts estruturados e cards de dado, CC BY 4.0. Observar escala de superfícies e elevação no escuro (C6). |
| 21 | https://www.figma.com/community/file/1199721318228257277/data-visualization-graphs-charts-kit | [aberto via leitor] | 40 gráficos em claro e escuro; os comentários reclamam que o arquivo gratuito tem **só imagens**. Serve de aviso: kit bonito que não é componente não vira código. |
| 22 | https://www.figma.com/community/file/1561384239599771178/saas-dashboard-ui-kit-free | (não abriu) | Kit de dashboard SaaS em claro e escuro com foco declarado em acessibilidade, segundo a busca da varredura irmã; o leitor devolveu só a navegação. |

### Dribbble

| # | Link | Marca | O que observar |
|---|---|---|---|
| 23 | https://dribbble.com/shots/25092919-Sales-Dashboard-Dark-Mode | (não abriu) | Painel de vendas escuro sobre componentes shadcn/ui, segundo a busca: o vocabulário visual mais próximo de Tailwind. Olhar antes de adotar. |
| 24 | https://dribbble.com/shots/17238059-Dashboard-Cards-Light-Dark | (não abriu) | Mesmos cards em claro e escuro, segundo a busca: teste de C7 e K6. |
| 25 | https://dribbble.com/shots/6009960-Bar-Chart-Dashboard-Card-Dark-Theme | (não abriu) | Card de colunas em tema escuro, segundo a busca: referência direta para o card de colunas. |

---

## 5. Antipadrões comuns e a correção

| # | Antipadrão | Por que falha | Correção | Fonte |
|---|---|---|---|---|
| 1 | Número solto no card ("R$ 736 mil") | Não diz se é bom, ruim ou esperado. | Meta ou período anterior ao lado, delta com sinal, ícone e base; faixa qualitativa quando houver. | Few, Pitfalls #2; Nightingale, Dashboard Psychology |
| 2 | Velocímetro ou gauge | Ângulo lê mal, ocupa espaço e escala arbitrária (arco de 83% valendo 100%). | Bullet graph (M4) ou barra com traço de meta. | Few, Bullet Graph Spec; Nightingale, Dashboard Redesign |
| 3 | Uma cor por barra, sem motivo | O cérebro procura significado que não existe. | Uma cor para todas; destaque só na barra que carrega a mensagem. | Few, Rules for Color, regra 4; Few, Pitfalls #12 |
| 4 | 3D, sombra, brilho, gradiente | Distorce comprimento e adiciona leitura inútil. | Plano, fundo uniforme. | Few, Rules for Color, regras 1 e 9; Analysis Function; Nightingale, Dashboard Redesign |
| 5 | Eixo de barra começando acima de zero | Diferença pequena parece enorme (Few mostra receita "quatro vezes" o custo quando era menos que o dobro). | Barra em zero; se precisar recortar, trocar por ponto ou linha. | Few, Pitfalls #8; Carbon, Axes and labels |
| 6 | Eixo duplo | Duas escalas arbitrárias criam cruzamentos falsos. | Dois gráficos alinhados com `syncId`. | ONS; Analysis Function |
| 7 | Pizza com muitas fatias | Fatias parecidas só se leem pelo número, então a imagem não serve. | Barras ordenadas; pizza só com até 5 fatias e uma dominante. | Few, Pitfalls #5; Analysis Function |
| 8 | Legenda longe, muitas séries | Ida e volta entre legenda e dado. | Rótulo direto; legenda no topo só quando não couber. | Carbon, Legends; Urban |
| 9 | Rótulo do eixo girado 45 graus | Lê mal e pesa. | Barra horizontal, abreviação ou menos ticks. | Analysis Function; Material |
| 10 | Precisão excessiva (R$ 3.848.305,93; horário com segundos) | Atrasa a leitura sem ganho. | Compacto com 2 ou 3 significativos (T5, T6). | Few, Pitfalls #3; Datawrapper, Text |
| 11 | Variedade de gráficos "para não cansar" | Cada tipo exige nova estratégia de leitura. | Mesmo tipo para a mesma pergunta. | Few, Pitfalls #6 |
| 12 | Tudo em destaque: borda forte, cor forte, negrito em tudo | Quando tudo chama atenção, nada chama. | O que não é dado recua; destaque só no que pede ação. | Few, Pitfalls #10; Few, Rules for Color, regra 7; Material |
| 13 | Logo e navegação no canto nobre; KPI relacionado longe do seu histórico | Desperdiça o ponto de maior atenção e quebra relações. | Topo esquerdo para o dado principal; relacionados lado a lado. | Few, Pitfalls #9 |
| 14 | Vermelho e verde como única distinção | Uma fatia relevante do público não separa as duas cores; nos tokens do Farol, ΔE76 de 11,4 em deuteranopia. | Sinal, ícone e texto junto da cor (C16). | Few, Rules for Color, regra 8; WCAG 1.4.1; auditoria 2.2 |
| 15 | Série de dado com a mesma cor de um estado | Série pintada de "positivo" parece boa. | Paleta categórica separada da semântica (C10, C15). | Carbon, Alert palette; Atlassian; auditoria 2.2 |
| 16 | Linha ligando meses sem dado | Inventa valores. | `null` com `connectNulls={false}` e faixa "sem dado". | Carbon, Gaps in data |
| 17 | Valor que só existe no tooltip | Quem não passa o mouse (ou está no celular, ou no leitor de tela) não vê. | Valor principal visível; tooltip complementa. | ONS, Interactive charts |
| 18 | Tooltip em ordem alfabética | Ordem diferente da pilha confunde a leitura. | `itemSorter` seguindo a ordem visual. | Recharts, Tooltip |
| 19 | Meta que desaparece do gráfico | `ReferenceLine` com `ifOverflow` padrão `"discard"` some quando a meta passa do maior valor. | `ifOverflow="extendDomain"`. | Recharts, ReferenceLine |
| 20 | Eixos e grade vazios, ou "0" quando não há dado | Parece medição de zero. | Estado vazio que substitui o gráfico; zero só quando é zero medido (E4, E6). | Carbon, Empty states |
| 21 | Spinner de tela cheia para um card, ou esqueleto genérico que muda a altura | Bloqueia o resto e faz a página pular. | Esqueleto com forma e altura do card; carga em lotes. | Carbon, Loading pattern |
| 22 | Animação de entrada a cada troca de filtro | Distrai e atrapalha comparar antes e depois. | Transição curta ou nenhuma; respeitar movimento reduzido. | MDN; ONS; Recharts, Tooltip |
| 23 | Pequenos múltiplos com escalas diferentes sem aviso | Linhas iguais representam valores muito diferentes. | Domínio comum quando a comparação é o objetivo (G10). | Few, Scaling Sparklines; Nightingale, Dashboard Redesign |
| 24 | Paleta escolhida em HSL | Mesma "luminosidade" parece diferente por matiz; contraste imprevisível. | Escala em LCH ou OKLCH com contraste garantido por degrau. | Stripe; Linear |
| 25 | Preto puro com cores saturadas | Cor saturada vibra no escuro e o texto cansa. | Superfície cinza escuro, cores dessaturadas, ênfase por opacidade do texto. | Material, Dark theme |
| 26 | Texto preto sobre célula escura de mapa de calor | O valor mais importante fica ilegível. | Cor do texto escolhida pela luminância da célula (K5). | Few, Rules for Color |
| 27 | Título genérico ("Receita por mês") | Obriga cada pessoa a achar a conclusão sozinha. | Título com a conclusão; subtítulo com medida, recorte e período (T11). | Urban; ONS, Chart text |
| 28 | Gráfico decorado para parecer painel de carro ou de controle | Decoração que o usuário precisa atravessar para chegar ao dado. | Dado bem desenhado, sem ornamento; beleza pela ordem, não pelo enfeite. | Few, Pitfalls #11 e #13 |

---

## Checklist de revisão de um card

Antes de dar o card por pronto:

1. O título diz a conclusão e o subtítulo diz medida, recorte e período?
2. O número principal tem comparação, delta com sinal e ícone, e unidade?
3. Os números usam `tabular-nums` e a precisão da decisão?
4. Existe no máximo uma cor de destaque, e a cor da série vem de token por chave?
5. A marca tem 3:1 e o texto 4,5:1 **nos dois temas**?
6. Algo depende só de cor? Algo depende só do tooltip?
7. Barra e área começam em zero, a grade é rala e a linha do zero é mais forte?
8. Meta e teto aparecem mesmo acima do dado (`ifOverflow="extendDomain"`)?
9. Os quatro estados existem: carregando, vazio, sem resultado para o filtro, indisponível ou LACUNA?
10. Há alternativa textual e "ver como tabela"?
