# Parecer de revisão: 18_radar/06_coordenadas-paralelas

Data: 2026-10-13. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 08:39 e 08:40, posterior ao `Chart.tsx`, ao `data.ts` e ao `meta.json` das quatro). `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes em uso.

Resultado: `v1` e `v3` aprovadas; `v2` e `v4` reprovadas. São três bloqueantes: dois na `v2` e um na `v4`. As observações não bloqueantes estão no README do modelo, e as que valem a mesma rodada de correção estão repetidas aqui, no fim de cada versão reprovada.

## Peso dos bloqueantes

* **`v2` e `v4`, linhas de contexto em `--line-strong` sem valor escrito.** Perguntas 11 e 20; tabela 17.2, ACE-3, ACE-8 e COR-2; armadilha TOK-5. Papel de cor e contraste bloqueiam sempre pela seção 14.1, e o número medido fica abaixo do piso de 3:1 nos dois temas: 1,79:1 no escuro e 1,83:1 no claro. A pergunta 11 do checklist é literal, "neutro apenas com o valor escrito". Não é constante de acabamento: são 13 das 14 linhas da `v2` e 41 das 48 da `v4`. É a mesma leitura que o acervo já fixou depois da emenda de 2026-09-19 em `09_dispersao-e-bolhas/05_dispersao-conectada`, `09_dispersao-e-bolhas/10_matriz-de-dispersao/v2`, `11_fluxo-sankey/01_sankey-simples/v2` e `19_cascata-waterfall/07_cascata-empilhada/v2`, todas com o contexto em `--text-muted` e o destaque sustentado por um segundo canal.
* **`v2`, anel de foco dos nomes cobre os nomes vizinhos.** Perguntas 13 e 15; ROT-7 e ESP-3; seção 14.1, identificação das marcas. Não aparece no preview: aparece na página viva, no primeiro clique da interação que a versão diz demonstrar ("troca de foco por clique na linha ou na lista lateral"), nos dois temas, e fica na tela até o foco sair. É corte e sobreposição de texto com consequência medida, e no teclado o anel abraça dois, três ou quatro nomes de uma vez. Defeito de página viva já reprovou `11_fluxo-sankey/01_sankey-simples/v2` pelas mesmas pergunta 15 e seção 14.1.

## O que foi medido e o que não foi

* **Medido no PNG:** os dois PNGs de cada versão, inteiros; a cor de pixel do traço de contexto e do cartão na `v2`, na `v4` e, para comparar, na `v1`, com o contraste pela fórmula da WCAG sobre o pixel.
* **Medido no `preview.svg`:** os 14 paths da `v1`, os 14 da `v2`, os 14 da `v3` e os 48 da `v4`, refeitos do `data.ts` com a escala de cada eixo e comparados vértice a vértice com o `d` desenhado. Conferem todos, inclusive os trechos partidos por ausência (Lista de terceiros na `v3`; nove campanhas na `v4`) e os 10 anéis da faixa de ausência da `v4`.
* **Refeito do dado:** as 84 taxas da `v1` e da `v2`; o corte do grupo à parte (3 origens, 68,7% contra 38,8% nas outras 11, salto de 15,9 pontos); os cruzamentos por ordem de eixo (30 nesta ordem, 28 na melhor das 720, 37 na ingênua, 52 na pior); as seis medianas da `v2` e a maior distância (71,0% contra 28,0%, 43,0 pontos); os cinco domínios da `v3` e os quatro da `v4`; a seleção da `v4` (7 de 48, 2 delas sem ciclo; 9 de 48 sem ciclo; 1 sem comparecimento).
* **Sondado em página viva** (o pacote da própria ferramenta, aberto no Edge sem cabeça, nos dois temas, sem gravar preview nem PNG de conferência): escala do SVG (1 nas quatro, corpo de 894 px), tamanhos e pesos de texto; ponteiro sobre nome na `v1` e na `v3`; na `v2`, clique em quatro nomes, clique numa linha, Tab pelos 14 nomes, Enter e Espaço, com `aria-pressed`, frase acessível, linha de leitura e anotação lidas a cada troca; na `v4`, setas, Home e End nos dois limites, arrasto com o ponteiro, faixa vazia, faixa inteira, limites juntos, limites no topo e no pé, com `aria-valuenow` e `aria-valuetext` lidos a cada passo. O texto das dicas foi lido no `<title>` do DOM.
* **Não medido pela ferramenta:** ESPESSURA-MARCA, EIXO-CALMO, OPACIDADE-MARCA e RAIO-CONTRA-AREA nas quatro; FORMATO-ACESSIVEL na `v1`, na `v3` e na `v4`, conferido à mão (os textos da frase e do corpo saem das mesmas variáveis). A CONTRASTE-MARCA saiu "medida" na `v2` e na `v4` sem aviso nenhum: ela lê forma preenchida e não lê traço com `fill="none"`, então as linhas de contexto passaram sem ser vistas.
* **Não renderizado:** o estado de `data` vazio das quatro e o ramo de taxa sem denominador da `v1` e da `v2`. O que se diz deles é leitura de código.
* **Não testado:** as saídas sugeridas abaixo. Os números citados nelas são conta de token, não render.

Medidas de palco: PNG com o dobro do canvas; o corpo começa em (33, 86) do canvas e o `viewBox` tem a medida do corpo, então 1 unidade do SVG é 1 px de tela.

## `v2_indicacao-de-cliente-em-foco`: reprovada, dois bloqueantes

### Bloqueante 1. Perguntas 11 e 20; tabela 17.2, ACE-3, ACE-8 e COR-2; armadilha TOK-5, medição pela TOK-9

**Evidência.** `CONTEXT_STROKE = 'var(--line-strong)'` (linha 97) pinta, em `renderLine` (linha 302), as 13 origens fora de foco, com 1,5 px. Medido no pixel dos dois PNGs, no meio do primeiro vão, sobre a linha de Lista de terceiros, que ali corre sozinha:

| Tema | Traço de contexto | Cartão | Contraste | A mesma linha na `v1`, em `--text-muted` |
|---|---|---|---|---|
| escuro | pixel (51, 69, 106) | pixel (18, 28, 46) | 1,79:1 | 5,21:1 |
| claro | pixel (180, 192, 214) | pixel (255, 255, 255) | 1,83:1 | 5,37:1 |

A tabela 17.2 tem duas linhas para o neutro, e elas não se trocam. `--line-strong` é o "neutro de dado, com valor escrito", para "quando cada marca carrega o próprio número", e "só vale com o valor escrito na marca ou junto dela". `--text-muted` é o "neutro de dado, sem valor escrito", para "série de muitos elementos". A tabela de pares da 17.10 repete: `--line-strong` sobre `--surface-raised` como marca, "só com valor escrito". A saída da TOK-5 diz o mesmo com outra palavra: "só como neutro de contexto e sempre com o número escrito".

Nenhuma das 13 linhas tem número escrito nela ou junto dela. O cabeçalho escreve os seis valores do foco, e a anotação escreve uma mediana, de um eixo. A nota do `meta.json` sustenta que "o contexto vive da isenção do número escrito: a mediana das treze é desenhada em todos os eixos e escrita na anotação". A mediana é outra marca, que já vai em `--text-muted`, e o número dela não é o número de nenhuma das treze linhas. A isenção não se aplica.

E as treze não são pano de fundo: cada uma tem nome na coluna da esquerda, linha de chamada, dica e clique. Tapadas, a coluna de nomes aponta para o vazio e some o que a pergunta do cartão compara ("das outras treze"), a começar pelo fato de que duas delas, Indicação de parceiro e Evento presencial, correm logo abaixo do foco nos seis eixos e bem acima das outras onze.

O comentário da linha 96 registra a escolha: "Fica abaixo de 3:1 contra o cartão de propósito". O motivo declarado é real, e é a TOK-9: `--chart-1` contra `--text-muted` mede 1,82:1 no escuro e 1,12:1 no claro, e contra `--line-strong` mede 5,32:1 e 3,27:1. Só que a COR-2 já resolve esse beco para o outro lado: "no tema claro não existe cor que passe 3:1 ao mesmo tempo contra o cartão branco e contra `--chart-1`", então, sem valor escrito, o neutro sobe para o piso e é o destaque que ganha o segundo canal. Trocar contraste do contexto por separação do foco é a troca que o contrato não autoriza.

**O que mudar.**

1. Contexto em `--text-muted`, que é o papel da 17.2 para série de muitos elementos sem número por marca. Se precisar recuar, recua por espessura, nunca por cor nem por opacidade: espessura não desconta contraste (`09_dispersao-e-bolhas/05_dispersao-conectada` usa 1,25 px no traço de contexto).
2. O foco deixa de se separar pela cor e passa a se separar por canal que não é cor. Parte já existe: 2,5 px, ponto em cada eixo, nome em 700, valor no cabeçalho. Falta o que segura o tema claro: um revestimento em `--surface-raised` por baixo do path do foco, que é a saída da TOK-4 (9,50:1 no escuro e 6,00:1 no claro contra `--chart-1`). Com ele a linha acesa corta o feixe em vez de se misturar a ele.
3. O traço da mediana, a barra do vão e a amostra da legenda estão em `--text-muted` e hoje se destacam porque o contexto é mais fraco. Com o contexto no mesmo token eles se fundem ao feixe. Precisam de separação própria: o mesmo revestimento por baixo, ou outra forma. Conferir nos dois PNGs que as seis medianas continuam legíveis no meio das linhas, sobretudo em win rate, onde dez linhas chegam em 26 px de eixo, e em comparecimento, onde onze chegam em 33 px.
4. Medir marca contra marca nos dois temas e escrever os números na nota do `meta.json` (TOK-9), tirando dela a frase da isenção. Atualizar a segunda linha do `demonstrates`, o item 4 da Anatomia e a segunda linha das Observações do produtor no README. O README escreve 5,31:1 e 3,28:1 para o par `--chart-1` contra `--line-strong`; a tabela do contrato e a conta de hoje dão 5,32:1 e 3,27:1.

### Bloqueante 2. Perguntas 13 e 15; ROT-7 e ESP-3; seção 14.1, identificação das marcas

**Evidência.** Cada nome da coluna é um `<g role="button" tabIndex={0}>` (linhas 443 a 473) que guarda três filhos: o retângulo de clique de 150 por 14 px, o texto e a **linha de chamada**, que sobe ou desce na diagonal até o ponto em que a origem toca o primeiro eixo. O anel de foco do navegador contorna a caixa do grupo inteiro, e a chamada faz essa caixa passar da linha do nome. Medido na página viva, em px do corpo, com passo de 14 px entre nomes e caixa de texto de 15 px:

| Nome | Caixa do texto (y) | Caixa do grupo (y) | Altura do grupo |
|---|---|---|---|
| Indicação de parceiro | 90 a 105 | 90 a 108,4 | 18,4 px |
| Rede profissional | 132 a 147 | 132 a 157,4 | 25,4 px |
| Mídia social patrocinada | 230 a 245 | 197,2 a 245 | 47,8 px |
| Prospecção ativa | 244 a 259 | 203,8 a 259 | 55,2 px |
| Lista de terceiros | 258 a 273 | 232,6 a 273 | 40,4 px |

São dois anéis diferentes, e os dois cobrem vizinho.

* **Clique de mouse no nome.** O grupo recebe foco com `:focus-visible` falso, e o estilo computado dele passa a ser `outline: auto 5px rgb(16, 16, 16)`. Não vem do Farol, cuja única regra de foco é para `:focus-visible`: é o contorno padrão que o Chromium dá a elemento SVG em `:focus` (medido no Edge; o Chrome usa o mesmo motor e não foi aberto). Depois de clicar em Rede profissional, o anel fecha uma caixa de 172 por 25,4 px em volta de Rede profissional **e** de Busca orgânica; a borda de cima passa sobre a metade de baixo de Webinar próprio e a de baixo risca Busca orgânica. No tema claro é uma moldura preta grossa em volta de dois nomes. No escuro o anel quase não se vê contra o cartão, e o que se vê é o nome de cima com a metade inferior apagada, sem causa aparente. Fica assim até o foco sair. Visto igual depois de clicar em Lista de terceiros (moldura em volta de três nomes), Mídia social patrocinada (Material para baixar cortado ao meio) e Webinar próprio (Evento presencial cortado).
* **Tab no teclado.** Vale a regra global do Farol, `app/src/styles/index.css`, linha 111: `outline: 2px solid var(--ring)` com `outline-offset: 2px`, lido como rgb(45, 212, 232) no escuro e rgb(11, 109, 125) no claro. Tab até Lista de terceiros desenha o anel em volta de **três** nomes (Mídia social patrocinada, Prospecção ativa e Lista de terceiros) e risca Mídia social orgânica; Tab até Rede profissional abraça dois e risca Webinar próprio. Antes do Enter, o anel é o único sinal de qual nome está com o foco do teclado (o peso 700 marca `aria-pressed`, não o foco), e um anel em volta de três nomes não diz qual.

O clique na **linha** troca o foco do gráfico sem pôr foco de teclado em nada, e ali não há anel (medido). A troca em si funciona: `aria-pressed`, linha de leitura, cabeçalho, mediana, anotação e frase acessível mudam juntos no clique, no Enter e no Espaço.

Tirar só a chamada de dentro do grupo não basta. A linha do nome tem 14 px e o texto ocupa 15; qualquer anel desenhado por fora dela, a 2 px de distância e com 2 px de traço, entra 4 px na linha de cada vizinho.

**O que mudar.**

1. Tirar a linha de chamada de dentro do grupo do botão e desenhá-la na camada `aria-hidden`, com a mesma troca de cor pelo foco. A caixa do botão passa a ser a linha do nome.
2. Desligar no grupo o contorno do navegador e o global (`outline: none`) e desenhar um indicador próprio **dentro** da linha do nome, só com foco de teclado (`:focus-visible`), em `--ring`, que mede acima de 3:1 nos dois temas. A forma é escolha de quem corrige, desde que não cruze a tinta de nenhum vizinho: uma marca ao lado do nome ou um traço sob o nome, por exemplo.
3. Depois de clique de mouse não sobra moldura nenhuma: o que marca a escolha é o nome em 700, a chamada e a linha acesas e o `aria-pressed`.
4. Conferir na página viva, nos dois temas: clique em cada um dos 14 nomes e Tab do primeiro ao último, sem nome cortado nem riscado e com o indicador apontando um nome só.

### Observações da `v2` que valem a mesma rodada

* ANO-2: a anotação tem 52 caracteres no dado padrão e chega a 56 com Mídia social patrocinada em foco, contra o teto de 50; e não diz a métrica, que só se lê pela posição. Trocar o nome do foco pelo da métrica resolve os dois.
* Com volume de quatro dígitos o cabeçalho aperta: com Mídia social patrocinada em foco, `48,0% (1.373 de 2.860)` e `22,0% (302 de 1.373)` ficam a cerca de 10 px um do outro (lido no recorte). Não colide neste dado.

## `v4_quarenta-e-oito-campanhas-com-lacunas`: reprovada, um bloqueante

### Bloqueante 1. Perguntas 11 e 20; tabela 17.2, ACE-3, ACE-8 e COR-2; armadilha TOK-5, medição pela TOK-9

**Evidência.** `CONTEXT_STROKE = 'var(--line-strong)'` (linha 118) com `CONTEXT_WIDTH = 1` (linha 105), aplicados nas linhas 461 e 462 a toda campanha fora da faixa. No estado padrão são 41 das 48 linhas, 85% do que o cartão desenha. Medido no pixel dos dois PNGs, sobre a linha de Portal setorial 07 perto do pé do eixo de taxa de agenda, onde ela corre sozinha:

| Tema | Traço de contexto | Cartão | Contraste |
|---|---|---|---|
| escuro | pixel (51, 69, 106) | pixel (18, 28, 46) | 1,79:1 |
| claro | pixel (180, 192, 214) | pixel (255, 255, 255) | 1,83:1 |

A régua é a mesma do bloqueante 1 da `v2`, e não se repete aqui. O que muda é a defesa escrita na nota do `meta.json`: "o contexto vive da isenção do número escrito: mínimo e máximo em cada eixo, a contagem 7 de 48 e a taxa de cada selecionada na lista". Nenhum desses três é o número de uma campanha de contexto. O mínimo e o máximo são do eixo, a contagem é do conjunto e a taxa escrita é das sete acesas. A isenção da 17.2 pede "o valor escrito na marca ou junto dela", e 41 linhas de 1 px não têm onde carregar valor.

O peso é o da população, como em `11_fluxo-sankey/01_sankey-simples/v2`, que tirou do `--line-strong` as faixas fora de foco por serem 75% das agendas. Aqui o contexto é o que dá sentido às sete: é contra o feixe das 48 que se vê que Webinar 04 e E-mail 07 estão no topo da taxa de agenda (4º e 7º de 48, pela conta refeita do dado) e que as outras cinco ficam abaixo da mediana do conjunto (do 31º ao 47º).

**O que mudar.**

1. Contexto em `--text-muted`, o neutro sem valor escrito da 17.2. O traço de 1 px pode ficar: espessura não desconta contraste.
2. `--chart-1` contra `--text-muted` mede 1,82:1 no escuro e 1,12:1 no claro (TOK-9), então a seleção deixa de se separar pela cor. Os 2 px já são um segundo canal; para 7 linhas contra 41 no tema claro eles sozinhos são pouco. A saída medida é a da TOK-4: revestimento em `--surface-raised` por baixo de cada linha selecionada, que mede 9,50:1 e 6,00:1 contra `--chart-1`, de modo que a linha acesa corta o feixe.
3. O realce do ponteiro sobre linha de contexto hoje é a troca de `--line-strong` por `--text-muted` com 1 px a mais (linha 461). Com o contexto já em `--text-muted` sobra só a espessura; conferir se basta ou dar outro canal.
4. Os anéis de ausência das campanhas fora da faixa já estão em `--text-muted` e passam a dividir o token com o contexto. A forma vazada na faixa de baixo os separa; só conferir nos dois PNGs.
5. Medir marca contra marca nos dois temas e escrever na nota do `meta.json` (TOK-9), tirando dela a frase da isenção. Atualizar a segunda linha do `demonstrates`, o item 4 da Anatomia e a segunda linha das Observações do produtor no README. Conferir nos dois PNGs, e sobretudo no claro, que as 7 selecionadas continuam se lendo de relance.

### Observações da `v4` que valem a mesma rodada

* **Rótulo dos limites juntos, cortado na borda.** Quando os dois limites ficam a menos de 13 px um do outro, o rótulo vira um só (`sideLabels`, linha 411), ancorado pelo fim em x = 72. `R$ 10 a R$ 15` mede 70,4 px e cabe com 1,8 px de folga. `R$ 160 a R$ 160` vai de x = −11,8 a 72,2: sai 11,8 px do corpo e perde o `R$` do limite de baixo. Acontece com os dois limites acima de R$ 100 e a no máximo R$ 5 um do outro, que é canto de interação e por isso fica como observação; com dado real de quatro dígitos corta em toda faixa estreita. Empilhar os dois valores em duas linhas resolve sem pedir largura.
* **Anel do Chromium no limite depois do arrasto.** O mesmo `outline: auto 5px rgb(16, 16, 16)` da `v2` fica em volta do círculo de 11 px depois de arrastar com o mouse. Não cobre texto. Vale a mesma saída: contorno próprio só em `:focus-visible`.
* **Texto do bloco `role="status"` lido colado.** As três linhas são `tspan` sem espaço entre elas, e o conteúdo de texto sai "faixa:arraste" e "setasdo teclado". Um espaço no fim de cada linha resolve.
* **Linha de leitura elíptica.** "9 de 48 campanhas sem ciclo medido; na faixa de R$ 10 a R$ 30 de custo por lead, 2 das 7 selecionadas" deixa "sem ciclo medido" subentendido na segunda metade, e de primeira se lê que 2 das 7 foram selecionadas.
* **Limite na ponta do eixo.** Com o limite em R$ 160 ou em R$ 0, o rótulo do limite em 600 fica a 10 px do rótulo de máximo ou de mínimo do eixo, com o mesmo texto. Lê, mas repete.

## `v1_perfil-de-catorze-origens` e `v3_escala-propria-por-eixo`: aprovadas

Sem bloqueante. As duas desenham toda linha em `--text-muted`, medido no pixel em 5,21:1 e 5,37:1, com o desvio da especificação declarado na nota, e nomeiam as 14 linhas no desenho parado. Na `v3`, o zero medido de Lista de terceiros toca o pé do eixo de win rate, o path se encerra ali e os dois anéis de ticket e de ciclo ficam na faixa de ausência, com a palavra do `formatUnavailable()`; mínimo e máximo de cada eixo conferem com o domínio refeito do dado. O que ficou anotado sobre elas está no README.

## Registro no formato do checklist

```
Versão: 18_radar/06_coordenadas-paralelas/v1_perfil-de-catorze-origens
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 13, 26, 27, 28, 29, 30
```

```
Versão: 18_radar/06_coordenadas-paralelas/v2_indicacao-de-cliente-em-foco
Data: 2026-10-13
Resultado: reprovada
Não: 11, 13, 15, 20
Correções:
  11 e 20. Tabela 17.2, ACE-3, ACE-8, COR-2 e TOK-5: as 13 linhas de contexto saem de --line-strong (1,79:1 e 1,83:1, sem valor escrito) para --text-muted, com revestimento em --surface-raised sob o foco e sob a mediana, e o par medido na nota.
  13 e 15. ROT-7, ESP-3 e seção 14.1: o anel de foco dos nomes, por clique e por teclado, deixa de cobrir e de abraçar os nomes vizinhos; chamada fora do grupo do botão e indicador próprio dentro da linha do nome.
Não se aplica: 4, 6, 26, 27, 28, 29, 30
```

```
Versão: 18_radar/06_coordenadas-paralelas/v3_escala-propria-por-eixo
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 13, 26, 27, 28, 29, 30
```

```
Versão: 18_radar/06_coordenadas-paralelas/v4_quarenta-e-oito-campanhas-com-lacunas
Data: 2026-10-13
Resultado: reprovada
Não: 11, 20
Correções:
  11 e 20. Tabela 17.2, ACE-3, ACE-8, COR-2 e TOK-5: as 41 linhas fora da faixa saem de --line-strong (1,79:1 e 1,83:1, sem valor escrito) para --text-muted, com revestimento em --surface-raised sob as selecionadas, e o par medido na nota.
Não se aplica: 4, 6, 13, 26, 27, 28, 29, 30
```

## Para a régua e para a ferramenta

* A guarda CONTRASTE-MARCA não lê traço com `fill="none"`. As duas versões reprovadas saíram do `check` como medidas e sem aviso, com a marca que ocupa a maior parte do desenho a 1,79:1. Numa peça de linha em SVG puro, "medida" hoje quer dizer que os pontos e os anéis foram medidos.
* Nenhuma armadilha registra o contorno de `:focus` que o Chromium desenha em elemento SVG com `tabindex`, nem o fato de que o anel, o do navegador e o do Farol, contorna a caixa do grupo inteiro. Vale para toda peça de SVG puro com elemento focável desenhado em SVG, e não foi procurado nos outros modelos.
* A 17.2 não tem neutro para contexto apagado sem valor escrito: a COR-2 admite que no tema claro nenhuma cor passa 3:1 contra o cartão e contra `--chart-1` ao mesmo tempo. O catálogo pede "esmaecido" em duas das quatro versões deste modelo, e as duas chegaram à revisão com a mesma saída reprovada. Se o dono quiser o contexto abaixo de 3:1 em foco contra conjunto, é emenda de contrato, não decisão de versão.
