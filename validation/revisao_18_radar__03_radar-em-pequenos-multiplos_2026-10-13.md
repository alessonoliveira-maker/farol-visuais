# Parecer de revisão: 18_radar/03_radar-em-pequenos-multiplos

Data: 2026-10-13. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 07:01, posterior ao `Chart.tsx`, ao `data.ts` e ao `meta.json` das quatro). `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes em uso.

Resultado: `v1`, `v3` e `v4` aprovadas; `v2` reprovada, com dois bloqueantes. As observações não bloqueantes estão no README do modelo.

## Peso dos bloqueantes

* **`v2`, média do time apagada em cima do preenchimento do SDR.** Perguntas 20 e 32; ACE-3 e ACE-6; armadilhas TOK-4 e TOK-9. A seção 14.1 põe contraste e identificação das marcas entre as regras que bloqueiam sempre. O contorno da média é o assunto da versão, não pano de fundo: tapado ele, some a comparação que o título promete.
* **`v2`, preenchimento abaixo do piso na miniatura selecionada, no tema claro.** Pergunta 30; ACE-5 e ACE-3. É o piso que o próprio README do modelo declara para o preenchimento ("o mínimo da ACE-5 para essa cor no tema claro"), medido agora contra o fundo que a versão põe atrás da marca. Pesa menos que o primeiro, porque o contorno de 2 px continua visível, mas é número abaixo do piso num estado que o preview mostra, e a correção mora no mesmo trecho de código.

## O que foi medido e o que não foi

* **Medido:** os dois PNGs de cada versão, inteiros e com recorte ampliado das miniaturas críticas (zero medido, eixo sem dado, miniatura selecionada, legenda de amostras, títulos mais longos da `v4`); a cor de pixel do tracejado, do preenchimento e do fundo nos dois PNGs da `v2`; o contraste pela fórmula da WCAG, calculado dos tokens de `app/src/styles/tokens.css` e conferido pelo pixel; cada número escrito na tela contra o `data.ts` (índice médio dos oito SDRs, média do time por eixo, contagem de eixos abaixo, ordem das miniaturas, soma dos leads das origens que ficam fora); o raio de um vértice por versão contra o valor.
* **Sondado em navegador:** a árvore de acessibilidade de um botão com `aria-pressed` dentro de uma raiz `role="img"`, no Edge, em página avulsa no scratchpad. A sonda não gravou nada no catálogo.
* **Não medido pela ferramenta:** ESPESSURA-MARCA, EIXO-CALMO e RAIO-CONTRA-AREA nas quatro (peça sem barra, sem grade cartesiana e lida por distância ao centro); OPACIDADE-MARCA na `v3`, cujo preenchimento mora no `shape` próprio. O da `v3` foi medido à mão: 4,85:1 no escuro e 3,01:1 no claro contra o cartão. Nenhuma guarda mede marca contra marca, nem marca contra superfície que não seja o cartão, e é aí que estão os dois bloqueantes. O texto em HTML (títulos, legenda, linha de leitura) fica fora das guardas de preview e foi conferido no PNG.
* **Não renderizado:** o estado vazio das quatro e o ramo de até 12 origens da `v4`. O que se diz deles é leitura do código.
* **Não sondado:** a dica das quatro versões, inclusive a do eixo sem dado da `v3`. Nenhum `demonstrates` deste modelo promete a dica, e a ausência da `v3` está escrita no título da miniatura e no eixo tracejado.
* **Não testado:** as saídas sugeridas abaixo. Os números citados nelas são conta sobre os tokens, não render.

Medidas de palco: PNG de 1920 por 1280 px (o dobro do canvas de 960 por 640). Na `v2`, o anel de 100 tem cerca de 61 px de raio.

## `v2_media-do-time-em-cada-miniatura`: reprovada, dois bloqueantes

### Bloqueante 1. Perguntas 20 e 32; ACE-3 e ACE-6; saída pela TOK-4, medição pela TOK-9

**Evidência.** A média do time é um segundo `Radar`, pintado depois do SDR, em `--text-muted`, tracejado `3 3`, com 1,5 px. O SDR é `--chart-1` com `fillOpacity` de 0,66. Onde o SDR está acima da média, o tracejado passa por cima do preenchimento, e ali os dois têm quase a mesma luminância:

| Tema | Tracejado da média | Preenchimento do SDR sobre o cartão | Contraste |
|---|---|---|---|
| escuro | `#7f8fab`, pixel (127, 143, 171) | pixel (36, 150, 169) | 1,07:1 |
| claro | `#5c6b87`, pixel (92, 107, 135) | pixel (94, 159, 170) | 1,79:1 pelo token, 1,80:1 pelo pixel |

Contra o cartão o mesmo tracejado mede 5,21:1 e 5,37:1, e por isso o `check` não vê nada: toda guarda mede marca contra cartão. O piso da ACE-3 é de 3:1 contra o fundo adjacente, e o fundo adjacente do tracejado, nesses trechos, é o preenchimento. A isenção do valor escrito não vale, porque a média não tem número na tela.

O trecho apagado não é resto: em sete das oito miniaturas o tracejado cruza o preenchimento, e em três delas (Larissa P., Helena M. e Renata S., as de 0 de 6 eixos abaixo) o contorno da média fica inteiro dentro dele. No tema escuro, que é o padrão do Farol, essas três miniaturas mostram a referência a 1,07:1, separada do fundo só pelo matiz. O `demonstrates` diz "a mesma média desenhada em todas as miniaturas", e o teste da ACE-6 dá dado, não referência: tapado o tracejado, a miniatura deixa de dizer onde fica a média. A TOK-9 manda medir o par marca contra marca à mão nos dois temas e escrever o número na nota do `meta.json`; a nota não traz essa medida.

A causa é o encontro de duas regras. O catálogo pede o SDR preenchido e a média em `--text-muted`; a ACE-5 levou o preenchimento a 0,66 para passar de 3:1 contra o cartão no claro, e foi esse 0,66 que igualou a luminância do preenchimento à do tracejado.

**O que mudar.** Fazer o contorno da média medir pelo menos 3:1 contra o que estiver atrás dele, nos dois temas, em todo o perímetro. Duas saídas, a escolher:

1. **Revestimento por baixo do tracejado**, que é a saída da TOK-4. Um traço cheio na cor da superfície, com 3,5 a 4 px, seguindo o mesmo contorno da média, pintado depois do preenchimento do SDR e antes do tracejado. Para o revestimento não cortar o contorno de 2 px do SDR (ROT-7, marca fina), a ordem de pintura passa a ser: preenchimento do SDR sem traço, revestimento, tracejado da média, contorno do SDR por último. Pela conta: revestimento em `--surface-raised` contra o preenchimento mede 4,85:1 no escuro e 3,01:1 no claro; tracejado contra o revestimento mede 5,21:1 e 5,37:1. O 3,01:1 do claro fica no limite e precisa ser conferido no render.
2. **Tirar o preenchimento do SDR nesta versão** e deixar só o contorno de 2 px. O tracejado passa a ficar sobre o cartão em toda a volta (5,21:1 e 5,37:1) e o bloqueante 2 some junto. Contraria o "preenchida" do catálogo, então é desvio a declarar na nota do `meta.json` e decisão do dono.

Trocar só a cor do tracejado não resolve: `--text-primary` mede 5,97:1 contra o preenchimento no claro e 3,00:1 no escuro, em cima do piso, e sai do `--text-muted` que o catálogo pede. Qualquer que seja a saída, a nota do `meta.json` passa a trazer os números medidos do par, como manda a TOK-9, e a conferência vale também para a miniatura selecionada, que tem outro fundo (bloqueante 2).

### Bloqueante 2. Pergunta 30; ACE-5 e ACE-3

**Evidência.** A miniatura selecionada recebe `bg-surface-sunken` no botão inteiro, radar incluído, e a versão abre com Caio F. selecionado (`highlightId`), de modo que o estado está no preview. A constante `FILL_OPACITY = 0.66` foi calculada contra o cartão, onde dá 3,01:1 no claro. Contra o fundo da seleção:

| Tema | Preenchimento do SDR na selecionada | Fundo `--surface-sunken` | Contraste |
|---|---|---|---|
| escuro | pixel (32, 144, 161) | `#070c16`, pixel (7, 12, 22) | 5,18:1 |
| claro | pixel (87, 154, 167) | `#eaeff7`, pixel (234, 239, 247) | 2,79:1 pelo token, 2,76:1 pelo pixel |

No claro o preenchimento cai abaixo dos 3:1 da ACE-5. Vale para qualquer miniatura clicada, não só para a de abertura. O contorno de 2 px mede 5,20:1 contra o mesmo fundo, então a forma continua legível; o que reprova é o piso que o modelo mesmo adota para o preenchimento. Os textos da miniatura selecionada passam: `--text-muted` mede 4,65:1 no claro e 5,98:1 no escuro contra `--surface-sunken`, e `--text-secondary`, 7,04:1 e 9,36:1.

**O que mudar.** Uma das duas, e a escolha depende da saída do bloqueante 1:

1. Marcar a seleção sem trocar a superfície atrás do radar (fundo só na faixa do título, por exemplo), mantendo o segundo canal que já existe, que é a frase da linha de leitura.
2. Manter o fundo e subir a opacidade do preenchimento desta versão para 0,71 ou mais. Pela conta, 0,71 dá 3,05:1 contra `--surface-sunken` e 3,32:1 contra o cartão no claro. O comentário da constante, que hoje diz "mínimo para o tema claro", muda junto.

Se o bloqueante 1 sair pelo revestimento, a cor dele na miniatura selecionada precisa ser medida de novo: `--surface-raised` contra o preenchimento sobre `--surface-sunken` mede 4,52:1 no escuro e 3,22:1 no claro, e fora do polígono o revestimento aparece como faixa de 1,15:1 contra o fundo da seleção, nos dois temas.

### Na mesma rodada, sem bloquear

* **Legenda de amostras.** O item único `SDR` e `média do time` usa o mesmo vão de 4 px entre tudo. Medido no PNG, a amostra tracejada fica a 5 px de `SDR` e a 9 px de `média do time`, que é o rótulo dela. Separar os dois pares com o vão de 16 px dos outros itens da legenda (ROT-9).
* **Raiz `role="img"` com oito botões dentro.** A ARIA trata os filhos de `img` como apresentação. Sondado no Edge, os botões e o `aria-pressed` chegam à árvore de acessibilidade e o Tab para neles, então não bloqueia. A seção 11 do contrato reserva `img` para gráfico e `group` para cartão e não fala de raiz com controles; a `v4` deste modelo e `18/02` `v4` usam `group`, e é o papel que não depende de o navegador ignorar a regra dos filhos.
* **Resultado do clique fora do leitor de tela.** A frase que diz em quais eixos o SDR selecionado fica abaixo mora na linha de leitura, que é `aria-hidden`, e a frase da raiz não a traz. Para quem ouve, o botão muda de estado e nada mais é dito.

## `v1_perfil-de-oito-sdrs`: aprovada

Sem bloqueante. Oito miniaturas em 4 por 2, com cerca de 71 px de raio, mesma ordem de seis eixos e domínio fixo de 0 a 100 nas oito. A ordem pelo índice médio confere com o dado (85, 77, 74, 69, 66, 58, 41 e 36), e a linha de leitura e a frase acessível citam o maior e o menor. O zero medido de Davi O. em comparecimento leva o vértice ao centro, e o vértice de Renata S. no eixo 1 cai a 0,91 do raio externo, para o valor 91. O número de cada eixo tem a âncora a 11 px do anel; pela conta, a tinta fica a cerca de 6 px do anel e não encostaria em vértice nem com valor 100 (conta, não render). Preenchimento a 0,66 medindo 4,85:1 no escuro e 3,01:1 no claro, no limite do piso. Frase acessível de 206 caracteres, calculada do dado.

## `v3_filas-de-trabalho-da-prevendas`: aprovada

Sem bloqueante. Seis miniaturas em 3 por 2, cinco eixos, ordem pelo volume de entradas escrita na linha de leitura. A ausência e o zero se leem diferente, nos dois temas: na fila de evento o eixo 4 é tracejado do centro ao anel, o traço da série abre entre os eixos 3 e 5, não há ponto nem área, e o título escreve "comparecimento sem dado"; na de reengajamento, o zero medido de agendamento é ponto no centro, com o polígono fechado. O eixo tracejado mede 5,21:1 e 5,37:1 contra o cartão. A inversão da primeira resposta está no nome do eixo e na nota da legenda, e o volume de entradas vai com unidade ao lado do nome. Frase acessível de 210 caracteres.

## `v4_vinte-entidades-alem-do-teto`: aprovada

Sem bloqueante. O teto é a constante `MAX_MINIATURES = 12` no topo do arquivo. Com 20 origens, o aviso em `role="status"` escreve o número do recorte, o teto, as 8 que ficam fora com a soma dos leads delas (2.490, conferida no dado) e a recomendação da tabela com heatmap. A grade mostra as 12 de maior volume, na ordem do dado ordenado pelo componente, em 6 por 2, com miniaturas de 139 px e raio de cerca de 46 px; o título mais longo, "Anúncio em rede social", ocupa 127,5 dos 139 px da célula e fica a 24 px do título vizinho, medido no PNG. A leitura "aviso acima da grade", em vez de "aviso no lugar da grade", está declarada na nota do `meta.json`, e a raiz `group` deixa o aviso ao alcance do leitor de tela. Frase acessível de 162 caracteres.

## Registro no formato do checklist

```
Versão: 18_radar/03_radar-em-pequenos-multiplos/v1_perfil-de-oito-sdrs
Data: 2026-10-13
Resultado: aprovada
Não: nenhum (a 10, a 14 e a 18 ficam anotadas como observação pela seção 14.1: número sem algarismo tabular na nota de escala, valor da dica sem unidade e dica desenhada à mão, sem consequência no preview)
Correções: nenhuma
Não se aplica: 6, 13, 27, 28, 29, 31, 32

Versão: 18_radar/03_radar-em-pequenos-multiplos/v2_media-do-time-em-cada-miniatura
Data: 2026-10-13
Resultado: reprovada
Não: 20, 30, 32
Correções:
  20 e 32. ACE-3 e ACE-6, saída da TOK-4: o tracejado da média mede 1,07:1 no escuro e 1,79:1 no claro contra o preenchimento do SDR; dar revestimento por baixo do tracejado ou tirar o preenchimento, medir o par nos dois temas e escrever o número na nota.
  30. ACE-5: na miniatura selecionada o preenchimento mede 2,79:1 no claro contra surface-sunken; marcar a seleção sem trocar o fundo atrás do radar ou subir a opacidade para 0,71 ou mais.
Não se aplica: 6, 13, 27, 28, 29, 31

Versão: 18_radar/03_radar-em-pequenos-multiplos/v3_filas-de-trabalho-da-prevendas
Data: 2026-10-13
Resultado: aprovada
Não: nenhum (a 10 e a 18 ficam anotadas como observação pela seção 14.1)
Correções: nenhuma
Não se aplica: 6, 13, 27, 28, 29, 31, 32

Versão: 18_radar/03_radar-em-pequenos-multiplos/v4_vinte-entidades-alem-do-teto
Data: 2026-10-13
Resultado: aprovada
Não: nenhum (a 10, a 18 e a 19 ficam anotadas como observação pela seção 14.1: a frase acessível não começa pelo tipo de gráfico)
Correções: nenhuma
Não se aplica: 6, 13, 27, 28, 29, 31, 32
```
