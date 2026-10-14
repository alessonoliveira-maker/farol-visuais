# Parecer de revisão: 16_distribuicao/10_curva-de-lorenz

Data: 2026-10-05. Revisor independente. `npm run check -- 16_distribuicao/10_curva-de-lorenz`: 0 com erro, 0 avisos.

Resultado por versão:

| Versão | Resultado |
|---|---|
| `v1_concentracao-da-receita-por-cliente` | aprovada |
| `v2_ano-anterior-contra-atual` | aprovada |
| `v3_investimento-de-midia-por-campanha` | reprovada, 1 bloqueante |
| `v4_estornos-e-clientes-sem-receita` | aprovada |

## v3_investimento-de-midia-por-campanha

Não: 15. Não se aplica: 6, 18, 27, 28, 29, 30, 31.

### Bloqueante 1. Pergunta 15, EIX-4 e EIX-3b, armadilha REC-29: o tique de 75% do eixo X some e leva a linha de grade

Evidência, medida no `preview.svg` (igual nos dois temas):

- O Chart declara `ticks={[0, 0.25, 0.5, 0.75, 1]}` nos dois eixos. O eixo Y imprime os cinco. O eixo X imprime quatro: `0%` em x=44, `25%` em 91,5, `50%` em 139 e `100%` em 223,7. Não existe `75%`.
- A grade vertical tem quatro linhas, em x=44, 91,5, 139 e 234. Falta a de 186,5. A grade horizontal tem as cinco. O plano fica com régua de 25 em 25 no vertical e um vão de 50 a 100 no horizontal.
- Nos dois PNGs o efeito é visível: entre `50%` e `100%` não há rótulo nem linha, e é justamente nesse vão que começa a faixa das 134 campanhas (x=210,9, em 87,8%). O leitor perde a referência de 75% no único trecho do eixo que a pergunta do caso de uso manda ler.
- As irmãs `v1`, `v2` e `v4` imprimem os cinco tiques com o mesmo código; a diferença é o plano de 190 px da `v3`, contra 218 a 280 px nas outras.

Causa: o plano tem 190 px e o `XAxis` não fixa o intervalo. O rótulo `100%` é empurrado 10,3 px para a esquerda, porque a margem direita de 8 px não comporta meia largura dele, e com isso o Recharts descarta o `75%` em silêncio. A `CartesianGrid` herda os tiques do eixo e perde a linha junto.

O que mudar:

1. `interval={0}` no `XAxis`, que é a saída da REC-29. Vale pôr também no `YAxis`, para os dois eixos não dependerem do espaço.
2. Conferir no preview que `75%` e `100%` não colidem. Pela medida de hoje sobram cerca de 14 px entre os dois; se a COLISAO-TEXTO avisar, suba a margem direita até o `100%` voltar para baixo da linha dele (meia largura do rótulo, cerca de 15 px) e some a mesma diferença do lado vertical, para a conta do quadrado continuar fechando igual dos dois lados.
3. Rodar `npm run render -- 16_distribuicao/10_curva-de-lorenz --tema ambos` e confirmar cinco tiques e cinco linhas de grade em cada sentido.

### Para corrigir na mesma passada (não bloqueia)

- `meta.json`, campo `notes`: diz "grade uniforme de 120 passos mais o ponto da marcação" e erro "calculado". O código usa Ramer, Douglas e Peucker, sai com 28 pontos e escreve a tolerância fixa de 0,2 p.p. O README do modelo já descreve certo; alinhar o `notes`.
- Frase acessível: "134 campanhas, 12% do total" lê melhor como "12% das campanhas", porque "total" ali compete com o total do investimento.
- Botão e frase em `text-text-primary` com número sem `tabular-nums` (TIP-1).

### O que foi conferido e está certo

- Conta: 134 de 1.100 é 12,2%, a faixa começa em 87,8% e o ponto cai em 30% no vertical, que é 100% menos 70%. Gini de 0,71 sai do dado cheio.
- Plano quadrado (190 por 190 px), domínio de 0 a 100% nos dois eixos, diagonal de referência em `--line-strong` (ACE-6, referência e não dado).
- Vazio e ausência tratados com `role="status"`; faixa clicável com botão equivalente para teclado.
- Contraste de texto e de marca medidos pelo check nos dois temas, sem achado.

## v1, v2 e v4

Aprovadas, 32 perguntas sem "não". As observações estão no README do modelo, na seção `## Observações da revisão (não bloqueantes)`. A mais relevante para o corretor da `v3`: o `100%` do eixo X sai 10,3 px à esquerda da grade nas quatro versões; nas três aprovadas não derruba tique nenhum, então fica como observação.

---

# Segunda passada, 2026-10-05: v3 depois da correção

Motivo: `revisao_desatualizada`. Julgado o `Chart.tsx` de hoje (08:41), sem apoio na nota anterior. `npm run check -- 16_distribuicao/10_curva-de-lorenz`: 0 com erro, 0 avisos. PNGs e previews em dia com o código.

Resultado: `v3_investimento-de-midia-por-campanha` **reprovada, 1 bloqueante**.

Não: 15. Não se aplica: 6, 18, 27, 28, 29, 30, 31.

## Bloqueante 1. Pergunta 15, ESP-3 (e EIX-6b pelo efeito): o tique `100%` do eixo X sai cortado na borda direita do quadrado

O bloqueante anterior foi resolvido: com `interval={0}` o eixo X imprime os cinco tiques (x=44, 91,5, 139, 186,5 e 234) e a grade tem cinco linhas em cada sentido. A correção trocou um defeito por outro.

Evidência:

- No `preview.svg`, o gráfico é um `<svg>` aninhado de 242 por 242 px com `overflow:hidden`. O tique `100%` está ancorado no centro em x=234, em 11 px. Sobram 8 px até a borda (a margem direita do `MARGIN`), e meia largura do rótulo pede cerca de 14 px. Cerca de 6 px do rótulo ficam fora.
- Nos dois PNGs (escala 2), a tinta do rótulo acaba de uma vez em x=549, com 12 px de tinta na última coluna, e a borda do `<svg>` está em x=550. Glifo que termina sozinho afina antes de acabar; este é guilhotinado. O `%` aparece pela metade e o rótulo lê como `100` seguido de um resto de sinal.
- Igual no tema escuro e no claro.
- Antes da correção o Recharts empurrava o `100%` 10,3 px para dentro para caber. Com `interval={0}` ele deixa de empurrar e o rótulo fica centrado na linha dele, que é o certo, mas a margem não acompanhou.

Por que bloqueia: é corte de texto visível nos dois temas, no rótulo que fecha a escala do eixo. Não é constante de acabamento: a consequência está no preview.

O que mudar:

1. Subir `MARGIN.right` de 8 para 16, que comporta meia largura de `100%` com folga.
2. Refazer a conta do quadrado, que hoje fecha em 52 dos dois lados: com 44 do eixo Y mais 16, a largura perde 60, então a altura também precisa perder 60. Por exemplo `top: 12`, `X_AXIS_HEIGHT` 26 e `bottom: 22`, ou `top: 16` e `bottom: 18`. Atualizar o comentário do topo, que escreve a soma. O plano cai de 190 para 182 px, ainda com cinco tiques.
3. Manter `interval={0}`. Não trocar por `tick` próprio com âncora à direita só no último rótulo (REC-10).
4. Renderizar com `--tema ambos` e conferir no PNG que o `%` de `100%` aparece inteiro e que `75%` e `100%` seguem separados (hoje há cerca de 20 px entre os dois).
5. Atualizar no README do modelo a conta de margens da Anatomia (item 2) e do passo 3 de Como colar, se a `v3` passar a somar 60 e as irmãs seguirem em 52.

## Para corrigir na mesma passada (não bloqueia)

- `meta.json`, `notes`: segue dizendo "grade uniforme de 120 passos" e erro "calculado"; o código simplifica por Ramer, Douglas e Peucker, sai com 28 pontos e tolerância fixa de 0,2 p.p. Já estava apontado e não foi alinhado.
- Frase acessível: "134 campanhas, 12% do total" segue ambígua ao lado de investimento.
- Botão e frase em `text-text-primary` com número sem `tabular-nums` (TIP-1), sem consequência no preview.

## Conferido e certo no arquivo de hoje

- Conta refeita fora do componente: total de R$ 3.552.340, 134 de 1.100 campanhas (12,2%) somam R$ 2.487.910 (70,04%), ponto em 87,8% por 30,0%, Gini 0,7135. Bate com `12%`, `R$ 2,5 mi de R$ 3,6 mi` e `Gini 0,71`.
- Plano de 190 por 190 px, domínio de 0 a 100% nos dois eixos, grade nos dois sentidos (EIX-3b), eixo calmo (EIX-5), eixo X com 26 px (EIX-6b).
- Curva em `--chart-1` sem opacidade, diagonal como referência, faixa em `--surface-sunken` nomeada pelo rótulo do plano e pelo botão (ANO-4).
- Tamanhos 30, 12 e 11 px, nada abaixo de 11; frase acessível com 147 caracteres, começando pelo tipo.
- Vazio e ausência com `role="status"` substituindo o gráfico; `lorenz` e `concentrationCount` devolvem `null` (EST-1b).
- Dado fictício e fixo, com gerador congruente de semente fixa; sem `Math.random` nem relógio.
