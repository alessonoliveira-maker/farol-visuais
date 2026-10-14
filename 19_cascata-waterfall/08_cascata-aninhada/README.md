# Cascata aninhada

## O que é

Uma ponte em que um passo se abre numa ponte própria. O dado é uma árvore: cada nó tem valor e, às vezes, filhos que o somam. Um nível vira uma fileira de colunas (passos flutuantes e uma coluna final ancorada no zero, que é o valor do nó), e o passo que tem filhos pode ser aberto num segundo painel, cuja coluna final repete o valor do passo pai. Lê-se de cima para baixo: o pai dá o contexto, o filho dá a explicação, e a mesma convenção de cor vale nos dois níveis. Responde de que é feito este passo sem trocar de tipo de gráfico.

## Quando usar

* Ponte com dois ou três níveis reais de hierarquia, em que um passo pede explicação própria.
* Custo, perdas ou receita em que a pergunta seguinte é de que é feito este passo, com até 6 passos por nível.
* Pai visível acima do filho quando o contexto do total não pode se perder (v1 e v2).
* Passo pai com parte sem classificação, que precisa aparecer como passo próprio e não ser diluída (v3 e v4).
* Navegação por caminho em três níveis, com migalha e escala própria por nível (v3).

## Quando evitar

* Hierarquia sem nível intermediário real: ponte simples com subtotais, modelo 01 da família.
* A hierarquia importa mais que o caminho: treemap ou árvore, família 12.
* Decomposição em alavancas por soma ou produto: árvore de indicadores, família 12, modelo 04.
* Detalhamento sobre uma tabela de números: tabela visual, família 14.
* Níveis com valores muito desiguais lidos lado a lado numa só escala: cada nível tem escala própria, e quem compara níveis pelo tamanho da barra se engana; leia o rótulo.

## Anatomia

1. **Coluna de passo**: faixa `[baixo, alto]` de um `Bar` do Recharts com `shape` próprio, em `--text-secondary` (v1, v3, v4) ou por polaridade (v2: custo que sobe em `--negative`, que cai em `--positive`).
2. **Coluna final do nível**: ancorada no zero, `--chart-1`, com o valor do próprio nó; no filho, é o valor do passo pai.
3. **Conector**: traço de 1 px em `--line-strong` desenhado pelo shape; a banda vem de `usePlotArea`, chamado dentro de um componente de shape.
4. **Passo aberto**: moldura de 1,5 px em `--chart-1` com ícone `FolderOpen` do lucide e a palavra abre; passo que abre e está fechado leva `Folder` em `--text-muted`.
5. **Interação** (v2 e v3): o grupo do shape é `role="button"` com `tabIndex`, `onClick` e Enter ou Espaço, sobre uma área transparente que cobre a banda inteira; o estado é de React.
6. **Migalha** (v3): botões em Tailwind com o caminho e a parte do total; o seletor de caminho é uma função pura, `selectPath`, no `data.ts`.
7. **Parte sem classificação** (v3 e v4): contorno tracejado em `--text-muted`, sem preenchimento, por último entre os passos; a diferença sai do dado (`number | null`), nunca é redistribuída.
8. **Linha de leitura** (12 px, `aria-hidden`) com a proporção e a base, **dica** com o valor exato e a parte, e **frase acessível** calculada do dado. Números por `formatCurrencyAxis`, `formatInt` e `formatPercent`.

## Versões

* `v1_custo-total-abrindo-em-marketing`: custo total em cima e marketing aberto embaixo, passo emoldurado, faixa de proporção (38%) e filho que soma o pai.
* `v2_passo-que-mais-cresceu-abre`: variação do custo contra o mês anterior; o passo de maior variação abre sozinho, o filho vem ordenado por variação e clicar noutro passo troca o filho.
* `v3_perdas-do-funil-em-tres-niveis`: perdas em três níveis com caminho em estado, migalha, escala por nível e o percentual do total no rótulo.
* `v4_filho-que-nao-fecha-o-pai`: perdas na proposta com 13 perdas sem motivo em passo vazado, por último e visível.

## Como colar no Farol

1. Copiar `Chart.tsx` e `data.ts` da versão e trocar o `data` pela árvore da métrica; os tipos (`CostNode`, `LossNode`) vêm do `data.ts`. Os ids precisam ser únicos na árvore inteira.
2. Entregar a árvore já com os filhos somando o pai: o componente confere (`childGap`) e escreve na linha de leitura quando não fecha; só a v3 e a v4 transformam a diferença positiva em passo próprio.
3. Na v3, guardar o caminho no estado da página se o Farol quiser link direto ao nível (a prop `initialPath` recebe os ids).
4. Embrulhar num `VisualCard` e trocar o estado vazio inline por `EmptyState`; título e procedência são do cartão.

## Referências

* Método: a ponte (bridge) de Gene Zelazny, em "Say It With Charts"; o princípio de ancorar totais no zero e deixar só os passos flutuarem. O detalhamento por nível segue o drill-down de Ben Shneiderman, "overview first, zoom and filter, then details on demand".
* Recharts 3.10.1: `Bar` com `dataKey` devolvendo faixa e `shape` próprio, `usePlotArea`.
* Farol: `app/src/components/visuals/charts/ChartTooltip.tsx` e `app/src/lib/format.ts`.
* Pedido ao Farol: nenhum formatador escreve o sinal `+` em moeda (v2 o escreve à mão sobre o valor absoluto) e não há formatador de trimestre (v3 e v4 escrevem `2026-T3` como o dado o entrega).

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-06, as quatro versões julgadas pela primeira vez: `v1`, `v2` e `v4` aprovadas; `v3` reprovada, com o parecer em `validation/revisao_19_cascata-waterfall__08_cascata-aninhada_2026-10-06.md`. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

* `v1`, `v2`, `v3` e `v4`: o conector é um traço de 1 px em `--line-strong`, medido no PNG em 1,79:1 no escuro e 1,83:1 no claro. Foi lido como referência pela ACE-6, como em `01_cascata-de-ponte`: tapado o traço, o nível de cada passo continua na posição das colunas e o valor continua escrito.
* `v1`, `v2`, `v3` e `v4`: o bloco de vazio traz só a frase, sem o ícone `Filter` de 16 px da EST-1. Não aparece no preview.
* `v1` e `v2`: o painel do filho tem escala própria e nada no corpo declara isso; a `v3` declara na linha de leitura. Na `v1` a escala do filho é cerca de três vezes a do pai, e Mídia, de R$ 118 mil, sai com 111 px contra 51 px de Pessoas, de R$ 160 mil. Vale pelo valor escrito em cada marca e pelo total do filho com o nome e o número do pai; duas palavras na linha da ponte alinhariam as três versões.
* `v1` e `v2`: `--chart-1` pinta o total de cada nível e também a moldura e a etiqueta do passo aberto; na `v3`, também o elo clicável da migalha. A ligação é coerente, porque o passo emoldurado é o total do filho, mas são duas coisas acesas no painel do pai, e a 17.2 dá um destaque por visual. Em `03_cascata-temporal-de-saldo`, a `v2` levou os totais a neutro quando o destaque era um passo.
* `v2`: três rótulos em peso 700 (total do pai, passo aberto e total do filho), e a TIP-3 dá dois. O destaque não depende do peso, porque leva moldura, ícone e a palavra abre; os totais em 600, como na `v1`, alinham.
* `v1` e `v2`: a moldura do passo aberto termina na borda de baixo do SVG (`FRAME_BELOW` igual à altura do eixo, com margem inferior 0), e a metade de fora do traço é cortada: a base mede 2 px de dispositivo contra 4 px dos lados e do topo. Só se vê ampliado, e a moldura continua fechada.
* `v1`: a linha de leitura do topo não leva `tabular-nums` (TIP-1); a linha da ponte leva. Sem consequência visível.
* `v1` e `v2`: os rótulos saem por `formatCurrencyAxis`, que arredonda ao milhar inteiro, e a NUM-1 pede `formatCurrencyCompact` em rótulo direto. É a convenção da família e o dado fixo só tem milhares exatos; com dado real, os filhos impressos podem não fechar o pai impresso, e a soma é o que o modelo demonstra.
* `v1`: o filho não desenha coluna de entrada. Ele nasce do zero e a coluna final repete o valor do passo pai (R$ 150 mil), e foi assim que "entrada e saída iguais ao valor do passo pai" foi lido.
* `v1` e `v2`: a frase acessível diz o total e as partes do passo aberto, mas não os passos do nível de cima (193 e 220 de 250 caracteres).
* `v2`: `signedPercent` usa sempre zero casas, e a NUM-1 pede uma casa abaixo de 10%. No preview sai +18%; ao abrir Pessoas, a linha de leitura escreve +3% para 2,6%.
* `v2`: a ordem do filho por variação (+19, +3, +2 e −1 mil) coincide com a ordem por valor (118, 14, 12 e 6 mil), então o desenho não distingue o que a versão demonstra. Um filho de valor alto e variação pequena no `data.ts` mostraria a diferença.
* `v2`: no passo negativo o rótulo fica acima da coluna, que é o nível de partida, e a ponta livre da ROT-2 é a de baixo. Com −R$ 3 mil e −R$ 1 mil a coluna tem menos de 10 px e a leitura não muda.
* `v2` e `v3`: a etiqueta abre do passo fechado fica no topo do painel, longe da coluna quando o passo é baixo: cerca de 120 px acima do rótulo de Pessoas na `v2` e de 180 px acima do de Sem contato na `v3`. Está na coluna certa e se lê.
* `v3`: com filhos somando mais que o pai (`childGap` negativo) o desenho não avisa; a `v1`, a `v2` e a `v4` escrevem na linha de leitura. O item 2 de Como colar no Farol diz que o componente escreve, e isso não vale para a `v3`.
* `v3` e `v4`: a dica escreve a parte com uma casa (39,0%) e o rótulo com zero (39%), e a DIC-2 pede o mesmo formato do rótulo.
* `v4`: os percentuais dos passos saem de arredondamento independente, sem o maior resto da NUM-2. Com o dado fixo somam 100 (35, 26, 19, 8 e 12); outro dado pode dar 99 ou 101. A `v3` foi corrigida na segunda rodada: `buildShares` reparte pelo maior resto em cada nível, com alvo no inteiro do pai (100 na raiz), e o mesmo inteiro vai ao rótulo, à migalha, ao aria-label do passo e à frase acessível (raiz 87, 9 e 4; Pré-venda 39, 33, 10 e 5). O `wholeShares` de `02_cascata-de-decomposicao` resolveria a `v4`.
* `v4`: o período `2026-T3` só existe na frase acessível; a linha de leitura do corpo não o traz (DAD-9). No cartão do catálogo ele vem do subtítulo.

Revisão de 2026-10-06, segunda passada, só a `v3`, julgada de novo pelo arquivo de hoje depois da correção: aprovada. Os percentuais impressos fecham nos quatro níveis navegáveis (raiz 87, 9 e 4 somam 100; Pré-venda 39, 33, 10 e 5 somam 87; Sem contato 18, 12, 7 e 2 somam 39; Proposta 3, 2, 2, 1 e 1 somam 9). A raiz, Sem contato e Proposta foram conferidos navegando o build do render nos dois temas, por clique e por teclado, sem corte nem colisão. Nenhum item abaixo reprova.

* `v3`: depois do maior resto, o rótulo e a dica deixam de dizer o mesmo inteiro em duas marcas. Na raiz, Negociação imprime `40 (4%)` e a dica escreve "Parte de perdas 3%" e "Parte do total do trimestre 3,4%"; em Sem contato, Visita imprime `30 (2%)` e a dica 2,5%. O rótulo é o inteiro repartido da NUM-2 e a dica é o valor exato. Na raiz, a linha "Parte de perdas" repete a grandeza da linha de baixo com outro arredondamento e pode sair (DIC-2).
* `v3`: a linha da dica com a parte do nível ("Parte de pré-venda") sai de arredondamento independente: somada à mão dá 99 na raiz (87, 9 e 3) e 101 em Pré-venda (45, 38, 12 e 6). As parcelas nunca aparecem juntas na tela e nada essencial vive ali; o mesmo `allocate`, com alvo 100, fecharia.
* `v3`: a linha de leitura declara a escala e a base do percentual, mas não traz conclusão (ANO-5), e o valor do nível aparece três vezes no corpo: na migalha, na linha de leitura e no rótulo do total.
* `v3`: o texto da migalha começa 4 px à direita da linha de leitura, pelo `px-1` do botão (37 px contra 33 px, medido no DOM). Só se nota comparando as duas linhas.
* `v3`: o preview abre em Pré-venda, então o passo vazado de Proposta (13 perdas, quinto item do `demonstrates`) e os níveis raiz e Sem contato não aparecem em nenhum PNG de conferência. Quem mexer na repartição ou no shape confere esses três estados clicando, porque o render só fotografa o estado inicial.
