# Card de exceção

## O que é

Um cartão que só existe por causa de uma régua escrita e estourada. Ele não acompanha uma métrica contínua como o KPI simples; ele mostra a contagem de casos fora do critério, o critério por extenso, a severidade quando existe mais de um nível e o caminho permanente para a lista de casos. É o oposto do cartão de abertura de tela: na maior parte dos dias ele deveria dizer que não há nada a ver, e essa fala calma precisa caber no mesmo espaço que a fala de alerta, para a grade não pular quando o estado muda. A cor semântica mora só na borda esquerda e no ícone, nunca no fundo nem no texto, porque o contrato do Farol proíbe texto sobre fundo tingido (COR-7). Exceção de dado (uma fonte que não carregou) nunca divide grupo com exceção de negócio (um caso fora da régua): são naturezas diferentes e misturá-las ensina o operador a ignorar as duas.

## Quando usar

- Régua escrita e datada, como "oportunidades sem movimento há mais de 30 dias", com a data da última avaliação sempre visível.
- Tela operacional em que só as exceções merecem olhar de imediato e cada uma abre uma fila de trabalho, não um relatório.
- Mais de uma régua da mesma área junta, numa faixa própria acima da grade de KPIs, que colapsa numa linha quando está vazia.
- Separar, no mesmo painel, a régua de negócio que estourou da régua que não pôde ser avaliada por falta de carga da fonte.

## Quando evitar

- Painel executivo que precisa de leitura estável todo dia: use o KPI simples com contexto (modelo 01).
- Régua inexistente ou que muda toda semana: calibrar e datar a régua antes de publicar qualquer alerta.
- Cartão que aparece todo dia sem exceção: a régua está errada e precisa ser recalibrada, não repintada.
- Estado que vale para todos os cartões, bom ou ruim, sem régua própria por caso: KPI simples com status (modelo 01).
- Menos de uma dezena de casos avaliados no total: a contagem sem o denominador assusta fora de proporção; escreva a base.

## Anatomia

1. **Ícone de estado**, 16 px, do `lucide-react`: `TriangleAlert` em atenção, `OctagonAlert` em grave, `CircleCheck` no estado calmo, `Unplug` quando a régua não pôde ser avaliada. A forma distingue os níveis, não só a cor (COR-2).
2. **Contagem de casos**, em `kpi-number` com um degrau abaixo do KPI vizinho (`text-2xl`, não `text-3xl`), porque exceção não pode dominar a tela mais que o número de acompanhamento.
3. **Critério literal**, obrigatório e escrito por extenso a partir do dado ("sem movimento de etapa há mais de 30 dias"), nunca só o número: um corte sem o critério é opinião com cor, não informação.
4. **Severidade**, quando existe mais de um nível, com palavra e ícone próprios por nível, ordenados pela ordem de ação (grave antes de atenção) e nunca pela ordem de cálculo.
5. **Denominador**, escrito quando a base é pequena o bastante para mudar a leitura da contagem ("6 de 19 agendas"); acima de uma base grande a contagem sozinha já basta.
6. **Ação**, um único link ou `<a>` esticado que abre a lista dos casos, com afordância permanente (sublinhado e seta), nunca só na passagem do cursor.
7. **Data da avaliação da régua**, por `formatDate`, no cabeçalho do cartão, e a régua não avaliada trazendo a data da última carga que funcionou, nunca escondida.
8. **Estado calmo e estado indisponível**, na mesma estrutura e na mesma altura do estado com caso, para a grade não abrir nem fechar buraco quando o dia muda (EST-1, EST-2).

## Versões

- `v1_oportunidades-sem-movimento-ha-30-dias`: o caso básico de um nível só, borda e ícone em `--warning`, contagem com o substantivo, critério logo abaixo, link permanente para a lista e a mesma estrutura reaproveitada para o estado calmo e para a régua indisponível. Previews: [escuro](./v1_oportunidades-sem-movimento-ha-30-dias/preview.svg) e [claro](./v1_oportunidades-sem-movimento-ha-30-dias/preview-claro.svg).
- `v2_paradas-com-severidade-e-denominador`: dois níveis de severidade na mesma régua, grave em `--negative` e atenção em `--warning`, cada um com ícone e palavra distintos, o denominador de 143 oportunidades abertas escrito e os limites sem sobreposição calculados a partir do dado. Previews: [escuro](./v2_paradas-com-severidade-e-denominador/preview.svg) e [claro](./v2_paradas-com-severidade-e-denominador/preview-claro.svg).
- `v3_faixa-de-excecoes-da-pre-vendas`: faixa com quatro réguas próprias da pré-vendas (teto da fila, SLA, agendas sem desfecho e leads sem dono), ordenadas por severidade e por etapa da esteira, cada cartão com um único link esticado e a faixa inteira colapsando numa linha de status quando nada estoura. Previews: [escuro](./v3_faixa-de-excecoes-da-pre-vendas/preview.svg) e [claro](./v3_faixa-de-excecoes-da-pre-vendas/preview-claro.svg).
- `v4_estado-calmo-e-regua-nao-avaliada`: o caso limite da faixa em dia calmo, com o grupo de negócio em zero medido lado a lado, separado por espaço, com o grupo de saúde de dados que mostra a régua de mídia paga sem carga há três dias, nunca lida como "tudo bem". Previews: [escuro](./v4_estado-calmo-e-regua-nao-avaliada/preview.svg) e [claro](./v4_estado-calmo-e-regua-nao-avaliada/preview-claro.svg).

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` para `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`. As quatro versões são moldura `stage`: vão direto na grade, sem `VisualCard` por fora, numa célula com altura definida pela página (a v1 e a v2 cabem em `h-56` a `h-64`; a v3 e a v4, mais largas, pedem a largura de uma faixa inteira e `h-64` a `h-72`).
2. Passe o dado real pela prop `data`, sempre com a régua (critério, limite, severidade) vinda da configuração da métrica, nunca digitada de novo na página: a frase do critério e a frase acessível já são calculadas a partir dela.
3. O link de cada cartão (`listHref` ou `queueHref`) precisa herdar o período e os filtros da tela de origem, para a lista aberta bater exatamente com a contagem do cartão; se algum caso for excluído por deduplicação, a lista escreve quantos e por quê.
4. Na v3 e na v4, o agrupamento por severidade e a separação entre exceção de negócio e exceção de dado já vêm prontos no componente; a página só decide quais réguas entram em `breaches` ou em `unevaluated`, sem reordenar por conta própria.
5. Estados calmo e indisponível já estão inline com `role="status"` e `formatUnavailable()`; ao colar, mantenha o texto e rode `npm run typecheck`, `npm run lint` e `npm run test` no `app/`, conferindo os dois temas e 390 px de largura.

## Referências

- [Stacey Barr, 3 problemas dos semáforos tradicionais de KPI](https://www.staceybarr.com/measure-up/3-problems-with-traditional-kpi-traffic-lights/). A exigência de declarar o corte da régua e a crítica ao sinal que reage a ruído de um único período, base do critério literal obrigatório (item 3 da Anatomia).
- [Kat Greenbrook, o fim dos painéis de semáforo](https://www.linkedin.com/pulse/end-traffic-light-dashboards-kat-greenbrook). O argumento de que o sinal substitui a explicação em vez de acompanhá-la, motivo pelo qual o cartão nunca aparece sem a régua escrita ao lado.
- [Datawrapper Academy, dados irregulares](https://academy.datawrapper.de/article/321-patchy-data). Por que falha de coleta merece tratamento próprio e não pode ser lida como resultado, base da separação entre exceção de dado e exceção de negócio na v4.
- [Untitled UI, componentes de métrica](https://www.untitledui.com/components/metrics). A linha de ações no rodapé do cartão, lugar natural do link "ver os casos" desta anatomia.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-16 e nova leitura em 2026-09-18; nas duas, as quatro versões passaram sem bloqueante._

- `v1`: o `meta.json` promete "régua sem caso e régua não avaliada no mesmo lugar, com role status", mas o dado padrão só rende o ramo estourado; quem olha o preview não vê os outros dois, que a v4 cobre.
- `v1`: o canvas é 360 x 240, e não o preset `kpi` sugerido no catálogo; a diferença é deliberada, porque o critério literal e o link não cabem em 180 px de altura.
- `v2`: o `useCase` do cabeçalho escreve "entre 30 e 90 dias" e o cartão escreve "entre 31 e 90 dias"; a faixa do cartão é a correta (não sobrepõe o nível grave), vale alinhar a pergunta.
- `v2`: a contagem de cada nível fica à direita em `kpi-number`, mas a faixa de dias ao lado ("acima de 90 dias") corre em texto sem `tabular-nums`, fora da letra da TIP-1; em prosa não muda a leitura.
- `v3`: os ramos de faixa recolhida (0 de 6 réguas estouradas) e de réguas sem avaliação existem no componente e não aparecem em nenhum preview; só o estado com quatro cartões é conferível pela imagem.
- `v3`: `DENOMINATOR_MAX_BASE = 500` é generoso para a ideia de "base pequena" que o `meta.json` anuncia; com as bases de 19 a 64 do dado fictício a escolha do corte não fica visível.
- `v4`: a frase acessível diz "0 de 5 réguas com caso" usando a contagem de casos como numerador e a de réguas como denominador; com zero as duas coincidem, com qualquer outro valor a frase mistura unidades.
- `v4`: o limite da régua indisponível sai por `formatCurrencyCompact` dentro da frase do critério, sem `tabular-nums` na mesma linha; mesma anotação da TIP-1 feita na v2.
- `v3` (2026-09-18): o `npm run check` avisa que a frase acessível da raiz mede 235 caracteres, a 15 do teto de 250 da ACE-1, e ela cresce com o número de réguas estouradas; com seis cartões a frase passa do teto.
- `v3` (2026-09-18): a nota do `meta.json` escreve "comporta até 4 régua ao lado uma da outra"; falta a concordância no plural.
- `v4` (2026-09-18): o zero medido sai em 24 px e a palavra "indisponível" do cartão vizinho sai em 20 px, dois tamanhos de display na mesma faixa; a leitura não sofre, mas a TIP-2 conta um só.
