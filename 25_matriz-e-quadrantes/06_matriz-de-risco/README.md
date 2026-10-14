# Matriz de risco em células

## O que é

Probabilidade nas linhas, crescendo de baixo para cima, impacto nas colunas, e cada célula com o nível escrito, a contagem de riscos e, quando a grade é controle, a lista ao clicar. É o modelo da família com a crítica mais bem documentada: a matriz típica compara sem ambiguidade poucos pares de risco, comprime riscos diferentes na mesma célula e pode dar nota maior ao menor. Por isso o nível vem de uma tabela de consulta acordada, nunca do produto dos índices; a cor é resumo grosseiro e anda sempre com número e palavra; os três tons seguem uma rampa de luminância, que sobrevive a daltonismo; e a cor não decide orçamento. Construída em HTML com CSS Grid do Tailwind. O laço percorre as faixas de probabilidade de trás para frente, e esquecer isso inverte a matriz sem erro visível.

## Quando usar

- Catálogo de 10 a 60 riscos avaliados por probabilidade e impacto em faixas com critério numérico.
- Conversa de comitê sobre onde cada risco está e o que mudou desde a última revisão (`v2`).
- A grade serve de filtro para a lista de riscos com dono, gatilho e plano de resposta (`v3`).
- Mostrar a compressão de faixa ao comparar 3x3 e 5x5 sobre os mesmos riscos (`v4`).

## Quando evitar

- Decidir orçamento ou prioridade pela cor da célula.
- Ordenar riscos pelo produto de probabilidade e impacto em escala ordinal.
- Existe estimativa quantitativa de perda com incerteza: dot plot com intervalo (17/02).
- Critérios de faixa vagos: o 5x5 só dá mais formas de discordar.
- Intensidade por gradiente sem nome de grupo: matriz categórica em cor (15/02).

## Anatomia

1. Cabeçalho de impacto em `text-text-secondary` (12 px), com o critério numérico da faixa em `font-display` tabular e a unidade na linha de título, `Impacto em receita, R$ mil`.
2. Cabeçalho de probabilidade na primeira coluna, com a faixa e o critério em `formatPercent`, a mais provável no topo.
3. Célula com o nível escrito e a contagem em `formatInt`, no tom `--seq-1`, `--seq-3` ou `--seq-6` conforme a tabela de consulta; texto `text-text-primary` nos dois primeiros e `text-accent-cyan-contrast` no terceiro.
4. Célula de zero medido: contorno `border-line-subtle`, sem preenchimento, com o dígito 0 em `text-text-muted`.
5. Riscos sem impacto avaliado fora da grade, contados em nota (`v1`, `v2`) ou na faixa hachurada (`v4`).
6. Marca de subida ou descida com `ArrowUp` ou `ArrowDown` e o número de níveis, origem tracejada e destino em contorno cheio (`v2`).
7. Grade com `role="grid"`, navegação por setas e lista de dono, gatilho e resposta (`v3`).
8. Duas grades com tabela de mapa de 5 para 3 faixas e anotação calculada (`v4`).
9. Frase acessível calculada do dado na raiz com `role="figure"`; estado vazio com `role="status"`.

## Versões

- `v1_riscos-do-plano-comercial-5x5`: nível da tabela acordada, laço invertido, critério nos cabeçalhos, três tons e zero distinto.
- `v2_movimento-desde-o-ultimo-comite`: marca de subida ou descida com número de níveis na célula de destino e origem tracejada em foco.
- `v3_mapa-de-risco-dos-cenarios-com-lista`: grade como filtro, com setas e lista de dono, gatilho e resposta.
- `v4_compressao-3x3-contra-5x5`: duas grades sobre os mesmos riscos, anotação da compressão e hachura para sem avaliação.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão e troque o `data` padrão pela consulta real, mantendo o tipo exportado.
2. As faixas e a tabela de consulta (`PROBABILITY_BANDS`, `IMPACT_BANDS`, `LEVEL_TABLE`) vêm acordadas com quem responde pelo risco; o componente não valida o acordo.
3. Risco sem impacto avaliado entra com `impact: null`, nunca com 0; o componente o conta fora da grade.
4. Na `v2`, a posição anterior vem em `previous`; na `v3`, dono, gatilho e resposta vêm do registro de riscos.
5. Envolva em `VisualCard` e troque o estado vazio inline por `EmptyState`, mantendo o sentido do texto.

## Referências

- Cox, What's wrong with risk matrices?, 2008 (poucos pares comparáveis, compressão e inversão de ordem).
- Thomas, Bratvold e Bickel, The risk of using risk matrices, 2014 (a multiplicação de escalas ordinais).
- Estudo da família: `_estudo/familias/25_matriz-e-quadrantes.md`.
- Molde de grade com marca de estado: `14_tabelas-visuais/09_matriz-de-comparacao-com-status`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-06, as quatro versões julgadas pela primeira vez: `v1`, `v2`, `v3` e `v4` aprovadas, sem parecer em `validation/`. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

- `v1`, `v2`, `v3` e `v4`: as guardas CONTRASTE-TEXTO, COLISAO-TEXTO e TEXTO-NA-MARCA não mediram nenhuma das quatro (`texto_em_html`), nem a CONTRASTE-MARCA (`sem_marca`). Conferido à mão pelos tokens de `app/src/styles/tokens.css` e pelos PNGs: `--text-primary` sobre `--seq-1` dá 12,69:1 no escuro e 14,82:1 no claro, e sobre `--seq-3` dá 6,33:1 e 9,35:1; `--accent-cyan-contrast` sobre `--seq-6` dá 7,38:1 e 5,45:1; `--text-muted` sobre `--surface-raised` dá 5,21:1 e 5,37:1. O menor vão entre textos do cabeçalho mede 10,5 px, entre "150 a 400" e "400 a 1.000".
- `v1`, `v2`, `v3` e `v4`: a última faixa escreve "> 80%" e "> 1.000" (na `v4`, também "> 60%" e "> 400"), e o `bandIndex` põe nela o valor igual ao limite, como o `data.ts` declara (limite inferior incluso). Estimativa de risco costuma ser número redondo, então "80% ou mais" e "1.000 ou mais" dizem o que a conta faz. Nenhum risco do dado padrão cai em limite.
- `v1`, `v2`, `v3` e `v4`: o critério de impacto sai de `formatInt` com a unidade na linha de título ("Impacto em receita, R$ mil"), não no próprio tique como pede a EIX-6. A unidade se lê uma linha acima, e o tique com unidade não cabe nos 66 px da coluna.
- `v1`, `v2`, `v3` e `v4`: a contagem da célula vai sem o substantivo (NUM-6). A unidade vem da linha de leitura na `v1`, na `v2` e na `v4`, e do título da lista na `v3`.
- `v1`, `v2`, `v3` e `v4`: número escrito dentro de frase sai em Manrope sem `tabular-nums` (TIP-1): linha de leitura e rodapé da `v1`, linha de leitura da `v2`, título e linhas da lista da `v3`, títulos de painel e anotação da `v4`. Os números de célula, de critério e da faixa hachurada usam `font-display` com `tabular-nums`.
- `v1`, `v2`, `v3` e `v4`: `font-display` sem classe de peso herda 400, que o Space Grotesk não carrega (TIP-4): critério das faixas nas quatro, marca de subida da `v2` e texto da faixa hachurada da `v4`. O navegador cai no 500 e o preview não muda; declarar `font-medium`.
- `v1`, `v2` e `v4`: o rodapé da `v1` tem 81 caracteres e o da `v2` tem 117, acima dos 50 da ANO-2, e a linha de leitura da `v4` fica embaixo das grades, não no topo como diz a ANO-5. Nenhum deles corta nem transborda.
- `v1`: o catálogo fala em três tons de baixa saturação, e o degrau `--seq-6` no escuro é o ciano vivo da rampa (`#2db4d2`). É o degrau de cima com texto legível nos dois temas (TOK-2), então a troca depende de token novo, não da versão.
- `v2`: o número da marca ("+1", "+2") não diz que conta níveis e fica ao lado da contagem de riscos da célula (NUM-6). A unidade vem da linha de leitura ("subiram de nível"), e o rodapé explica o tracejado e o contorno cheio sem explicar o número. Uma frase como "Número na marca: níveis que o risco subiu ou desceu" fecha a leitura.
- `v2`: o cartão parado nomeia só o risco em foco, um dos quatro que subiram. Os outros três pedem clique na célula marcada, e nada na tela avisa que ela é clicável (o `button` não tem `cursor-pointer` nem texto de convite). Uma lista dos quatro, com origem e destino, responde "quais riscos" sem interação e pede canvas por número (GEO-1).
- `v2`: os botões das células marcadas ficam dentro do contêiner com `aria-hidden` (`Chart.tsx:144`), então recebem foco de teclado sem nome para o leitor de tela. Tirar o `aria-hidden` da grade e dar `aria-label` a cada botão, como a `v3` faz nas células.
- `v2`: os 2 riscos sem impacto avaliado não aparecem na tela; `outside` só entra na frase acessível, como "21 riscos avaliados". O item 5 da Anatomia deste README diz que a `v2` os conta em nota, como a `v1`, e hoje não conta.
- `v2`: `arriving[0]` (`Chart.tsx:175`) desenha uma marca por célula. Com dois riscos chegando à mesma célula, a linha de leitura contaria os dois e a grade mostraria um. O dado padrão tem um por célula; o preview não desenha esse ramo, nem a marca de descida, nem o risco que perdeu ou ganhou avaliação de impacto, que o laço pula sem declarar (EST-4).
- `v2` e `v3`: o contorno cheio em `--text-primary` (destino na `v2`, seleção na `v3`) mede 14,53:1 e 17,96:1 contra o vão, e 2,09:1 no escuro e 3,30:1 no claro contra o preenchimento `--seq-6` em que encosta (TOK-9). Ele se vê nos dois PNGs; um vão de 1 px em `--surface-raised` por dentro do contorno tira a dependência. O tracejado da origem sobre `--seq-3` mede 6,33:1 e 9,35:1; origem em célula `--seq-6`, que só existe para risco que desce, cairia nos mesmos 2,09:1.
- `v3`: os `columnheader` e os dois títulos de eixo são filhos diretos do `role="grid"`, fora de um `role="row"`, e o `aria-label` da célula escreve "1 riscos" (`Chart.tsx:156`). A navegação por setas foi lida no código, não testada em navegador.
- `v3`: o tipo `Risk` não aceita `impact: null`, e o comentário do `data.ts` e o passo 3 de "Como colar no Farol" dizem que aceita. Quem colar a `v3` com risco sem impacto avaliado só tem o zero à mão.
- `v3`: o cartão não escreve o total nem quantos estão no nível alto (14 e 7 só na frase acessível), e a célula inicial é constante (`INITIAL_CELL`), não a mais cheia do dado. Com outro recorte a lista pode abrir vazia.
- `v4`: a anotação diz "célula alta e alta", e a grade 3 por 3 escreve "Alta" na linha e "Alto" na coluna; o cartão também mistura "3x3" na anotação e "3 por 3" no título do painel. "Probabilidade alta e impacto alto" casa com os cabeçalhos.
- `v4`: nada no desenho liga as 4 células do 5 por 5 à célula do 3 por 3 que as junta; a relação mora só na frase da anotação. Um contorno nas cinco fecharia a leitura, com o cuidado do item do contorno sobre `--seq-6`.
- `v4`: na grade 5 por 5 o nome e o critério de cada faixa de probabilidade ficam a 16 px um do outro e a 18 px do par vizinho (linha de 32 px mais vão de 2 px), então o par se lê pelo tamanho e pela cor do texto, não pelo espaço. As duas faixas sem avaliação ficam 1 px desalinhadas entre os painéis (168 contra 169 px de grade).
- `v4`: a contagem do 3 por 3 agrupa por `GROUP_OF_BAND`, e os cabeçalhos escrevem os limites de `COARSE_PROBABILITY_BANDS` e `COARSE_IMPACT_BANDS`. São duas fontes para o mesmo corte e nada confere que batem; no dado padrão batem.
