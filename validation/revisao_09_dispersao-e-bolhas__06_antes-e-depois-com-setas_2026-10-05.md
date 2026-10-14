# Parecer de revisão: 09_dispersao-e-bolhas/06_antes-e-depois-com-setas

Data: 2026-10-05. Revisor independente. Motivo da rodada: emenda ACE-6 de 2026-09-20 (traço que carrega a relação mede 3:1 nos dois temas). Julgado o arquivo de hoje, não a nota de 2026-09-19.

`npm run check`: 4 versões, 0 com erro, 0 avisos.

## Resultado

| Versão | Veredito | Bloqueantes |
|---|---|---|
| `v1_canais-entre-trimestres` | reprovada | 2 |
| `v2_piorou-nas-duas-medidas` | aprovada | 0 |
| `v3_origens-cruzando-a-meta` | reprovada | 2 |
| `v4_entidade-nova-ou-encerrada` | reprovada | 1 |

## ACE-6, medida nas quatro (pergunta 32): passa em todas

Cor de cada `<line>` lida nos dois `preview.svg` e medida contra o cartão (`rgb(18, 28, 46)` no escuro, branco no claro).

| Traço | Token | Escuro | Claro |
|---|---|---|---|
| Seta de série única (`v1`, `v4`) | `--chart-1` | 9,50:1 | 6,00:1 |
| Seta de contexto (`v2`, `v3`) | `--text-muted` | 5,21:1 | 5,37:1 |
| Seta que piorou ou entrou (`v2`, `v3`) | `--negative` | 5,50:1 | 6,36:1 |
| Seta que saiu (`v3`) | `--positive` | 7,36:1 | 5,34:1 |

Nenhuma seta está em `--line-strong`. A reprovação das três versões abaixo não vem da ACE-6.

## v1_canais-entre-trimestres: reprovada

### B1. Pergunta 31 (e 12). ROT-4, identificação das marcas

Evidência, medida no `preview.svg`: o ponto de destino de Mídia programática institucional fica em x 682,5 e y 136,1. O nome dele está 44 px acima (y 92,1), e entre os dois passa o nome de outro canal: Eventos corporativos, em y 117,9, com a tinta de x 627 a cerca de x 744, ou seja, centrada em x 685, a 3 px do eixo do ponto de Mídia e 18 px acima dele. Nos dois PNGs o rótulo mais próximo do ponto de Mídia, e centrado sobre ele, é o de Eventos; o nome certo está atrás desse, sem linha de chamada. Para saber qual ponto era Mídia foi preciso abrir o `data.ts`. É a mesma classe do defeito que reprovou a versão em 2026-09-19 (rótulo que rouba o nome da marca), e a observação antiga do README já descrevia o par.

O que mudar: o nome de Mídia precisa ser o rótulo mais próximo do ponto de Mídia, sem nome alheio no caminho. Caminhos possíveis: colocar primeiro os nomes mais longos em `placeLabels`; recusar posição cuja caixa fique entre outro ponto de destino e o nome dele; ou mandar o nome de Mídia para a fileira reservada com linha de chamada. Conferir nos dois temas que nenhum outro par ficou igual.

### B2. Perguntas 14 e 25. NUM-1, DAD-1, Precedência da seção 17 (volume junto da taxa)

Evidência: a linha de leitura e a frase acessível escrevem `qualificação de 26% para 40%` com `formatPercent(x, 0)`, sem volume. O `data.ts` traz `qualBefore` e `qualAfter` como fração pronta, sem contagem. A NUM-1 pede taxa com uma casa e o volume (`formatRateWithVolume`), e a Precedência põe o volume junto da taxa entre o que nenhuma regra relaxa. As três irmãs já fazem certo.

O que mudar: declarar leads e leads qualificados por período no `data.ts`, derivar a taxa no componente com retorno `number | null` (EST-1b) e escrever a taxa com `formatRateWithVolume` na linha de leitura e na frase acessível, como na `v2`.

### Para alinhar na mesma passada (não bloqueia)

- Linha de chamada da fileira de reserva em `--line-strong`: ela liga nome a ponto, e pelo teste da ACE-6 é traço que carrega relação. Não é desenhada com o dado fixo, mas se o conserto de B1 usar a fileira, ela aparece: trocar por `--text-muted`, como na `v4`.
- Legenda abaixo do plano (ROT-4 pede acima ou ao lado) e eixos sem nome no desenho: a `v2` resolve os dois com legenda no topo e rodapé de eixos.

## v3_origens-cruzando-a-meta: reprovada

### B1. Perguntas 11 e 13. Seção 17.2 (papel Referência), TOK-5

Evidência: `Chart.tsx`, linha 467, desenha a divisória da meta com `stroke="var(--line-strong)"`, 1,5 px, tracejado `6 4`. Medido no preview: `rgb(51, 69, 106)` no escuro, 1,79:1; `rgb(180, 192, 214)` no claro, 1,83:1. A tabela 17.2 dá o papel por nome: Referência (média, meta, teto) é `--text-muted`, e `--line-strong` fica só para a linha do zero. A saída da TOK-5 repete: `--text-muted` no papel de referência. O argumento do README (item 12 da anatomia) e do `meta.json`, de que a ACE-6 libera `--line-strong` para referência, lê a ACE-6 pela metade: ela separa referência de dado, mas quem diz o token da meta é a 17.2. E nesta versão a divisória é o assunto do cartão: no PNG claro ela é o traço mais pálido depois da grade.

O que mudar: `stroke="var(--text-muted)"` na divisória (5,21:1 e 5,37:1). Alinhar o tracejado e a espessura ao `3 3` de 1 px da 17.2 na mesma passada. Corrigir a frase do item 12 da anatomia no README e a nota do `meta.json`, que hoje justificam o token errado.

### B2. Perguntas 1 e 12. ROT-4, identificação das marcas

Evidência: o `useCase` pergunta "Quem saiu e quem entrou na faixa abaixo da meta". Seis setas cruzam a divisória e levam cor; só três levam nome (Conteúdo orgânico, Redes sociais, Busca paga). As outras três que cruzaram, Eventos corporativos (30,0% para 20,0%), E-mail próprio (27,8% para 18,8%) e Webinar técnico (20,0% para 27,3%), ficam anônimas nos dois PNGs, sem dica e sem declaração na legenda de que o nome foi racionado. O cartão não responde a própria pergunta para metade das respostas. Na `v2` a regra irmã funciona porque as três que respondem à pergunta têm nome e a legenda declara as demais como contexto.

O que mudar: toda seta que cruzou precisa ser identificável sem interação. O caminho mais curto é nomear a união (cruzou a meta, ou deslocamento acima do percentil 75), mantendo o percentil como regra de racionamento das setas de contexto; o grupo da esquerda (x de 50 a 180 leads) é apertado e pode pedir a fileira reservada com linha de chamada em `--text-muted`, como na `v4`. Se o dono preferir manter a letra do catálogo (rótulo só acima do percentil 75), então a legenda precisa declarar o racionamento e o `useCase` deixa de perguntar "quem".

### Para alinhar na mesma passada (não bloqueia)

- Os nomes coloridos não levam palavra (a `v2` escreve "piorou"); entrou e saiu se distinguem pela cor e pelo sentido da seta. Escrever "entrou" e "saiu" no rótulo fecha a ACE-2 sem depender da direção.
- Tique do eixo X em número solto (`100`, `200`); o substantivo vem só do rodapé.

## v4_entidade-nova-ou-encerrada: reprovada

### B1. Pergunta 12. ROT-4, identificação das marcas

Evidência: a legenda escreve `campanha encerrada, sem T3/2026` (`Chart.tsx`, linha 311). O `data.ts` da campanha encerrada (Remarketing de site) traz `after: { cpl: 240, leads: 120, qualified: 18 }`, e o x é desenhado exatamente nessa posição: R$ 240 e 15%, que é o T3 medido. O comentário do próprio `data.ts` diz "encerrada no fim do período corrente". A legenda afirma ausência de um período que a marca plota, em paralelo com `campanha nova, sem T2/2026`, que é verdadeira. Quem lê a legenda conclui que o x não é uma medida, e é. Pior: uma campanha de fato sem T3 (sem leads no `after`) é descartada em silêncio pelo `flatMap` da linha 260 e nem aparece.

O que mudar: reescrever a entrada para dizer o que o x é, por exemplo `campanha encerrada no fim do T3/2026`. Conferir que a segunda linha da legenda continua cabendo e que o diff do render fica em até 0,5% nos dois temas.

### Para alinhar na mesma passada (não bloqueia)

- A linha de leitura e a frase acessível têm o singular fixo ("1 campanha é nova", "1 encerrada"); com outro recorte sai "2 campanha é nova".
- Campanha encerrada que se moveu menos de 12 px vira anel de mudança pequena e perde o x: o teste de `SMALL_MOVE_PX` vem antes do `ended`.

## v2_piorou-nas-duas-medidas: aprovada

Sem bloqueante. As 32 perguntas respondidas com sim; 27, 28 e 29 não se aplicam, 18 não se aplica (sem dica). Observações no README do modelo.

---

# Segunda passada, 2026-10-05: revisão do código corrigido

Motivo: `revisao_desatualizada` nas três versões reprovadas acima. Julgado o arquivo de hoje, não as notas da primeira passada. `npm run check`: 4 versões, 0 com erro, 1 aviso (`v1`, FRASE-ACESSIVEL com 236 caracteres, a 14 do teto).

| Versão | Veredito | Bloqueantes |
|---|---|---|
| `v1_canais-entre-trimestres` | reprovada | 1 |
| `v3_origens-cruzando-a-meta` | reprovada | 1 |
| `v4_entidade-nova-ou-encerrada` | aprovada | 0 |

O que a correção fechou, conferido: na `v1`, a taxa sai de contagens do `data.ts` e é escrita com `formatRateWithVolume` na linha de leitura e na frase acessível (B2 antigo); na `v3`, a divisória está em `--text-muted` (`rgb(127, 143, 171)` no preview escuro) e as seis setas que cruzaram têm nome (B1 e a contagem do B2 antigos); na `v4`, a legenda diz `campanha encerrada no fim do T3/2026` (B1 antigo). A ACE-6 continua passando nas três, com os mesmos tokens da tabela acima.

O que sobra é um único defeito, da mesma classe nas duas versões reprovadas: o anticolisão testa se a caixa do nome **toca** ponto, seta ou outro nome, mas não testa **de quem o nome fica mais perto**. Com isso um nome passa em todas as guardas e ainda assim estaciona junto do ponto de outra entidade, enquanto o dono daquele ponto vai para o raio de 44 px, atrás dele.

## v1_canais-entre-trimestres: reprovada

### B1. Perguntas 31 e 12. ROT-4, ROT-7 (marca fina), identificação das marcas

Evidência, medida no `preview.svg` e vista igual nos dois PNGs:

- Ponto de destino de Outbound direto: x 562,8 e y 154,3.
- Nome `Mídia programática institucional`: âncora no fim em x 666,5 e y 136,1, tinta de cerca de x 490 a x 666. O ponto de Outbound cai **dentro** da largura desse nome, 18,2 px abaixo do centro dele, com cerca de 10 px de vão entre a tinta e o ponto.
- Nome `Outbound direto`: centrado em x 562,8 e y 198,3, ou seja, **44 px** abaixo do próprio ponto, sem linha de chamada. A tinta começa perto de x 517, e o anel de origem de Redes sociais (x 514,9 e y 177,1) fica 21 px acima desse começo, mais perto do nome que o ponto dele.

Na tela, o ponto de Outbound tem `Mídia programática institucional` logo acima, na posição clássica de rótulo, e o nome `Outbound direto` flutua embaixo de um anel que é de outro canal. É o defeito do par Eventos e Mídia da primeira passada, que a ordenação por comprimento do nome resolveu para aquele par e empurrou para este.

O que mudar: em `placeLabels`, recusar a caixa candidata quando existir ponto de **destino alheio** mais perto da caixa do que o ponto próprio (distância do ponto ao retângulo, não só o teste de `POINT_BUFFER`), e aplicar a mesma recusa a um nome que só ache lugar no raio de 44 px com nome alheio entre ele e o ponto. Quem não achar posição assim vai para a fileira reservada com linha de chamada, e a linha de chamada sai em `--text-muted`, não em `--line-strong`, porque passa a ser desenhada. Conferir os oito pares nos dois temas depois da troca, não só este.

### Não bloqueia (está no README)

- Taxa escrita com zero casas (`26% (52 de 200)`), e a NUM-1 pede uma casa; a `v3` escreve `15,0%`.
- A guarda de vazio troca o gráfico inteiro pela frase "Nenhum canal neste recorte" quando um único canal vem sem base de leads.

## v3_origens-cruzando-a-meta: reprovada

### B1. Perguntas 31, 12 e 1. ROT-4, identificação das marcas

Evidência, medida no `preview.svg` e vista igual nos dois PNGs:

- Ponto de destino de E-mail próprio: x 244,4 e y 183,6, em `--negative`.
- Nome `Eventos corporativos`, também em `--negative`: começa em x 132,1 e y 201,1, tinta até cerca de x 252. O fim do nome fica **17,4 px abaixo** do ponto de E-mail, com cerca de 9 px de vão, e o ponto cai dentro da largura dele.
- Nome `E-mail próprio`: centrado em x 244,4 e y 227,6, **44 px** abaixo do próprio ponto, com o nome de Eventos no meio do caminho e sem linha de chamada.
- Ponto de destino de Eventos corporativos: x 107,6 e y 176,6, a 34 px na diagonal do começo do nome, com o anel de origem de Webinar técnico (x 138 e y 176,6) entre os dois.

Na tela, a seta vermelha que termina em 160 leads e 18,8% lê como Eventos corporativos, e ela é E-mail próprio; o nome `E-mail próprio` fica sem marca. A pergunta da versão é quem entrou e quem saiu, e duas das três que entraram ficam com o nome trocado ou órfão. As duas têm a mesma cor, então a cor não desfaz a dúvida.

O que mudar: a mesma recusa descrita na `v1` (ponto de destino alheio mais perto da caixa que o próprio), aplicada nos 32 candidatos e na varredura de reserva. O nome que perder a vizinhança sai com linha de chamada em `--text-muted`, como `Webinar técnico` já sai nesta versão; hoje a linha de chamada só nasce quando as 32 posições falham, e `E-mail próprio` acha a 32ª. Conferir os seis nomes nos dois temas.

### Não bloqueia (está no README)

- Nomes coloridos sem a palavra entrou ou saiu; tique do eixo X em número solto. Os dois já estavam registrados.

## v4_entidade-nova-ou-encerrada: aprovada

Sem bloqueante. As 32 perguntas respondidas com sim; 13, 18, 27, 28, 29 e 30 não se aplicam. O par mais apertado é `Conteúdo técnico`, cujo começo fica a 16,3 px do próprio ponto e a 17,6 px do ponto de Webinar de produto: o nome próprio ainda é o mais próximo e os dois nomes saem na mesma direção, então a leitura fecha, mas a margem é de 1,3 px e vai como observação.
