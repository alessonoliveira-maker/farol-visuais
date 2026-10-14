# Revisão de 07_rosca-e-radial/04_barra-radial, 2026-10-14

Revisor independente. Motivo: `revisao_desatualizada` nas quatro versões (os `Chart.tsx` mudaram em
2026-09-28, depois dos aceites de 2026-09-18). Julgado o arquivo de hoje, não a nota antiga.

* `npm run check -- 07_rosca-e-radial/04_barra-radial`: 0 com erro, 9 avisos.
* PNGs de conferência de 2026-10-02, mais novos que os `Chart.tsx`; os dois temas abertos e
  recortados em 4x e 8x nos pontos citados.
* **Resultado: as quatro reprovadas.** Uma causa só, a mesma função de rótulo copiada nas quatro.

## A causa comum

As quatro ancoram o valor em `polarPoint(cx, cy, raioMedio, endAngle - angleGap(raioMedio))`, com
`angleGap = LABEL_GAP_PX / raio` convertido em grau, e escolhem
`textAnchor={ponto.x >= cx ? 'start' : 'end'}`. Isso erra de dois jeitos:

1. **O lado do centro não diz para onde o arco continua.** Embaixo à direita (v1, o "14" em −83°) o
   arco segue para a esquerda, e o texto `start` cresce para a direita, de volta sobre a própria
   ponta. Na metade esquerda (v3, totais entre −155° e −180°) o `end` faz o texto crescer para fora,
   por cima da ponta do anel vizinho, que é mais longo. Em cima à direita (v4) o texto horizontal com
   `start` atravessa a raia diagonal e para logo abaixo da ponta do anel de fora.
2. **O vão fixo em pixels vira ângulo grande no anel interno.** Na v2, 14 px no anel de raio médio
   18,1 px são 44,4°: o "5" sai da ponta de Rafael e para colado na de Isabela.

**Como foi medido.** Caixa de tinta do leitor `_render/scripts/lib/colisao.mjs`: dígito tabular de
0,62 em (7,44 px em 12 px) e tinta de 5,52 px acima a 4,32 px abaixo da âncora com
`dominant-baseline="central"`. Geometria dos arcos lida dos `path` do `preview.svg`, com o canto
arredondado da ponta. Distâncias em px do SVG, que são a metade do PNG de conferência.

**Critério de aceite da correção, o mesmo nas quatro versões:**

* nenhum valor com tinta sobre arco alheio ou sobre o próprio, e nunca `--text-primary` sobre
  `--chart-1` (ROT-6);
* halo da ROT-7 em todo valor: em barra radial, qualquer valor pode cair sobre um anel em algum
  recorte plausível, e a regra manda decidir pelo que o dado pode produzir;
* a ponta mais próxima da caixa de tinta de cada valor é a do próprio arco, e nenhuma outra marca
  fica a menos de 4 px da tinta;
* 4 px de respiro entre valores (ROT-9; a guarda avisa abaixo disso);
* conferir pelos quatro cantos da caixa de tinta, não pela âncora (GEO-19).

Caminhos possíveis, a escolha é de quem corrige: `textAnchor` pelo sentido da tangente na ponta (o
texto cresce para longe dela); vão em pixels com teto em grau; anel mais grosso, que o piso geral de
12 px da ESP-2 também pede; ou recuo radial para dentro, onde os anéis internos, mais curtos, já
terminaram. Nenhuma guarda do `check` mede "valor mais perto da ponta alheia": a conferência é à mão.

## v1_agendas-por-sdr-na-semana

### Bloqueante 1. Perguntas 13, 15 e 20; ROT-2, ROT-6, ROT-7 e ACE-3

* **Evidência.** O "14" (Diego F.) está ancorado em (293,6; 173,9) com `start`; a caixa de tinta vai
  de 293,6 a 308,4 por 168,4 a 178,3. O arco de Diego termina em −74,4°, e o canto arredondado da
  ponta, de (300,9; 170,8) a (307,0; 176,4), fica dentro da caixa: **40% da tinta sobre
  `--chart-1`** (a CONTRASTE-TEXTO mede 42%), com `--text-primary` a **1,53:1 no escuro e 2,99:1 no
  claro**. No PNG o "4" está pintado sobre a ponta do próprio arco nos dois temas. É o caso da ROT-2
  em que "o rótulo nasce por cima da própria barra".
* O "19" (Bruno K.) tem o canto de baixo da caixa no anel de Marina T.: 7% da tinta (8% na guarda),
  o mesmo par proibido. Nenhum valor da v1 tem halo.
* O "16" (Camila R.) fica a 2,1 px do anel de Bruno: hoje sem tinta por cima, mas abaixo dos 4 px.
* **O que mudar.** `textAnchor` pelo sentido em que o arco continua (no "14", crescer para a
  esquerda, para longe da ponta), halo da ROT-7 em todos os valores e o critério de aceite acima.

### Na mesma passada, sem peso de bloqueio

* O `demonstrates` do `meta.json` ainda diz "trilho em surface-overlay"; o código usa
  `--surface-sunken`, que é o certo.

## v2_sdr-em-foco-no-ranking

### Bloqueante 1. Pergunta 12; ROT-2 e seção 14.1 (identificação das marcas); sintoma da REC-5

* **Evidência.** O anel de Rafael W. (5) tem raio médio 18,1 px, e o `LABEL_GAP_PX = 14` vira
  44,4°: o "5" sai em −13° de um arco que termina em 31,3°. A caixa do "5" (129,6 a 137,1 por 107,6
  a 117,4) fica a **2,6 px do canto da ponta de Isabela** (139,7; 113,1) e a **8,5 px da ponta de
  Rafael** (127,9; 99,3). No PNG claro o "5" encosta na ponta do segundo anel e se lê como valor
  dele; o "9" de Isabela fica 6,7 px abaixo da própria ponta, ao lado do arco em destaque.
* Mesmo mecanismo, menos grave: o "14" (o destaque) fica a 12,5 px da própria ponta e a 5,1 px da
  ponta de Camila; o "16" a 13,5 px da própria e a 12,6 px da de Bruno, encostado no anel dele.
* **O que mudar.** Vão com teto em grau, ou âncora pela tangente, até o critério de aceite fechar.
  O halo que a v2 já tem fica.

### Na mesma passada, sem peso de bloqueio

* TIP-7: o nome na legenda tem `truncate`, e a legenda é o único lugar que nomeia os arcos. Cabe no
  preview, mas o defeito fica latente.
* O catálogo e o `meta.json` pedem nome e valor do destaque em peso 700; só o valor sai em 700, e o
  nome sai em 600 na legenda e na linha de leitura. A TIP-3 admite os dois em 700.
* A22: os seis valores aparecem na ponta do arco e na coluna da legenda.
* A raiz `role="img"` engole os botões da legenda para o leitor de tela (já no README).

## v3_entradas-da-semana-por-status-de-sla

### Bloqueante 1. Perguntas 12, 13 e 15; ROT-2, ROT-7 (halo que apaga marca), ROT-9; sintoma da REC-5

Os quatro totais caem entre −155° e −180°, numa raia de 8 px, e o `end` da metade esquerda faz
cada um crescer para fora, por cima da ponta do anel vizinho.

* **"41" (Quarta).** Caixa de 220,6 a 235,5 por 98,3 a 108,1. O canto da ponta de Quinta, (224,2;
  104,3), cai **dentro** da caixa: 20% da tinta sobre o pendente de Quinta, o arco de 43, que é o
  maior e fecha em −180°. O halo de 4 px **morde a ponta do maior arco** no PNG claro. A ponta de
  Quarta fica a 3,8 px.
* **"39" (Terça).** Caixa de 236,7 a 251,5 por 102,8 a 112,7. O canto de cima da ponta de Quarta,
  (236,8; 111,7), cai dentro dela; a ponta de Terça fica a 4,2 px.
* **Como se lê no PNG.** Quinta parece terminar em "41", Quarta em "39", e Terça fica sem número
  junto da ponta.
* **Respiro.** COLISAO-TEXTO: "41" a 1,15 px de "39" na mesma linha, "43" a 1,45 px de "41", e
  "Segunda, sem expediente" a 2,07 px de "43", que fica logo abaixo da palavra "sem".
* **O que mudar.** Cada total fora das marcas alheias, mais perto da própria ponta que de qualquer
  outra, e 4 px entre textos. Com quatro pontas em 25° de arco e raia de 8 px, a saída
  provavelmente pede anel mais grosso ou recuo para dentro; o critério de aceite decide.

### Na mesma passada, sem peso de bloqueio

* ROT-4: a legenda fica abaixo do gráfico, e a regra pede acima ou ao lado; a amostra é um ponto e a
  marca é um arco.
* O `cornerRadius` do pendente arredonda as duas pontas dele, e o pendente vira pílula solta; a
  Anatomia promete arredondar só a ponta final.
* A frase acessível conta "5 dias úteis" com a segunda de feriado dentro, e não nomeia os três
  status (a legenda está em `aria-hidden`).

## v4_origem-zerada-e-origem-dominante

### Bloqueante 1. Perguntas 13, 15 e 20; ROT-7, ACE-3 e GEO-19

* **Evidência.** O "44" (Mídia paga) está ancorado com `start` em (344,4; 52,3); o canto de cima à
  direita da caixa, (359,3; 46,8), está a raio 102,9, **dentro do anel de Indicação** (99,1 a
  109,1): 14% da tinta sobre `--chart-1` (13% na guarda), sem halo, a 1,53:1 no escuro e 2,99:1 no
  claro. No PNG escuro, na linha 270 de pixel, o traço vertical do segundo "4" encosta no anel com
  0 px de vão. É o canto da caixa reentrando na borda curva da GEO-19.
* **O que mudar.** Halo da ROT-7 em todos os valores e afastamento conferido pelos quatro cantos.

### Bloqueante 2. Pergunta 12; ROT-2 e seção 14.1 (identificação das marcas); sintoma da REC-5

* **Evidência.** O "33" (Orgânico) fica a **3,7 px da ponta de Mídia paga**, logo abaixo dela, e a
  6,6 px da própria. O "19" (Parceria) fica a **3,2 px da ponta de Orgânico** e a 7,4 px da própria.
  O "12" e o "6" ficam à mesma distância da própria ponta e da ponta de fora (6,9 contra 7,3; 7,4
  contra 6,5). "33" e "44" a 2,59 px um do outro.
* **Por quê.** O texto horizontal com `start` atravessa a raia, que ali é diagonal, e para embaixo
  da ponta do anel de fora. O limite que a versão demonstra são as lascas; os números continuam
  tendo de casar com elas.
* **O que mudar.** Posição que cumpra o critério de aceite.

### Na mesma passada, sem peso de bloqueio

* `ratio.toFixed(1)` fala "7.8" na frase acessível; `formatDecimal` escreve "7,8" (já no README).

## Registro no formato do checklist

```
Versão: 07_rosca-e-radial/04_barra-radial/v1_agendas-por-sdr-na-semana
Data: 2026-10-14
Resultado: reprovada
Não: 13, 15, 20
Correções:
  13. ROT-2 e ROT-7: textAnchor pelo sentido da tangente e halo em todo valor; o "14" sai de cima da ponta.
  15. ESP-3: nenhum valor sobreposto a arco nos dois PNGs.
  20. ROT-6 e ACE-3: nenhum --text-primary sobre --chart-1 (hoje 40% do "14" e 7% do "19").
Não se aplica: 6, 8, 18, 26, 27, 28, 29, 30, 31, 32

Versão: 07_rosca-e-radial/04_barra-radial/v2_sdr-em-foco-no-ranking
Data: 2026-10-14
Resultado: reprovada
Não: 12
Correções:
  12. ROT-2 e 14.1: o "5" mais perto da ponta de Rafael que da de Isabela; o mesmo conferido no "14" e no "16".
Não se aplica: 6, 8, 18, 26, 27, 28, 29, 30, 32

Versão: 07_rosca-e-radial/04_barra-radial/v3_entradas-da-semana-por-status-de-sla
Data: 2026-10-14
Resultado: reprovada
Não: 12, 13, 15
Correções:
  12. ROT-2 e 14.1: o "41" e o "39" saem de cima da ponta do anel de fora e ficam junto da própria.
  13. ROT-7: o halo do "41" deixa de morder a ponta do arco de Quinta.
  15. ROT-9: 4 px entre os totais e entre "43" e "Segunda, sem expediente".
Não se aplica: 18, 26, 27, 28, 29, 30, 31, 32

Versão: 07_rosca-e-radial/04_barra-radial/v4_origem-zerada-e-origem-dominante
Data: 2026-10-14
Resultado: reprovada
Não: 12, 13, 15, 20
Correções:
  12. ROT-2 e 14.1: o "33" e o "19" mais perto da própria ponta que da ponta de fora.
  13. ROT-7: halo em todo valor.
  15. GEO-19: o "44" sai do anel de Indicação, conferido pelos quatro cantos da caixa.
  20. ROT-6 e ACE-3: nenhum --text-primary sobre --chart-1 (hoje 14% do "44").
Não se aplica: 6, 18, 26, 27, 28, 29, 30, 31, 32
```

Observações não bloqueantes do modelo, com data, no README, seção "Observações da revisão".
