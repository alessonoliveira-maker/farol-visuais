# Revisão de 06_pizza/05_pizza-de-raio-variavel, 2026-10-15

**Alvo:** `v1_investimento-e-cpl-qualificado-por-plataforma`, em `revisao_desatualizada` depois do conserto da GEO-3 pedido pelo dono (o `radiusForCpl` passou de `rMin + k·√v` para `√(rMin² + (rMax² − rMin²) × v/topo)`).
**Base:** `npm run check` (0 com erro, 2 avisos), dossiê do revisor, `Chart.tsx`, `data.ts`, `meta.json`, README do modelo, os dois PNGs inteiros e um recorte ampliado 3x da região dos anéis nos dois temas, mais a geometria medida no `preview.svg`.
**Resultado:** reprovada, por um bloqueante que não tem relação com o conserto pedido. O conserto da GEO-3 está certo.

## O conserto pedido (GEO-3): confere

Medido no `preview.svg` contra o `data.ts` (rMin = 38,4 px, rMax = 120 px, topo = R$ 2.500):

| Setor | CPL | Raio desenhado | (r² − rMin²)/(rMax² − rMin²) | v/topo | Ângulo | Participação no investimento |
|---|---|---|---|---|---|---|
| Busca paga | R$ 500 | 63,7154 px | 0,20000 | 0,2 | 120,96° | 33,6% |
| Redes sociais | R$ 1.000 | 81,5153 px | 0,40000 | 0,4 | 195,84° | 54,4% |
| Rede profissional | R$ 2.500 | 120 px | 1,00000 | 1,0 | 43,20° | 12,0% |

A coroa acima do piso soma 12,5%, 25,0% e 62,5%, as mesmas participações do CPL, na quarta casa. Os anéis saem da mesma função: R$ 500 a 63,7154 px, exatamente a borda de Busca paga; R$ 1,5 mil a 96,0720 px; R$ 2,5 mil a 120 px, exatamente a borda de Rede profissional. Com a forma antiga os raios seriam 74,9, 90,0 e 101,6 px. A RAIO-CONTRA-AREA mede a v1 e não acusa nada.

## Bloqueante

### Pergunta 12, ROT-5b (com EIX-4): a régua do raio é uma constante escrita à mão, mas o domínio do raio vem do dado

**Evidência no código.** `Chart.tsx:32` declara `RING_VALUES = [500, 1_500, 2_500] as const`. Em `:176` o `.map` passa cada degrau por `radiusForCpl(ringValue, cplMax)` até o `r` do `<circle>`, e a nota "Anéis em …" de `:217` sai da mesma constante. Já o domínio do raio é `[0, cplMax]`, com `cplMax` calculado por `reduce` em `:91`; nada o declara fixo. A ROT-5b é literal: "o último degrau dela é o maior valor **observado**, calculado do dado, nunca uma constante escrita à mão". A EIX-4 pede `domain` e `ticks` calculados no componente. No dado do catálogo o último anel coincide com o máximo (2.500), e é só por isso que o preview sai certo.

**Consequência, simulada com a própria `radiusForCpl`** (caixa de 260 px, centro em 130, coluna da legenda a partir de x 284):

* Maior CPL de R$ 1.000: os anéis ficam em 89,1, 144,4 e 183,8 px. Dois deles saem da caixa (o SVG é `overflow-visible`), e o rótulo "R$ 2,5 mil" fica centrado em x 286, em cima da coluna da legenda.
* Maior CPL de R$ 1.800: o anel de fora fica em 139,4 px e passa 9,4 px acima da caixa, cruzando a linha de leitura, que está 8 px acima.
* Maior CPL de R$ 4.000: o último anel fica em 97,7 px, e o setor mais caro, desenhado em 120 px, fica sem referência. É o defeito que a ROT-5b descreve.

Esta é a peça que o catálogo usa para demonstrar os "anéis de escala com rótulo em R$", e o passo 2 do "Como colar no Farol" manda trocar o dado. Com qualquer mês real a régua mente sobre o raio ou invade a legenda. A irmã v4 já faz a forma certa: `scaleTop = Math.max(...medidos)`, em `v4/Chart.tsx:148`.

**O que mudar.** Monte a lista dos anéis a partir de `cplMax`: as referências redondas intermediárias ficam numa constante e são filtradas abaixo do máximo, com uma distância radial mínima declarada para dois anéis não lerem como um, e o último degrau é o próprio `cplMax`. A nota "Anéis em …" e os rótulos devem sair dessa mesma lista, e os anéis continuam passando por `radiusForCpl`. Os ângulos de `RING_ANGLES` foram afinados para os raios de hoje, então confira os três rótulos nos dois temas depois da troca. O preview do catálogo não muda, porque o máximo já é 2.500. Para ver a lógica funcionar, teste localmente com `cplMax` de 1.000 e de 4.000, sem gravar no `data.ts`. Atualize também o item 3 da Anatomia do README, dizendo que o último anel é o maior CPL observado.

**Por que a guarda não pegou.** A REGUA-CONSTANTE exclui anéis com `fill="none"`, tratados como tique de eixo polar, sob a premissa de que "ali a constante está certa, porque o domínio é declarado" (comentário de `parametroAlimentaTamanho` em `_render/scripts/lib/regua.mjs`). Aqui o domínio não é declarado, então o check sai verde sem ter julgado a régua.

## Conferido e em ordem

* Pergunta 6 e 27 (COR-4, NUM-2, ROT-10): três partes coloridas; 34, 54 e 12 somam 100 pelo maior resto (33,6 vai a 34). Cada parte tem nome e número na legenda, sem interação.
* Pergunta 9 e 11 (COR-3, COR-8): a cor vem de `SLOT_COLORS[row.slot]`, nos slots 1, 3 e 6, na sequência da legenda, da dica e do setor. Nenhum `--chart-2` ou `--chart-4`.
* Pergunta 13 e 31 (ROT-7, GEO-4): os três rótulos dos anéis têm halo e se leem nos dois temas no recorte ampliado. "R$ 500" atravessa a junção dos setores de Busca paga e Rede profissional, que são áreas cheias de mais de 18 px, e o topo do halo para a cerca de 2,9 px do arco de Busca paga no eixo vertical. O halo interrompe só o tracejado dos anéis de referência, que é o tratamento que a ROT-7 pede para linha de referência.
* Pergunta 14 (NUM-1, NUM-5, NUM-6): todos os valores passam por `formatCurrencyCompact` e `formatPercent(…, 0)`; o "total" está dito na linha de leitura e a unidade aparece em todos os textos.
* Pergunta 16 (EST-1): o vazio é um bloco `role="status"` com `Filter` de 16 px e frase de 12 px em `--text-muted`.
* Pergunta 19 (ACE-1): a frase tem 237 caracteres, começa por "Gráfico de pizza de raio variável" e diz a conclusão. A FORMATO-ACESSIVEL não acusa nada.
* Pergunta 20 (ACE-3): a CONTRASTE-TEXTO, a CONTRASTE-MARCA e a TEXTO-NA-MARCA medem os dois temas sem acusar nada.
* Perguntas 21 a 26: check com 0 erros; PNGs mais novos que o `Chart.tsx`; `<Chart />` com `data` opcional e raiz `h-full w-full min-w-0` nos dois ramos; dado fictício, com nome longo e fatia de 12% como caso difícil; as quatro versões estão no disco.
* Não se aplica: 28, 29, 30 e 32.

## Não bloqueante, barato de levar junto

Os pontos estão no README do modelo, no parágrafo de 2026-10-15. O primeiro mexe no mesmo trecho da nota do raio que o bloqueante obriga a reescrever, então custa pouco resolver junto. A nota passaria a dizer que anel maior é lead mais caro (o "Quando evitar" do próprio README pede esse aviso escrito; a observação vem de 2026-09-19), perderia a divisória `border-t` (ESP-5) e ganharia `tabular-nums` (TIP-1).

O check também avisa que `_render/scripts/lib/divida-guardas.json` ainda guarda a chave `RAIO-CONTRA-AREA` desta versão, que não acusa mais. Quem consertou deve apagar a chave; não é bloqueante e não é arquivo do revisor.

## Registro

```
Versão: 06_pizza/05_pizza-de-raio-variavel/v1_investimento-e-cpl-qualificado-por-plataforma
Data: 2026-10-15
Resultado: reprovada
Não: 12
Correções:
  12. ROT-5b: montar os anéis a partir do maior CPL observado (referências redondas abaixo dele mais o próprio cplMax), em vez de RING_VALUES fixo.
Não se aplica: 28, 29, 30, 32
```
