# Parecer de revisão: 22_unidades-waffle-e-pictograma/01_waffle

Data: 2026-10-12. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 08:05, posterior ao `Chart.tsx` das quatro, de 08:04). `npm run check` com tipos: 0 com erro, 1 aviso (CONTRASTE-MARCA na `v4`, célula vazia em `--line-subtle`).

Resultado: `v1` e `v2` aprovadas; `v3` reprovada por um bloqueante; `v4` reprovada por três. As 29 observações não bloqueantes estão no README do modelo. A grade de 5 por 5 da `v3` não foi julgada como desvio: é o padrão adotado pelo dono enquanto a D8 está aberta, e está declarada no README e no `notes`.

## Peso dos bloqueantes

* **`v3`, destaque só na cor.** Perguntas 11 e 19, COR-2 e ACE-2. A seção 14.1 põe papel de cor entre as regras que bloqueiam sempre, e a armadilha TOK-9 mediu exatamente este par de tokens. É regra com medição atrás, não gosto, e a correção é pequena.
* **`v4`, taxa sem volume.** Perguntas 25 e 14, NUM-1. "Volume junto da taxa" está na precedência da seção 17, que vence as demais regras. É o mais pesado dos quatro, porque muda o `data.ts`.
* **`v4`, chip partido em duas linhas.** Pergunta 15. Acabamento com consequência no render, descrito pela consequência: o rótulo do caso difícil que a versão existe para mostrar sai quebrado, com o 100 sozinho na segunda linha.
* **`v4`, conversão nula desenhada como grade vazia.** Pergunta 8, EST-2. Ausência exibida como zero bloqueia sempre pela 14.1. É o mais leve: mora num ramo que o dado padrão não exercita, e foi lido no código, não visto no PNG.

## O que foi medido e o que não foi

* **Medido:** os oito PNGs de conferência; a contagem de quadrados de cada grade, refeita do `data.ts` (`v1` 62; `v2` 36, 37, 18 e 9; `v3` 20, 20, 20, 16, 14, 20 e 21; `v4` 14, 10, 6 e 0) e conferida no desenho; os contrastes de texto e de marca nos dois temas, calculados de `app/src/styles/tokens.css`, contra o cartão nas três primeiras e contra o palco na `v4`; as cores da `v3` amostradas no PNG, que conferem com os tokens; o topo e a base das nove grades da `v3` e a caixa do chip da `v4`, lidos pixel a pixel; a frase acessível gravada em cada preview (138, 230, 233 e 202 caracteres).
* **Não medido pela ferramenta:** COLISAO-TEXTO, CONTRASTE-TEXTO e TEXTO-NA-MARCA nas quatro (`texto_em_html`); ESPESSURA-MARCA, EIXO-CALMO, OPACIDADE-MARCA e RAIO-CONTRA-AREA não se aplicam; FORMATO-ACESSIVEL na `v4` (`frase_sem_formatador`). Contraste e colisão de texto foram cobertos à mão.
* **Não renderizado:** o vazio das quatro; na `v4`, a fila com conversão nula; na `v2`, um terceiro bloco neutro; na `v3`, grupo com total igual a zero. O que se diz desses ramos é leitura do código.
* **Não testado:** as saídas sugeridas abaixo. As larguras citadas nelas são conta sobre o PNG, não render.

## `v3_cobertura-de-origem-por-plataforma-e-mes`: reprovada, um bloqueante

### Bloqueante 1. Perguntas 11 e 19; COR-2, ACE-2 e seção 14.1 (papel de cor), armadilha TOK-9

**Evidência.** O pior grupo (Redes sociais em ago/26, 54,1%) se distingue dos outros seis por duas coisas, e as duas são cor:

| Canal | Onde | Escuro | Claro |
|---|---|---|---|
| Preenchimento, `--chart-1` contra `--text-muted` | `Chart.tsx:68` | 1,82:1 | 1,12:1 |
| Número, `--text-primary` contra `--text-secondary` | `Chart.tsx:121` | 1,78:1 | 2,21:1 |

O peso do número é o mesmo nos sete grupos (`font-semibold`, 600, na linha 121). Nenhuma palavra junto da marca diz qual é o pior grupo: o nome só existe na frase acessível. O rodapé explica o destaque pela própria cor ("Em cor, o pior grupo", linha 142). O `notes` do `meta.json` não registra o par medido.

No PNG claro o waffle destacado (`#0b6d7d`) e os neutros (`#5c6b87`) têm quase a mesma luminância, e o destaque se sustenta só no matiz. Quem não separa os dois matizes precisa comparar sete percentuais para achar o menor, que é o trabalho que o destaque existe para poupar.

**Por que bloqueia.** A COR-2 pede que a marca destacada mude o peso do rótulo para 700 ou receba anotação, e dá o motivo medido. A TOK-9 mediu este mesmo par (1,82:1 e 1,12:1) e conclui que o segundo canal é obrigatório, "e isso não é preferência". O terceiro item do `demonstrates` é o destaque do pior grupo, então é a própria demonstração que falha no tema claro. A `v2` passa na mesma régua porque nomeia o destaque por escrito na linha de leitura ("36 de cada 100 foram ganhas").

**O que mudar.**

1. Número do pior grupo em peso 700 (`font-bold`). A TIP-3 permite dois elementos em 700, o nome e o valor do destaque.
2. A palavra junto da marca, na linha do n para não mudar a altura do bloco: por exemplo "n = 318, pior grupo". A coluna tem cerca de 150 px e a linha em 11 px ocupa cerca de 100 px.
3. Rodapé sem depender da cor: por exemplo "Em cor e em peso maior, o pior grupo".
4. Registrar no `notes` o par medido, como a TOK-9 manda.

### Para corrigir na mesma rodada, sem peso de bloqueio

* A grade de amostra pequena fica 2 px acima das vizinhas (topo em 544 contra 548 e base em 687 contra 691 no PNG de escala 2, nos dois temas). O selo tem 18 px de altura e a linha do número tem 20 px. Dar a mesma altura ao bloco de texto nos três estados alinha a linha inteira.
* Célula vazia em `--surface-sunken` sem contorno mede 1,15:1. A `v1` usa o mesmo fundo com contorno `--line-strong`, e alinhar as duas deixa visível o "de 25".
* O README diz que a `v3` usa `@container` na raiz, e ela não usa.

## `v4_micro-waffle-de-posicoes-por-fila`: reprovada, três bloqueantes

### Bloqueante 1. Perguntas 25 e 14; NUM-1 e precedência da seção 17, armadilha DAD-1

**Evidência.** O cartão escreve quatro taxas e nenhum volume: "14,2% viram venda", "9,8% viram venda", "6,1% viram venda" e "0,6% viram venda" (`Chart.tsx:110` a `112`). A base também não tem nome: "14 em 100" não diz 100 de quê. O `data.ts` declara a taxa pronta (`conversion: 0.142`, campo da linha 14), não as contagens, então a peça nem tem de onde tirar o volume.

**Por que bloqueia.** A NUM-1 pede taxa de conversão "com uma casa e o volume". A precedência da seção 17 lista "volume junto da taxa" entre o que nenhuma regra manda remover, e a pergunta 25 cobra isso por nome. A saída da DAD-1 é literal: o `data.ts` declara contagens, não a taxa. O caso difícil da versão é justamente uma taxa de 0,6%, e sem a base não se sabe se "menos de 1 em 100" é 1 venda em 160 leads ou 6 em 1.000. As irmãs cumprem: a `v1` escreve "194 de 312 leads" e a `v3` escreve o n em cada waffle.

**O que mudar.**

1. No `data.ts`, trocar `conversion` pelas duas contagens da fila (por exemplo leads e vendas, as duas `number | null`), com números que reproduzam as taxas de hoje.
2. No `Chart.tsx`, calcular a taxa numa função que devolve `number | null` (EST-1b) e escrever o volume com o substantivo na segunda linha da coluna da direita. Hoje "14 em 100" e "14,2% viram venda" dizem o mesmo dado duas vezes, e a segunda linha é o lugar natural de "40 de 282 leads" ou de `formatRateWithVolume`.
3. Refazer a conta de largura depois disso (GEO-1), junto com o bloqueante 2.

### Bloqueante 2. Pergunta 15; seção 14.1 (acabamento com consequência no render), armadilha GEO-2

**Evidência.** Nos dois PNGs o chip da fila Indicações sai em duas linhas, "menos de 1 em" e "100". Lido pixel a pixel no PNG de escala 2: a caixa vai de y 426 a y 493 (33,5 px de CSS, duas linhas de 16 px mais a borda) e de x 480 a x 687 (103,5 px, a largura inteira da coluna `w-[104px]` de `Chart.tsx:104`). O bloco de texto da fila ocupa 48 px de altura contra 28 px nas outras três, e o passo entre as filas deixa de ser regular.

**Por que bloqueia.** O quarto item do `demonstrates` é este chip. É o rótulo do caso difícil da versão, e na referência ele aparece quebrado, com o número 100 separado da frase que o explica. A 14.1 manda bloquear constante de acabamento quando o desvio aparece no render.

**O que mudar.** Chip em uma linha: `whitespace-nowrap` e coluna que comporte o texto. Pela conta do revisor o chip pede cerca de 108 px, e `w-28` (112 px) resolve. Há folga: a tinta da coluna da esquerda termina em 152,5 px e a grade começa em 193 px, o que deixa cerca de 28 px além do vão de 12 px. Se o bloqueante 1 alargar a segunda linha, a conta se faz uma vez só para as duas.

### Bloqueante 3. Pergunta 8; EST-2 e seção 14.1 (ausência exibida como zero), armadilha DAD-2

**Evidência, lida no código.** O tipo aceita `conversion: null` ("quando não há base para calcular"). Nesse ramo:

* `ConversionGrid` desenha as 100 células em `--line-subtle` (`Chart.tsx:47` e `50`), o mesmo desenho de "menos de 1 em 100" e de zero medido. Três estados diferentes, uma grade só.
* O texto escreve `formatUnavailable()` dentro do parágrafo do valor, em `--text-primary` com peso 600 e sem o ícone `Unplug` (linha 108).

A ocupação nula, que o dado padrão exercita, está certa: tira os quadrados e escreve a ausência com `Unplug` em `--text-muted` (linhas 80 a 84). O defeito é só da conversão, e não aparece no preview porque nenhuma fila do dado padrão tem conversão nula.

**Por que bloqueia.** A EST-2 diz "nunca zero, nunca barra zerada" e pede o ícone em `--text-muted` no lugar do número. A saída da DAD-2 pede tratamento visual distinto para zero medido e ausência. A 14.1 lista ausência exibida como zero entre as regras que bloqueiam sempre.

**O que mudar.** Com `cells === null`, não desenhar a grade de 100 (ou desenhá-la em contorno tracejado, como a `v3` faz no mês sem coleta) e escrever a ausência com o mesmo desenho das linhas 80 a 84: `Unplug`, `formatUnavailable()` e `--text-muted`.

### Para corrigir na mesma rodada, sem peso de bloqueio

* ACE-1: a frase acessível começa por "Filas de SDR", sem o tipo de gráfico, e lista os valores sem conclusão. Começar pelo tipo e dizer qual fila tem vaga e qual converte menos.
* O `notes` cita 1,25:1 para a célula vazia. Essa é a medida da guarda contra o cartão; sobre o palco, onde a peça vive, são 1,37:1 no escuro e 1,21:1 no claro.

## `v1` e `v2`: aprovadas

* **`v1_leads-com-telefone-valido`.** 62 quadrados por colunas, de baixo para cima, conferem com 194 de 312 (62,18%, escrito 62,2%). As duas partes têm nome e número (194 e 118) e somam o n. Texto em `--text-muted` mede 5,21:1 e 5,37:1 contra o cartão; `--chart-1` mede 9,50:1 e 6,00:1; a célula vazia vale pelo contorno e pelo valor escrito.
* **`v2_desfecho-das-oportunidades-encerradas`.** O maior resto fecha 100 (36, 37, 18 e 9), os blocos são contíguos na ordem da legenda, as contagens somam 340, a ausência vem por último e hachurada, e o destaque é nomeado por escrito na linha de leitura.

**Tensão de régua na `v2`, para o dono.** O catálogo pede "Transferida com 0,3% listada na legenda" e "percentual iguais à contagem de células". A NUM-2 e as perguntas 6 e 27 pedem que o percentual impresso some 100. As duas coisas não se cumprem juntas: os inteiros fecham 100 e a linha de Transferidas leva o total impresso a 100,3%. O produtor seguiu o catálogo, a linha se declara fora da grade ("menos de 1 quadrado", amostra tracejada, peso menor), e cada número é o arredondamento correto do dado. Por isso não reprova. Falta a régua dizer se categoria abaixo de um quadrado fica fora da soma ou se o rótulo dela deve ser texto, não percentual.

## Registro

```
Versão: 22_unidades-waffle-e-pictograma/01_waffle/v1_leads-com-telefone-valido
Data: 2026-10-12
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 7, 13, 18, 26, 28, 29, 30, 31, 32
```

```
Versão: 22_unidades-waffle-e-pictograma/01_waffle/v2_desfecho-das-oportunidades-encerradas
Data: 2026-10-12
Resultado: aprovada
Não: nenhum
Correções: nenhuma
Não se aplica: 3, 4, 7, 13, 18, 26, 28, 29, 30, 31, 32
```

```
Versão: 22_unidades-waffle-e-pictograma/01_waffle/v3_cobertura-de-origem-por-plataforma-e-mes
Data: 2026-10-12
Resultado: reprovada
Não: 11, 19
Correções:
  11. COR-2: dar ao pior grupo um segundo canal além da cor, com peso 700 no número e a palavra escrita junto da marca.
  19. ACE-2: tirar do rodapé a explicação que depende só de cor e registrar no notes o par medido (1,82:1 e 1,12:1).
Não se aplica: 3, 4, 13, 18, 26, 28, 29, 30, 31, 32
```

```
Versão: 22_unidades-waffle-e-pictograma/01_waffle/v4_micro-waffle-de-posicoes-por-fila
Data: 2026-10-12
Resultado: reprovada
Não: 8, 14, 15, 25
Correções:
  8. EST-2: com conversão nula, não desenhar a grade vazia e escrever a ausência com Unplug em text-muted.
  14. NUM-1: escrever o volume e o substantivo da base junto de cada taxa de conversão.
  15. GEO-2: manter o chip "menos de 1 em 100" em uma linha, alargando a coluna da direita.
  25. Precedência da seção 17: declarar contagens no data.ts e calcular a taxa no Chart, para o volume acompanhar a taxa.
Não se aplica: 3, 4, 7, 13, 18, 26, 28, 29, 30, 31, 32
```
