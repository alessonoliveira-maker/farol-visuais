# Parecer de revisão: 16_distribuicao/06_densidade-kde

Data: 2026-10-05. Revisor independente. Primeira revisão das quatro versões (`sem_revisao`).

`npm run check -- 16_distribuicao/06_densidade-kde`: 0 com erro, 0 avisos, 1 escape em uso
(`OPACIDADE-MARCA` na v4, aceito). Os dois PNGs de cada versão foram abertos, e as medidas abaixo saem
do `preview.svg` e do `preview-claro.svg`.

| Versão | Resultado | Bloqueantes |
|---|---|---|
| `v1_ticket-de-fechamento` | aprovada | 0 |
| `v2_cpl-de-dois-canais-sobrepostos` | reprovada | 1 |
| `v3_ciclo-por-executivo-em-faixas-de-cor` | reprovada | 1 |
| `v4_amostra-curta-cai-para-pontos` | reprovada | 1 |

O que está certo nas quatro e não deve ser mexido na correção: área a partir do zero, curva recortada
no observado, banda comum escrita no rodapé, eixo Y omitido com a nota, estado vazio com
`role="status"`, dado de semente fixa, contorno opaco de 2 px carregando a marca sobre preenchimento leve.

## v2_cpl-de-dois-canais-sobrepostos: reprovada

### Bloqueante 1. Perguntas 12 e 13, ANO-2, seção 14.1 (identificação das marcas)

- **Evidência.** A faixa hachurada é a única marca que responde à primeira metade do caso de uso ("em
  que faixa os canais custam igual"), e o rótulo dela é só `R$ 180 a R$ 230`: valor sem nome. A linha de
  leitura fala dos 10% mais caros, a legenda nomeia Busca e Social, o rodapé fala da banda. Nada dentro
  do Chart diz o que a hachura marca; quem diz é o subtítulo do `VisualCard`, que no Farol é da página, e
  a frase acessível, que ninguém vê. Sozinha, a faixa lê como meta ou faixa aceitável.
- **Agravante.** O critério é um limiar da peça (`CROSSING_RATIO = 0.6`, com piso de 15% do menor pico e
  arredondamento para fora em R$ 10) e não aparece no cartão. As curvas se cruzam perto de R$ 222; na
  borda de R$ 180 a busca mede cerca de 1,7 vez a altura do social (208 px contra 121 px no PNG). O
  desenho afirma "custam igual" numa faixa em que isso só vale sob um critério que o leitor não conhece.
- **O que mudar.** Nomear a faixa no próprio rótulo, em até 50 caracteres, por exemplo "custo parecido:
  R$ 180 a R$ 230", e declarar o critério no rodapé, calculado da constante: "hachura: onde a curva menor
  chega a 60% da maior". Conferir que o rótulo mais largo continua dentro da margem superior e não toca
  o pico da busca.

### A alinhar na mesma rodada (observações)

- COR-3: `SERIES_COLORS[index]` segue a posição no array. Com o dado padrão está certo; no Farol, um
  filtro que tire a busca pinta o social de `--chart-1`. Levar `slot` no dado ou mapa por `id`.
- TIP-1: a linha de leitura (`<p>`) e os tiques do `XAxis` não levam classe de algarismo tabular; o
  rótulo da hachura também não. Sem consequência visível.
- A curva da busca corre colada à linha de base de R$ 300 a R$ 400, onde não há campanha de busca: a
  grade é a da amostra reunida, como o catálogo pede, mas o README diz "recortada no observado".
- `tails[index] ?? 0` escreveria R$ 0 se o quantil viesse nulo; hoje a guarda de vazio impede.
- Fidelidade do preview: 0,77% no escuro e 0,83% no claro, acima de 0,5%. A diferença está toda no
  texto depois de "CPL" (kerning do par P e L), defeito da ferramenta já anunciado pelo render.

## v3_ciclo-por-executivo-em-faixas-de-cor: reprovada

### Bloqueante 1. Pergunta 20, ACE-3, TOK-8 (contraste de marca abaixo do piso no tema claro)

- **Evidência.** `LEVEL_COLORS = CHART_SEQUENTIAL_COLORS.slice(3)` usa `--seq-4` a `--seq-7`. Medido no
  `preview-claro.svg` contra o cartão branco: `rgb(99,170,196)` **2,60:1**, depois 3,72, 5,45 e 8,29. No
  escuro o mesmo degrau mede 3,38:1. São 132 células no degrau reprovado, o da densidade de 5% a 30% do
  pico, que é o que desenha a extensão de cada tira e as duas ilhas isoladas de cauda (Maria Eduarda F.
  perto de 175 dias e Bianca T. perto de 185 dias). Não há número na célula, então a isenção da ACE-3 não
  vale. As notas do `meta.json` citam só os três degraus de baixo e só as medidas do tema escuro.
- **O que mudar.** Ficar nos três degraus que passam nos dois temas, `--seq-5`, `--seq-6` e `--seq-7`
  (`slice(4)`), com três limiares em `LEVEL_EDGES`, e a legenda com três amostras. Corrigir a nota do
  `meta.json` e o item 7 da Anatomia do README (que ainda diz "de `--seq-4` a `--seq-7`" e "traço claro
  na mediana"). Conferir nos dois temas que as ilhas de cauda continuam visíveis.

### A alinhar na mesma rodada (observações)

- TOK-8: mesmo com três degraus, vizinhos da rampa medem de 1,42 a 1,52:1 entre si. A cor entrega onde
  fica o pico e até onde a tira vai, não níveis finos; a legenda "menos denso, mais denso" já é honesta.
- GEO-12: as tiras vão por mediana crescente e as de amostra pequena fecham a lista. A mediana está
  desenhada em cada tira e a linha de leitura dá os extremos, então a ordem se deixa ler, mas nenhuma
  frase a declara. Uma frase no rodapé resolve: "ordem: mediana crescente; amostra pequena no fim".
- EIX-3 e ESP-5: cada tira tem uma linha horizontal de `--line-subtle` por baixo, que lê como divisória;
  a leitura corre no eixo X. Sem consequência visível.
- TIP-1: a linha de leitura (`<p>`) não leva classe de algarismo tabular.
- O corte da mediana tem 2 px e a célula tem 3,27 px: numa tira com buraco de uma célula no meio, corte
  e buraco se confundiriam. Não acontece com o dado padrão.

## v4_amostra-curta-cai-para-pontos: reprovada

### Bloqueante 1. Perguntas 1 e 15, ilegibilidade por sobreposição; versão não demonstra o que declara

- **Evidência.** A peça existe para dizer "com pouca amostra, veja os pontos individuais", e o rodapé
  escreve "n 22 e n 9: pontos individuais, sem curva". Medido no `preview.svg`, com raio de 3 px e todos
  os pontos na mesma altura: na linha Varejo (n 22) dois pontos têm o mesmo `cx` (149,9, distância 0), e
  outros 5 pares ficam a menos de 1 px (0,28; 0,57; 0,57; 0,85; 0,85); 16 dos 21 vãos são menores que o
  diâmetro. Na linha Serviços (n 9) um par fica a 0,85 px. No PNG contam-se uns 15 pontos de 22 e 8 de
  9, e um negócio do Varejo não tem tinta própria nenhuma. A irmã `03_strip-plot-e-beeswarm/v3` só foi
  aceita com "nenhum par de pontos sobreposto" medido.
- **O que mudar.** Empilhar o ponto que colide em vez de desenhá-lo por cima: ordenar por valor e, quando
  o centro cair a menos de um diâmetro mais 1 px do anterior no mesmo nível, subir um nível (passo de
  7 px em torno do meio da linha). `POINT_H` de 24 comporta três níveis; se o grupo de 22 pedir mais,
  aumentar `POINT_H` e refazer a conta de altura do `viewBox`. A posição em X não muda. Depois medir de
  novo no `preview.svg` que nenhum par de centros fica a menos de 6 px.

### A alinhar na mesma rodada (observações)

- `data.filter((item) => item.values.length > 0)` tira do desenho, em silêncio, o segmento sem negócio, e
  a linha de leitura passa a contar só os que sobraram. A v3 escreve "sem negócio ganho no recorte" na
  própria linha; vale o mesmo aqui.
- Régua: o maior ticket fica perto de R$ 108 mil e o eixo vai a R$ 150 mil, com quatro tiques; um terço
  da largura fica vazio e a curva da Indústria sai com uns 8 px de altura. Passo de R$ 25 mil ou de
  R$ 20 mil aproveita melhor a largura.
- ACE-1: a frase acessível começa por "Densidade do ticket", sem o tipo; a v1 começa por "Gráfico de
  densidade".
- Se todos os valores dos grupos grandes forem iguais, a banda sai nula e a linha de curva fica em
  branco, só com nome e n.
- TIP-1: a linha de leitura (`<p>`) não leva classe de algarismo tabular.

## v1_ticket-de-fechamento: aprovada

Sem bloqueante. Observações registradas no README do modelo.

## Defeitos de régua e de ferramenta notados

- `CONTRASTE-MARCA` mediu a v3 e não acusou `--seq-4` a 2,60:1 no tema claro, em 132 células.
- `OPACIDADE-MARCA` trata o mesmo desenho de três jeitos: acusa o `fillOpacity` de 0,18 na v4 (saiu por
  escape), mede e aceita o de 0,18 na v1, e diz `sem_opacidade_em_marca` para o de 0,25 na v2.
- Nenhuma guarda mede marca sobre marca: a coincidência de pontos da v4 passou sem aviso.
