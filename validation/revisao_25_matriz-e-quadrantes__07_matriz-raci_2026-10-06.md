# Parecer de revisão: 25_matriz-e-quadrantes/07_matriz-raci

Data: 2026-10-06. Revisor independente, primeira passada. `npm run check`: 0 erros, 0 avisos. As guardas de texto não leem esta abordagem (`texto_em_html` nas quatro), então contraste, colisão e corte foram conferidos à mão.

Como foi medido: nos PNGs de `_render/.qa/25_matriz-e-quadrantes/07_matriz-raci/`, que têm 2 px de imagem por px de CSS, lidos pixel a pixel; no `preview.svg` de cada versão; e nos tokens de `app/src/styles/tokens.css`, com a fórmula de contraste da WCAG. A fidelidade entre página e arquivo foi refeita com a mesma conta do render (maior diferença por canal acima de 48).

| Versão | Resultado | Não |
|---|---|---|
| `v1_handoff-declarado` | aprovada | nenhum |
| `v2_alertas-de-governanca-do-handoff` | aprovada | nenhum |
| `v3_declarado-contra-executado-no-crm` | aprovada | nenhum |
| `v4_rasci-com-papel-sem-ocupante` | reprovada | 11 e 20 |

As observações não bloqueantes das quatro estão no README do modelo, seção `Observações da revisão (não bloqueantes)`. Este arquivo trata do que reprova e do que foi pesado e não reprovou.

Não se aplica, nas quatro: perguntas 3, 4, 7, 13, 18, 26, 28, 29, 30, 31 e 32. As perguntas 6 e 27 só se aplicam à `v3`, e ali passam: cada linha medida tem cinco partes, todas com nome no cabeçalho e número na célula, e o impresso soma 100.

## v4_rasci-com-papel-sem-ocupante

Resultado: reprovada. Um bloqueante, igual nos dois temas. O resto confere com o dado: seis etapas, seis papéis, um A por etapa, o alerta cai na única etapa cujo A está no papel vago (`Medir a carga de cada SDR`), a letra S tem glifo e legenda próprios, as letras do papel vago seguem na matriz sobre fundo do cartão, a data sai por `formatDate` e o estado vazio é o da EST-1.

### Bloqueante único. Perguntas 11 e 20. Seção 17.2 (papel Ausência), ACE-3, armadilha TOK-5

**O que o desenho faz.** A hachura que marca o papel sem ocupante é traçada em `--line-strong`, na coluna inteira e na amostra da legenda. É a marca que a versão existe para demonstrar: "Coluna do papel vago hachurada".

**Evidência.**

* `Chart.tsx`, linha 171: `stroke="var(--line-strong)"` nas linhas da coluna. Linha 119: o mesmo token nas linhas da amostra da legenda. Linha 117: `border border-line-strong` no `<svg>` da amostra.
* `preview.svg`: 102 elementos `<line>` com `stroke: rgb(51, 69, 106)`, que é o `#33456a` de `--line-strong` no tema escuro.
* PNG escuro, recorte da coluna vaga sem glifo (42 por 72 px de imagem): o pixel mais forte da hachura é `rgb(51, 69, 106)` sobre `rgb(18, 28, 46)`, **1,79:1**. Dois terços da tinta ficam em `rgb(44, 61, 94)`, 1,57:1, por suavização do traço de 1 px.
* PNG claro, mesmo recorte: o pixel mais forte é `rgb(180, 192, 214)` sobre branco, **1,83:1**. Dois terços da tinta ficam em `rgb(196, 205, 223)`, 1,60:1.
* A amostra da legenda mede o mesmo teto, 1,79:1 e 1,83:1, e no arquivo ela sai sem a borda (ver "Na mesma passada").
* Tabela 17.10: `--line-strong` sobre `--surface-raised` como marca mede 1,79 e 1,83, com o veredito "só com valor escrito". O piso de marca, contorno e amostra da ACE-3 é 3:1.
* Tabela 17.2: o papel Ausência é "contorno `--text-muted` sem preenchimento; texto `--text-muted`". `--line-strong` só serve de neutro quando cada marca carrega o próprio número, e de linha do zero.
* `ARMADILHAS.md`, TOK-5: o sintoma listado inclui a amostra da legenda quase invisível sobre o cartão, e a causa diz, literal, "amostra de legenda não tem valor escrito". A saída é `--text-muted` no papel de referência.
* O acervo já decidiu este caso quatro vezes do mesmo jeito: as hachuras de `25/04 v4`, `25/06 v4`, `15/06 v4` e `15/08 v4` usam `var(--text-muted)`. Esta é a única em `--line-strong`.
* O item 7 da Anatomia do README registra a escolha: "em `--line-strong`".

**Por que pesa.** Contraste e papel de cor estão na lista da seção 14.1 que bloqueia sempre, e aqui há número medido nos dois temas. Foi pesado o que joga a favor: a palavra "Vago" com o ícone no cabeçalho, a linha de leitura e a nota dizem o estado por escrito, então a coluna sozinha poderia pedir a isenção da ACE-3 (valor escrito junto da marca). A amostra da legenda não pode: por definição ela não tem valor escrito, e é ela que ensina a ler a hachura. Sobra uma versão de referência que ensina a marcar ausência com um traço entre 1,6:1 e 1,8:1, contra o papel que a 17.2 dá à ausência. É a mesma decisão do bloqueante B2 de `17/01`, de 2026-10-05.

**A guarda não viu, e é ponto cego declarado.** A `CONTRASTE-MARCA` mediu a `v4` e não acusou: o leitor de marcas só conta traço a partir de 2 px, porque 1 px é tratado como grade e eixo.

**O que mudar.**

1. Trocar `var(--line-strong)` por `var(--text-muted)` nas linhas da hachura da coluna (`Chart.tsx`, linha 171) e nas da amostra da legenda (linha 119). Passa a medir 5,21:1 no escuro e 5,37:1 no claro.
2. A moldura da amostra (linha 117) segue o mesmo token. Desenhe a moldura como `<rect>` sem preenchimento dentro do próprio `<svg>`, ou tire: o `border` de CSS no `<svg>` existe na página e some no `preview.svg`.
3. Conferir nos dois PNGs que as letras do papel vago continuam limpas sobre a hachura mais forte. Os glifos R, S, C e I e o ponto de célula vazia já têm `bg-surface-raised` por baixo, e o A é cheio. Se a textura pesar, o ajuste é no passo (`HATCH_STEP`, em múltiplo de 2), nunca de volta no token.
4. Atualizar o item 7 da Anatomia do README, que hoje diz `--line-strong`.
5. Render nos dois temas e `npm run check` por último.

**Na mesma passada, sem peso de bloqueio.** Estão no README e cabem na mesma edição:

* Concordância: "1 de 6 etapas têm nele o único A" na linha de leitura, e o singular fixo "etapa tem" na frase acessível, que erra com dois alertas.
* O cabeçalho `Coordenação de pré-vendas` quebra no hífen, em "de pré-" e "vendas". Hífen não separável (U+2011) ou 4 px a mais em `ROLE_COLUMN_WIDTH`.
* `tabular-nums` na linha de leitura e na nota de rodapé (TIP-1).
* `leading-tight` nos cabeçalhos `Etapa da redistribuição` e `Governança`, que hoje ficam 2,5 px acima da linha de base de `SDR`.
* O `notes` do `meta.json` fala em cabeçalho do papel vago em 4 linhas, e são 3.

**Pergunta 21, pesada e não reprovada.** O `check` sai sem erro e os previews estão em dia, mas o render mediu diferença acima de 0,5% nos dois temas, e por isso gravou os dois `diff.png`. Pela réplica à mão: 11.216 de 1.920.000 px no escuro, **0,58%**, e 12.301 no claro, **0,64%**. A seção 12 dá aviso até 2% e erro acima. De onde vem, em px de imagem no escuro e no claro:

* Subtítulo da moldura, fora do Chart: 2.928 e 3.732.
* Cabeçalho da tabela: 8.014 e 8.100. No arquivo, a primeira linha de cada cabeçalho sai 1 px de CSS abaixo da página: a tinta de `Etapa da redistribuição` ocupa as linhas 337 a 358 na página e 339 a 360 no arquivo; `Coordenação`, 285 a 306 contra 287 a 308; `Analista de`, 282 a 298 contra 284 a 300. `SDR`, `vendas`, `dados` e `Vago` coincidem.
* Amostra da hachura na legenda: 255 e 337, que é a borda perdida.
* Nota de rodapé: 19 e 132.

Dentro do Chart ficam 0,43% e 0,45%. Não há colisão nem corte em nenhum dos dois desenhos, e o desvio nasce no serializador, então segue o precedente de `24/02 v2` e vai como observação. Depois da correção, leia a divergência que o `render` imprime: o item 2 acima tira a parcela da amostra, e a do cabeçalho só some se a ferramenta mudar.

### Registro

```
Versão: 25_matriz-e-quadrantes/07_matriz-raci/v4_rasci-com-papel-sem-ocupante
Data: 2026-10-06
Resultado: reprovada
Não: 11 e 20
Correções:
  11. Seção 17.2 (papel Ausência), TOK-5: tirar a hachura do papel vago de --line-strong e pôr em --text-muted, na coluna, na amostra da legenda e na moldura da amostra.
  20. ACE-3: a hachura e a amostra medem 1,79:1 no escuro e 1,83:1 no claro, abaixo de 3:1; em --text-muted passam a 5,21:1 e 5,37:1.
Não se aplica: 3, 4, 6, 7, 13, 18, 26, 27, 28, 29, 30, 31 e 32
```

## Versões aprovadas

`v1`, `v2` e `v3` passaram nas 32 perguntas nos dois temas e não precisam de correção. As observações de cada uma estão no README do modelo.

**Contraste, comum às quatro, pelos tokens e conferido nos PNGs.** Texto: `--text-primary` 14,53:1 no escuro e 17,96:1 no claro; `--text-secondary` 8,16:1 e 8,13:1; `--text-muted` 5,21:1 e 5,37:1, que é a letra I, o ponto de célula vazia e a legenda. Marca: disco e anel em `--chart-1`, 9,50:1 e 6,00:1; letra do A em `--accent-cyan-contrast` sobre `--chart-1`, 10,06:1 e 6,00:1. Estado: `--warning` 8,36:1 e 5,74:1; `--negative` 5,50:1 e 6,36:1; `--positive` 7,36:1 e 5,34:1. Nenhuma opacidade em marca ou em texto.

**Fidelidade entre página e arquivo, pela réplica à mão.** `v1`: 0,000% nos dois temas. `v2`: 0,004% e 0,003%. `v3`: 0,20% e 0,27%, quase tudo na nota de rodapé.

### v1_handoff-declarado

* Conferido com o `data.ts`: um A em cada uma das 8 etapas; A por papel 2, 2, 4, 0 e 0; R por papel 3, 5, 0, 0 e 0. A linha de leitura (Gerente comercial, 4 de 8) e a frase acessível (Executivo de contas executa 5) batem.
* Célula com duas letras: 42 px numa coluna de 76 px, sem quebrar. A etapa de nome longo ocupa três linhas e 55 px de altura, sem corte e sem reticência; o conteúdo fecha dentro do corpo.
* A ordem do processo é dita na linha de leitura e pelo número do passo. O catálogo fala em subtítulo, que o Chart não escreve; a demonstração está entregue.

### v2_alertas-de-governanca-do-handoff

* Conferido com o `data.ts`: dois alertas, `Aprovar desconto acima da alçada` com dois A (Gerente e Operações) e `Registrar a perda` sem A. Carga no rodapé: 2 R e 2 A, 6 R e 1 A, 0 R e 4 A, 0 R e 1 A, 0 R e 0 A. O Executivo é o único R nas 6 etapas em que executa.
* Segundo canal do alerta: ícone, texto do problema e peso 600 no nome da etapa. O zero do rodapé é zero medido e sai escrito.
* Pesado e não reprovado: a linha de leitura junta "em 6." com "2 etapas". Lê mal, mas a vírgula decimal da casa e o espaço impedem a leitura como 6,2; é redação.

### v3_declarado-contra-executado-no-crm

* Conferido com o `data.ts`: 5 células acima de 30 pontos em 3 das 7 etapas com registro. São SDR (52%, com A e R) e Executivo (36%, com I) em `Registrar o contexto no CRM`; Executivo (41%, com R) e Operações (51%, sem letra) em `Validar o orçamento estimado`; Executivo (66%, com R) em `Montar a proposta comercial`. As sete linhas medidas somam 100.
* A etapa sem registro tem percentuais nulos no dado e na tela, nunca zero, e o volume vem escrito em cada linha, junto da taxa.
* Divergência com três canais: contorno, peso 600 e a frase do `sr-only`. A célula sem letra que executa escreve "sem letra".
* Pesado e não reprovado, NUM-1: a casa decimal nas 35 células é precisão a mais, não troca o que o desenho afirma. Fica como arredondamento.
* Pesado e não reprovado, ANO-6 e pergunta 17: o catálogo pede as duas etiquetas dentro do visual e o `notes` declara o desvio, como em `25/04 v3` e `25/05 v3`. As etiquetas estão em texto, não em marca, então a pergunta 11 passa. O âmbar repetido entre PREMISSA e o contorno de divergência vem do hex igual de `--prov-premissa` e `--warning`; a amostra do contorno tem rótulo próprio na legenda, e por isso é observação.
* Pesado e não reprovado, EST-2: a ausência usa `formatUnavailable()`, sem o ícone e em outro tom. Não vira zero, que é o que bloquearia.

## Defeitos de régua e de ferramenta notados

* **Serializador do preview.** Na `v4`, o `border` de CSS num `<svg>` não chega ao arquivo, e a primeira linha dos cabeçalhos desce 1 px. As `v1` a `v3` têm as mesmas classes de cabeçalho e não diferem; o que a `v4` tem a mais é a célula com ícone em `flex`, mas a causa não foi isolada. Somado ao subtítulo da moldura, passa do limite de 0,5%.
* **`CONTRASTE-MARCA`.** Traço de 1 px fica fora da medição por ser tratado como grade. Hachura de estado em 1 px escapa, e foi o que aconteceu na `v4`.
* **Catálogo, `v4`.** O `useCase` traz a data como "2026-08-01", e a moldura a imprime como subtítulo, contra a NUM-7.
* **Catálogo, `v1`.** O item "Etapas na ordem do processo, declarada no subtítulo" pede ao Chart um texto que é da moldura.
* **Guardas de texto.** `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA` seguem sem ler HTML; as quatro versões saem como `texto_em_html`.
