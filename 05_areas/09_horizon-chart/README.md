# Horizon chart

## O que é

Cada série vira uma linha baixa em que o desvio contra uma referência é cortado em faixas de mesma altura, sobrepostas na mesma linha em vez de esticadas para cima ou para baixo. A cor mostra o sentido do desvio (acima ou abaixo da referência) e a intensidade, em passos discretos, mostra a magnitude; negativos são espelhados para cima com outro matiz, então uma única linha baixa carrega o que normalmente precisaria de um eixo alto. A forma só compensa o espaço que economiza quando vem com a própria chave de leitura: quantas faixas existem e o valor de corte de cada uma, escrito na legenda, porque ninguém decodifica um horizon chart de olho.

## Quando usar

- De 10 a 50 séries longas na mesma unidade, para achar onde e quando algo saiu do normal.
- Desvio contra uma referência (média, meta) em que o sinal importa tanto quanto a magnitude.
- Tela de analista recorrente, que vai olhar o mesmo painel repetidas vezes e já aprendeu a chave.
- Passo comum a todas as linhas quando a pergunta é comparar o nível entre séries; passo por série quando a pergunta é só a forma de cada uma (declarar qual dos dois em toda versão).

## Quando evitar

- Público que nunca viu a forma, ou tela de apresentação única: pequenos múltiplos servem melhor (`01_area-simples`, versão `v3`).
- Leitura de valor exato: tabela visual (`14_tabelas-visuais`) ou linha comum.
- Grade de intensidade por período sem forma de onda: mapa de calor e calendário (`15_mapa-de-calor-e-calendario`).
- Mais de 3 faixas por sinal, ou passo sem declarar se é comum ou por série: a leitura vira ruído.
- Matiz negativa mais saturada que a positiva: isso faz a tela inteira parecer crise mesmo quando não é.

## Anatomia

1. **Linha baixa por série** (16 a 24 px neste catálogo), nome à esquerda em `text-text-secondary`, sem eixo nem grade.
2. **Faixas de mesma altura sobrepostas**, de 2 a 3 por sentido, com `dataKey` em `clamp(valor − faixa × passo, 0, passo)` e domínio fixo `[0, passo]` (`v1`, `v2`, `v4`) ou path calculado com a mesma conta em SVG puro (`v3`).
3. **Matiz por sentido**, preso ao token semântico da polaridade da métrica (`--negative` para o lado ruim, `--positive` para o lado bom, COR-6), nunca cor arbitrária.
4. **Intensidade por opacidade discreta** (`fillOpacity` 0,35, 0,65 e 1), nunca gradiente contínuo (COR-9): a faixa mais funda cobre as anteriores só onde o valor realmente chega lá.
5. **Legenda de faixas obrigatória**, com o número de faixas, o valor de uma faixa e o corte de cada tom (`até X`, `de X a Y`, `acima de Y`): é o que ensina a leitura, porque a forma sozinha não é óbvia.
6. **Separação sutil entre linhas** (vão ou `clipPath` por linha), para vizinhas não parecerem escorrer uma na outra.
7. **Valor fora do teto satura a faixa mais funda e ganha marcador e anotação com o valor real** (`v4`), nunca um recorte silencioso.

## Versões

- **[`v1_desvio-do-cpl-por-campanha`](./v1_desvio-do-cpl-por-campanha/):** 12 campanhas fictícias de mídia paga, uma `Area` por faixa com domínio fixo, 3 faixas por sentido com opacidade crescente e legenda com o corte de cada tom.
- **[`v2_campanha-expandida-em-area`](./v2_campanha-expandida-em-area/):** a campanha mais volátil abre numa área comum com valor real e linha de zero, via prop `expandedId`, enquanto as demais seguem dobradas na mesma escala; degrau de aprendizado para quem nunca viu a forma.
- **[`v3_sla-de-30-equipes`](./v3_sla-de-30-equipes/):** 30 equipes fictícias de pré-vendas em 180 dias, em SVG puro com um `path` por faixa e `clipPath` por linha, sem 30 instâncias do Recharts; ordenado pelo pior trimestre, não pelo nome.
- **[`v4_valor-fora-de-escala`](./v4_valor-fora-de-escala/):** um dia de instabilidade chega a 10 vezes o passo; o passo continua comum às demais séries, a faixa mais funda satura, um marcador aponta o dia e a anotação escreve o valor real, não o recortado.

## Como colar no Farol

1. Decida **passo comum ou por série** antes de copiar: comparar nível entre séries pede passo comum (`v1`, `v3`, `v4`); só a forma de cada uma admite passo próprio, e nesse caso o rótulo da legenda precisa dizer "passo por série".
2. Ligue a polaridade da métrica (`goodDirection`) à escolha de qual matiz é `--negative` e qual é `--positive`; nunca hard code "positivo é ruim" sem checar a métrica que está entrando.
3. Com 10 a 15 séries, prefira a técnica de `v1`/`v2`/`v4` (`Area` do Recharts por faixa); a partir de cerca de 20, migre para a técnica de `v3` (SVG puro com `path` calculado), porque cada linha em Recharts é uma instância própria e o custo cresce rápido.
4. Nunca solte o modelo sem a legenda de faixas: ela é o que separa horizon chart de mancha de cor ilegível.
5. Dê altura ao pai (a soma das linhas mais a legenda, como as `notes` de `v3` mostram a conta) ou passe `height`; sem altura, cada `ResponsiveContainer` interno desenha zero.

## Referências

- Praticante: [Stephen Few, Time on the Horizon](http://www.perceptualedge.com/articles/visual_business_intelligence/time_on_the_horizon.pdf). Observar a construção passo a passo com matiz para sinal e intensidade em passos.
- Praticante: [Stephen Few, Horizon Graphs Revisited](https://www.perceptualedge.com/blog/?p=390). Observar o exemplo de 50 ações com faixas de 10% e as críticas sobre separadores e cores.
- Catálogo: [Wikipedia, Horizon chart](https://en.wikipedia.org/wiki/Horizon_chart). Observar espelhamento, faixas sobrepostas e histórico.
- Exemplo técnico: [Vega-Lite, Horizon Graph](https://vega.github.io/vega-lite/examples/area_horizon.html). Observar duas camadas com `clip` e domínio fixo `[0, 50]`.
- Galeria: [RAWGraphs, How to make a horizon graph](https://www.rawgraphs.io/learning/how-to-make-a-horizon-graph).

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18; as quatro versões foram aprovadas. Nada aqui reprova; é material para a próxima rodada._

- **Todas as versões:** nenhuma desenha eixo de tempo, então o leitor localiza o desvio por posição relativa na linha, não por data. A `v1` é a que mais sente, porque o caso de uso dela promete "em que dias"; um eixo de dias compartilhado no rodapé das linhas resolveria sem custo de altura.
- **`v1`:** as campanhas saem ordenadas pelo maior desvio absoluto e a legenda não diz isso. A `v3` declara a ordem ("Ordenado pelo pior trimestre") e serve de molde.
- **`v1`:** a legenda escreve quanto vale a faixa, mas não diz que o passo é comum a todas as campanhas, que é o que o catálogo pede em "passo comum declarado"; a `v3` e a `v4` têm a mesma lacuna na palavra "comum".
- **`v2`:** o domínio da linha aberta é 1,2 vez o maior valor da série, não um múltiplo do passo, então a área aberta não se lê como a dobra desfeita das vizinhas. Com domínio de `BANDS × passo` e altura múltipla de `ROW_HEIGHT`, o desdobramento ficaria exato e o degrau de aprendizado, literal.
- **`v2`:** a linha aberta usa `type="monotone"` enquanto as dobradas usam `linear`; a curva suaviza entre dias medidos e as duas técnicas ficam com formas diferentes no mesmo visual.
- **`v3`:** três pontos dos 5.400 passam do teto de 9,0 por 0,1, e são recortados sem marcador. É irrelevante na tela, mas quem copiar o modelo para outra série precisa saber que o tratamento de fora de escala mora na `v4`.
- **`v3`:** o nome da equipe sai em 11 px peso 400, contra os 12 px peso 500 que a 17.1 dá ao rótulo de categoria. A compactação se justifica em 30 linhas de 16 px, mas é desvio da tabela.
- **`v4`:** o marcador `▲` sai em 9 px, abaixo do piso de 11 px da TIP-2. É glifo decorativo, `aria-hidden`, visível nos dois temas e apoiado pela anotação escrita, mas está fora da escala tipográfica.
- **Todas as versões:** os números da legenda saem em Manrope sem `tabular-nums` (TIP-1); nenhuma coluna de número depende do alinhamento, então não muda a leitura.
- **Todas as versões:** a faixa mais clara (`fillOpacity` 0,35) fica bem abaixo de 3:1 contra o cartão nos dois temas. É inerente à forma e a legenda dá a chave de leitura, mas nenhum valor está escrito na marca, que é a isenção que a 17.2 exige.
- **Todas as versões:** `passo` é identificador em português no `data.ts`, nas props e nas constantes, contra a seção 9 do contrato, que pede identificadores em inglês (`step` resolveria).
