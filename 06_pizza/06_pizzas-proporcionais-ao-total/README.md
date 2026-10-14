# Pizzas proporcionais ao total

## O que é

Pizzas lado a lado em que a área de cada círculo, não o raio, é proporcional ao total do seu próprio todo, com as fatias mostrando a composição de cada trimestre. O raio sai da raiz quadrada do total sobre o maior total do recorte, as pizzas se alinham pela base, e o total fica escrito por extenso sob cada uma porque a área sozinha o olho subestima (lei de Stevens, expoente perto de 0,8). Lê se primeiro o tamanho relativo entre os círculos e depois a composição de cada um.

## Quando usar

- Composição de 2 a 6 todos com totais muito diferentes, quando a diferença fina de total não importa para a decisão.
- O total e a composição de cada todo precisam aparecer juntos numa leitura aproximada, com o total sempre escrito por extenso.
- Série curta de períodos (trimestre, safra, campanha) em que o crescimento do próprio todo é parte da mensagem, não só a composição.

## Quando evitar

- Diferença de total pequena entre os todos: small multiples do mesmo diâmetro (modelo 04) lê melhor, sem a área competir com a composição.
- Total e composição precisam de leitura precisa, não aproximada: barra 100% empilhada (família 03) ou marimekko (família 26).
- Mais de seis todos: a comparação de área deixa de funcionar; considere barra empilhada (família 03).
- Raio proporcional ao total em vez da área: é o erro clássico da família, incluído aqui só como advertência, nunca como escolha.

## Anatomia

1. Um `PieChart` por trimestre, cada um dentro de um contêiner próprio de altura igual ao diâmetro calculado, todos alinhados pela base com `items-end` no `flex` que os enfileira.
2. `outerRadius` calculado em TypeScript por `radiusForTotal`: raio máximo do conjunto vezes a raiz quadrada do total do trimestre sobre o maior total do recorte, nunca o valor bruto.
3. Total de cada trimestre somado das próprias fatias (`quarterTotal`, fonte única, nunca um campo repetido no dado) e escrito por extenso sob a pizza em `formatCurrencyCompact`.
4. Cor por tipo de cliente fixa entre os trimestres, nos slots 1, 3 e 6 dos tokens `--chart-*` (COR-8), com `Cell` por índice.
5. Percentual inteiro (`integerPercents`, sempre soma 100 por pizza, NUM-2) rotulado dentro de cada fatia por `midAngle`, **vazado em `fill="var(--surface-raised)"` e sem halo**: o rótulo tem a marca inteira por baixo, então quem decide é a ROT-7b, e sobre categórica o vazado é o único texto que passa os 4,5:1 nos dois temas (6,00, 6,18 e 5,39 nos slots 1, 3 e 6, contra 1,53, 2,25 e 1,97 do `--text-primary`).
6. Legenda dos três tipos de cliente, única e no topo, na mesma ordem entre trimestres (ROT-10: o percentual dá o número, a legenda dá o nome). Quando a fatia é pequena demais para o número, a identificação sai **abaixo** da pizza, em lista com taxa e volume, que é a terceira forma que a ROT-10 aceita (v3).
7. Separador entre fatias em `stroke="var(--surface-raised)"`.
8. `data` vazio troca o conjunto inteiro por um bloco `role="status"` (EST-1).
9. `margin` zero no `PieChart`: o padrão da biblioteca é 5 px por lado e desconta o mesmo tanto do raio de toda pizza, o que encolhe a pizza pequena em proporção maior que a grande e desmancha a codificação por área. Com a margem zerada, o `outerRadius` em pixels é exatamente o raio que a função calculou.
10. Régua de tamanho opcional (v2): círculos de referência vazados em `--text-muted`, base alinhada com a das pizzas, desenhados pela **mesma** `radiusForTotal`, com o degrau de cima no maior valor observado do dado (ROT-5b) e o rótulo acima do topo de cada círculo, afastado contra a **caixa** da tinta e não contra a linha de base (GEO-19).
11. Piso de desenho opcional (v4): `MIN_DIAMETER` decide se as fatias são desenhadas, nunca o tamanho da marca. Abaixo dele a pizza vira ponto neutro com o total escrito ao lado, e a escala do conjunto continua a mesma; mês sem fatia nenhuma é outra coisa e escreve `formatUnavailable()` com o ícone `Unplug` (EST-2).

## Versões

- `v1_receita-por-trimestre-e-tipo-de-cliente`: receita reconhecida do 3º trimestre de 2025 ao 2º de 2026, quatro pizzas com fatias por tipo de cliente. Demonstra o `outerRadius` pela raiz quadrada do total, o alinhamento pela base, o total escrito por extenso sob cada pizza e a cor fixa por tipo de cliente entre os trimestres.
- `v2_legenda-de-tamanho`: receita por trimestre e linha de serviço, com uma régua de tamanho ao lado. Demonstra dois círculos de referência vazados em `--text-muted`, desenhados pela mesma função de raio das pizzas, com o degrau de cima calculado do maior total observado (ROT-5b) e o de baixo em um quarto dele, mais a anotação de que a área é aproximada e o total escrito é que manda.
- `v3_leads-por-plataforma-e-qualificacao`: leads do semestre por plataforma e estado de qualificação, em contagem. Demonstra a identificação da ROT-10 **fora** da fatia, por lista abaixo de cada pizza com taxa e volume (`formatRateWithVolume`), o qualificado aceso em `--chart-1` com os outros dois estados em neutro medido, e nenhum texto sobre marca.
- `v4_mes-com-campanha-pausada`: leads por mês e canal, com um mês 40 vezes menor e um mês sem coleta. Demonstra a constante `MIN_DIAMETER` decidindo entre pizza e ponto sem reescalar o conjunto, o palco de altura fixa que alinha as bases de colunas com conteúdo diferente, e a ausência escrita por `formatUnavailable()`, distinta do mês pequeno.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para uma pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/ProportionalRevenuePies/`.
2. Troque o `import` do `./data` pelo dado real da página, com um trimestre (ou safra, campanha) por item e as mesmas categorias em todos eles; passe `data` pela prop.
3. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-64">`, por exemplo, para o canvas largo) ou passe `height`.
4. Se o recorte puder trazer mais de seis todos, filtre antes de passar `data`: o modelo não agrupa sozinho: acima de seis, releia "Quando evitar".
5. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Stephen Few, Save the Pies for Dessert (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/save_the_pies_for_dessert.pdf): observar Playfair na origem da pizza e o teste do círculo 16 vezes maior.
- [Stephen Few, Our Irresistible Fascination with All Things Circular (PDF)](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): observar o infográfico que usou diâmetro no lugar da área.
- [FT Visual Vocabulary, README](https://raw.githubusercontent.com/Financial-Times/chart-doctor/main/visual-vocabulary/README.md): observar a indicação de símbolo proporcional para grandes variações.

## Observações da revisão (não bloqueantes)

- `v1_receita-por-trimestre-e-tipo-de-cliente`: a margem padrão do `PieChart` (5 px em cada lado) come 5 px do raio de toda pizza, então o `preview.svg` desenha raios de 47, 54, 63 e 75 px no lugar dos 51,8, 59,2, 67,8 e 80 px que o `radiusForTotal` calcula; como o desconto é constante, a pizza menor fica com 39% da área da maior em vez dos 42% do dado. Cabe zerar a margem do `PieChart` ou passar `outerRadius` em pixels.
- `v1_receita-por-trimestre-e-tipo-de-cliente`: a frase acessível traz "Quatro pizzas" e "renovação lidera em todo trimestre" em texto fixo; com outro `data` pela prop, a contagem e a conclusão podem deixar de valer. As duas saem do dado sem esforço.
- `v1_receita-por-trimestre-e-tipo-de-cliente`: os totais escritos misturam precisões do `formatCurrencyCompact` ("R$ 890,0 mil" ao lado de "R$ 1,2 mi"), o que dá uma casa decimal diferente por pizza na hora de comparar os totais.
- `v1_receita-por-trimestre-e-tipo-de-cliente`: o `data.ts` não exercita caso difícil (nome longo, fatia mínima, categoria de ausência ou nulo) e os totais ficam a apenas 2,4 vezes de distância, perto do limite em que o próprio modelo manda preferir o small multiples de mesmo diâmetro.
- `v1_receita-por-trimestre-e-tipo-de-cliente`: o nome de cada fatia vive só na legenda, que é `aria-hidden`, e a frase acessível cita apenas renovação; quem lê por leitor de tela não recebe os nomes das outras duas categorias.
- `v1_receita-por-trimestre-e-tipo-de-cliente`, defeito relatado e não consertado aqui, porque o `check` o dá como **aviso de dívida** e não como erro: o rótulo de percentual está em `--text-primary` com halo dentro da fatia, e a guarda `TEXTO-NA-MARCA` mede 1,53:1 sobre `--chart-1`, 1,97:1 sobre `--chart-6` e 2,25:1 sobre `--info` no tema escuro, contra o piso de 4,50:1 da ACE-3. A versão está na fila de dívida de `TEXTO-NA-MARCA` com três mensagens (`_render/scripts/lib/divida-guardas.json`, linha 115), e o conserto que a ROT-7b pede é o das irmãs v2 e v4: `fill="var(--surface-raised)"` e nenhum halo, em `Chart.tsx` linha 123.
- As irmãs `v2`, `v3` e `v4` já nascem com `margin` zero no `PieChart` e `outerRadius` em pixels, que é o conserto da primeira observação desta lista; em todas as três a área desenhada de cada setor foi conferida contra a participação do valor, setor por setor, e a conferência está no `notes` de cada `meta.json`.

Revisão de 2026-10-14 (`v2`, `v3` e `v4`; a `v3` saiu reprovada pela frase acessível, com parecer em `validation/revisao_06_pizza__06_pizzas-proporcionais-ao-total_2026-10-14.md`). Pontos que não reprovam:

- `v2`, `v3` e `v4`: a cor sai do índice da lista de fatias (`CATEGORY_COLORS[index]` e `STATE_COLORS[index]`, no `Cell` e na legenda), não da chave (COR-3). A lista não é ordenada nem filtrada e o `data.ts` declara a ordem fixa, então o preview está certo; mas o tipo já tem `id` fechado, e um mapa por `id` impede a troca de cor quando o dado real vier em outra ordem. Na `v3` pesa mais, porque o texto acha o qualificado por `id` e o desenho o pinta pela posição.
- `v2`, `v3` e `v4`: número de tela sem `tabular-nums` (TIP-1) no rótulo do trimestre ("1T 2026"), na linha de leitura da `v3` ("46,0% (570 de 1.240)") e no rótulo do mês ("abr/26"). Nenhum está em coluna, então não há consequência visível.
- `v2`: trimestre sem fatia some do desenho em silêncio (`if (total === null) return null`), enquanto a frase conta `data.length`; com um trimestre vazio ela diria "4 pizzas" sobre três desenhadas e a lacuna não seria escrita. A `v4` já mostra a saída, com `formatUnavailable()` e `Unplug`.
- `v2`: o degrau de baixo da régua é 25% do maior total observado; com este dado dá R$ 500,0 mil, com outro sai valor quebrado (R$ 457,5 mil para um máximo de R$ 1,83 mi). A ROT-5b só fixa o degrau de cima, então o de baixo pode arredondar para baixo, ainda calculado do dado.
- `v3`: plataforma com volume zero, ou sem a fatia de qualificado, sai do desenho sem aviso (o `flatMap` devolve lista vazia), quando a EST-3 pede marca e "0 leads" escrito.
- `v3`: a composição sai com uma casa e sem maior resto (NUM-1 pede percentual de composição inteiro, NUM-2 pede soma 100). Neste dado as três taxas fecham 100,0 em toda plataforma; com outro podem fechar 99,9 ou 100,1.
- `v3`: `--text-secondary` como preenchimento de "Em análise" não tem papel na tabela 17.2 e é também a cor do nome na mesma peça; os dois neutros medem cerca de 1,57:1 entre si no escuro e 1,51:1 no claro, separados só pelo vão de 2 px (COR-5 cumprida). Mesmo arranjo já aprovado em `22_unidades-waffle-e-pictograma/01_waffle/v2`; fica registrado para quando existir o token de neutro da proposta P7.
- `v4`: a frase diz "5 pizzas" para três pizzas, um ponto e um mês indisponível, e o trecho "sai como ponto sem composição" é fixo no menor mês sem consultar `MIN_DIAMETER`: com dado em que o menor mês passe de 24 px, a frase afirma um ponto que não existe. Derivar o trecho do mesmo teste que decide o desenho.
- `v4`: com dois meses ausentes a frase sai "jul/26 e ago/26 está indisponível"; o verbo precisa concordar com a contagem.

Revisão de 2026-10-14, segunda rodada (`v3`, `revisao_desatualizada`; aprovada, porque a frase acessível agora traz as três plataformas com `formatRateWithVolume`, em 219 caracteres). Pontos que não reprovam, e as observações da `v3` da rodada anterior continuam valendo:

- `v3`: a frase acessível não tem teto. Cada plataforma acrescenta de 30 a 45 caracteres: com 4 o dado padrão chega perto de 248, com 5 passa de 290 e com 6, que o modelo aceita, chega perto de 325, acima dos 250 da ACE-1. O parecer anterior já pedia prever o teto: acima de quatro plataformas, cair para a fração sem o volume, ou para a maior e a menor fração.
- `v3`: o `notes` do `meta.json` diz que a frase mede 218 caracteres, e o preview mede 219; e diz que a TEXTO-NA-MARCA sai não medida por `sem_texto_sobre_fundo`, quando o `check` a dá por `texto_em_html`, como o próprio `notes` reconhece mais adiante.
- `v3`: o contorno de 2 px em `--surface-raised` (COR-5) cobre 1 px por dentro da borda de toda pizza, então a área visível da menor é 0,243 da maior em vez de 0,250 (raio visível de 37 contra 75 px), e a do meio 0,494 em vez de 0,500. Imperceptível, e a RAIO-CONTRA-AREA mede o `path` e não vê; registrado porque o `notes` afirma que a conta fecha exatamente.
- `v3`: `biggest` sobrou da frase antiga e hoje só entra na guarda do vazio; pode sair, deixando a guarda em `bestRate` e `totalMax`.
