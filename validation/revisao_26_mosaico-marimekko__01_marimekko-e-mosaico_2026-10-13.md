# Parecer de revisão: 26_mosaico-marimekko/01_marimekko-e-mosaico

Data: 2026-10-13. Revisor independente, primeira passada, as quatro versões em `sem_revisao`, julgadas pelo arquivo e pelos PNGs de hoje (render das 12:46, posterior ao `Chart.tsx` das 12:45 nas quatro). `npm run check` com tipos: 0 com erro, 3 avisos, 0 escapes.

Resultado: `v1`, `v2` e `v3` aprovadas; `v4` reprovada por dois bloqueantes. As observações não bloqueantes das quatro estão no README do modelo, seção `Observações da revisão (não bloqueantes)`. Este arquivo trata do que reprova, do que convém corrigir na mesma passada e do que foi pesado e não reprovou.

| Versão | Resultado | Não |
|---|---|---|
| `v1_cobertura-de-dado-por-origem` | aprovada | nenhum |
| `v2_handoff-aceitas-e-devolvidas` | aprovada | nenhum |
| `v3_participacao-de-mercado-com-perimetro` | aprovada | nenhum, 17 e 25 com ressalva |
| `v4_desfecho-por-origem-com-residuos` | reprovada | 14 e 19 |

Não se aplica, nas quatro: perguntas 26, 28, 29 e 30. A pergunta 13 só se aplica à `v2`, e passa.

## O que foi medido e o que não foi

* **Medido no `preview.svg`:** a área de cada ladrilho contra o valor da célula lido da dica. São 15, 14, 16 e 14 ladrilhos, e o maior desvio entre participação em área e participação em valor é de 0,0000 p.p. nas quatro. A `RAIO-CONTRA-AREA` saiu `sem_marca_de_area`, então a conta foi feita à mão.
* **Refeito do `data.ts`:** os percentuais pelo maior resto somam 100 por coluna, entre colunas e na legenda na `v1`, na `v2` e na `v3`; os 15 resíduos de Pearson da `v4` batem com a tela (5 fora da faixa neutra, 1 com esperado abaixo de 5).
* **Escala e tipografia:** o `viewBox` é igual à caixa nas quatro (574 por 269, 894 por 345, 894 por 273 e 574 por 321), o corpo usa 12 e 11 px, pesos 400, 500 e 600, nenhum 700.
* **Preview contra página:** de 0,04% a 0,12% de pixels diferentes nos oito pares de PNG.
* **Recortes ampliados dos PNGs:** a coluna estreita da `v2`, da `v3` e da `v4`, os rótulos sobre hachura da `v1` e a legenda da `v4`, nos dois temas.
* **Não medido pela ferramenta:** `EIXO-CALMO` (`sem_grade`), `OPACIDADE-MARCA` (`sem_opacidade_em_marca`) e `RAIO-CONTRA-AREA` nas quatro. As guardas de texto leem só o `<text>` do SVG: linha de leitura, legenda, subtítulo, botões e lista de identificação são HTML, e o contraste deles saiu da tabela abaixo.
* **Não renderizado:** o estado vazio das quatro, a visão Região e a tabela aberta da `v3`, o estado invertido da `v4` e o rótulo sobre hachura da `v4`. O que se diz deles é leitura do código.
* **Não testado:** as saídas sugeridas. As larguras citadas são conta, não render.

Pares de contraste, calculados de `app/src/styles/tokens.css` pela fórmula da WCAG:

| Par | Escuro | Claro | Onde |
|---|---|---|---|
| `--accent-cyan-contrast` sobre `--chart-1` | 10,06 | 6,00 | rótulo interno, `v1` a `v4` |
| `--accent-cyan-contrast` sobre `--chart-3` | 6,86 | 6,18 | rótulo interno, `v1` |
| `--surface-raised` sobre `--text-muted` | 5,21 | 5,37 | rótulo interno, `v2`, `v3` e `v4` |
| `--text-primary` sobre `--line-strong` | 8,13 | 9,79 | rótulo interno, `v2`, `v3` e `v4` |
| `--text-secondary` sobre `--surface-sunken` | 9,36 | 7,04 | rótulo interno da `v3`, botões |
| `--prov-premissa` sobre `--surface-raised` | 8,36 | 5,74 | etiqueta da `v3` |
| `--text-muted` sobre `--surface-raised` | 5,21 | 5,37 | hachura, conectoras, linha do zero, texto de apoio |
| `--line-strong` contra o cartão | 1,79 | 1,83 | neutro de dado, vale com o valor escrito |
| `--surface-sunken` contra o cartão | 1,15 | 1,15 | poço, vale com contorno e valor escrito |
| `--line-strong` contra `--surface-sunken` | 2,05 | 1,59 | marca contra marca, `v4` |
| `--chart-1` contra `--text-muted` | 1,82 | 1,12 | marca contra marca, `v2`, `v3` e `v4` |

## v4_desfecho-por-origem-com-residuos

Resultado: reprovada. Dois bloqueantes, iguais nos dois temas. O resto confere: 520 no total e 190, 150, 96, 62 e 22 por origem; as partes escritas em cada coluna somam o `n` dela; o maior desvio da linha de leitura é o do dado (58 contra 27,0 esperadas, resíduo +6,0); a área bate com a contagem; o zero de Orgânico sai como linha com ponto e com `0` na lista; o esperado de 3,1 em Evento sai hachurado e sem cor; a rampa neutra anda no mesmo sentido nos dois temas; a troca de dois matizes por `--chart-1` contra neutro está declarada e a função de cor mora num lugar só (`BAND_STYLE`).

### Bloqueante 1. Pergunta 14. NUM-6 e seção 14.1 (unidade)

**O que o desenho faz.** Toda contagem do cartão vai sem substantivo: `n = 190` no eixo, `Ganho 22` no ladrilho, `58 contra 27,0 esperadas` na linha de leitura, `esperado abaixo de 5` na legenda. A palavra oportunidades não aparece no título, no caso de uso, no corpo nem na dica.

**Evidência.**

* Texto visível extraído do `preview.svg` e do `preview-claro.svg`: zero ocorrências de `oportunidade`. A única do arquivo está no `data-farol-ace`, `Mosaico de 520 oportunidades por origem e desfecho`. Quem ouve recebe a unidade, quem vê não.
* `Chart.tsx`, linha 252: `n = ${formatInt(count)}`. Linhas 334 a 337: a linha de leitura. Linhas 392 e 393: a dica escreve `observadas` e `esperadas`, sem o substantivo.
* As mesmas origens aparecem na `v1` deste modelo contando leads (Redes sociais, 404 leads). Aqui Redes sociais tem `n = 190`, e nada no cartão diz que a contagem passou de lead para oportunidade.
* O total de 520 também não está no corpo; só a soma dos cinco `n` chega a ele.

**Por que pesa.** Unidade está na lista da seção 14.1 que bloqueia sempre. O acervo trata contagem sem substantivo como observação quando a unidade está escrita em outro ponto do cartão (`25/01 v3`, `20/07`) e reprovou quando ela não está em lugar nenhum do corpo (`21/05 v2`, `09/03 v4`). Aqui ela não está em lugar nenhum.

**O que mudar.**

1. Nomear a contagem no corpo. O lugar que comporta sem criar linha é o eixo da primeira coluna, no padrão das irmãs, que escrevem a base só nela (`33% do total`): `n = 190 oportunidades` pede perto de 129 px pela conta do próprio arquivo (21 caracteres a 11 px e 0,56 em) contra 198 px de coluna.
2. A linha de leitura e a legenda não têm folga para a palavra. A linha de leitura ocupa perto de 482 dos 574 px e a palavra pede mais uns 82; a segunda linha da legenda vai até perto de 455 px. Linha a mais no corpo encolhe o SVG inteiro (GEO-18): se a palavra for para lá, a conta de altura do `notes` precisa ser refeita.
3. Na dica, `134 oportunidades observadas` no lugar de `134 observadas`.
4. Renderizar nos dois temas e rodar o `check`.

### Bloqueante 2. Perguntas 19 e 18. ACE-2 e DIC-1

**O que o desenho faz.** O ladrilho de Indicação de cliente com perdido (30 observadas contra 55,4 esperadas, resíduo −3,4) está na faixa de −2 a −4 e é o terceiro maior desvio do cartão. O número e o sinal do resíduo não saem em lugar nenhum da tela: o ladrilho escreve só `Perdido 30`, e a lista de identificação não o traz, porque ele tem rótulo. A faixa se lê só pelo preenchimento.

**Evidência.**

* `Chart.tsx`, linha 280: `showResidual` exige `tile.w >= inlineWidth + estimateWidth(residualText, VALUE_FONT) + LABEL_PAD`. Neste ladrilho a conta dá 79,2 + 24,6 + 6 = 109,8 px contra 100,1 px de largura. Faltam 9,8 px, e o resíduo é descartado sem ir para a lista, que só recebe `mode === 'mute'` (linha 285).
* Textos do `preview.svg`: `−4,3`, `+2,3` e `+6,0` nos três ladrilhos que comportam, e `(resíduo −3,0)` na lista para o zero de Orgânico. São 4 das 5 combinações fora do esperado com número na tela; a quinta só existe na dica (linha 393).
* O preenchimento que carrega a faixa é `--line-strong`: 1,79:1 e 1,83:1 contra o cartão, e 2,05:1 no escuro e 1,59:1 no claro contra o poço da faixa neutra, que é a vizinha na escala.
* Não há posição que ajude. Na `v1`, na `v2` e na `v3` a ordem fixa da pilha é o segundo canal da cor; aqui qualquer ladrilho pode cair em qualquer faixa.
* O comentário da linha 276 e o `notes` dizem que o número do resíduo é o segundo canal da cor (ACE-2, TOK-9). Neste ladrilho ele não existe.

**Por que pesa.** A pergunta 19 tem resposta não neste ladrilho, e a régua do próprio arquivo, segundo canal em toda célula fora do esperado, não se cumpre no dado padrão. O que se perde não é detalhe: quem não separa 1,59:1 lê o ladrilho como faixa neutra e conclui que a perda em indicação está dentro do esperado, o contrário do que o dado diz. Pela DIC-1, o número de uma das cinco combinações que respondem ao caso de uso vive só na dica. É o mais leve dos dois bloqueantes, porque o tom se separa por luminância e não por matiz.

**O que mudar.**

1. Toda célula fora da faixa neutra escreve o resíduo com sinal na tela. Este ladrilho tem 75,3 px de altura: quando o rótulo de uma linha cabe e o resíduo não cabe ao lado, o resíduo desce para a segunda linha (o modo empilhado do arquivo já trabalha com 34 px).
2. Sem altura para a segunda linha, o resíduo vai para a lista de identificação, como já vai o do ladrilho mudo.
3. A regra vale também para o estado invertido, que o preview não desenha.
4. Conferir que a lista de identificação segue em duas linhas, que são os 40 px reservados no `notes`.

### Na mesma passada, sem peso de bloqueio

1. **Ponto do zero.** O ponto tem raio de 2,5 px num vão de 6 px entre grupos (`ZERO_DOT`, `GROUP_GAP`): sobra 0,5 px de cada lado, e no PNG ele encosta no canto do ladrilho hachurado de Evento, como se fosse marca dele. Raio de 2 px, ou o ponto no começo da linha, separa.
2. **Colchete da lista.** `Evento: ganho 6, perdido 12, em aberto 4 (amostra insuficiente)` lê como se os três itens fossem amostra insuficiente; só o em aberto tem esperado abaixo de 5.
3. **Neutros de Evento.** Os dois ladrilhos da faixa neutra na coluna de 22,9 px não têm número junto: poço a 1,15:1 com contorno a 1,8:1. A lista cobre os números; nos dois PNGs eles se veem.
4. **Estado invertido.** Não renderizado. Pela conta do arquivo, a coluna Em aberto fica com 78,8 px e os cinco ladrilhos dela saem mudos (`Busca paga` pede 79,2 px no modo empilhado), com a lista de identificação perto de 190 caracteres, ainda em duas linhas.
5. **Frase do desvio.** O `notes` atribui a troca dos dois matizes a decisão do dono; a revisão não tem como conferir. A TOK-3 lista duas saídas (slots categóricos opostos ou `color-mix` semântico) e a versão usa uma terceira, acento contra neutro, que funciona nos dois temas e está declarada.

## Versões aprovadas

* **`v1_cobertura-de-dado-por-origem`.** 32 perguntas sem "não". 1.212 leads em cinco colunas de 33, 26, 17, 13 e 11%; partes de cada coluna somando 100, com os dois ladrilhos mudos (3% e 5% de ausente) na lista de identificação; legenda 58, 28 e 14. Ausência hachurada em `--text-muted`, por último e no topo; rótulo sobre hachura com halo, legível nos dois temas no recorte ampliado. Slots 1 e 3 pela chave `slot` do dado.
* **`v2_handoff-aceitas-e-devolvidas`.** 32 perguntas sem "não". 400 oportunidades, 254 aceitas e 146 devolvidas, 81 delas por fora de perfil (55%); os dois lados na mesma escala de 129,5 px por 100%, zero em `--line-strong` dentro do vão, anotação com taxa e volume (`36,2% (55 de 152)`, 49 caracteres). A fila de n = 3 vai com contagem no lugar de percentual. O aviso de `CONTRASTE-MARCA` é o `--line-strong` como neutro de dado: os quatro ladrilhos dele têm o percentual escrito, e a amostra da legenda tem o valor ao lado.
* **`v3_participacao-de-mercado-com-perimetro`.** Perguntas 17 e 25 com ressalva, as demais sem "não". R$ 400,0 mi nas duas visões, com a mesma receita por competidor (93,9, 126,5, 82,8 e 96,8 mi). A etiqueta `PREMISSA` dentro do Chart contraria a ANO-6, mas o catálogo a pede, é a procedência de um número do corpo e o desvio está declarado; `25/04`, `25/05`, `25/07` e `22/05 v3` passaram do mesmo jeito. Destaque contra neutro mede 1,12:1 no claro; o segundo canal é o nome no ladrilho (`Nós 22%`), o peso na legenda e a posição na base.

## Pesado e não reprovado

* **`v3` e `v4`, coluna estreita com neutro abaixo de 3:1.** Na coluna de 4,4 px da `v3`, os ladrilhos de concorrente B (`--line-strong`) e de demais (poço com contorno) não têm número junto, e a isenção da 17.2 pede o valor na marca ou ao lado. Ficou como observação: a coluna inteira tem os quatro números na lista de identificação, o rótulo escalonado dá o total, e no recorte ampliado dos dois temas os quatro ladrilhos se veem. É o mesmo peso que `22/05 v2` deu ao ramo sem rótulo.
* **`v2`, demais motivos somados.** O caso de uso pergunta por que motivo o resto voltou, e o corpo responde com fora de perfil contra demais motivos; sem orçamento (40) e sem retorno do contato (25) só se abrem na dica. Não reprova: o catálogo pede um motivo aceso contra os demais, as três partes desenhadas têm nome e número, e a linha de leitura dá a resposta principal. Vai como observação.
* **`v1` e `v3`, ordem da legenda.** A legenda segue a pilha da base para o topo, e a ROT-4 fala em pilha lida de cima para baixo. Na `v1` a ausência fica no topo, e a pergunta 6 a quer por último na legenda: as duas réguas não se cumprem juntas. A legenda tem valor e a ordem é a do dado; observação.
* **`v2`, metade de baixo vazia.** O domínio fixo em 100% por lado deixa as colunas largas usando no máximo 43% do lado das devolvidas. É a escolha que o catálogo descreve (100% nas duas pontas) e mantém a escala entre filtros.

## Tensões de régua notadas

* O verbete deste modelo no catálogo contradiz o contrato em quatro pontos: hachura da ausência em `--line-strong` (TOK-5), ladrilho sem rótulo indo só para a dica (ROT-10), resíduo em dois matizes de acento sem token divergente (TOK-3) e etiqueta de procedência dentro do Chart (ANO-6). Nos três primeiros o produtor desviou pelo contrato e declarou; no quarto ficou com o catálogo, também declarado. O catálogo precisa de emenda.
* Nenhuma guarda confere se a contagem tem substantivo no corpo (NUM-6): a `v4` passa no `check` com zero ocorrências da unidade no texto visível.
* Nenhuma guarda confere a presença do segundo canal quando a cor carrega faixa de valor (ACE-2, TOK-9).

## Registro

```
Versão: 26_mosaico-marimekko/01_marimekko-e-mosaico/v1_cobertura-de-dado-por-origem
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Não se aplica: 13, 26, 28, 29, 30

Versão: 26_mosaico-marimekko/01_marimekko-e-mosaico/v2_handoff-aceitas-e-devolvidas
Data: 2026-10-13
Resultado: aprovada
Não: nenhum
Não se aplica: 26, 28, 29, 30

Versão: 26_mosaico-marimekko/01_marimekko-e-mosaico/v3_participacao-de-mercado-com-perimetro
Data: 2026-10-13
Resultado: aprovada
Não: nenhum (17 e 25 com ressalva, ANO-6 contra o catálogo)
Não se aplica: 13, 26, 28, 29, 30

Versão: 26_mosaico-marimekko/01_marimekko-e-mosaico/v4_desfecho-por-origem-com-residuos
Data: 2026-10-13
Resultado: reprovada
Não: 14, 19
Correções:
  14. NUM-6: escrever o substantivo da contagem (oportunidades) no corpo, a começar pelo eixo da primeira coluna.
  19. ACE-2 e DIC-1: escrever na tela o resíduo com sinal de toda célula fora da faixa neutra, hoje ausente em Indicação de cliente com perdido (−3,4).
Não se aplica: 13, 26, 28, 29, 30
```
