# Parecer de revisão: 20_cronograma-e-linha-do-tempo/05_swimlane-de-eventos

> Há uma **segunda passada** no fim deste arquivo, também de 2026-10-08, feita depois da correção: `v2` aprovada, `v3` segue reprovada por um bloqueante de posição do rótulo `6 dias`. Para a `v2` e a `v3` vale a segunda passada; o texto da primeira fica como histórico.

Data: 2026-10-08. Revisor independente, primeira passada. `npm run check`: 0 erros, 0 avisos, 0 escapes de guarda. Três guardas não medem esta abordagem nas quatro versões (EIXO-CALMO por `sem_grade`, OPACIDADE-MARCA por `sem_opacidade_em_marca`, RAIO-CONTRA-AREA por `sem_marca_de_area`); as três foram conferidas à mão e não há achado nelas.

Como foi medido: nos PNGs de `_render/.qa/20_cronograma-e-linha-do-tempo/05_swimlane-de-eventos/`, que têm 2 px de imagem por px de CSS, com recorte ampliado das regiões em dúvida; e no `preview.svg` de cada versão, lendo as coordenadas de cada `<text>`, `<rect>` e `<polygon>` no viewBox, que nas quatro tem escala 1 (894 px no canvas `largo`, 574 px no `alto`).

| Versão | Resultado | Não |
|---|---|---|
| `v1_semana-de-agendas-por-sdr` | aprovada | nenhum |
| `v2_ausencias-e-remarcacoes` | reprovada | 18 |
| `v3_handoff-em-raias-de-funcao` | reprovada | 12, 13 e 31 |
| `v4_agenda-em-grade-com-conflito-e-ausencia` | aprovada | nenhum |

Não se aplica, nas quatro: perguntas 3, 4, 6, 27, 28, 29 e 30. A barra aqui é intervalo de tempo e não magnitude, então a pergunta 4 não tem zero a cobrar; nenhuma versão usa opacidade em marca. A pergunta 26 passa: as 4 versões do catálogo estão no disco e o README tem as sete seções da seção 14, na ordem.

As observações não bloqueantes das quatro estão no README do modelo, seção `Observações da revisão (não bloqueantes)`. Este arquivo trata do que reprova e do que foi pesado e não reprovou. Há uma única rodada de correção: os três bloqueantes abaixo são tudo o que a varredura achou.

## v2_ausencias-e-remarcacoes

Resultado: reprovada. Um bloqueante, igual nos dois temas porque mora no texto da dica e não na tinta.

### Bloqueante 1: a dica dos blocos remarcados afirma a data antiga

Pergunta 18, regra DIC-1, e seção 14.1 do contrato (identificação das marcas, que bloqueia sempre).

Evidência, lida no `preview.svg`. Dos 21 blocos desenhados, os 4 que representam a reunião já remarcada saem com o `<title>` da reunião de origem. O bloco está no lugar certo; a dica dele diz outro dia e, em dois casos, outra hora:

| Onde o bloco está desenhado | O que o `<title>` diz hoje |
|---|---|
| SDR 1, qua 11/11, 10:30 às 11:30 | `SDR 1, seg 09/11, 10:30 às 11:30` |
| SDR 3, qua 11/11, 15:00 às 16:00 | `SDR 3, ter 10/11, 10:00 às 11:00` |
| SDR 2, sex 13/11, 11:00 às 11:30 | `SDR 2, qui 12/11, 11:00 às 11:30` |
| SDR 4, sex 13/11, 10:00 às 10:30 | `SDR 4, qui 12/11, 14:00 às 14:30` |

Causa, no `Chart.tsx`, linha 273: o `<title>` é montado com `slot.meeting.day`, `slot.meeting.start` e `slot.meeting.end` para todo `slot`, e o `slot` de tipo `moved` guarda a reunião de origem em `meeting`. Só o nome da raia vem do próprio bloco (`slot.laneIndex`), e por isso a dica mistura a SDR de destino com a data de origem.

Por que reprova e não é nuance: o caso de uso pergunta "para quando cada remarcação foi empurrada". O desenho parado responde o dia e a hora aproximada pela posição; a hora exata, segundo o próprio `meta.json` ("o horário completo de cada bloco vai no title") e o README, mora na dica. Justamente nos quatro blocos que respondem a pergunta, a dica contradiz a posição. É a peça dizendo algo falso sobre a marca que ela mesma desenhou.

O que mudar:

1. Guardar no `Slot` o dia, o início e o fim que `place` recebeu (hoje ele só guarda `x`, `width` e `dayEnd`) e montar o `<title>` com esses três campos, não com os de `slot.meeting`.
2. No bloco `moved`, dizer que é remarcação e de onde veio, por exemplo `SDR 3, qua 11/11, 15:00 às 16:00, remarcada de SDR 2, ter 10/11`. No bloco `no-show` que tem nova data, vale dizer o destino na dica também.
3. Não mexer na geometria: posição, arco, rótulo de destino e contagem estão certos e conferem com o dado (6 ausências, 4 remarcadas, 2 sem nova data; 2, 3, 1 e 0 por raia).

### Pesado e não reprovou

- Pergunta 32, ACE-6: os arcos saem em `--text-secondary` com 1,25 px e se leem nos dois temas; o ponto no fim dá o sentido.
- Pergunta 31: nenhum rótulo leva halo. `para SDR 3` fica 5 px acima do arco que sai da base do mesmo bloco, sem tocar.
- Pergunta 8: `sem nova data` escreve a ausência de destino, e a SDR 4 escreve `0 ausências`, zero medido.
- `LABEL_W = 62` subestima `sem nova data`, que mede 72 px no PNG. No preview sobra espaço (o rótulo da SDR 2 começa 4,5 px depois do separador), então vai como observação; vale alinhar a constante na mesma passada.

## v3_handoff-em-raias-de-funcao

Resultado: reprovada. Dois bloqueantes, iguais nos dois temas porque são de posição e de ordem de pintura. As contas conferem com o dado: esperas de 6, 5 e 3 dias no foco, totais de 5, 14, 2, 9, 6 e 0 dias no painel.

### Bloqueante 1: o rótulo de dias cai sobre marca de outra oportunidade e o halo a apaga

Perguntas 13 e 31, regras ROT-7 (exceção da marca fina) e ROT-9, armadilha GEO-4. É o mesmo defeito que reprovou `20_cronograma-e-linha-do-tempo/01_gantt/v1` nesta data.

Evidência, medida no `preview.svg` (o texto de 11 px com `dominant-baseline="central"` tem tinta de 5,06 px acima a 3,96 px abaixo da âncora, e o halo de 4 px soma 2 px de cada lado):

- `5 dias` (espera do foco entre Pré-vendas e Executivo) está em x 456,4 e y 115: tinta de y 109,9 a 119,0, halo de 107,9 a 121,0, largura de 31 px. A barra de Clínica Horizonte em Pré-vendas ocupa x 381,1 a 499,9 e y 108 a 114. O rótulo fica em cima dela e a caixa do halo (x 454,4 a 489,6) toma a espessura inteira da barra em cerca de 35 dos 118,8 px. No PNG a barra laranja sai partida em duas, com `5 dias` no meio e só restos dela entre as letras, e o número se lê como se fosse dela.
- `6 dias` (espera do foco entre Marketing e Pré-vendas) está em x 268,3 e y 72, com halo de y 64,9 a 78,0 e de x 266 a 301. O tracejado de Atacado Central vai de (262,3; 61) a (301,9; 83) e atravessa essa caixa de x 269,3 a 292,9: o halo apaga mais da metade dele (cerca de 24 dos 39,6 px pela conta, uns 20 px visivelmente ausentes no PNG), e esse traço é a única marca da espera de 2 dias dessa oportunidade. O mesmo halo corta o tracejado do próprio foco.
- `3 dias` não cobre marca, mas fica com a tinta a 2,9 px da base da barra de Clínica Horizonte em Executivo (barra até y 150, tinta a partir de 152,9): leitura apertada, e entra no mesmo conserto.

Causa, no `Chart.tsx`, linhas 269 a 285: o rótulo é posto no ponto médio do tracejado mais 6 px, sem olhar o que há embaixo, e sempre com `HALO`. Com 21 barras e 12 tracejados em 200 px de altura, qualquer foco escolhido pela prop cai sobre alguma marca.

O que mudar:

1. Tirar o halo desses rótulos: sobre barra de 6 px e tracejado de 1 px, quem sai do lugar é o texto, nunca a marca (saída da GEO-4, que precisa ser lida no `ARMADILHAS.md` antes de escrever).
2. Anticolisão em TypeScript: testar posições em volta do ponto médio do tracejado do foco e aceitar a primeira cuja caixa de tinta fique a pelo menos 4 px de todo retângulo de barra e de todo segmento tracejado que não seja o dela. Sem posição livre, levar o número para uma pista reservada (por exemplo a ponta de chegada, antes do começo da barra seguinte do foco) em vez de voltar ao halo.
3. Conferir com `focusId` em pelo menos duas outras oportunidades e com `null`, porque a prop é parte do que a versão demonstra.

### Bloqueante 2: o losango de passagem não aparece inteiro em nenhum lugar, e 3 somem

Pergunta 12, regra ROT-4 (amostra na forma da marca), armadilha DAD-10, e seção 14.1 (identificação das marcas). O catálogo diz que a versão demonstra "passagem como marca de losango na fronteira".

Evidência, medida no `preview.svg`, comparando cada `<polygon>` com os `<rect>` pintados depois dele:

- Há 15 losangos no plano. 12 ficam 50% cobertos pela barra de origem, e o que sobra é um triângulo de 3 px de largura (5 px no foco) na ponta direita da barra.
- 3 ficam 100% cobertos, porque a barra vizinha na mesma sub-faixa começa no mesmo x: Distribuidora Norte, de Executivo para Operações (x 499,9; y 133), sob a barra do foco; Construtora Sul, de Pré-vendas para Executivo (x 321,7; y 97), sob a barra do foco; Atacado Central, de Pré-vendas para Executivo (x 361,3; y 83), sob a barra de Indústria Oeste.
- O único losango inteiro do cartão é a amostra da legenda (`passagem entre funções`), que ensina uma forma que o leitor não encontra no desenho.
- Nas três passagens sem espera (Construtora Sul duas vezes, Indústria Oeste uma), o losango é a única marca da passagem, e ali ele é o triângulo de 3 px.

Causa, no `Chart.tsx`: os losangos são pintados nas linhas 216 a 246 e as barras nas linhas 248 a 266, por cima, com o centro do losango exatamente na borda direita da barra.

O que mudar:

1. Pintar os losangos depois das barras, inteiros, com o contorno `--surface-raised` que já têm, de modo que a barra vizinha não os cubra.
2. Dar ao losango fora do foco meia diagonal de pelo menos 4 px, para ele passar da espessura da barra fina de 6 px e se ver como losango.
3. Conferir de novo a cobertura: nenhum losango com mais de uma fração pequena sob outra marca, e a amostra da legenda igual ao que está no plano.

### Pesado e não reprovou

- Barras fora do foco com 6 px, abaixo do piso de 12 px da ESP-2: é a troca declarada no `meta.json` pela opacidade (ACE-5, TOK-6), e as barras se leem nos dois temas. Observação.
- Seis cores com `--chart-2` e `--chart-4`: a ordem dos slots no dado é 1, 3, 6, 5, 2, 4 e não há variação semântica no corpo (COR-8, COR-4 no teto).
- Pergunta 32, ACE-6: os tracejados saem na cor da oportunidade e medem acima de 3:1 nos dois temas.
- Pergunta 19, ACE-1: a frase começa por "Passagem de 6 oportunidades", o assunto e não o tipo de gráfico. É redação e vai como observação; vale corrigir na mesma passada.

## v1 e v4, o que foi pesado

- `v1`: horas por raia conferem com o dado (6,0; 7,0; 14,0; 1,5; 4,5 h, 42 reuniões). A legenda fica abaixo do desenho e a ROT-4 pede acima ou ao lado: posição sem consequência no preview, observação nas quatro versões.
- `v4`: o bloco de 15 min sai com 10 px, a altura de 22 min. O catálogo pede a altura mínima e a legenda avisa, então não é encoding escondido; a redação do aviso (`10 px`) vai como observação. A nota "3 reuniões ao mesmo tempo, das 10:45 às 11:00" confere com o dado.

## Segunda passada, 2026-10-08

Motivo: `v2` e `v3` em `revisao_desatualizada`, porque o `Chart.tsx` das duas mudou depois do veredito acima. Foi julgado o arquivo de hoje, não a nota antiga. `npm run check`: 0 erros, 0 avisos, 0 escapes de guarda. Os previews e os PNGs são mais novos que os dois `Chart.tsx`. As três guardas que não medem esta abordagem (EIXO-CALMO, OPACIDADE-MARCA, RAIO-CONTRA-AREA) seguem conferidas à mão, sem achado.

| Versão | Resultado | Não |
|---|---|---|
| `v2_ausencias-e-remarcacoes` | aprovada | nenhum |
| `v3_handoff-em-raias-de-funcao` | reprovada | 31 |

Não se aplica, nas duas: perguntas 3, 4, 6, 27, 28, 29 e 30. As observações novas estão no README do modelo, no parágrafo da segunda passada.

### v2_ausencias-e-remarcacoes: aprovada

O bloqueante da primeira passada está resolvido. A conferência foi feita no `preview.svg` dos dois temas, bloco a bloco: para cada um dos 21 `<rect>` com `<title>`, a raia, o dia e o horário foram recalculados a partir de `x`, `y` e `width` e comparados com o começo do texto do `title`. Resultado: 21 de 21 coincidem, nos dois temas. Os 4 blocos remarcados dizem a própria data e, depois, a origem:

| Onde o bloco está desenhado | O que o `<title>` diz hoje |
|---|---|
| SDR 1, qua 11/11, 10:30 às 11:30 | `SDR 1, qua 11/11, 10:30 às 11:30, remarcada de SDR 1, seg 09/11, 10:30 às 11:30` |
| SDR 3, qua 11/11, 15:00 às 16:00 | `SDR 3, qua 11/11, 15:00 às 16:00, remarcada de SDR 2, ter 10/11, 10:00 às 11:00` |
| SDR 2, sex 13/11, 11:00 às 11:30 | `SDR 2, sex 13/11, 11:00 às 11:30, remarcada de SDR 2, qui 12/11, 11:00 às 11:30` |
| SDR 4, sex 13/11, 10:00 às 10:30 | `SDR 4, sex 13/11, 10:00 às 10:30, remarcada de SDR 3, qui 12/11, 14:00 às 14:30` |

Sobre a dúvida do corretor: o texto novo está no preview, quatro vezes em cada tema. A busca dele falhou porque o serializador do render grava a tag como `<title >`, com um espaço antes do fecho, e a busca por `<title>` seguido do texto não casa. O `title` é dica nativa e não aparece em PNG, então a conferência dele é no SVG, não na imagem.

Geometria, contagens e frase acessível seguem iguais à primeira passada e conferem com o dado: 6 ausências, 4 remarcadas, 2 sem nova data; 2, 3, 1 e 0 por raia. Os dois PNGs saem sem corte, sobreposição ou transbordo, e o que foi pesado na primeira passada (arcos, `sem nova data`, `LABEL_W`) continua como estava.

### v3_handoff-em-raias-de-funcao: reprovada

O que a correção resolveu, conferido no `preview.svg` e nos dois PNGs com recorte ampliado:

- O halo saiu dos três rótulos de dias, e nenhuma barra nem tracejado sai partido por halo.
- `5 dias` saiu de cima da barra de Clínica Horizonte: está em x 426,7 e y 96,2, na linha da barra do foco, 20,8 px depois do losango dela, a 5,1 px da barra de cima e a 7,8 px da de baixo.
- Os 15 losangos são pintados depois das barras e aparecem inteiros, inclusive os 3 que sumiam (junções em x 321,7, x 361,3 e x 499,9). A amostra da legenda agora tem par no plano.

Resta um bloqueante, igual nos dois temas porque é de posição.

#### Bloqueante 1: `6 dias` está escrito em cima do tracejado de Atacado Central, colado ao losango dela

Pergunta 31, regra ROT-7 (exceção da marca fina), armadilha GEO-4, e seção 14.1 (identificação das marcas, que bloqueia sempre).

Evidência, medida no `preview.svg` (o `viewBox` de 894 por 246 sai em escala 1) e vista nos dois PNGs:

- `6 dias` é a espera do foco, Transportadora Leste, entre Marketing e Pré-vendas. O rótulo está em x 268,3 e y 64 (âncora central), com tinta de x 268,3 a 300 e de y 58,9 a 68,0.
- A barra de Atacado Central em Marketing ocupa x 183,0 a 262,2 e y 58 a 64, e o losango dela vai de x 259,3 a 265,3. O rótulo começa 3,0 px depois da ponta do losango e 6 px depois do fim da barra, na mesma linha dela.
- O tracejado de Atacado Central sai desse losango, de (262,3; 61) a (301,9; 83), e é a única marca da espera de 2 dias dela. Ele entra na caixa de tinta do rótulo em x 268,3 e sai em x 274,8: passa por baixo do algarismo `6`, e no PNG sobram pontas de traço rosa à esquerda e à direita do `6`.
- O tracejado do próprio foco, de (202,8; 47) a (321,7; 97), passa a 6,1 px da tinta no ponto mais próximo e a 20 px no fim do rótulo. O rótulo toca a marca alheia e não toca a dele.

Por que reprova e não é nuance: nesta peça o número de dias se lê no tracejado em que está escrito, e é isso que a legenda ensina. `6 dias` está escrito sobre o tracejado de Atacado Central entre Marketing e Pré-vendas, e a espera dela ali é de 2 dias. O texto é neutro, sem cor de série, então só a proximidade diz de quem ele é, e a proximidade aponta a oportunidade errada. É o mesmo defeito do `5 dias` da primeira passada, agora sem o halo: número lido como sendo de outra marca.

Causa, no `Chart.tsx`, linhas 292 a 300: a função `hits` só testa as barras (`placed`), com 2 px de margem. Tracejado de outra oportunidade e losango não entram no teste, e a primeira passada pediu o tracejado ("de todo retângulo de barra e de todo segmento tracejado que não seja o dela"). O candidato escolhido é `t = 0.5`, `dx = 6`, `dy = -8`, o primeiro sem barra por baixo.

O que mudar:

1. Pôr no teste de colisão, além das barras, todo segmento tracejado que não seja o do próprio rótulo e todo losango, com 4 px de respiro sobre a caixa de tinta.
2. Entre as posições livres, ficar com a que está na linha da barra do foco, logo depois do losango dela, como o `5 dias` ficou. A lista de candidatos de hoje já tem uma posição que passa nesse teste para `6 dias`: `t = 0.2`, `dx = 6`, `dy = -8`, que dá x 232,6 e y 49,0, a 4 px ou mais de toda barra, de todo losango e de todo tracejado alheio (simulado com a tinta de 32 px).
3. Não voltar ao halo: é a saída da GEO-4, em marca fina quem sai do lugar é o texto.
4. Conferir com outros focos, porque a prop é parte do que a versão demonstra. Simulado com o algoritmo de hoje: com foco em Distribuidora Norte, `2 dias` de Pré-vendas para Executivo cai sobre o tracejado de Construtora Sul; com foco em Construtora Sul, `2 dias` cai sobre o tracejado de Distribuidora Norte, a 12,5 px do dela; com foco em Atacado Central, o rótulo de 1 dia cai sobre o tracejado de Construtora Sul, a 18 px do dela. Com o teste do item 1, os três têm posição livre na lista de candidatos atual.

#### Pesado e não reprovou

- Losango fora do foco com meia diagonal de 3 px, e a primeira passada sugeriu 4 px: com o contorno `--surface-raised` ele se lê como losango nos dois temas, na ponta de cada barra fina. Observação.
- `3 dias` fica com a tinta a 0,8 px do tracejado: o traço é o dele, não fica coberto e o número se lê. Observação.
- `5 dias` cruza a linha de grade de 19/10 sem halo: a grade é `--line-subtle`, referência e não dado, e o número se lê nos dois temas. Observação.
- As constantes da anticolisão estão no corpo do componente e a largura estimada do rótulo é 46 px para uma tinta de 32 px: sem consequência no preview. Observação.
- Contas conferidas de novo com o dado: esperas de 6, 5 e 3 dias no foco; totais de 5, 14, 2, 9, 6 e 0 dias no painel; frase acessível com 14 dias em 3 passagens.

#### Registro

```
Versão: 20_cronograma-e-linha-do-tempo/05_swimlane-de-eventos/v2_ausencias-e-remarcacoes
Data: 2026-10-08
Resultado: aprovada
Não: nenhum
Não se aplica: 3, 4, 6, 27, 28, 29, 30

Versão: 20_cronograma-e-linha-do-tempo/05_swimlane-de-eventos/v3_handoff-em-raias-de-funcao
Data: 2026-10-08
Resultado: reprovada
Não: 31
Correções:
  31. ROT-7 (marca fina), GEO-4: tirar `6 dias` de cima do tracejado e do losango de Atacado Central, pondo tracejado alheio e losango no teste de colisão, com 4 px de respiro.
Não se aplica: 3, 4, 6, 27, 28, 29, 30
```
