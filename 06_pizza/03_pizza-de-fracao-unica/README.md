# Pizza de fração única

## O que é

Uma pizza de dois setores: a parte, em cor de destaque a partir das 12 horas, e o restante, como
trilho neutro. O todo está implícito na forma, então a peça funciona como glifo ao lado de um
número grande, não como gráfico autônomo; o restante nunca é uma segunda categoria, é fundo.

## Quando usar

- Uma parte contra o restante de um todo existente, entre 5% e 95%, lida num relance como um
  quarto, metade ou três quartos.
- Glifo de 24 a 48 px ao lado do número de KPI, reforçando a fração sem ocupar o corpo do card.
- Coluna de glifos repetidos numa tabela, com o percentual sempre escrito ao lado de cada linha.

## Quando evitar

- Fração abaixo de 5% ou acima de 95%: vira lasca ou disco ilegível; usar número com barra de
  progresso (modelo 06 da família 13).
- Caminho até uma meta que pode ser ultrapassada: progresso e meta (família 13), nunca esta pizza.
- Mais de uma parte relevante no mesmo todo: pizza simples (modelo 01 desta família).
- Comparar a mesma fração entre muitos grupos com precisão: barra em célula (modelo 14).

## Anatomia

1. `Pie` com dois itens só: a parte de indicação e o restante, `startAngle={90}` e
   `endAngle={-270}` para começar às 12 horas e girar no sentido horário, a mesma convenção do
   resto da família.
2. Parte em `var(--chart-1)`, sempre a mesma cor de destaque em todo o painel; restante em
   `var(--line-strong)`, o neutro de dado do catálogo (COR-8), nunca em `--surface-overlay`, que
   no tema claro é o mesmo branco do cartão e apaga o contorno da fatia.
3. Separador entre as duas fatias em `stroke="var(--surface-raised)"`, a cor do cartão (COR-5).
4. Número grande (`kpi-number`, Space Grotesk 600, `--text-primary`) ao lado do glifo, calculado
   por `formatPercent`, nunca escrito dentro da pizza cheia.
5. Par de fração e volume (`formatRateWithVolume`) numa linha de apoio abaixo do número, para a
   base da conta ficar explícita (NUM-1, NUM-4).
6. Linha final nomeando o restante por extenso, com contagem e percentual (`formatInt`,
   `formatPercent`), porque numa pizza toda parte precisa de nome e número no desenho parado e os
   percentuais impressos precisam somar o todo (ROT-10).
7. Cartão próprio com borda `--line-subtle` e fundo `--surface-raised`, porque a moldura é
   `stage`: o Chart já é o cartão inteiro, não vai dentro de um `VisualCard`.
8. `total` igual a zero troca o glifo inteiro por um bloco `role="status"` com o ícone `Filter`
   (EST-1).
9. Tique do período anterior (`v2`): uma `<line>` radial em `var(--text-muted)` só por fora do contorno, com anel na cor da superfície e dentro de `ZIndexLayer` (zIndex 600, acima do Pie), com o
   centro e o raio refeitos em TypeScript a partir de `useChartWidth`, `useChartHeight` e da mesma
   margem declarada no `PieChart`, mais o rótulo em duas linhas ("Anterior" e o valor) fora do disco, ancorado
   pelo sinal do cosseno do ângulo.
10. Glifo de tabela (`v3` e `v4`): `path` de arco em SVG puro, sem `PieChart`, com a fração cheia
    tratada como `<circle>` porque um arco único de 360 graus degenera; trilho em
    `var(--line-strong)` e setor em `var(--chart-1)`, a mesma dupla da `v1`.
11. Contorno tracejado de ausência (`v4`): `<circle>` sem preenchimento, traço
    `var(--text-muted)` e `strokeDasharray`, com `formatUnavailable()` e o ícone `Unplug` ao lado
    (EST-2), nunca uma fatia zerada.

## Versões

- `v1_indicacao-nas-oportunidades-ganhas`: fração das oportunidades ganhas no trimestre que
  vieram de indicação. Demonstra o `Pie` de dois itens com a parte em `--chart-1` e o restante em
  `--line-strong` fora de `--surface-overlay`, o número grande em `kpi-number` ao lado do glifo e
  o par de fração e volume por `formatRateWithVolume`.
- `v2_tique-do-trimestre-anterior`: a mesma fração com um tique radial do trimestre passado no
  contorno. Demonstra o ângulo do tique calculado em TypeScript na convenção do Recharts, o mesmo
  centro e o mesmo raio do `Pie`, a variação em pontos percentuais com sinal tipográfico e a base
  nomeada na mesma linha, e o rótulo curto do tique em `--text-muted` fora do disco.
- `v3_glifos-de-cobertura-na-tabela-de-origens`: cobertura de qualificação por origem de lead, um
  glifo de 20 px por linha. Demonstra o `path` de arco calculado em TypeScript em vez de um
  `PieChart` por linha, a fração cheia desenhada como círculo, a tabela em HTML com Tailwind e o
  percentual à direita em `tabular-nums`, e a origem com menos de 10 leads saindo pelo par de
  volume e taxa.
- `v4_zero-indisponivel-e-extremos`: os quatro estados em que o glifo deixa de servir. Demonstra o
  trilho vazio com o zero escrito, o contorno tracejado com `formatUnavailable()` e o ícone
  `Unplug`, e a troca do glifo pelo número abaixo de 5% e acima de 95%, sempre na mesma caixa de
  44 px.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para uma pasta do visual na página, por exemplo
   `app/src/pages/<pagina>/visuals/ReferralShareCard/`.
2. Troque o `import` do `./data` pelo dado real da página e passe `data` pela prop; o default do
   `data.ts` fica só como amostra do catálogo.
3. A moldura difere por versão, e isso decide o embrulho: `v1` e `v2` são `stage` e já desenham o
   cartão inteiro, então vão direto na grade, sem `VisualCard` em volta, com altura no pai (`h-32`
   ou similar) ou pela prop `height`. `v3` e `v4` são `card` e não desenham moldura própria (ESP-4),
   então vão dentro de um `VisualCard`.
4. Na `v2`, o tique lê a caixa do gráfico pelos hooks do Recharts; se a caixa do glifo mudar de
   tamanho, revise `MARGIN`, porque são os 56 px da direita que abrem a faixa do rótulo fora do
   disco. Na `v3` e na `v4`, o raio do glifo é constante do topo do arquivo: mexer nele muda a
   geometria de todas as linhas de uma vez, que é o ponto.
5. Rode `npm run typecheck` e `npm run lint` no `app/`.

## Referências

- [Nightingale, Have I Resolved the Pie Chart Debate?](https://nightingaledvs.com/have-i-resolved-the-pie-chart-debate/): observar os seis critérios e a distinção entre perceber fração e comparar partes.
- [Datawrapper Academy, what to consider when creating a pie chart](https://www.datawrapper.de/academy/what-to-consider-when-creating-a-pie-chart): observar "pizza pode ser desnecessária com dois valores" e "funciona melhor perto de 25%, 50% ou 75%".
- [Wikipedia, pie chart](https://en.wikipedia.org/wiki/Pie_chart): observar que a pizza funciona para comparar uma categoria contra o total.
- [Behance, Dark Dashboard Elements (Freebie)](https://www.behance.net/gallery/15518771/Dark-Dashboard-Elements-%28Freebie%29): círculos de progresso e pizzas pequenas em kit escuro, referência de escala para o glifo.

## Observações da revisão (não bloqueantes)

- `v1_indicacao-nas-oportunidades-ganhas`: o percentual 38,0% aparece duas vezes na mesma coluna,
  no número grande e no par de fração e volume logo abaixo. É a escolha do catálogo (volume junto
  da taxa vence, por precedência), mas quem colar num painel apertado pode preferir escrever só
  "19 de 50" na linha de apoio.
- `v1_indicacao-nas-oportunidades-ganhas`: a moldura é `stage`, então a página de conferência já
  imprime o título acima do cartão e o rótulo interno repete a mesma frase. No Farol o cartão terá
  título próprio e a repetição some; no PNG de revisão ela fica visível.
- `v1_indicacao-nas-oportunidades-ganhas`: o dado é um caso confortável (19 de 50, fração perto de
  um terço) e não exercita nome longo, valor pequeno nem ausência. Os casos difíceis vivem na
  `v4_zero-indisponivel-e-extremos`, que é justamente o que ela demonstra.
- `v1_indicacao-nas-oportunidades-ganhas`: a linha "Demais 31 (62,0%) de outras origens" está em
  11 px, o piso da TIP-2, e é o texto mais apertado da peça; num glifo menor que 48 px convém
  conferir se ela ainda cabe em uma linha.
- Ferramenta: a guarda `CONTRASTE-TEXTO` não mede esta versão (motivo `texto_em_html`), porque
  todo o texto vive em HTML com Tailwind. O contraste foi conferido à mão contra a tabela 17.10 e
  os quatro pares usados estão aprovados nos dois temas.
- `v3_glifos-de-cobertura-na-tabela-de-origens`: a linha de 100% desenha um disco cheio, e é o único
  ponto da faixa acima de 95% em que o glifo não mente, porque ali o disco é a leitura certa. Entre
  96% e 99% ele seria indistinguível de 100%, e é a `v4` que mostra a saída: o número no lugar do
  glifo. O percentual escrito em toda linha é o que sustenta a coluna inteira.
- `v3_glifos-de-cobertura-na-tabela-de-origens`: o glifo de 20 px não leva o contorno em
  `--surface-raised` da COR-5 que a `v1` usa entre as fatias. Num diâmetro desse tamanho um traço de
  2 px come metade da marca, e as duas cores já se separam por luminância (`--chart-1` mede 9,50:1
  contra o cartão e `--line-strong` 1,79:1). Desvio consciente, não esquecimento.
- `v4_zero-indisponivel-e-extremos`: nos estados `too-small` e `too-large` o percentual aparece duas
  vezes, na caixa do glifo e no par logo abaixo. É o preço de manter a caixa do mesmo tamanho nos
  quatro estados; quem colar num painel apertado pode escrever só o volume na linha de apoio.
- `v4_zero-indisponivel-e-extremos`: o ramo `readable` existe no código e não aparece no preview,
  porque o dado desta versão é feito só dos quatro estados que quebram o glifo. O desenho dele é o
  mesmo da `v1` e da `v3`, e é a `v1` que serve de retrato do caso normal.
- Ferramenta: nas quatro versões a guarda `FORMATO-ACESSIVEL` mede pouco ou nada (`v2` e `v3` pelo
  par de argumentos, `v4` por `frase_sem_formatador`), porque o texto do número é calculado num
  lugar só e reaproveitado na frase acessível e no corpo. A identidade é por construção, o que é mais
  forte que a comparação de chamadas, mas o `check` não tem como ver isso.
- Ferramenta: `COLISAO-TEXTO`, `CONTRASTE-TEXTO` e `TEXTO-NA-MARCA` não medem a `v3` nem a `v4`
  (motivo `texto_em_html`), porque o texto todo vive em HTML com Tailwind e só os glifos são SVG. O
  contraste foi conferido à mão contra a tabela 17.10: `--text-primary`, `--text-secondary` e
  `--text-muted` sobre `--surface-raised` passam nos dois temas, e nenhum texto fica sobre marca.
- `v2_tique-do-trimestre-anterior`: o percentual corrente aparece duas vezes na coluna de texto,
  como na `v1`, porque o par de volume e taxa vence por precedência. O rótulo do tique repete o
  percentual anterior que a linha de variação já nomeia; é repetição deliberada, porque o número
  ao lado do traço é o que liga o desenho à frase, e sem ele o traço no contorno não diz o que é.
- `v3_glifos-de-cobertura-na-tabela-de-origens`: o glifo fica antes do nome, e não entre o nome e o
  número. Com o glifo no meio, a coluna de nome absorve a sobra da tabela e empurra o glifo para
  longe da linha que ele descreve; dar a sobra à coluna do glifo resolveria a distância mas faz o
  nome mais longo quebrar em duas linhas, e aí a linha passa de 36 px para 48 px e a tabela estoura
  o corpo. Medido no render, nas duas tentativas.
- Ferramenta: a `v2` e a `v4` carregam o mesmo aviso de `CONTRASTE-MARCA` que a `v1`, porque o
  trilho em `--line-strong` mede 1,79:1 no escuro e 1,83:1 no claro contra o cartão. A guarda
  orienta e não reprova, e a tensão é entre duas regras do contrato: a TOK-1 endossa o token como
  estrutura e a tabela 17.2 o aceita como neutro de dado desde que o valor venha escrito, que é o
  caso nas quatro versões. Trocar por `--surface-sunken` mede 1,15:1 e é pior. A `v3` não recebe o
  aviso porque o glifo de 20 px sai como `sem_marca` na guarda, e não porque esteja acima do piso.

Revisão de 2026-10-14 (`v2` reprovada, `v3` e `v4` aprovadas; os bloqueantes da `v2` estão em
`validation/revisao_06_pizza__03_pizza-de-fracao-unica_2026-10-14.md`):

- `v2_tique-do-trimestre-anterior`: o rótulo do tique só cabe na caixa de 132 por 88 px para fração anterior entre cerca de 10% e 40%; em 50% a âncora cai em y=92, perto de 0% em y=−4, e acima de 50% o `textAnchor="end"` sai pela margem esquerda de 4 px (em 75% a âncora fica em x=−8).
- `v2_tique-do-trimestre-anterior`: a frase acessível termina em "p.p..", com ponto duplo, porque `pointsText` já acaba em ponto.
- `v2_tique-do-trimestre-anterior`: a cor da variação é decidida no código (alta pinta `--positive`) sem `goodDirection` no dado (COR-6); defensável para indicação, mas quem colar com outra métrica herda o verde.
- `v2_tique-do-trimestre-anterior`: `truncate` latente (TIP-7) na linha de variação, cuja cauda carrega o período da base, e na linha do restante, cujo conteúdo não está na frase acessível; cabe com folga hoje.
- `v3_glifos-de-cobertura-na-tabela-de-origens`: a frase acessível toma a última linha da tabela como "menor", e a origem sem lead vai para o fim pela ordenação; com uma linha assim no dado a frase diria "menor em <origem>, indisponível". Tomar a última linha com cobertura medida. O dado padrão não exercita esse ramo.
- `v3_glifos-de-cobertura-na-tabela-de-origens`: o percentual em `kpi-number` sem peso declarado pede Space Grotesk 400, que não é carregada (TIP-4); o navegador cai para 500 e não há efeito visível. Declarar `font-medium`.
- `v3_glifos-de-cobertura-na-tabela-de-origens`: a segunda nota do rodapé ("o glifo é o mesmo em toda linha e quem mede fino é o percentual") é comentário de catálogo e, colada no Farol, não informa nada sobre o dado.
- `v3_glifos-de-cobertura-na-tabela-de-origens`: o `useCase` do `meta.json` perdeu o fim da pergunta do catálogo ("para entrar no CPL qualificado").
- `v4_zero-indisponivel-e-extremos`: nem o corpo nem a frase acessível dizem de que é a fração; "0% (0 de 34)" fica sem o nome da parte. E os recortes têm nome de origem ("Mídia paga", com a nota "a coleta da origem parou"), enquanto o `data.ts` define a parte como "quantas vieram de indicação": fração de indicação dentro de uma origem não fecha. Trocar os recortes por algo que não seja origem (equipe, região) e nomear a parte no rodapé.
- `v4_zero-indisponivel-e-extremos`: `truncate` latente (TIP-7) no nome do recorte, que é o nome da marca; os nomes curtos cabem hoje na coluna de 131 px.
- `v4_zero-indisponivel-e-extremos`: o par de taxa e volume em `kpi-number` sem peso pede Space Grotesk 400 (TIP-4), como na `v3`.
- `v4_zero-indisponivel-e-extremos`: 100% cai no estado `too-large` e vira número, enquanto a `v3` desenha 100% como disco cheio; a regra do modelo para a fração cheia difere entre as duas versões.

Revisão de 2026-10-14, segunda passada da `v2` (aprovada; os dois bloqueantes da primeira passada foram corrigidos):

- `v2_tique-do-trimestre-anterior`: com o rótulo em duas linhas, a faixa em que ele cabe na caixa de 132 por 88 px ficou mais estreita, de cerca de 12% a 36% de fração anterior. A âncora precisa ficar entre y=9,7 e y=74,6 para as duas linhas caberem, e os ramos `end` e `middle` do `textAnchor` nunca cabem com 4 px de margem à esquerda, em cima e embaixo. A observação da primeira passada não foi atendida; antes de colar no Farol, decidir a posição do rótulo nos quatro quadrantes.
- `v2_tique-do-trimestre-anterior`: "Anterior" termina a 1,5 px da borda do SVG, que recorta (x=130,5 de 132, medido no PNG). Não aparece no preview, mas com a fonte de reserva o "r" final pode sair cortado.
- `v2_tique-do-trimestre-anterior`: o rótulo do tique em `font-display` sem peso declarado pede Space Grotesk 400, que não é carregada (TIP-4); o navegador cai para 500 e não há efeito visível. Declarar `fontWeight={500}`, como já se pediu na `v3` e na `v4`.
- `v2_tique-do-trimestre-anterior`: continuam valendo três observações da primeira passada: o ponto duplo em "p.p.." no fim da frase acessível (que ainda diz "alta de +13 p.p.", palavra e sinal juntos), a polaridade da cor decidida no código sem `goodDirection` (COR-6) e o `truncate` latente da TIP-7 nas duas linhas de 11 px.
- `v2_tique-do-trimestre-anterior`: a contagem solta "Demais 31 (62,0%) de outras origens" não leva o substantivo da NUM-6; o rótulo "Ganhos por indicação" supre o sentido, mas "Demais 31 ganhos (62,0%) de outras origens" fica explícito. Vale também para a `v1`.
- `v2_tique-do-trimestre-anterior`: a caixa do glifo (`h-[88px] w-[132px]`), a largura do anel (5) e do traço (2) do tique e os `dy` das duas linhas do rótulo estão escritos no JSX, e não como constantes no topo (seção 5). A caixa e a `MARGIN` dependem uma da outra, como diz o passo 4 de "Como colar no Farol", e nomear as duas juntas deixa essa ligação à vista.
