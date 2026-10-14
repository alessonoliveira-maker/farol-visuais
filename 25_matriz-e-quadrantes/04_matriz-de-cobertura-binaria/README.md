# Matriz de cobertura binária

## O que é

Entidades nas linhas, atributos nas colunas e um estado por célula: presente, vazio ou fora da coleta. Responde quem tem e quem não tem cada atributo, como quais origens de lead entregam telefone, cargo, empresa, UTM, cidade e consentimento. Na forma agregada, no estilo UpSet, conta combinações exatas de campos presentes, com matriz de pontos ligados e barras por combinação e por campo. É construída em HTML com CSS Grid, com a barra como div na mesma linha da grade, o que mantém o alinhamento sem sincronizar dois gráficos. O ponto delicado é o terceiro estado: campo fora da coleta não é campo vazio na base.

## Quando usar

- Saber quais entidades têm cada atributo, em até cerca de 12 linhas por 10 colunas (`v1`, 8 origens por 6 campos).
- Auditar cobertura de dado por origem antes de julgar CPL qualificado ou atribuição (`v3`, com piso de 80%).
- Contar combinações de 4 a 30 atributos presentes, onde o diagrama de Venn já não lê (`v2`, 14 combinações em 6 campos).
- Separar campo vazio na base de campo fora da coleta (`v4`).

## Quando evitar

- O valor é quantitativo e não binário: tabela com mapa de calor nas células (14/02).
- Poucas opções comparadas em vários critérios com glifo: matriz de comparação com status (14/09).
- Um único percentual de cobertura por linha de tabela: medidor de cobertura de dado (24/05).
- Relação entre entidades do mesmo tipo: matriz de adjacência (27/01).
- Dezenas de combinações sem corte: mostrar as 9 maiores e agrupar o resto, como na `v2`.

## Anatomia

1. Cabeçalho de colunas em `text-text-secondary`, 11 px, com o nome do campo por extenso.
2. Nome da entidade na primeira coluna, em `text-text-primary`, sem truncar.
3. Marca de estado: ponto cheio em `bg-chart-1`, anel vazio com borda `border-text-muted` e, na `v4`, hachura diagonal em SVG com `var(--text-muted)`.
4. Célula de pelo menos 44 px nas versões de grade, com `aria-label` de entidade, campo e estado.
5. Rodapé com o percentual por coluna, por `formatRateWithVolume` ou `formatPercent`, calculado só sobre quem coleta o campo.
6. Contagem por linha ("5 de 6") por `formatInt`, na última coluna.
7. Legenda dos estados sempre visível, com a mesma forma da marca.
8. Frase acessível calculada do dado na raiz com `role="table"`.

## Versões

- `v1_campos-entregues-por-origem`: ponto cheio e anel, percentual no rodapé e linhas ordenadas pelo total de campos.
- `v2_combinacoes-de-campos-no-estilo-upset`: pontos ligados, barras por combinação e por campo, chave canônica em TypeScript, 9 maiores e demais.
- `v3_cobertura-por-origem-com-limiar-de-80`: percentual na célula, ponto cheio só acima do piso PREMISSA e aviso herdado pelo CPL.
- `v4_campo-fora-da-coleta`: três estados, hachura para campo fora da coleta e rodapé só sobre quem coleta.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão e troque o `data` padrão pela consulta real, mantendo o tipo exportado.
2. Entregue as listas de campos (`fields`) pelo mesmo contrato do dado: a ordem dos estados segue a ordem dos campos.
3. Na `v3`, o piso (`threshold`) vem da página, com a procedência declarada; o aviso de CPL é lido pelo cartão de CPL.
4. Na `v4`, a página precisa distinguir campo fora da coleta de campo vazio: ausência de coleta nunca vira anel.
5. Envolva em `VisualCard` e troque o estado vazio inline por `EmptyState`, mantendo o sentido do texto.

## Referências

- Lex, Gehlenborg, Strobelt, Vuillemot, Pfister. UpSet: Visualization of Intersecting Sets, IEEE TVCG, 2014 (a forma da `v2`).
- Molde de grade com marca de estado: `14_tabelas-visuais/09_matriz-de-comparacao-com-status`.
- Estudo da família: `_estudo/familias/25_matriz-e-quadrantes.md`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-06, as quatro versões julgadas pela primeira vez: `v1`, `v2` e `v3` aprovadas, `v4` reprovada, com o parecer em `validation/revisao_25_matriz-e-quadrantes__04_matriz-de-cobertura-binaria_2026-10-06.md`. Nenhum item abaixo reprova; quem tocar o arquivo alinha.

- `v1`, `v2`, `v3` e `v4`: as guardas CONTRASTE-TEXTO, COLISAO-TEXTO e TEXTO-NA-MARCA não mediram nenhuma das quatro (`texto_em_html`), nem a ESPESSURA-MARCA (`sem_marca_de_barra`, `marca_html`). Medido à mão com os tokens: `--text-muted` sobre o cartão dá 5,21:1 no escuro e 5,37:1 no claro; na faixa `--surface-sunken` da `v3`, `--text-secondary` dá 9,36:1 e 7,04:1, `--chart-1` 10,90:1 e 5,20:1 e `--warning` 9,59:1 e 4,97:1. Nenhum par de texto colide nos oito PNGs; as barras da `v2` medem 16 px no topo e 12 px na lateral.
- `v1`, `v2`, `v3` e `v4`: o estado vazio tem `role="status"` e a frase de 12 px, mas não o ícone `Filter` de 16 px da EST-1. O preview não desenha esse estado.
- `v2`, `v3` e `v4`: os números escritos dentro de frase (linha de leitura da `v2`, nota do piso e aviso da `v3`, nota lateral da `v4`) saem em Manrope sem `tabular-nums` (TIP-1). Os números de coluna usam `kpi-number`.
- `v1`: a frase acessível diz "O campo menos entregue é telefone, presente em 4 de 8 origens", e telefone, cargo, UTM e consentimento empatam em 4 de 8. O `reduce` fica com o primeiro; a frase devia declarar o empate.
- `v1`: sobram 59 px vazios entre a última linha e o rodapé, porque as linhas têm `minHeight` de 44 px e o grupo é `flex-1`. Canvas de 760 por 540 fecha a conta, ou as linhas esticam.
- `v1`: o critério de "Entrega" (campo preenchido na maioria dos leads da origem) só existe no comentário do `data.ts`; o cartão não diz a partir de quanto a origem entrega.
- `v1`: `Consentimento` mede 80 px e cabe por 1 px na coluna de 81,3 px. A legenda está em 11 px e `--text-muted`; a tabela 17.1 dá 12 px e `--text-secondary` ao texto de legenda.
- `v2`: o ponto de ausência de 4 px em `--text-muted` fica em cima do traço de ligação quando o campo ausente está entre dois presentes, e mede 1,82:1 no escuro e 1,12:1 no claro contra `--chart-1` (TOK-9). Sobra 1 px acima e abaixo do traço, visível nos dois PNGs; a ausência ali se lê pela falta do ponto grande. O cartão não tem chave de ponto grande e ponto pequeno, só a linha de leitura.
- `v2`: o rótulo "Leads por campo", que nomeia as barras do topo, mora na coluna lateral, logo acima de "Leads na combinação", e pode ler como segundo cabeçalho das barras laterais.
- `v2`: a linha de demais usa `col-span-6` fixo, que só vale enquanto `fields` tiver seis campos.
- `v2`: o piso de 2 px (`Math.max(2, ...)`) desenharia barra para campo com zero lead, contra a EST-3, e `sideMax` igual a zero dividiria por zero. Nenhum dos dois ocorre no dado padrão.
- `v3`: a etiqueta PREMISSA é desenhada pelo Chart, em `text-prov-premissa`, porque o catálogo pede; fica a ressalva da ANO-6, como em `01_cards-e-kpis/03`. `--prov-premissa` e `--warning` têm o mesmo hex nos dois temas, então a etiqueta, os três anéis de alerta e o triângulo saem na mesma cor com dois papéis. Ao colar, a procedência do piso vem do registry.
- `v3`: quatro elementos em peso 700 (o cabeçalho `Telefone` e os percentuais 41%, 38% e 29%); a TIP-3 admite dois. Os três números são o mesmo destaque e nada colide.
- `v3`: o render mediu 0,67% (escuro) e 0,68% (claro) de diferença entre o SVG e a página, acima de 0,5% e abaixo dos 2% que reprovam. A diferença está toda no texto do aviso e da nota do piso, e vem do kerning das fontes do app que o próprio render acusa (FIDELIDADE).
- `v3`: `rates` é `readonly number[]` e o Chart lê `row.rates[index] ?? 0`, então taxa ausente viraria 0% com anel, entraria na média e dispararia o aviso. O dado padrão traz UTM em 0% exato para evento presencial e lista adquirida, que lê como campo fora da coleta; a versão não tem o terceiro estado da `v4`. Tipo `number | null` com o estado "sem coleta" fecha.
- `v3`: as linhas saem na ordem do dado, que não é alfabética nem por volume (4.210, 3.180, 1.460, 640, 520, 2.350, 980). Ordenar por leads ou por células acima do piso, e dizer qual.
- `v3`: o corpo diz "a partir de 80%" e a frase acessível diz "só acima do piso"; a célula de 80% exato (lista adquirida, empresa) sai com ponto cheio e `aria-label` "acima do piso de 80%".
- `v3`: os percentuais das células estão alinhados à esquerda numa caixa `w-9`, então "8%" e "96%" começam na mesma coluna e a casa das unidades não alinha (TIP-6).
- `v3`: "Média ponderada" não diz o peso nem o volume total (13.340 leads), que só aparece somando as linhas.
- `v3`: a linha tem altura fixa de 44 px e "Indicação de parceiros comerciais" ocupa três linhas de texto com 2,5 px de folga acima e 4 px abaixo. Um nome mais longo transborda; `minHeight`, como na `v1`, deixa a linha crescer.
- `v3`: `threshold` e `fields` são constantes do `data.ts`, não props, embora o passo 3 de "Como colar no Farol" diga que o piso vem da página. A frase acessível e o aviso têm plural fixo ("origens ficam") para uma origem só.
- `v4`: `Consentimento` mede 80 px na célula de 76 px (GEO-7): passa 4,5 px da régua da grade e fica 2,25 px fora do centro dos pontos, sem colidir nem cortar. `CELL_WIDTH` de 82 fecha.
- `v4`: a nota lateral e a frase acessível citam só a primeira célula fora da coleta (`firstOutside`). O `meta.json` trocou o item "Coluna inteira hachurada" do catálogo por "Campo fora da coleta da fonte hachurado", com razão declarada no `notes`: com fontes nas linhas e uma só sem telefone, hachurar a coluna diria que nenhuma fonte coleta. O texto do catálogo é que precisa de ajuste.
- README: o item 7 da Anatomia diz "Legenda dos estados sempre visível"; a `v2` e a `v3` não têm legenda (a `v3` explica o ponto cheio na nota do piso).

Revisão de 2026-10-06, segunda passada, só a `v4`, rejulgada pelo arquivo corrigido (motivo `revisao_desatualizada`): aprovada, sem bloqueante. `npm run check` com tipos em 0 erros e 0 avisos; PNGs das 11:39, posteriores ao `Chart.tsx`. Nenhum item abaixo reprova.

- `v4`: o bloqueante da pergunta 14 não existe mais no arquivo de hoje. A linha do rodapé se chama "Preenchido entre as fontes que coletam o campo", a contagem leva o substantivo ("2 de 3 fontes") e a nota lateral diz o campo e a medida. Os seis pares conferem com o `data.ts`: 67% com 2 de 3, 50% com 2 de 4, 75% com 3 de 4 em empresa e em UTM, 100% com 4 de 4 e 75% com 3 de 4 em consentimento.
- `v4`: o item da GEO-7 acima está resolvido. Com `CELL_WIDTH` de 82, `Consentimento` mede cerca de 80,5 px e fica dentro da régua da grade, com perto de 1 px de cada lado nos dois PNGs. A folga é curta: um nome de campo mais longo volta a passar.
- `v4`: contraste medido à mão nos dois PNGs, porque as guardas de texto seguem sem ler HTML: `--text-secondary` 8,16:1 no escuro e 8,13:1 no claro, `--text-muted` (rodapé, anel e hachura) 5,21:1 e 5,37:1, ponto em `--chart-1` 9,50:1 e 6,00:1. A diferença entre o SVG e a página ficou em 0,01% nos dois temas, por comparação de pixels feita na revisão.
- `v4`: o conteúdo termina em y 322 e a borda do cartão está em y 387, em px do canvas `largo`: sobram cerca de 45 px vazios além do respiro de 20 px. Nada é cortado.
- `v4`: a legenda está em 11 px; a tabela 17.1 dá 12 px ao texto de legenda. Sem consequência visível.
- `v4`: dois ramos que o dado padrão não desenha. Quando nenhuma fonte coleta um campo, o rodapé escreve "sem coleta" à mão, e a EST-2 pede `formatUnavailable()`; e a nota lateral, pelo `?? 0` da linha 158, escreveria "só entre as 0 fontes que coletam". A frase certa ali é que nenhuma fonte coleta o campo.
- `v4`: o critério que faz uma fonte contar como preenchida ou vazia num campo não está no cartão nem no `data.ts`, e o mês da apuração (2026-09) só está no comentário do `data.ts`.
- `v4`: as linhas saem na ordem do dado, que coincide com o total de campos preenchidos em ordem decrescente (6, 5, 3 e 3), sem declarar. `fields` é constante importada do `data.ts` e não prop, embora o passo 2 de "Como colar no Farol" diga que a página entrega a lista.
- `v4`: o `aria-label` da célula diz "presente" e a legenda visível diz "Preenchido", duas palavras para o mesmo estado. `HATCH_STEP` de 7 foge do múltiplo de 2 da ESP-1 e a espessura 1,5 da hachura está escrita duas vezes sem constante; nenhum dos dois aparece no desenho.
- `v4`: as linhas da matriz têm divisória `border-t border-line-subtle`, como na `v1`. A ESP-5 proíbe divisória entre itens e a tabela de tokens dá a `--line-subtle` justamente o papel de divisória; aqui o fio é a régua que leva o nome da fonte até a célula. Fica para o dono da régua dizer se matriz e tabela são exceção.
