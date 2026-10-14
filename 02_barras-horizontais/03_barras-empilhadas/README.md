# Barras empilhadas

## O que é

Cada barra é o total de uma categoria dividido em segmentos por componente. Só o segmento da base e o total têm linha de base comum: os segmentos do meio não se comparam bem entre categorias, então o componente mais importante de comparar mora na base, encostado no zero, e o total sai escrito na ponta. No Recharts, `Bar` com o mesmo `stackId` dentro de um `BarStack` (a partir do Recharts 3.6) aplica o raio ao contorno da pilha inteira, nunca entre segmentos. O modelo absorve também as empilhadas em grupos: duas pilhas por categoria na mesma banda (orçado e realizado, um cenário contra outro), com a mesma cor por componente nas duas e a pilha de referência distinguida por contorno tracejado, nunca por opacidade.

## Quando usar

* O total por categoria e a composição desse total precisam ser lidos juntos, na mesma barra.
* De 2 a 5 componentes, com ordem fixa entre categorias e igual à legenda.
* Um componente importa mais que os outros e pode morar na base, onde a comparação entre categorias é honesta.
* Plano contra realizado por categoria, com a composição de cada um: duas pilhas agrupadas na mesma banda.

## Quando evitar

* Comparar segmentos do meio entre categorias: eles não têm linha de base comum e a comparação engana; usar barras agrupadas ([02_barras-agrupadas](../02_barras-agrupadas/)) ou pequenos múltiplos.
* Só a proporção interessa, não o total: barras empilhadas 100% ([04_barras-empilhadas-100](../04_barras-empilhadas-100/)).
* Componentes que somam e subtraem: barras divergentes com pilha por lado ([06_barras-divergentes](../06_barras-divergentes/)).
* A pergunta é como o total se formou passo a passo: cascata (modelo de cascata da família de composição).
* Mais de 5 componentes: agregar os menores em "outros" antes de empilhar, ou trocar por tabela com composição inline.

## Anatomia

1. **Eixo de categoria** (`YAxis type="category"`), um executivo, origem ou plataforma por linha, com nome à esquerda sem cortar (`NAME_AXIS_WIDTH` fixo no topo do arquivo).
2. **Segmentos empilhados** (`Bar` com `stackId` comum dentro de `BarStack`), na mesma ordem entre categorias e na legenda; cor por token categórico (`CHART_SERIES_COLORS`, slot fixo por componente, ordem 1, 3, 6, 5, 2, 4 da COR-8).
3. **Vão entre segmentos vizinhos** de 2 px (`SEGMENT_GAP`), desenhado por um `shape` próprio que também impede o Recharts de descartar segmento zerado.
4. **Rótulo de total** na ponta da pilha (`LabelList content`), sempre no último segmento, por `formatCurrencyCompact` ou `formatInt`.
5. **Rótulo de segmento**, quando cabe, só sobre a cor de destaque (`--chart-1` com `--accent-cyan-contrast`) ou fora do preenchimento (segmento de ausência); nunca `--text-primary` sobre as demais categóricas.
6. **Legenda em lista**, na mesma ordem dos segmentos, com amostra quadrada da cor de cada componente.
7. **Segmento de ausência ou aviso**, quando existe, fica visível e nunca soma dentro de "outros": contorno `--text-muted` sem preenchimento para ausência, `--warning` sólido para um estado que pede ação.
8. **Duas pilhas por categoria** (versão em grupos): `stackId` distinto por pilha, mesma cor por componente nas duas, pilha de referência em contorno tracejado e pilha atual sólida; legenda lista só os componentes, não o par pilha × componente.

## Versões

* **v1_pipeline-por-estagio.** Oportunidades abertas por executivo, empilhadas pelos quatro estágios do funil, com o total na ponta e os executivos ordenados pelo próprio total.
* **v2_paradas-na-base.** Mesma leitura com o segmento "parado há mais de 30 dias" fixo na base em cor de aviso, os estágios em andamento em neutro com opacidade graduada, ordenação pelo segmento parado e o caso de zero parado escrito como 0% sem segmento de aviso.
* **v3_leads-por-cobertura-de-dado.** Leads do mês por origem, empilhados pela cobertura de contato (telefone e e-mail, só e-mail, só telefone, sem contato), com rótulo de segmento suprimido abaixo de 24 px e o "sem contato" sempre visível, em tom apagado.
* **v4_orcado-e-realizado-em-grupos.** Orçado contra realizado de mídia paga por plataforma, duas pilhas por linha (orçado tracejado, realizado sólido) divididas por prospecção e remarketing, com uma plataforma nova sem orçado aprovado mostrando só a pilha existente.

Previews: [v1](./v1_pipeline-por-estagio/preview.svg) · [v2](./v2_paradas-na-base/preview.svg) · [v3](./v3_leads-por-cobertura-de-dado/preview.svg) · [v4](./v4_orcado-e-realizado-em-grupos/preview.svg) (tema escuro; `preview-claro.svg` em cada pasta para o tema claro).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida; troque a lista de componentes (`stages`, `SEGMENTS` ou as chaves do dado) pela dimensão real da página, mantendo os mesmos slots de cor por componente entre telas diferentes que mostram a mesma composição.
2. Se a página já tem uma ordem de estágio ou de canal definida em outro lugar (registry, enum do domínio), passe essa ordem pela prop de definição de componentes em vez de reordenar dentro do Chart: a ordem tem que ser igual à da legenda em toda tela.
3. Em pilhas agrupadas (v4), o número de `Bar` cresce rápido (2 pilhas × N componentes); ao adicionar um componente, replique o par em `orcado` e `realizado` com a mesma cor, nunca cores diferentes para o mesmo nome.
4. Embrulhe em `VisualCard` com `metricId` da métrica que dá o total (seção 16 do CONTRATO); o Chart não desenha título nem etiqueta de procedência.

## Referências

* [Data Viz Catalogue, Stacked Bar Graph](https://datavizcatalogue.com/methods/stacked_bar_graph.html)
* [Data to Viz, o problema de empilhar](https://www.data-to-viz.com/caveat/stacking.html)
* [ECharts, barras horizontais empilhadas (código)](https://raw.githubusercontent.com/apache/echarts-examples/gh-pages/public/examples/ts/bar-y-category-stack.ts)
* [SWD, stacked bars](https://www.storytellingwithdata.com/blog/stacked-bars)
* [Few, displays for combining time series and part to whole (PDF)](http://www.perceptualedge.com/articles/visual_business_intelligence/displays_for_combining_time-series_and_part-to-whole.pdf)
* [Recharts BarStack](https://recharts.github.io/en-US/api/BarStack/)
* [AG Charts, bar series](https://www.ag-grid.com/charts/react/bar-series/), sobre `stackGroup`, a base da versão em grupos
* [IBCS 2.0](https://www.ibcs.com/ibcs-version-2-0/), sobre a notação de plano e realizado no mesmo lugar
* [Recharts Bar, prop stackId](https://recharts.github.io/en-US/api/Bar/)

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-17, segunda passada, com as quatro versões aprovadas. Revisão independente de 2026-09-18 confirmou as quatro, sem bloqueante novo, e acrescentou itens à lista; uma segunda leitura independente do mesmo dia manteve o veredito e fechou a lista com os três últimos itens. Bloqueantes ficam no parecer de cada versão, em `_render/.qa/revisao/`; aqui só o que não reprova._

* **v2_paradas-na-base.** Os três estágios em andamento são o mesmo `--line-strong` separado só por `fillOpacity` (0,35, 0,6 e 0,85) e nenhum deles tem o valor escrito na marca. A tabela 17.2 admite o neutro de dado apenas com o valor escrito na marca ou junto dela; no tema escuro os três tons quase colapsam num só. A leitura principal (parado contra ativo) não sofre, porque o total e o percentual parado vão escritos, mas vale considerar dois neutros em vez de três, ou o valor por segmento.
* **v2_paradas-na-base.** A legenda nomeia os estágios como "Descoberta", "Proposta" e "Negociação e assinatura", quando o que está desenhado é o valor **em andamento** naquele estágio: o parado já saiu para o segmento da base. O `data.ts` explica a regra, a legenda não. Um "em andamento" no rótulo fecharia a ambiguidade.
* **v2_paradas-na-base.** A dica não passa `itemSorter` (DIC-4). A ordem sai da ordem de declaração dos `Bar`, que hoje coincide com a pilha, mas o v1 e o v4 travam isso de propósito.
* **v3_leads-por-cobertura-de-dado.** O percentual do segmento da base e o "% completo" da ponta são o mesmo número impresso duas vezes na mesma linha quando o rótulo de segmento cabe (Rede social paga 17%, Site institucional 50%). Redundância, não erro.
* **v3_leads-por-cobertura-de-dado.** Na mesma barra convivem dois percentuais de significados diferentes, o da base e o do "sem contato", os dois escritos só como "%". A legenda e a ponta resolvem, mas a leitura exige um segundo de atenção.
* **v4_orcado-e-realizado-em-grupos.** A amostra de "realizado" na legenda é um quadrado em `--text-muted`, e nenhuma marca do gráfico usa essa cor: as pilhas realizadas são `--chart-1` e `--chart-3`. A amostra comunica a forma (sólido contra tracejado), não a cor, o que é legítimo, mas convida a procurar uma série cinza que não existe.
* **v4_orcado-e-realizado-em-grupos.** O aviso "sem orçado" existe em dois lugares para a mesma linha: no `shape` da pilha de orçado e no rótulo da ponta. Na largura renderizada só o da ponta aparece, então o do `shape` está inerte.
* **v2_paradas-na-base.** As amostras da legenda dos três estágios em andamento medem 1,19:1, 1,38:1 e 1,62:1 contra o cartão no tema escuro, e de 1,14:1 a 1,55:1 no claro, porque a opacidade cai sobre um `--line-strong` que já parte de 1,79:1. Amostra de legenda não tem valor escrito ao lado, então não cabe nela a isenção da 17.2. O texto do item resolve a identificação; a amostra, praticamente não.
* **v3_leads-por-cobertura-de-dado.** Só dois dos quatro segmentos imprimem percentual, então os números escritos na barra nunca somam 100 e a composição inteira depende da dica. É coerente com o que a versão se propõe a ensinar (rótulo que some quando não cabe), mas quem lê rápido pode tentar fechar a conta.
* **v4_orcado-e-realizado-em-grupos.** O desvio sai como `+8%` sem o valor do orçado na mesma linha, e a base fica só no contorno tracejado e na dica. A NUM-4 pede a base nomeada junto da variação; aqui ela é visual, não escrita.
* **v4_orcado-e-realizado-em-grupos.** Em "Busca paga" e "Rede profissional" o realizado é menor que o orçado, então o rótulo da ponta nasce por baixo do retângulo tracejado. Na largura renderizada sobram poucos pixels e nada se sobrepõe, mas o texto não leva o halo da ROT-7, que é o que seguraria a leitura num canvas mais estreito.
* **v1, v2 e v4.** O check mede a marca mais fina do `Bar` em 9 px, abaixo do piso de 12 px da ESP-2, porque `BAR_MAX` de 18 px (16 px no v4) não é o que manda: o passo da banda é que aperta. É aviso, não erro, e a barra continua visível nos dois temas, mas a espessura ficaria declarada se viesse pela conta da ESP-6 em constante nomeada.
* **v3_leads-por-cobertura-de-dado.** O canvas foi fixado em 640 por 450 justamente para caber o passo de 65 px que a ESP-6 pede, e a nota do `meta.json` explica a conta. O efeito colateral aparece no preview: o vão entre linhas fica maior que a própria barra, o que espalha a leitura vertical e afasta o nome do total escrito na ponta.
* **v4_orcado-e-realizado-em-grupos.** Em "Vídeo curto", que não tem orçado, a pilha ausente continua ocupando o lugar dela na banda, então a barra realizada fica alguns pixels abaixo do nome, enquanto nas outras linhas o nome cai entre as duas pilhas. Não confunde, mas o alinhamento da última linha destoa das demais.
* **Ferramenta.** O `npm run check` não tem guarda para nome de marca real no `data.ts`: as duas versões reprovadas na primeira passada desta revisão passavam com `0 com erro`. Enquanto não houver essa verificação, a conferência é da revisão.
* **v1, v2 e v4 (espessura).** O `npm run check` mede 9 px na marca mais fina das três versões, abaixo do piso geral de 12 px da ESP-2. O piso geral é aviso e não erro, porque ainda não tem peça de teste própria, e aqui nenhum rótulo de 12 px é desenhado dentro da marca, que é o piso medido de 18 px. Ainda assim, a `BAR_MAX` declarada (18 e 16) descreve a intenção, não o desenho: o passo não está derivado pela conta da ESP-6.
* **v3_leads-por-cobertura-de-dado (canvas).** O `meta.json` fixa o canvas por número, 640 por 450, em vez do preset `card`, e não traz `notes` dizendo de onde sai essa altura. A emenda da ESP-2 pede que desvio de preset venha declarado numa linha das `notes`; sem ela, o desvio fica calado no arquivo e só aparece no diff.
* **v4_orcado-e-realizado-em-grupos (metadados).** O item "Legend content que colapsa os pares" do `demonstrates` descreve um `Legend` do Recharts com `content` próprio, e o que a versão faz é uma `<ul>` de HTML acima do gráfico. O efeito é o mesmo e a legenda está correta; a frase é que aponta para outra técnica.

## Correção de 2026-09-25

**v4, o desvio zero com sinal de estouro.** O desvio do orçado saía de
`deviation >= 0 ? '+' : '−'` no rótulo da barra e de `overPct >= 0 ? '+' : '−'` na linha de leitura.
Desvio exatamente zero caía no ramo do `>=` e era escrito `+0%`, que declara estouro de orçamento
onde realizado e orçado bateram na régua.

O que mudou: os dois pontos passaram a chamar `signedDeviation`, que testa o **texto impresso** e
devolve o zero sem sinal, na convenção de `02_barras-horizontais/06_barras-divergentes/v1`. O teste
é sobre o texto porque o desvio de meio ponto, que a peça arredonda para 0%, também não tem direção
a declarar.

**Conserto de caminho latente:** os três desvios do dado publicado são +8%, −8% e −14%, nenhum
zero, então o preview não exibia o defeito e o desenho não mudou.

**Fica aberto, por exigir decisão de desenho:** a frase acessível escreve
`${overPct >= 0 ? 'acima' : 'abaixo'} em ${...}`, e com desvio zero diria "é a que mais se desvia do
orçado, acima em 0%". A correção não é de sinal e sim da frase inteira, porque nesse caso nenhuma
plataforma se desvia e o sujeito da oração deixa de existir. Fora do alcance deste conserto.

### Segunda passada, 2026-09-25: a frase do extremo zero

A pendência que a correção acima deixou aberta foi fechada. Quando o desvio extremo lê zero, a
frase deixou de eleger alguém: sai "Nenhuma plataforma passou do orçado no período", com o número
fora dela, em vez de "é a que mais se desvia do orçado, acima em 0%". O corpo do cartão passou a
decidir esse caso pelo **mesmo** `noOverspend` da frase acessível, para os dois não divergirem.

**Uma ressalva sobre a redação.** `mostOver` é eleita pelo desvio **com sinal**, não pelo módulo:
é a plataforma que mais passou do orçado, ou a que menos ficou abaixo dele. Por isso o extremo zero
não autoriza dizer "nenhuma linha se desviou", que seria falso com uma plataforma 14% abaixo do
orçado na mesma tela; o que ele autoriza é "nenhuma passou do orçado". Trocar a eleição para o
módulo faria a frase original valer literalmente, mas mudaria qual linha a peça nomeia, e isso é
desenho, não conserto.
