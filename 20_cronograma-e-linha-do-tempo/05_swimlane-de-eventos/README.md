# Swimlane de eventos e agenda

## O que é

Uma raia por responsável, canal ou função. Dentro de cada raia, períodos aparecem como barras e eventos pontuais como marcas, ao longo de um eixo de tempo real. O rótulo da raia fica fixo à esquerda, o fundo alterna de uma raia para a outra e o número de períodos por raia varia. É SVG puro: a escala de tempo e a escala de banda são funções em TypeScript, e os retângulos são desenhados direto. Períodos que se cruzam na mesma raia ganham sub-faixas pelo empacotamento guloso, e a raia cresce em vez de sobrepor marcas. A agenda em grade (v4) troca os eixos: horas na vertical e uma coluna por pessoa.

## Quando usar

- Vários períodos e eventos por pessoa, canal ou função, de 3 a cerca de 10 raias.
- Agenda de reuniões de SDRs na semana, com buracos e sobreposição visíveis.
- Passagem de uma oportunidade entre funções, mostrando a espera entre raias.
- Grade de horário de um dia por pessoa, com capacidade livre, conflito e ausência.

## Quando evitar

- Um único período por linha: use o Gantt (20/01).
- Estado discreto por dia sem horário: use a faixa de status (24/04).
- Períodos de semanas ou meses em grade de horas: use o Gantt ou o calendário (15/05).
- Carga por pessoa por dia como intensidade: use o mapa de calor (família 15).

## Anatomia

1. **Rótulo da raia** à esquerda, em `--text-secondary`, sem reticência. O destaque (mais horas, mais ausências, oportunidade em foco) vai em peso 700 no nome e no valor.
2. **Fundo alternado** das raias em `--surface-sunken`, nunca `--surface-overlay`, que no tema claro é o branco do cartão.
3. **Eixo de tempo** por `timeScale`, com separadores de dia em `--line-strong` e `vectorEffect="non-scaling-stroke"`, e rótulo de data por `formatDate`.
4. **Blocos de período** em `--chart-N`, com contorno `--surface-raised` entre vizinhos colados, e horário completo no `title`.
5. **Sub-faixas** por `packLane` ou equivalente: por início e depois por id, primeira sub-faixa livre.
6. **Marcas de exceção** com forma e palavra: bloco vazado em `--negative` para ausência (v2), losango de passagem (v3), contorno `--warning` para fora do expediente e hachura para SDR ausente (v4).
7. **Coluna à direita** com a conta que a raia resume (horas, ausências, espera total), em `font-display tabular-nums`.
8. **Legenda** dentro do próprio SVG, para o `viewBox` ter o tamanho do corpo e a escala sair 1.

## Versões

- `v1_semana-de-agendas-por-sdr`: 5 SDRs por 5 dias úteis, só o expediente de 9h a 18h, reuniões de 30 e 60 minutos, sub-faixas nas que se cruzam e as horas da semana à direita.
- `v2_ausencias-e-remarcacoes`: ausência do lead como bloco vazado em `--negative`, arco em path Q até a nova data, arco entre raias com o destino escrito, ausência sem nova data dita por palavra e contagem de ausências por raia.
- `v3_handoff-em-raias-de-funcao`: 6 oportunidades em 4 funções, posse como barra, passagem como losango, espera como traço tracejado com os dias escritos e foco por prop com as demais em barra fina.
- `v4_agenda-em-grade-com-conflito-e-ausencia`: grade de um dia com horas na vertical, reuniões sobrepostas em colunas internas, SDR ausente hachurado, agenda livre separada e grade estendida só nesse dia com aviso.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão para a pasta do visual e troque o default pelo dado do Farol, mantendo o tipo exportado de `data.ts`.
2. O `viewBox` tem o tamanho do corpo medido do canvas (894 px de largura no `largo`, 574 px no `alto`). Num `VisualCard` de outra largura o SVG escala; confira se o texto de 11 px continua legível e, se não, recalcule as constantes de largura do topo do arquivo.
3. Embrulhe no `VisualCard` e passe o título, a procedência e o aviso de protótipo por lá: o Chart não desenha nenhum dos três.
4. No estado vazio, troque o bloco inline por `EmptyState`, mantendo o sentido da frase.
5. A dica nativa (`title`) cobre o horário completo. Se o Farol quiser dica rica, ela entra no `VisualCard`, com o horário que o corpo do desenho não escreve.

## Referências

- Gantt do catálogo (`20_cronograma-e-linha-do-tempo/01_gantt`), pelo empacotamento guloso de faixas.
- Lasagna do catálogo (`15_mapa-de-calor-e-calendario/06_lasagna`), pela hachura de ausência e pelo viewBox no tamanho do corpo.
- Armadilhas `GEO-1` (canvas), `GEO-18` (escala do texto) e `DAD-2` (ausência como zero), em `ARMADILHAS.md`.
- Nenhum pedido de formatador próprio: todo número passa por `@/lib/format`.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-08, quatro versões julgadas: `v1` e `v4` aprovadas, `v2` e `v3` reprovadas com parecer em `validation/revisao_20_cronograma-e-linha-do-tempo__05_swimlane-de-eventos_2026-10-08.md`. Nada abaixo reprova; quem tocar o arquivo alinha.

- `v1`, `v2`, `v3`, `v4`: a legenda fica abaixo do desenho, e a ROT-4 pede acima ou ao lado; cabe em uma linha e nada colide.
- `v1`, `v2`, `v3`, `v4`: rótulo de raia e legenda saem em 11 px, e a 17.1 pede 12 px para rótulo e legenda; a escala é 1 e o texto se lê nos dois temas.
- `v1`, `v2`, `v4`: o nome da raia com algarismo (`SDR 1`), o destino `para SDR 3` da `v2` e as duas notas do rodapé da `v4` saem sem `tabular-nums` (TIP-1); nenhuma coluna desalinha.
- `v1`, `v2`, `v3`, `v4`: a data curta sai de `formatDate(...).slice(0, 5)` (na `v4`, de `dayLabel.slice(0, 9)`); o corte depende do formato `DD/MM/AAAA` e quebra calado se o formatador mudar (NUM-7).
- `v1`, `v2`, `v4`: o tique de hora sai de `String(hour)` com `h` colado, fora de `@/lib/format`, e a seção Referências diz que todo número passa por lá.
- `v1`, `v2`: o tique `9h` ancora no começo, 3 px depois do separador, e `12h` e `15h` ancoram no centro; não há marca de tique, e a hora se lê pelo centro do rótulo.
- `v1`, `v2`: o bloco tem contorno `--surface-raised` também nas raias `--surface-sunken`, e no tema claro sobra um filete branco em volta de cada bloco dessas raias.
- `v1`, `v2`: bloco que começa às 9h nasce em cima do separador de dia, pintado por último; na `v2` o separador passa sobre o contorno da ausência de sexta da SDR 1.
- `v1`: a legenda escreve `até 30 min` e `60 min` à mão, e o corte de cor é `LONG_MINUTES = 45`; uma reunião de 45 ou de 90 minutos sairia na cor de `60 min`.
- `v1`, `v2`: a frase acessível começa por "Agenda semanal", que nomeia o objeto e não a forma do gráfico (ACE-1).
- `v2`: `LABEL_W = 62` subestima `sem nova data`, que mede 72 px no PNG; o teste de caber à direita pode aceitar um rótulo que passa 10 px do separador. No preview sobra espaço.
- `v2`: o arco entre raias corre a 4 px da base do bloco de quarta às 9h da SDR 2, sem tocar.
- `v3`: a frase acessível começa pelo assunto ("Passagem de 6 oportunidades") e não pelo tipo de gráfico (ACE-1).
- `v3`: barras fora do foco com 6 px, abaixo do piso de 12 px da ESP-2; a troca pela opacidade está declarada no `meta.json` (ACE-5) e as barras se leem nos dois temas.
- `v3`: no painel, o total de dias fica abaixo do nome e alinhado à esquerda; a ROT-5 e a TIP-6 pedem número em coluna à direita.
- `v3`: oportunidade sem passagem escreve `formatUnavailable()` sem o ícone `Unplug` da EST-2; o dado padrão não exercita o ramo.
- `v4`: a legenda diz `bloco curto tem no mínimo 10 px`; pixel não é unidade de leitura e o número repete `MIN_BLOCK_H` à mão. Dizer em minutos: o bloco de 15 min sai com a altura de 22 min.
- `v4`: bloco com altura mínima invade 3,25 px da reunião seguinte quando ela começa logo depois; o dado padrão não tem o caso.
- `v4`: a segunda nota do rodapé termina a 5,5 px da borda direita do corpo (568,5 de 574 px); nome de SDR mais longo transborda.
- `v4`: o corpo escreve `agenda livre` e a frase acessível diz `agenda vazia`; a palavra `ausente` aparece duas vezes na mesma coluna, no cabeçalho e na placa.
- `v4`: as duas notas ficam no rodapé em 11 px, e a ANO-5 descreve a linha de leitura no topo, em uma linha de 12 px.

Segunda passada de 2026-10-08, `v2` e `v3` julgadas de novo depois da correção: `v2` aprovada, `v3` reprovada por um bloqueante (rótulo `6 dias` escrito sobre o tracejado de outra oportunidade), com parecer na seção `Segunda passada` do mesmo arquivo em `validation/`. As observações da primeira passada seguem valendo onde o código não mudou. Nada abaixo reprova.

- `v2`: o `title` do bloco de ausência que tem nova data não diz o destino; o arco e o rótulo `para SDR 3` dizem, e o bloco de destino diz a origem.
- `v3`: o losango fora do foco tem meia diagonal de 3 px, a altura da barra fina de 6 px, e a amostra da legenda tem 5 px; ele se lê como losango pelo contorno nos dois temas.
- `v3`: `3 dias` fica com a tinta a 0,8 px do próprio tracejado; não cobre o traço, mas encosta.
- `v3`: `5 dias` cruza a linha de grade de 19/10 sem halo; a grade é `--line-subtle` e o número se lê nos dois temas.
- `v3`: as constantes da anticolisão do rótulo de dias (largura por caractere, altura, deslocamentos e frações) estão no corpo do componente e não no topo do arquivo; a largura estimada é 46 px para uma tinta de 32 px.
