# Ferramenta: F0.2, carimbo da biblioteca compartilhada (2026-10-01)

**Aceite atendido.** O render grava `data-farol-lib`; o `check` avisa `preview desatualizado (biblioteca)`
quando o carimbo difere do atual; preview sem o atributo fica calado; o acervo saiu idêntico.

## O que mudou
- `libHash()`: sha256 de `format.ts`, `utils.ts`, `chartTheme.ts`, `ChartTooltip.tsx` e `chartAria.ts`, com
  fim de linha normalizado, no modelo do `tokensHash`. Fora do `sourceHash`, e o `RENDERER_VERSION` não
  mudou: nenhum carimbo de origem do acervo se moveu.
- O render lê o carimbo uma vez, antes de empacotar, e grava o atributo antes da frase da raiz.
- A conferência dos carimbos saiu de `checkVersion` para `checkPreviewStamps`, exportada. Origem diferente
  segue erro; tokens e biblioteca são avisos independentes entre si; atributo ausente não acusa.
- CONTRATO seção 13: a linha dos carimbos virou tabela com o peso de cada um e a evidência medida.

## Arquivos e linhas
- `_render/scripts/lib/meta.mjs`: `LIB_FILES` (150), `libHash` (169), `readPreviewStamps` com `lib` (182).
- `_render/scripts/lib/contract.mjs`: import (29), `checkPreviewStamps` (319 a 365), chamada (390).
- `_render/scripts/render.mjs`: import (24), `assembleSvg` (82 a 91), `renderOne` (125, 161), leitura única (282, 304).
- `_render/scripts/selftest.mjs`: cabeçalho (14), import (33), provas (1011 a 1195), `main` (1967).
- `CONTRATO.md`: seção 13, linhas 379 a 388.

## Medições
| Medida | Antes | Depois |
|---|---|---|
| `selftest` | 483 provas em 8 grupos, verde | 507 provas em 10 grupos, verde |
| `check -- . --sem-tipos`, 491 versões | 0 erros, 389 avisos | 0 erros, 389 avisos |
| Relatório `--json` do acervo | referência | idêntico byte a byte |
| Avisos de biblioteca no acervo | não existia | 0 |
| Dossiê do produtor de `16/05` | 108,3 KB (nota do F0.1) | 109,6 KB |

Contrafactual das provas, duas mutações numa execução só, depois desfeitas (conferido por `cmp`): sem a
guarda de ausência caem as 3 provas do preview sem atributo; sem o render passar o carimbo cai a prova do
atributo gravado (`medido AUSENTE`). As medições sabem reprovar.

## Provas novas (24; nenhuma reescrita, e a lista de arquivos é cobrada por presença, sem contagem)
- Acusa: `ACUSA: o mesmo preview, depois que o formatador mudou, sai como AVISO e não como erro`, mais a
  do carimbo e a do `check` de ponta a ponta. Passa: `PASSA: preview com o carimbo da biblioteca atual` e
  `PASSA: preview SEM o atributo, anterior à emenda, não acusa`, mais as duas de ponta a ponta.
- Bordas: CRLF não muda o carimbo; todo arquivo da lista pesa; tokens e biblioteca velhos dão dois avisos;
  origem velha segue erro; o render de verdade grava o carimbo (molde copiado para `.tmp`, com navegador).

## O que o dono precisa saber antes do F0.5
1. **Zero aviso hoje quer dizer zero preview medido, e não zero afetado.** Os 982 previews do acervo são
   anteriores à emenda e não têm o atributo. Se o F0.5 mexer em `format.ts` agora, o `check` lista 0
   previews com aviso de biblioteca, e esse 0 lê como "ninguém foi alcançado". Para o número do aceite do
   F0.5 ter sentido, o acervo precisa ser renderizado (carimbado) **antes** da mudança. Não renderizei: o
   item não pede, e são 491 versões nos dois temas.
2. **`valueFormat.ts` está fora do carimbo e dentro dos imports permitidos.** Seis versões importam
   `@/components/visuals/valueFormat` direto, e `ChartTooltip.tsx` (147 versões) depende dele: mexer nele
   passa sem aviso. `format.ts` também importa `@/data/constants` e `@/lib/dates`, fora da lista. Mantive
   os cinco arquivos do aceite. Incluir é uma linha em `LIB_FILES`, mas muda o carimbo de todo preview já
   carimbado: é mais barato decidir antes do render do ponto 1.
3. `chartAria.ts` está no carimbo e nenhuma versão o importa (0 de 491, e ele não está nos imports
   permitidos): editá-lo avisa o acervo carimbado inteiro sem mudar desenho algum.

## Fora do escopo, visto e deixado
- A galeria (`galeria.mjs`) não mostra o estado da biblioteca; só origem e tokens.
- O §13 cresceu 1,3 KB no dossiê do produtor, contra o teto pendente de 70 KB do F0.1.
- `guardasTest` deixa seis pastas por execução em `_render/.tmp` (395 entradas hoje). Defeito anterior.
- `sourceHash` e `tokensHash` seguem lidos depois do empacotamento; só o da biblioteca é lido antes.
