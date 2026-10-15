# Matriz de transição, de-para e confusão

## O que é

A mesma lista de estados nos dois eixos: na linha, de onde saiu; na coluna, para onde foi. A cor e o
número dizem quanto. Quando a lista tem ordem natural, como as etapas de um funil, a geometria vira
leitura: acima da diagonal são avanços, abaixo são retrocessos, e a diagonal é quem não saiu do
lugar. É o formato que responde "de quem estava em proposta, para onde foi" sem esconder a volta.

## Quando usar

- Fluxo entre estados de um mesmo processo: etapas de funil, status de ticket, faixas de rating.
- Quando o retrocesso importa: é o que o Sankey, sempre desenhado para a frente, dissolve.
- Matriz de confusão de um classificador: rótulo sugerido contra rótulo revisado.
- Comparar o de-para entre dois períodos, com duas matrizes lado a lado na mesma escala.

## Quando evitar

- Quando o volume do fluxo é a pergunta principal, e não o par de estados: aí é Sankey, família 11.
- Listas diferentes nos dois eixos sem ordem comum: aí é matriz categórica, modelo 02 desta família.
- Mais de umas 12 etapas: a matriz vira 144 células e nenhuma cabe com número.
- Processo sem estado discreto estável, em que o "de-para" é interpretação e não registro.

## Anatomia

1. **Rótulos de linha e coluna** com a mesma lista, na ordem do processo, nunca alfabética. Toda
   linha e toda coluna se nomeiam, inclusive a que só existe no histórico (GEO-13).
2. **Diagonal fora do domínio da cor**, em `--surface-sunken` com o valor escrito, ou em cor
   semântica chapada quando ela é acerto e não permanência. A diagonal é quase sempre o maior número
   da linha; deixá-la na escala achata todo o resto. `--surface-overlay` é proibido aqui pela TOK-1.
3. **Células de movimento** na rampa sequencial, com o número escrito em todas. Os degraus legíveis
   são `--seq-1` a `--seq-3`, com `--text-primary`, e `--seq-6` e `--seq-7`, com o texto vazado em
   `--surface-raised`; `--seq-4` e `--seq-5` não aceitam texto nenhum.
4. **Corte de degrau por quantil do observado**, com o teto de cada degrau escrito na legenda. Corte
   linear sobre o máximo concentra quase tudo no primeiro degrau quando a distribuição é torta.
5. **Metade de baixo com escala própria** quando o retrocesso é o assunto: duas legendas, dois
   domínios, e o retrocesso marcado também por posição e por marcador desenhado, nunca só pela cor.
6. **Coluna terminal ou de histórico** separada por vão maior e uma divisória, porque Ganha, Perdida
   e o estágio extinto não abrem linha própria.
7. **Margem com a base de cada linha**, que é o que permite desconfiar de um percentual de linha.
8. **Zero medido desenha a marca e escreve o zero**; ausência de base devolve `null` no cálculo e sai
   escrita, nunca como faixa fraca da rampa.
9. **Legenda**, com a escala, o que a diagonal significa e o que cada tratamento fora da escala é.

## Versões

- `v1_movimentos-entre-etapas-no-trimestre`: seis etapas mais Ganha e Perdida e a linha Nova no
  trimestre, contagem de oportunidades entre duas fotos (cada uma numa célula só), diagonal fora da
  escala com contorno, retrocessos contornados, dica com o percentual da linha e volume, e os cinco
  totais (permaneceram, avançaram, regrediram, entraram, saíram) somando o universo.
- `v2_retrocessos-em-destaque`: duas escalas com domínio próprio, avanço na rampa sequencial e
  retrocesso numa rampa composta de `--negative`, percentual da linha na célula e o total na margem.
- `v3_motivo-de-perda-sugerido-contra-revisado`: a mesma matriz como matriz de confusão, com o acerto
  em cor chapada fora da escala, seletor de normalização de verdade (botões com `aria-pressed`, modo
  inicial pela prop `mode`, percentual inteiro pelo maior resto), painel de precisão e revocação por
  classe com o volume junto da taxa e o caso de divisão por zero tratado como ausência.
- `v4_diagonal-dominante-e-estagio-extinto`: permanência dominante, etapa sem movimento nenhum, linha
  de base pequena fora da escala e estágio extinto hachurado com a data da mudança de processo.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/StageTransitionMatrix/`.
2. `STAGES` precisa estar na ordem do funil: a leitura de avanço e retrocesso é posicional, e uma
   ordem alfabética transforma a diagonal em ruído.
3. Na `v2` e na `v4` a contagem é de **movimentos**, não de oportunidades (a `v1` e a `v3` contam
   oportunidades, cada uma numa célula só). Se o seletor da página entregar oportunidade
   distinta, o título do visual precisa dizer isso, senão a soma da linha não bate com o funil.
4. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
5. Com mais de oito colunas, o número de 12 px deixa de caber em `CELL_W`: reduza para percentual da
   linha ou suba o canvas.
6. O `viewBox` do `<svg>` é do tamanho do corpo medido, e legenda e rodapé são
   desenhados dentro do mesmo `<svg>`. Isso não é capricho: `<svg>` esticado encolhe o texto e o
   piso de 11 px passa a valer só no papel, e um bloco HTML irmão encolhe a caixa contra a qual a
   escala é medida. Ao colar numa caixa de outro tamanho, mude o `viewBox` junto.
7. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Referências

- Catálogo: [From Data to Viz, heatmap](https://www.data-to-viz.com/graph/heatmap.html): observar o uso de heatmap para matriz de adjacência e os erros de ordenação.
- Catálogo: [seaborn, confusion matrix](https://seaborn.pydata.org/examples/index.html): observar a anotação de valor em cada célula e o tratamento da diagonal.
- Praticante: [Stephen Few, Heatmaps: to bin or not to bin?](https://www.perceptualedge.com/articles/visual_business_intelligence/heatmaps_to_bin_or_not.pdf): observar as tarefas de leitura que a matriz precisa suportar.
- Método: [scikit-learn, Matthews correlation coefficient](https://scikit-learn.org/stable/modules/model_evaluation.html): observar a forma multiclasse do coeficiente e o caso degenerado de dispersão nula, que é o que a `v3` devolve como ausência.
- Pedido de superfície, para a seção 6 do contrato: um par de tokens de rampa divergente. A `v2`
  compõe a metade de baixo por `color-mix` a partir de `--negative` porque o Farol não tem rampa
  divergente, e o caminho da opacidade está fechado pela ACE-5, que mede piso de 0,66 nessa cor.

## Pendências conhecidas

- v1, `_render/scripts/lib/divida-guardas.json`: as chaves TAMANHO-TEXTO e AGREGACAO-ZERO da v1 não acusam mais nada e precisam ser apagadas por quem edita a dívida (o corretor não pode).
- v1, Anatomia 4: a rampa ainda corta em fatias lineares do máximo, e a legenda escreve só 1 e 182, sem o teto de cada degrau; falta o corte por quantil com o teto escrito.
- v1, dica: o percentual da linha aparece com o mouse sobre a célula e como leitura padrão da maior célula; falta equivalente por teclado.

## Observações da revisão (não bloqueantes)

**2026-10-15, revisor independente, v1 (revisão desatualizada) e primeira passada da v2, da v3 e da
v4.** As quatro foram reprovadas, e os bloqueantes estão em
`validation/revisao_15_mapa-de-calor-e-calendario__07_matriz-de-transicao_2026-10-15.md`. O que segue
não reprova.

- v1: a rampa corta em fatias lineares do máximo e a legenda escreve só 1 e 182, sem o teto de cada degrau, o que o item 4 da Anatomia pede. Com o número escrito em toda célula, a cor é segundo canal.
- v1: "60 contra 540 avanços" conta só o caminho entre etapas; os 45 movimentos para Ganha ficam fora e a legenda não diz.
- v1: o `notes` ainda descreve uma v2 que trocaria a rampa por divergente e tiraria o contorno; a v2 em disco faz outra coisa (rampa de `--negative` por `color-mix`).
- v1 e v2: o subtítulo pergunta por oportunidades e o dado conta movimentos (a mesma oportunidade conta duas vezes).
- v2: "quantas voltaram de proposta" não está escrito; a tela dá 14%, 6% e 9% e a base 148, e a conta (44 de 148) fica com quem lê. Uma contagem de retrocesso na margem de cada linha responde direto.
- v2: o comentário do `data.ts` diz que a linha Contrato tem base pequena; ela tem 109 movimentos, mais que Negociação (92). O caso difícil prometido não está no dado (DAD-10).
- v2: linha com total zero escreve `formatUnavailable()` nas células e 0 na margem; é vazio, não indisponível (ramo fora do preview).
- v2, v3 e v4: a coluna de totais está centrada, e não alinhada à direita (TIP-6): 92, 0 e 12 saem fora da coluna dos números de três algarismos.
- v2 e v4: a divisória antes da coluna de totais cai exatamente na borda direita da última coluna de células (x = 566 na v2, 476 na v4) e se lê como contorno da célula.
- v3: os rótulos do seletor dizem "por linha" e "por coluna", sem o "(revocação)" e o "(precisão)" do catálogo.
- v3: em bruto, a linha Fora de hora tem contagens medidas de zero e escreve "indisponível"; "sem caso revisado" separa vazio de indisponível. O ícone `Unplug` da EST-2 pode ir como `<path>` direto, sem `<svg>` aninhado.
- v3: "revisado" fica na mesma linha de base dos nomes de coluna e lê como o primeiro cabeçalho de coluna.
- v4: o zero medido das linhas com base vai para `--seq-1`, junto de 1 a 3; a v1 usa neutro e a v2 contorno vazado. Honesto pela legenda "até 3", mas são três tratamentos de zero no mesmo modelo.
- v4: a coluna Triagem encosta nas etapas vivas com o vão comum de 2 px; o item 6 da Anatomia pede vão maior e divisória.
- v4: os 82% de permanência, que são o assunto do caso de uso, só existem na frase acessível.

**2026-10-15, revisor independente, segunda passada das quatro versões (revisão desatualizada).** As
quatro foram aprovadas. Do parágrafo anterior, três itens caíram no arquivo de hoje: os rótulos do
seletor da v3 trazem revocação e precisão, a v1 conta oportunidades e escreve os cinco totais em
separado, e o `notes` da v1 não descreve mais outra v2. Os demais seguem valendo. O que segue é novo e
não reprova.

- v1: a linha Nova exclui quem entrou e fechou no trimestre (comentário do `data.ts`), e na tela os dois zeros de Nova para Ganha e Perdida leem como "zero medido" sem o recorte escrito; ou o dado ganha esses casos, ou o rodapé diz que "entraram" conta só quem estava aberto em 14/09/2026.
- v1: a amostra de "avançaram (acima)" é o degrau `--seq-3` da rampa, que também pinta a linha Nova e as colunas Ganha e Perdida; o avanço se identifica só pela posição, e a amostra sugere uma cor de categoria que não existe.
- v1: o subtítulo, que é o `useCase` do catálogo, escreve 2026-06-30 e 2026-09-14, e o corpo escreve 30/06/2026 e 14/09/2026 (NUM-7).
- v1: o cabeçalho "para: etapa em 14/09/2026" sai sem `tabular-nums` (TIP-1), sem consequência visível.
- v2 e v4: no tema claro, `--surface-sunken` da diagonal mede cerca de 1,05:1 contra `--seq-1` (234, 239, 247 contra 220, 236, 242 no preview claro): a diagonal e o primeiro degrau parecem a mesma cor, e as amostras "ficou na etapa" e "até 3%" (v2) ou "até 4" (v4) se confundem. A posição e o número seguram a leitura; o contorno da diagonal da v1 resolveria.
- v2 e v4: a coluna "movimentos" inclui a permanência (v2: 143 dos 337 de Descoberta; v4: 420 dos 495 de Contato), e a v4 usa "movimento" na legenda da rampa no sentido de deslocamento. Uma frase no rodapé dizendo que a contagem inclui quem ficou tira a dúvida.
- v3 e v4: o nome da linha e a diagonal saem por índice (`REASONS[rowIndex]`, `STAGES[rowIndex]`, `column === rowIndex`), e não pela chave `actual` ou `from`: um dado fora da ordem do dicionário troca o nome da linha sem aviso. A v1 e a v2 já casam pela chave.
- v3: nos modos por coluna e total, a linha Fora de hora continua hachurada e escrita "indisponível", embora ali o percentual exista e valha 0% (por exemplo, 0 dos 551 sugeridos como Sem fit). É um ramo fora do preview.
- v3: a divisória antes de "revisadas" cai na borda direita da última coluna de células (x = 562), o mesmo caso já anotado para a v2 e a v4.
