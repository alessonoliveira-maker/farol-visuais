# Cascata temporal de saldo

## O que é

Uma cascata em que cada passo é um período: o valor do passo é o movimento daquele período e o acumulado é o saldo. O tempo corre da esquerda para a direita, todo período aparece no eixo mesmo sem movimento, e o saldo final fica ancorado com rótulo. Cada passo é uma faixa `[baixo, alto]` de um `Bar` do Recharts com `shape` próprio, que desenha o retângulo, o rótulo e o conector até a coluna seguinte. Em série mais longa, uma `Line` do acumulado no mesmo `ComposedChart` substitui os conectores. Responde como o estoque ou o saldo chegou ao valor de hoje, período a período.

## Quando usar

* Estoque que evolui por período com entradas e saídas, como a fila de pré-vendas ao longo da semana.
* Até 12 períodos com entrada e saída em passos separados, ou até 24 com o movimento líquido por período.
* Saldo que precisa ser lido contra um teto ou um limite, com o período que o cruzou marcado.
* Saldo que pode ficar negativo, como verba de mídia gasta acima do liberado.

## Quando evitar

* Mais de 24 períodos: agregar semana em mês ou usar colunas com linha de acumulado, família 08.
* Pergunta sobre a trajetória do saldo e não sobre a contribuição de cada período: linha da família 04 ou área da família 05.
* Entrada e saída do mesmo período empilhadas na mesma barra: separar em dois passos, como a v1 e a v2.
* Períodos com janelas de data diferentes lado a lado sem aviso.
* Variações pequenas diante de um estoque grande: tirar o estoque do eixo e ancorar o zero na carteira de abertura, como a v3, nunca quebrar o eixo.

## Anatomia

1. **Passo flutuante**: faixa `[baixo, alto]` calculada por função pura (`buildRows`), cada passo nascendo onde o anterior terminou; rótulo com sinal à mão sobre o valor absoluto (`+` ou `−`, NUM-3), na ponta livre da marca.
2. **Total ancorado**: coluna do saldo inicial e do final, ancorada no zero, em `--chart-1`, com o rótulo em `--text-primary` e o substantivo (`formatInt`, `formatCurrencyAxis`).
3. **Conector**: traço de 1 px em `--line-strong` desenhado pelo próprio shape; a banda vem de `usePlotArea`, chamado dentro de um componente. Na v3, a `Line` do acumulado (`--chart-1`, sem pontos) ocupa o lugar dele.
4. **Rótulo de dia no eixo** (v1 e v2): tique customizado que escreve o dia só no passo de entrada, deslocado meia banda para o centro do par, com `interval={0}`.
5. **Passo zero**: traço de 2 px em `--text-secondary` com o rótulo `0`; zero medido não some (REC-11).
6. **Referência**: teto tracejado em `ReferenceLine` com `ifOverflow="extendDomain"` e rótulo (v2); linha do zero em `--line-strong` sólido (todas).
7. **Linha de leitura** (`aria-hidden`, 12 px) calculada do dado com a base nomeada, **dica** (`ChartTooltip`) com o que o rótulo não traz, e **frase acessível** com os dias e meses em minúscula.

## Versões

* `v1_fila-de-pre-vendas-na-semana`: fila de 84 para 72 leads, com entrada e saída de cada dia em passos separados, totais ancorados e o dia agrupando o par no eixo.
* `v2_dia-em-que-a-fila-passou-do-teto`: o mesmo desenho contra um teto de 120 leads, com só o passo do disparo aceso em `--chart-1`, peso 700 e anotação.
* `v3_oportunidades-abertas-em-doze-meses`: `ComposedChart` com faixa do movimento líquido mensal e `Line` do acumulado, mês de líquido zero mantido e rótulo a cada dois meses.
* `v4_verba-de-midia-com-saldo-negativo`: saldo que cruza o zero, faixa atravessando a linha do zero, domínio sobre o acumulado e saldo final negativo desenhado para baixo.

## Como colar no Farol

1. Copiar `Chart.tsx` e `data.ts` da versão para o diretório do visual e trocar o `data` pelo retorno da métrica; os tipos vêm do `data.ts`.
2. Entregar o dado na ordem do tempo, um passo por período, com os períodos sem movimento presentes e valor `0`: o componente os mantém no eixo.
3. Na v1 e na v2, entregar entrada (valor positivo) e saída (valor negativo) do mesmo dia com o mesmo `label`; o tique agrupa pelo `kind`.
4. Na v3, entregar a carteira de abertura (`openingStock`) junto: o zero do eixo é ela, e o fechamento sai de abertura mais o acumulado.
5. Embrulhar num `VisualCard` e trocar o estado vazio inline por `EmptyState`; título e procedência são do cartão.

## Referências

* Método: a cascata (waterfall) de Gene Zelazny, em "Say It With Charts", aplicada ao tempo: cada período é um passo e o acumulado é o saldo.
* Recharts 3.10.1: `Bar` com `dataKey` devolvendo faixa e `shape` próprio, `usePlotArea`, `ComposedChart` com `Line`.
* Farol: `app/src/components/visuals/charts/ChartTooltip.tsx` e `app/src/lib/format.ts`.
* Pedido ao Farol: nenhum formatador escreve o sinal `+`, então cada versão o escreve à mão sobre o valor absoluto.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, as quatro versões julgadas pela primeira vez: `v1` e `v4` aprovadas, `v2` e `v3` reprovadas, com os bloqueantes em `validation/revisao_19_cascata-waterfall__03_cascata-temporal-de-saldo_2026-10-05.md`. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

* `v1`, `v2` e `v4`: o conector é um traço de 1 px em `--line-strong`, medido em 1,79:1 no escuro e 1,83:1 no claro. Foi lido como referência pela ACE-6, como em `01_cascata-de-ponte`: tapado o traço, o nível de cada passo continua na posição das barras e o valor continua escrito.
* `v1`, `v2`, `v3` e `v4`: o bloco de vazio traz só a frase, sem o ícone `Filter` de 16 px da EST-1. Não aparece no preview.
* `v1`, `v2`, `v3` e `v4`: os números da linha de leitura ficam em Manrope sem `tabular-nums` (TIP-1). Sem consequência visível.
* `v2`: corrigida; o teto tem zIndex 100 (abaixo da `Bar`, 300), então o halo abre o traço, e o rótulo que chegaria a menos de 4 px do teto sai do lugar para o lado de fora da linha.
* `v3` e `v4`: o halo dos rótulos é pintado antes da `ReferenceLine` e da `Line` (zIndex 400 contra 300 da `Bar`, emenda de 2026-09-29 da REC-13), então não abre traço nenhum. Na `v3` e na `v4` nenhum rótulo chega perto de linha com o dado fixo; na `v4`, passo que termine a menos de 15 px do zero terá o rótulo riscado pela linha do zero.
* `v1`: os rótulos não têm o halo da ROT-7. Nada cruza com o dado fixo; com a fila perto de zero, o rótulo da saída cai sobre a linha do zero e encosta na faixa do eixo.
* `v1`: os rótulos dos passos (`+30`, `−34`) saem sem o substantivo (NUM-6). "leads" está nos dois totais, na linha de leitura e na dica.
* `v1`: a linha de leitura repete o 84 e o 72 do subtítulo e dos totais. Sem passos de entrada ela escreve `0` literal, enquanto a frase acessível diz "Sem entradas".
* `v1`: o `data.ts` não exercita passo zero nem passo pequeno (seção 3); o ramo `isZero` existe e não é desenhado. A `v3` e a `v4` cobrem o zero.
* `v1` e `v2`: a semana de 2026-09-07 está na linha de leitura e não na frase acessível.
* `v2`: as marcas neutras em `--line-strong` medem 1,79:1 e 1,83:1, que é o aviso `CONTRASTE-MARCA` do check. Valem pela isenção do valor escrito da 17.2 e da ACE-3, e o `notes` já traz o número.
* `v2`: o rótulo do teto fica dentro da área, na altura do próprio traço (`insideBottomLeft`), e a ANO-3 com a REC-4 pedem faixa reservada. Com o dado fixo sobram 37 px até o `76 leads`; com a fila abrindo perto do teto os dois colidem.
* `v2`: o traço do teto usa `4 4`, e a 17.2 dá `3 3` para referência. Sem consequência visível.
* `v2`: a linha de leitura sai com maiúscula depois de dois pontos ("A fila passou do teto"), e a preposição fixa "na" quebra em sábado e domingo.
* `v3`: o traço do mês de líquido zero (fev/26) fica com 11 dos 22 px debaixo da `Line`, e sobra um toco cinza à direita do vértice. O zero se lê pelo rótulo `0` e pelo trecho plano da linha.
* `v3`: o `useCase` pergunta em quais meses a carteira não cresce, e nem a linha de leitura nem a frase acessível nomeiam fev/26, cujo tique não é impresso (rótulo a cada dois meses).
* `v3`: a linha de leitura não diz "o estoque cresce enquanto o fluxo não muda", que segue no `demonstrates`; o `notes` declara a troca. "média de +6,1 por mês" sai sem o substantivo (NUM-6).
* `v3`: o zero do desenho é a carteira de abertura (138), escrita na ponta esquerda da linha de base. Nenhuma barra codifica valor absoluto a partir dela, a `Line` não tem área e o `notes` declara o desvio.
* `v4`: o rótulo direto sai de `formatCurrencyAxis`, e a NUM-1 pede `formatCurrencyCompact`. Com o dado fixo em milhar redondo nada muda; com dado real o passo perde a casa decimal e a soma dos rótulos pode não fechar com o total.
* `v4`: a cor sai do sinal do saldo, sem `goodDirection` no dado. Aqui sinal e polaridade coincidem, porque a métrica é o próprio saldo e gastar acima do liberado é o lado ruim (COR-6); a `v3` não tem essa cobertura, e por isso caiu.

Revisão de 2026-10-05, segunda passada: `v2` e `v3` julgadas de novo pelo arquivo corrigido e pelos PNGs dos dois temas, as duas aprovadas, com `npm run check` em 0 erros e 2 avisos (`CONTRASTE-MARCA`, o neutro em `--line-strong` com valor escrito). Das linhas acima deixaram de valer a COR-6 da `v3` e o teto pintado por cima do halo na `v2`; as demais observações das duas continuam. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

* `v2`: o `104 leads` do total final troca de lado para manter 4 px do teto e fica acima do tracejado, com a tinta a 5,8 px dele e a 22,7 px do topo da própria barra, quase na linha de base do "teto de 120 leads" da outra ponta (96,2 contra 98,2). Lê-se pela coluna, pelo peso e pelo número, mas pede um segundo olhar. Entre 104 e 120 há 16,9 px e o rótulo com respiro pede cerca de 20: a saída é escrever o total ao lado da barra, com margem direita reservada, ou dar mais altura ao corpo.
* `v2`: o `−36` da saída de quinta também fica do outro lado do teto em relação à barra dele. A barra termina 4,2 px acima do tracejado e a tinta do rótulo começa 4,4 px abaixo.
* `v2`: a caixa do rótulo usada na conta do respiro (9 px acima e 3 px abaixo da linha de base) está escrita à mão dentro do shape, em `Chart.tsx:155` e `156`, fora das constantes nomeadas do topo (seção 5). Sem consequência visível.
* `v2`: os tiques de dia e o rótulo do teto saem em Space Grotesk sem `fontWeight`, no peso 400 herdado, que a TIP-4 não lista para essa família. Sem consequência visível.
* `v2` e `v3`: os rótulos dos passos (`+22`, `−18`, `+7`) saem sem o substantivo (NUM-6), como na `v1`. "leads" e "abertas" estão nos totais, na linha de leitura e na dica.
* `v3`: as faixas neutras em `--line-strong` medem 1,79:1 e 1,83:1 e valem pela isenção do valor escrito da 17.2, como na `v2`; o `notes` da `v3` não registra a escolha nem o número.
* `v3`: os tiques de mês (`set/25`) saem do `AXIS_PROPS` em Manrope sem `tabular-nums` (TIP-1). Sem consequência visível.
* `v3`: o eixo imprime de `set/25` a `jul/26`, e o último mês, ago/26, onde está o `211 abertas`, fica sem tique. A data do fechamento só aparece na linha de leitura.
* `v3`: as contagens da linha de leitura e da frase acessível ("11 dos 12 meses") saem por `String()` e não por `formatInt` (seção 8). Igual na tela abaixo de mil.
* `v3`: o toco do traço de fev/26 mede 11,2 px à direita do vértice da `Line`, nos dois temas. Segue como observação: o zero se lê pelo rótulo `0` e pelo trecho plano.
* README, Anatomia, item 2: diz que o total ancorado sai em `--chart-1`. Na `v2` os dois totais são neutros em `--line-strong`, porque o destaque único é o passo do disparo.
