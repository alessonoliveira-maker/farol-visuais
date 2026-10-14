# Dispersão lexical ao longo do tempo

## O que é

Uma faixa por termo e um traço vertical fino a cada dia com ocorrência, na posição da data: o
dispersion plot do NLTK trazido para datas. O eixo X é o tempo e o eixo Y são os termos. Lê-se
quando um termo começou a aparecer, quando adensou e quando sumiu, termo a termo, no mesmo eixo.
O traço é translúcido, e dois traços no mesmo dia se somam como duas camadas. No Recharts é um
ScatterChart com XAxis numérico de datas, YAxis de categorias e um shape que desenha a linha com a
altura da banda. Termo sem ocorrência mantém a faixa, com zero escrito.

## Quando usar

- Saber quando um termo começou ou parou de aparecer, de 3 a 12 termos, num trimestre ou num ano.
- Mostrar o adensamento de uma objeção depois de um evento datado, como um reajuste de taxa.
- Comparar o ritmo de aparição de termos que uma lista de termos já colocou lado a lado.
- Contagens baixas, até cerca de 10 ocorrências por dia por termo.

## Quando evitar

- Contagens altas por dia: o traço vira borrão; agregue por semana num mapa de calor (família 15).
- Pergunta sobre o volume total por período: use colunas (família 03) ou linha simples (04/01).
- Remover a faixa do termo sem ocorrência: esconde a ausência; mantenha a faixa, com zero escrito.
- Mais de 12 termos: as faixas ficam finas demais para ler o traço; filtre ou pagine.
- Evento de referência ancorado em pixel: mente no primeiro filtro; ancore a linha na data do dado.

## Anatomia

1. **Faixa por termo**, com o nome à esquerda em `--text-secondary` e a ordem declarada: por
   total de menções (v1), destaque primeiro (v2), primeira aparição (v3) ou por total com o termo
   sem menção por último (v4).
2. **Traço vertical** de 1 px em `--chart-1`, a 70% da altura da banda, com opacidade de 0,75 por
   menção (piso de 0,66 da ACE-5). Dias com mais de uma menção compõem `1 − (1 − 0,75)^N`.
3. **Eixo de tempo** numérico, com um tique por mês em `formatMonthShort` e grade vertical mensal
   em `--line-subtle`.
4. **Texto à direita da faixa**, em `font-display`: contagem antes e depois do evento (v2), total
   de menções (v3) ou total com "sem menções" no zero medido (v4).
5. **Anotação de período**: `ReferenceLine` na data do evento (v2) e `ReferenceArea` em
   `--surface-sunken` para o mês corrente, mais quadro tracejado para a semana sem coleta (v4).
6. **Dica** com a data por `formatDate`, o termo e as menções daquele dia, por um alvo invisível
   de 6 px de largura, porque um traço de 1 px não se acerta com o cursor.
7. **Estado vazio** com `role="status"` quando nenhum termo tem menção no recorte.

## Versões

- `v1_termos-de-perda-em-2026`: seis termos de perda de janeiro a
  setembro de 2026, com começo, adensamento e sumiço. Canvas `largo`.
- `v2_preco-depois-do-reajuste`: cinco termos com a linha do reajuste em 2026-07-01, destaque em
  `--chart-1` só na faixa de preço, contagem antes e depois e janelas de 91 dias. Canvas `largo`.
- `v3_objecoes-da-pre-vendas-por-dia`: doze objeções dia a dia, ordenadas pela primeira aparição,
  com total à direita e aviso quando um termo passa de 10 menções num dia. Canvas `largo`.
- `v4_termo-sem-mencoes-e-mes-parcial`: termo sem nenhuma menção com a faixa mantida, mês corrente
  parcial e semana sem coleta separada do zero. Canvas `card`.

## Como colar no Farol

1. Passe `data` com o mesmo formato de `LexicalDispersion`: uma série por termo, cada uma com a
   lista de dias e a contagem do dia. Termo sem menção entra com a lista vazia, nunca fora da lista.
2. O eixo é em dias; para agregar por semana troque o dia da menção pelo primeiro dia da semana e
   confira se o traço continua legível.
3. A ordem das faixas vem da ordem das linhas no Scatter, e o primeiro termo vai para a base. O
   `domain` do YAxis de categoria não reordena (observado no render); mexer na ordem é mexer em `rows`.
4. A coluna de texto à direita é um filho do gráfico que lê `usePlotArea`; reserve a largura dela na
   margem direita, porque um segundo YAxis sem série ligada não desenha tique.
5. Ao colar, o vazio inline dá lugar a `EmptyState` e a semana sem coleta pode virar
   `UnavailableState`, mantendo o sentido do texto (seção 16 do contrato).

## Referências

- Dispersion plot do NLTK (`nltk.draw.dispersion_plot`), a forma original em posição de palavra.
- Recharts 3.10.1: `ScatterChart` com `shape` próprio, `usePlotArea` e `useXAxisScale`.
- Armadilhas `REC-3`, `REC-14` e `REC-4` do catálogo para ordem de categoria, banda por ponto e
  rótulo de referência.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-13, primeira passada, as quatro versões (`sem_revisao`): `v1` e `v3` aprovadas, sem bloqueante; `v2` e `v4` reprovadas, com dois bloqueantes cada, descritos em `validation/revisao_21_texto-e-nuvem-de-palavras__05_dispersao-lexical-no-tempo_2026-10-13.md` (`v2`: contagem sem unidade e marca do dia do evento coberta pela linha de referência; `v4`: nota do mês parcial presa à existência de lacuna e marca em cima da borda do quadro da lacuna). `npm run check`: 0 com erro, 0 avisos, 0 escapes. A `OPACIDADE-MARCA` e a `CONTRASTE-MARCA` não medem traço de 1 px com opacidade calculada, então os 658 traços foram medidos à mão nos PNGs dos dois temas: mínimo de 3,22:1 no claro e de 3,51:1 no escuro, os dois no neutro da `v2`. Os totais impressos foram refeitos a partir do gerador de cada `data.ts`. Os estados vazios e os ramos fora do dado padrão foram conferidos só por leitura do código.

- `v2` e `v4`, corrigidas: traço no meio do dia (`+ 0.5`), domínio até `end + 1`; a `v4` desenha uma nota por lacuna de `data.gaps` e `parcial até` só quando `asOf < end`, e a `v2` nomeia a unidade (menções) no rodapé.
- `v1` e `v3`, posição do traço: o traço fica no começo do dia (`dayNumber(date)`), que é onde ficam a grade mensal, as bordas da área e as fronteiras de período. Na `v1` e na `v3` ele só cai em cima da grade no dia 1 e das bordas (2026-01-01 e 2026-09-30 na `v1`, 2026-08-31 na `v3`), por cima e sem perda medida. Traço no meio do dia (`+ 0.5`) e domínio até `end + 1` resolvem nas quatro; na `v2` e na `v4` isso é parte da correção.
- `v1` a `v4`, traço de 1 px em x fracionário: no preview todo traço tem ao menos uma coluna de pixel cheia. Em tela de 1 px de imagem por px de CSS a suavização pode repartir o traço em duas colunas mais fracas, e a intensidade que conta menções passa a depender da posição. Arredondar `cx` para o meio do pixel evita.
- `v1` a `v4`, intensidade do traço: 1 e 2 menções medem 1,5:1 entre si; com 3 a opacidade já passa de 0,98 e deixa de separar. Na prática o canal distingue uma menção de mais de uma, legível no claro e sutil no escuro.
- `v3` e `v4`, chave da intensidade: só a `v1` escreve `traço mais forte, mais de uma menção no dia`. Na `v3`, preço alto tem 46 traços e 74 menções, e quem não abre a dica não fecha a conta.
- `v1`, Anatomia deste README: o item 2 diz opacidade de 0,75 por menção e traço de 1 px; a `v1` usa 0,72 (3,38:1 calculado e 3,42:1 medido no claro), o destaque da `v2` tem 1,5 px e o alerta da `v3` tem 2 px.
- `v2`, frase acessível: `em janelas de mesma duração` está escrito à mão no `Chart.tsx`. Com janelas desiguais a frase continua afirmando igualdade; calcular de `beforeDays === afterDays`.
- `v2`, TIP-1: o rodapé das janelas e o rótulo da linha de referência têm data e contagem de dias sem `tabular-nums` nem `font-display`. Sem consequência visível.
- `v2`, seção 17.2: tracejado da referência em `4 4`, e a tabela pede `3 3`. Sem consequência visível.
- `v3`, rodapé do alerta: termina em `(família 15)`, referência do catálogo que chega a quem lê o painel se o texto for colado como está. Ao colar, trocar pelo nome do visual de destino.
- `v4`, EST-3: o zero medido vem só por extenso (`sem menções`), sem o algarismo que o catálogo pede e que o item `O que é` deste README promete (zero escrito). `0 menções` resolve.
- `v4`, trilho do zero: a linha em `--text-muted` da faixa sem menção atravessa o quadro da lacuna e os dias depois da data de corte, onde não há medição. Interromper nesses trechos separa melhor zero de ausência.
- `v4`, seção 17.2: `--text-muted` faz dois papéis, o trilho do zero medido e o quadro da ausência, separados só pela forma (linha cheia e quadro tracejado).
- `v4`, EIX-3: trilho horizontal nas cinco faixas mais a grade mensal vertical formam grade nos dois sentidos. Bastaria o trilho na faixa sem menção.
- `v4`, TIP-6: coluna de totais alinhada à esquerda; `9 menções` não alinha com `45 menções`. Na `v3` a coluna está à direita.
- `v4`, TIP-1 e ESP-1: `parcial até 13/10/2026` é `<text>` sem `font-display`, e o tracejado do quadro está em `4 3`. Sem consequência visível.
- `v4`, piso de opacidade: o 0,66 citado vale sobre `--surface-raised`. Sobre `--surface-sunken`, no claro, o piso de `--chart-1` sobe para 0,705; a opacidade de 0,75 passa, com 3,28:1 calculado e 3,25:1 medido.

Revisão de 2026-10-13, segunda passada, `v2` e `v4` (`revisao_desatualizada`, código corrigido depois do veredito): as duas aprovadas, sem bloqueante, julgadas pelo arquivo atual. `npm run check`: 0 com erro, 0 avisos, 0 escapes. Contagens refeitas do gerador de cada `data.ts` (`v2`: 15 e 48, 23 e 33, 27 e 25, 28 e 17, 16 e 8; `v4`: 45, 24, 14, 9 e zero, 92 no todo). Os 174 traços da `v2` e os 72 da `v4` foram medidos nos PNGs dos dois temas: mínimo de 3,22:1 no claro (neutro da `v2`) e de 3,51:1 no escuro; na `v4`, 3,25:1 no claro sobre o poço do mês corrente. Os dois bloqueantes de cada versão não existem mais no arquivo de hoje. Das observações da primeira passada, continuam valendo na `v4` a do zero só por extenso, a do trilho do zero, a do `--text-muted` em dois papéis, a da grade nos dois sentidos e a da coluna alinhada à esquerda; saíram a frase de mesma duração escrita à mão, os dois tracejados fora da tabela e a nota `parcial até` sem `font-display`. Os ramos fora do dado padrão foram conferidos só por leitura do código.

- `v1` a `v3`, termo sem menção: só a `v4` põe no Scatter a linha de contagem 0 que abre a faixa. Nas outras três, um termo com a lista vazia (o que o passo 1 de `Como colar no Farol` manda passar) não abre faixa no eixo de categoria; na `v2` e na `v3` a coluna da direita continua com uma linha por termo de `ranked`, então os textos deixam de cair na altura das faixas. Fora do dado padrão. Ao colar, copiar da `v4` a linha de contagem 0 e o traço que não desenha quando a contagem é 0.
- `v2`, NUM-6: `15 antes, 48 depois` segue sem substantivo na faixa, e a unidade vem só no rodapé (`Contagem em menções`). `15 menções antes, 48 depois` na faixa de destaque dispensa a ida ao rodapé.
- `v2`, marca do dia do evento: a menção de 2026-07-01 fica a 1,7 px de centro da linha do reajuste, com uma coluna de fundo limpo do preview entre as duas (0,5 px de CSS). Nas faixas neutras as duas usam `--text-muted` e se separam só pela forma, traço cheio contra tracejado. Em tela de 1 px de imagem por px de CSS podem encostar.
- `v2`, GEO-12: abaixo do destaque as faixas seguem o total de menções e o cartão não diz; o critério só se refaz somando antes e depois.
- `v2`, frase acessível: `termos de perda` e `o reajuste de taxa` estão escritos à mão, enquanto o rótulo da linha lê `data.eventLabel`. Com outro evento, frase e rótulo divergem.
- `v2`, TIP-1: o rótulo da linha de referência (`reajuste de taxa, 01/07/2026`) segue sem `tabular-nums`. Sem consequência visível.
- `v2` e `v4`, TIP-4: o rodapé das janelas da `v2` e a nota `parcial até` da `v4` pedem Space Grotesk em peso 400, que não é carregado, e o navegador desenha em 500. Declarar o peso 500.
- `v4`, lacuna dentro do mês corrente: `indisponível` e `parcial até` são escritos na mesma linha, 6 px acima da área, e a nota do mês ocupa quase toda a largura de outubro. Uma lacuna em outubro poria um texto sobre o outro. O dado padrão não exercita.
- `v4`, data de corte: nada no eixo marca onde cai 13/10 dentro do poço, e a leitura depende da nota. Um tique na data de corte mostraria até onde o mês foi medido.
