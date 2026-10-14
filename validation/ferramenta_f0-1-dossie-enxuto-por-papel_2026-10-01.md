# Ferramenta: F0.1, dossiê enxuto por papel (2026-10-01)

**Aceite PARCIAL.** (a), (c), (d) e (e) atendidos. (b) atendido na lista de cortes e na presença de todo
código, e **não atendido no teto de 70 KB**: o produtor de `16_distribuicao/05_histograma-comparativo`
ficou em **108,3 KB**. O portão do Lote 1 não fecha sem decisão do dono.

## O que mudou
- Flag `--papel produtor|revisor`, padrão `produtor`; valor fora da lista ou sem valor é erro antes de gravar.
  A composição de cada papel é uma lista de nomes de parte (`COMPOSICAO_POR_PAPEL`), mexível numa palavra.
- Produtor: moldura só com a linha do canvas do modelo, a linha de moldura que vale para ele e a tabela do
  passo; paleta só com as tabelas de opacidade mínima e de texto sobre marca; cada guarda com régua, onde
  olha, o que mede, piso, escape e motivos de não medição, por parágrafo inteiro e sem bloco de código;
  `agregacao.mjs` e `formato.mjs` viram caminho; `## Antes de entregar` entra por recorte literal do
  `ARMADILHAS.md` (seção ausente ou vazia é erro, não parte que some).
- Revisor: O modelo, As versões, as regras, as armadilhas e as guardas resumidas, em
  `.qa/dossie/<familia>__<modelo>.revisor.md`. O do produtor segue no nome sem sufixo, que os agentes leem.

## Arquivos e linhas
- `_render/scripts/lib/dossie.mjs`: papéis (71 a 110); `extrairAntesDeEntregar` (403 a 421); `resumirGuarda`
  e `reguaPorGuarda` (601 a 640); `montarDossie` com `papel` (1641); partes enxutas e montagem (2897 a 3045).
- `_render/scripts/dossie.mjs`: flag, validação, sufixo do arquivo e `papel` no JSON (1 a 20, 47 a 54, 73).
- `_render/scripts/selftest.mjs`: provas antigas em papel completo (1094); prova reescrita (1197 a 1202);
  seção 4f, os papéis (1601 a 1724); flag na ponta (1750 a 1761).

## Medições
| Medida | Antes | Depois |
|---|---|---|
| `selftest` | 417 provas, verde | 483 provas, verde |
| Dossiê de `16/05`, produtor | 167,5 KB | 108,3 KB |
| Dossiê de `16/05`, revisor | não existia | 49,1 KB |
| Regras e armadilhas por código, produtor | 82 de 82 e 73 de 73 | 82 de 82 e 73 de 73 |

A linha de base do item dizia 145 KB; medido hoje, antes de qualquer mudança, eram 167,5 KB. O `check`
do acervo não foi rodado: o item não toca guarda nem contrato, e `lib/dossie.mjs` só é importado por
`dossie.mjs` e `selftest.mjs` (conferido por busca).

## Por que 70 KB não sai dos cortes listados
O que o item manda manter soma **67,8 KB** antes de uma linha de moldura, paleta, guarda, formatador ou
Recharts: cabeçalho 1,7; O modelo 1,5; As versões 4,4; especificação estrutural 32,6; regras 16,4;
armadilhas 7,7; comandos 0,8; Antes de entregar 2,7. As partes cortadas ficaram em moldura 1,5, paleta
3,8 e guardas 17,6; as que o item não cita seguem em formatadores 8,7 e Recharts 8,8.
Cortes ainda possíveis sem tocar em contrato, regra ou armadilha: corpo integral de `format.ts`, 6,0 KB;
frequência de imports, 2,0 KB; guardas só em tabela, cerca de 10,5 KB (estimado). Com os três o produtor
fica perto de 90 KB; tirando formatadores e Recharts inteiros, perto de 80 KB. **Chegar a 70 KB exige
tirar ao menos 10 KB do recorte do contrato ou dos enunciados, e isso é decisão de régua.** Recorte, em
KB: §1 2,0; §2 3,5; §3 1,2; §4 1,9; §5 1,3; §6 2,5; §7 4,1; §8 1,4; §9 a §11 1,9; §12 3,2; §13 3,4;
§14 2,3; §14.1 2,7; §15 0,8.

## Decisões além do texto do item, para o dono confirmar ou desfazer
- Terceiro valor `--papel completo` (170,2 KB): o dossiê inteiro de antes, mais Antes de entregar. O que
  foi cortado só existe no gerador, e o enxuto precisa de um endereço para citar. As provas antigas da
  extração inteira passaram a rodar nesse papel.
- Prova reescrita: "as duas guardas de código trazem o leitor inteiro" afirmava como regra o que o item
  consertou; virou "a extração do papel completo ainda acha os dois leitores de guarda".
- Nenhuma prova fixa tamanho em bytes; o teto de 70 KB não tem prova, porque nasceria vermelha.

## Fora do escopo, visto e deixado
`visuais-revisor` e `visuais-corretor` leem o arquivo sem sufixo, que é o do produtor: para o revisor ler
o dele, o prompt do agente precisa pedir `--papel revisor`. `STATUS.md` e `PLAN.md` citam 145 KB como
tamanho atual. `MARCA-REAL` não tem banner em `guardas.mjs`, e o resumo dela sai do jsdoc de um ajudante.
