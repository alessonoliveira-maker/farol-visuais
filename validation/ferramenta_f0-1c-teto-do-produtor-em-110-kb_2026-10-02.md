# Ferramenta: F0.1c, teto do dossiê do produtor em 110 KB, com prova que reprova (2026-10-02)

**Aceite atendido.** O teto do produtor passou de 100 para 110 KB, o `selftest` reprova acima dele e o
catálogo inteiro sai sem nenhum aviso de teto. Nenhuma seção cortada, composição dos papéis intacta. Sem
commit.

## O que mudou
- **A constante:** `TETO_DO_PRODUTOR = 110 * 1024`. O comentário diz o que ele é (guarda contra crescimento
  calado, não meta de tamanho), de onde saiu o número (a medição do catálogo) e o peso em cada lugar: avisa
  no `npm run dossie`, reprova no `selftest`. Saiu o parágrafo de pendência do F0.1b.
- **A ponta:** `dossie.mjs` só tinha o número no comentário do cabeçalho; o texto do aviso já lia a
  constante. O comportamento não mudou: avisa, grava, código de saída igual.
- **A prova:** a linha que só imprimia o tamanho virou prova. O tamanho segue impresso, sem o prefixo `ok`,
  para a folga ficar à vista a cada rodada.

## Arquivos e linhas
- `_render/scripts/lib/dossie.mjs`: 98 a 100 (comentário das partes enxutas), 105 a 119 (teto).
- `_render/scripts/dossie.mjs`: 11 e 12 (cabeçalho), 80 e 81 (comentário do aviso).
- `_render/scripts/selftest.mjs`: 2078 a 2100.

## Provas (5 a mais, nenhuma retirada)
- **Acusa:** "produtor inflado de propósito acima do teto é acusado". O dossiê é o de `16/05`, montado pelo
  caminho real (`montarDossie`), com a seção "Antes de entregar" da origem engordada na medida da folga mais
  1 KB; a medida sai da folga do dia, não de número fixo. Uma prova ao lado confere que o enchimento chegou
  inteiro ao dossiê, para a acusação não passar por outro motivo.
- **Passa:** "o dossiê do produtor do modelo de prova cabe no teto", com o dossiê de verdade de `16/05`.
- **Novas de apoio:** "o teto do produtor é o que o dono decidiu, 110 KB" e "um byte acima do teto do
  produtor já é aviso".
- **Reescrita:** "produtor acima do teto recebe aviso com os dois tamanhos" fixava `101,0 KB contra 100,0
  KB` a partir da constante e quebraria a cada mudança de teto; agora prova a redação com teto explícito.

## Medições
- `selftest`: 581 provas, verde, antes; **586 provas, verde**, depois (dossiê: 400 para 405).
- **Contrafactual da prova que reprova:** com as provas novas escritas e a constante ainda em 100 KB, o
  `selftest` saiu com código 1 e duas falhas, as duas esperadas: o valor do teto (esperado 112640, medido
  102400) e "cabe no teto" (100,5 KB contra 100,0 KB). A prova do inflado já acusava. Trocada a constante,
  verde.
- **Catálogo inteiro, papel produtor** (27 famílias, 205 modelos, `npm run dossie` com as famílias como
  alvo): **0 avisos de teto**, 0 alvos com falha. Menor: `05_areas/10_area-bump`, 91.053 B (88,9 KB).
  Maior: `24_microvisuais-sparklines/01_sparkline-de-linha`, 108.628 B (106,1 KB), a 4.012 B do teto.
  Média 95,6 KB. Os 47 modelos acima de 100 KB seguem sendo 47, agora todos dentro do teto.
- `16/05`: produtor 100,5 KB (102.909 B), sem aviso, 9.731 B de folga; revisor 49,1 KB (50.271 B), igual.
- `check -- . --sem-tipos`: não rodado. O item não toca guarda nem contrato que o `check` cobra, e
  `check.mjs` não importa `lib/dossie.mjs`. O último número medido é o do F0.1b: 0 erros, 1371 avisos.

## Decisões além do texto do item, para confirmar ou desfazer
- **O valor do teto ficou fixado numa prova.** É de propósito: subir o teto para calar o aviso passa a
  exigir mexer na prova. Se o dono preferir o teto livre, é apagar uma linha (`selftest.mjs:2082`).
- **A ponta segue só avisando.** O aceite pede reprovação no `selftest`, e não no `npm run dossie`.

## Fora do escopo, visto e deixado
- **A prova que reprova olha um modelo só.** `16/05` tem 9,5 KB de folga; o maior do catálogo tem 3,9 KB.
  Um crescimento entre 4 e 9,5 KB passa verde no `selftest` e só aparece como aviso na ponta, nos modelos
  de Recharts maiores. Cobrir os 205 no `selftest` custa montar o catálogo inteiro a cada rodada; trocar o
  modelo de prova pelo maior muda as provas do F0.1b que leem `16/05`. Fica para decisão do dono.
- `.qa/dossie/` foi regravado para os 205 modelos (saída de ferramenta, fora do git).
