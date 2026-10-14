# Parecer de revisão: 11_fluxo-sankey/01_sankey-simples

Data: 2026-10-05. Revisor independente. Julgado o arquivo de hoje, não a nota antiga de 2026-09-19.

`npm run check -- 11_fluxo-sankey/01_sankey-simples`: 0 com erro, 1 aviso (`CONTRASTE-MARCA` na v1,
descrito no fim). Os dois PNGs de cada versão foram abertos, e as medidas abaixo saem do `preview.svg`
e dos pixels do PNG de conferência.

| Versão | Resultado | Bloqueantes |
|---|---|---|
| `v1_origem-para-desfecho-dos-leads` | aprovada | 0 |
| `v2_handoff-sdr-para-executivo-com-foco` | reprovada | 1 |
| `v3_origem-ausente-com-cobertura` | aprovada | 0 |
| `v4_vertical-em-coluna-estreita` | reprovada | 2 |

**ACE-6, que motivou esta rodada, passa nas quatro.** Toda ligação está em token de dado: categóricas
de 5,39:1 a 9,50:1 contra o cartão, e `--text-muted` (5,21:1 no escuro, 5,37:1 no claro) nas faixas
neutras da v2, nas faixas da ausência da v3 e na linha de chamada da v4. Nenhuma ligação ficou em
`--line-strong`. O que reprova a v2 e a v4 é ordem de pintura e colisão, não o token do traço.

## v2_handoff-sdr-para-executivo-com-foco: reprovada

### Bloqueante 1. Pergunta 15 (sobreposição) e pergunta 11, armadilha REC-13 com TOK-9 e COR-5: o foco é pintado por baixo do neutro

- **Evidência.** No `preview.svg` as 35 faixas saem na ordem do array: 12 neutras, as 6 acesas do SDR 3,
  14 neutras, a acesa do balde e mais 2 neutras. São **16 faixas neutras pintadas depois do foco**, todas
  do SDR 4, do SDR 5 e do balde, e elas sobem cruzando as faixas acesas que descem. Nos dois PNGs as
  faixas do SDR 3 para o Executivo C, D, E, F e para "Outros executivos" aparecem picadas em segmentos,
  cada uma cortada por 4 a 6 faixas cinza.
- **Por que não é acabamento.** O contorno `--surface-raised` só existe na faixa acesa, então só separa
  onde a acesa está por cima. Onde a neutra passa por cima não há borda nenhuma, e o par mede, nos
  pixels do PNG, **1,82:1 no escuro e 1,12:1 no claro** (`rgb(11,109,125)` contra `rgb(92,107,135)`).
  É exatamente a fusão que o comentário do topo e o `meta.json` declaram ter resolvido ("no cruzamento
  a faixa acesa se fundiria na massa neutra no tema claro"), e ela continua em todo cruzamento com o
  SDR 4 e o SDR 5. O sintoma está catalogado na REC-13: "a série em destaque fica por baixo das neutras
  no cruzamento".
- **O que mudar.** Pintar o foco por último, que é a saída da REC-13. O `Sankey` do Recharts pinta as
  ligações na ordem do array, então ou se reordena `flow.links` com as do `focusIndex` no fim (conferindo
  no render que a ordem vertical dos nós e das faixas dentro do nó não mudou, porque `sort={false}`
  segue o dado), ou se desenha uma segunda camada só com as faixas acesas por cima. Depois, conferir no
  claro que nenhuma faixa neutra cobre faixa acesa.

### A aproveitar na mesma rodada (não bloqueia)

- A anotação do balde escreve "2 com menos de 3 agendas" sob "Outros executivos, 15 agendas". Lida como
  está, diz que dois executivos tiveram menos de 3 agendas, e eles tiveram 8 e 7: o piso é por ligação
  (por par SDR e executivo), não por executivo. Sugestão dentro dos 50 caracteres da ANO-2: "2 executivos,
  menos de 3 por SDR".
- `foldedTargets` conta só destino recolhido por inteiro. Com um destino que tenha ligações acima e abaixo
  do piso, as pequenas vão ao balde e o destino continua desenhado, e a anotação deixa de descrever o que
  o balde contém. O dado padrão não exercita o caso.

## v4_vertical-em-coluna-estreita: reprovada

### Bloqueante 1. Perguntas 13, 15 e 28, ROT-7 e ROT-11: a linha de chamada de "Cancelada" encosta no rótulo de "Não compareceu"

- **Evidência.** No `preview.svg` a linha de chamada de "Cancelada" é vertical em `x = 355,17`, de
  `y = 258` a `y = 309`, com 1 px de traço (borda direita em 355,67). O rótulo "Não compareceu" está
  centrado em `x = 388,01` na primeira fileira, e a tinta de "compareceu" começa, medida no PNG de
  conferência, na coluna 770 de 960, isto é, em 356,0 no `viewBox`. Sobra **cerca de 0,3 px** entre a
  linha e a letra, por toda a altura da palavra, nos dois temas. A linha de "Cancelada" lê como traço
  do rótulo vizinho, e o leitor não sabe de quem é a chamada.
- **Causa.** `layoutLabels` varre colisão só entre blocos de texto: a linha de chamada do rótulo que
  desce para a segunda fileira não entra como obstáculo da primeira. Além disso `textWidth` estima
  "compareceu" em 57,9 px e a tinta mede cerca de 64 px; o comentário diz que subestimar é o lado
  seguro porque a `COLISAO-TEXTO` acusa, mas a guarda só mede texto contra texto e não vê a linha.
- **O que mudar.** Tratar a linha de chamada como obstáculo, com os 4 px de respiro da 17.7: o bloco da
  primeira fileira que vier depois de um rótulo rebaixado precisa começar a pelo menos 4 px de tinta à
  direita de `nodeCenterX` do rebaixado (ancorar "Não compareceu" pela direita na borda do `viewBox`,
  ou alargar o vão entre os dois últimos nós da base), ou a chamada sai do nó por um caminho que não
  cruze a faixa de rótulos da primeira fileira. Conferir a medida no PNG, não na estimativa.

### Bloqueante 2. Pergunta 15 (sobreposição), armadilha REC-13: as faixas finas somem sob as grossas

- **Evidência.** As faixas são pintadas na ordem (origem, destino). Larguras no `preview.svg`, nessa
  ordem: 57,1; 14,3; 8,6; 8,6; 54,2; 11,4; 5,7; 5,7; 62,8; 5,7; 47,1; 10,0; 11,4; 5,7; 45,7 px. As faixas
  de 5,7 a 14,3 px de Mídia social e Busca paga para Remarcada, Cancelada e Não compareceu são pintadas
  antes das faixas de 45,7 a 62,8 px das origens seguintes para Realizada, que as cobrem em mais da
  metade do percurso. Nos dois PNGs elas reaparecem só como tracinhos soltos nos vãos entre as faixas
  grossas: marca partida, e não dá para seguir nenhuma delas do topo até a base.
- **O que mudar.** A saída da REC-13: maiores primeiro. Manter o `sort` por (origem, destino) para
  calcular os deslocamentos dentro do nó, e ordenar só a lista de desenho por valor decrescente, de modo
  que as faixas finas, com o contorno `--surface-raised` que já têm, passem por cima das grossas.

### A aproveitar na mesma rodada (não bloqueia)

- `meta.json`, `demonstrates`: "texto e dica seguem na horizontal". A versão não tem dica; ficar só
  com "texto".

## Aprovadas

- `v1_origem-para-desfecho-dos-leads`: soma fecha em 1.240 nas duas pontas, ligações em categóricas
  acima de 3:1 nos dois temas, rótulo com unidade em todo nó. Observações no README: nós de desfecho em
  `--line-strong` (1,79:1 e 1,83:1, isentos pela ACE-3 porque a contagem está escrita ao lado, e é o
  aviso do check), ligação em traço grosso sem contorno, e o item "dicionário nome para índice" do
  `meta.json` que o código não tem.
- `v3_origem-ausente-com-cobertura`: soma fecha em 1.210, cobertura de 86% calculada do dado, ausência
  vazada com contorno de 5,21:1 e 5,37:1, por último na coluna e fora do teto de cores. Sem observação.

---

# Segunda passada, 2026-10-05, depois da correção da v2 e da v4

Julgados os arquivos de hoje (`Chart.tsx` da v2 e da v4 gravados às 07:15), não as notas acima. Tudo o
que está acima desta linha descreve o código anterior e fica como histórico. `npm run check`: 0 com
erro, 1 aviso (o mesmo `CONTRASTE-MARCA` da v1). PNGs de 07:16, mais novos que os dois `Chart.tsx`.

| Versão | Resultado | Bloqueantes |
|---|---|---|
| `v2_handoff-sdr-para-executivo-com-foco` | reprovada | 1 |
| `v4_vertical-em-coluna-estreita` | aprovada | 0 |

Os três bloqueantes da primeira passada foram resolvidos no retrato: na v2 as 7 faixas acesas são os
7 últimos `<path>` do `preview.svg` (posições 29 a 35 de 35) e nenhuma neutra as cobre; na v4 as faixas
saem das maiores para as menores e a chamada de "Cancelada" ficou a 11 px de "compareceu".

## v2_handoff-sdr-para-executivo-com-foco: reprovada

### Bloqueante 1. Pergunta 15 (sobreposição) e seção 14.1 (a versão não demonstra o que o catálogo diz), armadilha REC-13: a segunda camada do foco acumula faixas velhas a cada redesenho do Sankey

- **Evidência, medida em página viva e não deduzida.** A versão foi montada pelo mesmo pacote e
  servidor do `npm run render`, tema claro, 640 x 560. Ao montar: 28 faixas neutras e **7 acesas**, SVG
  de 574 x 414. Depois de encolher a altura do pai para 360 px (o que o `ResponsiveContainer` vê em
  qualquer redimensionamento de janela ou de painel no Farol): 28 neutras e **14 acesas**, SVG de
  574 x 332, e o console acusa `Encountered two children with the same key`. As 7 a mais são as faixas
  do tamanho antigo: saem de onde o SDR 3 estava, hoje território do SDR 4, não chegam a nó nenhum e
  duas delas atravessam a borda de baixo do desenho. Na tela o SDR 3 parece entregar o dobro.
- **Causa.** `focusedPaths` é um array criado no corpo do componente e preenchido com `push` dentro de
  `renderLink` (linhas 218 e 294). Quem chama `renderLink` é cada `SankeyLinkElement` do Recharts, e o
  `SankeyImpl` lê largura e altura por hook (`useChartWidth`, `useChartHeight`): quando o contêiner
  muda de tamanho ele redesenha **sem** redesenhar o `SdrHandoffSankey`, então a função é a mesma, o
  array é o mesmo, e os caminhos novos se somam aos velhos. O `preview.svg` não mostra porque o
  retrato é um único desenho; cada redimensionamento seguinte soma mais 7.
- **Por que não é acabamento.** É marca desenhada que não corresponde a dado nenhum, na cor do
  destaque, numa versão cujo assunto é o destaque e cujo README promete o uso no Farol ("para o hover
  no Farol"). Colada como está, a peça afirma algo falso na primeira vez que a janela muda de tamanho.
- **O que mudar.** Tornar o registro idempotente: trocar o array por um `Map<number, string>` e gravar
  com `set(index, path)` em vez de `push`, de modo que o redesenho sobrescreva o caminho da mesma
  ligação; a última ligação desenha `[...map]` na ordem do índice. Não vale limpar o array no índice 0
  sem trocar a estrutura se alguma ligação puder redesenhar sozinha. Conferir do jeito que foi medido:
  montar, mudar a altura do pai e contar os `<path>` de `--chart-1`, que têm de continuar 7, sem aviso
  de chave repetida no console.

### A aproveitar na mesma rodada (não bloqueia)

- ROT-8: a anotação do balde escreve "2 execs., menos de 3 por SDR". "execs." é abreviação inventada
  para caber nos 160 px da margem direita. "2 executivos, até 2 por SDR" tem 27 caracteres, um a menos
  que o texto atual, e diz o mesmo sem abreviar.
- `meta.json`, `notes`: a conta do canvas fala em "70 px de rótulo à esquerda e 150 px à direita" e o
  código usa `MARGIN` de 80 e 170 px (o próprio comentário do `Chart.tsx` conta que 70 e 150 falharam).

## v4_vertical-em-coluna-estreita: aprovada

Sem bloqueante. Somas fecham em 248 nas duas pontas; faixas finas por cima e seguíveis do topo à base
nos dois temas; chamada em `--text-muted` (5,21:1 e 5,37:1). Três observações foram para o README: a
chamada de "Cancelada" passa a 2,0 px da tinta de "29 agendas" (medido no PNG: tinta até a coluna 742,
traço a partir da 747, em 2x), acima do piso de 1,0 px que a ROT-9 reprova e abaixo dos 4 px em que ela
avisa; o toco de chamada de "Realizada" nasce a 96 px do rótulo dele; e a frase do README sobre o
rótulo que se desloca 10 px descreve um ramo que este dado não exercita.
