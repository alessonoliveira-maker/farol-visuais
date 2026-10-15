# Nota de ferramenta: F0.8 a F0.11, coerência da ferramenta depois do fechamento (2026-10-15)

Executado na sessão orquestradora por delegação do dono ("você pode escolher como resolver"), não por agente `visuais-ferramenta`, porque as quatro mudanças são pequenas e de coerência; o protocolo de prova foi o do agente: `selftest` verde antes e depois, `check -- . --sem-tipos` do acervo antes e depois, contrafactual medido antes de qualquer régua nova.

## Medições

| Medida | Antes | Depois |
|---|---|---|
| `selftest` | 10 de 10 blocos, 658 provas | 11 de 11 blocos, 665 provas (bloco do lint com 7) |
| `check -- . --sem-tipos` | 0 erros, 436 avisos, 17 escapes | 0 erros, 426 avisos, 17 escapes |
| `RAIO-CONTRA-AREA` medida | 43 de 814 (só no `check`) | 43 de 814 (no `check` e no `pendencias`) |
| `pendencias --sem-tipos` | 784 prontas, 30 `revisao_reprovada` | 784 prontas, 30 `revisao_reprovada` |
| Fila de dívida | 92 peças | 84 peças (10 chaves quitadas removidas, 8 linhas inteiras) |
| Galeria | 817 cartões sem veredito | 817 cartões; 784 `aprovada`, 30 `reprovada, pendência conhecida` |
| Lint do Farol no acervo (medição única, eslint 10.9.1 e typescript-eslint 8.69.0 do `app/`) | não existia | 181 de 814 versões com erro; 264 erros; 0 avisos; 12 regras |

## F0.8 `RAIO-CONTRA-AREA` em `checkVersion`

- `lib/contract.mjs`: importa `guardaRaioContraArea`; chama a guarda depois da `TEXTO-NA-MARCA` com os mesmos argumentos das irmãs; devolve `are` com a medição.
- `check.mjs`: saiu o invólucro `comRaioContraArea` e o import de `guardas.mjs`; `results` vem direto de `checkVersion`. O comentário do topo registra o período em que a guarda ficou por fora (F0.4, 2026-10-02, por escopo).
- `lib/divida.mjs`: `GUARDAS_COM_FILA` passa a listar as nove guardas que chamam `repartirPelaFila` (faltavam `TAMANHO-TEXTO` e `RAIO-CONTRA-AREA`), na ordem dos blocos de `guardas.mjs`, que é como a prova "as guardas com fila de dívida são as declaradas em divida.mjs" compara.
- Prova reescrita: nenhuma. As três provas de ponta a ponta do F0.4 ("o check chama a RAIO-CONTRA-AREA…") continuam passando porque o `check` segue devolvendo `are`.

## F0.9 Chaves quitadas

Removidas por script, por chave e não por linha, as dez que o `check` acusava com "está na fila de dívida … e não acusa mais nenhuma": `09_dispersao-e-bolhas/03_bolhas/v1` OPACIDADE-MARCA (a linha fica, com EIXO-CALMO 2); `10_funil/06/v4`, `15/03/v1`, `15/05/v1`, `16/02/v1` AGREGACAO-ZERO; `14_tabelas-visuais/08/v2` EIXO-CALMO; `15/04/v1` TAMANHO-TEXTO; `15/07/v1` TAMANHO-TEXTO e AGREGACAO-ZERO; `16/03/v1` OPACIDADE-MARCA. Nenhuma chave ainda devida foi tocada; o acervo seguiu em 0 erros e perdeu exatamente 10 avisos.

## F0.10 Galeria com veredito

`galeria.mjs` importa `fingerprint`, `readReviews` e `reviewProblem` de `lib/revisao.mjs` e calcula o estado da revisão por versão, com cache por modelo. O selo entra no `<p class="rotulo">` antes do estado do preview e no `data-busca`, e os moldes de `_render/exemplos` saem sem selo. CSS: `veredito-aprovado` positivo, `veredito-sem` e `veredito-velho` aviso, `veredito-reprovado` negativo sobre `--surface-sunken`.

## F0.11 `npm run lint`

- `_render/scripts/lint.mjs` (novo): `configDoFarol()` reproduz `app/eslint.config.js` com os pacotes resolvidos de `app/package.json` por `createRequire` (os ESM vêm embrulhados em `{ default }`, por isso o carregador `carregar`); programa de tipos é o `VISUAIS/tsconfig.json`; `lintarVersoes` devolve erros por versão e contagem por regra; o comando sai 1 com erro. Cerca de 7 s para um modelo de 4 versões.
- `selftest.mjs`: bloco `lintTest` com 7 provas. O fixture que acusa segue a forma exata de `01/01 v4` (`previous` de acesso por índice, cadeia dentro de `if` seguida de outra condição); medido na sessão, a regra se cala com operando `| null`, com a cadeia atribuída a variável e quando a terceira condição continua a própria cadeia (`previous.value > 0`), o que está anotado no fixture. O `tsconfig` da prova é temporário e inclui só a pasta descartável.
- `CONTRATO.md` seção 16, passo 8: aponta o comando e a armadilha do autofix.
- Contrafactual por regra: `prefer-optional-chain` 103 erros em 83 arquivos; `no-base-to-string` 53 em 47; `prefer-nullish-coalescing` 22 em 16; `no-unnecessary-type-assertion` 19 em 14; `react-hooks/immutability` 18 em 13; `array-type` 14 em 13; `non-nullable-type-assertion-style` 10 em 7; `set-state-in-effect` 7 em 4; `consistent-type-definitions` 5 em 5; `prefer-for-of` 5 em 5; `no-unsafe-assignment` 4 em 3; `prefer-function-type` 4 em 4. A medição usou um arquivo de configuração temporário em `app/`, apagado em seguida; `app/` não foi alterado.

## Fora do escopo, visto e deixado

- Pontos cegos das guardas seguem como declarados (HTML e `foreignObject` não medidos por COLISAO, CONTRASTE e TEXTO-NA-MARCA; `transform` desliga ESPESSURA e CONTRASTE-MARCA).
- F0.3 segue `[~]`: GEO-3 e GEO-18 consertadas só no ARMADILHAS, o dossiê imprime o título das armadilhas.
- `06/04 v1` tem TEXTO-NA-MARCA registrada como 3 e acusa 1; a fila não avisa dívida que diminui (retorno do F0.7, sem item).
- O teto do dossiê (110 KB, 62 B de folga em `24/01`) virou a decisão D14.
