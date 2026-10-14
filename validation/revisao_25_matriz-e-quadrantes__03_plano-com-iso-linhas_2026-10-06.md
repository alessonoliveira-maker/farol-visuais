# Parecer de revisão: 25_matriz-e-quadrantes/03_plano-com-iso-linhas

Data: 2026-10-06. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 11:56, posterior ao `Chart.tsx` das quatro, das 11:55). `npm run check` com tipos: 0 com erro, 0 avisos, 0 escapes em uso.

Resultado: `v1`, `v2` e `v4` aprovadas; `v3` reprovada por um bloqueante. As observações não bloqueantes estão no README do modelo.

## Peso do bloqueante

* **`v3`, nome mais perto do ponto de outra campanha do que do próprio.** Pergunta 12 (e 18); seção 14.1, identificação das marcas; DIC-1. Não é acabamento: a 14.1 põe a identificação das marcas entre as regras que bloqueiam sempre, e nesta versão os seis nomes são a resposta ao "quais" do caso de uso e o que o catálogo diz que ela demonstra ("rótulo só nos extremos de cada curva").

## O que foi medido e o que não foi

* **Medido:** os dois PNGs de cada versão, com recorte ampliado das zonas de texto; os extremos de cada reta e de cada curva no `preview.svg` contra a fórmula (razão, vitórias, investimento), nas quatro; as contagens das linhas de leitura refeitas do `data.ts`; a tinta de cada nome de ponto, medida no PNG claro, contra a borda de todos os pontos do `preview-claro.svg` (25 nomes nas quatro versões); o contraste da região, da faixa e da zona contra o cartão, amostrado nos PNGs; a diferença entre o PNG do preview e o da página, que fica entre 0,000% e 0,144% nos dois temas (teto de 0,5%).
* **Não medido pela ferramenta:** ESPESSURA-MARCA nas quatro e CONTRASTE-MARCA na `v2`, `v3` e `v4` (`preview_com_transform`). A OPACIDADE-MARCA diz ter medido a `v2`, a `v3` e a `v4`, e não mediu a região, a faixa nem a zona, porque a opacidade vem de constante nomeada. As três foram cobertas à mão.
* **Não renderizado:** a dica e o estado vazio das quatro. O que se diz deles é leitura do código.
* **Não testado:** as saídas sugeridas abaixo. As posições citadas nelas são conta sobre o `preview.svg`, não render.

## `v3_campanhas-em-curvas-de-investimento`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 12 (e 18); seção 14.1 (identificação das marcas), DIC-1; saída pela ROT-7, exceção da marca fina

**Evidência.** Dos seis nomes escritos no plano, dois ficam mais perto do ponto de outra campanha do que do próprio, e um terceiro fica quase empatado. Distância da caixa de tinta do nome (largura medida no PNG claro, 8 px acima da linha de base) até a borda do ponto (raio de 4 px), em coordenadas do SVG interno:

| Nome | Tinta em X | Caixa estimada | Ponto próprio | Até o próprio | Ponto alheio mais perto | Até o alheio |
|---|---|---|---|---|---|---|
| Busca paga, institucional | 607,0 a 740,5 (133,5 px) | 155,0 px | `camp-09`, oco, em (765,5; 240,4) | 21,7 px | `camp-25`, Rede social, enquete, em (587,4; 260,3) | 16,3 px |
| E-mail, boletim mensal | 592,5 a 709,0 (116,5 px) | 136,4 px | `camp-14`, em (735,8; 277,5) | 22,8 px | o mesmo `camp-25` | 10,2 px |
| Busca paga, categorias | 640,5 a 763,5 (123,0 px) | 136,4 px | `camp-18`, em (780,3; 174,2) | 13,9 px | `camp-46`, Busca paga, soluções, em (661,6; 211,7) | 19,0 px |

Em `Busca paga, institucional` o ponto próprio é só o quarto mais próximo: antes dele vêm o `camp-25` (16,3 px), o `camp-14` (18,6 px) e o `camp-08` (21,4 px). No PNG, o nome flutua debaixo da faixa, com um ponto cinza logo à esquerda do `B` e o ponto oco dele 25 px depois do fim da palavra, acima. O mesmo ponto cinza do `camp-25`, de 700 leads e R$ 13 por lead, fica entre os dois nomes e recebe qualquer um deles: está a 10,2 px do `E` de `E-mail` e a 16,3 px do `B` de `Busca`. Os outros três nomes (`Mala direta para associações`, `Feira regional de inverno`, `Feira nacional do setor`) estão a 3,5 a 5,0 px do próprio ponto e não têm o defeito.

**Causa, no código.** Em `placeLabels` (`Chart.tsx`, linhas 166 a 193) os candidatos a oeste reservam uma caixa de `text.length * LABEL_CHAR_WIDTH`, 6,2 px por caractere, que termina a 4 ou 8 px do ponto. O `<text>` da linha 288 é desenhado em `x={box.left}`, ancorado no início. A tinta real mede de 5,3 a 5,6 px por caractere, então o texto termina de 13 a 21 px antes do fim da caixa, e esse vão cresce com o tamanho do nome. Nenhum teste pergunta se outro ponto ficou mais perto.

**Por que bloqueia.** 42 dos 48 pontos não têm nome, então não existe leitura por eliminação. É o que separa este caso do precedente de `25/01`, `v1` (o dono de `Helena B.` é o único ponto sem nome ao lado) e das irmãs `v2` e `v4` daqui, em que todo ponto destacado tem nome. Quem lê `Busca paga, institucional` no ponto cinza conclui que a campanha de mais leads entre as que custaram R$ 20 mil entregou 700 leads fora da faixa, e deixa sem nome o ponto oco de 940 leads, que é metade da resposta que a linha de leitura anuncia ("de 200 a 940 leads").

**O que mudar.**

1. Nos candidatos a oeste, ancorar o texto pelo fim: guardar o lado na `LabelBox` e desenhar com `textAnchor="end"` em `box.left + box.width`. A tinta passa a terminar a 4 px (canto) ou a 8 px (meio) do ponto, qualquer que seja o erro da estimativa de largura. Pela conta, `Busca paga, institucional` iria de 628,0 a 761,5, colada ao ponto oco e a mais de 36 px do `camp-25`; `E-mail, boletim mensal` iria de 611,3 a 727,8, a 4 px do próprio e a cerca de 23 px do `camp-25`; `Busca paga, categorias` terminaria em 776,3.
2. Em `placeLabels`, recusar o candidato em que algum ponto alheio fique mais perto da caixa do que o próprio. Sem candidato que passe, a saída da ROT-7 (exceção da marca fina) é linha de chamada do nome ao ponto, em `--text-muted`.
3. Depois do render, repetir a medida: para os seis nomes, o ponto mais próximo da tinta tem de ser o próprio, nos dois temas.

**Na mesma passada, sem peso de bloqueio** (estão também no README):

* `Mala direta para associações` atravessa a faixa e a curva de R$ 20 mil, e o halo apaga cerca de 12 px da curva junto do topo. A ROT-7 manda halo sobre linha de referência, então não reprova; pôr a curva da faixa entre os obstáculos do `placeLabels` resolve se houver lugar.
* `E-mail, boletim mensal` fica deitado em cima da curva de R$ 5 mil, quase horizontal ali, e o halo apaga a curva em toda a largura do nome (116,5 px). Com a âncora no fim o trecho apagado continua; o canto de cima à esquerda tira o nome de cima da curva.
* Nada no corpo diz que só os dois extremos de cada curva levam nome. Uma palavra na legenda fecha.

A `v2` e a `v4` copiam o mesmo `placeLabels` e a mesma âncora (`Otávio L.` e `Fábio J.`, a 11,4 e a 10,5 px do próprio ponto). Nas duas o ponto próprio é o mais próximo e a leitura fecha por eliminação, por isso estão aprovadas; tocar nelas reabre a revisão delas.

## Registro das quatro versões

```
Versão: 25_matriz-e-quadrantes/03_plano-com-iso-linhas/v1_automacoes-por-impacto-e-esforco
Data: 2026-10-06
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 26, 27, 28, 29, 30, 32

Versão: 25_matriz-e-quadrantes/03_plano-com-iso-linhas/v2_vitorias-por-volume-e-taxa-com-meta
Data: 2026-10-06
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 26, 27, 28, 29, 32

Versão: 25_matriz-e-quadrantes/03_plano-com-iso-linhas/v3_campanhas-em-curvas-de-investimento
Data: 2026-10-06
Resultado: reprovada
Não: 12 (e 18, pela mesma causa)
Correções:
  12. Seção 14.1 (identificação das marcas) e DIC-1: ancorar pelo fim o nome posto a oeste do ponto e recusar posição em que ponto alheio fique mais perto que o próprio.
Não se aplica: 6, 26, 27, 28, 29, 32

Versão: 25_matriz-e-quadrantes/03_plano-com-iso-linhas/v4_escala-log-com-executivos-sem-vitoria
Data: 2026-10-06
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 6, 26, 27, 28, 29, 32
```

Na `v2`, na `v3` e na `v4`, a pergunta 30 foi respondida sim com esta leitura: a região da `v2` (1,22:1 no escuro e 1,16:1 no claro), a faixa da `v3` e a zona da `v4` (1,31:1 e 1,27:1) são fundo de região, não marca, e a fronteira de cada uma é a curva ou a reta opaca em `--text-muted`. Na `v1` não há opacidade. A pergunta 32 não se aplica a nenhuma das quatro porque as iso-linhas são referência com o valor escrito na ponta (ACE-6), como o catálogo as define.
