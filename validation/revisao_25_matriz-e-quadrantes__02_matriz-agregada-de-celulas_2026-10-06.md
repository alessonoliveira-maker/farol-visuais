# Parecer de revisão: 25_matriz-e-quadrantes/02_matriz-agregada-de-celulas

Data: 2026-10-06. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 11:23, posterior ao `Chart.tsx` das quatro). `npm run check` com tipos: 0 com erro, 0 aviso.

Resultado: `v1` e `v2` aprovadas; `v3` reprovada por um bloqueante; `v4` reprovada por dois. As 19 observações não bloqueantes estão no README do modelo.

## Peso dos bloqueantes

* **`v3`, as setas dos dois eixos apontam para onde a grandeza nomeada diminui.** Pergunta 3; seção 14.1 (sentido de eixo). Não é acabamento: a seta é a "seta de sentido" que o catálogo pede na `v1` e que a Anatomia do README descreve no item 2, e na `v1` e na `v4` ela aponta para onde a grandeza cresce. Na `v3` ela diz que a previsibilidade cresce para a direita e a receita cresce para baixo, e as duas coisas são falsas.
* **`v4`, o número do chip não tem nome nem escala.** Pergunta 14; NUM-6 e seção 14.1 (unidade). O modelo cruza duas notas e o chip imprime uma delas sem dizer qual.
* **`v4`, "estável" é desenhado com a seta que, no mesmo cartão, quer dizer "cresce para a direita".** Pergunta 3; seção 14.1 (identificação das marcas). Metade dos chips à vista afirma um deslocamento que o dado não tem.

## O que foi medido e o que não foi

* **Medido:** os dois PNGs de cada versão; as contagens, somas e participações das quatro, refeitas do `data.ts` (710 leads e 58, 23, 12 e 7 na `v1`; 18, 21, 12, 7 e 6 com 5, 3 e 1 vencidos na `v2`; 180 contas, R$ 14,0 mi e as nove participações somando 100 na `v3`; 57 contas na grade e 3 fora na `v4`); a ordem e o conteúdo dos seis cartões de cada caixa da `v2` e dos seis chips da `v4`, refeitos da fórmula geradora; os pares de contraste de texto, de contorno e de amostra, compostos de `app/src/styles/tokens.css` e conferidos por amostra de pixel nos PNGs.
* **Não medido pela ferramenta:** CONTRASTE-TEXTO, COLISAO-TEXTO e TEXTO-NA-MARCA nas quatro (`texto_em_html`), ESPESSURA-MARCA nas quatro (`sem_marca_de_barra` e `marca_html`) e CONTRASTE-MARCA em `v1`, `v2` e `v4` (`sem_marca`). As quatro foram cobertas à mão, como descrito acima.
* **Não renderizado:** o estado vazio das quatro e os ramos de caixa nula da `v1` e da `v3`. O render só desenha o dado padrão, então o que se diz deles é leitura do código.
* **Não testado:** as saídas sugeridas. As larguras citadas nelas são conta sobre o PNG, não render.

## `v3_carteira-em-abc-e-xyz`: reprovada, um bloqueante

### Bloqueante 1. Pergunta 3; seção 14.1 (sentido de eixo); README, Anatomia, item 2

**Evidência.** `Chart.tsx:132` a `135` escreve o título das colunas como "Previsibilidade mensal" seguido de `ArrowRight`. `Chart.tsx:137` a `140` escreve o título das linhas como "Receita" seguido de `ArrowDown`. Os critérios vêm de `data.ts:23` a `33` e estão impressos no cabeçalho.

| Eixo | Título e seta no PNG | Para onde a seta aponta | O que a grandeza nomeada faz nesse sentido |
|---|---|---|---|
| Colunas | "Previsibilidade mensal", seta para a direita | de X para Z | a variação vai de "até 0,5" a "acima de 1,0", então a previsibilidade **cai** |
| Linhas | "Receita", seta para baixo | de A para C | vai de "até 80% da receita" a "os últimos 5%", então a receita **cai** |

No mesmo modelo, a `v1` escreve "Origem identificada" com seta para cima e "Documento válido" com seta para a direita, e o Sim está em cima e à direita; a `v4` escreve "Potencial" com seta para cima e "Relacionamento" com seta para a direita, e Alto e Forte estão em cima e à direita. Quem aprendeu a seta numa versão lê a `v3` ao contrário.

**Por que bloqueia.** A 14.1 põe o sentido de eixo entre as regras que decidem o que o desenho afirma. O estrago é concreto: a célula destacada, A e Z, existe porque é receita alta com previsão **ruim**, e a seta da coluna diz que Z é a ponta de mais previsibilidade. O critério "acima de 1,0" desfaz o engano só para quem sabe que variação é o inverso de previsibilidade.

**O que mudar.** Uma das saídas por eixo, sem mexer na ordem das células (A e X no canto de cima à esquerda é a convenção do método):

1. Colunas: trocar o título para "Variação mensal" e manter a seta para a direita. É a palavra que o critério da coluna já usa e a grandeza passa a crescer no sentido da seta. Alternativa: manter "Previsibilidade mensal" e trocar o ícone por `ArrowLeft`.
2. Linhas: manter "Receita" e trocar o ícone por `ArrowUp`. Alternativa: tirar a seta e escrever a ordem ("Receita, da maior para a menor").
3. Conferir depois da troca que o título das colunas continua cabendo em uma linha (hoje ocupa cerca de 130 px de uma faixa de 330 px).

**Na mesma passada, sem peso de bloqueio** (estão no README como observação): o subtítulo "Cortes fixos de negócio, não por quantil" cala que o ABC é corte por receita acumulada e que as linhas somam 80%, 15% e 5% por construção; a amostra de Revisar na legenda mede 1,14:1 no escuro e 1,21:1 no claro e pede contorno em `--text-muted`; "Zona pela soma dos índices" não diz os limiares.

## `v4_nine-box-com-celula-vazia-e-lotada`: reprovada, dois bloqueantes

### Bloqueante 1. Pergunta 14; NUM-6 e seção 14.1 (unidade)

**Evidência.** `Chart.tsx:181` fecha cada chip com `formatDecimal(account.potential ?? 0, 1)`. No PNG os seis chips da célula Manter leem "Armazém Aurora 6,8", "Mercado Cedro 6,8", "Locadora Alvorada 6,6", "Escola Serra 6,6", "Oficina Boa Vista 6,4" e "Clínica Litoral 6,4". O rodapé (`Chart.tsx:217`) explica o tracejado e a seta, e não o número. A frase acessível (`Chart.tsx:98` a `101`) não cita nota nenhuma, e o `li` do chip não tem nome acessível que diga o que o número é. A escala, de 0 a 10, só existe no comentário do `data.ts:2` a `5` e no de `Chart.tsx:29`.

**Por que bloqueia.** A 14.1 põe a unidade entre as regras que decidem o que o desenho afirma, e aqui o número não tem como ser adivinhado: o nine-box cruza **duas** notas, potencial e relacionamento, e o chip imprime uma sem dizer qual. O catálogo promete "chips ordenados por potencial", e a ordem só se explica se o leitor souber que o número é o potencial (GEO-12: o valor que ordena está escrito, mas sem nome). Contagem sem substantivo já passou como observação neste acervo quando a unidade estava em outro ponto do cartão; aqui ela não está em ponto nenhum.

**O que mudar.**

1. Dizer no rodapé o que o número é e a escala, por exemplo "Número no chip: nota de potencial, de 0 a 10."
2. Levar o mesmo nome ao leitor de tela, no `li` ou num `span` de texto só para leitor ("potencial 6,8").

### Bloqueante 2. Pergunta 3; seção 14.1 (identificação das marcas); ACE-2

**Evidência.** `Chart.tsx:42` mapeia `{ up: ArrowUp, flat: ArrowRight, down: ArrowDown }`. O mesmo `ArrowRight` está no título do eixo, em `Chart.tsx:121` (`<AxisTitle icon="right">Relacionamento`), onde quer dizer que o relacionamento cresce para a direita, de Fraco a Forte. O rodapé (`Chart.tsx:217`) diz só "Seta no chip: posição prevista em um ano", sem nomear os estados; os nomes "sobe", "estável" e "cai" existem apenas no `aria-label` do ícone (`Chart.tsx:179`).

| Chip no PNG | Seta desenhada | `outlook` no dado | Leitura na grade |
|---|---|---|---|
| Armazém Aurora | para a direita | `flat` | vai para Forte, célula Aprofundar |
| Mercado Cedro | para baixo | `down` | cai |
| Locadora Alvorada | para a direita | `flat` | vai para Forte, célula Aprofundar |
| Escola Serra | para cima | `up` | sobe |
| Oficina Boa Vista | para cima | `up` | sobe |
| Clínica Litoral | para a direita | `flat` | vai para Forte, célula Aprofundar |

Três dos seis chips à vista, e 30 das 60 contas pelo ciclo de `data.ts:19`, são `flat`.

**Por que bloqueia.** O rodapé chama a seta de "posição prevista" e o catálogo a ancora na matriz GE, onde a seta é deslocamento dentro da grade. Com um eixo horizontal rotulado pela mesma seta cerca de 140 px acima do primeiro chip, seta para a direita no chip lê como relacionamento subindo. O desenho afirma um movimento e o dado diz que a conta fica onde está: é forma que sugere o que o dado não tem, e a identificação da marca não desfaz porque os três estados não estão escritos no desenho parado.

**O que mudar.**

1. Trocar o glifo de `flat` por um que não seja direção, como o `Minus` da lucide.
2. Nomear os três estados no rodapé, por exemplo "Seta no chip: posição prevista em um ano (sobe, estável ou cai)."
3. Com as duas frases novas o rodapé passa de uma linha; há cerca de 33 px vazios entre a grade e a faixa, que absorvem a segunda linha no canvas `alto`. Conferir no render.

**Na mesma passada, sem peso de bloqueio** (estão no README como observação): o contorno tracejado dos títulos de eixo em `--line-strong` mede 1,79:1 e 1,83:1 e a legenda aponta para ele pela palavra "Tracejado", então `--text-muted` no contorno dá referente visível; o `aria-label` da célula escreve "1 contas"; a célula mais cheia ganha "+n" mesmo quando n é zero.

## Aprovadas

* **`v1_leads-por-origem-e-documento-em-2x2`.** 412, 163, 88 e 47 somam 710, e as participações 58, 23, 12 e 7 fecham 100 pelo maior resto. As setas apontam para o Sim nos dois eixos. A pior caixa tem ícone e contorno de 2 px, a melhor tem peso 700, então nenhuma depende só de cor. `--chart-1` e `--chart-3` sobre `--surface-sunken` medem 10,90:1 e 7,42:1 no escuro e 5,20:1 e 5,36:1 no claro. Frase acessível calculada, começando por "Matriz de dois por dois".
* **`v2_fila-da-sdr-em-eisenhower`.** 18, 21, 12 e 7 nas caixas e 6 na faixa somam 64; vencidos 5, 3 e 1. A caixa nasce de `boxOf` e os limiares do rodapé são as mesmas constantes (`URGENT_HOURS`, `HIGH_VALUE`). Os seis cartões de cada caixa saem na ordem de vencimento refeita à mão, com "+12", "+15", "+6" e "+1". Vencido tem relógio com nome acessível, peso 600 e a palavra "há". Lead sem valor não entra em Descartar.

## Registro

```
Versão: 25_matriz-e-quadrantes/02_matriz-agregada-de-celulas/v1_leads-por-origem-e-documento-em-2x2
Data: 2026-10-06
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 13, 18, 26, 28, 29, 30, 31, 32

Versão: 25_matriz-e-quadrantes/02_matriz-agregada-de-celulas/v2_fila-da-sdr-em-eisenhower
Data: 2026-10-06
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 6, 13, 18, 26, 27, 28, 29, 30, 31, 32

Versão: 25_matriz-e-quadrantes/02_matriz-agregada-de-celulas/v3_carteira-em-abc-e-xyz
Data: 2026-10-06
Resultado: reprovada
Não: 3
Correções:
  3. Seção 14.1, sentido de eixo: fazer a seta de cada eixo apontar para onde a grandeza nomeada cresce, trocando o título das colunas para "Variação mensal" e a seta das linhas para cima, ou tirando as setas e escrevendo a ordem.
Não se aplica: 4, 13, 18, 26, 28, 29, 30, 31, 32

Versão: 25_matriz-e-quadrantes/02_matriz-agregada-de-celulas/v4_nine-box-com-celula-vazia-e-lotada
Data: 2026-10-06
Resultado: reprovada
Não: 3, 14
Correções:
  14. NUM-6: escrever no rodapé e no nome acessível que o número do chip é a nota de potencial, de 0 a 10.
  3. Seção 14.1, identificação das marcas: trocar a seta para a direita do estado estável por um glifo sem direção e nomear os três estados no rodapé.
Não se aplica: 4, 6, 13, 18, 26, 27, 28, 29, 30, 31, 32
```

Vereditos gravados com `npm run revisao` em `_render/.qa/revisao/25_matriz-e-quadrantes__02_matriz-agregada-de-celulas.json`, quatro chamadas. As observações de TIP-3 na `v2` e de TIP-1 nas quatro ficaram como observação pela 14.1: são acabamento sem consequência no preview.
