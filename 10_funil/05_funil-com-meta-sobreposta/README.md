# Funil com meta sobreposta

## O que é

Realizado e meta por etapa no mesmo desenho: o realizado é a barra cheia, a meta é um traço vertical na mesma escala do realizado, e o percentual de atingimento vem escrito ao lado, sempre com o par absoluto entre parênteses. A leitura central deste modelo é uma escolha que muda o número: **a meta pode ser da própria etapa** (a taxa histórica dela, medida) **ou pode ser o resultado final desdobrado para trás** (a meta de ganhos do período, dividida pelas taxas de passo até chegar no necessário de cada etapa). As duas leituras não são intercambiáveis: uma etapa pode bater a própria meta e ainda assim o funil inteiro não bater a meta de ganhos, e o inverso também acontece. Por isso toda versão declara, numa linha de leitura, qual das duas está mostrando, e toda taxa escreve o denominador e o par absoluto, nunca só o percentual.

## Quando usar

- Diretoria e Comercial acompanhando o realizado contra a meta por etapa dentro do período, com 3 a 7 etapas.
- Meta de ganhos desdobrada para trás pelas taxas históricas, para dizer quantas oportunidades faltam em cada etapa hoje.
- Pré-vendas com meta semanal por etapa e faixas de atingimento, quando o time acompanha a cadência da semana.

## Quando evitar

- Meta sem origem declarada: rotular "premissa" e usar o marcador vazado (`v4`), ou não desenhar marcador nenhum; nunca desenhar um traço sólido como se fosse medição.
- Uma meta única do período, sem etapas: usar a família `13_progresso-meta-e-gauge`.
- Meta e realizado em escalas diferentes: o domínio é um só e fixo para os dois, calculado do maior valor entre eles.
- Período em curso comparado com a meta cheia sem dizer quanto do período já passou: declarar a fração decorrida (`v1`) ou trocar a meta pelo necessário até a data de corte.

## Anatomia

1. **Trilho de fundo**, o domínio inteiro: `Bar background` em `--surface-sunken`, que existe mesmo com o realizado zero porque não depende da largura da barra.
2. **Barra realizada**, em `--chart-1` (`v1`, `v3`, `v4`) ou colorida pela faixa de atingimento (`v2`): sempre desenhada por um `shape` próprio, porque o traço de meta precisa da mesma peça de desenho.
3. **Marcador de meta**, um traço vertical de 2 px em `--text-primary`, posicionado por `background.x + background.width × (meta / domínio)`; nunca pela largura da própria barra, que falha com realizado zero.
4. **Marcador vazado**, um losango sem preenchimento, quando a meta não tem medição por trás (`v4`): a forma muda, não só a cor, porque a distinção é estrutural. Correção de 2026-09-18: o losango sobe para fora da banda da barra, com uma haste fina ligando a base dele ao corpo da marca; numa barra curta (poucas unidades contra um domínio grande) o losango centrado na própria barra a engolia por inteiro e virava mancha única.
5. **Par absoluto sem taxa**, `realizado de meta`, com o substantivo da contagem, ao lado do marcador vazado quando o atingimento é indisponível (`v4`): o par nunca some só porque a taxa não pode ser calculada.
6. **Atingimento com denominador**, `formatRateWithVolume(realizado, meta)`: percentual e o par absoluto entre parênteses, ao lado de toda barra medida.
7. **Falta em número absoluto**, com o substantivo da contagem, quando a meta é o necessário desdobrado do resultado final (`v3`): nunca só a diferença numérica sem dizer o que falta.
8. **Linha de leitura**, declarando se a meta é da etapa ou do resultado final: a decisão que este modelo não deixa implícita em nenhuma versão. A `v1` acrescenta, abaixo dela, a anotação com a data de corte e a fração do período já decorrida.
9. **Estado vazio**: bloco `role="status"` com o ícone `Filter`, sem eixo nem grade, quando o recorte não tem etapas.

## Versões

- [`v1_realizado-contra-meta-do-trimestre`](./v1_realizado-contra-meta-do-trimestre/) ([preview](./v1_realizado-contra-meta-do-trimestre/preview.svg)): funil comercial do terceiro trimestre de 2026, realizado até 2026-09-14 contra a meta de cada etapa. Demonstra o `shape` próprio com o traço de meta posicionado pelo `background`, o domínio fixo, o atingimento com o par absoluto ao lado de cada barra e, abaixo da linha de leitura, a anotação com a data de corte e a fração do trimestre já decorrida.
- [`v2_cor-por-faixa-de-atingimento`](./v2_cor-por-faixa-de-atingimento/) ([preview](./v2_cor-por-faixa-de-atingimento/preview.svg)): pré-vendas da semana de 2026-09-07, meta semanal por etapa. Demonstra a barra colorida pela faixa de atingimento (dentro, perto ou abaixo da meta), os limiares como prop com default e a legenda das três faixas acima do gráfico.
- [`v3_meta-desdobrada-pelas-taxas-historicas`](./v3_meta-desdobrada-pelas-taxas-historicas/) ([preview](./v3_meta-desdobrada-pelas-taxas-historicas/preview.svg)): meta de 36 ganhos do quarto trimestre de 2026 desdobrada pelas taxas dos últimos quatro trimestres, contra o que já está no funil em 2026-09-14. Demonstra a meta calculada de trás para frente a partir do resultado final, e não da etapa, com a origem citada no rodapé e a falta escrita em número absoluto.
- [`v4_etapa-nova-sem-historico`](./v4_etapa-nova-sem-historico/) ([preview](./v4_etapa-nova-sem-historico/preview.svg)): funil comercial do terceiro trimestre de 2026 com a etapa Comitê de investimento, criada no meio do trimestre e sem taxa histórica. Demonstra o marcador vazado para meta sem medição, sobre haste própria fora da banda da barra, o rótulo "indisponível, premissa" com o par absoluto (8 de 15 oportunidades) ao lado, e a meta medida das demais etapas na mesma peça.

## Como colar no Farol

1. Escolha a versão pela pergunta: atingimento simples por etapa (`v1`), semáforo de faixas para revisão rápida (`v2`), quanto falta para uma meta final (`v3`) ou etapa nova sem histórico convivendo com etapas medidas (`v4`).
2. Ao ligar o dado real, decida antes de tudo se a meta que a página tem é da etapa ou do resultado final: as duas usam o mesmo desenho de traço, mas a `v3` também precisa da lista de taxas históricas que originaram o necessário, para o rodapé não ficar em branco.
3. O domínio do eixo é sempre `[0, máximo entre meta e domínio calculado] × 1,08`, arredondado; ao trocar o recorte, recalcule o domínio a partir do novo array, nunca reaproveite o domínio anterior.
4. Etapa sem taxa histórica não herda a cor nem a forma do marcador medido: siga o padrão da `v4`, marcador vazado e atingimento indisponível, em vez de inventar uma meta para preencher a barra.

## Referências

- [Apache ECharts, Customized Funnel](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/funnel-customize.ts): séries "Expected" e "Actual" sobrepostas com opacidade e borda, a base do desenho de realizado contra meta na mesma marca.
- [Stephen Few, Our Irresistible Fascination with All Things Circular (2010)](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): o argumento a favor do bullet graph linear contra medidores circulares, que fundamenta o traço de meta em vez de um medidor.
- [Behance, busca "funnel chart dashboard"](https://www.behance.net/search/projects/funnel%20chart%20dashboard): varredura de marcadores de meta sobre funil em painéis reais.

## Pendências conhecidas

- Nenhuma pendência aberta nas correções de 2026-09-18 (`v1`, `v4`): os dois bloqueios da rodada anterior (anotação da fração decorrida ausente do corpo, e números da etapa nova ausentes com o losango colidindo com a barra curta) foram corrigidos e conferidos nos dois temas.

## Observações da revisão (não bloqueantes)

- `v1`, `v2`, `v4`: o domínio nasce de `Math.max(...meta)`, não do maior entre meta e realizado; na `v2` o realizado de Entradas (1.180) já fica a 10 unidades do teto de 1.190, e um recorte com realizado maior que 108% da meta passaria a ser cortado.
- `v2`: o catálogo pede `--accent-amber` na faixa de 80 a 99% e a versão usa `--warning`; a leitura não muda e o token semântico é defensável em estado, mas os dois textos precisam concordar.
- `v2`: a legenda escreve "80,0% a 99,0%" para a faixa do meio, então um atingimento de 99,5% fica pintado de âmbar sem caber no intervalo escrito; "abaixo de 100%" descreveria a regra do código.
- `v3`: o catálogo diz que a meta é "calculada de trás para frente no componente" e os valores de `necessario` vêm prontos do `data.ts`; a aritmética confere (36 ÷ 0,52 → 70, ÷ 0,44 → 160, ÷ 0,52 → 308, ÷ 0,62 → 497), mas o desdobramento não está demonstrado em código.
- `v3`: a data de corte do funil, 2026-09-14, existe no `data.ts` e não aparece na tela, embora a meta seja do trimestre seguinte segundo o caso de uso do catálogo.
- `v1` a `v4`: o rótulo de valor ancora no fim do trilho, não na ponta livre da barra (ROT-2); a coluna alinhada lê bem e não colide, mas a âncora foge da redação da regra.
- `v2`: o catálogo, o `meta.json` e a linha das Versões dizem "limites das faixas como prop com default", e os limiares são constantes exportadas do `data.ts`, usadas como argumento das funções de faixa; não há número mágico no `shape`, mas prop do componente também não há.
- `v1`, `v2`, `v4`: o marcador de meta não leva rótulo escrito nomeando o que ele é; quem lê depende da linha de leitura acima do gráfico para saber que o traço é a meta, já que o par absoluto ao lado da barra só traz o denominador.
- `v3`: a linha de leitura e o rodapé de origem somam duas anotações no corpo (ANO-1 fica no teto), então uma anotação nova nesta versão precisa substituir uma das duas.
