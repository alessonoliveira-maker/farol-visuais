# Parecer de revisão: 13_progresso-meta-e-gauge/03_progresso-radial-de-anel-unico

Data: 2026-10-14. Revisor independente. Julgada uma versão, `v3_meta-de-receita-por-origem`, com
motivo `revisao_desatualizada`: o `Chart.tsx` mudou depois do veredito de 2026-09-28, que reprovou
o trilho em `--surface-overlay`. Julgado o arquivo de hoje. PNGs de 2026-10-02 10:58, mais novos que
o `Chart.tsx`. `npm run check` com tipos: 0 com erro, 1 aviso (`AGREGACAO-ZERO` na `v4`, fora deste
julgamento), 0 escapes.

Resultado: `v3` reprovada por um bloqueante, nas perguntas 16 e 8.

## O que foi medido e como

* **Trilho, o motivo da reprovação anterior: resolvido.** `TRACK_FILL` é `--surface-sunken`. Lido do
  PNG: `#070c16` contra o cartão `#121c2e` no escuro, `#eaeff7` contra `#ffffff` no claro (1,15:1
  nos dois temas, o mesmo das irmãs v1, v2 e v4, aprovadas com esse token). O trecho que falta para a
  meta aparece nos dois temas.
* **Encoding, por ângulo no raio médio**, a cada 0,1°, a partir do topo no sentido horário: cliente
  atual 110,3°, indicação 61,2°, inbound 43,2°, mídia paga 16,6°, com fim do empilhado em 234°. O dado
  pede 110,9°, 61,9°, 43,9°, 17,3° e 234° (65% da volta). A diferença é o contorno de 1 px entre os
  segmentos (COR-5). Domínio na meta, ordem vinda do dado, slots 1, 3, 6 e 5.
* **Contraste das marcas**, contra o cartão e contra o trilho: escuro de 5,90:1 a 9,50:1 e de 6,77:1 a
  10,90:1; claro de 5,39:1 a 6,25:1 e de 4,67:1 a 5,41:1. Tudo acima de 3:1.
* **Texto central**: a tinta mais afastada do centro fica a 21 px do arco interno no PNG, nos dois
  temas (raio interno 168 px, externo 196 px). Nada cruza o anel.
* **Frase acessível**: 222 caracteres, começa pelo tipo e diz "65% da meta".
* **Não renderizado:** o ramo de vazio, o de estouro e o de meta zero. O que se diz deles é leitura do
  código, com o comportamento do Recharts 3.10.1 conferido em `isDomainSpecifiedByUser.js`.

## O bloqueante

### Perguntas 16 e 8; EST-1, EST-2 e seção 14.1 (ausência exibida como zero)

**Evidência.** O `Chart.tsx` não tem nenhum ramo `role="status"`. Com `data.origens` vazio:
`total` vale 0 pelo `reduce` (linha 30), `percentText` vale "0%" (linha 43) e nenhum `RadialBar` é
criado (linhas 63 a 76). Como o trilho mora no `background` do `RadialBar` de índice 0 (linha 65), o
anel some inteiro, sem trilho. O centro continua escrevendo "0%", "R$ 0 de R$ 5,0 mi" e "3º trimestre
de 2026", a legenda sai como `<ul>` vazia e a frase acessível termina em "0% da meta. .". A tela afirma
um trimestre medido com receita zero quando o recorte não tem linha. E nem o zero medido sai certo,
porque a EST-3 pede a marca desenhada e aqui não há nem trilho.

**Por que reprova.** A pergunta 16 pede que o vazio substitua o gráfico inteiro por um bloco
`role="status"`, e a 8 pede que a ausência nunca vire zero. A 14.1 põe "ausência exibida como zero"
entre as regras que bloqueiam sempre. O critério é o mesmo aplicado hoje em `07_rosca-e-radial/02` e,
antes, em `15_mapa-de-calor-e-calendario/08` e `16_distribuicao/03`. As versões de lista da família
13 já fazem o certo (`01/v3`, `01/v4`, `04/v1`, `04/v2`, `04/v3`, `05/v3`).

**O que mudar.** Antes do `return` principal, `if (data.origens.length === 0)` devolve o bloco no molde
de `13_progresso-meta-e-gauge/04_aneis-concentricos/v1_tres-metas-da-semana/Chart.tsx`, linhas 55 a 65:
raiz `flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted` com o `className` e o
`style` recebidos, `role="status"`, ícone `Filter` de 16 px (`size-4`) e uma frase de 12 px dizendo que
o recorte não tem receita por origem no trimestre, por exemplo "Nenhuma receita por origem neste
recorte do 3º trimestre de 2026.", montada com `data.quarterLabel`. Origem presente com `valor: 0`
continua desenhando o trilho e escrevendo "R$ 0" e "0%" (EST-3). Renderizar de novo com `--tema ambos`.

### A alinhar na mesma rodada (observações, não reprovam)

Estão no README do modelo, parágrafo de 2026-10-14. Os dois primeiros moram nas mesmas linhas que o
conserto vai tocar e custam pouco ali:

* **Estouro latente.** Com a soma acima da meta, `Math.min(total / meta, 1)` escreve "100%" no centro,
  e o `PolarAngleAxis` sem `allowDataOverflow` estende o domínio até a soma, de modo que a volta cheia
  passa a valer o realizado. Escrever o percentual sem trava e, se a v3 aceitar estouro, seguir o
  desenho da v4 (anel travado com o excedente escrito).
* **Meta zero latente.** `Math.max(data.meta, 1)` faria o centro escrever "100%" e "R$ 3,3 mi de R$ 0".
  Meta sem valor é ausência: `formatUnavailable()` no lugar do percentual (EST-1b, EST-4).
* COR-3 por índice, NUM-2 sem maior resto (soma 65 por coincidência), arredondamento misto da legenda
  (R$ 3,21 mi impressos contra R$ 3,3 mi), entalhe do `cornerRadius` na ponta presa do último segmento,
  raios fora de constante e sem `MARGIN`, TIP-1 no rótulo do trimestre e TIP-7 latente na legenda.

**O que não mexer**, porque foi conferido e está certo: trilho em `--surface-sunken`; domínio na meta;
slots 1, 3, 6 e 5 com contorno de 1 px em `--surface-raised`; legenda na ordem do anel, com valor e
percentual alinhados à direita; formato único de "65%" no centro e na frase (DAD-5); par "R$ 3,3 mi de
R$ 5,0 mi" numa linha só, dentro do furo, a 21 px do arco.

## Registro

```
Versão: 13_progresso-meta-e-gauge/03_progresso-radial-de-anel-unico/v3_meta-de-receita-por-origem
Data: 2026-10-14
Resultado: reprovada
Não: 16, 8
Correções:
  16. EST-1: devolver o bloco role="status" com Filter e frase quando data.origens.length === 0.
  8. EST-2 e 14.1: resolvida pela mesma mudança; o vazio deixa de escrever 0% e R$ 0 sem anel.
Não se aplica: 3, 18, 26, 28, 29, 30, 31, 32
```
