# Parecer de revisão: 22_unidades-waffle-e-pictograma/05_area-quadrada-proporcional

Data: 2026-10-13. Revisor independente. Julgadas as quatro versões, todas `sem_revisao`, pelo arquivo e pelos PNGs de hoje (render das 06:10, posterior ao `Chart.tsx` das quatro). `npm run check` com tipos: 0 com erro, 0 aviso.

Resultado: `v1`, `v3` e `v4` aprovadas; `v2` reprovada por um bloqueante. As 20 observações não bloqueantes estão no README do modelo.

## Peso do bloqueante

* **`v2`, a frase acessível diz que há uma célula para cada lead.** Perguntas 19 e 14; ACE-1, NUM-6 e seção 14.1 (unidade). Não é redação: a frase afirma duas unidades na mesma oração, "células de 5 leads" e "uma para cada lead", e a segunda é falsa, porque são 257 células para 1.284 leads. A figura tem `role="img"`, então quem usa leitor de tela recebe só essa frase, e é dela que sai quanto vale cada célula.

## O que foi medido e o que não foi

* **Medido:** os dois PNGs de cada versão, com recorte ampliado dos rótulos, das células apagadas da `v2`, da folga da `v3` e da barra da `v4`; as células de cada quadrado, contadas por cor no `preview.svg` dos dois temas (257, 42 e 8 na `v1`; 42 acesas e 215 apagadas na `v2`; 386 neutras e 55 acesas na `v3`; 204 e 147 na `v4`); tamanho, peso, fonte e contraste de cada texto, lidos do estilo computado no `preview.svg`; os pares de marca compostos de `app/src/styles/tokens.css`; a diferença entre preview e página, de 0,01% a 0,11%.
* **Não medido pela ferramenta:** CONTRASTE-TEXTO, COLISAO-TEXTO e TEXTO-NA-MARCA nas quatro (`texto_em_html`) e ESPESSURA-MARCA nas quatro (`sem_marca_de_barra` e `marca_html`). As quatro foram cobertas à mão, como descrito acima.
* **Não renderizado:** o estado vazio das quatro e os ramos fora do dado padrão. O render só desenha o `data.ts`, então o que se diz deles é leitura do código.
* **Não testado:** a redação sugerida abaixo. O tamanho citado é conta sobre o texto, não render.

## `v2_leads-que-viraram-oportunidade`: reprovada, um bloqueante

### Bloqueante 1. Perguntas 19 e 14; ACE-1, NUM-6 e seção 14.1 (unidade)

**Evidência.** `Chart.tsx:73` a `76` monta a frase, e a linha 74 escreve o trecho errado:

```
`Quadrado de ${formatInt(totalCells)} células de ${formatInt(data.unit)} leads, uma para cada lead do ${data.period}: `
```

O `data-farol-ace` do `preview.svg`, que é a frase que o Farol vai anunciar, sai assim, com 174 caracteres:

> Quadrado de 257 células de 5 leads, uma para cada lead do 1º semestre de 2026: 42 acesas são as 212 oportunidades, 16,5% (212 de 1.284). Os outros 1.072 leads ficam apagados.

| O que a frase afirma | O que o dado e a tela dizem |
|---|---|
| "células de 5 leads" | 1 célula = 5 leads (`unit: 5`, rodapé do cartão) |
| "uma para cada lead" | 257 células para 1.284 leads, uma para cada 5 |

O resto da frase confere com o `data.ts` e com a tela: 42 acesas, 212 oportunidades, 16,5% (212 de 1.284) e 1.072 apagados.

**Por que bloqueia.** A 14.1 põe a unidade entre as regras que decidem o que o desenho afirma, e a ACE-1 pede frase calculada do dado. Aqui a frase, que é o desenho inteiro para quem não enxerga, dá duas respostas para quanto vale a célula. Contagem sem substantivo passou como observação na `v1` deste modelo e em `25/01`; o caso aqui é outro, porque a unidade está escrita e uma das duas é a errada. O total de 1.284 leads, que desfaz a dúvida, só aparece dentro do parêntese da taxa.

**O que mudar.**

1. Tirar "uma para cada lead" da linha 74 e pôr o total de leads no lugar, por exemplo: "Quadrado de 257 células de 5 leads com os 1.284 leads do 1º semestre de 2026: 42 acesas são as 212 oportunidades, 16,5% (212 de 1.284). Os outros 1.072 leads ficam apagados." São 173 caracteres, dentro dos 100 a 250 da ACE-1.
2. Manter `formatInt` e `formatRateWithVolume` como estão, para a FORMATO-ACESSIVEL continuar casando a frase com o corpo.
3. Renderizar de novo nos dois temas e rodar o `check`: o `preview.svg` guarda a frase e fica desatualizado com a troca.

Nada mais reprova na `v2`. O desenho está certo: 42 células acesas a partir do canto inferior esquerdo (17, 17 e 8), 215 apagadas, as duas partes com nome e número na tela somando 1.284, taxa com volume, e o resto em `--surface-sunken` com contorno `--line-strong`, que vale pela isenção do valor escrito ao lado. O desvio do catálogo (`--surface-overlay`) está certo e declarado.

### Para aproveitar a mesma rodada (não bloqueia)

1. **Ramos sem rótulo.** `Chart.tsx:113` e `120` só desenham as anotações com `restRows > 0` e `litRows > 0`. Com oportunidades que arredondam para 0 células, o número delas some da tela; com o resto menor que uma linha inteira, o resto fica sem nome e a célula neutra perde a isenção do valor escrito. Uma saída, não testada, é condicionar ao valor (`rest > 0`, `converted > 0`) em vez de à linha e dar à anotação a altura mínima de uma linha de texto, porque `rowsHeight(0)` dá 0; a `v1` já mostra a redação para o primeiro caso ("menos de 1 célula").
2. **Período na tela.** "1.284 leads do semestre" não diz qual semestre; o `data.period` só chega à frase acessível (DAD-9).
3. **Sobra de altura.** Cerca de 70 px vazios entre o cabeçalho e o quadrado no canvas `quadrado`; canvas por número fecha o cartão (GEO-1).
4. **Colchete do aceso.** Cobre 3 linhas e a terceira tem 9 células apagadas encostadas nele. Já está declarado no `notes`; fica como está se a correção não mexer na geometria.

## Versões aprovadas

* **`v1_funil-do-semestre-em-celulas`.** 32 perguntas sem "não". 257, 42 e 8 células, lado 17, 7 e 3, linha incompleta no topo e bases na mesma linha de pixels. Uma cor, dois tamanhos de texto, nenhum peso 700. Observações: contagem sem substantivo na legenda ("1 célula = 5 por etapa") e faixa direita vazia.
* **`v3_custo-e-receita-do-trimestre`.** Perguntas 17 e 25 com ressalva, as demais sem "não". 193 e 248 células com a mesma célula de 7 px, 55 de folga acesas a partir da 194ª. A etiqueta de procedência no Chart contraria a ANO-6, mas o catálogo a pede, são duas procedências no mesmo cartão e o desvio está declarado; `25/04`, `25/05` e `25/07` passaram do mesmo jeito. A observação que pesa: folga contra coberto mede 1,12:1 no claro e delta E76 de 4,2 em deuteranopia, e na simulação sobre o PNG claro os dois tons ficam praticamente iguais. O colchete com rótulo em 700 é o segundo canal e segura a leitura (TOK-9 pede a presença do canal, não a razão), mas a fronteira célula a célula depende só da cor.
* **`v4_quando-a-area-deixa-de-servir`.** 32 perguntas sem "não", a 10 com ressalva de TIP-1. Razão de 200 contra o limite de 100, 204 e 147 células, nulo com `formatUnavailable()` e ícone, negativo com U+2212 e fora da área, zero medido tratado em ramo próprio. Observações: barra de 6 px com piso de largura de 2 px declarado, dois textos sem `tabular-nums`, cor categórica em marca já rotulada, frase acessível sem valor em reais.

## Tensões de régua notadas

* O catálogo pede o resto da `v2` em `--surface-overlay`, token que a TOK-1 e a ANO-4 vedam como marca (1,00:1 no claro). O produtor desviou certo; o catálogo precisa de emenda.
* O catálogo pede etiqueta `--prov` dentro do Chart da `v3`, contra a ANO-6. A mesma tensão já foi anotada em três revisões (`25/04`, `25/05` e `25/07`) e outras 16 versões do acervo usam token `--prov` dentro do Chart, sem que uma das duas réguas ceda por escrito.
* Nenhuma guarda confere a presença do segundo canal quando destaque e neutro têm a mesma luminância (TOK-9). Na `v3` isso só apareceu simulando deuteranopia sobre o PNG claro.
