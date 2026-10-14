# Parecer de revisão: 21_texto-e-nuvem-de-palavras/06_dispersao-de-termos

Data: 2026-10-13. Revisor independente, primeira passada, as quatro versões em `sem_revisao`. `npm run check`: 0 com erro, 0 avisos, 0 escapes.

> **Estado vigente, depois da segunda passada da mesma data:** `v1`, `v2` e `v3` aprovadas; `v4` reprovada por um bloqueante **novo**, nascido da correção (o anel do marcador único ficou sem a contagem). Os bloqueantes descritos da seção `A raiz comum` até a seção `v4` abaixo são da primeira passada e **estão resolvidos**: ficam como histórico. O insumo do corretor é a seção `Segunda passada`, no fim deste arquivo.

| Versão | Resultado | Não |
|---|---|---|
| `v1_ganhas-contra-perdidas` | reprovada | 18 e 31 |
| `v2_busca-destaca-um-termo` | aprovada | nenhum |
| `v3_titulos-de-criativos-por-cpl` | reprovada | 31 |
| `v4_termos-raros-e-grupos-desbalanceados` | reprovada | 31 |

Não se aplica, nas quatro: perguntas 3, 4, 6, 26, 27, 28, 29 e 32. A pergunta 30 só se aplica à `v3`, e passa. As observações não bloqueantes estão no README do modelo, seção `Observações da revisão (não bloqueantes)`.

## Como foi medido

- **Posição de nome e de ponto:** lidas do `preview.svg` de cada versão. Cada ponto é um `<path id="termo-NNN">` com `cx` e `cy`; cada nome é um `<text>` com halo. A caixa de tinta do nome usa a largura de `larguraDoTexto` (`_render/scripts/lib/colisao.mjs`, a mesma tabela de glifos das guardas) e a altura de 0,72 em acima e 0,10 em abaixo da linha de base. A distância é da caixa de tinta ao **centro** do ponto, em px de CSS. O raio do ponto é 4 px na `v1` e na `v4` e 3 px na `v3`.
- **Ordem de distinção:** refeita fora do projeto a partir de cada `data.ts`, com as mesmas fórmulas do `Chart.tsx` (posição média em empate, diferença sobre a raiz da soma, diferença de proporção). As contagens da linha de leitura batem nas quatro: 27, 31 e 42; 43º e 1º; 12, 6 e 232; 5, 19 e 22.
- **Contraste de marca:** a `CONTRASTE-MARCA` e a `ESPESSURA-MARCA` saíram com `preview_com_transform` nas quatro, então a cor de cada marca foi lida do SVG nos dois temas e medida à mão contra o cartão.

| Marca | Escuro | Claro |
|---|---|---|
| `--text-muted` opaco (`v1`, `v2`, `v4`) | 5,21:1 | 5,37:1 |
| `--chart-1` opaco | 9,50:1 | 6,00:1 |
| `--chart-3` opaco | 6,47:1 | 6,18:1 |
| `--text-muted` com 0,8 (`v3`) | 3,82:1 | 3,53:1 |
| `--chart-1` com 0,8 (`v3`) | 6,51:1 | 3,98:1 |
| `--chart-3` com 0,8 (`v3`) | 4,61:1 | 4,05:1 |
| anel `--text-secondary` (`v4`) | 8,16:1 | 8,13:1 |

Nenhuma marca abaixo de 3:1, então as perguntas 20 e 30 passam nas quatro.

## A raiz comum dos três bloqueantes da pergunta 31

A camada de nomes (`TermLayer` na `v1`, `WordLayer` na `v3`, `RareLayer` na `v4`) aceita uma vaga quando a caixa do nome (a) está dentro do plano, (b) não cobre nenhuma marca, com 1 px de folga, e (c) não cobre outro nome, com 3 px de folga. Ela **nunca pergunta se o ponto dono é o ponto mais próximo do nome**. Com 12 vagas por ponto, entre elas as distantes (`dy: 23`, `dy: -15`, `dx: 14` e `dx: -14`), e sem linha de chamada, o nome para a 15 px do dono e a 6 px de um vizinho. Quem lê liga o nome ao ponto mais próximo, e o desenho passa a nomear a marca errada.

A regra é a da seção 14.1 (identificação das marcas bloqueia sempre) e a da exceção de marca fina da ROT-7: onde o rótulo não cabe junto da marca, quem sai do lugar é o rótulo, por posicionamento calculado em TypeScript, com linha de chamada se precisar.

**A correção é a mesma nas três versões:**

1. No laço das vagas, calcular a distância da caixa ao centro do ponto dono e **recusar a vaga quando qualquer outro ponto fica a uma distância menor ou igual**, com uma folga nomeada no topo do arquivo (2 px resolve os casos medidos). Na `v4`, o anel do marcador único entra na conta como ponto.
2. As quatro vagas distantes só valem com linha de chamada de 1 px em `--text-muted`, da borda do ponto à caixa do nome, traçada sem cruzar marca. Sem a linha, saem da lista.
3. Critério de aceite, medível no `preview.svg`: para todo `<text>` de nome, o `<path id>` do termo é o ponto mais próximo da caixa de tinta, ou existe linha de chamada entre os dois.

A `COLISAO-TEXTO` passou nas quatro porque mede texto contra texto. Nenhuma guarda mede nome contra ponto dono.

## v1_ganhas-contra-perdidas

Resultado: reprovada. Dois bloqueantes, iguais nos dois temas. O resto confere: eixos de posição com domínio igual de 0 a 100, grade nos dois sentidos (EIX-3b), diagonal por `ReferenceLine` com `segment` e `ifOverflow="extendDomain"`, raio fixo pelo `ZAxis`, cor por grupo fixa em `--chart-1` e `--chart-3` sem semântica (COR-6), 15 nomes em peso 600 com halo, frase acessível medida pela guarda, estado vazio com `role="status"`.

### Bloqueante 1. Pergunta 31. Seção 14.1, identificação das marcas, e ROT-7

**O que o desenho faz.** 5 dos 15 nomes ficam mais perto de um ponto alheio do que do ponto dono.

| Nome | Vaga usada | Distância ao dono | Ponto alheio mais perto | Distância |
|---|---|---|---|---|
| `financeiro` | centrado, 23 px abaixo | 15,1 px | `pacote` | 6,3 px |
| `negociação` | centrado, 23 px abaixo | 15,1 px | `pagamento` | 8,5 px |
| `garantia` | centrado, 23 px abaixo | 15,1 px | `indicação` | 11,8 px |
| `indicação` | abaixo e à direita | 9,3 px | `instalação` | 6,1 px |
| `urgência` | acima e à esquerda | 8,5 px | `reajuste` | 7,1 px |

**Evidência no PNG.** O ponto de `pacote` (42º entre as ganhas, 78º entre as perdidas) tem `financeiro` logo abaixo e `pacote` acima e à direita; o ponto de `financeiro` (39º e 82º) fica 23 px acima do próprio nome, sem nada colado, e na mesma linha do nome `pacote`, a 17,8 px dele. Um ponto fica com dois nomes e o outro com nenhum, e a leitura que sobra troca os dois. `indicação` está centrado debaixo do ponto de `instalação`, que não tem nome. No canto das perdidas há quatro pontos para três nomes (`urgência`, `reajuste`, `concorrente` e o ponto sem nome de `cancelamento`): o ponto de `reajuste` tem `urgência` em cima e `reajuste` embaixo à esquerda. Dois casos ficam no empate e não entram na conta: `boleto` (8,5 px do dono, 8,2 px de `integração` e de `dúvida`) e `cobrança` (9,3 px do dono, 10,5 px de `prioridade`).

**O que mudar.** A correção da raiz comum, acima.

### Bloqueante 2. Pergunta 18. DIC-1, com ACE-1

**O que o desenho faz.** O termo mais distante da diagonal não tem nome, e nada na tela avisa que o nome depende de caber. Posições, na ordem de distância à diagonal, dos 15 termos que ganharam nome: 2, 3, 5, 6, 8, 11, 12, 14, 15, 19, 20, 23, 26, 29 e 30.

**Evidência.** Ficam sem nome 6 dos 15 mais distantes: `demonstração` (1ª, 257 anotações de ganhas e 14 de perdidas, 6º e 99º), `cancelamento` (4ª), `referência` (7ª), `instalação` (9ª), `inadimplência` (10ª) e `treinamento` (13ª). Enquanto isso `financeiro` (23ª), `negociação` (26ª), `usuário` (29ª) e `pacote` (30ª) têm nome. A frase acessível diz `os mais distantes da diagonal são demonstração e concorrente`, e `demonstração` não está escrito em lugar nenhum do corpo: quem enxerga só o alcança pela dica. A pergunta do caso de uso é quais termos são típicos de cada grupo, e o desenho responde com uma lista que pula o primeiro. A causa de `demonstração`: o ponto está em y = 10,2 px e o plano começa em 8 px, então toda vaga com `dy` até 4 sai pelo topo, as centradas saem pela esquerda e a de baixo à direita cai sobre o ponto de `garantia`.

**O que mudar.** (a) Garantir o nome do primeiro termo de cada lado, que é o par que a frase acessível cita, com o mesmo recurso da `FoundLayer` da `v2` (o nome que a peça não pode perder) e linha de chamada até um espaço livre. (b) Dar vaga a ponto de borda: hoje o nome não pode usar a faixa da margem nem sair 1 px do plano. (c) Escrever no rodapé que o nome sai onde cabe, como a `v3` já faz, e contar quantos ficaram sem nome. (d) A frase acessível só cita termo que o desenho nomeia.

### Convém corrigir na mesma passada, sem peso de veredito

- `MARGIN.top` de 8 para 12 px: o tique `100º` do eixo vertical sai 3,25 px abaixo da linha de grade dele (EIX-6b, emenda de 2026-10-02).
- Amostra cinza para `comuns aos dois` e rodapé numa linha só.

## v3_titulos-de-criativos-por-cpl

Resultado: reprovada. Um bloqueante, igual nos dois temas. O resto confere: escala log com 1 somado e declarado, domínio igual de 1 a 300 nos dois eixos, mínimo de 3 anúncios aplicado antes (265 candidatas, 15 fora, 250 desenhadas) e escrito no rodapé, dica com as contagens reais e o CPL qualificado médio por `formatCurrencyCompact`, `formatUnavailable()` nas 6 palavras desenhadas sem lead qualificado, opacidade de 0,8 com 3,53:1 no pior caso, as 9 palavras de maior distinção todas com nome, entre elas `grátis`, que a frase acessível cita.

### Bloqueante 1. Pergunta 31. Seção 14.1, identificação das marcas, e ROT-7

**O que o desenho faz.** 5 dos 20 nomes ficam mais perto de ponto alheio do que do ponto dono.

| Nome | Vaga usada | Distância ao dono | Ponto alheio mais perto | Distância |
|---|---|---|---|---|
| `bônus` | abaixo e à esquerda | 8,5 px | 17 palavras em 3 posições (`fato`, `dez`, `destrave`, `plantão` e outras) | 5,4 a 6,1 px |
| `entenda` | centrado, 16 px abaixo | 8,1 px | pilha de `dobre` e `entregue` | 6,9 px |
| `parcelas` | acima e à esquerda | 7,7 px | `aprovado` e `especial` | 4,9 e 5,3 px |
| `testado` | acima e à esquerda | 7,7 px | `aproveite` | 6,6 px |
| `veja` | à direita | 7,0 px | `testado` | 5,3 px |

**Evidência no PNG.** `bônus` flutua no meio de cinco posições de pontos cinza e não aponta para nenhuma; além disso o ponto dele (6 anúncios abaixo, 2 acima) guarda três palavras, `bônus`, `reduza` e `inverno`, e só uma é nomeada. `entenda` está na mesma linha e logo à direita do ponto de `dobre` e `entregue`, na exata posição em que `cashback`, uma linha abaixo, nomeia o ponto à esquerda dele; o ponto de `entenda` é o de cima. `parcelas` fica entre dois pontos cinza, o de `especial` em cima e o de `aprovado` embaixo (a 1,9 px da borda deste, com o halo de 2 px encostando nele), e os dois estão mais perto que o ponto em `--chart-1` que é o seu, a 7,7 px. `veja` está na vaga padrão, à direita do próprio ponto, mas o ponto de `testado` fica a 5,3 px, logo acima do meio do nome. `comprovado` também mede mais perto de um alheio (11,3 px contra 13,9), mas o alheio é `liberado`, cujo ponto está quase em cima do dele, e não conta.

**O que mudar.** A correção da raiz comum, mais duas coisas desta versão: não nomear ponto que guarda mais de uma palavra, ou nomear a pilha inteira; e parar os nomes nas 18 palavras típicas. Hoje a lista desce até a 40ª da ordem de distinção e dá nome a cinco palavras sem diferença (`entenda`, `personalize`, `cashback`, `juros`, `bônus`) enquanto três típicas ficam sem (`entrada`, `rápido`, `saiba`). Parar nas típicas tira `bônus` e `entenda` da fila e devolve as vagas a quem a cor diz que importa.

### Convém corrigir na mesma passada, sem peso de veredito

- Sobreposição: as 250 palavras ocupam 87 posições, a maior pilha guarda 21 e 195 palavras dividem o ponto com outra. A opacidade de 0,8 separa ponto único de pilha e mais nada (0,80, 0,96, 0,99), e a dica alcança uma palavra por pilha. Não reprova porque nenhuma palavra típica divide ponto e as contagens estão escritas, mas a nota do `meta.json` promete que os empilhados se revelam.
- `MARGIN.top` de 8 para 12 px, pelo mesmo tique deslocado da `v1` (`300` a 3,25 px da linha dele).
- Escrever o que a diagonal quer dizer, como a `v1` faz no rodapé.

## v4_termos-raros-e-grupos-desbalanceados

Resultado: reprovada. Um bloqueante, igual nos dois temas, e é o caso mais brando do modelo. O resto confere, e é o que o caso de uso pede: proporção por grupo com domínio igual de 0% a 40% e tique a cada 10%, n de cada grupo no subtítulo, 142 termos de uma menção em cada grupo num anel único em 0,25% e 2,5% com a contagem escrita ao lado, três termos de um grupo só sobre o eixo (`contrato` e `boleto` em 0% de vídeo, `upgrade` em 0% de telefone), dica por `formatRateWithVolume` com o zero e a base, aviso de grupo pequeno com ícone, palavra e 2,5 p.p. por menção, tique do topo na linha de grade (margem de 12 px).

### Bloqueante 1. Pergunta 31. Seção 14.1, identificação das marcas, e ROT-7

**O que o desenho faz.** O nome `condição` fica debaixo do ponto de `crédito`.

**Evidência.** Os dois pontos são da mesma cor e estão na mesma altura (17,5% de vídeo), a 1 p.p. um do outro no eixo do telefone: `condição` em (83,8; 119,4) e `crédito` em (92,8; 119,4), em px do SVG. O nome usa a vaga de baixo à direita (`dx: 7`, `dy: 14`) e começa em x = 90,8, com a linha de base em 133,4: a primeira letra fica debaixo do ponto de `crédito`, que está a 6,1 px da tinta, contra 9,3 px do ponto dono (2,1 px e 5,3 px contando da borda). `crédito` não tem nome, então nada desfaz a leitura.

Pela mesma medida, `cliente` também tem um ponto alheio mais perto (o de `taxa`, a 6,8 px, contra 8,0 px do dono). Está na vaga padrão, à direita e na linha do próprio ponto, e por convenção se lê certo; não sustenta o veredito sozinho, mas cai no mesmo critério de aceite. `taxa` passa na medida (9,3 px do dono, 15,9 px de `concorrente`), embora fique na linha dos pontos sem nome de `pagamento` e `concorrente`.

**O que mudar.** A correção da raiz comum. Com ela, `condição` perde a vaga atual e a fila segue para `crédito`, `objeção` e `upgrade`.

### Convém corrigir na mesma passada, sem peso de veredito

- Quem fica sem nome: `pagamento` e `concorrente` (5º e 6º em diferença, 19,5 e 18,5 p.p.), `garantia` (2º do lado do telefone, 10 p.p.) e os outros dois termos sobre o eixo, `boleto` e `upgrade`, que são o que o terceiro item do `demonstrates` mostra. `proposta`, 24º, tem nome.
- O halo do rótulo do marcador único cobre cerca de 24 px do começo da diagonal, e o fim de `proposta` encosta nela. É linha de referência e continua legível (ROT-7), mas a vaga acima do anel evitaria o cruzamento.

## v2_busca-destaca-um-termo

Resultado: aprovada, sem bloqueante. Um nome só, a 12,9 px do ponto dono e a 27,1 px do vizinho mais próximo, com anel; a raiz comum das outras três não existe aqui porque a `FoundLayer` posiciona um único nome e fica com a vaga que cobre menos. `prazo` em 43º entre as ganhas (empate triplo em 70 anotações, posição média 43) e 1º entre as perdidas confere com o dado. O destaque tem três canais (cor, anel, peso 700) e é o único 700 da peça. O desvio do catálogo, `--text-muted` opaco no lugar de `--line-strong` com opacidade, está declarado no `meta.json` e é o que o contrato manda (TOK-5, ACE-5). Termo inexistente e estado vazio foram conferidos só por leitura do código.

## O que foi pesado e não reprovou

- **Tique do topo deslocado (`v1`, `v2`, `v3`).** Com `MARGIN.top` de 8 px o tique sai em 11,25 px e a linha de grade em 8 px, 3,25 px de desvio (EIX-6b, emenda de 2026-10-02). É constante de acabamento: o tique continua sendo lido como o da linha de cima e ninguém lê valor errado. Observação.
- **Fidelidade da `v3`, pergunta 21.** A diferença entre a página e o SVG isolado mede 0,64% no escuro e 0,66% no claro (limiar de 48 por canal, o do render), acima do 0,5% da pergunta e abaixo dos 2% que reprovam no render; nas outras três fica entre 0,005% e 0,04%. A causa não está no `Chart.tsx`: o SVG isolado estreita o espaço depois de `CPL` e desloca cerca de 2 px o resto de seis linhas, uma delas do `VisualCard`. A página está certa. Vai como defeito de ferramenta.
- **Sobreposição na `v3`.** 163 das 250 palavras ficam escondidas sob outra. Pesou contra: é marca que não se vê. Pesou a favor: são todas do grupo sem diferença, nenhuma típica divide ponto, as três contagens estão escritas na linha de leitura e a posição de cada pilha é verdadeira. Observação, com pedido de correção na mesma passada.
- **Tiques da `v3` em contagem mais 1.** O catálogo pede exatamente isso e a tela declara. Observação.
- **Sentido do eixo de posição (`v1`, `v2`).** O 1º fica na origem. É o contrário da convenção de frequência, mas os tiques são ordinais, os cantos estão nomeados do lado certo e o rodapé diz que 1º é o mais citado. Observação.
- **Cinza sem amostra e diagonal sem nome.** O cinza se identifica por eliminação e pela contagem; a diagonal de dois eixos iguais se lê como igualdade. Observação.

## Defeito de régua ou de ferramenta

1. O SVG isolado do render estreita o espaço depois de `CPL`. Vale conferir as outras versões do acervo que escrevem a sigla.
2. A `CONTRASTE-MARCA` e a `ESPESSURA-MARCA` não medem dispersão do Recharts: o símbolo do `Scatter` vem com `transform="translate(...)"` e o leitor desiste com `preview_com_transform`, embora o texto com translação pura seja resolvido.
3. Nenhuma guarda mede nome contra ponto dono. A `COLISAO-TEXTO` passou nas quatro versões com 5 de 15, 5 de 20 e 2 de 10 nomes mais perto de um ponto alheio.

---

# Segunda passada: `v1`, `v3` e `v4` depois da correção

Data: 2026-10-13. Revisor independente, as três versões em `revisao_desatualizada`. Julgado o arquivo de hoje (`Chart.tsx` das 11:10 e 11:11, PNGs das 11:11), não a nota anterior. `npm run check`: 0 com erro, 0 avisos, 0 escapes. A `v2` não mudou e não foi rejulgada.

| Versão | Resultado | Não |
|---|---|---|
| `v1_ganhas-contra-perdidas` | aprovada | nenhum |
| `v3_titulos-de-criativos-por-cpl` | aprovada | nenhum (a 21 foi pesada e ficou fora do veredito) |
| `v4_termos-raros-e-grupos-desbalanceados` | reprovada | 12 |

Não se aplica, nas três: perguntas 3, 4, 6, 26, 27, 28 e 29. A 30 só se aplica à `v3` e passa. A 32 passa a se aplicar à `v1`, pela linha de chamada, e passa.

## O que a correção resolveu

Mesma medição da primeira passada: posições lidas do `preview.svg` nos dois temas, caixa de tinta por `larguraDoTexto`, distância da caixa ao centro do ponto em px de CSS.

| Versão | Nomes | Distância ao dono | Vizinho alheio mais próximo | Menor margem | Linha de chamada |
|---|---|---|---|---|---|
| `v1` | 14 | 7,9 a 9,3 px, em 12 nomes | 10,9 px ou mais | 2,7 px (`pagamento`) | `demonstração` e `concorrente` |
| `v3` | 11 | 6,9 a 8,5 px | 9,2 px ou mais | 2,3 px (`liberado`) | nenhuma |
| `v4` | 10 | 7,9 a 9,3 px | 12,3 px ou mais | 4,3 px (`demonstração`) | nenhuma |

Nenhum nome cobre marca, nenhum sai do plano e nenhum par de nomes fica a menos de 4 px. O critério de aceite da primeira passada está cumprido nas três: para todo nome, o ponto do termo é o mais próximo da tinta, ou existe linha de chamada entre os dois. Na `v1` o primeiro termo de cada lado tem nome, que era o segundo bloqueante dela, e o rodapé declara que o nome sai onde cabe. Na `v3` a fila parou nas 18 palavras típicas e nenhuma delas divide ponto com outra.

Contraste remedido à mão, porque a `CONTRASTE-MARCA` continua saindo com `preview_com_transform`: os mesmos valores da tabela da primeira passada (pior caso, `--text-muted` com 0,8 na `v3`, 3,82:1 no escuro e 3,55:1 no claro). A linha de chamada da `v1` é `--text-muted` de 1 px, 5,21:1 e 5,37:1, acima do piso de 3:1 da ACE-6.

## v4_termos-raros-e-grupos-desbalanceados

Resultado: reprovada. Um bloqueante, igual nos dois temas, e ele não existia na primeira passada: nasceu da correção. O resto confere e não precisa ser tocado: proporção por grupo com domínio igual de 0% a 40%, n de cada grupo na segunda linha do corpo, três termos de um grupo só sobre o eixo, dica por `formatRateWithVolume`, aviso de grupo pequeno com ícone, palavra e 2,5 p.p., contagens 5, 19 e 22 refeitas do `data.ts`, 10 nomes com o dono como ponto mais próximo.

### Bloqueante 1. Pergunta 12. Seção 14.1, identificação das marcas, e o primeiro item do `demonstrates`

**O que o desenho faz.** O anel do marcador único está desenhado em 0,25% de telefone e 2,5% de vídeo, sem a contagem e sem nome. Quem olha vê um círculo vazado junto da origem e nada no corpo do cartão diz o que ele é.

**Evidência.** No `preview.svg` e no `preview-claro.svg` existe o `<circle cx="50.24" cy="191.06" r="8">` e não existe nenhum `<text>` com `142 termos, 1 menção em cada grupo`: os únicos textos com halo são os 10 nomes de termo. O número 142 só aparece no cabeçalho do cartão, que vem do `useCase` do `meta.json` e não do `Chart.tsx`, e na frase acessível, que quem enxerga não lê. As linhas do corpo somam 46 termos (5, 19 e 22) e não citam o anel. O anel é um `<circle>` solto na `RareLayer`, fora de qualquer `Scatter`, então também não tem dica. Resultado: 142 dos 188 termos, 76% do universo, ficam numa marca sem identificação, e o catálogo diz que a versão demonstra `Termos de frequência 1 e 1 agregados num marcador único com a contagem`. Na primeira passada a contagem estava escrita ao lado do anel.

**Causa.** A correção pôs o teste do ponto dono dentro de `tryPlace`, e o rótulo do marcador passa pela mesma função (`tryPlace('raros', ...)`). O teste foi escrito para nome curto de ponto de 4 px; o rótulo do marcador tem 34 caracteres, 210,8 px na conta do código, e atravessa metade do plano. Refeito com as posições do preview:

| Vaga | Resultado |
|---|---|
| `dx: 8, dy: 4`, à direita, a que valia antes | dentro do plano e sem cobrir marca, **recusada pelo teste do dono**: o centro do anel fica a 12,0 px da caixa e 11 pontos ficam mais perto (`boleto` a 5,9 px, `preço` e `análise` a 6,9 px) |
| `dx: 7, dy: -6`, acima à direita | cobre 9 marcas |
| as outras seis | saem do plano pela esquerda ou pela base |

Com as oito recusadas, `tryPlace` retorna sem desenhar e sem aviso, e o `<circle>` é desenhado de qualquer jeito.

**O que mudar.** A contagem do marcador único é parte da marca, não um nome candidato: ela tem de estar escrita sempre.

1. Caminho preferido: escrever a contagem **fora do plano**, numa linha do corpo com a amostra do anel (círculo vazado com o mesmo traço de `--text-secondary`), por exemplo junto da linha `Proporção das anotações do grupo`, no mesmo padrão dos cantos nomeados. Texto calculado do dado: a contagem por `formatInt(rare.count)` e `1 menção em cada grupo`. Essa linha não depende de caber e resolve de uma vez o cruzamento com a diagonal anotado na primeira passada.
2. Caminho mínimo: tirar o rótulo do marcador do teste do dono em `tryPlace` (um parâmetro que desliga a linha do `centers.some` para a chave `raros`), mantendo os testes de plano, de marca e de outro nome. Com o dado padrão a vaga `dx: 8, dy: 4` volta a valer, com a tinta a 1,9 px da borda do ponto de `boleto`, como estava quando a primeira passada conferiu.
3. Nos dois caminhos: se o rótulo dentro do plano não for aceito, a contagem vai para a linha de fora. **Nunca desenhar o anel sem a contagem.**
4. Conferir que a mudança não mexe nos 10 nomes de termo: eles estão certos e a ordem de tentativa (marcador primeiro, depois os termos) pode continuar.

**Critério de aceite, medível.** O `preview.svg` e o `preview-claro.svg` trazem a contagem do marcador (142 com o dado padrão) num texto visível do corpo, ao lado do anel ou numa linha com a amostra do anel, e os dois PNGs mostram esse texto sem corte e sem cobrir ponto. O `npm run check` não acusa isto hoje, então a conferência é no PNG.

### Convém corrigir na mesma passada, sem peso de veredito

- Somar o marcador à linha de leitura: hoje ela conta 46 termos (5, 19 e 22) e o cabeçalho fala em 142, sem que o total de 188 apareça em lugar nenhum.
- `boleto` e `upgrade`, os outros dois termos sobre o eixo, seguem sem nome; só `contrato` mostra o que o terceiro item do `demonstrates` promete.

## v1_ganhas-contra-perdidas e v3_titulos-de-criativos-por-cpl

Resultado: aprovadas, sem bloqueante. Nada a corrigir para o veredito. As observações estão no README do modelo, no parágrafo da segunda passada.

## O que foi pesado e não reprovou

- **`v1`, quem ganha nome.** O laço percorre os 100 termos e só 14 cabem (o `demonstrates` diz quinze). Posições na ordem de distância: 1, 2, 8, 14, 15, 19, 29, 31, 34, 35, 45, 66, 83 e 97. Ficam sem nome 10 dos 15 mais distantes e três nomes caem em termos comuns colados à diagonal (`plano`, `anual`, `filial`). Pesou contra: a pergunta do caso de uso é quais termos são típicos, e o desenho nomeia 11 dos 58. Pesou a favor: nada do que está escrito é falso, o primeiro de cada lado está garantido e é o par que a frase acessível cita, a cor e a posição dizem o lado de cada ponto e o rodapé declara que o nome sai onde cabe, que era o que faltava na primeira passada. Observação, com a sugestão de parar a fila nos termos típicos, como a `v3`.
- **`v1`, vaga distante.** O nome `demonstração` para a 8,5 px do ponto de `objeção`, a distância de um nome comum ao próprio ponto, com 26 pontos mais perto que o dono. A linha de chamada liga o nome ao ponto certo, que é o critério de aceite da primeira passada. Observação: a vaga distante deveria exigir folga contra ponto alheio.
- **`v3`, 11 nomes contra os 20 do `demonstrates`.** A fila tem só as 18 típicas, então o teto de 20 não é alcançável com este dado. As 6 de maior distinção têm nome e o rodapé diz a regra. É redação do `meta.json`, não do desenho. Observação.
- **`v3`, fidelidade, pergunta 21.** Página contra SVG isolado em 0,64% no escuro e 0,66% no claro, acima de 0,5% e abaixo dos 2% que reprovam no render. Toda a diferença está no texto depois de `CPL`, inclusive no cabeçalho do cartão, que não é do `Chart.tsx`; o plano, os pontos e os nomes são idênticos. Fora do veredito, como defeito de ferramenta.
- **`v3`, sobreposição.** Continua como na primeira passada: 250 palavras em 87 posições, todas as pilhas no grupo sem diferença. Observação.

## Defeito de régua ou de ferramenta, segunda passada

1. O `check` saiu com 0 erros e 0 avisos com o anel da `v4` sem a contagem. Nenhuma guarda compara o que o `demonstrates` promete com o texto desenhado, e a camada de rótulos descarta em silêncio o que não cabe. Uma marca desenhada à mão (`<circle>` fora de `Scatter`) sem nenhum `<text>` a menos de alguns px é mensurável no `preview.svg`.
2. O SVG isolado continua estreitando o espaço depois de `CPL` (item 1 da primeira passada).
