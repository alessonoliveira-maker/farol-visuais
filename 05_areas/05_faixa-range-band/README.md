# Faixa (range band)

## O que é

Uma área desenhada entre duas bordas, inferior e superior, sem linha central obrigatória:
mostra um envelope, um perímetro ou um intervalo de cenários discretos. No Recharts a mesma
`Area` recebe um `dataKey` que devolve o par `[inferior, superior]`; o `baseValue` da API é
ignorado nesse modo, e a dica recebe um array em vez de um número só. Quando a linha central é
a protagonista e a faixa é só o contexto dela, o visual mora em
`04_linhas/04_linha-com-banda-de-intervalo`.

## Quando usar

- Mínimo e máximo históricos como contexto para a série do ano corrente.
- Medida que depende de definição, como participação de mercado entre um perímetro restrito e
  um amplo.
- Cenários discretos (pessimista e otimista, por exemplo) desenhados como faixa com as linhas
  de cenário nas bordas, sem fingir uma distribuição que o dado não tem.
- De 12 a cerca de 104 períodos, com as duas bordas sempre rotuladas por nome.

## Quando evitar

- Só a média importa: linha simples (`04_linhas/01_linha-simples`).
- A linha central é a mensagem e a faixa é só a incerteza em volta dela:
  `04_linhas/04_linha-com-banda-de-intervalo`.
- Incerteza por percentis que cresce com o horizonte da projeção: leque de projeção
  (`06_leque-de-projecao`).
- Faixa sem rótulo nas bordas, que acaba lida como uma meta.
- Bordas que se cruzam sem normalização prévia: área de diferença (`07_area-de-diferenca`).

## Anatomia

1. **Banda em opacidade baixa** (`BAND_OPACITY`), preenchida com `var(--line-strong)`, sem
   gradiente (COR-9); o `dataKey` devolve o par `[inferior, superior]` e a `Area` nasce sem
   `stroke`, porque as bordas ganham linha própria.
2. **Bordas sempre nomeadas**, nunca só "faixa": cada borda tem uma `Line` invisível ou fina
   com `LabelList` no fim da série escrevendo o nome do lado e o valor (ROT-2), com halo contra
   o que estiver atrás (ROT-7).
3. **Normalização antes do render**: uma função pura calcula
   `[Math.min(a, b), Math.max(a, b)]` para a faixa nunca inverter se uma borda ultrapassar a
   outra num período futuro.
4. **Domínio a partir do zero** (EIX-1, EIX-2): a família de área nunca recorta a escala, ao
   contrário do modelo equivalente em linha.
5. **Ausência de borda vira ausência de faixa, nunca interpolação**: `connectNulls={false}`
   quebra a `Area` onde uma borda é `null`, e a borda que segue medida continua desenhada como
   linha própria (EIX-10).
6. **Método declarado em `data.ts` e em `notes` do `meta.json`**: cada versão diz explicitamente
   do que a faixa é mínimo e máximo, ou quais são os cenários discretos; nunca um intervalo sem
   definição.

## Versões

- **`v1_participacao-de-mercado-por-perimetro`**: o caminho feliz. Faixa entre o perímetro
  restrito e o amplo de participação de mercado em Operações Estruturadas, sem linha central,
  com as duas bordas normalizadas e rotuladas no fim da série.
- **`v2_envelope-historico-com-ano-atual`**: envelope de mínimo e máximo semanal de 2023 a 2025,
  com 2026 em linha de destaque por cima; semanas fora do envelope ganham ponto vazio maior e a
  semana corrente, ainda em coleta, ganha ponto vazado.
- **`v3_cenarios-de-receita-2027`**: duas faixas sobrepostas, a ampla entre pessimista e
  otimista e a restrita entre conservador e moderado, com a meta anual em `ReferenceLine`
  tracejada e o rótulo de cada borda nomeando o cenário, nunca uma probabilidade.
- **`v4_perimetro-amplo-sem-dado`**: três meses em que o perímetro amplo não foi medido; a faixa
  some nesse intervalo com uma `ReferenceArea` nomeando os meses, o perímetro restrito segue
  como linha e o rótulo do amplo ausente usa `formatUnavailable()`.

## Como colar no Farol

1. Copie `Chart.tsx` e `data.ts` da versão escolhida para
   `app/src/pages/<pagina>/visuals/<NomeDoVisual>/` e troque o dado padrão pelas duas (ou
   quatro, em `v3`) séries reais vindas do seletor da página.
2. Dê altura ao pai (`h-64` ou similar) ou passe `height`; sem altura o `ResponsiveContainer`
   desenha zero.
3. Mantenha as duas bordas sempre nomeadas por rótulo, mesmo fora do catálogo: uma faixa sem
   dizer o que ela é vira meta na cabeça de quem lê (seção Quando evitar).
4. Em `v4`, o intervalo `gapStart`/`gapEnd` deve vir do próprio dado, do mês sem valor de
   origem, nunca de uma constante fixa como no catálogo.
5. Embrulhe no `VisualCard` do Farol: o `title` do `meta.json` vira o título do cartão, o
   `useCase` pode virar o `subtitle`.

## Referências

- [Recharts, Banded Chart](https://recharts.github.io/en-US/examples/BandedChart/): o
  `dataKey` em array que sustenta a técnica.
- [Recharts, Area API](https://recharts.github.io/en-US/api/Area/): `dataKey` para faixa,
  `baseValue` e `connectNulls`.
- [AG Charts, Range Area Chart](https://www.ag-grid.com/charts/gallery/simple-range-area/):
  faixa anual com marcos de eventos.
- [Highcharts, Area range and line](https://www.highcharts.com/demo/highcharts/arearange-line):
  faixa com linha média e dica com as duas bordas.

## Observações da revisão (não bloqueantes)

_Revisão de 2026-09-18. Nenhum item desta lista reprova a versão._

- `v1`: o comentário do `data.ts` nomeia a própria casa ao descrever a métrica; o texto da tela
  não traz o nome, mas a seção 3 do contrato pede dado sem empresa nomeada, então a troca por
  uma descrição genérica deixaria a versão alinhada à letra da regra.
- `v1`: os rótulos de fim usam 12 px, enquanto `v2`, `v3` e `v4` usam 11 px no mesmo papel; vale
  uniformizar o modelo em um tamanho só.
- `v1` e `v4`: `VALUE_AXIS_WIDTH` é 44, abaixo do piso de 48 que a EIX-6 pede; nada fica cortado
  porque o tique de percentual é curto, mas a constante está fora da faixa escrita no contrato.
- `v2`: o eixo de categoria abrevia a semana como `S01`; a linha de leitura decifra a sigla ao
  escrever `semana S18 parcial`, e essa decifração só existe enquanto houver semana parcial.
- `v2`: a linha de 2026, que é o destaque do visual, é a única série sem rótulo direto no fim;
  `máximo` e `mínimo` têm o seu, e o ano só aparece no subtítulo do cartão.
- `v2`: os rótulos da faixa trazem só o nome da borda, sem valor, enquanto a 17.2 condiciona o
  neutro `--line-strong` (1,79:1 no escuro, 1,83:1 no claro) a ter o valor escrito junto da marca;
  `v1` e `v4` escrevem o percentual no rótulo e ficam dentro da isenção.
- `v3`: o tique do eixo Y quebra em duas linhas (`R$ 12,0` e `mi`) porque o texto não cabe nos
  56 px de `VALUE_AXIS_WIDTH`; o contrato permite até 64 px na EIX-6.
- `v3`: o rótulo `meta R$ 10,0 mi` fica na margem do topo, longe da linha tracejada que ele
  nomeia; a associação depende só da palavra, não da altura.
- `v3`: `--text-muted` faz dois papéis dentro do mesmo visual, a linha de referência da meta e as
  bordas pessimista e otimista, e a 17.2 pede um papel por token; o traço tracejado da meta é o
  que separa os dois na leitura.
- `v3` e `v4`: o `YAxis` ficou sem `tickLine={false}`, então aparecem os traços de tique ao lado
  dos números, contra a EIX-5; nos dois o `XAxis` já desliga, a `v1` herda o desligamento de
  `AXIS_PROPS` e a `v2` desliga à mão nos dois eixos.
- `v4`: a `ReferenceArea` vai do tique de mai ao tique de jul, então os trechos entre abr e mai
  e entre jul e ago, em que a faixa também não existe, ficam fora do sombreado.
- `v4`: a `ReferenceArea` é desenhada depois da grade, então as linhas de 12% e 18% somem dentro
  do trecho sem dado; a linha do restrito continua visível nos dois temas, que é o que importa.
