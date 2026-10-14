# Parecer de revisão: 06_pizza/03_pizza-de-fracao-unica

> Data: 2026-10-14. Revisor independente, sem participação na produção.
> Régua: `CHECKLIST_REVISAO.md`, `CONTRATO.md` (14.1 e seção 17), `ARMADILHAS.md` (REC-13, TOK-10, DAD-4).
> Versões julgadas: `v2_tique-do-trimestre-anterior`, `v3_glifos-de-cobertura-na-tabela-de-origens` e
> `v4_zero-indisponivel-e-extremos`, as três sem revisão anterior. A `v1` já estava aprovada e não foi julgada.
> `npm run check`: 0 com erro, 3 avisos (CONTRASTE-MARCA do trilho em `--line-strong` na v1, v2 e v4,
> já declarados no README e cobertos pela exceção da ACE-3, porque o valor vem escrito junto).

## v2_tique-do-trimestre-anterior: REPROVADA

Não: 13, 15. Não se aplica: 4, 18, 26, 28, 29, 30, 31.

### Bloqueante 1. Pergunta 15 (e o que a versão demonstra), REC-13: o Pie cobre metade do tique, e o que sobra fica solto fora do disco

**Evidência.** No `preview.svg`, a `<line>` do tique (`x1=70 x2=82 y=44`, raio 36 menos e mais 6) é
pintada **antes** dos dois `<path>` do Pie, que vêm depois no documento e a cobrem. Medido nos dois
PNGs, em escala 2x, na linha y=311 a 313: o setor em `--chart-1` termina em x=215, a costura de 2 px do
Pie em `--surface-raised` ocupa x=216 a 219, e o tique visível vai de x=220 a 229. Sobram **5 px de CSS
dos 12 declarados**, separados do disco por 2 px de fundo. O catálogo diz "Tique radial em 25% no
contorno, com o mesmo centro e raio do Pie", e na tela o traço não toca o contorno: é um traço curto
flutuando ao lado do disco. A metade de dentro (`radius - TICK_REACH`) é geometria que nunca aparece.

**O que mudar.** Pintar o tique por cima do Pie. A emenda de 2026-09-29 da REC-13 diz que entre tipos
de marca a ordem no JSX não decide, porque o Recharts pinta por `zIndex` em portal: passar `zIndex`
explícito ou levar o tique para uma camada acima do Pie. Ao cruzar o setor aceso, `--text-muted` mede
1,82:1 (escuro) e 1,12:1 (claro) contra `--chart-1` e some dentro dele (TOK-10), então use uma das duas
saídas medidas da TOK-10: anel na cor da superfície em volta do traço, ou o traço só por fora, pintado por
cima e encostando no setor (cobrindo a costura), com comprimento que leia como tique. Confira no PNG,
nos dois temas, que o traço encosta no disco.

### Bloqueante 2. Pergunta 13, ANO-2 (identificação da marca de referência): o rótulo do tique é só o número, e com o traço na mesma altura lê como "- 25,0%"

**Evidência.** `PreviousTick` escreve só `formatPercent(previousFraction, 1)`, e a ANO-2 pede anotação
"com nome e valor". Em 25% o tique é horizontal, às 3 horas, e o texto ancora com
`dominantBaseline="central"` na mesma altura, 6 px depois da ponta do traço. No PNG dos dois temas o par
se lê como "- 25,0%", um número negativo ao lado de uma pizza de 38,0% num cartão que diz "+13 p.p.". O
nome do período só existe na linha de variação, embaixo, e a ligação entre o traço e ela depende de o
leitor casar os dois "25,0%".

**O que mudar.** Rótulo com nome e valor, por exemplo "anterior 25,0%", ou "2º trimestre" sobre
"25,0%" em duas linhas, sem abreviação inventada (ROT-8). Se não couber na faixa de 56 px da direita,
redistribuir a largura entre a caixa do glifo (132 px) e a coluna de texto (152 px) e refazer a conta
da GEO-1 no `meta.json`. Com o nome antes do número, o traço deixa de preceder um algarismo.

### Observações da v2 (não reprovam; saem na mesma rodada porque o arquivo já vai ser tocado)

- **Rótulo do tique só cabe na caixa para fração anterior entre cerca de 10% e 40%.** Com `cx=40`,
  `cy=44` e âncora no raio 48: em 50% a âncora cai em y=92, abaixo dos 88 px da caixa; perto de 0% cai
  em y=−4; e acima de 50% o `textAnchor="end"` empurra o texto para a esquerda de x=40, com só 4 px de
  margem (em 75% a âncora fica em x=−8). O SVG recorta. Não aparece no preview, mas é o primeiro dado
  real que vai mostrar; ao refazer o rótulo, decidir a posição para os quatro quadrantes.
- **Frase acessível termina em "p.p.."**, com ponto duplo: `pointsText` já acaba em ponto.
- **COR-6.** A cor da variação é decidida no código (alta pinta `--positive`) sem `goodDirection` no
  dado. Para fração de indicação a polaridade é defensável, mas quem colar com outra métrica herda o verde.
- **TIP-7 latente.** `truncate` na linha "contra 25,0% no 2º trimestre de 2026" (a cauda carrega o
  período da base) e em "Demais 31 (62,0%) de outras origens" (conteúdo fora da frase acessível). Cabe
  com folga no preview.

### Registro

```
Versão: 06_pizza/03_pizza-de-fracao-unica/v2_tique-do-trimestre-anterior
Data: 2026-10-14
Resultado: reprovada
Não: 13, 15
Correções:
  15. REC-13: pintar o tique por cima do Pie (zIndex explícito), com anel na cor da superfície ou só por fora encostando no setor (TOK-10).
  13. ANO-2: rótulo do tique com nome e valor, para o traço não ler como sinal de menos antes de "25,0%".
Não se aplica: 4, 18, 26, 28, 29, 30, 31
```

## v3_glifos-de-cobertura-na-tabela-de-origens: aprovada

As 32 perguntas com sim. Conferido à mão o que o `check` não mede (texto em HTML): `--text-primary`,
`--text-secondary` e `--text-muted` sobre `--surface-raised` nos dois temas, nenhum texto sobre marca.
Contas refeitas: 329 de 579 dá 56,8%; os sete percentuais batem com as contagens; a ordem é decrescente.
Observações (frase acessível com ausência no lugar do menor, peso 400 de Space Grotesk, nota de
rodapé de catálogo, caso de uso do `meta.json` diferente do catálogo) foram para o README.
Não se aplica: 3, 4, 13, 18, 26, 28, 29, 30, 31, 32.

## v4_zero-indisponivel-e-extremos: aprovada

As 32 perguntas com sim. Zero medido desenha o trilho e escreve 0% (EST-3); ausência sai com contorno
tracejado em `--text-muted`, `Unplug` e `formatUnavailable()` (EST-2); 3,3% e 98,3% trocam o glifo pelo
número. Contas refeitas: 2 de 61 dá 3,3% e 58 de 59 dá 98,3%. Observações (a parte da fração nunca é
nomeada e os recortes têm nome de origem, TIP-7 latente, peso 400 de Space Grotesk, 100% tratado como
número aqui e como disco na v3) foram para o README.
Não se aplica: 3, 4, 13, 18, 26, 28, 29, 30, 31, 32.
