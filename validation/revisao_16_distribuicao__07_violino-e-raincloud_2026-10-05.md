# Parecer de revisão: 16_distribuicao/07_violino-e-raincloud

Data: 2026-10-05. Revisor independente. Primeira revisão das quatro versões (`sem_revisao`).

`npm run check -- 16_distribuicao/07_violino-e-raincloud`: 0 com erro, 0 avisos, 0 escapes em uso. Os
dois PNGs de cada versão foram abertos, e as medidas abaixo saem do `preview.svg` de cada versão.

| Versão | Resultado | Bloqueantes |
|---|---|---|
| `v1_ciclo-por-segmento-com-marcadores` | aprovada | 0 |
| `v2_raincloud-antes-e-depois-da-cadencia` | reprovada | 1 |
| `v3_sina-de-cpl-por-plataforma` | aprovada | 0 |
| `v4_bean-plot-com-duplicata-suspeita` | reprovada | 1 |

O que está certo nas quatro e não deve ser mexido na correção: banda de Silverman única e escrita no
rodapé, forma cortada no mínimo e no máximo observados, escala da largura declarada, eixo de valor a
partir do zero com a unidade em todo tique, ordem das faixas declarada, estado vazio com
`role="status"`, agregações devolvendo `null` para lista vazia, quem ficou fora contado no rodapé e
nunca como zero, `viewBox` na largura do corpo (texto de 11 px chega com 11 px), marcador de mediana
com revestimento na cor da superfície, posição sem significado tirada de hash do código.

## v2_raincloud-antes-e-depois-da-cadencia: reprovada

### Bloqueante 1. Perguntas 1 e 15, ilegibilidade por sobreposição; seção 14.1 (identificação das marcas)

- **Evidência.** A legenda diz "chuva: um ponto por lead" e o comentário do topo diz que a chuva
  "mostra quantos casos sustentam a forma". O dado tem precisão de um décimo de dia, que no eixo vale
  8,65 px, e o deslocamento vertical do ponto tem 6 px de curso para um ponto de 4 px de diâmetro.
  Leads com o mesmo valor caem na mesma coluna e se cobrem. Medido no `preview.svg`:
  - trimestre atual, 265 pontos: **157 têm outro ponto do mesmo trimestre com o centro a menos de
    1 px** e 229 a menos de um diâmetro; 28 colunas têm 4 ou mais pontos e somam 152 leads; a maior
    coluna tem **11 leads** em 10 px de altura (Squad Entrada, 1,3 dia);
  - trimestre anterior, 254 pontos: 111 com vizinho a menos de 1 px; maior coluna com 6;
  - contando só pontos separados por ao menos um raio (2 px), a chuva atual do Squad Entrada mostra
    **42 de 96**, a do Contas-chave 49 de 88 e a do Reativação 59 de 81; a anterior mostra 58 de 92,
    51 de 84 e 53 de 78.
- **Consequência na tela.** Nos dois PNGs a chuva do Squad Entrada lê como uma fileira quase uniforme
  de borrões em forma de "8" entre 0,5 e 3 dias. A coluna do pico, com 11 leads, ocupa a mesma tinta
  que uma coluna com 3. A camada que existe para mostrar o volume por trás da nuvem achata justamente
  o pico que a nuvem desenha, e as duas camadas passam a dizer coisas diferentes. É o mesmo defeito
  que reprovou `16_distribuicao/06_densidade-kde/v4` na primeira passada.
- **O que mudar.** A chuva precisa de tinta própria para cada lead. Saídas possíveis, à escolha do
  corretor:
  1. Trocar o hash vertical por um encaixe determinístico dentro da sub-faixa: os leads de um mesmo
     valor recebem posições distintas (em ordem de código), usando a altura da faixa e, se preciso, um
     deslocamento horizontal dentro do próprio décimo de dia (até 4 px para cada lado), declarado no
     rodapé como sem significado, como já se faz com a altura.
  2. Aumentar `LANE_H` até a maior coluna caber empilhada e refazer a conta do canvas pela GEO-1.
  3. Se a medida de origem for carimbo de data e hora, gravar o `data.ts` em centésimo de dia e manter
     um encaixe que desfaça as coincidências que sobrarem. Nesse caso, conferir de novo os números da
     linha de leitura, do README e do `meta.json` (3,2, 1,8, 46 e 35).
- **Critério de aceite.** No `preview.svg`, nenhum par de pontos do mesmo trimestre e do mesmo squad
  com centros a menos de 2 px, e nenhum ponto fora da própria sub-faixa (o que hoje já vale). A regra
  de vazado para anterior e cheio para atual continua.

### A alinhar na mesma rodada (observações, não reprovam sozinhas)

- Rodapé: "nuvem: largura por área" descreve meia forma, em que a densidade é altura e não largura.
  "altura por área" ou "área igual em todas as nuvens" diz o que se vê.
- O contorno fechado da nuvem anterior inclui a linha de base, e o revestimento de 4 px dela come os
  2 px de baixo da nuvem atual em toda a extensão comum. No Squad Reativação o segundo morro da nuvem
  atual (5 a 6 dias) tem poucos pixels de altura e perde boa parte para esse revestimento. Desenhar o
  contorno anterior sem o trecho da base, ou sem revestimento na base, resolve.
- A legenda mostra só o ponto como amostra de anterior e atual; nuvem e caixa seguem a mesma regra
  de vazado e cheio, e a frase "nas três camadas" ajudaria.

## v4_bean-plot-com-duplicata-suspeita: reprovada

### Bloqueante 1. Perguntas 1 e 12, seção 14.1 (identificação das marcas; versão não demonstra o que declara), ACE-5 e GEO-11

- **Evidência.** A legenda ensina a ler a camada de traços assim: "um traço por lead; sobrepostos
  escurecem". O dado é minuto inteiro, que no eixo vale 3,28 px, e todo lead do mesmo minuto cai no
  mesmo pixel. Medido no `preview.svg`:
  - 338 traços de lead desenhados em **121 posições distintas** (Chat do site: 126 em 29; Formulário
    do site: 114 em 38; Telefone: 98 em 45);
  - a pilha chega a **12 traços no mesmo pixel** no Chat, 9 no Formulário e 6 no Telefone;
  - com `TICK_OPACITY = 0.7`, a opacidade composta vale 0,70 com um traço, 0,91 com dois, 0,97 com
    três e 0,99 com quatro. O canal satura no terceiro lead: **48 das 121 posições têm 3 ou mais
    traços** e saem todas com a mesma tinta, tenham 3 leads ou 12.
- **Consequência na tela.** Nos dois PNGs o Chat do site mostra uns 29 traços iguais para 126 leads.
  A legenda promete uma leitura por lead que o desenho não entrega, e a direção que ela dá é falsa no
  tema escuro: ali `--chart-1` composto sobre o cartão fica mais claro quando acumula, não mais
  escuro (GEO-11, armadilha já registrada, com saída conhecida). O `meta.json` reconhece que a
  opacidade "quase não tem faixa para carregar" repetição e resolve isso só para os 37 leads em
  0 minuto; os outros 301 leads repetidos ficaram com a legenda antiga. O README do modelo vende a
  peça como o lugar em que "medição repetida no mesmo valor aparece como traço carregado", e o item
  do catálogo é "opacidade que acumula".
- **O que mudar.** A camada de traços precisa dizer a verdade nos dois temas. Saídas possíveis, à
  escolha do corretor:
  1. Dar à repetição um canal que não satura: o comprimento do traço cresce com a contagem de leads
     no minuto (é o que o bean plot original faz com valor repetido), com teto dentro da faixa e
     traço opaco. A legenda passa a "um traço por minuto com lead; mais comprido onde há mais leads".
     Não usar piso que esconda o valor com um lead só.
  2. Manter o traço uniforme, opaco, e reescrever a legenda para o que ele é: "um traço por minuto
     em que houve lead; a largura do feijão conta os leads". Nesse caso, tirar "opacidade que
     acumula" do `meta.json`, declarar o desvio do catálogo nas notas e ajustar a frase do README.
  Em qualquer das duas, nenhuma frase de legenda com direção de cor ("escurecem"); se sobrar alguma,
  usar "cor mais forte", que vale nos dois temas. O traço cheio dos 37 leads em 0 minuto, a contagem
  escrita ao lado e a regra de `MASS_SHARE` estão certos e ficam como estão.

### A alinhar na mesma rodada (observações, não reprovam sozinhas)

- Os rótulos "37 leads em 0 min: conferir a coleta" e "n 9: amostra curta, só os traços" são
  atravessados pela linha pontilhada da mediana geral (x de 13 minutos). O halo segura a leitura, mas
  um ponto da linha fica colado à letra nos dois temas. Começar o rótulo depois da linha, ou encurtar
  a linha para as faixas, limpa o cruzamento.
- Na cauda, os traços de 10 px passam para fora do contorno do feijão, que ali tem 1 a 3 px de
  altura. O catálogo fala em traço "dentro do feijão". Sem prejuízo de leitura.
- No canal sem curva, o traço de 12 minutos fica a 3,3 px da linha pontilhada da mediana geral e os
  dois leem como par. Coincidência do dado fictício.
- `--negative` no traço da massa é uso de estado (dado sob suspeita), com texto ao lado. Aceito.
- A nota "curva a partir de 30 leads" está no rodapé e o rótulo do canal curto está na faixa: os dois
  dizem a mesma coisa, e o do rodapé pode sair se faltar linha.

## v1_ciclo-por-segmento-com-marcadores: aprovada

Nenhum bloqueante. Conferido: três formas com a mesma área e a mesma banda (4,3 dias), eixo de 0 a
120 dias com cinco linhas de grade, dois picos anotados só no terceiro segmento, marcador com anel
legível sobre a forma e sobre o cartão nos dois temas, frase acessível de 206 caracteres começando
pelo tipo. Observações no README.

## v3_sina-de-cpl-por-plataforma: aprovada

Nenhum bloqueante. Conferido: largura por contagem (a plataforma de 340 campanhas desenha a forma mais
larga), vídeo por cima com raio maior e anel, que dão um segundo canal além da cor, taxa escrita com o
volume (80,9%, 178 de 220), eixo de R$ 0 a R$ 400 com cinco linhas, frase acessível de 217 caracteres.
A sobreposição de pontos aqui é parcial e da própria técnica, e não muda a resposta, que também está
escrita em número. Medidas e observações no README.

## Defeitos de régua e de ferramenta notados

- Nenhuma guarda mede marca sobre marca da mesma série: os 157 pontos coincidentes da v2 e os 12
  traços no mesmo pixel da v4 passaram sem aviso, como já tinha acontecido em `06_densidade-kde/v4`.
- O `check` devolve `ESPESSURA-MARCA` não medida por `marca_html` na v3 e na v4, que são SVG puro
  (`<circle>` e `<line>`). O motivo impresso parece errado.
- A guarda `EIXO-CALMO` devolve `sem_grade` nas quatro, que desenham a grade à mão com `<line>`. Está
  certo não medir, mas o motivo lê como se não houvesse grade.
