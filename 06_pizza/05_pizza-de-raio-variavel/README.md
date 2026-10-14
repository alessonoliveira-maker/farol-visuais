# Pizza de raio variável

## O que é

Uma pizza em que o ângulo de cada setor codifica uma métrica (a participação num todo) e o raio codifica uma segunda métrica, numa escala de raiz quadrada com piso de raio e zero incluído no domínio. É peça de análise exploratória: o olho soma ângulo e raio numa área só, então cada versão precisa de anéis de escala que expliquem o raio, uma legenda que explique o ângulo e uma dica com as duas métricas por extenso. Não é o desenho para um painel operacional de leitura rápida.

## Quando usar

- Aba de análise com 3 a 6 categorias e duas métricas por categoria, uma delas participação num todo.
- Quando o produto de ângulo e raio não induz leitura errada e a dica traz as duas métricas por extenso.
- Peça de exploração que precede uma decisão, não o painel diário.

## Quando evitar

- Painel operacional ou leitura rápida: barras pareadas (família 02) ou dispersão (09).
- Mais de 6 setores ou raios muito próximos: a diferença de raio some; barras pareadas (02).
- Métrica em que raio maior significa pior sem aviso escrito, porque a área grande parece melhor.
- Raio linear no valor, que infla a área ao quadrado: nunca.

## Anatomia

1. Setores em `Pie` com `dataKey` pelo investimento (o ângulo) e `shape` customizado que devolve um `Sector` com o raio calculado por item, sempre com `innerRadius={0}`.
2. Raio com piso, em escala de área, porque o raio linear no valor infla a área ao quadrado (o ponto delicado do estudo). Duas formas convivem no modelo e elas não são equivalentes: a v1 usa `rMin + (rMax − rMin) × √(v/topo)`, e as v2, v3 e v4 usam `√(rMin² + (rMax² − rMin²) × v/topo)`, que é a única em que a coroa acima do piso cresce junto com o valor. Com piso de 30% a forma da v1 desenha 32% da área para 20% do valor, medido; a das outras três erra 0,0000% nos 12 setores conferidos. Quem escrever uma quinta versão usa a segunda forma.
3. Anéis de referência tracejados em `var(--text-muted)` (`3 3`), na mesma escala do raio, cada um com o valor em reais escrito ao lado, num ângulo próprio para nenhum rótulo colidir com o vizinho.
4. Separador entre a fatia e o cartão em `stroke="var(--surface-raised)"`.
5. Cor categórica por slot fixo na ordem 1, 3, 6 dos tokens `--chart-*` (COR-8).
6. Legenda do ângulo: lista com amostra, nome e percentual inteiro que soma 100 (ROT-4, ROT-5, NUM-2), explicando o que a participação no investimento mede.
7. Legenda do raio: nota curta ao lado da primeira, dizendo o que os anéis representam e listando os valores de referência.
8. Linha de leitura no topo do corpo, calculada do dado: o investimento total e quem lidera (ANO-5).
9. Dica (`ChartTooltip`) com as duas métricas da fatia, investimento e CPL qualificado, no mesmo formato de moeda compacta.
10. `data` vazio troca o gráfico inteiro por um bloco `role="status"` (EST-1).

## Versões

- `v1_investimento-e-cpl-qualificado-por-plataforma`: investimento e CPL qualificado do mês em três categorias de mídia. Demonstra o `Pie` com `shape` customizado devolvendo um `Sector` de raio próprio, a escala de raiz quadrada entre piso e raio máximo, os anéis de referência com rótulo em reais e a dica com as duas métricas por extenso.
- `v2_anel-do-cpl-qualificado-alvo`: as mesmas duas métricas contra um alvo. Demonstra o anel de referência tracejado no raio do CPL alvo, o rótulo escrito só no setor que passa do anel (fora do arco, com halo), a anotação curta com nome e valor do alvo, e o "acima do alvo" dito em palavra na legenda, sem cor semântica.
- `v3_entradas-e-taxa-de-agenda-por-fila`: entradas e taxa de agenda em cinco filas da pré-vendas. Demonstra o domínio do raio declarado de 0 a 100% em vez do menor ao maior valor, a legenda lateral tabular com participação, taxa e volume, a taxa com volume na dica por `formatRateWithVolume` e a taxa de fila sem entrada tipada como `number | null`.
- `v4_plataforma-sem-lead-qualificado`: uma plataforma que gastou verba e não gerou lead qualificado. Demonstra o setor no raio mínimo, vazado e com contorno tracejado, o rótulo de CPL indisponível por `formatUnavailable()` com linha de chamada, o ângulo preservado pelo investimento e a divisão por zero resolvida no tipo, nunca `Infinity` no raio.

As quatro versões do catálogo estão no disco, então este modelo não tem seção de versões planejadas.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para uma pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/RadiusPieMedia/`.
2. Troque o `import` do `./data` pelo dado real da página e passe `data` pela prop; o default do `data.ts` fica só como amostra do catálogo.
3. Coloque o componente no corpo de um `VisualCard` com altura definida no pai (`<div className="h-[26rem]">`, por exemplo, para o canvas quadrado) ou passe `height`.
4. Antes de usar fora de uma aba de análise, releia "Quando evitar": o modelo exige a dica e a legenda dupla para não confundir ângulo com raio.
5. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [AG Charts, pie with variable radius](https://www.ag-grid.com/charts/gallery/pie-with-variable-radius/): observar as duas codificações explicadas no tooltip.
- [Highcharts, variable radius pie](https://www.highcharts.com/demo/highcharts/variable-radius-pie): referência de nome do padrão; a página abriu só com título.
- [Vega-Lite, Radial Plot](https://vega.github.io/vega-lite/examples/arc_radial.html): observar a escala `sqrt`, o `zero: true`, o `rangeMin` e o aviso sobre a área total confundir as duas dimensões.
- Farol: `app/src/components/visuals/charts/DonutChart.tsx` (`Pie` com `Cell` por índice e `ChartTooltip`, referência mais próxima já em produção).

## Observações da revisão (não bloqueantes)

- `v1_investimento-e-cpl-qualificado-por-plataforma`: a frase acessível mede 237 caracteres, a 13 do teto de 250 da ACE-1, e é calculada do dado; um recorte com nome de categoria mais longo estoura o teto.
- `v1_investimento-e-cpl-qualificado-por-plataforma`: no raio, valor maior significa pior (CPL mais caro), e o texto na tela só nomeia a métrica ("Raio: CPL qualificado"); o próprio "Quando evitar" pede aviso escrito, então caberia dizer que anel maior é lead mais caro.
- `v1_investimento-e-cpl-qualificado-por-plataforma`: os anéis vivem em `RING_VALUES` fixo (500, 1.500, 2.500) enquanto o raio é normalizado pelo maior CPL do recorte; com outro dado os anéis grandes caem fora do canvas, que é `overflow-visible`. Derivar os anéis do domínio deixaria o modelo colável sem edição.
- `v1_investimento-e-cpl-qualificado-por-plataforma`: o CPL por fatia em número só existe na dica; sem interação o leitor lê o CPL por interpolação entre anéis. É o desenho que o catálogo descreve, fica só registrado.
- `v1_investimento-e-cpl-qualificado-por-plataforma`: a linha de leitura repete o par "redes sociais 54%" que a legenda já imprime ao lado; outra conclusão (o CPL mais caro, por exemplo) aproveitaria melhor a linha.
- `v1_investimento-e-cpl-qualificado-por-plataforma`, `Chart.tsx` linhas 44 a 48 (`radiusForCpl`): a forma `rMin + (rMax − rMin) × √(v/topo)` não fecha a conta de área que o próprio "Quando evitar" cobra. Medido nesta leva com o piso de 32% que a v1 usa: `v = 500` de `topo = 2500`, isto é um quinto do valor, desenha 0,3199 da coroa acima do piso, ou seja quase um terço da área, e `v = 1000` (dois quintos) desenha 0,5127. É o sintoma literal da armadilha GEO-3 ("a fatia com um quinto do valor desenha um terço da área"), e nenhuma guarda do `check` mede raio contra área, então a peça passa verde. A correção é uma linha, a forma usada nas v2, v3 e v4, e ela não foi aplicada aqui porque a v1 é irmã aprovada e o `check` não acusa erro.

Revisão de 2026-10-14 (v2, v3 e v4). A v3 foi aprovada; os bloqueantes da v2 e da v4 estão em `validation/revisao_06_pizza__05_pizza-de-raio-variavel_2026-10-14.md`. Os pontos abaixo não reprovam.

- `v3_entradas-e-taxa-de-agenda-por-fila`: "Part." no cabeçalho da legenda é abreviação (ROT-8); "Participação" por extenso, com a coluna mais larga, ou "% das entradas" dizem o mesmo sem abreviar.
- `v3_entradas-e-taxa-de-agenda-por-fila`: os rótulos `50%` e `100%` ficam à direita da vertical, sobre a primeira fila, livres só porque ela tem 14,1%; num recorte em que a primeira fila passe de 50%, o rótulo de 50% cai sobre o setor e o halo come a marca (GEO-4).
- `v3_entradas-e-taxa-de-agenda-por-fila`: o período ("no mês") só existe na frase acessível; nada no corpo visível diz o recorte (DAD-9).
- `v3_entradas-e-taxa-de-agenda-por-fila`: a frase acessível "lidera com 64,6% (31 de 48) sobre 1.014 entradas no mês" pode ler como 64,6% das 1.014; o total cabe numa oração própria.
- `v3_entradas-e-taxa-de-agenda-por-fila`: `truncate` na linha de leitura, com "5% das entradas" na cauda e fora da frase acessível, e no nome da legenda (TIP-7 latente); hoje cabe com folga.
- `v3_entradas-e-taxa-de-agenda-por-fila`: os anéis em `--text-muted` atravessam a fatia de Indicação de cliente com contraste baixo no tema claro (TOK-10); a leitura do anel se faz sobre o cartão, então fica só registrado.
- `v2_anel-do-cpl-qualificado-alvo`: os rótulos dos setores acima do alvo repetem o CPL que a legenda já imprime; é o desenho que o catálogo pede.
- `v2_anel-do-cpl-qualificado-alvo`: a linha de chamada do alvo sai do anel a 0°; num recorte em que o setor a 0° passe do alvo, ela atravessa a fatia.
- `v2_anel-do-cpl-qualificado-alvo`: no tema claro o render comparou o SVG contra a página em cerca de 0,53% de pixels diferentes (texto do subtítulo e do rodapé), acima do 0,5% da pergunta 21; o render trata como aviso.
- `v2_anel-do-cpl-qualificado-alvo`: `truncate` na linha de leitura, com o valor do alvo na cauda, e no nome da legenda (TIP-7 latente).
- `v4_plataforma-sem-lead-qualificado`: a linha de leitura mede 416 dos 422 px com `truncate`, e a cauda é a conclusão ("não gerou lead qualificado no mês"); seis pixels de folga (TIP-7 latente).
- `v4_plataforma-sem-lead-qualificado`: cotovelo e texto da chamada são constantes no topo direito e o ângulo do setor ausente vem do dado; com o setor ausente na metade de baixo, a linha atravessaria a pizza (ROT-11 latente).
- `v4_plataforma-sem-lead-qualificado`: o rótulo do anel `R$ 2,6 mil` fica 12 px abaixo de `0 leads qualificados` e lê como terceira linha da chamada.
- `v4_plataforma-sem-lead-qualificado`: raio maior é CPL mais caro e nenhum texto diz isso, como na v1.
- `v4_plataforma-sem-lead-qualificado`: a chamada mistura Manrope na primeira linha e Space Grotesk na segunda; um `tspan` com `font-display` só no algarismo unifica a fonte.
- Ferramenta: nenhuma guarda mede rótulo com halo que reentra em parte numa marca (o caso da v2) nem traço de referência que cruza texto sem halo (o caso da v4); as duas passaram verdes no `check`.

Revisão de 2026-10-14, segunda rodada (v2 e v4). As duas foram aprovadas: o rótulo da v2 agora se afasta do arco pelo canto da tinta e o da v4 ganhou o halo. Os pontos abaixo não reprovam, e as observações da primeira rodada que não eram o bloqueante continuam valendo.

- `v2_anel-do-cpl-qualificado-alvo`: `labelAnchor` (linhas 63 a 78) tem números soltos no corpo da função (3,4 px por caractere, mais 2, meia altura 7, passo 0,5 e guarda de 400 voltas) em vez de constantes nomeadas no topo (seção 5). A estimativa é folgada, 72 px de largura contra cerca de 50 px de tinta em `R$ 2,6 mil`, e deixa 13,3 px entre o canto e o arco onde `LABEL_CLEAR` pede 4; sem consequência no preview.
- `v2_anel-do-cpl-qualificado-alvo`: o comentário de `R_MAX` (linha 30) ainda diz "sobram 13 px para o rótulo"; com o afastamento pelo canto, a âncora de `R$ 2,6 mil` fica a 33 px do arco.
- `v2_anel-do-cpl-qualificado-alvo`: latente, além da linha de chamada já anotada: um setor perto de 0° que passe do alvo teria o rótulo empurrado para a altura do centro, na faixa de x 294 a 369 onde está `alvo R$ 1,2 mil`.
- `v2_anel-do-cpl-qualificado-alvo`: a fidelidade do render no tema claro segue em 0,53% (4.849 de 921.600 pixels, igual nas duas comparações), toda no subtítulo do cartão e no rodapé, a partir do "fi" de "qualificado"; o render trata a faixa de 0,5% a 2% como aviso, e a pergunta 21 fala em 0,5%.
- `v4_plataforma-sem-lead-qualificado`: a dica do setor sem CPL medido pinta a amostra com a cor do slot 4 (rosa), que não aparece em lugar nenhum do desenho; o setor é vazado e a legenda usa amostra tracejada. `var(--text-muted)` na linha da ausência casaria a dica com o resto.
- `v4_plataforma-sem-lead-qualificado`: o comentário do `HALO` (linha 50) escreve "vencê lo"; o pronome enclítico leva hífen ("vencê-lo"), que não é separador de frase.
