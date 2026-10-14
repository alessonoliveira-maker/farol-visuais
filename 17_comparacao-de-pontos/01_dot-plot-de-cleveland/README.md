# Dot plot de Cleveland

## O que é

Um ponto por categoria sobre um eixo quantitativo comum, com as categorias empilhadas em linhas e ordenadas por um critério declarado. O valor se lê pela posição do ponto, e não pelo comprimento de uma barra a partir da base, por isso a escala pode começar onde o dado começa. Nenhuma reta atravessa o ponto: a leitura é ajudada por zebra em `--surface-sunken` e por grade vertical em `--line-subtle`. O mesmo desenho absorve o dot plot agrupado, o desvio contra uma referência, os pequenos múltiplos com domínio único e a marca direcional.

## Quando usar

* Um valor por categoria em listas de 12 a 25 linhas, como ticket médio por executivo ou CPL por origem.
* Escala em que o zero não significa nada e cortar a base de uma barra enganaria.
* Duas ou três medidas por linha no mesmo eixo, sem conector, com forma e cor por série.
* Distância de cada categoria até uma referência comum (meta, mediana), com o zero no meio.
* A mesma comparação em até 8 recortes, em pequenos múltiplos com o mesmo domínio em todos os painéis.

## Quando evitar

* Poucas categorias e pergunta de razão (quantas vezes maior): barra da família 02 ou 03.
* Mais de três marcadores por linha: o desenho já é linha, família 04.
* Dois momentos do mesmo objeto em que a mudança é a notícia: dumbbell ou arrow plot (17/03).
* A forma da distribuição importa mais que o resumo: família 16.
* Público que nunca viu o formato numa decisão que a barra comum resolve: a plateia escolhe a barra.
* Pequenos múltiplos com domínio calculado por painel: os painéis ficam iguais e os números não.

## Anatomia

1. Eixo de linhas numérico com domínio de −0,5 a n−0,5 e `reversed`, que dá a cada linha uma banda de posição conhecida. Nome da categoria em `--text-secondary`, 12 px, alinhado à esquerda e sem corte.
2. Eixo de valor com domínio e tiques fixos, `formatCurrencyAxis`, sem linha de eixo (`EIX-5`).
3. Zebra em `ReferenceArea` com `--surface-sunken` e `zIndex` abaixo dos −100 da grade, para a grade vertical continuar visível.
4. Grade só vertical em `--line-subtle`, que é a direção da leitura (`EIX-3`).
5. Marcador por série: círculo, losango ou traço, com contorno de 1,5 px em `--surface-raised`, e forma própria do Scatter com a banda inteira como área sensível.
6. Referência (`ReferenceLine`, `ifOverflow="extendDomain"`) com rótulo na margem superior, fora das linhas.
7. Valor escrito com `formatCurrencyCompact` e halo em `--surface-raised`, e dica com número que o corpo não traz.
8. Linha de leitura calculada do dado e nota de ordenação e de escala, ambas `aria-hidden`.

## Versões

* `v1_ticket-medio-por-executivo`: ticket médio de 14 executivos, escala de R$ 120 mil a R$ 360 mil, mediana do time tracejada, zebra e alvo de clique de 24 px.
* `v2_desvio-contra-a-meta-com-marca-direcional`: desvio de 12 executivos contra a meta, domínio simétrico, barra clara e traço opaco na ponta, cor pela polaridade e contagem 5 de 12 abaixo da meta.
* `v3_cpl-bruto-qualificado-e-meta-por-origem`: três marcadores por origem (círculo, losango e traço), ordem pela distância entre bruto e qualificado e coluna de leitura contra a meta com menor custo melhor.
* `v4_sla-por-sdr-em-paineis-com-semana-vazia`: seis painéis de semana com o mesmo domínio e o mesmo teto de SLA, anel vazado para SDR sem lead e painel de recesso mantido na grade.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual e troque o `data.ts` pela consulta real, mantendo o tipo exportado.
2. Mova o domínio e os tiques do eixo de valor (`X_DOMAIN`, `X_TICKS`) para o registry da métrica: o domínio não pode mudar com o filtro, senão os painéis e os recortes deixam de ser comparáveis.
3. Embrulhe no `VisualCard` e leve o título, o subtítulo com a ordenação e a procedência para ele; o `Chart` não desenha etiqueta de procedência.
4. Troque o estado vazio inline por `EmptyState` ou `UnavailableState`, mantendo o sentido do texto.
5. A altura do gráfico é derivada do número de linhas (`ROW_STEP`); em lista rolável, mantenha a régua fixa e role só as linhas.

## Referências

* Datawrapper Academy, how to create a dot plot, e customizing your dot plot: teto de três pontos por linha e alinhamento do rótulo.
* DataViz Catalogue, Cleveland dot plots: vantagens sobre a barra e escala sem zero.
* Practical Reporting, a friendlier dot plot: a barra esmaecida com traço na ponta da `v2`.
* Storytelling with Data, dot plot contra barra: a contraprova antes de adotar o formato.
* Recharts, Scatter e ReferenceArea: forma própria do Scatter e camadas por `zIndex`.
* No Farol: `app/src/components/visuals/charts/chartTheme.ts` e `ChartTooltip.tsx`.

## Observações da revisão (não bloqueantes)

**2026-10-05.** Revisão das quatro versões; `v1` e `v4` reprovadas, com parecer em `validation/revisao_17_comparacao-de-pontos__01_dot-plot-de-cleveland_2026-10-05.md`.

* `v1`: linha de leitura com `truncate` e a distância até a mediana fora da frase acessível (TIP-7); cabe com folga no canvas `alto`.
* `v1`, `v2` e `v4`: halo dos rótulos em `--surface-raised` sobre faixa de zebra em `--surface-sunken` deixa uma mancha mais clara em volta do texto no tema escuro, sem perda de leitura.
* `v2`: a barra clara (opacidade 0,7) mede 3,03:1 contra o cartão no claro, mas 2,79:1 sobre a zebra nas linhas de Murilo C., Renan A. e Ana Beatriz Cavalcanti; passa pela isenção da ACE-3, porque o valor está escrito ao lado e o traço da ponta é opaco.
* `v2`: rótulo de desvio negativo ancora à esquerda da ponta e invade a coluna de nomes perto do limite do domínio; com o dado fixo sobram 89 px, com nome longo e desvio próximo de −R$ 80 mil colidiria.
* `v3`: o cabeçalho da coluna diz só "contra a meta"; quem é comparado (o CPL qualificado) está na dica e na frase acessível, não no desenho.
* `v3`: no empate de bruto e qualificado (Indicação de clientes) o círculo sobra como quatro lascas de cerca de 1,6 px em volta do losango; um círculo de raio 8 ou um losango menor deixaria o empate mais evidente.
* `v3`: valores com centavos por `formatCurrency` fora de tabela de detalhe (NUM-1), aceitos porque a diferença que decide é de poucos reais; a nota do `meta.json` cita uma linha de leitura que a versão não tem.
* `v4`: legenda abaixo dos painéis (ROT-4 pede acima ou ao lado); linha de leitura com `truncate` e a data na cauda (TIP-7); ordem dos SDRs sem critério declarado (GEO-12); unidade só no último tique de cada painel.

**2026-10-05, segunda passada.** Revisão de `v1` e `v4` depois da correção; as duas aprovadas. Os bloqueantes do parecer anterior foram conferidos nos PNGs ampliados: mediana e teto em `--text-muted` tracejado `3 3`, anel de ausência e amostras em `--text-muted`, texto pintado depois da linha do teto.

* `v1`: o rótulo da mediana é número em Manrope sem `tabular-nums` (TIP-1); sem consequência visível, porque não há coluna a alinhar.
* `v1`: a margem direita de 56 px segura o valor escrito até cerca de R$ 346 mil; com o domínio fixo em R$ 360 mil, um ticket acima disso teria o rótulo cortado na borda. Com o dado fixo sobram cerca de 12 px.
* `v1`: a mediana (R$ 241,0 mil) fica a 1,5 px da grade de R$ 240 mil; agora se distingue pelo tracejado e pelo tom, mas as duas linhas seguem coladas.
* `v1` e `v4`: as observações da primeira passada (`truncate` na linha de leitura, mancha do halo sobre a zebra no escuro, legenda abaixo dos painéis, ordem dos SDRs sem critério declarado, unidade só no último tique) continuam valendo.
* `v4`: a linha de leitura e a legenda trazem números em Manrope sem `tabular-nums` (TIP-1); sem consequência visível.
* `v4`: o teto não tem rótulo dentro de cada painel (ANO-3); o nome e o valor estão na legenda ("teto de SLA, 30 min") e o tique 30 cai embaixo da linha, o que basta para identificar.
* `v4`: no painel de 17/08/2026 o halo de "sem lead" interrompe o tracejado do teto e sobra um toco de traço encostado no topo do "l"; o texto se lê inteiro nos dois temas.
* `v4`: recorte com linhas mas sem nenhuma medição escreveria "Nenhuma das 0 medições passou do teto"; o ramo merece frase própria.
