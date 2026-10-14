# Parecer de revisão: 06_pizza/05_pizza-de-raio-variavel

- **Data:** 2026-10-14
- **Versões julgadas:** `v2_anel-do-cpl-qualificado-alvo`, `v3_entradas-e-taxa-de-agenda-por-fila` e
  `v4_plataforma-sem-lead-qualificado`, as três `sem_revisao`.
- **Régua:** `CHECKLIST_REVISAO.md` (32 perguntas), `CONTRATO.md` seções 14.1 e 17, `ARMADILHAS.md`
  consultado por código (GEO-4, GEO-19, TOK-10, DAD-1, DAD-9).
- **check:** `npm run check -- 06_pizza/05_pizza-de-raio-variavel` com 0 erros e 2 avisos, os dois da
  v1 (frase acessível a 13 do teto e RAIO-CONTRA-AREA em fila de dívida). Nenhum aviso nas três julgadas.
- **Resultado:** v3 aprovada; v2 e v4 reprovadas, cada uma com um bloqueante. Vereditos gravados por
  `npm run revisao`.

**Como medi.** Coordenadas na caixa do desenho de cada versão, lidas do `preview.svg` (o `<svg>`
sobreposto tem `viewBox` do tamanho da caixa, escala 1). Caixa de tinta do texto de 11 px pelo leitor
`colisao.mjs`: 5,06 px acima e 3,96 px abaixo da âncora com `dominant-baseline="central"`. Largura da
tinta lida nos PNGs de conferência, que saem em escala 2. Raio dos setores lido do primeiro ponto de
cada `path` do preview e comparado com a fórmula do `Chart.tsx`.

---

## v2_anel-do-cpl-qualificado-alvo: reprovada

```
Versão: 06_pizza/05_pizza-de-raio-variavel/v2_anel-do-cpl-qualificado-alvo
Data: 2026-10-14
Resultado: reprovada
Não: 13, 15
Correções:
  13. ROT-7 com GEO-19 e GEO-4: afastar o rótulo de quem passa do anel pelo canto da tinta mais próximo do centro, não pela âncora.
  15. 17.7: com isso some a sobreposição do rótulo R$ 2,6 mil sobre o setor e o entalhe que o halo abre no arco.
Não se aplica: 4, 8, 28, 29, 30, 32
```

### Bloqueante único. Perguntas 13 e 15. ROT-7, GEO-19, GEO-4

**Evidência.** O rótulo `R$ 2,6 mil` (setor Rede profissional de contatos, o mais caro e o que mais
passa do alvo) é ancorado em `(119,50; 35,93)`, a `R_MAX + LABEL_GAP = 86 + 12 = 98` px do centro
`(190; 104)`, no ângulo médio do setor. A distância vale para a âncora; a tinta não. A caixa de tinta
mede cerca de 50 x 9,02 px, de x 94,8 a 144,8 e de y 30,9 a 39,9. O canto inferior direito,
`(144,8; 39,9)`, fica a **78,5 px** do centro, ou seja **7,5 px dentro** do arco de raio 86, num ângulo
(125°) que está dentro do setor (111,9° a 160,2°). O arco corta a caixa de tinta do canto superior
direito até `(132,7; 39,9)`: um triângulo de 12 x 9 px, cerca de 12% da caixa, sob a palavra "mil".

O halo de 4 px pinta a superfície por cima e abre no setor um entalhe retangular de cerca de
13 x 11 px, visível nos dois PNGs: recorte escuro no dourado ao lado de "mil" no tema escuro, recorte
branco no oliva no claro. O entalhe está no arco externo, que é a borda que codifica o CPL desse setor.
É o sintoma literal da GEO-19 ("a âncora fora da marca reentra pelo canto"), que o `ARMADILHAS.md` cita
para pizza de raio variável, com a consequência da GEO-4 (o halo apaga a marca que o rótulo devia
deixar ver). As guardas não pegam: a CONTRASTE-TEXTO toma o halo como fundo, e a TEXTO-NA-MARCA só mede
texto com a marca inteira por baixo.

O `notes` do `meta.json` e o comentário das linhas 260 a 263 do `Chart.tsx` afirmam que o rótulo fica
"FORA do arco, sobre o cartão". O render mostra o contrário.

**O que mudar.** Seguir a saída da GEO-19: calcular o afastamento pelo canto da caixa de tinta mais
próximo do centro, com a largura pela tabela por glifo e a altura de 9,02 px do texto de 11 px, e exigir
folga de pelo menos 4 px fora do raio do próprio setor. Para este rótulo, com `textAnchor="middle"`, só a
âncora a cerca de 110 px do centro (R_MAX + 24) tira o canto de baixo do arco; `textAnchor` por lado
(`end` na metade esquerda, `start` na direita) pede afastamento menor. O halo continua (ROT-7), mas sem
fatia por baixo. Reconferir pelos quatro cantos nos dois temas e corrigir o `notes` e o comentário.

### A aproveitar na mesma rodada (não bloqueia)

- `R$ 1,9 mil`: pela mesma conta, o canto superior direito da tinta fica a cerca de 0,2 px do arco do
  setor Redes sociais (raio 74,7). Nos PNGs não há entalhe visível, mas a causa e a correção são as
  mesmas do bloqueante, e a folga de 4 px deve valer para os dois rótulos.
- A linha de chamada do alvo sai do anel a 0° rumo à direita. Hoje o setor nesse ângulo (Busca paga)
  fica dentro do alvo e a linha corre sobre o cartão; num recorte em que o setor a 0° passe do alvo, ela
  atravessa a fatia.
- Fidelidade do render no tema claro: a comparação do SVG contra a página gravou
  `.qa/06_pizza/05_pizza-de-raio-variavel/v2_anel-do-cpl-qualificado-alvo.claro.diff.png` e
  `.claro.diff-img.png`, o que só acontece acima do `LIMIT_OK` de 0,5%; contei 0,53% de pixels
  marcados, todos no texto do subtítulo e do rodapé. O render trata isso como aviso e a pergunta 21 pede
  no máximo 0,5%; conferir de novo no render do conserto.
- TIP-7 latente: `truncate` na linha de leitura, com o valor do alvo na cauda, e no nome da legenda.
  Nada é cortado no preview.

---

## v4_plataforma-sem-lead-qualificado: reprovada

```
Versão: 06_pizza/05_pizza-de-raio-variavel/v4_plataforma-sem-lead-qualificado
Data: 2026-10-14
Resultado: reprovada
Não: 13, 15
Correções:
  13. ROT-7: a chamada da ausência é cruzada pelo anel de escala e não tem halo; dar o halo às duas linhas ou tirá-las de dentro do anel.
  15. 17.7: com isso some a sobreposição do tracejado sobre o "0" de "0 leads qualificados".
Não se aplica: 4, 29, 30
```

### Bloqueante único. Perguntas 13 e 15. ROT-7

**Evidência.** O anel do topo da escala é um `<circle>` de raio 76 centrado em `(170; 95)`, tracejado
`3 3` em `--text-muted`. A segunda linha da chamada, `0 leads qualificados`, é ancorada em `(196; 26)`
com `dominant-baseline="central"`, então a tinta vai de y 20,9 a 30,0. O anel passa em y 23,6 no x 196 e
em y 26,5 no x 203: atravessa o "0" no meio da altura e segue rente à linha de base até o "l" (y 28,9 no
x 207). Nos dois PNGs um traço do tracejado entra no "0" pela esquerda; no claro o algarismo chega a ler
como zero cortado ou "−0". É o número da chamada, que é o assunto inteiro desta versão.

A ROT-7 é literal: "Rótulo que cruza linha de referência ou outra marca leva halo", e "o halo é
obrigatório, não opcional", decidido sobre o que o dado pode produzir; aqui o dado fixo já produz. O
`HALO` está declarado no topo do arquivo e só o rótulo do anel o usa. Nenhuma guarda mede texto contra
traço: a COLISAO-TEXTO compara texto com texto e a CONTRASTE-TEXTO mede o fundo, não a linha por cima.

**O que mudar.** Uma das duas, conferindo nos dois temas:

1. Aplicar `HALO` às duas linhas da chamada. O halo interrompe o tracejado do anel sob o texto, que é o
   previsto na ROT-7, e não toca a linha de chamada, que termina em x 190, 6 px antes do texto (o halo
   chega a x 194), então a pergunta 31 continua em sim.
2. Ou levar o bloco de texto para fora do anel pelos quatro cantos da caixa de tinta (GEO-19), com 4 px
   de folga, recalculando os Y e o cotovelo.

### A aproveitar na mesma rodada (não bloqueia)

- ROT-11 latente: o cotovelo e o texto da chamada são constantes no topo direito (`CALLOUT_ELBOW_X`,
  `CALLOUT_TEXT_X`, `CALLOUT_LINE_1_Y`, `CALLOUT_LINE_2_Y`), enquanto o ângulo do setor ausente vem do
  dado. Hoje o setor ausente é o último e fica no topo; num recorte em que ele caia na metade de baixo, o
  segundo trecho da linha atravessa a pizza por cima das outras fatias. Derivar o lado e a altura do
  texto do ângulo do setor.
- O rótulo do anel, `R$ 2,6 mil`, fica 12 px abaixo de `0 leads qualificados`, quase alinhado com ele, e
  lê como terceira linha da chamada. Ao mexer na chamada, separar os dois grupos.
- TIP-7 latente: a linha de leitura ocupa 416 dos 422 px do corpo com `truncate`, e a cauda é a conclusão
  ("não gerou lead qualificado no mês"). Seis pixels de folga; deixar quebrar em duas linhas.
- Raio maior é CPL mais caro e nenhum texto diz isso; o "Quando evitar" do README pede aviso escrito. O
  mesmo ponto já está anotado para a v1.
- A chamada mistura Manrope na primeira linha e Space Grotesk na segunda; um `<tspan className="font-display">`
  só no algarismo deixaria as duas linhas na mesma fonte (TIP-1 continua atendida).

---

## v3_entradas-e-taxa-de-agenda-por-fila: aprovada

Sem bloqueante. Os cinco raios do preview (41,57; 35,75; 49,96; 30,63 e 73,27 px) batem com
`√(rMin² + (rMax² − rMin²) · taxa)` no domínio declarado de 0 a 100%; a legenda tabular soma 100 e
nomeia as cinco filas com participação, taxa e volume; os rótulos `50%` e `100%` ficam 4 px à direita da
vertical, livres do setor Indicação de cliente nos dois temas. As observações (abreviação "Part.",
rótulo de 50% latente sobre a primeira fila, período só na frase acessível) estão no README do modelo.
