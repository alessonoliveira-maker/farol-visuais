# Rosa de Nightingale

## O que é

Setores de ângulo igual, um por passo de um ciclo (mês, dia da semana), em que o raio muda com o valor: também chamada coxcomb ou área polar. O ganho sobre a barra é o mesmo da pizza, a forma circular só se paga quando o círculo significa alguma coisa (aqui, um ciclo). O risco é maior que numa pizza comum: se o raio fosse proporcional ao valor, a área cresceria com o quadrado do raio e o setor mais alto pareceria várias vezes maior do que realmente é. Por isso **toda versão desta pasta tira o raio da raiz quadrada do valor**, nunca do valor linear, para a área de cada setor crescer na mesma proporção do valor que ela representa. Essa não é uma opção de estilo: é a condição para a peça não mentir.

**A conta tem duas partes, e a segunda é a que já escapou aqui.** A raiz quadrada não basta quando existe furo central: a área de um setor de anel vale `r² − rMin²`, e não `r²`, então a raiz precisa ficar **por fora da soma inteira**, `Math.sqrt(rMin² + (rMax² − rMin²) * v / topo)`, e não do lado de dentro, como em `rMin + (rMax − rMin) * Math.sqrt(v / topo)`. Medido nas quatro versões em 2026-09-28: com a forma errada, dez/25 (R$ 8,4 mil) desenhava **32,7%** da área de out/25 (R$ 42,9 mil), quando a proporção real é **19,6%**, e o desvio chegava a **2,16 pontos percentuais** no mês de pico. Com a forma certa, a área desenhada de cada setor bate com a participação do valor **na casa dos centésimos de ponto**.

**A grandeza lida vai declarada no desenho.** Toda versão traz no rodapé que a comparação se faz pela área do setor e que o ângulo é igual em todos os passos. Sem essa linha, quem chega de uma pizza procura o ângulo, que aqui não diz nada, e quem chega de uma barra compara o raio, que cresce pela raiz e por isso não se compara de forma linear.

## Quando usar

- Magnitude ao longo de um ciclo de 12 meses ou 7 dias, em que a forma circular carrega o sentido do ciclo (v1).
- Peça de capa de painel que já mostra sazonalidade com a média do período como referência (v2).
- Composição empilhada de até 3 camadas por passo do ciclo, com o raio acumulado também em raiz quadrada (v3).
- Ano ou ciclo em andamento, em que parte dos passos ainda não tem dado fechado (v4).

## Quando evitar

- Categorias sem ciclo: colunas (família 03) ou barra horizontal (família 02) leem melhor e não emprestam um sentido circular que o dado não tem.
- Várias métricas por categoria: radar (família 18).
- Leitura exata de valor mês a mês: mesmo com a raiz quadrada corrigindo a área, o comprimento do raio ainda é mais difícil de comparar que o topo de uma coluna; colunas com rótulo (família 03) resolvem melhor quando o número exato importa mais do que o padrão do ciclo.
- Raio linear no valor: **nunca**. A área cresce ao quadrado do raio e o pico do ciclo passa a parecer, na tela, muitas vezes maior do que o segundo lugar, mesmo quando a diferença real é pequena. Todas as versões daqui já corrigem isso; se alguém copiar o padrão e remover a raiz quadrada "para simplificar", reintroduz exatamente esse exagero.
- Raiz quadrada por dentro do piso de raio (`rMin + (rMax − rMin) * Math.sqrt(v / topo)`): **também nunca**. Parece corrigido e não está, porque ignora o furo central; é meio caminho, e meio caminho aqui ainda exagera o pequeno em mais de meio ponto percentual por setor.

## Anatomia

1. Doze (ou sete) setores de ângulo igual, um `Pie` com todo item de peso 1 para o ângulo e `shape` desenhando `Sector`; a versão empilhada (v3) usa SVG puro com `arcPath` próprio, porque o `shape` de um único `Pie` não empilha camadas.
2. Raio de cada setor: `outerRadius = Math.sqrt(rMin ** 2 + (rMax ** 2 - rMin ** 2) * (valor / topoDaEscala))`. É a única forma que entrega área proporcional ao valor com furo central, e as quatro versões escrevem essa conta na mesma função `radiusForValue`, com o porquê em comentário. Empilhado, a mesma fórmula usa o total acumulado até aquela fronteira, não o valor isolado da camada (v3), para a área de cada faixa continuar proporcional ao seu valor.
3. `rMin` como piso de raio: mesmo o menor valor do ciclo desenha um setor visível, nunca uma fatia que desaparece no centro. O piso entra na conta do item 2, não depois dela.
4. Anéis de escala tracejados (`--line-subtle`) em `circle`, com o topo da escala escrito no miolo do anel, onde não disputa espaço com os rótulos de mês do perímetro; o topo é o primeiro múltiplo redondo acima do maior valor fechado. Os anéis são pintados **depois** dos setores: pintados antes, o anel do meio só aparece nos meses curtos, isto é, a referência some justamente onde o valor é alto.
5. Nome do passo do ciclo no perímetro por `formatMonthShort`, sempre em texto horizontal (nunca rotacionado), ancorado à esquerda ou à direita conforme o quadrante.
6. Cor por categoria (v3) nos slots 1, 3, 6 dos tokens `--chart-*` (COR-8); série única (v1, v2, v4) numa cor só (`--chart-1`), com separador `--surface-raised` entre setores.
7. Passo sem dado (v4) com contorno tracejado `--text-muted`, sem preenchimento, e o rótulo "a realizar"; nunca raio zero. O piso de raio desse contorno é escolhido para **não coincidir com nenhum valor plausível** da escala, e a conversão de fração em valor sai da fórmula do item 2: na v4, 0,28 do vão equivale a R$ 7,3 mil, contra R$ 14,2 mil do menor mês fechado. Passo corrente parcial com o mesmo contorno tracejado e a nota "parcial até" a data de corte.
8. Valor acima do teto da escala (v3) tem a marca cortada, e o corte é **declarado**: duas tarjas na cor do cartão atravessando a marca, a marca passando para fora do anel do topo em vez de parar rente a ele, e o valor real escrito no perímetro e no rodapé. Corte calado desenha dois valores diferentes do mesmo tamanho e o leitor conclui empate onde há diferença. O precedente do acervo é a coluna truncada de `16_distribuicao/01_histograma/v4_receita-com-massa-no-zero`.
9. Rodapé de 11 px em `--text-muted` dizendo que a grandeza lida é a área e que o ângulo é igual em todos os passos.
10. Estado vazio (`role="status"`) substitui a rosa inteira quando `data` chega sem linha.

## Versões

- `v1_investimento-de-midia-por-mes`: [preview](./v1_investimento-de-midia-por-mes/preview.svg) ([claro](./v1_investimento-de-midia-por-mes/preview-claro.svg)). Anatomia básica: 12 meses, `Pie` de peso igual com `shape` desenhando `Sector`, raio pela fórmula de área do item 2, anéis tracejados na metade e no topo da escala pintados por cima das pétalas, rodapé declarando a grandeza lida, e nome do mês no perímetro em texto horizontal.
- `v2_meses-acima-da-media`: [preview](./v2_meses-acima-da-media/preview.svg) ([claro](./v2_meses-acima-da-media/preview-claro.svg)). Anel tracejado da média mensal, pela mesma conta de raio dos setores e pintado por cima das pétalas, para a referência não sumir sob os meses acima dela; meses acima em cor de destaque e abaixo em neutro com o valor escrito ao lado, isenção que o neutro exige; o maior mês leva **nome e valor** em peso 700; frase acessível calculada com a média, o maior mês e quantos meses ficaram acima.
- `v3_custo-mensal-em-tres-camadas`: [preview](./v3_custo-mensal-em-tres-camadas/preview.svg) ([claro](./v3_custo-mensal-em-tres-camadas/preview-claro.svg)). Empilhamento de três camadas de custo por mês, com raio acumulado pela fórmula de área do item 2 sobre o total até cada fronteira; desenho em SVG puro com `arcPath` próprio; teto de escala fixo com o **corte declarado** no mês que passa dele (tarjas de quebra, marca para fora do anel e valor real escrito); legenda acima com amostra e total anual de cada camada.
- `v4_ano-com-meses-a-realizar`: [preview](./v4_ano-com-meses-a-realizar/preview.svg) ([claro](./v4_ano-com-meses-a-realizar/preview-claro.svg)). Ano em andamento: meses fechados com a área normal, mês corrente com contorno tracejado e nota de corte, meses futuros com contorno tracejado e o rótulo "a realizar", num piso de raio que não coincide com valor plausível; escala calculada só sobre os meses fechados, para o parcial não achatar o resto da rosa.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/MediaSpendRose/`.
2. Troque o `import` do `./data` pelo dado real da página e passe `data` pela prop; o default de cada `data.ts` só serve ao catálogo.
3. Coloque o componente num `VisualCard` de corpo quadrado ou passe `height` igual à largura disponível: a rosa perde legibilidade num corpo muito mais largo que alto. Conte com o rodapé no orçamento de altura, porque ele tira do raio: corpo mais baixo, rosa menor, rótulos do perímetro mais próximos entre si.
4. Se o ciclo tiver menos de 12 passos (semana em vez de mês), ajuste o passo angular (`360 / data.length`) e o formatador do rótulo do perímetro; a fórmula do raio não muda.
5. Se a página fixar o teto da escala em vez de calcular o teto a partir do dado, leve junto o desenho do corte da v3: sem ele, todo valor acima do teto desenha do mesmo tamanho.
6. Rode `npm run typecheck` e `npm run lint` no `app/`, e abra a página nos dois temas.

## Referências

- Catálogo: [Data Visualisation Catalogue, Nightingale rose chart](https://datavizcatalogue.com/methods/nightingale_rose_chart.html): observar a ênfase exagerada dos setores externos quando o raio é linear, o defeito que a raiz quadrada corrige.
- Catálogo: [AG Charts, simple nightingale](https://www.ag-grid.com/charts/gallery/simple-nightingale/): a linha de média no eixo radial e a opacidade condicional que inspirou a v2.
- Catálogo: [Chart.js, polar area](https://www.chartjs.org/docs/latest/charts/polar.html): a definição por ângulo igual e raio variável.
- Catálogo: [Vega-Lite, Radial Plot](https://vega.github.io/vega-lite/examples/arc_radial.html): a escala `sqrt` no raio, a mesma correção usada aqui.

## Observações da revisão (não bloqueantes)

_Revisão independente de 2026-09-18 (terceira passada), atualizada em 2026-09-28 pela rodada de conserto da fórmula. Nenhum item desta seção reprova a versão. **Resolvidos nesta rodada**, e por isso fora da lista: a fórmula do raio nas quatro versões e na entrada do estudo (era `rMin + (rMax − rMin) * Math.sqrt(v / topo)`, que ignora o furo central); o corte silencioso da v3 no teto de escala; o desacordo entre o `meta.json` da v1 e o desenho do rótulo de escala; a grade e o anel da média pintados por baixo das pétalas na v1, v2 e v4; o valor do maior mês que faltava na v2; e o piso de raio do mês sem dado da v4, que na conta nova equivaleria a R$ 11,3 mil e caiu para 0,28 do vão, isto é, R$ 7,3 mil._

- v1, v2 e v3: a frase acessível fixa "12 meses" e o ano em texto; com outro recorte de dado a frase deixa de descrever o que está na tela.
- v3: a legenda lista Estrutura, Equipe e Mídia de dentro para fora, enquanto a pilha se lê de fora para dentro; a ROT-4 pede a ordem visual das marcas.
- Todas as versões: os nomes de mês (`jan/25`) levam algarismos em `font-sans` sem `tabular-nums`, o que a TIP-1 pede para todo número de tela; na v3, os rótulos da escala (`R$ 80,0 mil`) também.
- Todas as versões: o bloco de `data` vazio traz a frase e o `role="status"` que a pergunta 16 pede, mas sem o ícone `Filter` de 16 px que a EST-1 descreve; a leitura não muda, o desenho do estado sim.
- v4: o `p` da linha de leitura é `aria-hidden` e resume o mesmo que a frase acessível, como a ANO-5 pede; vale conferir que ele continua cabendo numa linha quando o mês parcial tiver nome longo, porque o `truncate` corta em silêncio.
- v3: o halo da ROT-7 sob o rótulo `R$ 20,0 mil` cumpre o que a regra pede e deixa o número legível nos dois temas, mas abre um vão da cor da superfície dentro da faixa Equipe do mês de janeiro, o mesmo efeito de "partir a marca" que a ROT-7 descreve em barra curta; pousar o rótulo da escala num ângulo de fronteira entre setores devolveria a faixa inteira.
- v3: a rosa é um `svg` de `viewBox` fixo em 400 desenhado com `width` de 397 no preset `alto`, então os 11 px declarados chegam à tela como cerca de 10,9 px e escalam junto com o corpo do cartão; num corpo menor que o preset, o texto cai abaixo do piso da TIP-2 sem que o código mude. É também a razão de a guarda `COLISAO-TEXTO` do check marcar esta versão como `preview_com_escala` e não medi-la.
- v3: o mês que estoura a escala está na metade de baixo do relógio de propósito. No topo, o rótulo do valor cortado nasce ao lado do rótulo do anel de escala, e dois números diferentes na mesma linha leem como par; medido na primeira tentativa desta rodada, com o mês cortado em dezembro, os dois ficaram a cerca de 14 px um do outro, longe de reprovar pela ROT-9 e mesmo assim confusos. Quem trocar o dado precisa reconferir onde o rótulo do corte cai.
- v1, v2 e v4: o rodapé que declara a grandeza lida custa altura do corpo, e a rosa é quadrada, então cada linha de rodapé encolhe o raio e aproxima os rótulos do perímetro. Medido na v4: com três frases no rodapé, ele quebrava em duas linhas e o par "nov/26" e "a realizar" caía a 3,54 px, dentro da faixa de aviso da guarda `COLISAO-TEXTO`. A v4 ficou com duas frases, porque a terceira repetia o que o perímetro já diz ao lado de cada mês sem dado.
