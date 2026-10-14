# Feed vertical de eventos

## O que é

Uma lista cronológica vertical com um trilho à esquerda, um marcador com o ícone do tipo de evento
em cada item e um cartão com título, autor fictício, data e detalhe. É o histórico de uma entidade
lido em sequência: tudo o que aconteceu com uma oportunidade, uma conta ou uma fila. Em HTML é uma
lista ordenada com `border-s` no trilho e o marcador `absolute`; a data relativa (há 3 dias) conta
sempre contra uma data de referência que vem do dado, a mesma para a lista inteira. Não tem escala
de tempo: a distância vertical entre dois cartões não significa duração.

## Quando usar

* Histórico detalhado de uma oportunidade, lead ou conta, lido de cima para baixo.
* Log de atividades de uma fila ou de uma pessoa agrupado por dia.
* Eventos com texto, autor e tipo que não cabem em rótulo de gráfico.
* Destacar passagens de dono e o tempo de espera entre elas.

## Quando evitar

* Comparar entidades ou durações: use o Gantt (20/01) ou a jornada (20/04).
* Eventos em que o intervalo entre eles é a leitura: use a linha do tempo de marcos (20/02).
* Poucos eventos para contar a história de um período: use a narrativa alternada (20/02).
* Contagem de eventos por dia: use o calendário ou o mapa de calor (família 15).

## Anatomia

1. **Trilho**, uma borda `border-s` em `--line-strong` na lista ordenada (`ol`), com o marcador de
   24 px centrado sobre ela por posição absoluta (`-start-[37px]`: 24 px de recuo do item, 12 de
   meio marcador e 1 de borda).
2. **Marcador** com o ícone lucide do tipo (`Phone`, `Mail`, `CalendarCheck`, `FileText`,
   `ArrowRightLeft`, `NotebookPen`); o ícone é o canal do tipo, a cor só destaca o evento mais
   recente (`--chart-1`) ou a passagem de dono (`--chart-2`).
3. **Cartão** em `--surface-sunken`, sem borda (ESP-5), com título, autor, data absoluta por
   `formatDate` e data relativa contra a data de referência do dado.
4. **Linha de leitura** no topo, com a ordem declarada (mais recente no topo) e um agregado
   calculado do dado.
5. **Ausência escrita**: sem data vai para o fim sob "data desconhecida"; sem autor usa
   `formatUnavailable()` com `Unplug`; lista vazia vira `role="status"`.

## Versões

* [`v1_historico-de-uma-oportunidade`](./v1_historico-de-uma-oportunidade/) ([preview](./v1_historico-de-uma-oportunidade/preview.svg)):
  10 eventos de OP-0412 em quatro tipos, mais recente no topo, com a data absoluta e a relativa.
* [`v2_handoff-com-tempo-de-espera`](./v2_handoff-com-tempo-de-espera/) ([preview](./v2_handoff-com-tempo-de-espera/preview.svg)):
  passagens de dono com `ArrowRightLeft` em `--chart-1` (`--chart-2` tem o mesmo hex de `--warning`, reservado ao alerta), a espera escrita no trilho (2 de 4 acima do
  limite de 2 dias, com ícone de alerta e o limite no texto) e os demais eventos rebaixados.
* [`v3_log-da-pre-vendas-agrupado-por-dia`](./v3_log-da-pre-vendas-agrupado-por-dia/) ([preview](./v3_log-da-pre-vendas-agrupado-por-dia/preview.svg)):
  64 atividades em 5 dias, cabeçalho de dia sticky com chips por tipo, três por dia e o resto em
  "mais N", filtro por tipo que diz quantas ficaram de fora.
* [`v4_evento-sem-data-e-texto-longo`](./v4_evento-sem-data-e-texto-longo/) ([preview](./v4_evento-sem-data-e-texto-longo/preview.svg)):
  histórico importado com evento sem data no fim, anotação de quase 3.000 caracteres em
  `line-clamp-3` com "ver mais", autor ausente e dois eventos no mesmo minuto em ordem estável.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão; o feed é HTML com Tailwind, sem `VisualCard` por baixo.
2. Troque `data` pela lista real e passe a data de referência da página em `referenceDate`
   (nas versões que a usam): nunca leia o relógio dentro do componente.
3. Ordene no componente, como já está: mais recente primeiro, empate pelo id. O dado pode chegar
   em qualquer ordem.
4. Na `v3`, com muitos dias, envolva a lista numa janela de itens com `@tanstack/react-virtual`
   (`estimateSize` por tipo: cabeçalho de dia, linha de atividade, linha de resumo). Ela fica fora
   do catálogo porque não está na lista de imports da seção 6 do contrato.
5. Troque o estado vazio inline por `EmptyState` do Farol, mantendo o sentido do texto.

## Referências

* [Flowbite, Timeline](https://flowbite.com/docs/components/timeline/): o padrão de lista ordenada com `border-s` e marcador absoluto que a `v1` segue.
* [lucide-react](https://lucide.dev/icons/): os ícones de tipo de evento.
* Pedido registrado: `@tanstack/react-virtual` na lista de imports, para a janela de itens da `v3`.
* Pedido registrado: um formatador de data relativa em `@/lib/format` (hoje cada versão calcula `há N dias` com `formatDays`).

## Observações da revisão (não bloqueantes)

Revisão de 2026-10-08, quatro versões julgadas: `v1`, `v3` e `v4` aprovadas, `v2` reprovada com parecer em `validation/revisao_20_cronograma-e-linha-do-tempo__06_feed-vertical-de-eventos_2026-10-08.md`. Nada abaixo reprova; quem tocar o arquivo alinha.

* `v1`, `v2`, `v3`, `v4`: número em Manrope sem `tabular-nums` (TIP-1) na linha de leitura das quatro, em `acima do limite de 2 dias` na `v2`, em `mais N atividades` na `v3` e no botão `ver mais, 2.942 caracteres` na `v4`. É texto corrido, sem coluna a alinhar, e nada muda no preview.
* `v1`, `v2`, `v4`: a lista não tem rolagem própria (a `v3` tem `min-h-0 flex-1 overflow-y-auto`); com mais eventos do que o canvas comporta, o conteúdo passa do corpo.
* `v1`, `v2`, `v4`: o tipo do evento só tem o ícone como canal, e o ícone é `aria-hidden`. Títulos como `Briefing registrado` e `Diagnóstico com a operação` não dizem o tipo, e quem ouve só recebe o tipo do primeiro e do último evento, pela frase acessível da `v1`.
* `v1`, `v2`, `v4`: `-start-[37px]` vai escrito na classe; a ESP-1 pede classe da escala ou constante nomeada. A conta (24 + 12 + 1) está na Anatomia.
* `v1`: o destaque do evento mais recente muda o peso do título de 500 para 600, e a COR-2 fala em 700; a diferença quase não se vê. O segundo canal existe (primeira posição, com a ordem declarada na linha de leitura).
* `v1`: a data absoluta não forma coluna (TIP-6). O rótulo relativo vem depois dela e tem largura variável, então o começo da data varia 26 px de imagem, 13 px de tela, entre `há 1 dia` e `há 64 dias`. Largura fixa no relativo alinha.
* `v1`: o `data.ts` não exercita título ou detalhe que quebre em duas linhas (pergunta 23); o caso difícil é só a ordem embaralhada e o singular `há 1 dia`. Evento posterior à data de referência sairia como `há` seguido de número negativo: ramo sem tratamento.
* `v1`: a nota do `meta.json` fala em 740 de altura e o canvas declarado é 750.
* `v2`: ramos de redação que o dado padrão não exercita. Com uma só espera acima do limite a frase acessível diria `1 esperas passaram`; com eventos e nenhuma passagem a linha de leitura escreve `0 de 0 esperas`, e a mensagem do estado vazio fala em passagem enquanto a guarda testa a lista de eventos (DAD-6).
* `v2`: `sem dono` é a redação do catálogo, mas a conta mede o tempo até o novo dono agir; a oportunidade tem dono desde a passagem. `sem ação do novo dono` diz o que foi medido.
* `v3`: a linha de leitura (`64 atividades de 09/11/2026 a 13/11/2026`) repete o subtítulo e não traz a conclusão que a frase acessível traz (dia mais cheio, 11/11/2026, com 15), contra a ANO-5.
* `v3`: o `useCase` do `meta.json` vem do catálogo com `2026-11-09` e `2026-11-13`, e a moldura imprime isso como subtítulo; a NUM-7 reserva esse formato ao dado e ao documento.
* `v3`: a conta `(n * 3) % 6` do `data.ts` só alcança dois dos seis autores declarados (`Bruna L.` e `Elias P.`); os outros quatro nunca aparecem.
* `v3`: os chips do cabeçalho de dia trazem ícone e número, sem substantivo (NUM-6), com o ícone em `aria-hidden`; a chave é a fila de filtros logo acima, na mesma ordem. O nome do dia começa em minúscula.
* `v3`: `mais N atividades` é texto e não controle: o resto do dia não se abre no componente.
* `v4`: aberto o `ver mais`, a anotação de 2.942 caracteres pede cerca de 31 linhas de 16,5 px (uns 510 px, medidos pelo passo de linha e pelos 96 caracteres por linha do preview) num corpo de 425 px, e a lista não rola. Pela conta passa do cartão; o render só fotografa o estado fechado, então não há imagem que confirme.
* `v4`: o trilho segue contínuo até o evento sem data, e a linha de leitura visível diz só `Do mais recente para o mais antigo`; que o sem data fica no fim, fora da ordem, só está na frase acessível. O marcador tracejado com `CircleHelp` e o texto `data desconhecida` seguram a leitura.
* `v4`: o contorno tracejado do marcador sem data usa `--line-strong` (1,79:1 no escuro, 1,83:1 no claro); a 17.2 dá `--text-muted` ao contorno de ausência (5,21:1 e 5,37:1). Passa pela isenção do valor escrito ao lado.
* `v4`: a hora não é impressa. Os dois eventos do mesmo minuto aparecem só como `18/09/2026`, e `2 no mesmo minuto` não se confere no desenho. O desempate por id crescente põe o registro mais antigo em cima, numa lista que corre do mais recente para o mais antigo.
* `v4`: `LONG_NOTE_MIN_CHARS = 240` decide o botão por contagem de caracteres, e cabem cerca de 96 por linha; uma anotação de 240 a 280 caracteres ganharia `ver mais` sem ter o que abrir.
* `v4`: no PNG gerado do `preview.svg` a terceira linha da anotação termina sem reticências; na página viva (`.pagina.png`) elas aparecem. É da serialização, não do componente.
* `v4`: o `line-clamp-3` foi pesado contra a TIP-7 e não reprova: a anotação é texto de apoio e não nome de marca, o texto inteiro fica no DOM, o botão o abre e o desvio está declarado na nota do `meta.json`.
* `v4`: `LONG_NOTE_LIMIT` é exportado pelo `data.ts` e nenhum arquivo importa.

Revisão de 2026-10-08, segunda passada, só a `v2` (o código mudou depois do veredito): aprovada. O bloqueante da pergunta 11 saiu: o disco de passagem mede `#2dd4e8` no escuro e `#0b6d7d` no claro (`--chart-1`), o triângulo de alerta mede `#f5a524` e `#945808` (`--warning`), e o desvio do catálogo está na nota do `meta.json`. As observações da `v2` no parágrafo acima seguem valendo, porque a correção não tocou nenhuma. Nada abaixo reprova.

* `v2`: a Anatomia deste README, item 2, ainda diz que a passagem de dono usa `--chart-2`; o código, o `meta.json` e a linha da `v2` em Versões dizem `--chart-1`. Quem produzir a partir da Anatomia repete o bloqueante que acabou de sair.
* `v2`: `2 dias sem dono até agora` não diz que dia é agora. A conta vai até `referenceDate` (2026-10-03), que não aparece no corpo nem na frase acessível; a EIX-10 pede a data por `formatDate` na marca de parcial. A marca existe em palavra, e a data se deduz do cartão (01/10/2026 mais 2 dias).
* `v2`: o autor só é impresso nas passagens, dentro do detalhe. A espera conta até o primeiro evento do novo dono, e nos demais cartões não se lê quem agiu. No dado padrão a retomada é sempre o cartão vizinho e a leitura fecha; com evento de terceiro no meio, a espera ficaria escrita entre dois cartões que não a delimitam.
* `v2`: `waitOf` aceita `other.at >= event.at` com data sem hora. Evento do novo dono no mesmo dia e com id menor que o da passagem contaria como retomada, com espera de 0 dias. Ramo que o dado padrão não exercita.
* `v2`: a data do cartão pede Space Grotesk sem classe de peso e herda 400, que não está entre os carregados (TIP-4: 500, 600 e 700). O navegador resolve para 500 e nada muda no preview; as irmãs fazem o mesmo.
