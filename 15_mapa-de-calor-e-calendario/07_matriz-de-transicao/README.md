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

- `v1_movimentos-entre-etapas-no-trimestre`: seis etapas mais Ganha e Perdida, contagem de
  movimentos, diagonal fora da escala e retrocessos contornados.
- `v2_retrocessos-em-destaque`: duas escalas com domínio próprio, avanço na rampa sequencial e
  retrocesso numa rampa composta de `--negative`, percentual da linha na célula e o total na margem.
- `v3_motivo-de-perda-sugerido-contra-revisado`: a mesma matriz como matriz de confusão, com o acerto
  em cor chapada fora da escala, normalização por propriedade, painel de precisão e revocação por
  classe e o caso de divisão por zero tratado como ausência.
- `v4_diagonal-dominante-e-estagio-extinto`: permanência dominante, etapa sem movimento nenhum, linha
  de base pequena fora da escala e estágio extinto hachurado com a data da mudança de processo.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/StageTransitionMatrix/`.
2. `STAGES` precisa estar na ordem do funil: a leitura de avanço e retrocesso é posicional, e uma
   ordem alfabética transforma a diagonal em ruído.
3. A contagem é de **movimentos**, não de oportunidades. Se o seletor da página entregar oportunidade
   distinta, o título do visual precisa dizer isso, senão a soma da linha não bate com o funil.
4. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
5. Com mais de oito colunas, o número de 12 px deixa de caber em `CELL_W`: reduza para percentual da
   linha ou suba o canvas.
6. Da `v2` em diante o `viewBox` do `<svg>` é do tamanho do corpo medido, e legenda e rodapé são
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
