# Ferramenta: F0.2b, ajuste do carimbo e render do acervo (2026-10-01)

**Aceite atendido nos seis pontos.** `valueFormat.ts` entrou no carimbo e `chartAria.ts` saiu; as 491 versões
foram renderizadas nos dois temas; os 982 previews carregam `data-farol-lib="7c51a614936e74e5"`, igual ao
`libHash()` atual; nenhuma fonte de versão mudou; o `check` e o `pendencias` saíram iguais a antes.

## O que mudou
- `LIB_FILES`: `format.ts`, `utils.ts`, `valueFormat.ts`, `chartTheme.ts`, `ChartTooltip.tsx`. Medido antes de
  mexer: 153 versões dependem de `valueFormat.ts` (6 direto, 147 pelo `ChartTooltip`); 0 de 491 importam `chartAria.ts`.
- CONTRATO seção 13: a linha do `data-farol-lib` nomeia a lista nova, e um parágrafo declara o critério de
  **alcance** (entra o arquivo que alguma versão alcança) com a medição. Peso do carimbo sem mudança: aviso.
- Render depois da lista, para carimbar uma vez só: 16 chamadas, uma por família com versão (17 a 27 não têm), `--tema ambos`, com comparação.
  982 previews, 0 com erro, 56 com aviso do render (44 comparações acima de 0,50%; pior 1,62% em `14_tabelas-visuais/08/v2` claro; reprova acima de 2,00%).

## Arquivos e linhas
- `_render/scripts/lib/meta.mjs`: comentário do ajuste (150 a 154), `LIB_FILES` (156 a 162). `CONTRATO.md`: seção 13, linhas 385 e 390.
- `_render/scripts/selftest.mjs`: cabeçalho da seção (1030 a 1033), lista pedida (1081 a 1083), provas do ajuste (1100 a 1128).
- 982 arquivos `preview.svg` e `preview-claro.svg`, escritos só pelo `npm run render`.

## Medições
| Medida | Antes | Depois |
|---|---|---|
| `selftest` | 507 provas em 10 grupos, verde | 511 provas em 10 grupos, verde |
| `check -- . --sem-tipos --json` | 0 erros, 389 avisos | 0 erros, 389 avisos; relatório idêntico versão a versão |
| `check -- .` (com tipos) | 0 com erro, 389 avisos | 0 com erro, 389 avisos; saída idêntica, fora o tempo |
| Avisos de biblioteca e de tokens no acervo | 0 e 0 (nenhum preview medido) | 0 e 0 (982 medidos) |
| Previews com `data-farol-lib` | 0 de 982 | 982 de 982, todos com o hash atual |
| `pendencias` | 308 prontas, 506 pendentes | 308 prontas, 506 pendentes; `pendencias.json` idêntico |
| `Chart.tsx`, `data.ts`, `meta.json`, README | 1625 arquivos (sha1) | 1625 de 1625 iguais |
| Dossiê do produtor de `16/05` | 109,6 KB (nota do F0.2) | 110,1 KB, com o texto novo conferido por `Grep` |

A diferença de avisos é zero: o render não mudou o corpo de nenhum preview e todo carimbo gravado é o atual. O zero agora é "982 medidos e em dia".

## Provas (4 novas, 1 reescrita)
- Acusa: `ACUSA: mexer só no valueFormat.ts da cópia muda o carimbo`; `ACUSA: arquivo que nenhuma versão importa sai como sem alcance`.
- Passa: `PASSA: mexer no chartAria.ts, que nenhuma versão importa, não muda o carimbo`; `PASSA: todo arquivo da lista é alcançado por alguma versão do acervo`.
- Reescrita: `a lista do carimbo traz os arquivos que o contrato nomeia`, que pedia `chartAria.ts`; agora pede `valueFormat.ts`, por presença.
  Contrafactual: com a lista antiga de volta, 5 das 25 provas do carimbo caem; arquivo restaurado e conferido por `cmp`.

## Previews em que o render mudou algo além do atributo (aceite e)
Comparação byte a byte contra um instantâneo dos 982 arquivos tirado antes do render.
- **290 previews (145 versões):** só o atributo novo.
- **692 previews (346 versões, sempre os dois temas):** além do atributo, ganharam a linha de base herdada no
  `<style>` (`lib/base-herdada.mjs`); eram anteriores a ela. Corpo, fontes embutidas e demais carimbos idênticos em todos.
  O `RENDERER_VERSION` não subiu quando a linha de base entrou, por isso o `check` nunca os acusou.
  - Modelos inteiros: famílias 01, 02, 03, 04, 05, 07, 10, 13 e 14 inteiras; 09 modelos 01 a 07; 11 modelo 03; 12 modelo 04; 16 modelo 01.
  - Só a v1: 08 modelos 01 e 03; 11 modelos 01 e 02; 12 modelos 02 e 03; 15 modelos 01 e 02; 16 modelos 02, 03 e 04.
- **14 desses previews (7 versões) passaram a DESENHAR diferente** do arquivo antigo, medido pixel a pixel no Edge,
  arquivo antigo contra novo, repetido duas vezes com controle (novo contra novo: 0). Todas têm `<button>`, o caso que a linha
  de base conserta (o botão caía em Arial 13,33 px no SVG sozinho). Pixels acima da tolerância de 48, claro e escuro nesta ordem:
  - Prontas: `07_rosca-e-radial/01_rosca-com-total-central/v2` (0,98% e 1,19%) e `v4` (0,97% e 1,14%); `15_mapa-de-calor-e-calendario/02_matriz-categorica/v1` (0,31% e 0,21%);
    `14_tabelas-visuais/06_tabela-cruzada-com-totais-marginais/v4` (0,16% e 0,15%); `01_cards-e-kpis/07_grade-e-tira-de-kpis/v2` (0,12% e 0,13%).
  - Pendentes: `07_rosca-e-radial/04_barra-radial/v2` (1,16% e 1,11%); `09_dispersao-e-bolhas/03_bolhas/v3` (0,40% e 0,28%).
  Os outros 678 desenham idênticos ao arquivo antigo. Nada foi consertado nem desfeito.

## Fora do escopo, visto e deixado
- Cinco versões **prontas** foram revisadas com um preview que desenhava o botão errado; a impressão da revisão não
  inclui o preview, então seguem prontas. O desenho novo é o mais fiel à página; decidir se pedem novo olhar é do dono.
- Os 6 previews dos moldes em `_render/exemplos` seguem sem `data-farol-lib` (o item cobre só o acervo). `format.ts` importa `@/data/constants` e `@/lib/dates`, fora do carimbo: mexer neles ainda passa calado.
- `_render/.tmp` acumula pastas do `guardasTest` (431 hoje, defeito anterior); o dossiê do produtor cresceu 0,5 KB contra o teto pendente do F0.1.
