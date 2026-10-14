# Gantt com dependências e caminho crítico

## O que é

Um Gantt em que conectores em cotovelo ligam o fim de cada tarefa ao início da sucessora, e em que a sequência sem folga que define a data final, o caminho crítico, ganha destaque. Cada linha é uma tarefa, a barra vai do primeiro ao último dia de trabalho, e a seta diz o que precisa terminar antes de cada começo. É SVG puro: a escala de tempo e a escala de banda são funções em TypeScript, a barra é um `rect` com altura de linha fixa e o conector é um `path` `M H V H` com ponta de seta por `marker`. As datas cedo e tarde saem de uma ordenação topológica feita antes do desenho, em dias úteis de segunda a sexta. Ciclo no grafo é erro de dado: é achado, listado fora do gráfico e nunca desenhado. Acima de uns 25 conectores a peça vira teia, e então só os da tarefa em foco aparecem.

## Quando usar

- De 5 a cerca de 25 tarefas cujo encadeamento define a data final.
- Responder o que atrasa a entrega se atrasar e quantos dias úteis de folga tem cada tarefa.
- Planos de implantação de canal, contratação ou preparação de meta com passagens entre áreas.
- Mostrar tarefas paralelas e o tempo ocioso aproveitável entre dependências.
- Auditar um plano antes de confiar na data final: sucessora que começa cedo demais e ciclo entre tarefas.

## Quando evitar

- Tarefas independentes entre si: use o Gantt (`20/01`).
- Centenas de tarefas: agrupe em fases no Gantt hierárquico (`20/01`) e mostre dependências só em foco, como na `v3`.
- Não há datas firmes: use o roadmap por horizonte (`20/07`).
- Relação entre etapas sem tempo: use fluxo (família `11`) ou rede e relações (família `27`).
- Só os pontos de controle importam: use a linha do tempo de marcos (`20/02`).
- Tarefas que terminam e começam no mesmo dia, sem vão entre elas: o cotovelo `M H V H` não cabe e todo conector passa a contornar pela esquerda; o desenho segue correto, e mais carregado.

## Anatomia

1. **Linha de leitura**: frase de 12 px no topo do corpo, calculada do dado, com os números em `kpi-number` (ANO-5). Na `v4` ela carrega o `formatUnavailable()` com o ícone `Unplug` dentro de um contêiner `flex`, fora do fluxo do texto (EST-2, GEO-17).
2. **Legenda** (`v2`, `v3`): uma linha de HTML acima do gráfico, com amostra na forma da marca e na ordem em que as marcas aparecem (ROT-4).
3. **Coluna de nomes**: nome completo da tarefa em 12 px, `--text-secondary`, sem reticência (TIP-7). O destaque muda o peso e a cor do nome além da cor da barra (COR-2).
4. **Coluna de valor**, alinhada à direita (TIP-6): o término por `formatDate` na `v1` e na `v4`, a folga por `formatDays` na `v2` e na `v3`, com o cabeçalho na faixa do topo. O valor fica na coluna, e não na ponta da barra, porque a ponta é de onde o conector sai.
5. **Barra**: `rect` de 12 ou 14 px numa linha de altura fixa, do início do primeiro dia ao fim do último (fim exclusivo, para o último dia ocupar a largura inteira). `--chart-1` na série única e no destaque, `--text-muted` no que fica em neutro e `--negative` na tarefa presa em ciclo.
6. **Conector**: `path` em cotovelo que sai do fim da predecessora, desce ou sobe na perna a alguns pixels dali e entra pela esquerda no início da sucessora. Carrega a relação, então mede 3:1 nos dois temas (ACE-6): `--text-muted` no comum, `--chart-1` no crítico e no foco, `--negative` no inconsistente. Por baixo vai um halo em `--surface-raised`, para o traço se ver onde cruza outra marca (TOK-10).
7. **Ponta de seta**: `marker` com `markerUnits="userSpaceOnUse"` e `id` vindo de `useId`. Sem `orient`, porque todo conector entra na barra pela esquerda. O caminho para na base da seta.
8. **Contorno pela esquerda**: sem vão entre o fim de uma e o início da outra, o conector sai pela direita, volta pelo meio do espaço entre as duas linhas e entra na sucessora pela esquerda, sem cruzar barra.
9. **Trilho de folga** (`v2`): traço tracejado em `--text-muted` do fim da barra até a data tarde de término, com batente no fim. Folga zero não tem trilho e escreve `0 dias` (EST-3).
10. **Eixo de tempo**: tiques na segunda-feira gerados por `Date.UTC`, com grade vertical em `--line-subtle` e a data por `formatDate`. Semanal na `v1`, `v2` e `v4`; de duas em duas semanas na `v3`.
11. **Anotações**: linha de hoje vinda do dado, em duas linhas sobrepostas (halo e fio), com o rótulo na faixa do topo (`v1`); faixa de período opaca em `--surface-sunken` com nome e período escritos no topo (`v3`, ANO-4).
12. **Lista de problemas** (`v4`): abaixo do gráfico, uma linha por dependência inconsistente e uma para o ciclo, cada uma com a amostra da marca e o nome das tarefas.
13. **Estados**: recorte vazio troca o gráfico por um bloco `role="status"` com o ícone `Filter` (EST-1); plano com ciclo, na `v2` e na `v3`, troca por um bloco com `Unplug` e `formatUnavailable()`.

## Versões

- `v1_plano-de-implantacao-de-canal`: 7 tarefas e 8 dependências de 2026-10-05 a 2026-11-27. Demonstra a escala de tempo e a de banda em TypeScript com linha de 30 px, o cotovelo `M H V H`, a seta por `marker` com `id` de `useId`, os tiques semanais na segunda por `Date.UTC`, a linha de hoje vinda do dado e o `viewBox` fixo com `vectorEffect="non-scaling-stroke"`.
- `v2_caminho-critico-com-folga`: o mesmo plano com as datas cedo e tarde calculadas. Demonstra a ordenação topológica de Kahn, as passadas para a frente e para trás em dias úteis, as 4 tarefas de folga zero em `--chart-1` com conector mais grosso, as 3 com folga em `--text-muted`, o trilho tracejado até a data tarde e a folga escrita numa coluna.
- `v3_esteira-da-meta-2027`: 18 tarefas em três frentes, com a janela de leitura de 2026-12-14 a 2027-01-13 sombreada. Demonstra o agrupamento por frente com rótulo e respiro, os conectores só da tarefa em foco vinda pela prop `focusId`, o resto rebaixado por token, a faixa de período opaca e a frase acessível com as tarefas críticas e a data final prevista.
- `v4_dependencia-inconsistente-e-ciclo`: plano de pré-vendas com dois erros de dado. Demonstra o contorno pela esquerda da sucessora sobreposta, o conector tracejado em `--negative` com o aviso escrito, o ciclo achado por poda e listado fora do gráfico sem a volta desenhada, e o caminho crítico como `formatUnavailable()` enquanto houver ciclo.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para uma pasta de visual da página, por exemplo `app/src/pages/<pagina>/visuals/<NomeDoGantt>/`.
2. Troque o `import` do `./data` pelo seletor real e passe `data` pelas props. Cada tarefa precisa de `id`, `name`, `start`, `end` em `YYYY-MM-DD` e `dependsOn` com os ids das predecessoras; id que não existe no plano é ignorado.
3. Na `v1`, `today` vem do dado ou do filtro de período da página, nunca de `Date.now()` dentro do componente. Na `v3`, `focusId` vem da seleção da página, e string vazia deixa o plano sem foco e sem conector.
4. O `viewBox` tem a largura do corpo do canvas de 960 px (`VIEW_WIDTH` de 894) e a altura da conta de linhas. Num cartão mais estreito o desenho encolhe inteiro, texto incluído: abaixo de uns 700 px de largura útil, aumente o cartão ou reduza `VIEW_WIDTH` junto com a coluna de nomes, para o texto não cair abaixo de 11 px (GEO-18).
5. Dê altura ao pai: cada tarefa pede 30 px na `v1` e na `v4`, 26 px na `v2` e 20 px na `v3`, mais o eixo, a faixa do topo e as linhas de texto. A conta de cada versão está no `notes` do `meta.json`.
6. A folga e a sobreposição são contadas em dias úteis de segunda a sexta, sem feriado. Se o plano tem calendário próprio, troque `toWorkIndex` e `fromWorkIndex` pelo calendário da fonte.
7. Na `v2` e na `v3` a barra é desenhada na data cedo calculada; se o início planejado de uma tarefa vier antes do fim de uma predecessora, a barra anda para a frente. Para auditar esse caso sem mover a barra, use a `v4`.
8. Troque os estados inline por `EmptyState` e `UnavailableState` do Farol mantendo o sentido do texto (seção 16 do CONTRATO).
9. Rode `npm run typecheck` e `npm run lint` no `app/` e confira nos dois temas.

## Referências

- Kelley, J. E. e Walker, M. R. (1959). Critical-Path Planning and Scheduling: a passada para a frente e para trás e a folga total de cada tarefa.
- Kahn, A. B. (1962). Topological sorting of large networks: a ordenação usada antes das passadas, e que não fecha quando há ciclo.
- Gantt, H. L. (1919). Organizing for Work: a barra de duração sobre escala comum de tempo.
- [MDN, elemento marker](https://developer.mozilla.org/en-US/docs/Web/SVG/Element/marker): `markerUnits`, `refX`, `refY` e `orient`.
- [MDN, vector-effect](https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/vector-effect): `non-scaling-stroke` para o traço não engordar com a escala do `viewBox`.
- Farol: `app/src/lib/format.ts` (`formatDate`, `formatDays`, `formatInt`, `formatUnavailable`).
- Molde: `_render/exemplos/22_unidades-waffle-e-pictograma/01_waffle-10x10/v1_composicao-por-origem` (SVG puro com geometria em TypeScript).
- Pedido de formatador próprio: o Farol não tem formatador de dia e mês sem o ano. Os tiques escrevem a data inteira por `formatDate`, e por isso a `v3` rotula de duas em duas semanas.
- Pedido de formatador próprio: o Farol não tem contagem de dias úteis. As versões escrevem `formatDays` seguido de `útil` ou `úteis` no componente.

## Pendências conhecidas

- `ESPESSURA-MARCA` sai não medida nas quatro versões (`marca_fora_do_bar`), porque a barra é um `rect` desenhado à mão e sem rótulo dentro. Espessura declarada e conferida no `preview.svg`: 14 px na `v1`, na `v2` e na `v4`, 12 px na `v3`.
- `EIXO-CALMO` e `OPACIDADE-MARCA` saem não medidas (`sem_grade`, `sem_opacidade_em_marca`): o eixo é desenhado à mão e nenhuma marca usa opacidade.
- Pernas de predecessoras diferentes que terminam no mesmo dia caem no mesmo x e se sobrepõem. Quando as sucessoras são diferentes, o trecho comum deixa de dizer quem liga a quem. Os quatro dados padrão foram montados sem esse caso; para dado real que o tenha, a saída é dar a cada predecessora uma raia própria na perna, o que pede vão maior que os 21,7 px do fim de semana.
- O halo do conector abre passagem onde ele cruza barra, trilho ou linha de hoje, mas com os dados padrão o conector só cruza o trilho de folga, na `v2`; conector cruzando barra ou linha de hoje não aparece em nenhum dos quatro previews.
- Na `v3`, trocar `focusId` pode pedir o contorno pela esquerda em tarefas que terminam e começam com menos de 11 px de vão; o ramo existe e não é exercitado pelo foco padrão.
- Na `v4` o canvas guarda duas linhas de problema. Plano com mais de uma dependência inconsistente pede 20 px de altura a mais por linha.
- No tema claro, `--chart-1` e `--text-muted` medem 1,12:1 entre si. Na `v2` e na `v3` a diferença entre aceso e neutro é carregada também pelo peso e pela cor do nome, e não só pela barra.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-12, quatro versões julgadas e as quatro aprovadas, sem parecer em `validation/`. O `npm run check` saiu com 0 erros e 0 avisos, e as contas de folga, de caminho crítico, de ciclo e de sobreposição foram refeitas à mão e conferem com o que a tela escreve. Nada abaixo reprova; quem tocar o arquivo alinha.

- `v1`, `v2`, `v3`, `v4`: o valor da coluna ao lado do nome (término ou folga) sai em 11 px, e a 17.1 pede 12 px para rótulo de valor. Lê-se nos dois temas e não colide com nada.
- `v1`, `v2`, `v3`, `v4`: a linha de leitura tem altura fixa (`h-5`) e não usa `truncate`. A da `v1` mede cerca de 746 px; em cartão com menos largura útil que isso ela quebra e a segunda linha invade o gráfico.
- `v1`: o rótulo `hoje, 21/10/2026` está em `--text-primary` com peso 600, e a ANO-2 pede `--text-muted`. Ele acompanha a cor da linha de hoje e não há consequência no preview.
- `v1`, `v4`: a barra de 14 px em linha de 30 px deixa 53% de vão, acima dos 40% da ESP-2 (46% na `v2`). É no vão que passa o contorno pela esquerda, e nada se perde no preview.
- `v2`: onde o conector crítico e o comum saem juntos da mesma predecessora (`task-01` e `task-02`), o halo de 6 px do crítico abre 1,75 px de vão no começo do trecho próprio do comum, que parece nascer solto logo abaixo do cotovelo. Na chegada em `task-07`, a seta de 6 px dos dois conectores comuns fica inteira sob a seta de 8 px do crítico, e o traço deles para a 1,75 px da perna crítica. Quem liga a quem continua legível; desenhar o halo do crítico só onde ele cruza outra marca resolve.
- `v2`: o trilho da folga de 2 dias úteis mede 21,7 px, e os primeiros 12,5 px ficam sob o toco do conector e o halo da perna. Sobram cerca de 9 px de tracejado e o batente; o número está na coluna.
- `v2`, `v3`: a coluna escreve `0 dias` e `12 dias` por `formatDays`, e a unidade completa, dias úteis, só aparece no cabeçalho da coluna e na linha de leitura.
- `v2`, `v3`: o `demonstrates` do `meta.json` se afasta do texto do catálogo onde o contrato vence (`--text-muted` no lugar de `--line-strong`, folga escrita na linha e não na ponta do trilho, faixa opaca no lugar da de baixa opacidade, respiro no lugar do separador). Os desvios estão declarados no `notes`; falta alinhar o texto do catálogo.
- `v3`: a linha de leitura fala de 5 tarefas críticas e o desenho acende 5 barras, mas são conjuntos diferentes. As acesas são o foco e as 4 ligadas a ele, e duas delas (`Rodar piloto com uma carteira`, `Subir campanhas de teste`) têm folga; duas críticas (`Fechar definição das métricas`, `Homologar painel com a diretoria`) ficam em neutro. A legenda nomeia o foco e a coluna marca as críticas com `0 dias` em peso 600, então nada do que está escrito é falso, e é a coincidência das contagens que convida à leitura errada. Escrever na legenda `em foco e ligadas a ela`, dizer na linha de leitura que crítica é a de folga zero, ou trocar o foco padrão desfaz o empate.
- `v3`: a última linha de grade, de 11/01/2027, fica sem rótulo porque a data centrada passaria 4 px do `viewBox` (866 mais 32 contra 894). Não há barra nesse trecho e o fim da janela está escrito na anotação; ancorar o último rótulo à direita devolve a data.
- `v3`: o rótulo da frente (`Dados`, `Pré-vendas`, `Mídia`) sai em 11 px com peso 600, menor que os nomes de 12 px que ele agrupa.
- `v3`: na chegada em `data-04`, `data-05` e `media-05` sobra 0,96 px de trecho horizontal entre a perna e a base da seta, e a seta tem 5 px. O cotovelo e a ponta se leem nos dois temas; é a margem mais apertada do modelo.
- `v4`: a frase acessível conta a dependência inconsistente e não diz qual. O nome das tarefas e os 5 dias úteis de sobreposição só estão na lista visível, que é `aria-hidden`, e a frase já tem 226 caracteres.
- `v4`: cada linha da lista de problemas tem altura fixa (`h-5`) e não quebra. Com o dado padrão sobram cerca de 118 px de largura na linha do ciclo; nome mais longo transborda.
- `v4`: ramo que o dado padrão não exercita: tarefa que depende de si mesma entra no ciclo sozinha, e a lista escreve `cada tarefa espera a outra para começar`, que não vale para uma tarefa só.
