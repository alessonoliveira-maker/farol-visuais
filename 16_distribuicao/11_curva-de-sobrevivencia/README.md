# Curva de sobrevivência (Kaplan-Meier)

## O que é

A proporção dos casos que ainda não tiveram o evento ao longo do tempo, estimada sem descartar os que
seguem em andamento. Esses entram como censura, um traço vertical na curva, e saem do grupo em risco
no dia em que foram vistos pela última vez. Corrige o viés mais comum do ciclo de vendas: medir só as
oportunidades fechadas encurta o ciclo, porque as longas ainda estão abertas.

O evento honesto é a decisão, ganho ou perda, e não só o ganho. Perda tratada como censura faz a
curva descer devagar demais e infla a chance de ganhar.

## Quando usar

- Tempo até um evento quando parte relevante dos casos ainda não terminou: decisão, primeiro contato,
  agenda.
- Comparar 2 ou 3 origens ou períodos, com a tabela de em risco por curva.
- Ler a mediana de tempo onde a curva cruza 50%, sem esperar todos os casos fecharem.
- Amostra a partir de umas centenas de casos, com a cauda tracejada quando o grupo em risco fica
  pequeno.

## Quando evitar

- Todos os casos já encerrados: a ECDF (modelo 04) basta e é mais familiar.
- Separar ganho de perda como desfechos concorrentes: pede incidência acumulada, fora desta família.
- Painel executivo sem espaço para a tabela de em risco, que é parte da leitura.
- Série de um valor ao longo do tempo, sem evento por caso: família 04 de linhas.

## Anatomia

1. **Degrau, nunca reta.** `stepAfter`: a estimativa vale a partir do dia do evento até o próximo.
2. **Censura em traço vertical**, em `Scatter` com `shape` própria, na cor da curva dona. Um traço
   por dia distinto, não por caso. A `shape` desenha de `cx` e `cy` e não usa raio.
3. **Convenção do estimador**: no mesmo dia o evento sai do grupo em risco antes da censura. Dia só
   com censura não mexe a altura, só reduz o grupo.
4. **Guia em 50% e mediana no cruzamento**, escrita com a unidade (`metade decide em até 58 dias`).
   Curva que não cruza 50% devolve `null` e escreve que a mediana não existe.
5. **Tabela de em risco em Tailwind com as mesmas margens do gráfico**: a coluna da esquerda vale a
   margem mais a largura do eixo Y, e cada número fica a (tique sobre teto do domínio) por cento do
   plano, centrado no tique de cima. Muda a margem do gráfico, muda a constante da tabela.
6. **Sentido escrito**: o eixo vertical diz se é "ainda sem decisão" ou "já contatados".
7. **Altura do eixo X em constante** (`X_AXIS_HEIGHT = 26`, EIX-6b) e grade nos dois sentidos, porque
   os dois eixos são lidos por posição (EIX-3b).

## Versões

- `v1_tempo-ate-a-decisao`: 520 oportunidades de 2026, 87 ainda abertas
  entram como censura; metade decide em até 58 dias, com guia em 50% e tabela de em risco.
- `v2_indicacao-contra-midia-paga`: duas curvas, uma por origem, cada uma na cor do próprio slot, com
  a mediana de cada uma rotulada (37 e 75 dias), censuras na cor da origem e uma linha de em risco por
  origem. Legenda com n total e n aberto.
- `v3_primeiro-contato-humano`: leads de dia útil e de fim de semana, minutos até o primeiro contato
  humano, com o SLA de 30 minutos em guia vertical e o percentual ainda sem contato lido no
  cruzamento, 25% e 81%. A propriedade `inverted` vira o eixo para "já contatados".
- `v4_cauda-rala`: 400 oportunidades, com 11 em risco depois de 180 dias. A curva é tracejada a partir
  do dia em que restam menos de 15 em risco, o eixo X fica fixo em 240 dias e a tabela de em risco
  destaca os números abaixo do piso. Canvas `alto`, desvio declarado no `meta.json`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`.
2. A função `kaplanMeier` agrupa eventos e censuras por dia. O dado de entrada é uma linha por caso,
   com o tempo observado e o indicador de evento; troque `days` ou `minutes` e `decided` ou `reached`
   pelos campos da consulta, sem mexer na função.
3. O evento é a decisão, ganho ou perda. Se a consulta traz só ganhos, a perda precisa vir como evento,
   nunca como censura.
4. A guarda de vazio testa a lista de casos que alimenta as contas. Mediana e percentual sem base
   devolvem `null`, nunca zero.
5. A tabela de em risco depende de `GUTTER` e de `MARGIN.right` iguais aos do gráfico. Ao mudar a
   largura do eixo Y, mude a constante e a tabela acompanha.
6. Cada curva leva a cor do slot do grupo, vindo do dado (`slot`), nunca da posição na lista.
7. Embrulhe no `VisualCard`, passando `title` e `useCase` do `meta.json` como `title` e `subtitle`.
8. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e confira os dois temas.

## Referências

- Catálogo: [lifelines, KaplanMeierFitter](https://lifelines.readthedocs.io/en/latest/fitters/univariate/KaplanMeierFitter.html): observar a curva com censura e a tabela de em risco como extensão do gráfico.
- Catálogo: [survminer, ggsurvplot](https://rpkgs.datanovia.com/survminer/): observar a tabela de número em risco alinhada ao eixo X e os traços de censura.
- Praticante: [Clark et al., Survival analysis part I, British Journal of Cancer](https://www.nature.com/articles/6601118): observar a defesa da censura e da leitura da mediana.
- Praticante: [Wikipedia, Kaplan-Meier estimator](https://en.wikipedia.org/wiki/Kaplan%E2%80%93Meier_estimator): observar a fórmula e a convenção de empate entre evento e censura.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-05, quatro versões julgadas e aprovadas. Nenhum item abaixo muda o que o desenho afirma.

- v1, v2, v3 e v4: os tiques do eixo X saem sem unidade (NUM-6); a unidade está escrita uma vez, no subtítulo do eixo (v1 e v4) ou no rodapé (v2 e v3). Em v2 ela fica longe do eixo, na última linha do cartão.
- v1, v2, v3 e v4: a linha de leitura (`<p>`) e as frases de rodapé com número não levam `tabular-nums` (TIP-1); sem consequência no preview.
- v1, v2, v3 e v4: grade nos dois sentidos apoiada na EIX-3b, que nomeia dispersão, bolhas, matriz e quadrante e não nomeia curva sobre eixo X numérico. Os dois eixos são quantitativos e a mediana se lê por posição em X e em Y, então a exceção foi aceita; falta o contrato dizer isso.
- v1: o último traço de censura, perto do dia 277, desce cerca de 3 px abaixo da linha de 0% porque a curva está a menos de 1% do chão. Não corta nem cobre texto.
- v2: a legenda lista indicação e depois mídia paga, e no plano a curva de mídia paga fica por cima (ROT-4). A ordem segue a leitura da esquerda para a direita e os rótulos de mediana repetem os nomes; vale inverter se a legenda passar a ser empilhada.
- v2: as duas linhas da tabela de em risco se identificam pela amostra de cor e pela frase "na ordem da legenda", sem o nome da origem na linha (ACE-2 no limite). O nome curto no lugar da amostra resolveria, se couber nos 60 px da coluna.
- v2: os zeros da indicação de 210 dias em diante são contagem medida (a curva termina no dia 197), não ausência. Correto, e fica anotado porque parece lacuna à primeira vista.
- v3: a guia vertical do SLA não tem rótulo próprio (ANO-3); o nome e o valor estão na linha de leitura, no rodapé e nos dois rótulos de cruzamento, e o tique 30 cai embaixo dela.
- v3: sem tabela de em risco, que o próprio README trata como parte da leitura. O desvio está declarado no `meta.json` e a pergunta se lê aos 30 minutos, onde o grupo em risco é grande; a cauda do fim de semana depois de 300 minutos fica sem o número de em risco à vista.
- v3: o `useCase` pergunta quanto a mais se espera e a peça responde com o percentual sem contato no SLA (25% e 81%), sem a diferença em minutos entre as medianas. É o que o catálogo pede em "o que demonstra"; a linha de leitura poderia dizer a distância.
- v3: 17 linhas verticais de grade no canvas largo, uma a cada 30 minutos; passo de 60 com o SLA forçado como tique deixaria o plano mais calmo.
- v3: o modo `inverted` não tem render de conferência; foi lido só no código. Nele a frase acessível continua dizendo "curvas de sobrevivência" embora o eixo passe a ser "já contatados".
- v4: o rótulo "menos de 15 em risco: queda não confiável" fica à esquerda da guia, sobre o trecho sólido e confiável, porque à direita não cabe. O tracejado, os números em destaque e o rodapé desfazem a dúvida, mas um texto que aponte o lado ("daqui em diante, menos de 15 em risco") leria melhor.
- v4: o dia em que a curva passa a tracejada (171) e o valor da curva aos 180 dias só aparecem na frase acessível (DAD-9 no limite); no cartão se leem pela posição.
- v4: o rodapé escreve "eixo fixo em 240 dias" a partir de `DOMAIN_END_DAYS`, mas o domínio usa o maior entre a constante e o dado. Com dado mais longo que 240 dias o rodapé mentiria; deveria escrever o teto calculado. Com o dado padrão (maior tempo de 231 dias) o piso de 240 coincide com o arredondamento automático, então a diferença para a v1 não se vê no preview.
