# Cascata com faixa de cenário

## O que é

Uma ponte em que os passos incertos carregam intervalo declarado (mínimo, esperado, máximo) e a saída sai como faixa com o esperado marcado. Cada coluna é uma faixa `[baixo, alto]` de um `Bar` do Recharts com `shape` próprio: o `Bar` recebe o envelope de tudo o que a coluna toca, e o shape calcula, com a escala em px por real (altura ÷ amplitude), onde ficam o esperado, o mínimo e o máximo. O intervalo é desenhado dentro do shape porque o `ErrorBar` trabalha sobre valor único e aqui a série é uma faixa. Lê-se da esquerda para a direita: barra sólida é o valor esperado, traço com tampas é o intervalo do passo, faixa translúcida é a saída com linha no esperado. Responde onde nasce a incerteza do resultado, e não só quanto ela mede no fim.

## Quando usar

* Projeção de receita, custo ou capacidade em que 2 a 5 passos têm incerteza declarada e o resto é certo.
* Decisão que depende de saber qual passo, se medido, estreita a faixa do total.
* Capacidade contra demanda de um período futuro, com a demanda como linha de referência.
* Cenário que pode ultrapassar um teto medido, com a parte inalcançável hachurada.
* Dado com 4 a 7 colunas; acima disso o rótulo de duas linhas deixa de caber no passo.

## Quando evitar

* Existe número único auditável: ponte simples, modelo 01 da família.
* A pergunta é a distribuição do resultado e não o caminho: família 16.
* Cenário como trajetória no tempo: área com faixa, família 05.
* Faixa do total obtida somando mínimos e máximos dos passos sem declarar a regra: infla o intervalo. Aqui a faixa vem da origem (simulação conjunta) e a soma dos extremos aparece só como comparação.
* Passos pequenos diante de totais grandes e canvas baixo: com o eixo a partir do zero (EIX-1) o intervalo vira poucos pixels. Aumentar o canvas ou tirar as colunas de total; nunca quebrar o eixo.

## Anatomia

1. **Base certa** (`kind: 'base'`): coluna ancorada no zero, sólida, `--chart-1`, rótulo por `money` (`formatCurrencyAxis`, e duas casas no milhão por `formatDecimal`).
2. **Passo**: corpo de `start` até `start + esperado`, cor por sinal (`--positive`, `--negative`) ou neutro com destaque, e rótulo com sinal à mão sobre o valor absoluto (NUM-3).
3. **Intervalo do passo**: traço de 2 px em `--text-primary` com tampas, de `start + mínimo` até `start + máximo`; o trecho que cruza o corpo (haste e a tampa interna) vira `--surface-raised`, fundo próprio contra o corpo (TOK-10); passo certo (mínimo igual ao máximo) não tem traço.
4. **Saída em faixa**: retângulo de `fillOpacity` 0,7 (acima do mínimo de 0,66 de `--chart-1` na ACE-5) de mínimo até máximo, com linha de 2 px em `--text-primary` no esperado e a faixa escrita embaixo (`de` e `a`).
5. **Regra da faixa**: `rule` do dado, escrita na linha de leitura; a soma dos extremos é calculada (`number | null`) e dita quando a faixa é mais estreita.
6. **Conector**: traço de 1 px em `--line-strong` do fim de cada coluna ao começo da seguinte; `usePlotArea` dá a largura da banda.
7. **Referência** (v3 e v4): `ReferenceLine` tracejada em `--text-muted` com `ifOverflow="extendDomain"`; o rótulo da coluna sobe para acima da linha quando ela o riscaria.
8. **Fechamento verificado**: `closureGap` devolve `number | null` e só escreve na linha de leitura se a soma dos esperados não bater com o esperado da saída.
9. **Dica** (`ChartTooltip`) com esperado, intervalo e acumulado, que o rótulo não traz; **frase acessível** calculada do dado, com rótulos em minúscula.

## Versões

* `v1_receita-do-proximo-trimestre-em-faixa`: receita de 2026-T4 com base certa, três passos com intervalo e saída de R$ 1,56 mi a R$ 1,78 mi; faixa da origem contra a soma dos extremos.
* `v2_onde-a-faixa-nasce`: mesma projeção com o passo de maior amplitude em `--chart-1`, os demais neutros, amplitude escrita e anotação ancorada.
* `v3_capacidade-contra-demanda-em-2027`: capacidade em entradas por mês contra demanda de 290; a parte da faixa abaixo da demanda marcada com `--negative`, palavra e sinal.
* `v4_cenario-acima-do-teto`: faixa de R$ 1,80 mi a R$ 2,40 mi contra teto de R$ 2,10 mi; trecho acima do teto hachurado e rotulado, esperado marcado perto do teto.

## Como colar no Farol

1. Copiar `Chart.tsx` e `data.ts` da versão e trocar o `data` pelo retorno da projeção; os tipos (`ScenarioBridge`, `ScenarioItem`) vêm do `data.ts`.
2. Entregar os itens na ordem da ponte (base, passos, saída), com mínimo, esperado e máximo de cada um e a faixa da saída vinda da origem; o componente confere o fechamento do esperado.
3. A regra da faixa (`rule`) e, na v3, a origem de cada número (`basis`) precisam vir do dado: sem eles a linha de leitura e a dica ficam sem o que dizer.
4. Embrulhar num `VisualCard` e trocar o estado vazio inline por `EmptyState`; título e procedência são do cartão.

## Referências

* Método: a ponte (bridge) de Gene Zelazny, em "Say It With Charts", com o intervalo de cenário desenhado como barra de erro por passo.
* Recharts 3.10.1: `Bar` com `dataKey` devolvendo faixa e `shape` próprio, `usePlotArea`, `ReferenceLine` com `ifOverflow`.
* Farol: `app/src/components/visuals/charts/ChartTooltip.tsx` e `app/src/lib/format.ts`.
* Pedido ao Farol: `formatCurrencyCompact` arredonda o milhão a uma casa e esconderia a faixa (R$ 1,56 mi viraria R$ 1,6 mi); as versões escrevem o milhão com `formatDecimal(valor, 2)`. Um formatador de moeda compacta com duas casas no milhão resolve.
* Pedido ao Farol: nenhum formatador escreve o sinal `+`, então cada versão o escreve à mão sobre o valor absoluto.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-06, sobre as quatro versões. Os bloqueantes estão em `validation/revisao_19_cascata-waterfall__05_cascata-com-faixa-de-cenario_2026-10-06.md`; aqui fica só o que não reprova.

* `v1` a `v4`: o conector é um traço de 1 px em `--line-strong`, medido no PNG em 1,79:1 no escuro e 1,83:1 no claro. Lido como referência pelo teste da ACE-6: tapado o traço, o nível de cada passo continua na posição do corpo e o valor continua escrito.
* `v1` a `v4`: o estado vazio não traz o ícone `Filter` de 16 px da EST-1.
* `v1` a `v4`: a linha de leitura tem números em Manrope sem `tabular-nums` (TIP-1). Na `v3` e na `v4` o rótulo da linha de referência usa `font-sans` também sem `tabular-nums`.
* `v1`, `v3` e `v4`: a linha de leitura ocupa duas linhas (ANO-5). Na `v1` a primeira frase repete a faixa e o esperado que já estão no subtítulo e na coluna de saída.
* `v1`, `v3` e `v4`: mínimo e máximo de cada passo só aparecem na dica (DIC-1). Sem eixo de valor, o desenho parado mostra o tamanho relativo do intervalo, não os limites.
* `v1` e `v4`: a linha do esperado sobre a faixa `--chart-1` a 0,7 mede 2,74:1 no escuro. Fica isenta pela ACE-3 porque o valor está escrito sobre a coluna e as pontas de 7 px saem sobre o cartão.
* `v1` a `v4`: rótulo direto abaixo do milhão por `formatCurrencyAxis` (NUM-1), já declarado nas Referências como pedido ao Farol.
* `v2`, `v3` e `v4`: o campo `rule` do dado não é escrito na tela, na frase acessível nem na dica. O item 5 da Anatomia e o passo 3 de Como colar no Farol dizem que ele vai na linha de leitura, o que só vale para a `v1`.
* `v2`: a dica pinta a amostra em `--positive`, `--negative` e `--chart-1` (`Chart.tsx:241`), enquanto no desenho a base, a saída e dois passos são neutros. O destaque aparece na dica em marcas que não são o destaque.
* `v2`: a anotação repete palavra por palavra o fim da linha de leitura e não traz valor (ANO-2).
* `v2`: o neutro usa `--text-secondary`, que não é papel de marca na tabela 17.2. Mede 8,16:1 e 8,13:1 contra o cartão, sem consequência de leitura.
* `v2`: concordância em "Novos contratos tem amplitude" e "novos contratos concentra".
* `v3`: a parte da faixa em `--positive` a 0,7 mede 3,03:1 no claro, 0,03 acima do piso da ACE-5.
* `v3` e `v4`: a linha de referência (demanda, teto) tem `zIndex` 250, abaixo da barra (300), e passa por baixo das marcas (REC-13).
* `v3` e `v4`: o rótulo da linha de referência fica na altura da própria linha, dentro da área, e não numa faixa reservada (ANO-3, REC-4). O traço tem 1,5 px contra 1 px da tabela 17.2.
* `v3`: "cai a 86% da faixa" não diz de que ponta se conta. São 86% da faixa abaixo da demanda.
* `v4`: "R$ 2,05 mi" e "acima do teto," têm linhas de base a 1,1 px uma da outra, com vão de 10 px. Passa na ROT-9, mas lidos em sequência formam "R$ 2,05 mi acima do teto", o contrário do dado.

Revisão de 2026-10-06, segunda passada, sobre as quatro versões depois da correção (`revisao_desatualizada`). As quatro aprovadas: os três bloqueantes do parecer anterior foram conferidos como resolvidos no arquivo e nos PNGs de hoje. O que segue não reprova.

* `v1` a `v4`: o trecho do intervalo dentro do corpo, agora em `--surface-raised`, mede nos PNGs 7,36:1 e 5,34:1 sobre `--positive`, 5,50:1 e 6,36:1 sobre `--negative`, 9,50:1 e 6,00:1 sobre `--chart-1` e 8,16:1 e 8,13:1 sobre o neutro (escuro e claro). Registro da medida, sem pendência.
* `v1` a `v4`: tampa que cair a menos de 1 px da borda do corpo continua em `--text-primary` (condições `bodyTop + 1` e `bodyBottom - 1`) e fica com metade da espessura sobre o corpo. Não acontece no dado do preview.
* `v1` e `v4`: a linha do esperado sobre a faixa `--chart-1` a 0,7 mede 2,77:1 no escuro nesta medição e 5,48:1 no claro. Continua isenta pela ACE-3: valor escrito sobre a coluna e pontas de 7 px sobre o cartão a 14,53:1.
* `v1`: a frase acessível escreve "passos com intervalo" sem forma singular; com um único passo incerto sai "1 passos".
* `v2`: a guarda `OPACIDADE-MARCA` saiu `sem_opacidade_em_marca`, mas a faixa de saída tem `fillOpacity` de 0,7 sobre `--text-secondary`. Medido à mão no PNG: 4,65:1 no escuro e 3,77:1 no claro contra o cartão.
* `v2` e `v3`: o comentário do topo do `Chart.tsx` diz "corpo ≈ 894 x 265 px", que é o corpo do `largo`; o canvas de 960x480 dá 894x345. Na `v2` a nota do `meta.json` desconta 44 px de leitura, mas a linha de leitura ocupa uma linha e a plotagem mede 223 px, não 187.
* `v3`: `MARGIN.top` vale 47, fora do múltiplo de 2 da ESP-1, e a nota do `meta.json` ainda fala em margem de 44 e em cerca de 205 px de plotagem, que mede 222 px.
* `v3`: o respiro entre o descendente do "p" de "entradas por mês" e a marca mede 2,5 px em Contratações, Rampa e saída e 3 px em Capacidade atual, igual nos dois temas. Sem contato.
* `v3`: a ponta direita da linha do esperado (x=730,65) encosta no colchete de "abaixo da demanda" (de 730,65 a 732,65), sem vão. Lê como junção e não muda a leitura; 2 px a mais no afastamento do colchete separam os dois.
* `v3` e `v4`: há números de posição sem nome dentro do shape (8, 16 e 28 de afastamento lateral; 10, 12, 6 e 3 no teste de choque do rótulo com a linha de referência). A pergunta 22 pede constante de desenho nomeada no topo.
* `v4`: a tampa de cima de Cancelamentos cai na altura exata do teto (R$ 2,10 mi) e sai inteira nos dois temas, como fenda de 14 px no corpo alinhada ao tracejado, que agora passa por baixo das marcas.
* `v4`: continua valendo a observação sobre "R$ 2,05 mi" e "acima do teto," na mesma linha. Vão medido por varredura: 10 px no escuro e 10,5 px no claro.
* `v1` a `v4`: continuam valendo, sem mudança no arquivo de hoje, as observações do parágrafo anterior sobre conector, estado vazio, `tabular-nums`, linha de leitura em duas linhas, mínimo e máximo só na dica, `rule` sem uso na `v2`, `v3` e `v4`, cores da dica e anotação da `v2`, e rótulo da linha de referência dentro da área.
