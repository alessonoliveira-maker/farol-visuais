# Violino e raincloud

## O que é

A densidade de cada grupo espelhada em torno de um eixo central, larga onde há muitos casos e fina
onde há poucos. Lê-se pela silhueta: uma barriga é um ritmo, duas barrigas são dois grupos misturados
no mesmo nome, uma cintura é um buraco. Ganha do box plot exatamente onde ele mente, em distribuição
com dois picos, aglomerado ou buraco, e perde onde a amostra é curta, porque a curva suave inventa
forma a partir de poucos casos.

As quatro versões são o mesmo cálculo com camadas diferentes por cima: marcadores de resumo dentro da
forma (`v1`), meia forma com caixa e pontos embaixo (`v2`, o raincloud), pontos espalhados só até onde
a forma deixa (`v3`, o sina plot) e um traço por minuto com lead dentro da forma (`v4`, o bean plot). Todas
são SVG puro, com a densidade por núcleo gaussiano calculada no componente.

## Quando usar

- Forma completa por grupo com amostra grande, a partir de umas 100 observações por grupo.
- Comparar de 2 a 8 grupos em que dois picos ou um aglomerado são o achado.
- Forma, resumo e pontos no mesmo espaço, em raincloud, com dezenas a poucas centenas de casos por
  grupo.
- Diagnosticar medição repetida no mesmo valor, que no bean plot aparece como traço carregado.

## Quando evitar

- Menos de 30 observações por grupo: strip ou beeswarm (modelo 03), sem curva suave. A `v4` mostra o
  que fazer quando só um dos grupos é curto.
- Público que não lê densidade e precisa de número: box plot com pontos (modelo 02).
- Milhares de casos com pontos por cima: a chuva vira mancha. Violino puro, ou ridgeline (modelo 08).
- Massa concentrada num valor só, como zeros: a suavização espalha o pico. Separe o valor num traço
  próprio, como faz a `v4`, ou numa barra à parte.
- Incerteza de cenário simulado, e não casos observados: meia-olho (modelo 12).

## Anatomia

1. **Coluna de nomes** à esquerda, em `--text-secondary`, com o `n` e a mediana do grupo na linha de
   baixo, em `--text-muted`. A mediana sai de `formatDays`, de `formatCurrency` ou de `formatInt` com a
   unidade, conforme a medida.
2. **Eixo de valor** horizontal com grade vertical em `--line-subtle`, a direção da leitura, e a
   unidade em todo tique.
3. **Forma**: caminho fechado com 81 pontos entre o menor e o maior valor observados. Preenchida em
   `--chart-1` na `v1` e na nuvem atual da `v2`; só contorno na nuvem anterior da `v2`, na `v3` e na
   `v4`.
4. **Banda de suavização única** para todos os grupos da peça, a mediana das bandas de Silverman de
   cada um, escrita no rodapé com o valor.
5. **Escala da largura declarada no rodapé**: por área na `v1`, na `v2` e na `v4`, contra a maior
   densidade do conjunto; por contagem na `v3`, contra o valor com mais casos do conjunto.
6. **Marcadores de resumo**: barra do intervalo interquartil e ponto de mediana na `v1`, caixa fina na
   `v2`, traço de mediana na `v3` e na `v4`. Sempre em `--text-primary` com revestimento em
   `--surface-raised`, porque nenhum token contrasta com a forma e com o cartão ao mesmo tempo.
7. **Camada de observações**: chuva na `v2`, pontos na `v3`, traços na `v4`. Na `v2` a posição
   vertical é um encaixe determinístico (dias, depois código do lead) com 2,2 px entre centros, e a
   sub-faixa cresce com o maior empilhamento; na `v3` sai de um hash do código do registro; na `v4`
   cada minuto com lead tem um traço cheio, e leads no mesmo minuto dividem o traço. Nunca aleatório.
8. **Linha de leitura** no topo, calculada do dado, e **rodapé** com unidade, `n`, ordem das faixas,
   escala da largura, banda e o que ficou fora da amostra.

## Versões

- `v1_ciclo-por-segmento-com-marcadores`: três segmentos de cliente, 450 negócios ganhos, dias de
  ciclo. Dois segmentos têm um pico só; o terceiro tem dois, perto de 42 e de 101 dias, e a anotação
  aparece só nele. Barra do intervalo interquartil e ponto de mediana dentro da forma, com a espessura
  limitada a 0,6 vez a largura do violino na mediana.
- `v2_raincloud-antes-e-depois-da-cadencia`: três squads de pré-vendas em dois trimestres, 519 leads,
  dias até a primeira agenda. Vazado é o trimestre anterior e cheio é o atual, nas três camadas. A
  mediana geral cai de 3,2 para 1,8 dia, e a nuvem mostra o que a mediana esconde: 46 leads do
  trimestre atual continuam acima de 3,2 dias, 35 deles num squad só.
- `v3_sina-de-cpl-por-plataforma`: quatro plataformas de mídia com nome genérico, 1.100 campanhas,
  custo por lead. Largura por contagem, pontos presos dentro da forma, e as 220 campanhas com criativo
  em vídeo em `--chart-2` por cima das demais em neutro: 80,9% delas passam da mediana da própria
  plataforma.
- `v4_bean-plot-com-duplicata-suspeita`: quatro canais de entrada, 384 leads, minutos até o primeiro
  contato, com um traço cheio por minuto com lead. Um canal tem 37 leads com exatamente 0 minuto, que saem da curva e viram um traço cheio com
  a contagem escrita; outro tem 9 leads e fica só com os traços, mais altos e mais grossos que os de
  dentro do feijão, porque ali são a única marca do grupo. Mediana do canal e mediana geral no lugar
  das médias do bean plot original.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para `app/src/pages/<pagina>/visuals/<NomeDoComponente>/`.
2. O `data` é uma observação por registro, nunca a curva pronta. A banda muda a forma, e quem recebe a
   curva calculada não sabe mais qual banda a produziu. As funções `silverman` e `densityAt` vivem no
   componente, e o rodapé imprime a banda usada.
3. O `<svg>` é desenhado com `viewBox` na largura do corpo de um cartão de 640 px (574) ou de 960 px
   (894), e a altura sai da proporção. Em coluna mais estreita o desenho encolhe junto com o texto: se
   a página for usar o cartão abaixo dessas larguras, recalcule `VIEW_W` para a largura real em vez de
   deixar a escala cair.
4. Os contadores de quem ficou fora (`withoutOpenDate`, `withoutMeeting`, `withoutLeads`,
   `withoutContact`) entram por prop. Não os transforme em zero: registro sem a medida não tem lugar
   no eixo.
5. Na `v2` o código do registro desempata o encaixe; na `v3` é a semente da posição sem significado. Trocar o código por
   índice de array faz os pontos mudarem de lugar a cada filtro.
6. Na `v3` o cálculo custa o quadrado do `n` por grupo e está em `useMemo` sobre `data`: passe uma
   referência estável, e não um array recriado a cada render.
7. Na `v4`, `MASS_SHARE` e `MASS_MIN_COUNT` decidem o que é massa. Em medida com precisão grossa, em
   que valor repetido é esperado, suba os dois antes de ler um traço cheio como defeito de coleta.
8. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`, e
   troque o estado vazio inline por `EmptyState`, mantendo o texto.
9. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Referências

- Hintze e Nelson, "Violin Plots: A Box Plot-Density Trace Synergism", The American Statistician,
  1998: a forma original, com a caixa dentro da densidade.
- Allen e colegas, "Raincloud plots: a multi-platform tool for robust data visualization", Wellcome
  Open Research, 2019: as três camadas e por que nenhuma basta sozinha.
- Sidiropoulos e colegas, "SinaPlot: an enhanced chart for simple and truthful representation of
  single observations over multiple classes", 2018: o ponto limitado pela densidade.
- Kampstra, "Beanplot: A Boxplot Alternative for Visual Comparison of Distributions", Journal of
  Statistical Software, 2008: o traço por observação e as linhas de média, trocadas aqui por mediana.
- Silverman, "Density Estimation for Statistics and Data Analysis", 1986: a regra da banda.
- No catálogo: `16_distribuicao/02_box-plot` para o resumo em cinco números e
  `16_distribuicao/03_strip-plot-e-beeswarm` para os pontos sem curva. No Farol não há componente de
  densidade; a referência de moldura é o `VisualCard`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05. A `v1` e a `v3` foram aprovadas; a `v2` e a `v4` voltam por um bloqueante cada,
descritos em `validation/revisao_16_distribuicao__07_violino-e-raincloud_2026-10-05.md`. O que segue não reprova.

- `v1`: no segmento de dois picos a barra do intervalo interquartil atravessa a cintura da forma, onde o violino é mais fino que a barra. O limite de 0,6 vez vale só no ponto da mediana. Lê bem por causa do anel.
- `v1`: o tique "120 dias" termina a uns 4 px da borda direita do desenho. Sem corte nos dois temas.
- `v2`: o rodapé diz "largura por área" para meia forma, em que a densidade é altura.
- `v2`: o revestimento de 4 px na linha de base do contorno anterior come os 2 px de baixo da nuvem atual; no Squad Reativação o segundo morro, de 5 a 6 dias, perde boa parte da altura.
- `v2`: a legenda mostra só o ponto como amostra de anterior e atual, embora a regra valha para nuvem e caixa.
- `v3`: 151 dos 1.100 pontos têm outro com o centro a menos de 1 px, e 45 das 880 campanhas sem vídeo ficam inteiras debaixo de um ponto de vídeo. A contagem está escrita por plataforma e a resposta não muda, mas um encaixe determinístico no lugar do hash lateral tiraria as coincidências.
- `v3`: o destaque usa `--chart-2`, que repete o hex de `--warning`, por pedido do catálogo. Não há variação semântica no corpo, então a COR-8 não é contrariada; fica o registro de que vídeo lê como alerta.
- `v3`: na cauda fina o ponto de vídeo, de 4,5 px, é mais alto que o contorno da forma. É da técnica.
- `v4`: os rótulos "37 leads em 0 min: conferir a coleta" e "n 9: amostra curta, só os traços" são atravessados pela linha pontilhada da mediana geral; o halo segura a leitura.
- `v4`: na cauda os traços de 10 px passam para fora do contorno do feijão.
- `v4`: no canal sem curva o traço de 12 minutos fica a 3,3 px da linha da mediana geral e os dois leem como par.

Revisão de 2026-10-05, segunda passada, sobre o código corrigido da `v2` e da `v4`. As duas foram aprovadas: os bloqueantes da primeira passada saíram (chuva com 2,20 px entre centros e nenhum par abaixo de 2 px; um traço cheio por minuto com lead, sem opacidade). As observações da `v2` e da `v4` no parágrafo acima continuam valendo no arquivo atual. O que segue é novo e não reprova.

- `v2`: no trimestre anterior o ponto vazado tem 3 px de diâmetro e os centros ficam a 2,2 px, então os anéis de uma mesma coluna se encostam em 0,8 px. A coluna lê como corrente de anéis e a altura conta os leads; contar um a um pede ampliação.
- `v2`: o comentário do topo do `data.ts` ainda diz que o código do lead é a semente do deslocamento vertical. Hoje ele só desempata o encaixe.
- `v2`: o `meta.json` trocou o item do catálogo (jitter com semente pelo código do lead) por encaixe e descreve a conta nas notas, sem a palavra desvio. A `v4` declara o desvio dela por extenso; vale o mesmo aqui.
- `v2`: a sub-faixa da chuva mede 32 px para todas as seis chuvas por causa de uma coluna de 11 leads; as outras cinco usam de 12 a 17 px e o cartão fica com faixas quase vazias.
- `v4`: a mediana do Formulário do site (12 min) fica a 3,3 px da linha pontilhada da mediana geral (13 min), com 1,5 px de vão entre as tintas. Os dois traços se distinguem nos dois temas, e a proximidade é do dado.
- `v4`: no canal sem curva a mediana cai em cima de uma observação (25 min) e cobre o traço dela: são 8 traços visíveis e a mediana para n 9.
- `v4`: no trecho denso todo minuto tem lead e os traços viram um pente regular de 3,3 px de passo, que informa pouco além da forma. É o preço de tirar a opacidade, e está declarado.
