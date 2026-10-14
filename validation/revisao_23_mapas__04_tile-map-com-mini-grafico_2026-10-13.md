# Parecer de revisão: 23_mapas/04_tile-map-com-mini-grafico

Revisor independente, 2026-10-13. Julgadas as quatro versões, todas em `sem_revisao`, pelos arquivos de hoje (`Chart.tsx` de 12:10:30, `data.ts` e `meta.json` de 12:05 a 12:09) e pelos PNGs de 12:10 e 12:11, posteriores aos três. `npm run check` com tipos: 0 com erro, 0 avisos.

Resultado: `v1`, `v2` e `v4` **aprovadas**, com as observações no README do modelo. `v3_receita-por-produto-no-perimetro` **reprovada, por um bloqueante**. Este arquivo é o insumo do corretor da `v3`.

## O que foi medido e o que não foi

* **Como.** Os dois PNGs da `v3` (1920 por 1440 px, escala 2 sobre o canvas de 960 por 720 px) foram lidos pixel a pixel. Em cada barra, na coluna central, contei os pixels de cada produto: pixel conta quando fica a menos de 60 de distância em RGB da cor do token no tema. A mesma leitura foi repetida nas capturas da página (`.pagina.png`) e deu os mesmos números, então o defeito está no componente e não na serialização do preview.
* **Geometria lida do `preview.svg`.** Cada mini gráfico mede 110,28 por 57,92 px, com `viewBox` de 100 por 32. A faixa de valor (`BASE_Y` 30 menos `TOP_Y` 2) tem 50,68 px para o teto de R$ 4 mi: **1 px de tela vale R$ 78,9 mil**.
* **Refeito contra o `data.ts`:** os 8 totais escritos de T3/26, o teto de R$ 4 mi, as contagens de 9 UFs no perímetro e 18 fora, a ordem da legenda e os slots 1, 3 e 6. Batem.
* **Contraste:** siglas, totais, legenda e notas de 4,65:1 para cima nos dois temas; as três categóricas contra o cartão de 5,39:1 para cima. Passa.
* **Preview contra página**, medida minha com limiar de 25 por canal: 0,06% no escuro e 0,14% no claro.
* **Não renderizado:** o vazio e o ramo de total ausente no último trimestre. Lidos no código.
* **Não testada em render:** a saída sugerida abaixo é conta sobre a geometria atual, sem tocar no `Chart.tsx`. O corretor confere no PNG depois de mudar o código.

## Bloqueante 1. Perguntas 1 e 15; GEO-16, COR-5 e seção 14.1 (constante com consequência no render)

**O que se vê.** O caso de uso pergunta como a receita se reparte entre três produtos. Em GO, DF e MG o desenho mostra dois: a Linha Corporativa não tem nenhum pixel, nos dois temas. Em RS e SC ela é um fio de meio pixel, que no tema claro some em 7 das 8 barras. Só SP, RJ e PR mostram os três produtos.

**Por que acontece.** São duas causas somadas.

1. Cada parcela é um `<rect>` com `stroke="var(--surface-raised)"` de 1 px e `vectorEffect="non-scaling-stroke"` (`Chart.tsx:197` a `207`). O traço é centrado na borda, então come meio pixel por dentro em cima e meio embaixo: **toda parcela perde 1 px de altura, seja qual for o valor**. É a GEO-16 ao pé da letra: respiro em medida absoluta, e a marca pequena paga tudo.
2. A escala é uma só para o perímetro, de 0 a R$ 4 mi em 50,68 px. A Linha Corporativa de 5 das 8 UFs com dado vale menos de 2 px **antes** do contorno: R$ 45 mil no DF são 0,57 px, R$ 80 mil em GO são 1,01 px, R$ 90 mil em MG são 1,14 px.

**Evidência medida**, último trimestre (T3/26), Linha Corporativa. Altura em px de tela (o PNG tem o dobro):

| UF | Valor | Parte do trimestre | Altura pelo valor | Tinta no escuro | Tinta no claro |
|---|---|---|---|---|---|
| SP | R$ 600 mil | 15,4% | 7,6 px | 6,5 px | 6,5 px |
| RJ | R$ 250 mil | 12,8% | 3,2 px | 2,0 px | 2,0 px |
| PR | R$ 180 mil | 12,4% | 2,3 px | 1,0 px | 1,0 px |
| SC | R$ 140 mil | 12,6% | 1,8 px | 0,5 px | 0,5 px |
| RS | R$ 120 mil | 11,1% | 1,5 px | 0,5 px | **0 px** |
| MG | R$ 90 mil | 6,0% | 1,1 px | **0 px** | **0 px** |
| GO | R$ 80 mil | 11,9% | 1,0 px | **0 px** | **0 px** |
| DF | R$ 45 mil | 8,3% | 0,6 px | **0 px** | **0 px** |

* Nos quatro trimestres: das 28 parcelas da Linha Corporativa com valor maior que zero, **16 não têm nenhum pixel no tema claro e 11 no escuro**.
* A repartição desenhada em T3/26, contra a do valor (Base, Plus, Corporativa): GO desenha 78%, 22% e 0% para um valor de 59,7%, 28,4% e 11,9%; DF desenha 71%, 29% e 0% para 60,6%, 31,2% e 8,3%; MG desenha 70%, 30% e 0% para 62,4%, 31,5% e 6,0%; PR desenha 65,5%, 27,6% e 6,9% para 59,3%, 28,3% e 12,4%. Em SP o desvio é de 1,1 ponto percentual, e é por isso que conferir a barra grande não acha nada.
* A Linha Plus também encolhe onde a barra é baixa: no DF, R$ 150 mil a R$ 170 mil pedem de 1,9 a 2,2 px e desenham de 0,5 a 1,0 px.
* **Zero medido e valor medido desenham igual.** MG tem a Linha Corporativa em zero em T4/25 e T1/26 e em R$ 60 mil e R$ 90 mil em T2/26 e T3/26: as quatro barras saem sem ela. No DF, o zero de T2/26 não se distingue dos R$ 45 mil a R$ 60 mil dos outros três trimestres. O caso difícil que o `data.ts` declara não chega à tela, e o `notes` afirma que "o total escrito fecha a leitura", mas o total só existe para T3/26.

**Por que bloqueia.** A pergunta 1 pede que a forma responda à relação do `useCase`, e a relação aqui é a repartição entre três produtos: em 5 das 8 UFs com dado ela não se lê, e em 3 o desenho afirma que um produto não existe. A pergunta 15 pede os dois PNGs sem sobreposição, e é o contorno sobreposto à própria marca que apaga a parcela. A seção 14.1 põe vão e espessura de traço entre as constantes de acabamento, que bloqueiam quando o desvio aparece no render, e nomeia a consequência: marca perdida. Não é reprovação pelo 1 px do contorno, que a COR-5 pede e que continua necessário (as três categóricas medem de 1,03:1 a 1,47:1 entre si); é pelo que ele faz com a parcela pequena nesta escala. Nenhuma guarda viu: a ESPESSURA-MARCA saiu com `marca_fora_do_bar` e a RAIO-CONTRA-AREA com `sem_marca_de_area`.

**O que mudar.** As duas causas precisam cair juntas: tirar só o contorno deixa o DF com 0,57 px de Linha Corporativa.

1. **Escala.** Trocar a escala única por escala própria de cada tile, de 0 ao maior total trimestral da UF. O modelo prevê as duas e pede que a escolha seja declarada no visual; para a pergunta "como se reparte", a própria é a que responde, e o total de T3/26 já está escrito em cada tile para carregar o volume. Pela conta sobre os 50,68 px de hoje, as parcelas da Linha Corporativa passam a medir de 2,0 px (MG em T2/26, R$ 60 mil sobre o teto de R$ 1,49 mi) a 7,8 px (SP em T3/26); a de GO em T3/26 vai de 1,0 px para 6,1 px e a do DF de 0,57 px para 4,2 px.
2. **Separador.** Tirar o `stroke` dos `<rect>` e desenhar a separação só nas fronteiras **internas** da pilha, entre duas parcelas desenhadas: um `<path>` horizontal de 1 px em `--surface-raised`, com `vectorEffect="non-scaling-stroke"`, na largura da barra. Assim cada fronteira custa meio pixel a cada vizinha, em vez de 1 px a toda parcela, e a base, o topo e os lados da barra não perdem nada.
3. **Piso declarado**, que é a primeira saída da GEO-16: uma constante no topo do arquivo, em unidades do `viewBox`, que garanta altura mínima a toda parcela maior que zero, com o desvio que ela introduz escrito no `notes`. Com os itens 1 e 2 a menor parcela fica em 1,5 px (MG em T2/26); o piso é o que impede o próximo dado de trazer o problema de volta.
4. **Texto.** A nota do rodapé hoje diz "na mesma escala". Com a escala própria ela passa a dizer que cada tile tem a própria escala, que a altura não compara UFs e que o total escrito compara. Atualizar junto o `notes` e o `demonstrates` do `meta.json`, a linha da `v3` no README e o comentário do topo do `Chart.tsx`, que hoje termina em "Uma escala para todos".

Se o corretor preferir manter a escala única, a conta não fecha neste canvas: R$ 45 mil valem 0,57 px, e um piso de 2 px por parcela faria a barra do DF crescer 21% acima do total. Outra saída vale desde que cumpra o critério abaixo.

**Critério de aceite**, medido nos dois PNGs novos:

* Toda parcela com valor maior que zero (são 90 no dado padrão) tem pelo menos 1,5 px de tela na cor do produto, isto é 3 px no PNG de escala 2, nos dois temas.
* Em cada barra, a parte desenhada de cada produto fica a no máximo 3 pontos percentuais da parte do valor.
* Em MG, as barras de T4/25 e T1/26 (Linha Corporativa em zero) se distinguem das de T2/26 e T3/26; no DF, a de T2/26 se distingue das outras três.
* O rodapé declara a escala que o desenho usa, e `npm run check` sai com 0 com erro depois do render nos dois temas.

## Itens da mesma rodada, que não reprovam

O corretor já vai abrir o arquivo; estes ficam mais baratos agora do que numa segunda visita.

* **Trimestre parcial somado como zero.** `quarterTotal` (`Chart.tsx:43` a `47`) devolve `null` só quando os três produtos são `null`. Com um produto `null` e os outros medidos, ele soma `part ?? 0` e o desenho pula a parcela (`Chart.tsx:192` e `193`), então o total sai menor e nada marca a lacuna. O tipo do `data.ts` aceita esse caso e o dado padrão não o exercita. Ou o tipo passa a exigir o trimestre inteiro `null`, ou o trimestre parcial ganha a marca tracejada de sem coleta e o total deixa de ser escrito como total.
* **"Em cinza" só vale no tema claro.** A nota diz "as 18 UFs em cinza ficam fora". No tema escuro esses tiles são `--surface-sunken` (`#070c16`), mais escuros que o cartão, e não cinza. "As 18 UFs só com a sigla" vale nos dois temas.
* **Frase acessível sem a repartição.** Ela diz quem lidera em total e não responde ao `useCase`. Cabe a parte de cada produto no total do perímetro em T3/26: R$ 7,0 mi, R$ 3,7 mi e R$ 1,5 mi de R$ 12,2 mi.
* **README, Anatomia.** O item 1 diz tile `bg-surface-sunken`; na `v3` o tile do perímetro é contorno em `--line-subtle` e só o de fora é rebaixado.

## O que está certo na `v3` e não deve mudar

* Slots 1, 3 e 6 por produto, vindos do dado, e legenda única acima da grade, do topo da pilha para a base, com amostra quadrada.
* Barras a partir do zero, com a linha de base em `--line-subtle`.
* GO em T4/25 com o contorno tracejado em `--text-muted`, ES com `Unplug` e `formatUnavailable()`, e as 18 UFs de fora só com a sigla.
* Total de T3/26 por `formatCurrencyCompact`, em 11 px e peso 600, e o canvas de 960 por 720 px com a conta no `notes`.

## Registro do parecer

```
Versão: 23_mapas/04_tile-map-com-mini-grafico/v3_receita-por-produto-no-perimetro
Data: 2026-10-13
Resultado: reprovada
Não: 1, 15
Correções:
  1. GEO-16 e COR-5: dar à pilha uma escala em que a repartição se leia (própria por tile, declarada no rodapé) e garantir tinta a toda parcela maior que zero.
  15. Seção 14.1: trocar o contorno de 1 px em cada parcela por separador só nas fronteiras internas, para ele não apagar a parcela pequena.
Não se aplica: 13, 18 (a dica é o title nativo, sem Recharts), 27, 28, 29, 30, 31, 32
```

As outras três versões saíram aprovadas, sem "não" no checklist; as observações delas estão na seção final do README do modelo.
