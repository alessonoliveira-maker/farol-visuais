# Parecer de revisão: 14_tabelas-visuais/01_tabela-com-barras-inline

Data: 2026-10-14. Revisor independente. Julgadas três versões, todas com motivo
`revisao_desatualizada`: o `Chart.tsx` das três mudou em 2026-09-28, depois dos vereditos de
2026-09-19 (o trilho saiu de `--surface-overlay` para `--surface-sunken`). Julgado o arquivo de
hoje, não as notas antigas. PNGs de 2026-10-02, mais novos que os `Chart.tsx`. `npm run check` com
tipos: 0 com erro, 8 avisos (AGREGACAO-ZERO em limite de desenho ou na fila de dívida, e
CONTRASTE-MARCA da linha do zero em `--line-strong` na v3, que a 17.2 endossa), 0 escape.

Resultado: `v1` reprovada por um bloqueante, `v3` reprovada por três, `v4` aprovada. A `v2` não foi
julgada. As observações não bloqueantes estão no README do modelo, parágrafo de 2026-10-14.

## O que foi medido e como

* **Nenhuma guarda de texto mede este modelo:** as quatro versões saem como `texto_em_html` na
  COLISAO-TEXTO, na CONTRASTE-TEXTO e na TEXTO-NA-MARCA, e como `marca_html` na ESPESSURA-MARCA.
  Colisão, corte, espessura e contraste foram medidos à mão nos PNGs de 2x, por amostra de pixel e
  pela fórmula da WCAG.
* **Frases acessíveis**, lidas de `data-farol-ace`: as três começam pelo tipo e ficam entre 100 e
  250 caracteres (a FRASE-ACESSIVEL mediu as quatro).
* **Encoding:** as barras das três partem do zero com domínio calculado uma vez sobre o recorte
  inteiro; a divergente da v3 é simétrica em ± R$ 89,0 mil; o truncamento da v4 declara o teto no
  cabeçalho e escreve o valor real ao lado.
* **Render de página contra preview:** comparados os `.pagina.png` com os PNGs de conferência. Na
  v3 o corte da última linha é o mesmo nos dois, então é da peça; na v4 a marca de corte do outlier
  só existe no de página, então é do serializador.

## v1_receita-por-executivo: reprovada

### Bloqueante. Perguntas 20 e 13, ACE-3, armadilha TOK-10, seção 14.1 (contraste)

**Evidência.** O traço da média (`Chart.tsx:94` a `98`) é uma borda tracejada de 1 px em
`--text-muted` desenhada por cima da barra. Nas seis linhas acima da média (do 1º ao 6º) ele
atravessa a barra em `--chart-1`. Amostrado no PNG na linha do 1º, em x = 884: o traço sai
`rgb(92, 107, 135)` sobre a barra `rgb(11, 109, 125)` no claro, **1,12:1**, e `rgb(127, 143, 171)`
sobre `rgb(45, 212, 232)` no escuro, **1,82:1**. São exatamente os números da TOK-10. No claro o
traço só se distingue por matiz dentro da barra; ele aparece com clareza apenas nas seis linhas de
baixo, sobre o trilho.

**Por que reprova.** O par `--text-muted` sobre `--chart-1` não está entre os aprovados da 17.10 e
fica abaixo de 3:1 nos dois temas. O traço é um dos quatro itens de `demonstrates` ("Traço vertical
da média do time no trilho de todas as linhas"), e no claro ele só se lê em metade das linhas,
justamente fora das que estão acima da média. A 14.1 põe contraste entre as regras que bloqueiam
sempre.

**O que mudar.** Ler a saída da TOK-10 no `ARMADILHAS.md`; não existe token que contraste com o
cartão e com a barra ao mesmo tempo, então dê ao traço um segundo fundo próprio. Duas saídas:
(a) anel de 1 px em `--surface-raised` de cada lado do tracejado, mantendo o traço em todas as
linhas, como o catálogo pede; ou (b) traço só no trilho, pintado por baixo da barra, que então o
cobre nas linhas acima da média (a saída que a TOK-10 chama de mais honesta para limiar).
**Teste de aceite, nos dois PNGs:** a linha do 6º (R$ 803,4 mil, cerca de 5 px de canvas além da
média, com a ponta arredondada começando antes do traço) continua lendo como acima da média, sem
vão da cor do cartão entre a ponta e o traço; o traço se vê em todas as linhas em que deve existir.
Se a saída for (b), reescrever o item de `demonstrates` e a linha 6 da Anatomia do README.

## v3_resultado-por-origem-com-desvio-e-mix: reprovada

### Bloqueante 1. Pergunta 15, ESP-3, armadilha GEO-1, seção 14.1 (corte)

**Evidência.** A tabela vive num contêiner `flex-1 overflow-hidden` (`Chart.tsx:91`) e não cabe no
canvas `largo`. No PNG de 2x, as linhas têm passo de 42 px e as marcas de 28 px (mix de y 288 a
315 na 1ª linha); na última, `Evento presencial`, as três marcas vão de y 666 a 691 e a borda da
moldura passa em 692, isto é, 26 px de marca contra 28 nas outras nove, o respiro inferior da linha
sumiu e a descendente do `p` de "presencial" encosta na moldura. A linha deveria terminar em y 701:
faltam cerca de 4,5 px de canvas. O corte é igual no tema claro e no render de página, então não é
efeito do serializador. As linhas já estão em `py-0.5`, comprimidas para caber.

**O que mudar.** Ler a saída da GEO-1: somar as linhas reais do cartão antes de escolher o canvas e,
como nenhum preset fecha, declarar o canvas por número com a conta na nota do `meta.json`. Quem cede
é a altura do canvas, nunca a espessura da marca nem o piso de 11 px. **Teste de aceite:** a última
linha com a mesma altura de marca das outras e com respiro até a moldura, nos dois PNGs.

### Bloqueante 2. Perguntas 6 e 27, ROT-10 e NUM-2

**Evidência.** `LABEL_SHARE_THRESHOLD = 0.12` (`Chart.tsx:21` e `163`) cala o segmento `Novo` de
`Evento presencial` (5 de 64, 8%). Os percentuais impressos da linha somam 14 + 53 + 25 = 92, e uma
parte da barra 100% fica sem número no desenho parado. É o caso que a ROT-10 descreve ao reprovar
`06_pizza/01`. O segmento mede cerca de 24 px de canvas, e `8%` em 11 px ocupa uns 15 px: o número
cabe.

**O que mudar.** Trocar o limiar de participação por um teste de caber (largura do segmento contra a
tinta do rótulo mais respiro) e, para o segmento que não couber num recorte futuro, escrever o número
fora da barra, para que toda linha imprima as quatro partes somando 100. O catálogo pede "só acima de
12%" e colide com a ROT-10: o contrato vence, e o desvio se declara na nota do `meta.json` e no
quarto item de `demonstrates`. Com mais rótulos dentro, vale subir o mix para os 17 px da ESP-2
(texto mais 6 px), o que entra na conta do canvas do bloqueante 1.

### Bloqueante 3. Pergunta 11, tabela 17.2 (um token, um papel), seção 14.1 (papel de cor)

**Evidência.** `--chart-1` pinta a barra de volume (`Chart.tsx:126`, série única) e a categoria
`Novo` do mix (slot 1). A legenda `■ Novo` fica no alto, à esquerda, sobre as colunas Origem e
Volume, então o primeiro par cor e nome que o leitor recebe diz que o ciano da coluna Volume é
"Novo". A 17.2 diz: "um token tem um papel só dentro do mesmo visual".

**O que mudar.** Pintar o volume com o neutro de dado sem depender do valor escrito,
`--text-muted` (5,21:1 e 5,37:1 contra o cartão), e deixar `--chart-1` só para `Novo`. Trocar o slot
do mix não serve: a ordem da COR-8 depois de 1, 3, 6 e 5 é o `--chart-2`, proibido aqui porque o
saldo pinta variação semântica no mesmo corpo.

## v4_ausente-zero-outlier-e-faixa: aprovada

Sem bloqueante. Indisponível com `Unplug` e `formatUnavailable()` sem barra, zero medido com marca e
`R$ 0,00`, teto do volume declarado no cabeçalho com o valor real ao lado, ponto e intervalo em SVG
de escala 1:1 com o zero em `--line-strong` e linha de `n=1` só com o ponto. A marca de corte do
outlier aparece nos dois temas no render de página e some no preview: defeito do serializador, já
anotado. As observações (período só na frase, n ausente nas demais linhas, centavo) estão no README.
