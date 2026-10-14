# Roadmap por horizonte

## O que é

Colunas de horizonte (agora, próximo, depois) sem datas firmes, com um cartão por iniciativa. A posição horizontal diz sequência e prioridade, nunca prazo: o subtítulo de cada versão declara que a distância entre as colunas não é tempo. É uma grade CSS com Tailwind, opcionalmente cortada em faixas por público, e cada cartão traz título, público ou confiança e um id estável no dado. A ordem dentro da coluna vem da prioridade declarada, nunca da ordem alfabética. Quando uma iniciativa ganha data comprometida, ela sai daqui e vai para o Gantt (`20/01`) com o mesmo id.

## Quando usar

- Planejamento sem datas comprometidas, em que a pergunta é o que vem antes do quê.
- De 6 a cerca de 30 iniciativas distribuídas em 3 ou 4 horizontes.
- Comunicar prioridade à Diretoria sem transformar estimativa em promessa de prazo.
- Separar a mesma lista por público em faixas, com a mesma régua de horizontes.

## Quando evitar

- Há datas comprometidas: use o Gantt (`20/01`).
- Eventos pontuais com data exata: use a linha do tempo de marcos (`20/02`).
- O encadeamento entre tarefas define o prazo: use o Gantt com dependências (`20/09`).
- A pergunta é quanto de cada iniciativa está pronto: use progresso e meta (família 13).
- Priorizar por esforço contra impacto: use a matriz de quadrantes (família 25).

## Anatomia

1. Subtítulo ou linha de leitura no topo, declarando que não há escala de tempo (`text-text-secondary`, 12 px, ANO-5).
2. Cabeçalho de coluna com o nome do horizonte em `font-semibold` e a contagem em `kpi-number`, por `formatInt`.
3. Cartão em `bg-surface-sunken`, com prioridade ordinal (`1º`), título, público com ícone lucide e, conforme a versão, selo de confiança, selo de data ou motivo.
4. Grade `grid-cols-3` (ou 4 colunas na v4; faixas por horizontes na v3 com rótulo de 80 px e container query `@xl`).
5. Cor por público só na borda esquerda do cartão, por `var(--chart-N)` na ordem 1, 3, 6, 5; sem público em `var(--line-strong)`.
6. Estados: recorte vazio em `role="status"` com o ícone `Filter`; coluna sem iniciativa mantida na grade com o texto dela; descartado rebaixado em `text-text-muted`.

## Versões

- `v1_roadmap-de-paineis-do-farol`: 12 painéis fictícios em três colunas, contagem por coluna, público em texto e ícone e ordem pela prioridade do dado, com a lista de entrada fora de ordem.
- `v2_confianca-por-iniciativa`: 10 iniciativas de 2027 com selo alta, média ou baixa em palavra e ícone, borda tracejada na baixa, legenda única no rodapé e linha de leitura que só afirma a queda quando a conta confirma.
- `v3_roadmap-por-publico`: 24 iniciativas em quatro faixas por três horizontes, rótulo de faixa fixo, cor por público na borda, selo de data com `CalendarCheck`, contagem por célula e empilhamento por container query.
- `v4_horizonte-vazio-e-descartadas`: coluna depois vazia mantida na grade, quarta coluna de descartadas com motivo, iniciativa sem público por último em tom neutro e título longo com `line-clamp-2` e `title`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para a pasta de visuais da página.
2. Troque o `import` do `./data` pelo seletor real e passe `data` por prop; a prioridade e o horizonte vêm da fonte, e a lista pode chegar em qualquer ordem.
3. Mantenha o id da iniciativa igual ao do Gantt, para a visão com data comprometida continuar ligada.
4. Ponha o componente no corpo de um `VisualCard` com altura definida no pai e confira nos dois temas e a 390 px; a v3 empilha os horizontes abaixo de 576 px de largura.
5. Troque o estado vazio inline por `EmptyState` do Farol, mantendo o sentido do texto (seção 16 do CONTRATO).
6. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- Roadmap Agora, Próximo, Depois: formato de comunicação de prioridade sem prazo, popularizado em gestão de produto.
- Farol: `app/src/lib/format.ts` (`formatInt`, `formatDate`, `formatMonthLong`) e `app/src/styles/tokens.css` (`--chart-N`, `--surface-sunken`, `--line-strong`).
- Gantt (`20/01`) como destino da iniciativa que ganha data comprometida.

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-12, quatro versões julgadas: `v1` e `v2` aprovadas, `v3` e `v4` reprovadas com parecer em `validation/revisao_20_cronograma-e-linha-do-tempo__07_roadmap-por-horizonte_2026-10-12.md`. Nada abaixo reprova; quem tocar o arquivo alinha.

* `v2`, `v4`: número em Manrope sem `tabular-nums` (TIP-1) na linha de leitura (`3 de 3 agora, 1 de 4 no próximo` na `v2`; `3 ideias` e `2026` na `v4`). É texto corrido, sem coluna a alinhar, e nada muda no preview.
* `v1`: o `data.ts` não exercita título que quebre em duas linhas nem ausência (pergunta 23); o caso difícil é só a lista fora de ordem.
* `v2`: nada na tela diz que não há datas; a declaração só existe na frase acessível (`sem datas`), no sentido da DAD-9. A seção "O que é" deste README afirma que o subtítulo de cada versão declara isso, e na `v2` a linha de leitura fala só da confiança. Cabe na mesma linha, abrindo com `Sem datas comprometidas.`, ou a frase do README passa a citar só `v1`, `v3` e `v4`.
* `v2`: a legenda do rodapé repete a palavra que cada cartão já escreve, e a ROT-4 pede legenda só quando o rótulo direto não cabe. É item do catálogo; a única informação nova dela é `com borda tracejada`.
* `v2`: a borda tracejada em `--line-strong` mede 2,05:1 no escuro e 1,59:1 no claro contra `--surface-sunken`. Vale pela isenção da 17.2, porque `confiança baixa` está escrito no cartão; sozinha ela não seguraria o estado.
* `v2`: a frase acessível traz as contagens de alta por horizonte e não a conclusão que a linha de leitura, que é `aria-hidden`, dá em palavras (`A confiança cai com o horizonte`). O ano `2027` está escrito à mão no texto da frase, sem vir do dado.
* `v3`: a contagem da célula fica na calha entre as colunas, a 14,5 px do cartão dela e a 8,5 px do cartão da coluna seguinte (medido no PNG), sem substantivo (NUM-6). O total do cabeçalho (`8`) alinha pela borda do cartão, 20 px à esquerda da coluna das parcelas (TIP-6). O rodapé resolve com `O número à direita é a contagem da célula`; tirar o `pr-5` do cabeçalho põe total e parcelas na mesma coluna.
* `v3`: `Cobertura de mercado` quebra em duas linhas no cartão de 145 px, e a faixa da Diretoria sai com 108 px em vez dos 92 da nota do `meta.json`. Cabe: a última tinta fica a 6,5 px do fim do corpo. A nota soma 456 de altura e o desenho mede cerca de 464.
* `v4`: o título longo é cortado em duas linhas por `line-clamp-2`, e a cauda (`no trimestre corrente`) só existe no atributo `title` e no DOM. É o quarto item do catálogo e está declarado na nota do `meta.json`; a TIP-7 e a DIC-1 dizem o contrário para nome de marca, e a escolha entre as duas réguas é do dono. No `preview.svg` o corte sai sem reticências (`ativa`), e na página viva sai com elas (`ativ...`).
* `v4`: a borda neutra do cartão sem público, em `--line-strong`, mede 2,05:1 no escuro e 1,59:1 no claro contra o cartão. Vale porque `Sem público declarado` está escrito; a 17.2 dá `--text-muted` como contorno de ausência, que mede 5,98:1 e 4,65:1 na mesma superfície.
* `v4`: a linha de leitura repete o subtítulo (`3 ideias descartadas no ciclo`), contra a ANO-5; chama de `ideias` o que a coluna conta como `iniciativas`; e o plural é fixo, então com uma descartada sairia `1 ideias descartadas`.
* `v1`, `v2`, `v3`: o `useCase` do `meta.json` encurta o do catálogo (`sem data` no lugar de `sem compromisso de data`; `escrito no cartão` no lugar de `com a confiança escrita no cartão`; `quatro públicos` no lugar dos quatro nomes). O sentido se mantém; na `v2` a concordância ficou solta.
* Modelo: as quatro versões usam moldura `stage`, com os cartões em `--surface-sunken` direto sobre `--surface-canvas` (1,05:1 no escuro e 1,09:1 no claro), e o passo 4 de "Como colar no Farol" manda pôr o componente no corpo de um `VisualCard`, onde o poço mede 1,15:1 contra `--surface-raised` nos dois temas. O preview não mostra a superfície em que o README manda usar. A Anatomia, item 3, descreve a prioridade ordinal em todo cartão, e ela só existe na `v1` e na `v4`.

Revisão de 2026-10-12, segunda passada, depois da rodada única de correção: `v3` e `v4` julgadas de novo pelo arquivo atual e aprovadas. Os dois bloqueantes do parecer saíram. Na `v3` a frase do topo passou a ser calculada (`só 4 de 24 iniciativas têm data comprometida`) e concorda com os quatro selos, o rodapé e a frase acessível. Na `v4` a ordenação ficou só pela prioridade e o `data.ts` declara a iniciativa sem público como 3, então o ordinal impresso é a prioridade declarada. Nada abaixo reprova.

* `v3`: no ramo de uma só iniciativa com data, a frase do topo sai `só 1 de 24 iniciativa tem data comprometida`; o substantivo segue o total (`iniciativas`) e só o verbo vai para o singular. Na frase acessível o mesmo ramo sai `1 já têm data no Gantt`. Não aparece no preview, que tem 4.
* `v3`, `v4`: a linha de leitura não leva `aria-hidden`, que a ANO-5 pede porque a frase acessível da raiz já diz o mesmo; o leitor de tela ouve as duas. A `v1` está igual e a `v2` já tem o atributo. Sem consequência visível.
* `v3`: no layout largo o cabeçalho dos horizontes é `aria-hidden` e o rótulo de horizonte de cada célula está em `@xl:hidden`, então a lista de cada célula chega ao leitor de tela sem o nome do horizonte; só os totais da frase acessível o dizem. Um `aria-label` com o horizonte em cada `ol` resolve.
* `v4`: o `por último` da iniciativa sem público agora vem da prioridade declarada, mas só o comentário da linha 54 do `Chart.tsx` diz isso. O comentário do topo do `Chart.tsx` ainda descreve `vem por último` como comportamento do componente, e o cabeçalho do `data.ts` e a nota do `meta.json` não tocam no assunto. Com outro dado, uma iniciativa sem público de prioridade 1 sai em primeiro, que é o certo.
* `v3`, `v4`: as observações da primeira passada continuam valendo como estavam, porque a correção não mexeu nelas. Na `v3`: contagem na calha sem substantivo, total do cabeçalho fora da coluna das parcelas e nota do `meta.json` com a altura antiga. Na `v4`: `line-clamp-2` contra a TIP-7 e a DIC-1, linha de leitura sem `tabular-nums`, que repete o subtítulo e tem plural fixo em `ideias`, e borda neutra em `--line-strong`.
* Medido nesta passada, para a aprovação não ficar sem número: PNG do `preview.svg` contra a página viva, 0,16% e 0,17% de pixels diferentes na `v3` e 0,02% na `v4` (limiar de 24 em 255 por pixel); última tinta em 534 de 540 px na `v3` e em 368 de 380 px na `v4`; par de texto mais fraco 4,65:1 (`--text-muted` sobre `--surface-sunken`, tema claro) e bordas de público de 4,67:1 a 10,90:1 contra o cartão.
