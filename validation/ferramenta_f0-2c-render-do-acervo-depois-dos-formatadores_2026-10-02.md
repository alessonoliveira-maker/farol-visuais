# F0.2c Render do acervo depois dos formatadores

Data: 2026-10-02. Item do lote livre da Fase 0 do `PLAN.md`. Sem commit, sem conserto de versão, sem tocar em `app/`.
**Aceite atendido nos cinco pontos.** Nenhum arquivo da ferramenta nem das réguas mudou; só os 982 previews.

## O que foi feito
- 16 chamadas de `npm run render -- <família> --tema ambos`, com comparação: 982 previews, 0 com erro, 56 com aviso
  do render, 44 comparações acima de 0,50% (pior 1,62% em `14_tabelas-visuais/08/v2` claro). São os números do F0.2b.
- Arquivos alterados: 491 `preview.svg` e 491 `preview-claro.svg`, escritos só pelo render. Esta nota.

## Medições
| Medida | Antes | Depois |
|---|---|---|
| `selftest` | 586 provas, verde | 586 provas, verde |
| `check -- . --sem-tipos` | 0 erros, 1371 avisos (982 de biblioteca) | 0 erros, 390 avisos (0 de biblioteca) |
| `check -- .` com tipos | não medido | 0 com erro, 390 avisos, 0 escapes |
| Previews com `data-farol-lib` atual | 0 de 982 (`7c51a614936e74e5`) | 982 de 982 (`2fed596641a7de53`, igual ao `libHash()`) |
| `pendencias` | 308 prontas, 506 pendentes | iguais; `pendencias.json` idêntico fora hora e tempo |
| `Chart.tsx`, `data.ts`, `meta.json`, README, `BRIEFING.md` | 1625 arquivos (sha1) | 1625 de 1625 iguais |

**Os 390 contra os 389:** 1371 menos 982 dá 389; o aviso a mais é `COLISAO-TEXTO` em `08/06` v3 (`−R$ 300` a 3,98 px
de `mil`). É aviso por peso da própria guarda; nenhum erro de guarda no acervo. O resto saiu igual versão por versão.

## Método da lista (d)
Preview antigo: instantâneo dos 982 arquivos tirado antes do render, conferido igual ao commit `d3450e97` (`git diff
--name-only d3450e97` não lista preview). Byte a byte primeiro; onde o corpo ou o `<style>` mudou, pixel a pixel no Edge
a 2x, SVG sozinho antigo contra novo, tolerância 48 (a do render); controle novo contra novo: 0 pixel nos 24.
- **958 previews (479 versões):** só o atributo `data-farol-lib`. Corpo e `<style>` idênticos.
- **24 previews (12 versões):** mudaram, sempre os dois temas. Em 10 delas o `<style>` também mudou: a fonte embutida ganhou o U+2212.

## Lista completa: versão | pixels no escuro e no claro | natureza | guarda nova | veredito hoje
1. `03_colunas-verticais/05_colunas-positivo-e-negativo/v1_saldo-mensal-de-clientes` | 0,002% e 0,002% | só glifo (`-20` virou `−20` no eixo) | nenhuma | pronta
2. `03_colunas-verticais/05_colunas-positivo-e-negativo/v3_movimento-do-funil-por-sinal` | 0,003% e 0,003% | só glifo (`−60`, `−25`) | nenhuma | pronta
3. `03_colunas-verticais/05_colunas-positivo-e-negativo/v4_saldo-zero-e-mes-sem-dado` | 0,005% e 0,004% | só glifo (`−20`, `−5`) | nenhuma | pronta
4. `05_areas/07_area-de-diferenca/v1_resultado-mensal-contra-zero` | 0,044% e 0,053% | glifo e deslocamento de texto: um tique, `R$ -50 mil` virou `−R$ 50 mil`, o sinal passou para antes do símbolo; uma linha, nada mais anda | nenhuma | pronta
5. `08_combinados-e-eixo-duplo/01_coluna-com-linha/v4_meta-ausente-e-estorno` | 0,126% e 0,128% | quebra de linha: `R$ -200 mil` virou `−R$ 200` sobre `mil` (eixo de 80 px); legível, `mil` fica rente aos rótulos do eixo X | nenhuma (respiro mínimo de 19,92 para 18,14) | sem veredito
6. `08_combinados-e-eixo-duplo/05_colunas-com-linha-de-acumulado/v4_estorno-e-meta-revisada` | 0,109% e 0,110% | outra: só a posição do sinal, o U+2212 já estava; 4 tiques nos dois eixos (`R$ −200 mil` virou `−R$ 200 mil`, e `−100 mil`, `−800 mil`, `−1,6 mi`); uma linha (eixo de 84 px) | nenhuma | sem veredito
7. `08_combinados-e-eixo-duplo/06_real-contra-referencia-com-painel-de-variacao/v1_custo-realizado-contra-orcado` | 0,021% e 0,021% | glifo e deslocamento de texto: `R$ -100` sobre `mil` virou `−R$ 100` sobre `mil`; a quebra em duas linhas já existia (eixo de 58 px) | nenhuma | pronta
8. `08_combinados-e-eixo-duplo/06_real-contra-referencia-com-painel-de-variacao/v2_receita-contra-ano-anterior` | 0,141% e 0,144% | quebra de linha em 2 tiques (`−R$ 150` e `−R$ 300`, cada um sobre `mil`); legível | nenhuma (respiro de 18,95 para 10,48) | sem veredito
9. `08_combinados-e-eixo-duplo/06_real-contra-referencia-com-painel-de-variacao/v3_vertical-contra-orcamento-e-ano-anterior` | 0,222% e 0,227% | quebra de linha em 3 tiques, **com texto cortado**: no painel do meio o `mil` de `−R$ 150` sai pela borda de baixo do painel; no painel de baixo os dois tiques quebrados quase se tocam; `−R$ 75 mil` segue em uma linha | `COLISAO-TEXTO` passou a avisar (respiro de 14,98 para 3,98) | sem veredito
10. `08_combinados-e-eixo-duplo/06_real-contra-referencia-com-painel-de-variacao/v4_orcado-zero-e-troca-de-versao` | 0,087% e 0,088% | quebra de linha em 1 tique (`−R$ 750` sobre `mil`); `−R$ 1,5 mi` em uma linha; legível | nenhuma (respiro igual, 13,31) | sem veredito
11. `14_tabelas-visuais/01_tabela-com-barras-inline/v3_resultado-por-origem-com-desvio-e-mix` | 0,000% e 0,000% | outra: nenhum pixel; só a frase acessível (`aria-label` da raiz e carimbo `data-farol-ace`) trocou `R$ -41,5 mil` por `−R$ 41,5 mil`, agora igual à célula, que já escrevia o sinal à mão | nenhuma | desatualizada
12. `15_mapa-de-calor-e-calendario/08_heatmap-de-correlacao/v1_seis-medidas-de-midia` | 0,659% e 0,676% | glifo e deslocamento de texto: 5 células (`−0,57` e as demais) e o `−1,00` da legenda; o rótulo alargou de 28,34 para 30,30 px e a rampa, o `1,00` e a nota da legenda andaram 1,95 px para a direita | nenhuma | reprovada

**Resumo por natureza:** só glifo 3 (prontas); glifo e deslocamento de texto 3 (2 prontas, 1 reprovada); quebra de linha 4
(sem veredito); outra 2 (posição do sinal sem troca de glifo, sem veredito; só a frase acessível, desatualizada).
**Prontas cujo desenho mudou: 5.** Só glifo: `03/05` v1, v3, v4. Fora de "só glifo": `05/07` v1 e `08/06` v1.

## Previsões conferidas
- **F0.5c, quatro versões com tique quebrado e `check` verde: confirmado nas quatro** (`08/01` v4, `08/06` v2, v3, v4), todas
  com eixo de 80 px. As larguras da nota batem: `−R$ 75 mil`, `−R$ 1,5 mi` e `−R$ 50 mil` cabem em uma linha; `08/05` v4 (84 px)
  cabe; `08/06` v1 já estava quebrada. O que a nota não previu: em `08/06` v3 o painel do meio tem 124 px de altura com
  `overflow:hidden`, o tique de baixo está em y de 116 e a linha de base do `mil` cai em 125,4: sai cortado, e nenhuma guarda acusa.
- **F0.5, dez versões por leitura estática: as dez mudaram.** A lista cresceu em duas: `08/05` v4 e `14/01` v3.
  No desenho de hoje, 38 versões mostram U+2212 antes de número e nenhuma mostra hífen antes de dígito.

## Fora do escopo, visto e deixado
1. `08/06` v3 com `mil` cortado e `check` em 0 erros: não há guarda de texto cortado pela borda do painel nem de tique quebrado.
   Conserto é do corretor (eixo de 81 px ou mais, ou tique sem quebra); as quatro quebradas estão sem veredito e caem na revisão.
2. `05/07` v1 e `08/06` v1, prontas, mudaram a posição do sinal no próprio tique, sem quebra nova; pedir novo veredito é da sessão.
