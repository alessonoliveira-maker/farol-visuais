# Chord direcional de fluxo

## O que é

Entidades dispostas no círculo, cada uma com um arco externo proporcional ao total que ela ENVIA aos outros; fitas internas ligam pares e mostram os dois sentidos ao mesmo tempo, com uma largura em cada ponta. A fita entre i e j reserva `m[i][j]` (o que i manda para j) na borda de i e `m[j][i]` (o que j manda para i) na borda de j, então a mesma forma já denuncia a assimetria de ida e volta sem precisar de dois desenhos. Não existe coluna de origem nem de destino, como no sankey: qualquer entidade pode mandar e receber ao mesmo tempo.

## Quando usar

- Trocas nos dois sentidos entre até 8 entidades: repasses entre funções, reatribuição de oportunidades entre executivos.
- Mostrar a assimetria de ida e volta entre pares, quando a pergunta é quem entrega mais do que recebe.
- Painel com interação de foco e com a matriz a um clique como alternativa acessível.

## Quando evitar

- Origem e destino claros e distintos: usar o `01_sankey-simples`.
- Relação sem volume ou simétrica: usar o chord simétrico (`27_rede-e-relacoes`, `07_chord-simetrico`).
- Consulta de valor exato ou comparação fina entre pares: usar a matriz de adjacência (`27_rede-e-relacoes`, `01_matriz-de-adjacencia`).
- Mais de 8 entidades sem agrupar em "Outras": as fitas fracas somem e os cruzamentos dominam.
- Visual sem hover e sem foco: a roda fica ilegível; nesse caso usar a matriz.

## Anatomia

1. Ângulo do grupo, em `computeLayout`, proporcional à soma da linha (`rowTotal`, o que a função ENVIA no total), descontado o `PAD_ANGLE` entre grupos vizinhos.
2. Dentro do arco do grupo, uma sub-fatia por destino, na ordem fixa de `groups` (nunca a ordem do valor), com largura proporcional a `m[i][j]`.
3. Uma fita por par não ordenado: a borda do grupo de índice MENOR (a origem canônica) reserva `m[i][j]`, a borda do outro reserva `m[j][i]`, e o caminho é arco na borda de i, curva quadrática pelo centro até a borda de j, arco na borda de j e curva de volta ao início.
4. Cor da fita e do arco do grupo pelo slot fixo da categoria (COR-8: 1, 3, 6, 5, 2, 4), nunca por índice de posição. Da sétima entidade em diante não há slot: o arco vai no neutro `--text-muted`, que mede 5,2:1 e 5,4:1 contra o cartão, e quem o identifica é o nome escrito (COR-4 e ACE-2).
5. Flag de arco grande do SVG (`largeArcFlag`) ligada sempre que um trecho, fita ou arco do próprio grupo, passa de π radianos; a conta é genérica pelo ângulo do trecho, não por um valor hardcoded, e vale tanto para o dado desta versão quanto para um recorte com uma função muito mais dominante.
6. Nome do grupo em rótulo direto, horizontal, ancorado fora do arco (`R_LABEL`), com o total de repasses enviados logo abaixo; nunca rotacionado (TIP-5), com alinhamento (esquerda, direita ou centro) decidido pelo lado do círculo em que o rótulo cai.
7. Linha de leitura calculada do dado no topo do corpo: quem lidera o envio e qual o maior fluxo único (ANO-5).
8. `data` vazio ou com soma zero troca o diagrama inteiro por um bloco `role="status"` (EST-1).

## Versões

- `v1_repasses-entre-funcoes`: repasses de oportunidades entre Pré-vendas, Executivo, Relacionamento e Especialista de produto no terceiro trimestre de 2026, com 338 repasses. Demonstra a geometria do chord em TypeScript sem biblioteca, o ângulo do grupo pela soma da linha, a fita com larguras diferentes em cada ponta na cor da origem, a conta genérica da flag de arco grande e o nome do grupo horizontal fora do arco.
- `v2_foco-na-pre-vendas`: as mesmas quatro funções com 629 repasses, e só as fitas da Pré-vendas acesas pela prop `highlightId`. Demonstra o foco SEM opacidade (o apagado é token neutro opaco, porque a ACE-5 mede a opacidade mínima das cores de papel entre 0,63 e 0,77), a fita acesa na cor do PARCEIRO em vez da origem, a anotação de ida e volta do par principal com as duas contagens, o nome em foco em peso 700 e a ordem da roda estável entre filtros.
- `v3_reatribuicao-entre-executivos`: oito executivos no teto do modelo, com 137 reatribuições. Demonstra a ordem decrescente de volume para reduzir cruzamentos, o teto de seis cores da COR-4 com neutro do sétimo em diante, o nome escrito em todo arco como canal de identificação, o corte das fitas abaixo de três trocas com a sub-fatia ainda reservada no arco, e a linha de leitura com o par de maior troca e o saldo líquido dele.
- `v4_muitas-equipes-com-saida-para-matriz`: catorze equipes, sendo as seis maiores na roda e as oito menores somadas em "Outras (n=8)", com 374 repasses no trimestre. Demonstra a contagem escrita no nome do grupo agregado, o botão com ícone do lucide que entrega a saída para a matriz, a troca interna do agregado declarada na legenda sem virar fita nem entrar no arco, e a frase acessível com o peso do que foi agrupado.

### As três decisões que as quatro versões compartilham

1. **A fita é região fechada**, dois arcos e duas quadráticas, nunca traço grosso: traço engorda para os dois lados, não tem borda própria e não deixa medir a espessura, que aqui é o próprio dado.
2. **O rótulo mora fora do arco**, na raia livre de tinta que começa em `R_LABEL`, com o nome numa linha e a contagem na seguinte, no mesmo `<text>`. Nenhum texto pisa em marca, então nada precisa de halo, e a `ROT-7b` não tem o que decidir.
3. **Da `v2` em diante o desenho vai em `<text>` de SVG, com o `viewBox` igual ao corpo medido da moldura.** A `v1` posiciona os rótulos em HTML absoluto, e o custo disso é medido: no `check` ela sai `texto_em_html` em `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA`, isto é três guardas de desenho que não olham a peça. Com `<text>` e escala 1 as três voltam a medir.
4. **A âncora do rótulo fica a `R_OUTER + 18` com recuo horizontal de 6 px, e esses dois números são medidos.** O bloco de rótulo tem duas linhas e desce 15,4 px abaixo da âncora; como a borda do disco é curva, uma âncora fora do arco ainda joga o canto de baixo do texto de volta para dentro da marca. Com `R_OUTER + 10` a `CONTRASTE-TEXTO` acusou as três versões novas no primeiro render, com 1% a 2% da tinta sobre a própria marca e razão de 1,00:1 a 1,13:1, isto é texto que some. Depois do ajuste a caixa mais próxima ficou a 4,5 px do arco na `v3`, 7,8 px na `v2` e 8,2 px na `v4`, e as três saíram limpas.

### O que o `check` não mede nestas peças, e a medição à mão

A `ESPESSURA-MARCA` sai `sem_marca_de_barra` na `v2` e na `v3` e `marca_fora_do_bar` na `v4`, porque o piso geral de 12 px é o outro lado do `maxBarSize` e só existe dentro de um `<Bar>` do Recharts. Medido à mão no pé da fita mais fina de cada uma: **21,4 px** na `v2`, **6,8 px** na `v3` e **8,5 px** na `v4`. O número da `v3` fica abaixo daquele piso de propósito, porque numa fita a espessura **é** o dado (uma reatribuição), e engrossá-la publicaria um número que não existe; quem tira a fita ilegível da roda ali é o limiar de três trocas, não um piso de espessura. Nenhuma das quatro desenha rótulo por dentro de marca, então o piso de rótulo interno da `ESP-2` não se aplica em nenhuma. A `EIXO-CALMO` sai `sem_grade` e a `OPACIDADE-MARCA` sai `sem_opacidade_em_marca` nas quatro: não há eixo cartesiano nem opacidade declarada em lugar nenhum do modelo.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para a pasta do visual na página, por exemplo `app/src/pages/<pagina>/visuals/FunctionRepassesChord/`.
2. Troque o `import` do `./data` pela lista real de `groups` (funções, executivos ou equipes) e pela matriz `data` (fluxos direcionais); mantenha a mesma forma de `FlowCell`, porque `rowTotal` e o ângulo de cada grupo são sempre somados dos fluxos, nunca declarados à parte.
3. Passe `data` pela prop a partir do seletor da página; o default do `data.ts` fica só como amostra do catálogo.
4. Dê altura ao pai (`<div className="h-80">`, por exemplo, para o canvas quadrado) ou passe `height`, porque a roda ocupa o maior quadrado que couber no espaço disponível.
5. Para mais de 8 entidades, agrupe as menores em "Outras" antes de montar `data` e passe a contagem do agregado como na `v4`; para foco numa entidade, passe `highlightId` como na `v2`, que acende só as fitas dela sem mexer na ordem da roda. A `v4` espera também `onShowMatrix`, que é onde a página monta a matriz de adjacência.
6. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Highcharts, Dependency wheel (docs)](https://www.highcharts.com/docs/chart-and-series-types/dependency-wheel): o mesmo dado do sankey, com os nós no mesmo nível e fluxo multidirecional.
- [Highcharts, Dependency wheel (demo)](https://www.highcharts.com/demo/highcharts/dependency-wheel): demo oficial, renderizada por JavaScript.
- [AG Charts, Chord Series](https://www.ag-grid.com/charts/javascript/chord-series/): `fromKey`, `toKey`, `sizeKey` e a tensão da curva da fita.
- [Apache ECharts, Basic Chord](https://github.com/apache/echarts-examples/blob/gh-pages/public/examples/ts/chord-simple.ts): série chord com a cor da fita pelo destino; o Farol usa a cor da origem.
- [nivo, Chord](https://nivo.rocks/chord/): matriz de entrada, `padAngle` e opacidades ativa e inativa.
- [From Data to Viz, Chord](https://www.data-to-viz.com/graph/chord.html): ordenar para reduzir cruzamentos, remover fitas fracas e explicar a leitura ao público.
- [Data Visualisation Catalogue, Chord Diagram](https://datavizcatalogue.com/methods/chord_diagram.html): anatomia do chord e o limite de legibilidade com muitas entidades.
- [visx, sandbox chord](https://github.com/airbnb/visx/tree/master/packages/visx-demo/src/sandboxes/visx-chord): geometria de chord em React; a biblioteca não entra na stack.
- [Nightingale, Endless River](https://nightingaledvs.com/endless-river-an-overview-of-dataviz-for-categorical-data/): minimizar cruzamentos, colapsar ligações fracas em "outros" e dar pistas para leigos.
- [Stephen Few, Our Irresistible Fascination with All Things Circular](https://www.perceptualedge.com/articles/visual_business_intelligence/our_fascination_with_all_things_circular.pdf): por que o arranjo circular atrapalha consulta e comparação; justifica a matriz a um clique.
- [Behance, Bilateral Migrations Inside The EU in 2020 (D3.js)](https://www.behance.net/gallery/137170789/Bilateral-Migrations-Inside-The-EU-in-2020-%28D3js%29): entidades ordenadas por volume e fita mais grossa para mais pessoas.

## Desvios do catálogo, declarados

O catálogo especifica as quatro versões, e em três pontos a especificação da versão colide com o contrato ou com a geometria do modelo. Nos três o contrato vence, e o desvio está também na nota do `meta.json` da versão.

1. **`v2`, "baixa as demais para 15%".** É opacidade em marca, e cai na `ACE-5`: a opacidade mínima medida para as cores de papel vai de 0,63 a 0,77, então 15% sai abaixo do piso de 3:1 da WCAG 1.4.11 nos dois temas. O apagado é o neutro **opaco** `--text-muted` da 17.2 (neutro de dado, sem valor escrito: 5,21:1 e 5,37:1), porque a contagem de cada fita apagada não aparece na tela e a isenção do `--line-strong` não vale. Como o matiz da fita acesa fica perto do `--text-muted` (de 1,00:1 a 1,42:1, TOK-9), a acesa leva contorno de 2,5 px em `--text-primary` como segundo canal.
2. **`v3`, "nome escrito em cada arco para os slots 7 e 8".** O nome sai em **todo** arco, não só nos dois sem cor. Escrever o nome por dentro do arco pediria espessura de 17 px para texto de 11 px (`ESP-2`), e a caixa de tinta horizontal sobre arco curvo cruzaria a borda da marca, o que a `ROT-7b` resolve com halo e não com vazado. Fora do arco não há decisão de halo a tomar, e a `ACE-2` fica satisfeita em todos os grupos em vez de só em dois.
3. **`v4`, "botão que troca a roda pela matriz de adjacência".** O botão entrega a saída por uma prop, `onShowMatrix`, e a matriz não é desenhada aqui: ela é outro modelo (`27_rede-e-relacoes`, `01_matriz-de-adjacencia`), a seção 6 proíbe uma versão importar arquivo de outra, e redesenhá-la dentro deste arquivo colocaria um segundo visual que nenhum preview mostra e nenhuma guarda mede, porque o render fotografa só o estado inicial.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19; a única versão da leva foi aprovada, sem nenhum bloqueante._

- `v1_repasses-entre-funcoes`: o número do rótulo do arco ("137 repasses") é só o que a função ENVIA, e o qualificador não aparece ali. Pré-vendas envia 137 e recebe 53, então quem lê rápido pode tomar o arco por "tudo o que passou pela Pré-vendas". A partição está correta (cada repasse é contado uma vez, na origem) e a linha de leitura diz "lidera o envio"; escrever "137 enviados" no rótulo fecharia a ambiguidade nos quatro arcos.
- `v1_repasses-entre-funcoes`: a linha de leitura e a frase acessível tomam o maior fluxo de `data` inteiro (`topFlow`) e o apresentam como parte do envio do líder ("sendo 110 repasses só para Executivo"). Com o dado fixo do catálogo as duas coisas coincidem, mas num recorte em que o maior fluxo saia de outra função a frase atribui ao líder um repasse que não é dele; restringir a busca às linhas com `from` igual ao líder resolve em uma linha.
- `v1_repasses-entre-funcoes`: o raio (`R_OUTER` 42 num `viewBox` de 200) usa 42% do quadrado, então a roda sai com cerca de 126 px num canvas de 480 e as fitas mais finas, de 8 e 9 repasses, ficam com cerca de 3 px no pé. Nada é cortado nem colide no preview dos dois temas, e os rótulos, ancorados em 50% do raio, ainda cabem; há folga para a roda crescer e as fitas fracas ganharem corpo.
- `v1_repasses-entre-funcoes`: as fitas são opacas e a fita da Pré-vendas para o Executivo é do mesmo ciano do arco dela, colada nele, o que faz a metade direita ler como meio disco cheio. O contorno em `--surface-raised` separa as formas, mas um contorno mais grosso, ou um tom de fita que continue acima de 3:1 nos dois temas (ACE-5), ajudaria a distinguir arco de fita.
- Catálogo (`_estudo/catalogo/11_fluxo-sankey.json`), seguido como está escrito: o caso de uso da `v1` fala em 412 repasses e o `data.ts` soma 338 (o `meta.json` não repete o número, então nada se contradiz na tela); e o "Quando evitar" do próprio modelo desaconselha a roda sem hover e sem foco, que é exatamente o estado da `v1`, já que o foco por `highlightId` foi atribuído à `v2`, fora desta leva. Nenhum par de funções tem o valor escrito no desenho parado.

_Revisão de 2026-10-14, de `v2`, `v3` e `v4`: `v3` aprovada; `v2` e `v4` reprovadas, com os bloqueantes em `validation/revisao_11_fluxo-sankey__05_chord-direcional-de-fluxo_2026-10-14.md`. Os itens abaixo não reprovam._

- `v2_foco-na-pre-vendas`: a linha de leitura fixa o verbo "entrega ... mais do que recebe" e só o número é calculado. No dado padrão as outras três funções recebem mais do que enviam (Executivo 142 contra 299, Relacionamento 121 contra 164, Especialista 92 contra 106), então com `highlightId` em qualquer uma delas a linha sai "entrega −157 repasses mais do que recebe". Escolher o verbo pelo sinal de `netSent`; como a versão volta para correção, vale corrigir na mesma rodada.
- `v2_foco-na-pre-vendas`: a frase acessível diz "Com Executivo são 186 num sentido e 23 no outro" sem dizer quem manda os 186; a anotação visível diz ("186 enviados, 23 de volta"), a frase deveria dizer o mesmo.
- `v2_foco-na-pre-vendas` e `v3_reatribuicao-entre-executivos`: o 700 vai para números dentro da linha de leitura (214 na `v2`; 21 e 3 na `v3`), e a TIP-3 pede a linha em 500 ou 600. O total de elementos em 700 fica em dois, sem consequência visível.
- `v2`, `v3` e `v4`: "terceiro trimestre de 2026" está escrito à mão na frase acessível e não vem do dado; num recorte de outro trimestre a frase mente sem que nada no código avise.
- `v2`, `v3` e `v4`: `groups` vem do import do `data.ts` e não é prop, e na `v4` também `collapsedTeams` e `internalCount`. Passar outro `data` pela prop mantém os nomes, o "n=8" e os 19 internos do catálogo. O passo 5 de "Como colar no Farol" manda passar a contagem do agregado como na `v4`, e não há prop para isso.
- `v3_reatribuicao-entre-executivos`: "com saldo de 3 para Executivo A" se lê como "A ganhou 3", e o fato é o contrário: A cedeu 12 e recebeu 9 de B. Escrever o sentido ("Executivo A cede 3 a mais do que recebe de Executivo B") na linha e na frase.
- `v3_reatribuicao-entre-executivos`: a frase acessível diz "6 pares abaixo de 3 ficam só no arco" sem a unidade (NUM-6); a anotação visível tem "3 trocas".
- `v3_reatribuicao-entre-executivos`: Executivo G e Executivo H, vizinhos, saem no mesmo `--text-muted`. Com este dado nada fica ambíguo, porque a única fita cinza é a de G com H e o nome está em todo arco; a 17.2 admite `--chart-7` e `--chart-8` exatamente com rótulo direto em cada marca, o que separaria os dois.
- `v3_reatribuicao-entre-executivos`: roda parada de 22 fitas sem valor por par, o mesmo ponto já registrado para a `v1` sobre o "Quando evitar"; só o par líder tem número na tela.
- `v4_muitas-equipes-com-saida-para-matriz`: o botão "ver como matriz" aparece e não faz nada quando `onShowMatrix` não vem, que é o estado do `<Chart />` do catálogo e de qualquer página que esqueça a prop. Renderizar o botão só com a prop, ou desabilitado com o motivo no `title`.
- `v4_muitas-equipes-com-saida-para-matriz`: a legenda de uma entrada repete o rótulo direto ("Outras (n=8)" já está junto do arco) e diz o 8 duas vezes na mesma linha; a ROT-4 pede legenda só quando o rótulo não cabe. Uma nota única ("Outras (n=8): 19 repasses entre elas, sem fita") cobre legenda e anotação.
- `v4_muitas-equipes-com-saida-para-matriz`: 20,6% é participação de Outras no total, e a NUM-1 pede percentual de composição inteiro: 21% (77 de 374), na linha e na frase.
- `v4_muitas-equipes-com-saida-para-matriz`: o arco de Outras diz 58 enviados e a linha de leitura diz 77; a diferença são os 19 internos da anotação, mas a soma não está escrita em lugar nenhum.
- `v4_muitas-equipes-com-saida-para-matriz`: o `useCase` pergunta sobre o desenho ("cabem na roda depois de agrupar as menores?") e não sobre o negócio, e a frase acessível diz "lidera com 74 enviados" sem o substantivo (NUM-6).
- Modelo: o título "As três decisões que as quatro versões compartilham" tem quatro itens.

_Revisão de 2026-10-14, segunda passada de `v2` e `v4` depois da rodada única de correção: as duas aprovadas, e os dois bloqueantes da primeira passada fecharam. Os itens abaixo não reprovam._

- `v2_foco-na-pre-vendas`: o contorno da fita acesa em `--text-primary` mede 2,79:1 contra a apagada em `--text-muted` no escuro e 3,34:1 no claro (de 1,97:1 a 2,46:1 contra o próprio preenchimento aceso no escuro). Nos dois PNGs o contorno sai inteiro entre acesa e apagada (#e8edf7 e #0e1726 por 1 a 1,5 px), e é a mesma saída aprovada em `04_parallel-sets/v2`; mas o `notes` escreve só a razão preenchimento contra preenchimento, e a TOK-9 pede o número do segundo canal medido no `notes`.
- `v2_foco-na-pre-vendas`: o ramo positivo da linha de leitura diz "entrega 214 repasses mais do que recebe", sem o "a" que o ramo negativo tem ("recebe N repasses a mais do que envia").
- `v2_foco-na-pre-vendas`: o ramo negativo da linha de leitura não foi renderizado. Pela tabela de glifos de `colisao.mjs`, a frase mais longa (Especialista de produto, 95 caracteres) mede 546,4 px dos 600 do corpo, e a da Pré-vendas, estimada em 490,7 px, mede 483 px no PNG; cabe, mas vale um render com `highlightId` trocado antes de colar no Farol.
- `v4_muitas-equipes-com-saida-para-matriz`: na fita de mão única de Outras para a Equipe Litoral, a separação entre as duas quadráticas é sempre paralela à corda do pé em Outras, então a fita torce: a largura perpendicular cai a zero em (383,5, 187,7) do `viewBox`, a 64% do caminho, e daí até a Litoral a fita é um fio de no máximo 0,94 px por cerca de 90 px, com os últimos 8 px (raio de 162 a 170) entre 8% e 36% de cobertura no PNG. A tinta é contínua e chega ao arco da Litoral nos dois temas; um afinamento com o deslocamento perpendicular ao caminho, ou a ponta em seta do `ribbonArrow`, daria ponta limpa sem a torção.
- `v4_muitas-equipes-com-saida-para-matriz`: o item 3 da Anatomia ainda descreve só a quadrática pelo centro; o caso de mão única, com os controles deslocados de um quarto do pé em lados opostos, está só no `notes` e no comentário do `ribbonPath`.
- `v2` e `v4`: com o contorno de separação em `paintOrder="stroke"`, o vão inteiro sai da fita pintada antes, e não metade de cada lado. Medido no pé, nenhuma fita perde mais de 2 px: na `v4` a pior é Oeste para Litoral, 4 repasses, 9,6 contra 11,3 px, e a mais fina, 3 repasses, mantém 8,2 de 8,4 px; na `v2` a mais fina, 16 repasses, mantém 20,6 de 21,0 px. Sem consequência visível.
