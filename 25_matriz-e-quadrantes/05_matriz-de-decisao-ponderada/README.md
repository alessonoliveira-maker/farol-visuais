# Matriz de decisão ponderada

## O que é

Opções nas linhas, critérios nas colunas, o peso de cada critério escrito na tela, uma nota por célula e um total por opção, normalizado pela soma dos pesos. É a matriz de escolha entre desenhos, cenários ou alternativas quando a decisão precisa ser auditável. O desenho enfrenta as fraquezas conhecidas do método: o requisito eliminatório em passa e não passa vem antes da soma, e a opção que falha sai do ranking riscada com o motivo, mesmo com o maior total; critério com medida real usa a medida normalizada, e a nota ordinal fica marcada como julgamento; a sensibilidade do vencedor a variações de peso é calculada em TypeScript. Construída em HTML com CSS Grid do Tailwind, com a barra de peso e a barra empilhada de total feitas de divs. Nota ausente nunca vira zero na soma.

## Quando usar

- Escolher entre 3 e 6 opções com pesos explícitos e acordados por critério (de 3 a 4 opções nas quatro versões).
- Existem requisitos obrigatórios que eliminam opção antes de qualquer soma (`v3`).
- A diretoria precisa ver por que o vencedor vence, critério a critério (`v2`).
- Testar se a escolha se sustenta quando algum peso varia 20% (`v4`).

## Quando evitar

- Os pesos não foram acordados: a matriz dá cara de ciência a um palpite.
- Comparar opções em critérios, sem peso nem total: matriz de comparação com status (14/09).
- Perfil de uma opção só em muitos critérios: radar (família 18).
- Muitos critérios menores diluindo um requisito obrigatório, sem faixa eliminatória: use a `v3`.
- Notas ordinais somadas quando há medida real, como custo em reais ou prazo em meses: normalize a medida, como na `v3`.

## Anatomia

1. Cabeçalho do critério em `text-text-secondary`, 11 px, com o nome por extenso e o peso em `formatPercent` sobre a soma dos pesos; na `v1` uma barra fina em `bg-text-muted` na escala do maior peso.
2. Nome da opção na primeira coluna, sem truncar; o primeiro do ranking em peso 700.
3. Célula com a nota (`formatInt`) e a contribuição ponderada abaixo (`formatDecimal`, duas casas); na `v3` a medida real e a nota normalizada.
4. Líder de cada critério com contorno `ring-text-secondary`, sem cor saturada (`v1`); empate contorna todos os empatados.
5. Coluna de total à direita em `bg-surface-sunken`, em `font-display` tabular, com a posição (`1º de 3`).
6. Barra empilhada de total em divs, um segmento por critério na cor `--chart-N` do cabeçalho, com vão de 2 px em `border-surface-raised` (`v2`).
7. Faixa eliminatória em passa e não passa, etiqueta de procedência `text-prov-*` por critério e linha de `julgamento` na nota ordinal (`v3`).
8. Linha de sensibilidade sob o cabeçalho e selo de decisão sensível ao peso no lugar da coroa (`v4`).
9. Frase acessível calculada do dado na raiz com `role="table"`; estado vazio com `role="status"`.

## Versões

- `v1_desenhos-de-remuneracao-variavel`: barra de peso acima da coluna, nota com contribuição, total normalizado e líder do critério com contorno.
- `v2_decomposicao-do-total-por-criterio`: total como barra empilhada por critério, cor igual no cabeçalho e no segmento, diferença para o 2º e anotação da vantagem.
- `v3_cenarios-de-orcamento-2027-com-eliminatorio`: eliminatório antes da soma, cenário de maior total riscado, medida normalizada, julgamento marcado, procedência e receita em faixa.
- `v4_decisao-sensivel-ao-peso`: prova de variação de 20% por peso, selo de sensibilidade, vencedor alternativo na tabela e nota ausente como sem nota.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão e troque o `data` padrão pela consulta real, mantendo o tipo exportado.
2. Os pesos vêm da página e precisam estar acordados antes: o componente normaliza pela soma, mas não valida o acordo.
3. Na `v3`, o limite do eliminatório e a procedência de cada critério vêm da página; a normalização usa todos os cenários, inclusive o eliminado.
4. Na `v4`, a variação de peso (`weightShift`) vem da página; o componente refaz a soma, sem chamada externa.
5. Envolva em `VisualCard` e troque o estado vazio inline por `EmptyState`, mantendo o sentido do texto.

## Referências

- Kepner e Tregoe, matriz de decisão com requisitos obrigatórios e desejáveis (a ideia do eliminatório da `v3`).
- Triantaphyllou, análise de sensibilidade em decisão multicritério, 2000 (a prova de variação de peso da `v4`).
- Molde de grade com marca de estado: `14_tabelas-visuais/09_matriz-de-comparacao-com-status`; molde de tabela cruzada: `14_tabelas-visuais/06_tabela-cruzada-com-totais-marginais`.
- Estudo da família: `_estudo/familias/25_matriz-e-quadrantes.md`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-06, as quatro versões julgadas pela primeira vez: `v1`, `v2`, `v3` e `v4` aprovadas, sem parecer em `validation/`. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

- `v1`, `v2`, `v3` e `v4`: as guardas CONTRASTE-TEXTO, COLISAO-TEXTO e TEXTO-NA-MARCA não mediram nenhuma das quatro (`texto_em_html`), nem a ESPESSURA-MARCA (`marca_html`, `sem_marca_de_barra`). Medido à mão com os tokens: `--text-muted` sobre o cartão dá 5,21:1 no escuro e 5,37:1 no claro, e sobre `--surface-sunken` dá 5,98:1 e 4,65:1; `--warning` sobre `--surface-sunken` (linha de sensibilidade e "incompleto" da `v4`) dá 9,59:1 e 4,97:1, par que a tabela 17.10 ainda não lista; `--prov-derivado` sobre o cartão dá 6,47:1 e 6,18:1; as cinco categóricas da `v2` medem de 5,90:1 a 9,50:1 no escuro e de 5,39:1 a 6,25:1 no claro. O menor respiro entre dois textos da mesma linha, medido nos PNGs, é de 8 px (total e diferença da `v2`).
- `v1`, `v2`, `v3` e `v4`: números em Manrope sem `tabular-nums` (TIP-1): a posição `1º de 3` da coluna de total (`v1`, `v3`, `v4`), a diferença ao lado do total da `v2`, a linha de sensibilidade da `v4`, os cabeçalhos "Total de 0 a 5" e "Total de 1 a 5" e os números dos rodapés. Sem desalinho visível no preview, porque as colunas alinham à direita e os números têm a mesma contagem de dígitos.
- `v1`, `v2`, `v3` e `v4`: `font-display` e `kpi-number` sem classe de peso herdam 400, que o Space Grotesk não carrega (TIP-4). O navegador cai no 500 e o preview não muda; declarar `font-medium` na contribuição, na medida, na nota e no peso.
- `v1`, `v2`, `v3` e `v4`: `border-t border-line-subtle` nas linhas com `display: contents` não desenha nada, e a ESP-5 proibiria a divisória se desenhasse. Na `v4` vale o mesmo para `rounded bg-surface-sunken` da linha de sensibilidade. Classe morta.
- `v1`, `v2`, `v3` e `v4`: o peso sai de `formatPercent(peso / soma, 0)` sem o maior resto da NUM-2. Com os pesos do dado padrão soma 100; com três pesos iguais somaria 99.
- `v1`: o aviso AGREGACAO-ZERO do check (linha 104, `maxWeight > 0 ? … : 0`) é só largura de barra e não chega a texto.
- `v2`: a anotação "1º: apuração simples +0,60 de +0,50 sobre o 2º" está certa na conta (o 1º abre 0,60 em apuração simples e devolve 0,10 em justiça interna), mas "+0,60 de +0,50" se lê como parte maior que o todo. Redação que cabe nos 50 caracteres da ANO-2: "1º abre +0,60 em apuração simples e fecha em +0,50".
- `v2`: o cabeçalho diz "Total de 0 a 5" (a barra parte do zero, EIX-1) e a `v1` e a `v4` dizem "de 1 a 5" (a faixa possível da nota). As duas frases são verdadeiras; alinhar a redação entre as irmãs.
- `v2`: com os slots 6 e 2 juntos, a COR-8 pede vão e rótulo em cada marca. O vão de 2 px existe; o rótulo vem da célula da mesma linha, porque o menor segmento tem 3,6 px de tinta (0,20 de justiça interna no 3º). A identificação se apoia na ordem fixa dos segmentos, igual à das colunas. No ramo de nota ausente a barra some e "incompleto" sai em 14 px numa caixa de 40 px.
- `v3`: a conversão do funil sai como `12,4%` sem o volume (NUM-1, DAD-1), e o `data.ts` declara a fração pronta. A linha traz os leads por mês do cenário na coluna do eliminatório, mas não como base da taxa. Declarar contagens e escrever com `formatRateWithVolume` é a primeira coisa a alinhar: a diferença de 0,7 ponto percentual entre o 1º e o 2º vira 2,2 pontos de nota depois de normalizada.
- `v3`: a normalização usa os quatro cenários, inclusive o eliminado, como o `meta.json` e este README declaram. Com o dado padrão essa escolha decide o vencedor: com Expansão na escala, Equilibrado vence por 2,98 a 2,93; normalizando só entre os três que passam, Digital primeiro venceria por 3,75 a 3,67. O rodapé diz "entre os cenários"; dizer "entre os quatro cenários, inclusive o eliminado" e, de preferência, trocar o dado fictício por um em que o vencedor não dependa disso.
- `v3`: a etiqueta de procedência por critério é pedida pelo catálogo, e a ANO-6 proíbe o Chart de desenhar etiqueta de procedência. Lida como a etiqueta do cartão, a ANO-6 não alcança a procedência por critério, que aqui é dado. Sobra o efeito do hex repetido (proposta P6): MEDIDO sai no mesmo verde de "passa", e PREMISSA no mesmo âmbar do triângulo de aviso da receita, que é DERIVADO.
- `v3`: "até 4.800" no cabeçalho do eliminatório vai sem o substantivo (NUM-6), e a célula diz "leads" onde o rodapé diz "leads por mês". A frase acessível escreve "não passa em cabe em pré-vendas".
- `v3`: cenário sem medida do eliminatório (`demand` nulo) cai no ramo de reprovado: ícone e texto em `--negative`, nome riscado e "eliminado antes da soma". O dado padrão não exercita; a ausência pede texto próprio em `--text-muted` (EST-2).
- `v3`: a faixa de receita é montada à mão com `formatDecimal` e "mi", no formato que `formatCurrencyCompact` devolve hoje; se o formatador mudar, a faixa diverge. As faixas centralizadas não alinham pela vírgula (TIP-6). O segundo rodapé tem 92 caracteres contra os 50 da ANO-2, sem corte.
- `v4`: o nome do critério não tem a altura mínima de duas linhas das irmãs, então o "peso 15%" de Segurança de execução fica uma linha abaixo dos outros quatro pesos.
- `v4`: o total de quem tem nota ausente (3,00 sobre 85% dos pesos) entra na ordenação, na contagem "de 4" das outras linhas, na eleição do vencedor e na prova de sensibilidade. Com o dado padrão ele fica em último e nada muda, mas a nota que falta poria esse total entre 2,70 e 3,30, acima do 3º (3,05). Tirar o incompleto da eleição, ou escrever "3º de 3 completos".
- `v4`: a frase acessível diz "com custo do plano 20% maior, Enxuto vence", que se lê como o custo subindo; quem varia é o peso. Escrever "com o peso de custo do plano 20% maior". O `formatDecimal(winnerTotal ?? 0, 2)` da mesma frase é ramo morto, mas escreveria 0,00 no lugar da ausência.
- `v4`: "+20%" sobre "peso 30%" é variação relativa (30 vira 36 pontos) e o cartão não diz; lido como ponto percentual, vira 50%.
