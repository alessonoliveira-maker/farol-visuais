# Revisão de 09_dispersao-e-bolhas/04_bolhas-em-grade-categorica, 2026-10-14

Julgadas: `v2_melhor-janela-de-comparecimento`, `v3_motivo-de-perda-por-etapa` e `v4_zero-contra-sem-expediente`, as três em `sem_revisao`. `npm run check` com tipos: 0 com erro, 1 aviso (AGREGACAO-ZERO na `v1`, fora deste julgamento). PNGs de 2026-10-02, mais novos que os `Chart.tsx` de 2026-09-28.

| Versão | Resultado | Não |
|---|---|---|
| `v2_melhor-janela-de-comparecimento` | reprovada | 8 |
| `v3_motivo-de-perda-por-etapa` | aprovada | nenhum |
| `v4_zero-contra-sem-expediente` | aprovada | nenhum |

As observações da `v3` e da `v4` foram para o README do modelo. Este parecer existe por causa da `v2`.

## v2_melhor-janela-de-comparecimento

```
Versão: 09_dispersao-e-bolhas/04_bolhas-em-grade-categorica/v2_melhor-janela-de-comparecimento
Data: 2026-10-14
Resultado: reprovada
Não: 8
Correções:
  8. EST-3 e 14.1 (domínio e sentido de eixo): alimentar o Scatter e as ordens de categoria com a grade inteira, zeros incluídos, e contar os zeros num rodapé condicional.
Não se aplica: 4, 6, 7, 13, 26, 27, 28, 29, 30, 31, 32
```

Com o dado padrão o desenho confere nos dois temas. Os 55 cruzamentos saem na ordem certa, de segunda a sexta e das 08h às 18h. A faixa cai nas bordas das células, no meio dos vãos (no PNG, 339 e 575 em y, 519 e 948 em x, a 2x). A taxa da janela confere com o dado: 134 de 164, ou 81,7%, contra 313 de 534, ou 58,6%, fora dela. A régua lê 5, 12 e 23, e 23 é o máximo. A frase acessível tem 203 caracteres. O defeito está num ramo que o dado padrão não exercita, e a EST-1b já fixou que defeito de ausência mora no ramo, não na foto (precedente: `21/05`, revisão de 2026-10-13).

### Bloqueante 1. Pergunta 8. EST-3, com a seção 14.1 (domínio e sentido de eixo)

**O que o código faz.** Ele tira da série os cruzamentos com zero agenda **antes** de entregá-la ao `Scatter`. E o domínio de um eixo de categoria sai das linhas dessa série.

**Evidência.**

* `Chart.tsx:198`: `const cells = data.filter((row) => row.scheduled > 0);`.
* `Chart.tsx:199-200`: `hourOrder` e `dayOrder` saem de `cells`, não de `data`.
* `Chart.tsx:226-230` e `:311`: `rows` sai de `cells`, e é `rows` que vai para `<Scatter data>`.
* Recharts instalado, `_render/node_modules/recharts/lib/state/selectors/axisSelectors.js`, `computeDomainOfTypeCategory`: com `allowDuplicatedCategory={false}` o domínio é `Array.from(new Set(categoricalDomain))`, a ordem de **primeira ocorrência** na série. É o mecanismo que a Anatomia do README descreve no item 2, e que a própria `v3` evita de propósito. O comentário de `v3/Chart.tsx:210-214` diz: "filtrar o zero aqui apagaria colunas de motivos esparsos".
* O dado entra de sexta para segunda (`data.ts:22-76`). Logo, as horas de sexta definem a ordem do eixo X.

**Consequências, com entrada válida pelo próprio tipo** (`scheduled: number`, e o comentário da linha 197 já prevê o zero):

1. Com `Sexta` às 08h em zero, o eixo X lê `09h … 18h 08h`. O 08h só aparece no bloco de quinta e vai para o fim do eixo. Vale para qualquer hora de sexta entre 08h e 17h. A coluna errada sai rotulada como certa, e é o sentido do eixo que mente.
2. Com um dia inteiro em zero, o dia some do eixo Y. Com uma hora zerada em todos os dias, a hora some do eixo X e as vizinhas passam a parecer contíguas.
3. As linhas 242 e 243 leem `hourOrder[0]` e o último item. No caso 1, a frase acessível passaria a dizer "de 09h a 08h".
4. O cruzamento zerado some sem nota. A `v1` e a `v3` fazem a mesma escolha de não desenhar o zero, mas as duas contam os zeros por escrito no rodapé. A `v2` não conta, e o zero fica igual a "sem ocorrência", justamente a separação que o modelo existe para fazer (README, O que é).

**O que mudar.**

1. Entregar ao `Scatter` a grade inteira, zeros incluídos, como fazem a `v3` (`rows` com zeros) e a `v4` (`data.map`). O `AttendanceDot` já devolve nulo quando o raio é zero (linha 160), então nada muda no desenho.
2. Tirar `hourOrder` e `dayOrder` de `data`, não de `cells`. O `cells` filtrado fica só para o teste de estado vazio e para o máximo do `ZAxis`.
3. Contar os zeros num rodapé condicional, no modelo da `v1` e da `v3`: "N cruzamentos medidos com zero agenda, sem bolha", só com N maior que zero, e no singular quando N for 1.
4. Se o zero passar a ter marca própria, como o anel da `v4`, a dica não pode calcular taxa sobre base zero. Hoje ela chama `formatRateWithVolume(row.attended, row.scheduled)` (linha 268), e a saída é a EST-4: "sem agenda marcada para comparar".
5. Critério de aceite: com uma cópia local do dado em que `sex-08` tem `scheduled: 0`, o eixo X continua começando em 08h, a frase acessível diz "de 08h a 18h" e o rodapé conta 1 cruzamento. Opcional, para o preview exercitar o ramo: pôr um zero fora da janela no `data.ts`, por exemplo em `sex-18`, e atualizar as contas da nota do `meta.json`.

### Corrigir junto, sem peso de bloqueio

* `meta.json`, primeiro item de `demonstrates`: diz "ReferenceArea categórica com shape que completa meio passo de cada lado". O código não usa `ReferenceArea` e não soma meio passo; ele desenha a faixa pelas escalas dos eixos (`WindowBand`, linhas 103 a 154), como o README já escreve na linha da versão. Alinhar o texto ao código. Mesmo peso que o `demonstrates` velho de `07/04/v1` (revisão de 2026-10-14).
* README, colisões: a justificativa da troca diz que a `ReferenceArea` saiu cobrindo só a linha do meio. A REC-24, conferida no `recharts 3.10.1`, mostra que em escala `band`, que é a do `ScatterChart`, `x1` vai com `position: 'start'` e `x2` com `'end'`. A causa provável era a ordem de `y1` e `y2` contra o eixo Y invertido, a mesma que o comentário das linhas 118 a 126 descreve. A técnica atual funciona e pode ficar; só a frase precisa dizer a causa medida.
* "Melhor janela" e "janela de melhor comparecimento" estão escritos à mão (linhas 150 e 276), e a janela vem por prop. No dado padrão a afirmação é verdadeira: os nove cruzamentos de dentro ficam entre 79% e 85%, e nenhum de fora passa de 64%. Mas outra janela passada por prop também sairia como "melhor". Calcular a afirmação do dado (taxa de dentro contra a de fora) ou trocar a palavra por uma que não afirme ranking.
* Linha de leitura: a conclusão é a comparação, e hoje a base fica no rodapé. "81,7% (134 de 164) contra 58,6% (313 de 534) fora dela" na própria linha resolve, e o rodapé vira redundante (ANO-5).
* A régua de tamanho é pintada em `--chart-1`, a cor de "na janela", e pode ser lida como régua só das bolhas de dentro. Vale também para a `v1`, que é de série única, onde isso não pesa.
