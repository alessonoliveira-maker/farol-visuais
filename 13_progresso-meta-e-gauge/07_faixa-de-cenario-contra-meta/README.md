# Faixa de cenário contra meta

## O que é

A saída do planejamento não é um número, é um intervalo. A faixa entre o cenário pessimista e o otimista vira uma barra clara, o cenário base um traço forte dentro dela e a meta um traço externo de desenho diferente, sempre em `extendDomain` para não sumir quando passa do maior valor. O visual responde à pergunta que a diretoria faz de verdade: a meta cabe na faixa ou só no melhor caso. Em Recharts, `BarChart` horizontal com a barra flutuante clássica: série transparente empilhada até o piso, silenciada na legenda, mais a barra visível do piso ao teto, com o cenário base desenhado por dentro dela e a meta como `ReferenceLine`.

**Faixa sem nome é decoração de incerteza.** Cada versão declara o método por trás dos três números, porque nenhum leitor deveria precisar perguntar de onde veio o piso: qual cenário é qual, com que premissa cada ponta foi calculada, e a partir de quando o desenho deixa de ser medição e passa a ser projeção. As quatro versões também dizem, sem ambiguidade, se a meta que aparece é do **período** (o trimestre da faixa) ou do **ano**: nas v1 e v2 a meta é trimestral (2026-T4); nas v3 e v4 a meta é anual (2027), por isso repetida como uma única linha que cruza várias faixas ou comparada contra o ano cheio.

## Quando usar

- Cenários de planejamento com saída em faixa, do pessimista ao otimista, contra uma meta.
- Forecast do trimestre ou do ano com incerteza declarada, para ler na reunião de diretoria.
- De 1 a 6 linhas, uma por trimestre ou por área, com a mesma meta cruzando todas.
- Dizer em qual período a faixa passa a conter a meta, quando a meta é do conjunto e não de cada linha isolada.

## Quando evitar

- Cenário único, sem incerteza: use a barra de progresso com projeção (13/01).
- Faixa ao longo do tempo contínuo, sem meta para cruzar: é área de incerteza (família 05).
- Faixa entre dois pontos sem meta: é comparação de pontos (família 17).
- Piso e teto sem premissa declarada: sem o nome de cada ponta, a faixa vira decoração de incerteza em vez de método.

## Anatomia

1. **Eixo quantitativo:** `XAxis type="number"` a partir de zero (EIX-1), com domínio até o maior entre o teto da faixa e a meta, mais folga, calculado no componente. Tique por `formatCurrencyAxis`, porque a faixa larga se lê melhor com uma régua de fundo além dos valores escritos.
2. **Retângulo da faixa:** barra flutuante em duas séries empilhadas com o mesmo `stackId`: uma série `floor` transparente e sem participação na legenda (`legendType="none"`), e uma série `span` (teto menos piso) visível em `--chart-1`, desenhada por um `shape` próprio para o piso e o teto não dependerem de posição fixa no array.
3. **Marcador do cenário base:** traço vertical sólido em `--text-primary`, um pouco mais alto que a barra, na posição proporcional `(base − piso) / (teto − piso)` dentro do retângulo da própria faixa; o valor vai escrito ao lado ou abaixo, nunca só o traço.
4. **Traço da meta:** `ReferenceLine` tracejada (`strokeDasharray="3 3"`) em `--text-muted`, o token e o desenho de referência da tabela 17.2, sempre com `ifOverflow="extendDomain"` (ANO-3) e rótulo com nome e valor.
5. **Rótulos das pontas com premissa:** piso e teto levam o valor por `formatCurrencyCompact` e, a partir da v2, a premissa de cada ponta ao lado, curta o bastante para caber sem quebrar linha; halo (`ROT-7`) sempre que a etiqueta pode cair perto da linha da meta ou de outra marca.
6. **Nota de método:** uma linha muted abaixo do gráfico nomeia as três premissas por extenso e o mês ou trimestre fechado (`asOf`) que as alimenta, para a faixa nunca aparecer como número solto sem origem.

## Versões

- [`v1_receita-projetada-do-trimestre`](./v1_receita-projetada-do-trimestre/): faixa básica de uma linha, receita de 2026-T4 contra a meta trimestral de R$ 5,5 mi; piso e teto só com o valor, cenário base como traço sólido e meta como traço tracejado distinto, `ReferenceLine` em `extendDomain`. Meta de período. Previews: [escuro](./v1_receita-projetada-do-trimestre/preview.svg) e [claro](./v1_receita-projetada-do-trimestre/preview-claro.svg).
- [`v2_pontas-com-premissa`](./v2_pontas-com-premissa/): a mesma faixa de 2026-T4, agora com a premissa de cada ponta escrita ao lado do valor, halo nos rótulos que cruzam a linha da meta, margem reservada para nada encostar na borda e a distância entre o cenário base e a meta em valor e em percentual na linha de leitura. Meta de período. Previews: [escuro](./v2_pontas-com-premissa/preview.svg) e [claro](./v2_pontas-com-premissa/preview-claro.svg).
- [`v3_trimestres-de-2027-contra-meta-anual`](./v3_trimestres-de-2027-contra-meta-anual/): quatro faixas acumuladas, uma por trimestre de 2027, no mesmo eixo, com a meta anual de R$ 10 mi como uma única `ReferenceLine` cruzando as quatro; o primeiro trimestre cuja faixa passa a conter a meta ganha peso no rótulo e uma anotação curta. Meta anual, repetida por não ser de cada linha isolada. Previews: [escuro](./v3_trimestres-de-2027-contra-meta-anual/preview.svg) e [claro](./v3_trimestres-de-2027-contra-meta-anual/preview-claro.svg).
- [`v4_meta-fora-da-faixa`](./v4_meta-fora-da-faixa/): caso limite em que nem o cenário otimista de 2027 alcança a meta anual; a faixa inteira fica à esquerda do traço da meta sem esticar o eixo para disfarçar, e a lacuna até a meta sai escrita em valor e em percentual, porque visualmente a meta é só um traço distante. Meta anual. Previews: [escuro](./v4_meta-fora-da-faixa/preview.svg) e [claro](./v4_meta-fora-da-faixa/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e troque `data` pelo cenário real da página; o objeto do `data.ts` fica só como amostra.
2. Piso, base, teto, meta, `goalScope`, `asOf` e as três premissas são decisão do dono do planejamento, nunca hardcoded fora do dado: eles vêm do modelo de forecast ou da planilha de cenários, não de um número escolhido no componente.
3. Nas versões de uma linha (v1, v2, v4), a moldura é `card`: embrulhe em `VisualCard` com altura no corpo (`h-40` a `h-56` conforme o canvas). Na v3 (quatro linhas), dê altura suficiente para as quatro faixas não espremerem abaixo do piso de 12 px da ESP-2.
4. Ao trocar o cenário, confira se `goalScope` continua certo: uma meta de período repetida em várias linhas de períodos diferentes conta uma história errada, e uma meta anual desenhada como se fosse de cada trimestre soma o mesmo valor várias vezes na leitura do leitor.
5. Rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, e abra a página nos dois temas e a 390 px de largura: os rótulos das pontas, por saírem da margem reservada, são os primeiros a cortar num cartão estreito demais.

## Referências

- [Datawrapper, Bullet bars](https://www.datawrapper.de/charts/bullet-bars): a proposta de mostrar o que deu certo e o que não deu na mesma barra, base para a barra flutuante desta família.
- [Datawrapper Blog, New Arrow and Range Plots](https://www.datawrapper.de/blog/new-arrow-and-range-plots): o gráfico de amplitude como forma canônica de desenhar faixa entre dois valores.
- [Stephen Few, Bullet Graph Design Specification](https://www.perceptualedge.com/articles/misc/Bullet_Graph_Design_Spec.pdf): a recomendação de projeção como segmento adicional, a versão de uma ponta só deste modelo, e o traço de meta que se distingue por forma e não por cor.
- [Behance, Pipeline OS, B2B Sales Forecasting Dashboard](https://www.behance.net/gallery/251879769/Pipeline-OS-B2B-Sales-Forecasting-Dashboard): como forecast e acurácia convivem sem virar um número só.
- [Estudo da família](../../_estudo/familias/13_progresso-meta-e-gauge.md): anatomia completa, ponto delicado e versões sugeridas deste modelo (seção 19).
- [Catálogo da família](../../_estudo/catalogo/13_progresso-meta-e-gauge.json): caso de uso, o que cada versão demonstra e canvas sugerido.
- [CONTRATO.md](../../CONTRATO.md): seção 17, em especial ANO-3 (extendDomain), ROT-7 (halo) e EIX-1 (zero) para a barra flutuante e a meta.
- [README da família](../README.md): regras que valem para toda a família, entre elas meta e teto sempre escritos em texto e a polaridade da métrica.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-19, em duas passadas. As quatro versões estão aprovadas; os pontos abaixo não reprovam nenhuma delas e ficam registrados para a próxima passada de acabamento._

- v1: o último tique do eixo é o próprio `domainMax` calculado (`R$ 6,4 mi`), que não é intervalo redondo, e o tique de zero não aparece, embora o domínio comece nele (EIX-4).
- v1: os números da linha de leitura que saem fora de `<span>` com `kpi-number`, como o percentual entre parênteses, ficam sem classe de algarismo tabular (TIP-1).
- v1 e v2: `formatMonthShort` recebe a data inteira (`2026-09-30`), enquanto v3 e v4 cortam para `YYYY-MM`; o texto na tela sai igual, mas o padrão difere entre versões irmãs do mesmo modelo.
- v2: a linha de leitura termina em "abaixo da meta trimestre"; o `goalScope` entra cru na frase, que leria melhor como "abaixo da meta do trimestre".
- v2: com o domínio a partir do zero, a faixa ocupa cerca de um sétimo da largura útil do canvas `card` e a metade esquerda do corpo fica vazia; é honesto, mas a leitura ganharia com canvas mais baixo ou mais estreito.
- v3: cada faixa escreve só o teto; o piso é lido pelo eixo, o que é defensável em quatro linhas, mas afasta a versão da anatomia escrita neste README, que pede valor nas duas pontas.
- v4: a linha de leitura termina em "alcançar a meta ano", mesmo `goalScope` cru da v2; "a meta do ano" resolve.
- v4: o último tique também é o `domainMax` (`R$ 13,7 mi`) e o zero não recebe tique, apesar de o domínio partir dele.
- v1, v2 e v4: o eixo de valor continua desenhado embora piso e teto estejam escritos nas duas pontas, o que a ROT-2 dispensaria; a Anatomia deste README declara a régua de fundo como escolha, então é desvio deliberado e não descuido.
- v4: a lacuna sai como `18,3%`, e a NUM-1 pede percentual inteiro a partir de 10%; o `2,9%` da v1, por estar abaixo de 10%, já segue a régua.
- v4: `R$ 9,8 mi` e o percentual da linha de leitura ficam fora de `<span>` com `kpi-number`, logo sem algarismo tabular (TIP-1); é o mesmo ponto já anotado na v1.
- v4: a `ReferenceLine` da meta é declarada depois das `Bar`, enquanto v1, v2 e v3 a declaram antes e explicam a ordem em comentário; aqui não há consequência porque a meta cai longe da faixa, mas o padrão diverge entre versões irmãs.
- v3: `data` vazio desenha eixo e nota de método sem nenhuma faixa, em vez do bloco `role="status"` da EST-1; como a lista das quatro linhas pode chegar vazia de um filtro da página, o bloco vale a pena antes de colar no Farol.
