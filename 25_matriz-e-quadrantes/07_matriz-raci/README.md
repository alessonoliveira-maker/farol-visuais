# Matriz de responsabilidade (RACI)

## O que é

Etapas de um processo nas linhas, papéis nas colunas e uma letra por célula: R executa, A responde em última instância, C é consultado e I é informado. A regra de governança é uma só, exatamente um A por etapa, e a validação roda em TypeScript e vira coluna de alerta à direita. É uma tabela semântica em HTML com Tailwind (`th scope`), porque a matriz é documento e precisa de leitor de tela. A forma do glifo carrega a diferença entre as letras (A cheio, R contornado em círculo, S contornado em quadrado, C e I só texto) e a cor apenas reforça. Célula com duas letras é legítima e cabe na largura fixa da coluna.

## Quando usar

* Declarar quem executa, responde, é consultado e é informado em cada etapa de um handoff de 5 a 12 etapas por 4 a 8 papéis.
* Auditar governança: etapa sem A, com dois A ou sem ninguém que execute.
* Ver a carga de cada papel em quantidade de R e de A.
* Comparar o processo declarado com o executado no CRM, com as etiquetas PREMISSA e MEDIDO separadas.

## Quando evitar

* O processo ainda não tem dono definido: a matriz congela um desenho que não existe.
* Quem passa oportunidade para quem e em que volume: matriz de adjacência (27/01).
* Estado de execução de cada etapa ao longo do tempo: faixa de status (24/04).
* Ordem e duração das etapas no calendário: cronograma e linha do tempo (família 20).

## Anatomia

1. **Coluna de etapa.** `<th scope="row">` com o nome inteiro, nunca truncado, na ordem do processo (`text-text-primary`).
2. **Cabeçalho de papel.** `<th scope="col">` com `text-text-secondary`; o papel vago leva ícone e a palavra "Vago".
3. **Glifo da letra.** A: círculo cheio `bg-chart-1` com letra em `--accent-cyan-contrast`; R: círculo com contorno `border-chart-1`; S: quadrado com contorno `border-text-secondary`; C e I: só letra em `text-text-secondary` e `text-text-muted`. Cada célula tem um `sr-only` com a letra por extenso.
4. **Legenda das letras.** Uma linha no topo do corpo, com o glifo e o nome de cada letra, escrita uma vez.
5. **Coluna de alerta (v2, v4).** Ícone lucide (`TriangleAlert`, `Check`) e texto do problema, calculada por `validate`; o nome da etapa em alerta ganha peso 600.
6. **Camada medida (v3).** Percentual por `formatPercentFromScale100` sob a letra; divergência acima de 30 p.p. com contorno `border-warning` e percentual em negrito; ausência escrita por `formatUnavailable()`.
7. **Hachura (v4).** Linhas SVG calculadas na largura fixa da coluna, em `--text-muted`, atrás das letras do papel sem ocupante.

## Versões

* [`v1_handoff-declarado`](./v1_handoff-declarado/): 8 etapas do handoff de pré-vendas para vendas por 5 papéis; legenda das quatro letras e célula com duas letras.
* [`v2_alertas-de-governanca-do-handoff`](./v2_alertas-de-governanca-do-handoff/): validação de um A e ao menos um R por etapa, coluna de alerta e rodapé com a carga de R e A por papel.
* [`v3_declarado-contra-executado-no-crm`](./v3_declarado-contra-executado-no-crm/): letra declarada (PREMISSA) contra percentual executado (MEDIDO), divergência acima de 30 p.p. e célula vazia que executa.
* [`v4_rasci-com-papel-sem-ocupante`](./v4_rasci-com-papel-sem-ocupante/): RASCI com a letra S, coluna do papel vago hachurada e alerta na etapa cujo único A está nele.

## Como colar no Farol

1. `html-tailwind` puro: copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`; nenhuma dependência de Recharts.
2. Troque `roles` e `data` pelo desenho real do handoff, mantendo uma entrada de `letters` por papel, na ordem de `roles`.
3. Na v3, `shares` vem do CRM como percentual dos registros da etapa por papel; etapa sem registro entra com `records: 0` e percentuais nulos, nunca zerados.
4. As etiquetas PREMISSA e MEDIDO da v3 ficam na legenda do Chart, porque separam duas camadas no mesmo cartão; a procedência do cartão inteiro continua no `VisualCard` do destino.
5. Embrulhe no `VisualCard`; o Chart não desenha título nem moldura.

## Referências

* [Wikipedia, responsibility assignment matrix](https://en.wikipedia.org/wiki/Responsibility_assignment_matrix): definição de R, A, C e I e da regra de um só A por tarefa, e variantes como RASCI.
* `14/09` (matriz de comparação com status) e `14/06` (tabela cruzada com totais marginais): padrão de tabela semântica e de célula sem caso neste catálogo.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-06, primeira passada, quatro versões julgadas. `v1`, `v2` e `v3` aprovadas; `v4` reprovada por um bloqueante (hachura em `--line-strong`), descrito em `validation/revisao_25_matriz-e-quadrantes__07_matriz-raci_2026-10-06.md`. Os itens abaixo não reprovam.

* `v1`, `v2`, `v3` e `v4`: número escrito dentro de frase sai em Manrope sem `tabular-nums` (TIP-1): a linha de leitura das quatro, "N registros no trimestre" e "30 p.p." na `v3`, a nota de rodapé da `v4`. Os números de passo, de célula e de rodapé usam `font-display` com `tabular-nums`. O preview não muda.
* `v1`, `v2`, `v3` e `v4`: o cabeçalho da primeira coluna, e o de `Governança` na `v2` e na `v4`, não leva `leading-tight` e os de papel levam. Com `align-bottom`, a linha de base dele fica de 1,5 a 2,5 px acima da última linha dos papéis (medido nos quatro PNGs). Igualar a entrelinha dos `th`.
* `v1`, `v2`, `v3` e `v4`: `roles` entra por import do `data.ts` e não por prop. Quem passa outro `data` fica com as colunas do exemplo; o passo 2 de "Como colar no Farol" manda trocar os dois, e uma prop `roles` fecharia a porta.
* `v1`: o `notes` do `meta.json` diz que a etapa de nome longo quebra em duas linhas dentro dos 38 px. No render ela quebra em três e a linha mede 55 px, contra 38 a 40 px das outras sete. O cartão fecha do mesmo jeito; corrigir a conta.
* `v1`: o item de `demonstrates` trocou "declarada no subtítulo", do catálogo, por "declarada na linha de leitura", sem dizer no `notes`. A troca está certa, porque o subtítulo é o `useCase` e o Chart não o escreve; falta declarar o desvio.
* `v1`: o número do passo vai em linha com o nome, então a segunda linha de um nome quebrado começa embaixo do número e não embaixo do nome.
* `v2`: a linha de leitura fecha uma frase em algarismo e abre a seguinte com outro ("é o único R em 6. 2 etapas com problema de governança"). Reescrever para a segunda frase não começar por número. O plural é fixo e sai "1 etapas" com um alerta só.
* `v2`: a regra de pelo menos um R está no `validate` (`sem-r`), mas o dado padrão não tem etapa sem R, então o ramo não aparece no preview.
* `v3`: percentual de composição com uma casa ("91,0%", "0,0%") nas 35 células medidas. A NUM-1 pede inteiro e o dado é inteiro; com 64 registros, "41,0%" promete uma precisão que a base não tem (26 de 64 dá 40,6%). Usar `formatPercentFromScale100(share, 0)`.
* `v3`: as etiquetas PREMISSA e MEDIDO são desenhadas pelo Chart, em `text-prov-*`, porque o catálogo pede; fica a ressalva da ANO-6, declarada no `notes`, como em `25/04` e `25/05`. `--prov-premissa` e `--warning` têm o mesmo hex nos dois temas, então a palavra PREMISSA e o contorno de divergência saem no mesmo âmbar com dois papéis, e a amostra do contorno fica na linha do MEDIDO. Etiquetas em `text-text-secondary` evitariam a leitura cruzada.
* `v3`: a etapa sem registro escreve `formatUnavailable()` cinco vezes, sem o ícone `Unplug` e em `text-text-secondary`, quando a EST-2 pede o ícone e `--text-muted`. A linha já diz "Sem registro no trimestre", que é base vazia e não fonte fora do ar; "sem base" uma vez, pela EST-4, diria melhor.
* `v3`: o percentual não divergente usa `font-display` sem classe de peso e herda 400, que o Space Grotesk não carrega (TIP-4). O navegador cai no 500 e o preview não muda; declarar `font-medium`.
* `v3`: a tela não diz qual é o trimestre; o período só está no comentário do `data.ts`.
* `v3`: com dois R declarados na mesma etapa, a regra de 100 menos o percentual marca os dois como divergentes mesmo quando dividem a execução ao meio. O dado padrão não tem o caso.
* `v4`: "1 de 6 etapas têm nele o único A" não concorda com o um, e a frase acessível fixa o singular ("etapa tem"), que erra com dois alertas.
* `v4`: o cabeçalho `Coordenação de pré-vendas` quebra no hífen, em "de pré-" e "vendas". Hífen não separável (U+2011) ou 4 px a mais na coluna resolvem.
* `v4`: o render mediu diferença acima de 0,5% nos dois temas: 0,58% no escuro e 0,64% no claro, pela réplica à mão, o que é aviso e não erro. Dentro do Chart são 0,43% e 0,45%: o arquivo desenha a primeira linha dos cabeçalhos 1 px abaixo da página e perde a borda da amostra de hachura da legenda, que é `border` de CSS num `<svg>`. O resto é o subtítulo da moldura.
* `v4`: o `notes` fala em cabeçalho do papel vago em 4 linhas, e são 3.
* `v4`: o subtítulo do cartão mostra "2026-08-01", que vem do `useCase` do catálogo, e a nota do Chart mostra "01/08/2026" (NUM-7). Quem corrige é o catálogo.

Revisão de 2026-10-06, segunda passada, só a `v4`, julgada de novo no arquivo corrigido. Aprovada: o bloqueante da primeira passada fechou. A hachura da coluna vaga e a amostra da legenda estão em `--text-muted` e medem, nos dois PNGs, 5,21:1 no escuro e 5,37:1 no claro no miolo do traço, com o pixel suavizado em 3,78:1 e 3,48:1; nenhum pixel de tinta fica abaixo de 3:1. O item 7 da Anatomia já diz `--text-muted`. Os itens abaixo não reprovam.

* `v4`: a moldura da amostra de hachura continua sendo `border` de CSS no `<svg>` (`Chart.tsx`, linha 117). Na página a amostra é um quadrado com moldura; no `preview.svg` sobram só os traços, sem moldura (311 px de imagem de diferença em cada tema). A amostra se lê nos dois. Desenhar a moldura como `<rect>` sem preenchimento dentro do próprio `<svg>`, ou tirar.
* `v4`: a diferença entre página e arquivo segue acima de 0,5% depois da correção: 0,59% no escuro e 0,64% no claro (11.272 e 12.307 de 1.920.000 px), aviso pela seção 12 e não erro. Dentro do Chart são 0,43% e 0,45%, dos quais 8.014 e 8.100 px vêm da primeira linha dos cabeçalhos, 1 px abaixo no arquivo; o corpo da tabela e a coluna hachurada não diferem em nenhum pixel. Sem colisão nem corte.
* `v4`: a hachura recomeça em cada linha da tabela. O passo da linha é 42 px e o da hachura é 8 px, então a diagonal dá um degrau de 2 px em cada divisória (medido nos dois PNGs). `ROW_HEIGHT` de 40 ou 48, ou o deslocamento calculado pelo índice da linha, emenda o traço.
* `v4`: a legenda vai em 11 px e `--text-muted`; a tabela 17.1 dá à legenda 12 px em `--text-secondary` e reserva o `--text-muted` para a ausência. É igual nas `v1`, `v2` e `v3`, mede 5,21:1 e 5,37:1 e não muda a leitura.
* `v4`: o ramo sem papel vago da linha de leitura escreve "N etapas com um só A" a partir de `data.length`, sem contar o resultado de `validate`. Com uma etapa sem A ou com dois A a frase sairia falsa. O dado padrão não chega ao ramo, porque `roles` vem do import.
* `v4`: a conta do `notes` não fecha consigo mesma: soma 386 px e diz que cabe num corpo de 381,5 px. O cabeçalho tem 3 linhas, não 4, e a tinta do Chart mede 374,5 px do topo da linha de leitura ao pé da nota, com 25 px de folga até a borda do cartão. Refazer a soma com o cabeçalho real.
* `v4`: o lado de 16 px da amostra de hachura está escrito à mão nas linhas 117 a 119; cabe numa constante nomeada no topo, ao lado de `HATCH_STEP`.
* `v4`: seguem abertos, da primeira passada, a concordância de "1 de 6 etapas têm", o singular fixo da frase acessível, a quebra de `Coordenação de pré-vendas` no hífen, o `tabular-nums` da linha de leitura e da nota, e o `leading-tight` dos cabeçalhos `Etapa da redistribuição` e `Governança`.
