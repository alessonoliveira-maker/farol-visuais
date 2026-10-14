# Checklist de revisão de uma versão do catálogo VISUAIS

> Vigente desde 2026-09-14. Aplicado pelo revisor a **cada versão**, depois de `npm run render -- <caminho> --tema ambos` e antes de aceitar a entrega. As regras citadas estão em [CONTRATO.md](CONTRATO.md), seção 17 (códigos TIP, COR, EIX, ROT, ANO, NUM, ESP, EST, DIC, ACE) e seções 2 a 11.

## Como aplicar

1. Abra o `Chart.tsx`, o `data.ts`, o `meta.json` e os dois PNGs de conferência: `_render/.qa/<caminho>.png` (escuro) e `_render/.qa/<caminho>.claro.png` (claro).
2. Responda cada pergunta com **sim** ou **não**. Toda pergunta foi escrita para que "sim" seja o resultado aprovado. Uma pergunta que não se aplica à versão (a 18, por exemplo, quando não há dica) conta como sim e leva a anotação "não se aplica".
3. **Um único "não" reprova a versão.** O parecer cita o número da pergunta, o código da regra e o que o produtor precisa mudar, em uma frase.
4. Registre o resultado no formato do fim deste arquivo.

## A. Escolha do visual

| # | Pergunta | Regra |
|---|---|---|
| 1 | A forma responde à relação que o `useCase` pede (ranking é barra ordenada; mudança no tempo é linha ou coluna; parte de um todo com até 6 partes é waffle, barra 100% ou rosca; distribuição é histograma ou pontos; desvio é barra divergente)? | README do modelo, Quando usar |
| 2 | O visual é mais rápido de ler que a frase ou a tabela com os mesmos números, e não repete um dado já impresso ao lado? | revisão A13, A22 |
| 3 | A série tem pelo menos 3 pontos, o funil só tem etapas aninhadas e nenhuma forma sugere algo que o dado não tem (tendência com 2 pontos, subconjunto que cresce)? | EIX-11; revisão A14 |

## B. Honestidade do encoding

| # | Pergunta | Regra |
|---|---|---|
| 4 | Barra, coluna e área começam no zero, e área preenchida só existe com escala a partir do zero? | EIX-1, EIX-2 |
| 5 | O visual está livre de 3D, sombra, gradiente, perspectiva, velocímetro e fundo decorado? | COR-9 |
| 6 | Parte de um todo tem no máximo 6 partes coloridas, soma 100 no percentual impresso e mostra a ausência por último, visível e fora de "Outros"? | COR-4, NUM-2 |
| 7 | Não há eixo duplo, e gráficos feitos para comparação compartilham a mesma escala? | EIX-8, EIX-9 |
| 8 | Ausência nunca vira zero: nulo quebra a linha, indisponível escreve `formatUnavailable()`, período parcial é marcado e comparação sem base se declara? | EIX-10, EST-2, EST-4 |
| 9 | A cor pertence à categoria por chave (nunca ao índice de array ordenada ou filtrada), e série única tem uma cor só? | COR-1, COR-3 |

## C. Acabamento

| # | Pergunta | Regra |
|---|---|---|
| 10 | Todo número está em algarismo tabular, os tamanhos seguem a tabela 17.1, nada fica abaixo de 11 px, no máximo dois elementos em peso 700 e todo texto está na horizontal? | TIP-1 a TIP-5 |
| 11 | Cada cor tem um papel da tabela 17.2: um destaque só, neutro apenas com o valor escrito, semântica só em variação ou estado, nenhum `--prov-*` em marca, slots categóricos na ordem 1, 3, 6, 5, 2, 4 e nenhum `--chart-2` ou `--chart-4` no mesmo corpo que variação semântica? | COR-2, COR-6, COR-8 |
| 12 | O rótulo direto é usado sempre que cabe, e a legenda, quando existe, segue a ordem visual das marcas com amostra na forma da marca? | ROT-1 a ROT-5 |
| 13 | Meta, média e teto usam `ReferenceLine` com `ifOverflow="extendDomain"` e rótulo com nome e valor, com no máximo duas anotações, e nenhum rótulo é cortado ou coberto por linha ou marca (halo onde cruza)? | ANO-1 a ANO-3, ROT-7 |
| 14 | Os números usam os formatadores, a precisão da NUM-1, o sinal de menos tipográfico, a base nomeada em toda variação e a unidade em todo lugar? | NUM-1 a NUM-6; seção 8 |
| 15 | O espaçamento segue a 17.7 (margem explícita, `barCategoryGap` de 30% a 40%, nada encostado na borda) e os dois PNGs saem sem corte, sobreposição ou transbordo? | ESP-1 a ESP-4 |
| 16 | O visual trata `data` vazio com um bloco `role="status"` que substitui o gráfico inteiro, sem eixo nem grade e sem moldura vermelha? | EST-1, EST-2 |
| 17 | O Chart está livre de título próprio, etiqueta de procedência, aviso de protótipo e moldura quando vai dentro do `VisualCard`, e a linha de leitura, se houver, é calculada do dado sem repetir o título? | ANO-5, ANO-6, ESP-4 |
| 18 | Se há dica, ela usa `ChartTooltip` com o mesmo formato do rótulo, sem animação, na ordem visual, e nada essencial vive só nela? | DIC-1 a DIC-5 |
| 19 | A frase acessível tem de 100 a 250 caracteres, começa pelo tipo de gráfico, diz a conclusão, e nenhuma informação depende só de cor? | ACE-1, ACE-2 |
| 20 | Todos os pares de texto, marca e contorno estão entre os aprovados da tabela 17.10 nos dois temas, sem opacidade sobre texto? | ACE-3, ACE-4, ACE-6 |

## D. Contrato de código

| # | Pergunta | Regra |
|---|---|---|
| 21 | `npm run check -- <caminho>` sai com `0 com erro`, os dois previews estão em dia e o render mediu diferença de no máximo 0,5% nos dois temas? | seções 12 e 13 |
| 22 | O Chart monta com `<Chart />`, tem `data` opcional com default do `data.ts`, raiz `h-full w-full min-w-0` e constantes de desenho nomeadas no topo, e exporta só o componente e tipos? | seções 2 e 5 |
| 23 | O `data.ts` é fictício e fixo, sem pessoa, empresa, documento ou contato real, e exercita um caso difícil (nome longo, valor pequeno, categoria de ausência, nulo)? | seções 3 e 10 |
| 24 | Todo texto de tela, `meta.json` e README está em português do Brasil acentuado, sem hífen, travessão ou meia risca como separador, e o README do modelo cita a versão? | seções 9 e 14 |
| 25 | Nada do "O que NÃO mudar" da revisão do Farol foi contrariado (procedência pelo `VisualCard`, volume junto da taxa, vazio separado de indisponível, texto das ressalvas)? | seção 17, Precedência |
| 26 | Se o catálogo planeja versões que não existem em disco, o README do modelo tem a seção `## Versões planejadas (fora desta leva)` citando o slug de cada uma? A ausência da versão em si é decisão do dono e não reprova; a ausência da declaração reprova. | seção 14, VER-1 |
| 27 | Sendo parte de um todo (pizza, rosca, waffle, pictograma, mosaico, barra 100%), toda parte tem nome e número legíveis sem interação, e o que está impresso na tela soma o todo? Dica não conta. | seção 17.4, ROT-10 |
| 28 | Havendo painel que detalha uma parte, as linhas de chamada saem das bordas dessa parte e vão direto ao painel, sem contornar o resto do desenho nem cruzar outras marcas? | seção 17.4, ROT-11 |
| 29 | Havendo painéis empilhados que compartilham o eixo X, o mesmo ponto da categoria cai na mesma coluna de pixels nos dois painéis (mesma escala de categoria, não band contra point)? | seção 17.3, EIX-12 |
| 30 | Havendo `fillOpacity` ou `opacity` em marca, a cor composta contra o cartão continua acima de 3:1 nos DOIS temas, e não só no escuro? | seção 17.10, ACE-5 |
| 31 | Nenhum halo de rótulo corta uma marca de traço fina (seta, conector, linha), e nenhum rótulo começa em cima do ponto de outra série? | seção 17.4, ROT-7 marca fina |
| 32 | Todo traço que carrega a relação (aresta, ligação, conector) mede ao menos 3:1 nos dois temas, em vez de ficar no neutro de referência? Teste: tapar o traço apaga a informação? | seção 17.10, ACE-6 |

## Registro do parecer

```
Versão: <familia>/<modelo>/<versao>
Data: YYYY-MM-DD
Resultado: aprovada | reprovada
Não: <números das perguntas com "não", ou "nenhum">
Correções:
  <nº>. <código da regra>: <o que mudar, em uma frase>
Não se aplica: <números, ou "nenhum">
```
