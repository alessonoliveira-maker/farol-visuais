# Revisão independente: 12_hierarquia/04_arvore-de-indicadores

Data: 2026-10-14. Versões julgadas: `v2_alavanca-de-maior-sensibilidade`, `v3_da-receita-a-capacidade-de-pre-vendas` e `v4_ticket-de-produto-novo-como-premissa`, todas `sem_revisao`. A `v1` já estava aprovada desde 2026-09-20 e não foi julgada de novo.

`npm run check -- 12_hierarquia/04_arvore-de-indicadores`: 0 com erro, 6 avisos. Os avisos são a dívida de `AGREGACAO-ZERO` da `v1` e o `CONTRASTE-MARCA` do trilho em `--line-strong` nas quatro versões, já declarado no README e no `notes`. Os previews são de 2026-10-02, mais novos que os `Chart.tsx` de 2026-09-28.

Resultado: `v2` reprovada; `v3` e `v4` aprovadas. As observações das três estão no README do modelo, seção "Observações da revisão (não bloqueantes)".

---

## v2_alavanca-de-maior-sensibilidade: reprovada

```
Versão: 12_hierarquia/04_arvore-de-indicadores/v2_alavanca-de-maior-sensibilidade
Data: 2026-10-14
Resultado: reprovada
Não: 11
Correções:
  11. 17.2 (um token, um papel) e COR-2: levar o marcador do valor central dos quatro cartões não destacados para neutro e deixar --chart-1 só no cartão da alavanca.
Não se aplica: 6, 16, 18, 27, 28, 29, 30, 31
```

### Bloqueante único: pergunta 11, papel de cor (17.2, COR-2)

**Evidência.** `Chart.tsx:291` pinta o marcador do valor central com `bg-chart-1` em todo cartão, destacado ou não. `Chart.tsx:275` e `:285` usam o mesmo `--chart-1` na borda e no valor do cartão destacado. No PNG escuro (1840 por 1080 px) há cinco pontos ciano, um por cartão: Receita nova (343, 671), Ganhos (919, 460), Ticket médio (903, 850), Oportunidades (1495, 332) e Taxa de ganho (1495, 570). Além deles, a borda e o valor de Taxa de ganho também são ciano. No claro o quadro é o mesmo em azul petróleo. Ou seja, a cor do destaque aparece nos cinco cartões, e o que separa a alavanca dos outros é só a borda de 1 px e a cor do valor.

**Por que bloqueia.** A 17.2 abre com "um token tem um papel só dentro do mesmo visual" e dá ao Destaque o `--chart-1` com o limite "um destaque por visual". Aqui o `--chart-1` tem dois papéis: é a série (o marcador do centro, que na `v1` era a única tinta e por isso estava certo) e é a alavanca acesa. A seção 14.1 põe papel de cor entre as regras que bloqueiam sempre. A versão existe para acender uma alavanca, e o catálogo diz o que isso pede: "Taxa de ganho em [destaque] e os demais cartões em neutro". Os demais cartões não estão em neutro: cada um carrega um ponto da cor do destaque. O README e o `notes` dizem que a folha "acende em chart-1", mas o `--chart-1` está aceso nos cinco cartões.

**O que mudar.**

1. No `DriverCard`, o marcador passa a depender de `highlight`: `bg-chart-1` só no cartão da alavanca e um neutro nos outros quatro. O neutro indicado é `--text-muted` (17.2, "Neutro de dado, sem valor escrito", 5,21:1 no escuro e 5,37:1 no claro contra o cartão, então passa sozinho dos 3:1). `--line-strong` não serve, porque o marcador fica sobre o trilho de `--line-strong` e sumiria nele.
2. Manter no cartão destacado a borda, o valor e o marcador em `--chart-1`, mais o rótulo em 600 e a anotação, que são os outros dois canais da COR-2.
3. Ajustar a frase do README (seção Versões) e do `notes`, que hoje dizem que a folha "acende em chart-1", para dizer também que os demais marcadores ficam em neutro.
4. Renderizar de novo com `--tema ambos`, conferir os dois PNGs (o ponto neutro precisa continuar visível sobre o trilho nos dois temas) e rodar o `check`.

**Nada mais reprova na `v2`.** Os operadores fecham exatamente (42 × R$ 200 mil = R$ 8,4 mi; 350 × 12% = 42). As faixas dos pais conferem com a quadratura declarada (37,4% e 47,0%). A anotação de R$ 700,0 mil por ponto confere (R$ 8,4 mi × 0,01 / 0,12). A frase acessível tem 190 caracteres e começa pelo tipo. Os conectores em `--text-muted` passam a ACE-6, e nada é cortado ou sobreposto nos dois temas. Dá para aproveitar a mesma rodada para alinhar o que está no README: `tabular-nums` na anotação, "ponto de taxa … de receita" e o espalhamento relativo escrito na folha.

---

## v3_da-receita-a-capacidade-de-pre-vendas: aprovada

Sem bloqueante. Os quatro operadores fecham, e as faixas encadeadas também, com o arredondamento declarado no `data.ts`. "292 entradas por mês" é 3.500 dividido por 12, e "122% do teto de 240 por mês" é 291,7 dividido por 240. O estouro leva ícone, palavra e a base na mesma linha, e cada taxa traz o par volume. O que ficou registrado como observação no README: o período anual aparece só na frase acessível (DAD-9), o rodapé diz "fictício", a frase acessível tem a redação invertida, o rótulo quebra em "Pré-" e "vendas", o selo do operador fica a 4 px do cartão e as notas não têm `tabular-nums`.

## v4_ticket-de-produto-novo-como-premissa: aprovada

Sem bloqueante. O nó de lacuna escreve `formatUnavailable()` com `Unplug` em `--text-muted`, tem contorno tracejado no par aprovado e não inventa centro nem microbarra. O fechamento ignora o filho sem medição em vez de tratá-lo como fator neutro. A faixa de R$ 290 mil a R$ 3,31 mi confere com a quadratura de 50% e 160% (167,6%). O aviso herdado tem ícone e palavra. O que ficou registrado como observação no README: a frase acessível tem um ramo latente que afirma a herança sem premissa, a aresta tracejada não tem legenda, o âmbar se repete entre o aviso e PREMISSA, e o rodapé fica longe do cartão da raiz.
