# Parecer de revisão: 23_mapas/06_mapa-de-pontos, terceira passada (2026-10-15)

> Passada sobre a segunda rodada de correção, autorizada pelo dono em 2026-10-15. As passadas de 2026-10-13 estão em `revisao_23_mapas__06_mapa-de-pontos_2026-10-13.md`, como histórico. A `v1` e a `v3` seguem aprovadas desde a segunda passada e não foram julgadas aqui.

Revisor independente. Julgadas a `v2` e a `v4`, as duas em `revisao_desatualizada`, pelo arquivo de hoje: `Chart.tsx` das duas de 10:26:40, `meta.json` da `v4` de 10:26:28, `data.ts` e `meta.json` da `v2` de 2026-10-13, PNGs de 10:27, posteriores a todos eles. A nota antiga não serviu de régua. `npm run check` com tipos: 0 com erro, 0 avisos.

Resultado: `v4` **aprovada**; `v2` **reprovada, com um bloqueante**. O bloqueante não está no PNG de hoje: está no ramo que a correção criou para o cliente que não acha lugar, e ele muda os números escritos assim que o dado cresce dois clientes.

## O que foi medido e como

* **Geometria:** lida do `preview.svg` e do `preview-claro.svg` de cada versão (centro e raio de cada círculo, elipses, polígono do contorno, âncora de cada texto), em px do `<svg>` do mapa, que começa em (33; 86) do cartão nas duas versões.
* **Bancada:** `placeClients` da `v2` (linhas 21 a 167 do `Chart.tsx`) e `placeDots` da `v4` (linhas 18 a 119) transpiladas com o esbuild da `_render`, sem mudar uma linha, com o `data.ts` da própria versão. Reproduzem o preview ponto a ponto: maior diferença de posição de 1,8 × 10⁻¹⁵ px na `v2` e 0 na `v4`. As variantes de dado abaixo saíram dessa bancada.
* **Contagens:** refeitas do `data.ts`, com haversine à mão na `v2`.
* **Contraste:** fórmula da WCAG sobre `app/src/styles/tokens.css`, cor composta sobre `--surface-sunken`, nos dois temas.
* **Zoom:** recortes do `preview.svg` a 4 e 8 vezes, no Edge, para conferir selo, costa e vão entre pontos.
* **Não renderizado:** o estado vazio das duas. Lido no código.

## O que fechou da segunda passada

| Versão | Bloqueante de antes | Medida de hoje | Estado |
|---|---|---|---|
| `v2` | Ponto de Jundiaí 34% sob o selo de São Paulo | 74 pontos. Menor distância de centro de ponto a centro de selo: 12,04 px (São Paulo), 12,17 (Belo Horizonte) e 12,04 (Brasília); ponto e selo se tocam abaixo de 11,25. Os dois pontos de Jundiaí ficam a 12,89 e 16,40 px do selo | Fechou |
| `v2` | Queda na coordenada da cidade sem teste | Linhas 141 a 162: posição só entra em `placed` depois de passar em `fits`. Nenhum caminho põe ponto sem teste | Fechou, e é o ramo novo que abre o bloqueante de hoje |
| `v4` | 64 de 184 pontos fora do contorno do país | 0 fora. Menor distância do centro à borda: 2,74 px, para 1,95 de tinta do ponto mais 0,5 de meio traço do contorno | Fechou |
| `v4` | Cacho de São Paulo a cerca de 740 km da cidade | Centro do cacho de São Paulo a 9,3 px da cidade (cerca de 180 km). Toda tinta fica a no máximo 11,9 px (cerca de 230 km) de alguma cidade com lead | Fechou |

## Contagens contra o `data.ts`

* **`v2`:** 74 clientes em 23 cidades. Dentro de 100 km por haversine: São Paulo 16 (São Paulo 4, Campinas 3, Santos 3, Sorocaba 2, Jundiaí 2, São José dos Campos 2), Belo Horizonte 8 (Belo Horizonte 4, Sete Lagoas 2, Ouro Preto 2) e Brasília 9 (Brasília 4, Luziânia 3, Formosa 2). São 33 dentro (45%) e 41 fora. O preview tem 33 pontos cheios (16, 8 e 9 por elipse) e 41 anéis, e a linha de leitura, a legenda, a lista por escritório e a frase acessível escrevem os mesmos números, nos dois temas. **Iguais ao dado.**
* **`v4`:** 26 cidades com 3.680 leads, todas em múltiplo de 20, e 184 pontos no preview (36 de São Paulo, 18 do Rio de Janeiro, 13 de Belo Horizonte e assim por diante). 12 UFs com 320 leads sem município; total de 4.000; 8,0%; as três primeiras da lista são São Paulo 62, Minas Gerais 41 e Rio de Janeiro 38. Frase acessível de 156 caracteres com 184, 20, 3.680, 320, 8,0% e 4.000. **Iguais ao dado.**

## `v2_raio-de-atuacao-dos-escritorios`: reprovada, um bloqueante

### Bloqueante 1. Perguntas 3 e 8; seção 14.1, regra que decide o que o desenho afirma (a contagem escrita), DAD-2 e EST-1b

**O que se vê.** No dado padrão, nada: a tela de hoje está certa. O defeito mora no ramo, e a EST-1b manda julgar o ramo e não só a foto.

**Evidência no código.** A correção trocou a queda na origem por `if (chosen === null) continue;` (`Chart.tsx:162`): o cliente que não acha posição válida é descartado sem rastro. E todo número da tela é contado sobre a lista desenhada, não sobre o dado: `inside`, `outside` e `insideShare` (linhas 262 a 264), `perOffice` (273), a frase acessível (275 a 277), a linha de leitura (307) e as duas linhas da legenda (312 e 316). O cliente sem lugar some do mapa e das contagens ao mesmo tempo, e nada na tela diz que ele existia. O comentário de `placeClients` (linha 118) diz "então a contagem na tela é a do dado", e o `notes` do `meta.json` repete a promessa; no ramo ela é falsa.

**Evidência na bancada.** Mesmo código, mesma semente, só o dado muda:

| Dado | Clientes no dado | Dentro pelo dado | Pontos desenhados | "Dentro do raio" escrito | Sumiram sem rastro |
|---|---|---|---|---|---|
| Padrão | 74 | 33 | 74 | 33 | 0 |
| Jundiaí com 2 a mais | 76 | 35 | 75 | 34 | 1 |
| São Paulo com 4 a mais | 78 | 37 | 75 | 34 | 3 |
| São Paulo com 8 a mais | 82 | 41 | 75 | 34 | 7 |
| Todas as cidades em dobro | 148 | 66 | 130 | 48 | 18 |

No último caso a tela escreveria "37% dos clientes ficam a até 100 km" para um dado que dá 45%, e São Paulo com 16 na lista para 32 no dado. Todos os descartados são clientes de dentro, porque é a faixa entre o selo e a folga da elipse que lota; o "fora" continua certo, e por isso o percentual erra sempre para baixo.

**Por que reprova.** O caso de uso pergunta quantos clientes ficam a até 100 km, e o número escrito é a afirmação central do cartão (seção 14.1: regra que decide o que o desenho afirma, bloqueia sempre). É a raiz do bloqueante 1 da primeira passada, "a contagem sai do sorteio, não do dado", voltando por outro caminho: a classe agora vem do dado, a soma ainda vem do desenho. O dado padrão está na beirada: o `notes` diz "Contagens reduzidas no dado para caberem na elipse", e dois clientes a mais em Jundiaí já fazem um sumir. O README manda, no passo 1 de "Como colar no Farol", trocar o `data.ts` pelo dado real, e um escritório real tem dezenas de clientes no raio. A segunda passada pediu isto no "O que mudar", item 3: "Se ainda assim faltar lugar, o ramo deixa rastro na tela". A saída da DAD-2 é a mesma: o que sai da amostra é contado no rodapé, sempre. Há precedente no próprio modelo: na primeira passada a `v1` reprovou por um ramo que o dado padrão não renderizava (macrorregião sem cidade).

**O que mudar.**

1. Contar do dado. `inside`, `outside`, `insideShare`, `perOffice` e a frase acessível saem de `classified`, somando `row.clients` por classe e por escritório; nenhum número da tela vem de `clients.length` nem de filtro sobre a lista desenhada.
2. Quando os pontos desenhados forem menos que os clientes do dado, a tela diz quantos ficaram sem ponto, numa linha em `--text-muted` no rodapé da coluna (por exemplo "3 clientes sem lugar no desenho; as contagens são as do dado"), e a frase acessível também. A alternativa é a legenda passar a "1 ponto = N clientes", com N calculado da capacidade das elipses.
3. Acertar o comentário da linha 118 e o `notes` do `meta.json` para dizerem o que o ramo faz.

**Critério de aceite:** no dado padrão, a tela igual à de hoje (74 pontos, 33 dentro, 41 fora, 45%, 16, 8 e 9 por escritório, nenhum aviso de cliente sem ponto); na bancada com Jundiaí com 2 a mais, a tela escreve 35 dentro, 41 fora e 46%, e diz que 1 cliente ficou sem ponto; e nenhum número escrito calculado sobre a lista de pontos desenhados.

**O resto da versão passa.** Classe por haversine na coordenada da cidade; nenhum ponto cheio fora da folga da elipse e nenhum anel dentro dela; nomes dos escritórios a 7,76 px (Brasília), 9,37 px (São Paulo) e 12,89 px (Belo Horizonte) do centro do ponto mais próximo e a 5 px do traço da própria elipse; ponto cheio a 0,85 sobre `--surface-sunken` com 3,96:1 no claro e 8,02:1 no escuro; anel em `--text-muted` com 4,65:1 e 5,98:1; elipse em `--chart-1` com 5,20:1 no claro (ACE-6); texto em 12 e 11 px, peso 600 no máximo; frase acessível de 143 caracteres. As observações de hoje (pares abaixo do `MIN_GAP`, dois anéis do Rio de Janeiro com o centro no mar, deslocamento de até 29 px) estão no README e não reprovam.

## `v4_leads-sem-municipio-fora-do-mapa`: aprovada

Nenhum "não" nas 32 perguntas. Conferido além do contorno: série única em `--chart-1` (COR-1), sem legenda de série e com a legenda do valor do ponto (ROT-1, ROT-4); ponto a 0,80 sobre `--surface-sunken` com 3,59:1 no claro e 7,20:1 no escuro (ACE-5, ACE-3); texto `--text-muted` sobre o card em `--surface-sunken` com 4,65:1 e 5,98:1; pontos com 3,90 px entre centros, então os discos à vista ficam a 1,0 px um do outro e nenhum cobre outro; tamanhos 24, 12 e 11 px e nenhum peso 700 (TIP-2, TIP-3); substantivo junto de todo número (NUM-6); vazio com `role="status"`, ícone `Filter` e frase que distingue recorte sem lead de recorte só com lead sem município (EST-1); todo ponto inteiro dentro do `<svg>` (ESP-3).

**Por que o deslocamento de 21 px não reprova.** Medido até a própria cidade, o ponto mais longe de São Paulo fica a 21,0 px (cerca de 400 km), acima dos 16 px que a segunda passada pôs no critério. Mas o mapa tem uma cor só, e o que o leitor vê é o conjunto de nós ocupados, não o dono de cada ponto: toda tinta fica a no máximo 11,9 px (cerca de 230 km) de alguma cidade com lead, e a atribuição na ordem do dado, a que a segunda passada recomendou, ocupa os mesmos nós com diferença de 10 em 184 e máximo de 16,1 px. O desenho afirma o mesmo nas duas. O número não escrito na tela fica como observação, no README.

## Registro do parecer

```
Versão: 23_mapas/06_mapa-de-pontos/v2_raio-de-atuacao-dos-escritorios
Data: 2026-10-15
Resultado: reprovada
Não: 3, 8
Correções:
  3 e 8. Seção 14.1 e DAD-2: o cliente sem lugar é descartado sem rastro (Chart.tsx:162) e todo número da tela é contado sobre os pontos desenhados; contar do dado e escrever na tela quantos clientes ficaram sem ponto.
Não se aplica: 4, 6, 7, 18, 26, 27, 28, 29

Versão: 23_mapas/06_mapa-de-pontos/v4_leads-sem-municipio-fora-do-mapa
Data: 2026-10-15
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 4, 6, 7, 13, 18, 26, 27, 28, 29, 31, 32
```

## Defeito de régua ou de ferramenta

* O critério de aceite da segunda passada para a `v2` não dizia o que fazer quando falta lugar; o rastro na tela estava só no "O que mudar". A correção cumpriu o critério e deixou o ramo mudo. É a mesma lição da segunda passada sobre a `v4`: critério de aceite de posicionamento precisa dizer também o que acontece quando a regra não fecha, e conferir a contagem escrita contra o dado e não contra o desenho.
* Nenhuma guarda roda a peça com dado diferente do padrão, então nenhum `check` pega número escrito que só diverge do dado fora do `data.ts` de exemplo.
