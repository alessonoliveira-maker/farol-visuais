# Revisão de 15_mapa-de-calor-e-calendario/07_matriz-de-transicao, 2026-10-15

Revisor independente. Julgadas as quatro versões: `v1_movimentos-entre-etapas-no-trimestre` com motivo
`revisao_desatualizada` (o `Chart.tsx` mudou depois do veredito de 2026-09-28: `STAY_COLOR` saiu de
`--surface-overlay` para `--surface-sunken`; julguei o arquivo de hoje, não a nota antiga) e `v2`, `v3`
e `v4` com motivo `sem_revisao`. PNGs de 2026-10-02, mais novos que os `Chart.tsx` (2026-09-28 e
2026-09-29).

`npm run check -- 15_mapa-de-calor-e-calendario/07_matriz-de-transicao`, com tipos: 0 com erro, 2
avisos, os dois da v1 e os dois em fila de dívida (TAMANHO-TEXTO; AGREGACAO-ZERO em `Chart.tsx:55`).
A v1 sai `preview_com_escala` na COLISAO-TEXTO, na CONTRASTE-TEXTO e na TEXTO-NA-MARCA, então o
contraste dela foi conferido à mão contra `app/src/styles/tokens.css` (tabela no fim da seção da v1).
A v2, a v3 e a v4 desenham em escala 1 e as três guardas de texto medem as três.

Resultado: as quatro reprovadas. O bloqueante comum é o vazio (perguntas 16 e 8): nenhuma das quatro
tem `role="status"`, e com `data = []` cada uma desenha cabeçalho, legenda e rodapé, e três delas
escrevem um resultado medido onde não houve medição. É o defeito reprovado hoje em `15/04` e em
`15/05`. Além dele, a v1 não entrega o que o catálogo pede e tem texto abaixo do piso, a v2 imprime uma
linha que soma 101, a v3 tem seletor inerte, soma fora de 100 nos modos normalizados e taxa sem volume,
e a v4 diz que Contrato ficou sem movimento enquanto desenha três chegadas. A v1 e a v4 não dizem qual
eixo é a origem. Observações no README do modelo, na seção final.

**O bloco de vazio, igual para as quatro.** Antes do `return`, com a condição `data.length === 0`: raiz
`flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted`, `role="status"`, ícone lucide
`Filter` de 16 px e uma frase de 12 px dizendo que o recorte não tem movimento (na v3, nenhuma perda
revisada) e o que isso significa. É o desenho da irmã `15/01/v1` (`Chart.tsx:73` a `83`).

---

## v1_movimentos-entre-etapas-no-trimestre: reprovada

```
Versão: 15_mapa-de-calor-e-calendario/07_matriz-de-transicao/v1_movimentos-entre-etapas-no-trimestre
Data: 2026-10-15
Resultado: reprovada
Não: 1, 8, 10, 16, e o sentido de eixo da seção 14.1
Correções:
  1. Catálogo: linha Nova no trimestre, contorno na diagonal, dica com formatRateWithVolume, cinco totais e o recorte de datas.
  10. TIP-2 e GEO-18: desenhar em escala 1; hoje 36 trechos chegam a 9,61 px.
  16 e 8. EST-1 e EST-1b: data vazio vira bloco role="status"; o teto da escala vazia é null, nunca 0.
  14.1. Escrever que a linha é de onde saiu e a coluna para onde foi.
Não se aplica: 4, 6, 13, 18, 27, 28, 29, 30, 31, 32
```

### Bloqueante 1. Pergunta 1; catálogo; seção 14.1 (versão que não demonstra o que o catálogo diz)

- **Evidência.** O catálogo (`_estudo/catalogo/15_mapa-de-calor-e-calendario/07_matriz-de-transicao.json`)
  dá à v1 o caso de uso "Das 1.340 oportunidades do trimestre, entre 2026-06-30 e 2026-09-14, quem
  ficou, avançou, regrediu, entrou e saiu?" e cinco itens. O que existe em disco:

| Item do catálogo | Em disco |
|---|---|
| 1. Seis etapas, de nas linhas e para nas colunas | seis etapas sim; "de" e "para" não escritos (bloqueante 4) |
| 2. Linha extra nova no trimestre, colunas ganha e perdida | só Ganha e Perdida; não há linha de entradas |
| 3. Diagonal fora do domínio, com contorno e número | sem contorno; mesmo fundo (`--surface-sunken`) e texto (`--text-muted`) do zero, linhas 157 e 161 |
| 4. Percentual da linha na dica por `formatRateWithVolume` | não há dica nem percentual |
| 5. Cinco totais: permaneceram, avançaram, regrediram, entraram, saíram | dois: "60 contra 540 avanços" |

  O `useCase` do `meta.json` trocou a pergunta do catálogo por "De cada etapa do funil, para onde as
  oportunidades foram, e quantas voltaram?", o recorte de datas não aparece em lugar nenhum (nem na
  frase acessível, DAD-9) e o dado soma 1.323 movimentos, não 1.340. Na tela, a diagonal 143 e o zero
  de Descoberta para Proposta são a mesma célula com outro número: a legenda "diagonal: ficou na
  etapa, fora da escala" não tem amostra e não separa uma coisa da outra.
- **O que mudar.** No `data.ts`, a linha Nova no trimestre (entradas por destino) e o início e o fim
  do recorte. No desenho, a diagonal com contorno próprio e amostra na legenda, e o zero com outro
  tratamento (o contorno vazado da v2 serve). A dica por célula com `formatRateWithVolume` sobre o
  total da linha (padrão svg-puro em `27_rede-e-relacoes/01_matriz-de-adjacencia/v1`, `Chart.tsx:233`).
  Os cinco totais escritos: hoje dariam permaneceram 384, avançaram 540, regrediram 60, saíram 339
  (45 Ganha e 294 Perdida) e entraram o que a linha nova trouxer. O `useCase` volta ao texto do
  catálogo, e o 1.340 tem de fechar com o que a tela escreve, ou o texto passa a dizer movimentos.

### Bloqueante 2. Pergunta 10; TIP-2; armadilha GEO-18 (texto abaixo do piso no próprio preview)

- **Evidência medida no `preview.svg`, igual nos dois temas.** O `<svg>` interno tem `viewBox` de
  562 x 226 e sai em 491,13 x 197,5 px: escala 0,874. Os 36 trechos de 11 px (nomes de linha e de
  coluna) chegam a **9,61 px**, e os números de 12 px a 10,49 px. A causa é a legenda em HTML irmã
  (`Chart.tsx:209`), que tira altura da caixa contra a qual o `<svg>` com `h-full max-w-full` escala.
- **Consequência segunda.** Por `preview_com_escala`, COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA
  não medem a v1, e medem as três irmãs.
- **O que mudar (saída da GEO-18).** O que o item 6 do "Como colar" do README já manda da v2 em
  diante: `viewBox` do tamanho do corpo medido, `className="h-full w-full"`, legenda e rodapé dentro do
  mesmo `<svg>`. O corpo do `card` de 640 x 360 mede 574 x 241,5 px com o caso de uso em uma linha e
  não cabe a matriz com a linha nova mais a legenda; canvas por número com a conta no `notes` (GEO-1),
  como a v4 fez com 640 x 400. Consertado, as chaves TAMANHO-TEXTO e AGREGACAO-ZERO da v1 saem de
  `_render/scripts/lib/divida-guardas.json`, e o `check` deve mostrar as três guardas de texto medindo.

### Bloqueante 3. Perguntas 16 e 8; EST-1 e EST-1b; seção 14.1 (ausência exibida como zero)

- **Evidência no código.** Não há ramo de vazio. Com `data = []`, `max` vale 0 (`Chart.tsx:55`, o
  aviso AGREGACAO-ZERO), e a peça desenha os oito nomes de coluna, a divisória e a legenda inteira:
  a rampa vai de "1" a "0" e o texto diz "retrocesso, 0 contra 0 avanços". Afirma zero movimento onde
  não houve recorte.
- **O que mudar.** O bloco de vazio do topo; `max` passa a `number | null`, e a legenda não existe
  quando ele for null.

### Bloqueante 4. Seção 14.1 (sentido de eixo); catálogo, item 1

- **Evidência.** Linha e coluna têm a mesma lista, e nada na tela diz qual é a origem. É o sentido
  que decide o que o desenho afirma: transpor a leitura faz dos 60 retrocessos contornados 60 avanços,
  e o contorno vermelho só confirma a convenção para quem já a conhece. A v2 (`Chart.tsx:338`) e a v3
  (`Chart.tsx:434`) escrevem o sentido no rodapé; a v3 explica no próprio comentário do topo por quê.
- **O que mudar.** "de" sobre os nomes de linha e "para" sobre os de coluna, ou a frase do rodapé da
  v2 ("Linha: de onde saiu; coluna: para onde foi.").

### Conferido à mão, porque as guardas de texto não mediram a v1

| Par (escuro / claro) | Contraste |
|---|---|
| `--text-primary` sobre `--seq-1`, `--seq-2`, `--seq-3` | 12,69 / 14,82; 9,21 / 12,05; 6,33 / 9,35 |
| `--accent-cyan-contrast` sobre `--seq-6`, `--seq-7` | 7,38 / 5,45; 10,72 / 8,29 |
| `--text-muted` sobre `--surface-sunken` (diagonal e zero) | 5,98 / 4,65 |
| contorno `--negative` sobre `--seq-1` e sobre o cartão | 4,80 / 5,25; 5,50 / 6,36 |

As dez células de retrocesso caem todas no primeiro degrau (a maior é 14 de 182), então o par do
contorno é sempre contra `--seq-1`. Nenhum par reprova.

---

## v2_retrocessos-em-destaque: reprovada

```
Versão: 15_mapa-de-calor-e-calendario/07_matriz-de-transicao/v2_retrocessos-em-destaque
Data: 2026-10-15
Resultado: reprovada
Não: 6, 8, 16
Correções:
  6. NUM-2: percentual da linha pelo maior resto; Qualificação passa a 4, 39, 54 e 3.
  16 e 8. EST-1: data vazio vira bloco role="status"; hoje a tela diz "Nenhum retrocesso medido".
Não se aplica: 4, 13 (não há linha de referência), 18, 28, 29, 30, 31, 32
```

### Bloqueante 1. Pergunta 6, com reflexo na 27; NUM-2; seção 14.1 (proporção que não soma)

- **Evidência.** `Chart.tsx:251` escreve cada célula com `formatPercent(share, 0)`, uma a uma, sem
  repartir o resto. O rodapé declara "Percentual sobre os movimentos da linha", então cada linha é um
  todo. Os dois PNGs imprimem a linha Qualificação somando 101:

| Destino | Movimentos | Exato | Impresso | Pelo maior resto |
|---|---|---|---|---|
| Descoberta | 9 | 3,96% | 4% | 4% |
| Qualificação (diagonal) | 88 | 38,77% | 39% | 39% |
| Diagnóstico | 124 | 54,63% | 55% | 54% |
| Proposta | 6 | 2,64% | 3% | 3% |
| Negociação e Contrato | 0 | 0% | 0% e 0% | 0% e 0% |
| Soma | 227 | 100% | 101% | 100% |

  As outras cinco linhas somam 100 por coincidência do dado.
- **O que mudar.** Percentual inteiro da linha pelo maior resto, numa função pura com retorno
  `number | null` para total zero (EST-1b), com desempate determinístico. Os tetos da legenda saem do
  mesmo inteiro da célula: hoje o degrau de cima diz "até 55%" porque lê 54,63 cru, e depois do
  conserto nenhuma célula imprime 55. A anotação e a frase acessível já trazem o volume por
  `formatRateWithVolume` ("14% (21 de 148)") e não mudam. Critério de aceite no PNG: Qualificação para Diagnóstico em 54% e a legenda de avanço terminando no
  maior inteiro impresso.

### Bloqueante 2. Perguntas 16 e 8; EST-1; seção 14.1 (ausência exibida como zero)

- **Evidência no código.** Não há ramo de vazio. Com `data = []`, `worst` é null e a linha 334 escreve
  "Nenhum retrocesso medido no trimestre"; a frase acessível (linha 143) diz "sem retrocesso medido no
  trimestre". A peça desenha os seis nomes de coluna, o cabeçalho "movimentos", as duas divisórias, os
  títulos das duas legendas sem nenhum degrau, as amostras "ficou na etapa" e "sem movimento" e o
  rodapé com a data. Afirma que o trimestre foi medido e não teve volta.
- **O que mudar.** O bloco de vazio do topo.

### Conferido e certo

- Tercis recalculados do `data.ts`: avanço 3%, 48% e 55% (2,64, 47,83 e 54,63 crus), retrocesso 3%,
  8% e 14% (2,75, 8,26 e 14,19 crus); cada célula cai no degrau que a legenda diz.
- Contraste da rampa composta, refeito em oklab: `--text-primary` sobre `--negative` a 28% mede 9,69
  no escuro e 11,60 no claro, a 55% mede 5,92 e 7,19, e o vazado sobre `--negative` cheio mede 5,50 e
  6,36. Os degraus compostos contra o cartão ficam em 1,50 e 1,55 (28%) e 2,45 e 2,50 (55%), isentos
  pela ACE-3 porque o valor está escrito, com o marcador de volta como segundo canal (ACE-2).
- O contorno da maior célula mede 2,64 e 2,82 contra o próprio `--negative`, mas se lê contra o vão do
  cartão, onde passa de 14:1; nos dois PNGs ele aparece inteiro.
- Duas escalas no mesmo corpo, com matiz, legenda e marcador próprios: é o que o catálogo pede, e não
  eixo duplo sem sinal.

---

## v3_motivo-de-perda-sugerido-contra-revisado: reprovada

```
Versão: 15_mapa-de-calor-e-calendario/07_matriz-de-transicao/v3_motivo-de-perda-sugerido-contra-revisado
Data: 2026-10-15
Resultado: reprovada
Não: 6, 8, 14, 16, 25, e o item 2 do catálogo
Correções:
  Catálogo, item 2: seletor de verdade, com estado, clique, foco e aria-pressed.
  6. NUM-2: percentual inteiro pelo maior resto nos modos por linha e por coluna, e o painel lê o mesmo inteiro.
  14 e 25. NUM-1 e DAD-1: precisão e revocação com o volume, por formatRateWithVolume.
  16 e 8. EST-1: data vazio vira bloco role="status"; hoje a tela escreve "Amostra de 0 perdas".
Não se aplica: 4, 13, 18, 27 (no modo bruto), 28, 29, 30, 31, 32
```

A nota do veredito foi registrada duas vezes no mesmo dia: a primeira omitiu o bloqueante 3 abaixo, e
a segunda, que vale, traz os quatro.

### Bloqueante 1. Catálogo, item 2; seção 14.1 (versão que não demonstra o que o catálogo diz)

- **Evidência.** O catálogo pede "Seletor de normalização: bruto, por linha (revocação), por coluna
  (precisão), total". O `Chart.tsx:190` a `216` desenha quatro `<rect>` e quatro `<text>` dentro de um
  `<svg aria-hidden>`, sem `onClick`, sem foco, sem `aria-pressed`; o modo só muda pela prop `mode`.
  No PNG "bruto" sai em caixa com contorno, com cara de botão ativo, e no Farol os outros três parecem
  clicáveis e não fazem nada. O `notes` justifica com "o preview não grava hover, estado nem
  interação", e isso não impede o seletor: o preview desenha o estado inicial, e a irmã
  `27_rede-e-relacoes/01_matriz-de-adjacencia/v3` faz exatamente isso (`useState` na linha 135,
  `aria-pressed` na 232, `onClick` na 238). Não há regra do contrato colidindo com o pedido, então o
  desvio declarado não se sustenta.
- **O que mudar.** `useState<NormalizationMode>(mode)`, com a prop como padrão, e os quatro modos como
  `<button type="button">` com `aria-pressed`, fora do `<svg aria-hidden>`. Se a fileira de botões
  for HTML, a altura dela sai do `viewBox` para a escala do `<svg>` continuar em 1 (README, "Como
  colar", item 6). Os rótulos podem levar o "(revocação)" e o "(precisão)" do catálogo.

### Bloqueante 2. Pergunta 6; NUM-2; seção 14.1 (proporção que não soma)

- **Evidência, refeita do `data.ts`.** Em `mode="linha"` cada linha é um todo, e em `mode="coluna"`
  cada coluna. `writeCell` (`Chart.tsx:146`) arredonda célula a célula. Linha Sem fit: 410, 28, 34, 40
  e 8 sobre 520 imprimem 79, 5, 7, 8 e 2, **soma 101**. Coluna Sem fit: 410, 46, 38, 57 e 0 sobre 551
  imprimem 74, 8, 7, 10 e 0, **soma 99**. Linha Preço imprime 18, 65, 12, 5 e 1, também 101. O
  preview mostra o modo bruto e não acusa, mas os modos são o que o item 2 do catálogo demonstra.
- **O que mudar.** Maior resto dentro de cada linha (modo por linha), de cada coluna (por coluna) e
  sobre o total, com desempate determinístico: a linha Sem fit tem empate exato entre 34 e 8 (resto de
  0,538 nos dois), e a linha Preço entre 168 e 12 (0,615). Cuidado com o painel: nos modos por linha e
  por coluna a diagonal é a revocação e a precisão, e o maior resto puro leva a diagonal Sem fit do
  modo por coluna a 75%, contra 74,4% (410 de 551) no painel; o mesmo número sairia de dois jeitos
  (DAD-5). Uma saída que fecha: fixar a diagonal no inteiro da taxa que o painel escreve e repartir
  o que falta para 100 pelo maior resto entre as células fora dela (coluna Sem fit: 74, 9, 7, 10 e 0).

### Bloqueante 3. Perguntas 14 e 25; NUM-1; armadilha DAD-1; Precedência da seção 17 (volume junto da taxa)

- **Evidência.** O painel (`Chart.tsx:379` e `390`) escreve precisão e revocação com
  `formatPercent(x, 0)`, sem volume. A revocação tem a base na coluna "revisadas", na mesma linha; a
  precisão não tem a base em lugar nenhum da tela: os totais sugeridos (551, 224, 188, 219 e 18) só
  existem como soma de coluna. O caso que mais pesa é Fora de hora, que escreve "0%" sem dizer que são
  0 acertos em 18 sugestões. É o defeito reprovado em `09/06`, `20/02`, `22/01/v4` e `23/05/v4`.
- **O que mudar.** Taxa com uma casa e o volume, por `formatRateWithVolume` ("74,4% (410 de 551)"). Se
  as duas colunas não couberem em 212 px de painel, uma saída é a linha "sugeridas" abaixo da matriz,
  espelhando a coluna "revisadas", com o painel em uma casa; a conta do canvas se refaz pela GEO-1.

### Bloqueante 4. Perguntas 16 e 8; EST-1; seção 14.1 (ausência exibida como zero)

- **Evidência no código.** Não há ramo de vazio. Com `data = []` a peça desenha o seletor, os cinco
  nomes de coluna, o painel com "indisponível" em dez taxas e no coeficiente, a legenda sem degrau e o
  rodapé "Amostra de 0 perdas revisadas até 14/09/2026"; a frase acessível (linha 167) diz "sem erro
  medido na amostra revisada". Afirma uma amostra medida e sem erro onde não houve amostra.
- **O que mudar.** O bloco de vazio do topo, com a frase dizendo que nenhuma perda foi revisada.

### Conferido e certo

- Do `data.ts`: linhas 520, 260, 190, 230 e 0, colunas 551, 224, 188, 219 e 18, total 1.200.
  Precisão 74, 75, 63, 72 e 0; revocação 79, 65, 62, 69 e ausente; batem com os dois PNGs.
- Coeficiente de Matthews refeito: (854 x 1.200 menos 430.850) sobre a raiz de 1.013.000 x 1.002.594
  dá 593.950 sobre 1.007.784, 0,59, como o PNG.
- Quartis do erro em bruto: 5, 12, 34 e 57; cada célula cai no degrau que a legenda diz.
- Contraste: vazado sobre `--positive` 7,36 e 5,34, vazado sobre `--seq-6` 6,96 e 5,45, texto
  principal sobre `--seq-1` a `--seq-3` 6,33 no pior caso. Real nas linhas e previsto nas colunas,
  escritos no cabeçalho e no rodapé, como o item 1 do catálogo pede.

---

## v4_diagonal-dominante-e-estagio-extinto: reprovada

```
Versão: 15_mapa-de-calor-e-calendario/07_matriz-de-transicao/v4_diagonal-dominante-e-estagio-extinto
Data: 2026-10-15
Resultado: reprovada
Não: 3, 8, 16, 19, e o sentido de eixo da seção 14.1
Correções:
  3 e 19. DAD-10 e catálogo, item 2: Contrato sem movimento de verdade, ou o texto diz só que nada saiu dela.
  14.1. Escrever que a linha é de onde saiu e a coluna para onde foi.
  16 e 8. EST-1: data vazio vira bloco role="status".
Não se aplica: 4, 6, 13, 18, 27, 28, 29, 30, 31, 32
```

### Bloqueante 1. Perguntas 3 e 19; catálogo, item 2; armadilha DAD-10 (o texto afirma o que o dado não tem)

- **Evidência.** A faixa da linha Contrato escreve "sem movimento no período" (`Chart.tsx:215`), e a
  frase acessível diz "A etapa Contrato ficou sem movimento no período" (linha 148). Nos dois PNGs, a
  coluna Contrato desenha 1 vindo de Proposta e 2 vindos de Negócio (`data.ts:49` e `50`, quinta
  posição). O comentário do `data.ts` (linhas 6 e 7) promete que Contrato "não recebeu nem soltou
  ninguém no período", e o catálogo pede "Etapa contrato sem movimentos". Quem ouve a frase recebe
  uma afirmação falsa; quem vê a tela lê a faixa e as três chegadas lado a lado.
- **O que mudar.** O que o catálogo pede: zerar a coluna Contrato no `data.ts` e levar os 3 movimentos
  para outro destino, para a etapa ficar vazia de verdade. A alternativa, manter as chegadas, obriga
  a faixa, a frase e o comentário a dizerem só que nada saiu de Contrato, e aí o item 2 do catálogo
  deixa de ser demonstrado.

### Bloqueante 2. Seção 14.1 (sentido de eixo)

- **Evidência.** O mesmo da v1: linha e coluna com a mesma lista e nada na tela dizendo qual é a
  origem. Aqui pesa também na base pequena, porque o "12" da margem só é base de percentual se a linha
  for a origem, e na coluna Triagem, que só é "histórico" se a coluna for o destino.
- **O que mudar.** "de" e "para" nos cabeçalhos, ou a frase de rodapé da v2. O rodapé de hoje já usa
  as duas linhas que o canvas de 640 x 400 reserva; a conta do canvas se refaz pela GEO-1.

### Bloqueante 3. Perguntas 16 e 8; EST-1

- **Evidência no código.** Não há ramo de vazio. Com `data = []` a peça desenha os seis nomes de
  coluna, o cabeçalho "movimentos", a divisória, a legenda "movimento" sem degrau, as três amostras e
  os dois rodapés, inclusive "17 movimentos caíram fora do dicionário", que vem da prop padrão e não
  do recorte.
- **O que mudar.** O bloco de vazio do topo.

### Conferido e certo

- Tercis do movimento com base: 3, 9 e 62; permanência de 791 em 967 movimentos, 82%, como a frase.
- Os dois desvios contra a especificação da versão seguem o contrato, que vence: diagonal em
  `--surface-sunken` em vez de `--surface-overlay` (TOK-1) e linha de base pequena vazada em vez de
  esmaecida (ACE-5), os dois declarados no `notes`.
- Contraste: `--text-secondary` sobre `--surface-sunken` 9,36 e 7,04; texto principal sobre `--seq-1`
  a `--seq-3` 6,33 no pior caso; `--text-muted` sobre o cartão 5,21 e 5,37.

---

## Ordem sugerida e o que não mexer

Primeiro o que muda estrutura: o vazio nas quatro, a escala 1 e a linha nova da v1, o seletor da v3.
Depois dado e texto: o maior resto da v2 e da v3, o volume das taxas da v3, a coluna Contrato da v4 e
o sentido de eixo da v1 e da v4. Render por último, `--tema ambos`, e os dois PNGs olhados.

Não mexer: a diagonal fora da escala em todas; as duas rampas da v2 compostas por `color-mix` opaco,
com o marcador de volta e a anotação por `formatRateWithVolume`; o acerto em `--positive` chapado e a
hachura da linha sem caso na v3; a hachura em linhas soltas e o recorte atrás do número na v4; o
`viewBox` em escala 1 com legenda e rodapé dentro do `<svg>` na v2, na v3 e na v4.
