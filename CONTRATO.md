# Contrato de autoria do catálogo VISUAIS

> Vigente desde 2026-09-14. Quem produz uma versão segue este documento à risca; o `npm run check` verifica quase tudo o que está aqui e recusa o que diverge.
> A ferramenta de render mora em `_render/`. O Farol (`../app/`) é só leitura para o catálogo: nada aqui altera o app.

O catálogo é um mostruário de visuais **copie e cole** para o Farol. Cada versão é um componente React pronto, com dado fictício fixo e um `preview.svg` que é o retrato daquele exato componente. A galeria (`galeria.html`) junta tudo numa página navegável.

---

## 1. Estrutura e nomes

```
VISUAIS/
  CONTRATO.md                      este documento
  galeria.html                     gerada por npm run galeria (não editar à mão)
  <NN_slug-da-familia>/
    README.md                      o que a família resolve e a lista de modelos
    <NN_slug-do-modelo>/
      README.md                    seções obrigatórias (seção 14)
      <vN_slug-da-versao>/
        Chart.tsx                  o componente que vai para o Farol
        data.ts                    o dado fictício fixo e os tipos dele
        meta.json                  título, caso de uso, o que demonstra, canvas, moldura
        preview.svg                gerado por npm run render (tema escuro, obrigatório)
        preview-claro.svg          gerado com --tema claro ou ambos (opcional)
```

Regras de nome, verificadas pelo check:

| Nível | Padrão | Exemplo |
|---|---|---|
| Família | `NN_slug` (dois dígitos, sublinhado, minúsculas com hífen entre palavras) | `02_barras-horizontais` |
| Modelo | `NN_slug` | `01_simples-ordenada` |
| Versão | `vN_slug` | `v1_ranking-por-executivo` |

* A família fica **na raiz** de `VISUAIS`. Pastas que começam com sublinhado (`_render`, `_estudo`) não são catálogo.
* Uma versão é qualquer pasta com `Chart.tsx`; a busca não desce abaixo dela. Nada além dos cinco arquivos acima dentro da versão (arquivo extra gera aviso).
* Os slugs não levam acento. O texto de tela leva.
* Os moldes oficiais estão em `_render/exemplos/` com a mesma estrutura: **copie o molde mais próximo** em vez de começar do zero.

| Molde | Técnica |
|---|---|
| `_render/exemplos/02_barras-horizontais/01_simples-ordenada/v1_ranking-com-destaque` | Recharts nativo |
| `_render/exemplos/01_cards-e-kpis/01_kpi-com-sparkline/v1_variacao-contra-periodo-anterior` | HTML com Tailwind (moldura `stage`) |
| `_render/exemplos/22_unidades-waffle-e-pictograma/01_waffle-10x10/v1_composicao-por-origem` | SVG puro em React com geometria em TypeScript |

---

## 2. Anatomia do `Chart.tsx`

O `Chart.tsx` é **código de produção**: sai do catálogo e entra no Farol sem limpeza. Por isso nada de catálogo mora nele (título de galeria, canvas, moldura ficam no `meta.json`).

```tsx
import { Bar, BarChart, ResponsiveContainer } from 'recharts';        // 1. só imports permitidos (seção 6)

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyCompact } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ExecutiveRevenue } from './data';   // 2. o default vem do data.ts

/** Uma frase: o que o visual mostra e a decisão que ele apoia. */
export interface RankingBarsProps {                                   // 3. props tipadas e exportadas
  readonly data?: readonly ExecutiveRevenue[];                        // 4. data OPCIONAL
  readonly height?: number;                                           // 5. altura opcional para pai sem altura
  readonly className?: string;
}

export default function RankingBars({                                 // 6. export default nomeado
  data = defaultData,                                                 // 7. default na desestruturação
  height,
  className,
}: RankingBarsProps) {
  const animate = useAnimateOnce();
  const summary = `Ranking de receita nova, ${String(data.length)} pessoas...`;  // 8. frase acessível calculada do dado

  return (
    <div
      aria-label={summary}                                            // 9. nome acessível
      className={cn('h-full w-full min-w-0', className)}              // 10. ocupa o pai inteiro
      role="img"
      style={height === undefined ? undefined : { height }}
    >
      <ResponsiveContainer height="100%" width="100%">
        <BarChart data={data}>{/* ... */}</BarChart>
      </ResponsiveContainer>
    </div>
  );
}
```

Obrigatório (o check recusa sem):

1. `export default` de um **componente função** cujas props são desestruturadas na assinatura.
2. **Nenhuma prop obrigatória.** `<Chart />` precisa montar sozinho; o check compila uma sonda com `<Chart />` e `<Chart data={data} />`.
3. Prop `data` opcional, com default vindo de `./data` (`data = defaultData`), do mesmo tipo que o `export const data` do `data.ts`.
4. Pelo menos um elemento com `role` e um com `aria-label` ou `aria-labelledby` (seção 11).
5. Typecheck limpo com as flags do `app/tsconfig.json`: `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `noImplicitReturns`, `noUnusedLocals`, `noUnusedParameters`, `noFallthroughCasesInSwitch`, `verbatimModuleSyntax`, `erasableSyntaxOnly`. Na prática: `import type` para tipos, `arr[i]` é `T | undefined`, nada de `enum` nem `namespace`.

Recomendado (o check avisa):

* Exportar **só** o componente e tipos. Constante ou função exportada quebra o recarregamento rápido do Vite no Farol.
* Outras props opcionais que o Farol vai querer passar (`highlightId`, `height`, `className`), cada uma com default.
* Constantes de desenho no topo do arquivo em `UPPER_SNAKE_CASE` (`MARGIN`, `GAP`, `NAME_AXIS_WIDTH`).
* Geometria calculada em funções puras do próprio arquivo (ver o waffle).
* Animação do Recharts sempre por `isAnimationActive={useAnimateOnce()}`: anima só na entrada e respeita quem pediu menos movimento. O render desliga animação sozinho.

Proibido: `dangerouslySetInnerHTML`, `fetch`, `setInterval`, import dinâmico, `require`, reexport, import de efeito colateral (CSS inclusive), imagem ou fonte externa, `console.*` esquecido.

## 3. Anatomia do `data.ts`

```ts
/**
 * Receita nova fechada por executivo no trimestre, em reais.
 * Dado fictício e fixo: nenhum nome é pessoa real.
 */
export interface ExecutiveRevenue {
  readonly id: string;
  readonly name: string;
  readonly revenue: number;
}

export const data: readonly ExecutiveRevenue[] = [
  { id: 'exec-01', name: 'Talita V.', revenue: 312_400 },
];

/** Outros defaults nomeados são permitidos (a barra acesa, por exemplo). */
export const highlightId = 'exec-01';
```

* `export const data` obrigatório, com tipo explícito. Tipos do dado moram aqui e são reexportados por uso (`import { type X } from './data'`).
* **Nenhum import.** O dado é autocontido.
* O comentário do topo diz o que o dado mede, a unidade, e que é **fictício e fixo**.
* Zero dado pessoal real e zero marca de empresa real: nome inventado com inicial de sobrenome (`Talita V.`), empresa genérica (`Distribuidora Norte`), nunca CNPJ, CPF, e-mail ou telefone, nem inventados.
* Datas em texto `YYYY-MM-DD` ou `YYYY-MM`. Nada de `new Date()` sem argumento.
* Volume plausível: o dado precisa exercitar o visual (nome longo, valor pequeno, categoria neutra), não só o caminho feliz.

---

## 4. Metadados da versão: `meta.json`

Os metadados ficam num arquivo **separado** do código copiável. Assim título de galeria, caso de uso e canvas nunca sujam o componente que vai para produção, e trocar o canvas não invalida o código.

```json
{
  "title": "Receita nova por executivo",
  "useCase": "Mostrar a posição de uma pessoa no ranking do trimestre sem perder a escala do time inteiro.",
  "demonstrates": [
    "Recharts nativo com layout vertical e ordenação no componente",
    "Rótulo direto de valor na ponta, sem eixo de valor"
  ],
  "canvas": "card",
  "frame": "card",
  "notes": "Opcional: observação para quem mantém o catálogo."
}
```

| Chave | Obrigatória | Regra |
|---|---|---|
| `title` | sim | 3 a 60 caracteres. Nome do que se vê, em pt-BR acentuado. Aparece na moldura do preview e na galeria. |
| `useCase` | sim | 10 a 140 caracteres. A pergunta ou decisão que o visual atende. Aparece sob o título. |
| `demonstrates` | sim | Lista de 1 a 6 itens de 3 a 90 caracteres: a técnica ou o cuidado que a versão ensina. |
| `canvas` | sim | Um preset da tabela abaixo ou `{ "width": 200..1600, "height": 200..1600 }`. |
| `frame` | não | `card` (padrão) ou `stage`. Ver seção 13. |
| `notes` | não | Texto livre para a manutenção. |

Nenhuma outra chave é aceita. Nenhum texto usa hífen, travessão ou meia risca como separador.

**Presets de canvas** (tamanho total do SVG, moldura inclusa, em pixels CSS):

| Preset | Largura x altura | Uso típico |
|---|---|---|
| `kpi` | 360 x 180 | Número com uma linha de contexto |
| `kpi-alto` | 360 x 280 | Número com sparkline ou minigráfico |
| `card` | 640 x 360 | Cartão padrão de gráfico |
| `quadrado` | 480 x 480 | Rosca, radar, waffle isolado |
| `largo` | 960 x 400 | Série longa, tabela curta, combinado |
| `faixa` | 960 x 260 | Linha do tempo, faixa de KPIs |
| `alto` | 640 x 560 | Ranking longo, tabela, funil |

---

## 5. Onde o visual encaixa: tamanho responsivo no Farol, fixo no render

O mesmo `Chart.tsx` precisa funcionar nos dois lugares:

* **No Farol**, o componente vai no corpo de um `VisualCard`, numa grade que muda de largura. Ele precisa **ocupar o pai** e encolher sem empurrar a coluna.
* **No render**, a moldura da ferramenta dá ao corpo um tamanho fixo derivado do canvas.

Por isso a raiz do Chart segue esta regra:

* Raiz com `h-full w-full min-w-0` (sem `min-w-0` um filho de grid não encolhe e a página rola na horizontal). O render avisa se a raiz sair com altura zero.
* Prop `height?: number` opcional para quando o pai não tem altura; aplicada por `style`.
* Recharts sempre dentro de `<ResponsiveContainer width="100%" height="100%">`.
* Largura em pixel dentro de JavaScript (largura de eixo, margem) é constante; se precisar variar com o espaço, prefira container query do Tailwind (`@container` na raiz e `@sm:` nos filhos) a ler a janela. Não use `useIsMobile` nem `window.innerWidth`.
* SVG puro: `viewBox` fixo e `className` que escala (`h-full w-auto aspect-square`, por exemplo); traço que não pode engordar leva `vectorEffect="non-scaling-stroke"`.
* Conteúdo que passa da área do corpo gera aviso no render: aumente o canvas ou compacte o visual. Nunca conte com `overflow` para esconder.

---

## 6. Imports permitidos

A lista é fechada. Nenhuma dependência nova: o que o Recharts não faz vira SVG puro em React com geometria em TypeScript, ou HTML com Tailwind. d3, nivo, visx, echarts, framer-motion e afins estão fora.

| Módulo | Nomes liberados | Por quê |
|---|---|---|
| `react` | todos | Hooks e tipos. |
| `recharts` | todos | Biblioteca de gráficos do Farol (3.10.1). |
| `lucide-react` | todos | Ícones do Farol (1.39.0), sempre com `aria-hidden` quando decorativos. |
| `@/lib/format` | `formatInt`, `formatDecimal`, `formatCurrency`, `formatCurrencyCompact`, `formatCurrencyAxis`, `formatPercent`, `formatPercentFromScale100`, `formatPercentPoints`, `formatDate`, `formatMonthShort`, `formatMonthLong`, `formatDays`, `formatHours`, `formatRateWithVolume`, `formatUnavailable` | Formatação pt-BR única do Farol, funções puras sem estado. Número formatado fora daqui diverge do resto da plataforma. |
| `@/lib/utils` | `cn` | Junta classes com `clsx` e `tailwind-merge`; é o padrão de `className` de todo componente do Farol. |
| `@/components/visuals/charts/chartTheme` | `CHART_SERIES_COLORS`, `CHART_SEQUENTIAL_COLORS`, `seriesColor`, `AXIS_COLOR`, `GRID_COLOR`, `CURSOR_COLOR`, `AXIS_PROPS`, `CHART_ANIMATION_MS`, `useAnimateOnce` | Cores de série em `var(--token)` e o comportamento de animação que todos os wrappers do Farol usam. |
| `@/components/visuals/valueFormat` | `formatValue`, `formatAxisLabel`, `axisValueFormat`, `ValueFormat` | O despachante de formato que eixo, dica e tabela do Farol compartilham; só depende de `@/lib/format`. |
| `@/components/visuals/charts/ChartTooltip` | `ChartTooltip`, `ChartTooltipProps` | A dica do Recharts com fundo de token e número pt-BR. Sem ela cada versão reimplementaria a dica, com risco de fundo branco e número cru. |
| `./data` | todos | O dado fictício e os tipos da própria versão. |

Ficam **fora de propósito**, mesmo existindo no Farol:

* `VisualCard`, `KpiCard`, `ChartFrame`, `BulletChart` e os wrappers (`BarsChart`, `DonutChart`...): puxam o registry de métricas (`@/data/metrics/registry`), contexto de cartão, tarja de protótipo e `useIsMobile`. A versão do catálogo mostra **como desenhar**; quem cola decide se embrulha num `VisualCard` (seção 16).
* `@/lib/dates`, `@/data/*`, stores, páginas: são o núcleo de dado do protótipo e mudam com ele.
* Qualquer arquivo de outra versão do catálogo: versões não dependem umas das outras.

Se um produtor precisar de algo fora da lista, **não contorne**: registre o pedido no README do modelo, seção Referências, e deixe a versão sem aquilo.

---

## 7. Cor: só por token do Farol

Nenhuma cor literal no componente: nada de `#hex`, `rgb()`, `hsl()`, `oklch()`, cor nomeada (`white`, `red`) nem classe da paleta padrão do Tailwind (`bg-red-500`, `text-slate-400`). O check recusa todos. Os tokens vêm de `app/src/styles/tokens.css`, têm valor para o tema escuro e para o claro, e o preview acompanha o Farol a cada render.

Duas formas de usar, as duas válidas:

* **Utilitário Tailwind** do tema (`bg-surface-raised`, `text-text-muted`, `border-line-subtle`, `bg-chart-1`, `text-positive`, com opacidade `bg-positive/15`).
* **Variável CSS** em atributo ou `style` (`fill="var(--chart-1)"`, `stroke="var(--line-subtle)"`), obrigatória em SVG e em Recharts.

### Tokens de dado

| Token | Utilitário | Papel |
|---|---|---|
| `--chart-1` a `--chart-8` | `bg-chart-1`... | Paleta **categórica**, na ordem. Cor fixa por série: a mesma categoria tem a mesma cor em todo o painel. `--chart-1` (ciano) é também a cor de destaque quando só uma coisa acende. Use `CHART_SERIES_COLORS` ou `seriesColor(i)`. |
| `--seq-1` a `--seq-7` | **não tem** | Rampa **sequencial** do baixo ao alto (mapa de calor, intensidade, faixa). Não é tom de apoio: o neutro das barras não destacadas é `--line-strong` (seção 17.2). Só por `var(--seq-N)` ou `CHART_SEQUENTIAL_COLORS`. |
| `--positive` | `text-positive`, `bg-positive` | O bom de uma variação, meta atingida. Nunca a única pista: acompanhe ícone ou sinal. |
| `--negative` | `text-negative`, `bg-negative` | O ruim de uma variação, risco, acima do teto. |
| `--warning` | `text-warning` | Atenção, perto do limite. |
| `--info` | `text-info` | Nota neutra informativa. |
| `--prov-medido`, `--prov-derivado`, `--prov-premissa`, `--prov-lacuna`, `--prov-prototipo` | `text-prov-medido`... | Etiqueta de procedência do número (MEDIDO, DERIVADO, PREMISSA, LACUNA, protótipo). Reservados para isso: não viram cor de série. |

### Tokens de estrutura

| Token | Utilitário | Papel |
|---|---|---|
| `--surface-canvas` | `bg-surface-canvas` | Fundo da página. |
| `--surface-raised` | `bg-surface-raised` | Fundo do cartão; use como contorno de separação entre fatias (`stroke`). |
| `--surface-overlay` | `bg-surface-overlay` | Dica, selo neutro, fundo de destaque de linha. **Nunca trilho, moldura nem faixa**, pela nota logo abaixo. |

> **`--surface-overlay` no tema claro é o mesmo branco de `--surface-raised`** (medido em 1,00:1; a ANO-4 já o proibia como faixa de período, e a revisão de `12/04` encontrou o mesmo defeito num trilho de microbarra, que sumia no claro e deixava o ponto do valor sem escala). A regra geral: ele serve de fundo atrás de texto, **nunca como a única coisa que separa uma forma do cartão**. Estrutura que precisa ser vista, como trilho, moldura ou faixa, usa `--line-subtle` ou `--surface-sunken`, e quem o usa confere no tema claro antes de fechar.

| `--surface-sunken` | `bg-surface-sunken` | Poço rebaixado dentro do cartão. |
| `--text-primary` | `text-text-primary` | Número e rótulo principal. |
| `--text-secondary` | `text-text-secondary` | Rótulo de categoria, texto de apoio. |
| `--text-muted` | `text-text-muted` | Tique de eixo, nota, unidade, categoria neutra. |
| `--line-subtle` | `border-line-subtle` | Grade, borda de cartão, divisória. |
| `--line-strong` | `border-line-strong` | Linha de referência, zero do eixo, categoria "sem dado" em composição. |
| `--accent-cyan`, `--accent-amber` | **não tem** (use `primary`, `accent` ou a variável) | Acento de marca da interface; em dado, prefira `--chart-1` e `--chart-2`. |

Armadilhas que o check pega ou que a revisão precisa pegar:

* `text-primary` é o **ciano** de ação (alias shadcn), não o texto principal. Texto principal é `text-text-primary`.
* `bg-seq-3`, `text-accent-cyan` e afins **não existem** como utilitário: o check recusa; use `style` ou atributo com `var(--...)`.
* Token inexistente (`var(--chart-9)`, `var(--cor-borda)`) é recusado pelo check.
* Categoria de ausência ("Sem origem declarada", "Sem dado") usa tom neutro (`--line-strong` ou `--text-muted`), fica visível e vai por último. Nunca some dentro de "outros".

---

## 8. Números, moeda, data e fontes

* Todo número de tela passa por `@/lib/format` ou `@/components/visuals/valueFormat`. Nada de `toLocaleString`, `toFixed` em texto visível nem `Intl` direto no componente.
* Moeda: `formatCurrencyCompact` em cartão e rótulo direto (`R$ 401,3 mil`), `formatCurrencyAxis` em tique de eixo, `formatCurrency` só onde o centavo importa.
* Taxa: `formatPercent(0.131)` imprime `13,1%`. Taxa com volume pequeno sai com o par: `formatRateWithVolume(7, 28)` imprime `25,0% (7 de 28)`.
* Taxa que já veio na escala de 0 a 100: `formatPercentFromScale100(70)` imprime `70,0%`. Ela escreve **percentual**, não ponto percentual: variação em pontos percentuais é `formatDecimal(x, 1)` com `p.p.` escrito ao lado (`DAD-4`). **Emendas de 2026-10-01 e de 2026-10-02, sobre os dois nomes:** `formatPercentFromScale100` é o nome honesto que o Farol ganhou em 2026-10-01, e `formatPercentPoints` é o nome antigo da mesma função, ainda exportado e com o mesmo texto de saída (provado em `app/src/lib/format.test.ts`). Desde 2026-10-02 os dois estão na lista da seção 6 e passam no check (provado no `selftest`, com uma prova que passa e uma que acusa o nome fora da lista). **Versão nova usa `formatPercentFromScale100`; versão que já chama `formatPercentPoints` não muda** (15 versões medidas em 2026-10-02): trocar o nome altera o `Chart.tsx`, envelhece o preview e derruba o veredito da peça por uma mudança que não toca o desenho. O peso é de leitura e **não bloqueia**: o check aceita os dois nomes e não acusa o antigo em versão nova, e quem cobra é a revisão. A guarda `FORMATO-ACESSIVEL` trata os dois nomes como o mesmo formatador.
* Variação com sinal: `+` e o **sinal de menos tipográfico** `−` (U+2212), nunca hífen. **Emendas de 2026-10-01 e de 2026-10-02, sobre o que a biblioteca devolve em número negativo** (provado em `app/src/lib/format.test.ts`, com uma prova que acusa e uma que passa por formatador; antes delas o acervo tinha 10 versões com hífen antes de dígito no preview, entre elas `R$ -50 mil` em tique de eixo e `-0,57` em coeficiente):
  * **Todo formatador de número devolve o U+2212**, nunca o hífen do `Intl`: `formatInt` (`−20`), `formatDecimal` (`−0,57`), `formatPercent` e os dois nomes da escala de 0 a 100 (`−9,2%`), `formatCurrency`, `formatCurrencyCompact`, `formatCurrencyAxis`, `formatDays` (`−3 dias`), `formatHours` (`−1,5 h`) e `formatRateWithVolume`. Na emenda de 2026-10-01 só `formatDecimal` trocava o sinal, e `formatInt`, `formatPercent` e `formatCurrency` devolviam U+002D; a de 2026-10-02 fechou os três.
  * **Na moeda o sinal vem antes do símbolo, na forma inteira e na compacta:** `−R$ 340,00`, `−R$ 340`, `−R$ 50 mil`, `−R$ 1,2 mi`. A forma mista que a emenda de 2026-10-01 deixou (`-R$ 340` abaixo do milhar e `R$ −50 mil` acima) era defeito e saiu. A **posição** do sinal mudou só em `formatCurrencyCompact` e `formatCurrencyAxis` a partir do milhar; nos demais mudou só o glifo, e positivo e zero saem como sempre saíram.
  * Trocar o sinal à mão sobre a saída deixou de ser necessário, e o `.replace('-', '−')` que existe em peça antiga não quebra: fica sem efeito. O sinal à mão sobre o valor absoluto (`NUM-3`) segue correto e continua sendo o caminho quando a variação pede o `+`, que nenhum formatador escreve; a `NUM-3` foi emendada em 2026-10-02 para dizer isso, e a frase dela que dava o hífen do `formatPercent` como motivo saiu.
  * As emendas descrevem a biblioteca e **não mudam o peso** da regra nem ligam guarda: o `check` continua sem medir o sinal, e quem o cobra é a revisão (pergunta 14 do checklist).
* Data: `formatMonthShort('2026-08')` imprime `ago/26`; `formatDate('2026-08-03')` imprime `03/08/2026`. Dado sempre em `YYYY-MM-DD`.
* Ausência nunca vira zero: sem dado, o componente escreve "indisponível" (`formatUnavailable()`) em vez de desenhar barra zerada.
* Fontes: **Manrope** na interface (`font-sans`, herdada) e **Space Grotesk** em número grande e título de display (`font-display` ou `kpi-number`, que já liga algarismo tabular). A fonte Inter é proibida. Nunca `fontFamily` literal: o check recusa; em SVG e Recharts use `className="font-display"` no `<text>`.
* Pesos carregados pelo Farol: Manrope 400, 500, 600, 700; Space Grotesk 500, 600, 700. Peso fora disso cai no vizinho (Manrope 800 vira 700, Space Grotesk 400 vira 500) e o preview mostra o que o Farol vai mostrar.

## 9. Texto e nomes

* Texto de tela em **português do Brasil acentuado**: "Composição por canal de origem", nunca "Composicao por canal de origem" nem "Composition by source".
* Identificadores em **inglês**: componente, props, tipos, variáveis, `id` de dado (`RankingBars`, `highlightId`, `OriginSlice`).
* Sem hífen, travessão ou meia risca como separador de frase, no código, no `meta.json` e nos READMEs. Use ponto, vírgula, dois pontos ou ponto e vírgula. Hífen dentro de palavra composta e sinal de menos em número seguem normais.
* Título afirmativo e curto; caso de uso diz a pergunta que o visual responde.

## 10. Dado fixo e determinismo

O preview é o retrato de um componente, e o retrato precisa sair igual em qualquer máquina e em qualquer dia.

* Proibido no `Chart.tsx` e no `data.ts`: `Math.random`, `Date.now`, `new Date()` sem argumento, `Date()`, `performance.now`, `crypto.randomUUID`, `crypto.getRandomValues`. O check recusa.
* Id de SVG (degradê, recorte) vem de `useId()` do React, nunca de contador global nem de aleatório.
* Nada que dependa de hora, fuso, idioma do navegador ou tamanho da janela.

## 11. Acessibilidade mínima

* A raiz do visual tem `role` (`img` para gráfico, `figure` para composição com legenda, `group` para cartão, `table` para tabela) e `aria-label` com uma **frase calculada do dado**: o que é, quantos itens, o maior, o destacado. Não é o título repetido.
* Elemento só decorativo (ícone, SVG da sparkline quando a frase já diz tudo, amostra de cor da legenda) leva `aria-hidden`.
* Recharts: `accessibilityLayer={false}` quando a raiz já tem `role="img"` e frase, para o leitor de tela não ler o gráfico peça por peça.
* Cor nunca é a única pista: variação tem sinal e ícone, destaque tem peso de fonte, categoria tem rótulo.
* Contraste: texto em `--text-*` sobre `--surface-*`; marca de dado com as cores de `--chart-*`, que já são calibradas para os dois temas.

---

## 12. Comandos

Tudo roda dentro de `VISUAIS/_render/`. Na primeira vez: `npm install` (sem download de navegador; o render usa o Microsoft Edge instalado).

| Comando | O que faz |
|---|---|
| `npm run render -- <caminho>` | Renderiza toda versão sob o caminho (família, modelo ou versão, relativo a `VISUAIS`). Grava `preview.svg` ao lado do `Chart.tsx`, a captura do SVG em `_render/.qa/<caminho>.png`, a captura da página em `.pagina.png` e, se houver diferença, o mapa em `.diff.png`. |
| `npm run render -- <caminho> --tema claro` | Grava `preview-claro.svg` (e `.claro.png`). `--tema ambos` faz os dois. |
| `npm run check -- <caminho>` | Contrato (nomes, arquivos, `meta.json`, preview em dia, imports, cor, determinismo, acessibilidade, escrita, READMEs) e typecheck estrito com sonda de props. Sai com código 1 se houver erro. `--sem-tipos` pula o typecheck. |
| `npm run galeria` | Gera `VISUAIS/galeria.html`: família, modelo, versões com o SVG por `<img>` relativo, título, caso de uso, o que demonstra, estado do preview e links para `Chart.tsx`, `data.ts`, `meta.json` e README. Busca e alternância de tema. |
| `npm run selftest` | Prova da ferramenta: três processos disputando a trava entram em fila, trava de dono morto é liberada, e cada molde aberto sozinho no Google Chrome é comparado com a página renderizada no Edge. |

O `.` como caminho pega o catálogo inteiro (sem os moldes); `_render/exemplos` pega os moldes.

**Fluxo do produtor**, nesta ordem:

1. Copiar o molde mais próximo para `<familia>/<modelo>/<versao>/` e escrever `Chart.tsx`, `data.ts`, `meta.json` e os READMEs.
2. `npm run check -- <caminho> --sem-tipos` para pegar o contrato cedo (vai acusar preview ausente; normal).
3. `npm run render -- <caminho> --tema ambos`.
4. **Abrir o PNG de conferência** (`_render/.qa/<caminho>.png`) e olhar de verdade: corte, sobreposição, alinhamento, contraste, os dois temas. Corrigir e voltar ao passo 3.
5. `npm run check -- <caminho>` até sair `0 com erro`. Mudou `Chart.tsx`, `data.ts` ou `meta.json` depois do render, o check acusa preview desatualizado.
6. `npm run galeria` ao fim de um lote.

**O que o render confere sozinho:** o Chart monta sem props e sem erro; o DOM estabiliza; a raiz não sai com altura zero; nada passa da área do corpo; nenhum `var(--*)` ou `currentColor` sobra no SVG; nenhuma fonte fora do Farol; e o SVG aberto sozinho (como arquivo e como `<img>`) difere da página em no máximo 0,5% dos pixels (aviso até 2%, erro acima).

**Carga controlada.** O render e o typecheck do check passam por uma trava entre processos (`_render/.lock/`, criada com `mkdir`, que é atômico). Vários agentes ao mesmo tempo entram em **fila** e o terminal mostra `[trava] em fila`; não abra outro terminal para "furar". Cada execução usa um navegador e uma página, em sequência. A trava tem batimento a cada 10 s e é liberada se o dono morrer ou parar de bater por 2 min. Variáveis: `FAROL_LOCK_STALE_MS`, `FAROL_LOCK_MAX_WAIT_MS` (padrão 45 min), `FAROL_BROWSER_CHANNEL` (padrão `msedge`), `FAROL_BROWSER_PATH`. Prefira renderizar a família ou o modelo inteiro de uma vez a chamar uma versão por comando: um empacotamento e um navegador servem todas.

### Pendências e revisão

| Comando | O que faz |
|---|---|
| `npm run pendencias` | Cruza `_estudo/catalogo.json` com o disco e grava `_render/.qa/pendencias.json` (resumo no terminal). Motivos por versão: `sem_pasta`, `sem_chart`, `sem_data`, `sem_meta`, `sem_preview`, `sem_preview_claro`, `check_erro` (contrato, READMEs e tipos, a mesma lógica do check), `sem_readme_modelo`, `sem_revisao`, `revisao_reprovada`, `revisao_desatualizada`. Pronta é a versão sem motivo. Pasta de versão fora do catálogo vai em `extras`; os moldes ficam de fora. O typecheck roda uma vez para o conjunto, dentro da trava. `--sem-tipos` pula o typecheck. |
| `npm run revisao -- <familia>/<modelo>/<versao> aprovado\|reprovado "nota"` | Registra o veredito da revisão (CHECKLIST_REVISAO.md) em `_render/.qa/revisao/<familia>__<modelo>.json`, com a impressão sha1 de `Chart.tsx`, `data.ts` e `meta.json`. Reprovado exige nota. Mudou um dos três depois, o veredito vira `revisao_desatualizada` e a versão precisa de nova revisão. |

`npm run check -- <caminho> --json` devolve o mesmo resultado do check como JSON (use `npm run --silent` para o stdout sair limpo).

## 13. A moldura e o `preview.svg`

A moldura é **da ferramenta**, nunca do `Chart.tsx`. Ela existe para o preview parecer um cartão do Farol e dizer o que se vê, sem o componente precisar saber de catálogo.

| `frame` | Desenho | Para quê |
|---|---|---|
| `card` (padrão) | Fundo `surface-canvas` com 12 px de respiro, cartão `surface-raised` com borda `line-subtle` e raio de 8 px (o mesmo desenho do `VisualCard`), título em Space Grotesk e caso de uso em `text-muted` no cabeçalho, e o Chart no corpo. | Gráfico que no Farol vai dentro de um `VisualCard`. |
| `stage` | Fundo `surface-canvas`, título e caso de uso no topo, e o Chart direto no palco, sem cartão em volta. | Visual que já é o próprio cartão (KPI, cartão de alerta). |

O corpo recebe o canvas menos a moldura, e **o número desta linha estava errado até 2026-09-28**, quando
foi medido em 301 previews em vez de deduzido. A conta é `corpo = canvas − 2×recuo` na largura e
`canvas − 2×recuo − cabeçalho − 12` na altura, e **não existe um número só**: o cabeçalho tem duas
alturas, porque o caso de uso quebra em duas linhas por `line-clamp-2`.

| moldura | largura do canvas | recuo por lado | desconto de largura | desconto de altura, 1 linha | 2 linhas |
|---|---|---|---|---|---|
| `card` | 560 ou mais | 33 px | 66 px | 118,5 px | 135 px |
| `card` | menos de 560 | 29 px | 58 px | 108 px | 124,5 px |
| `stage` | 560 ou mais | 20 px | 40 px | 90 px | 90 px |
| `stage` | menos de 560 | 16 px | 32 px | 98,5 px | 98,5 px |

No preset `card` de 640x360 com moldura `card`, portanto, o Chart ganha **574 x 241,5 px** com o caso de
uso em uma linha e **574 x 225 px** em duas. Os "cerca de 574 x 234" que esta linha trazia não são
nenhum dos dois casos, e parecem média de duas situações que não se misturam. O vão de 12 px foi
confirmado em 257 previews. Dois agentes produtores pediram este número de forma independente, um
deles dizendo que sem a v1 pronta ao lado teria chutado, e 81 dos 205 modelos não têm v1 pronta. Tema escuro por padrão; `--tema claro` troca `data-theme` e grava `preview-claro.svg`.

**Como o SVG abre sozinho.** O render monta a versão numa página com o CSS do próprio Farol (importado de `../app/src/styles/index.css`, sem cópia) e serializa o DOM em SVG:

* SVG do gráfico (Recharts ou SVG puro) sai como **SVG nativo**, com as propriedades de pintura e texto copiadas do estilo computado. Toda `var(--*)` e todo `currentColor` viram cor concreta.
* HTML sem gráfico dentro (cartão, legenda, tabela) sai como **`foreignObject`** com XHTML e estilo computado inline por lista explícita de propriedades.
* HTML que contém gráfico é decomposto: fundo e borda viram `rect`, recorte vira `clipPath`, texto solto vira ilha de uma linha.
* Fontes: só os glifos impressos de cada face usada, recortados em woff2 e embutidos em base64 no `<style>` do SVG. Nos moldes isso dá de 11 a 18 KB de fonte e 23 a 35 KB de SVG.
* O cabeçalho do SVG carrega os carimbos que o `check` confere, cada um com o seu peso (a galeria mostra só os de origem e de tokens):

  | Carimbo | O que resume | Quando difere do estado atual |
  |---|---|---|
  | `data-farol-source` | hash de `Chart.tsx`, `data.ts` e `meta.json` da versão | **erro**, bloqueia sempre: o preview não é mais o desenho do código |
  | `data-farol-tokens` | hash de `tokens.css` e `index.css` do Farol | **aviso**: `feito com tokens antigos` |
  | `data-farol-lib` | hash da biblioteca compartilhada: `app/src/lib/format.ts`, `app/src/lib/utils.ts`, `app/src/components/visuals/valueFormat.ts` e, em `app/src/components/visuals/charts/`, `chartTheme.ts` e `ChartTooltip.tsx` | **aviso**: `preview desatualizado (biblioteca)` |
  | `data-farol-theme` | `dark` no `preview.svg`, `light` no `preview-claro.svg` | **erro**, bloqueia sempre |

  O carimbo da biblioteca (emenda de 2026-10-01) é **separado** do de origem de propósito. Medido no acervo de 491 versões: 487 importam `@/lib/format`, 349 o `chartTheme` e 147 o `ChartTooltip`, e nenhum entrava em carimbo, então mexer num formatador envelhecia centenas de previews com o `check` verde. Somado ao de origem, a mesma mudança reprovaria o acervo aprovado de uma vez; por isso ele **só avisa**: o desenho pode ter mudado, renderize e confira a imagem. Preview **sem** o atributo é anterior à emenda e **não acusa**: ausência é "não medido", e não "em dia", até o próximo render. Com a origem desatualizada, os avisos de tokens e de biblioteca se calam atrás do erro.

  A lista do carimbo segue o **alcance**: entra o arquivo que alguma versão alcança; o que nenhuma alcança só daria aviso sem desenho mudado. Ajuste de 2026-10-01, medido nas mesmas 491 versões antes do primeiro render carimbado: `valueFormat.ts` **entrou** (153 versões dependem dele, 6 direto e 147 pelo `ChartTooltip`) e `chartAria.ts` **saiu** (nenhuma versão o importa). Mudar a lista muda o carimbo de todo preview já carimbado: arquivo novo entra por decisão do dono.

Não sai no preview (e portanto não conte com isso para comunicar): pseudo-elemento `::before` e `::after` com `content`, `transform` de rotação ou escala em HTML, `foreignObject` dentro do SVG do Chart, imagem externa, estado de hover, dica aberta, animação. O render avisa quando encontra algum deles.

---

## 14. READMEs

### README do modelo (`<NN_modelo>/README.md`)

Título `# Nome do modelo` e as seções abaixo, **com estes nomes exatos e nesta ordem** (o check recusa se faltar ou trocar a ordem):

| Seção | Conteúdo |
|---|---|
| `## O que é` | Um parágrafo: a forma, o que ela codifica e como se lê. |
| `## Quando usar` | Lista de situações concretas, com o tamanho de dado que o modelo aguenta. |
| `## Quando evitar` | Lista de situações em que o modelo mente ou atrapalha, cada uma com a alternativa. |
| `## Anatomia` | Lista numerada das peças do visual, com os tokens e formatadores de cada uma. |
| `## Versões` | Uma linha por versão, citando o nome da pasta (`v1_...`) e o que ela demonstra. |
| `## Como colar no Farol` | Passos específicos do modelo, complementando a seção 16. |
| `## Referências` | Fontes de método (livro, guia, documentação) e o arquivo do Farol que serve de referência. |

**VER-1, versão planejada que ainda não existe.** O catálogo (`_estudo/catalogo/<familia>.json`) planeja de uma a quatro versões por modelo, e uma leva pode entregar só parte delas: em 2026-09-19 o dono decidiu que, nas 18 famílias fora do núcleo, cada modelo entrega **uma versão** por enquanto. Quando isso acontece, o README do modelo precisa de uma seção final chamada exatamente `## Versões planejadas (fora desta leva)`, com uma linha por versão ausente trazendo o slug do catálogo, o título e o que ela vai demonstrar.

O check mede: toda versão do catálogo sem `Chart.tsx` em disco exige a seção e exige o próprio slug citado nela; faltar qualquer uma das duas coisas é **erro**, não aviso. A razão é a mesma de sempre nesta frente: versão que falta de propósito, sem declaração, é indistinguível de versão esquecida, e quem abre o modelo seis meses depois não tem como saber que o vazio foi escolhido. O ausente não some do `pendencias`, que continua contando as versões planejadas como pendência: a seção declara a intenção, não cancela o plano.

### README da família (`<NN_familia>/README.md`)

Título `# Nome da família`, um parágrafo de abertura com o que a família resolve, e a seção `## Modelos` listando os modelos com uma linha cada. Recomendadas: `## Quando a família serve` e `## Quando procurar outra família`.

---

## 14.1 Peso de cada regra: o que reprova e o que anota

**Emenda de 2026-09-19, escrita depois de um modelo cair por 2 px.** Este contrato mistura dois tipos de regra, e tratá-las com o mesmo peso custa caro dos dois lados: sem distinção, ou tudo vira nuance e o encoding desonesto passa, ou tudo vira bloqueio e uma versão correta cai por uma margem de tique.

* **Regra que decide o que o desenho afirma: bloqueia sempre.** Encoding, domínio e sentido de eixo, unidade, papel de cor, identificação das marcas, alinhamento entre painéis, contraste, ausência exibida como zero. Errar qualquer uma delas faz o desenho dizer algo falso, e nenhuma delas é questão de gosto.
* **Constante de acabamento: bloqueia quando o desvio aparece no render.** `tickMargin`, altura de eixo, raio de canto, vão, espessura de traço e afins. O teste é a consequência medível no preview: colisão, texto cortado, tique perdido, marca partida, leitura apertada. Havendo consequência, é bloqueante e se descreve pela consequência, não pelo número. Sem consequência visível, é **observação**, registrada no README, e o próximo agente que tocar o arquivo alinha a constante.
* A razão é a mesma régua de peso que vale para as guardas do `check`: número com medição atrás reprova, número sem medição atrás avisa. Constante de acabamento é convenção de casa, e convenção se cobra na revisão do código, não na reprovação do visual.

---

**Desambiguação de 2026-09-28, e ela é dívida da própria codificação.** Os códigos `ACE-5` e `ACE-6`
estavam **cada um em duas regras diferentes**: as emendas de 2026-09-19 (opacidade em marca) e de
2026-09-20 (traço que carrega a relação) nasceram com códigos já ocupados por duas linhas da lista
base. Quem lia `ACE-6` no acervo não sabia qual regra era: em `12_hierarquia/07` e `08` significava o
traço que carrega a relação, e em `02_barras-horizontais/09`, `10_funil/01` e `07_rosca-e-radial/04/v2`
significava par medido. Não havia estado limpo anterior a preservar, porque a ambiguidade nasceu com a
emenda. O critério de desempate foi **minimizar referência errada**: as emendas ficaram com `ACE-5` e
`ACE-6`, que é o que 13 citações do acervo querem dizer, e as duas linhas curtas da lista base viraram
`ACE-7` e `ACE-8`, que nenhuma citação usava. Achado por extração automática ao gerar o dossiê de
produção, não por leitura: o extrator contou 79 regras em 77 códigos únicos e a diferença apareceu. **Esses 79 são de ANTES desta desambiguação**, e hoje o extrator conta 82 regras em 82 códigos únicos; um produtor viu os dois números no mesmo dossiê em 2026-09-29 e pediu o desempate, com razão, porque quem cita o número errado pede a régua errada.

---

## 15. Checklist antes de entregar uma versão

- [ ] Nomes no padrão e versão dentro de família e modelo com README.
- [ ] `Chart.tsx` monta com `<Chart />`, props tipadas, `data` opcional com default do `data.ts`.
- [ ] Só imports da seção 6; nenhuma cor literal; nenhum aleatório nem relógio.
- [ ] Raiz `h-full w-full min-w-0`, `role` e `aria-label` com frase calculada.
- [ ] Número, moeda e data por `@/lib/format`; sinal de menos tipográfico.
- [ ] Texto pt-BR acentuado, sem hífen separador; dado fictício sem pessoa ou empresa real.
- [ ] `npm run render -- <caminho> --tema ambos` sem erro e PNGs olhados nos dois temas.
- [ ] `npm run check -- <caminho>` com `0 com erro`.
- [ ] Padrão de acabamento (seção 17) conferido item a item com [CHECKLIST_REVISAO.md](CHECKLIST_REVISAO.md), sem nenhum "não".

## 16. Roteiro para colar no Farol

1. **Escolha o destino.** Visual de uma página só: `app/src/pages/<pagina>/visuals/<NomeDoVisual>/`. Visual que vai servir a várias páginas: proponha a promoção para `app/src/components/visuals/` numa tarefa própria.
2. **Copie** `Chart.tsx` e `data.ts` para lá. Não copie `meta.json` nem os previews.
3. **Renomeie o arquivo** se quiser (`Chart.tsx` para `RankingBars.tsx`), mantendo o `export default`. Ajuste o import do dado.
4. **Ligue o dado real.** Passe `data` pela prop a partir do seletor da página; o default do `data.ts` fica como amostra (o Farol também é dado fictício) ou sai, tornando `data` obrigatória, se a página sempre fornece.
5. **Embrulhe na moldura do Farol.** O título do `meta.json` vira o `title` do `VisualCard`, o caso de uso pode virar `subtitle`, e o `metricId` traz procedência e régua do registry:
   ```tsx
   <VisualCard metricId="receita-nova" title="Receita nova por executivo">
     <div className="h-64"><RankingBars data={rows} highlightId={currentUserId} /></div>
   </VisualCard>
   ```
   Visual de moldura `stage` (KPI) vai direto na grade, sem `VisualCard`, numa célula com altura.
6. **Dê altura ao pai** (`h-64`, a linha da grade) ou passe `height`. Sem altura, `ResponsiveContainer` desenha zero.
7. **Confira os estados** que o catálogo não mostra: recorte vazio, indisponível e dado parcial. Use `EmptyState` e `UnavailableState` do Farol quando fizer sentido.
8. **Rode no `app/`:** `npm run typecheck`, `npm run lint`, `npm run test`, e abra a página nos dois temas e a 390 px de largura. **Antes de copiar, saiba o que o lint do Farol vai cobrar:** de `VISUAIS/_render/`, `npm run lint -- <familia>/<modelo>` roda a régua do `app/eslint.config.js` sobre o `Chart.tsx` e o `data.ts` da versão (emenda de 2026-10-15, pedido P4 da replicação). O `check` do catálogo não roda essa régua, e em 2026-10-15 ela acusava 181 das 814 versões aprovadas (264 erros em 12 regras, as três mais frequentes `prefer-optional-chain`, `no-base-to-string` e `prefer-nullish-coalescing`). Ajuste na cópia, dentro de `app/src/`, com comentário no ponto; nunca aceite o autofix de `prefer-optional-chain` sem ler, porque `a?.b !== null` é verdadeiro quando `a` falta e `a && a.b !== null` não é: a forma equivalente é `a?.b != null`.

---

## 17. Padrão de acabamento

> Vigente desde 2026-09-14. É a régua de qualidade de toda versão do catálogo. As regras derivam de `_estudo/00_acabamento.md` (onde estão as fontes) e da revisão `app/validation/revisao-visuais-farol.md`. Cada regra tem código para ser citada em revisão; quem revisa aplica [CHECKLIST_REVISAO.md](CHECKLIST_REVISAO.md). Os três moldes de `_render/exemplos/` seguem esta seção e servem de gabarito visual.
>
> **Precedência.** O que a revisão do Farol listou em "O que NÃO mudar" vence esta seção: a pergunta impressa no cabeçalho da página, o registry como fonte da régua e da procedência, volume junto da taxa, a separação entre vazio e indisponível, o medidor de bala de capacidade e o texto das ressalvas. Nenhuma regra abaixo manda remover, encolher ou reescrever essas peças.
>
> **Contraste.** Os números citados foram medidos pela fórmula da WCAG sobre `app/src/styles/tokens.css` em 2026-09-14. Se um token mudar, a tabela da 17.10 precisa ser refeita antes de valer.

### 17.1 Tipografia e escala

| Papel | Tamanho | Fonte e peso | Cor | Classe típica |
|---|---|---|---|---|
| Número de KPI | 30 px | Space Grotesk 600 | `--text-primary` | `kpi-number text-3xl leading-none font-semibold` |
| Número de apoio (total, centro de rosca, valor de legenda) | 14 px | Space Grotesk 600 | `--text-primary` | `kpi-number text-sm font-semibold` |
| Título e subtítulo do cartão | do `VisualCard` | do `VisualCard` | do `VisualCard` | o Chart não desenha título |
| Linha de leitura (17.5, ANO-5) | 12 px | Manrope 400; nomes e números em 500 ou 600 | `--text-secondary`; nomes e números em `--text-primary` | `text-xs` |
| Rótulo de categoria | 12 px | Manrope 500; destacado em 700 | `--text-secondary`; destacado em `--text-primary` | `fontSize={12}` |
| Rótulo direto de valor | 12 px | Space Grotesk 500; destacado em 700 | `--text-secondary`; destacado em `--text-primary` | `className="font-display"` |
| Texto de legenda | 12 px | Manrope 400 | `--text-secondary`; ausência em `--text-muted` | `text-xs` |
| Tique, anotação, nota, unidade, contagem de apoio | 11 px | Manrope 400 ou Space Grotesk 500 no número | `--text-muted` | `text-[0.6875rem]`, `fontSize={11}` |

* **TIP-1. Algarismo tabular em todo número.** Número em Space Grotesk usa `kpi-number` ou `font-display`, que já ligam `tnum`; número em Manrope usa `tabular-nums`; em SVG, `className="font-display"` no `<text>` ou no `<tspan>`. Verifica: nenhum número de tela sem uma dessas classes.
* **TIP-2. Três tamanhos no corpo, no máximo,** além do número de KPI (em geral 14, 12 e 11 px). **Nada abaixo de 11 px.**
  * **Medido desde 2026-09-18 pela guarda `TAMANHO-TEXTO`, que reprova**, e a medida vale para os dois temas. Ela olha **trecho por trecho e não linha por linha**, porque a linha herda o maior tamanho dos seus `<tspan>` e esconderia um pedaço de 9 px ao lado de um de 11; e olha também o texto em HTML dentro de `foreignObject`, porque **dois dos quatro casos do acervo estavam justamente lá** e uma guarda só de SVG cobriria metade dizendo que mediu tudo. Única faixa de aviso: trecho sem letra e sem algarismo, como o `▲` de 9 px que é marcador de pico, e não texto.
  * **O teto também é régua, e continua sem mecanismo.** Ao menos 21 versões escrevem texto de SVG acima de 14 px, fora da escala desta régua, porque herdaram o padrão de 15 px da biblioteca. Isso está medido mas não é acusado, e entra na lista de emendas em estudo.
* **TIP-3. Peso 700 em no máximo dois elementos por visual:** o nome e o valor do destaque. A linha de leitura usa 500 ou 600.
* **TIP-4. Só pesos carregados:** Manrope 400, 500, 600 e 700; Space Grotesk 500, 600 e 700 (seção 8).
* **TIP-5. Texto sempre horizontal.** Nenhum `angle` em tique e nenhum `rotate` em texto. Se não cabe: reduzir tiques, usar a forma curta de tempo (`formatMonthShort`) ou trocar coluna por barra horizontal. Nome de categoria não se corta (TIP-7); o `clampTickLabel` do Farol não está na lista da seção 6.
* **TIP-6. Texto alinhado à esquerda, número à direita em coluna** (legenda com valor, tabela, tique do eixo Y). Centralizado só em rótulo sobre marca e no centro de rosca.
* **TIP-7. Nome de marca desenhada nunca some por reticência.** `truncate` só em texto de apoio que passe nas **duas** condições: o conteúdo inteiro está na frase acessível, **e** a cauda da frase não carrega o número nem a conclusão (emenda de 2026-09-28). O corte é sempre pelo fim, então uma linha de leitura escrita como "R$ 2,5 mi reconhecidos no trimestre; cliente novo lidera com 44%" perde exatamente o achado. Escreva a conclusão primeiro, ou deixe quebrar em duas linhas; reduzir a fonte não vale, o piso de 11 px manda. Medido em `06_pizza/01_pizza-simples/v1`, onde a frase cabia por 5 px e o defeito era latente, e em 62 versões do acervo que usam `truncate` na linha de leitura.

### 17.2 Papéis de cor

Todo pixel colorido do visual tem um papel desta tabela, e um token tem um papel só dentro do mesmo visual.

| Papel | Token | Para quê | Limite |
|---|---|---|---|
| **Destaque** | `--chart-1` | A marca que carrega a mensagem: a pessoa selecionada, o período atual, a série principal. | Um destaque por visual. |
| **Neutro de dado, com valor escrito** | `--line-strong` | Contexto **quando cada marca carrega o próprio número**: as demais barras de um ranking com destaque, a série de comparação. | Mede 1,79:1 (escuro) e 1,83:1 (claro) contra o cartão: só vale com o valor escrito na marca ou junto dela, que é a isenção da WCAG 1.4.11. |
| **Neutro de dado, sem valor escrito** | `--text-muted` | Contexto quando **não** há número por marca: nuvem de pontos, série de muitos elementos, painel de pequenos múltiplos. | Mede 5,21:1 e 5,37:1 contra o cartão, então passa o piso de 3:1 por si. É o mesmo papel que a §7 chama de "categoria neutra". |
| **Ausência** | contorno `--text-muted` sem preenchimento; texto `--text-muted` | "Sem origem declarada", "sem dado" dentro de uma composição. | Sempre por último e visível; nunca somada a "Outros". |
| **Categórico** | `--chart-1` a `--chart-6`, por slot fixo, atribuídos na ordem 1, 3, 6, 5, 2, 4 (COR-8) | Categorias sem ordem, cada uma com significado próprio. | Até 6. `--chart-7` e `--chart-8` só com rótulo direto em cada marca. |
| **Sequencial** | `--seq-1` a `--seq-7` | Intensidade, etapa ordenada, mapa de calor. | `--seq-1` a `--seq-3` medem de 1,14:1 a 2,29:1 no escuro: só com o valor escrito na célula. "Sem dado" nunca usa `--seq-1`. |
| **Semântico** | `--positive`, `--negative`, `--warning` | O sentido do bom de uma variação; estado. | Nunca pinta série; sempre acompanhado de sinal, ícone ou palavra. |
| **Procedência** | `--prov-*` | Só a etiqueta MEDIDO, DERIVADO, PREMISSA, LACUNA, que é do `VisualCard`. | Nunca em marca de dado. |
| **Referência** | `--text-muted`, traço de 1 px tracejado `3 3` | Média, meta, teto. | A linha do zero usa `--line-strong` sólido. |
| **Estrutura** | `--line-subtle` na grade; `--surface-raised` como separador entre segmentos | Grade e vão. | Grade nunca em `--line-strong`. |

* **COR-1. Cinza por padrão.** Visual de uma série tem uma cor só; arco-íris em série única é proibido (revisão, A7).
* **COR-2. Destaque não depende só da cor.** A marca destacada também muda o peso do rótulo (700) ou recebe anotação. O motivo é medido: no tema claro não existe cor que passe 3:1 ao mesmo tempo contra o cartão branco e contra `--chart-1` (exigiria luminância abaixo de 0,30 e acima de 0,47), então o neutro vive da isenção do valor escrito e o destaque precisa de um segundo canal.
* **COR-3. A cor pertence à categoria, não à posição.** Mapa fixo de categoria para slot, vindo do dado (`slot: 1..6`, como no molde do waffle) ou de um dicionário da página. Proibido `seriesColor(index)` sobre array ordenada por valor ou filtrada.
* **COR-4. Teto de 6 categorias coloridas.** Da sétima em diante, agrupar em "Outros (n=X)" com a contagem no rótulo. A categoria de ausência não entra no teto.
* **COR-5. Vizinhos que não contrastam entre si** (pilha, rosca, waffle, barras coladas) têm separação: vão de pelo menos 1,5 px ou contorno `--surface-raised` de 1 a 2 px.
* **COR-6. Semântica segue a polaridade da métrica** (`goodDirection`): receita subindo é `--positive`, custo subindo é `--negative`. Métrica sem polaridade usa `--text-secondary`, nunca verde nem vermelho.
* **COR-7. Sem fundo tingido atrás de texto semântico.** `text-positive` sobre `bg-positive/15` mede 4,33:1 no claro e reprova. A variação vai em texto semântico direto sobre o cartão (5,34:1 no claro, 7,36:1 no escuro) até existir o token da proposta P2.
* **COR-8. Slots categóricos atribuídos na ordem 1, 3, 6, 5, 2, 4.** `--chart-2` e `--chart-4` vão por último porque repetem o hex de `--warning` e `--prov-premissa`, e de `--positive` e `--prov-medido`; assim uma composição de até 4 categorias nunca parece "boa" ou "medida" ao lado do selo do `VisualCard`. Visual que pinta variação semântica **no próprio corpo** não usa `--chart-2` nem `--chart-4` em nenhuma hipótese. Distância medida (ΔE76 em deuteranopia, matriz de Machado 2009): os quatro primeiros ficam acima de 17 nos dois temas (o par mais fraco é 1 e 5); 2 e 6 caem para 4,1 no claro e 4 e 5 para 15, então 5 e 6 juntos de 2 ou 4 exigem o vão da COR-5 e rótulo em cada marca.
* **COR-9. Tinta só para o dado.** Sem gradiente, sombra, brilho, textura decorativa ou 3D em marca e em fundo. `opacity` só em marca (hover, fora de foco), nunca em texto (revisão, A2).

### 17.3 Eixos e grade

* **EIX-1. Barra, coluna e área começam no zero:** `domain={[0, ...]}`. Se a pergunta pede recorte de escala, a forma vira ponto ou linha.
* **EIX-2. Área preenchida só com escala a partir do zero.** Sparkline escalada do menor ao maior valor não tem área.
* **EIX-3. Grade só na direção da leitura:** coluna e linha com `<CartesianGrid stroke="var(--line-subtle)" vertical={false} />`; barra horizontal com valor escrito não tem grade; nunca grade nos dois sentidos.
* **EIX-3b. Grade nos dois sentidos quando os dois eixos são quantitativos e lidos por posição** (exceção medida em 2026-09-19, reescopada em 2026-09-28). Dispersão, bolhas, matriz e quadrante leem posição em X **e** em Y, então a grade nos dois sentidos é a régua do desenho, não enfeite, e ali ela é obrigatória e não proibida. A redação original nasceu de coluna, linha e barra, em que um dos eixos é categoria e a grade transversal só suja. A regra vale como está para todo gráfico com eixo de categoria; onde a exceção se aplica, grade nos dois sentidos em `--line-subtle`, sem tique e sem linha de eixo.
  * **Emenda de 2026-09-28: a exceção é escopada por geometria, não por número de família.** A redação anterior dizia "para as famílias 09, 16, 17 e 25", e isso condena peça que a própria razão da exceção absolve. O teste é do desenho, e tem duas perguntas: **os dois eixos são quantitativos?** e **a marca é lida por posição nos dois?** Só com as duas respostas em sim a grade nos dois sentidos é régua. A família 16 mistura as duas geometrias e prova o ponto: o `strip plot` e o `box plot` têm `<YAxis type="category">`, então neles vale a regra original e a grade transversal só suja; já a ECDF tem as duas grandezas e o cruzamento se lê por posição nos dois eixos.
  * **Segunda emenda, de 2026-09-28: marca ancorada no zero se lê por extensão, nunca por posição, e por isso nunca satisfaz a pergunta 2.** A redação anterior desta exceção citava o **histograma** como caso de "sim", e isso está errado: os dois eixos de um histograma são quantitativos, mas a barra nasce no zero e a contagem se lê pelo **comprimento** dela, então linha de grade transversal não ajuda a ler grandeza nenhuma e volta a ser sujeira. Vale para barra, coluna, histograma, caixa de box plot e qualquer marca com base fixa. **O teste ficou com três perguntas, e a terceira é a que decide os casos difíceis: a marca tem base ancorada?** Se tem, a resposta é não, mesmo com os dois eixos numéricos. Emendado por convergência independente: um agente mediu que na diagonal de uma matriz de dispersão a barra se lê por comprimento e deu "não", e outro citou a redação antiga para acusar quatro versões de histograma que estavam **certas**. Duas recusas independentes bastam para emendar sem discutir, e esta é a segunda vez que esta mesma exceção me corrige. Achado ao medir o `AXIS_PROPS` compartilhado, que traz `axisLine` ligado e é **sobreposto por 85 dos 104 chamadores**, ou 82%: padrão que a maioria de quem chama desfaz é padrão errado, e o conserto na raiz depende da emenda do `sourceHash`, senão ele envelhece os previews em silêncio com o `check` verde.
  * **Esta regra não pode ter guarda, e isso é decisão declarada de 2026-09-28.** A primeira
    pergunta do teste é mecânica: dá para ler `type="number"` contra `type="category"` no código. A
    segunda **não é**, porque "a marca é lida por posição" depende do tipo de marca e não do tipo de
    eixo: num histograma os dois eixos são quantitativos e a barra se lê por **altura**, numa série
    temporal o X é rótulo de tempo e não grandeza medida contra a grade, e numa matriz a resposta
    muda **de painel para painel** dentro do mesmo arquivo. Uma varredura por busca de texto acha 19
    candidatas e a maioria não é violação; quem tratar a lista como veredito reprova peça correta.
    Esta é a diferença entre regra verificável e regra de leitura, e ela vale como precedente: guarda
    só existe para o que se mede sem interpretar o que o desenho afirma.
  * **Por que esta exceção tem código próprio, decidido em 2026-09-28.** Ela vivia como sub-bullet sem código, e por isso **quem consultava a `EIX-3` por busca do código lia o oposto da regra**: a busca devolve a linha do enunciado, que proíbe, e a exceção, que obriga, ficava fora do resultado. Custou uma leitura errada minha e três renders de um agente que fez tudo certo. A casa já tinha a convenção, em `EST-1b` e `ROT-5b`: emenda que muda a regra é bullet de topo com código próprio. Regra nova da casa: **emenda nunca mora em sub-bullet sem código.**
* **EIX-4. De 3 a 5 linhas de grade em cartão** de até 280 px de altura, em intervalo redondo, com `domain` e `ticks` calculados no componente; `allowDecimals={false}` em contagem. O eixo termina na primeira linha de grade acima do maior valor.
* **EIX-5. Eixo calmo:** com grade, `tickLine={false}`, `axisLine={false}` e `tickMargin={8}` (sobrescrevem o `axisLine` de `AXIS_PROPS`). Com valor negativo, `<ReferenceLine stroke="var(--line-strong)" y={0} />`.
* **EIX-6. Tique de moeda por `formatCurrencyAxis`,** com a unidade no próprio tique, e `YAxis width` numa constante do topo do arquivo, entre 48 e 64.
  * **Emenda de 2026-09-28, e a faixa de 48 a 64 fica como está. O que estoura é o rótulo, não o eixo.**
    Dois agentes bateram no mesmo muro e **alargaram o eixo**, um para 72 e outro para 80, porque o
    Recharts **quebrou o tique em duas linhas** em vez de estourar a caixa, o que nenhuma guarda pega
    porque o texto continua dentro do corpo. Uma terceira medição, por soma de largura glifo a glifo,
    mostrou que a leitura deles era do sintoma: o tique de moeda negativa em centenas de milhar, que desde
    2026-10-02 sai como `−R$ 200 mil`, soma a 11 px **61,79 px** de tinta em Space Grotesk e **58,43 px**
    em Manrope e, só com o `tickMargin` de 8 da `EIX-5`, pede de 66 a 70 px, já acima do teto de 64.
    Alargar o eixo **contorna**; a saída do contrato é a `REC-2`, **trocar a unidade do rótulo**. A
    redação de 2026-09-28 dava como exemplo `R$ -0,2 mi`, que "pede 62,69 px e cabe", e a medição de
    2026-10-02 não confirma: `−R$ 0,2 mi` no tique padrão só fica em uma linha com 72 px de eixo, então
    trocar a unidade encurta a tinta e **não** traz o tique negativo para dentro do teto. Ver a emenda de
    2026-10-02, abaixo.
  * **A regra operacional, quarta redação e a primeira com duas medições consistentes.** A sobrecarga do
    eixo sobre a tinta do tique é de **cerca de 18 px**, não do `tickMargin` de 8 nem dos 2 px de folga da
    tinta: medido em 2026-09-28 em `R$ 60 mil`, 46,20 px de tinta pedindo **64 px** de eixo (17,8 de
    sobrecarga), e no tique negativo de centenas de milhar, 61,79 px pedindo **80 px** (18,2). **As duas
    medições foram refeitas em 2026-10-02, de 1 em 1 px, e a segunda não vale para o texto que a
    biblioteca devolve hoje: ver a emenda abaixo.** As redações anteriores erravam porque somavam o
    `tickMargin` e paravam, e assim previam 56 px para o primeiro caso, onde 56 **quebrou o tique em duas
    linhas**. Então: some a tinta **glifo a glifo** pela tabela de `colisao.mjs`, **acrescente 18 px**, e se
    passar de 64 **encurte o rótulo em vez de alargar o eixo**. Em outras palavras, o teto de 64 px
    significa **tinta de no máximo 46 px**, e é esse o número a conferir na tabela. Largura de eixo acima de 64 é sinal de que a unidade está errada, não de que o teto
    está apertado. A margem a acrescentar é **+2 px por linha** e não é percentual: o erro da soma por
    glifo tem p99 de +0,53 px em Space Grotesk e +1,24 px em Manrope. **Não use a média por classe para
    isso:** ela erra de 9% a 21% em string real, porque média não descreve composição, e o atalho
    `6.4 × n` erra para os **dois** lados, superestimando 22,7% em `R$ 401,3 mil`, o que **esconde** o
    rótulo em vez de transbordá-lo.
  * **Emenda de 2026-10-02 (F0.5c): as larguras medidas de novo, com o texto que a biblioteca devolve
    depois do F0.5b.** `formatCurrencyAxis` e `formatCurrencyCompact` escrevem o negativo como
    `−R$ 200 mil`, com o U+2212 antes do símbolo; `R$ -200 mil` e `R$ −200 mil` não saem mais de
    formatador nenhum. Medido numa bancada fora do acervo, pelo `npm run render` do catálogo, com o tique
    padrão do Recharts (`AXIS_PROPS`, Manrope a 11 px, `tickMargin` de 8) e o eixo de 46 a 90 px, de 1 em
    1. A tinta é a soma por glifo de `colisao.mjs` e, entre parênteses, a largura que o navegador mediu:

    | Tique | Tinta a 11 px em Manrope | Tinta a 11 px em Space Grotesk | Menor eixo em uma linha | Eixo menos tinta em Manrope |
    |---|---|---|---|---|
    | `R$ 60 mil` | 46,20 px (45,83) | 48,08 px (47,97) | **62 px** | 15,8 |
    | `R$ 700 mil` | 51,39 px (51,23) | 54,36 px (54,78) | **70 px** | 18,6 |
    | `−R$ 0,2 mi` | 51,22 px (51,56) | 54,69 px (54,97) | **72 px** | 20,8 |
    | `−R$ 50 mil` | 51,72 px (51,30) | 54,71 px (54,78) | **72 px** | 20,3 |
    | `−R$ 200 mil` | 58,43 px (57,92) | 61,79 px (61,61) | **81 px** | 22,6 |
    | `R$ -200 mil`, o texto de antes do F0.5 | 57,15 px (56,59) | 59,72 px (59,66) | 76 px | 18,9 |

    Três leituras, todas medidas. **Primeira: a sobrecarga não é constante.** Vai de 15,8 px no tique
    positivo a 22,6 px no negativo de centenas de milhar, então o `+18` desta regra erra de 2,2 px para
    cima a 0,6 px para baixo no positivo e **subestima o negativo em 2,3 a 4,6 px**. O 61,79 px da redação
    de 2026-09-28 já era a soma com o U+2212 em Space Grotesk, e não a do hífen que o texto citava.
    **Segunda: o motivo.** O `<Text>` do Recharts não mede a tinta a 11 px: mede cada palavra num vão
    solto no `body`, no tamanho do corpo da página (15 px) e, no primeiro desenho, na fonte de reserva,
    porque a Manrope ainda não carregou, e põe a palavra seguinte na mesma linha só enquanto a soma das
    palavras, com um espaço por vão, fica **abaixo** da largura do eixo (`recharts/es6/component/Text.js`,
    função `calculate`). Essa soma, medida na bancada, reproduz os seis limiares da tabela sem resto: 61,64
    px em `R$ 60 mil`, 71,91 em `−R$ 50 mil`, 80,00 em `−R$ 200 mil`, que por isso quebra com 80 e cabe com
    81. O sinal antes do símbolo acrescenta 10,3 px a ela. **Terceira: o limiar é o do render do catálogo.**
    Com a Manrope já carregada a mesma soma dá 62,50 px em `R$ 60 mil` e 79,00 em `−R$ 200 mil`; o Farol
    não foi medido, e o que se confere é o `preview.svg`.
  * **O que a emenda de 2026-10-02 muda e o que não muda.** Não muda a faixa de 48 a 64, nem a saída pela
    `REC-2`, nem o peso da regra, e nenhuma guarda foi ligada: tique quebrado em duas linhas continua sem
    guarda, e quem o cobra é a revisão. Muda o uso do `+18`: ele **não** serve para escolher a largura de
    um eixo com tique negativo, e ali vale o que a `REC-2` já manda, conferir no `preview.svg`. Os 80 px
    que a medição de 2026-09-28 fixou para o negativo de centenas de milhar quebram `−R$ 200 mil`. Todo
    tique negativo de milhar da tabela pede 72 px ou mais no tique padrão, acima do teto de 64 com
    qualquer unidade, o que alarga a tensão que o dossiê já declara entre a unidade no tique e o teto: a
    decisão sobre ela é do dono do catálogo, e até ela sair o desvio se declara pela `14.1`.
* **EIX-6b. Altura do eixo X é `tickMargin` mais a tinta do rótulo, nunca menos de 23 px** (emenda de
  2026-09-28). A `EIX-6` dava a faixa do eixo Y e o contrato **não dizia nada sobre o X**, que é uma
  lacuna e não um esquecimento de número: o rótulo do X nasce a `tickMargin` da linha, a `EIX-5` fixa
  esse valor em 8, e a tinta de uma linha de 11 px mede cerca de 15 px, logo a faixa precisa de 23 px
  no mínimo. `XAxis height` vai numa constante do topo do arquivo, como a do Y. **Aumentar o canvas não
  resolve**, e isso foi medido: com a grade em `flex-1` a altura extra é absorvida pelo plano e empurra
  o rótulo junto, então o conserto é a faixa do eixo e não a tela. Custou três rodadas de render a um
  agente que acertou todo o resto de primeira.
  * **Emenda de 2026-09-29: o piso de 23 px vale para UMA linha, e a soma `tickMargin` mais tinta
    subestima o resto.** Um produtor precisou de rótulo em duas linhas de 11 px, somou 8 de `tickMargin`
    com 22 de tinta, declarou **38 px** de folga sobre os 30 calculados, e o render ainda acusou
    `Conteudo passa da area do corpo` por **3 px**; fechou com **48 px**. Ou seja o eixo X tem
    sobrecarga sobre a tinta da mesma ordem dos **18 px** que a `EIX-6` mediu no eixo Y, e a conta desta
    regra a ignorava. A régua prática: para rótulo de uma linha, os 23 px de piso; para duas linhas,
    conte a tinta das duas e **acrescente 18 px**, como no Y. E mantenha o número numa constante do topo,
    porque quem lê o arquivo precisa ver a conta, não o resultado.
  * **Emenda de 2026-10-02: com o eixo de categoria escondido, o tique da borda do eixo de valor pede 12 px de margem do lado dele.**
    Medido em bancada com `XAxis hide` e a margem de 0 a 18 px: até 11 px de `margin.bottom` o tique da base (`R$ 0`) não é desenhado, e com menos de 12 px de `margin.top` o tique do topo é deslocado para 11,25 px e sai da linha de grade dele.
    A conta: o Recharts exige meia altura de tique entre a coordenada dele e a borda do gráfico, e mede
    essa altura em **22,5 px**, não nos 11 px declarados; a metade é 11,25 px, e 12 é o primeiro inteiro
    que a cobre. Os 22,5 px coincidem com a linha de 15 px por 22,5 px que o `<svg>` do Recharts declara
    nos previews do acervo. Com o eixo de categoria visível quem dá essa folga na base é a própria
    faixa do eixo, os 23 px desta regra, e por isso o defeito só aparece quando ele some: a margem
    padrão do Recharts é de 5 px e não basta. Prova no `recharts 3.10.1` instalado: o padrão
    `interval: 'preserveEnd'` (`cartesian/CartesianAxis.js:70`) cai em `getTicksEnd`
    (`cartesian/getTicks.js:169`), que só reposiciona o último tique (`:29-33`) e descarta os demais
    pelo `isVisible` de `util/TickUtils.js:34`. A medição é do eixo de valor em pé, no tique padrão de
    11 px; na peça deitada, com o eixo de categoria à esquerda escondido, a conta é de largura e é a da
    `EIX-6`. **Peso:** constante de acabamento da `14.1`, bloqueia quando o tique some ou sai da linha
    de grade no render. Declare a margem numa constante do topo, com a conta ao lado.
* **EIX-7. Eixo de categoria com até 8 categorias imprime todas:** `interval={0}`. O teto repete o `FORCED_TICK_LIMIT = 8` do Farol como constante local, porque o nome não está na lista da seção 6.
* **EIX-8. Sem eixo duplo.** Duas grandezas viram dois gráficos alinhados, com o mesmo eixo X e o mesmo `syncId`.
  * **Como uma peça de eixo duplo se acusa, em vez de só avisar** (técnica medida em 2026-09-28).
    Dizer no rodapé que "as escalas são independentes" é verdade e não convence, porque o leitor já viu o
    cruzamento. A peça que demonstra **imprime a taxa de câmbio implícita** entre os dois eixos, isto é
    quanto de uma grandeza o desenho está equiparando a quanto da outra: com R$ 60 mil no teto de um eixo
    e 600 leads no do outro, o desenho afirma **R$ 100,00 por lead**, e esse número não está no dado, está
    na escolha do autor. Em seguida ela mostra o que muda subindo o teto de um eixo **um passo**: no caso
    medido, de 600 para 800 leads, o empate cai para R$ 75,00 e as séries "eficientes" vão de **3 para 1**
    de cinco, **sem nenhum número do dado mudar**. Isso troca uma afirmação por uma demonstração
    aritmética dentro da peça, e é o padrão a seguir em qualquer versão que assuma o eixo duplo de
    propósito, inclusive nas que existem para mostrar o antipadrão.
* **EIX-9. Escala comum** quando os gráficos existem para serem comparados (pequenos múltiplos, um cartão por pessoa): domínio calculado sobre o conjunto.
* **EIX-10. Lacuna não é zero nem interpolação.** Valor ausente vai como `null` com `connectNulls={false}`, ou quebra o caminho em SVG. Período corrente incompleto leva o último trecho tracejado (`strokeDasharray="4 4"`) ou ponto vazado, com a nota "parcial até" seguida de `formatDate`.
* **EIX-11. Série com menos de 3 pontos não vira linha** (revisão, A13): vira número com comparação.
* **EIX-12. Painéis alinhados só se alinham com a mesma escala de categoria** (emenda de 2026-09-19). A EIX-8 manda trocar o eixo duplo por dois gráficos empilhados com o mesmo eixo X, e é aí que mora a armadilha: em Recharts, `BarChart` põe a categoria numa escala **band**, que reserva uma faixa por categoria e centraliza a marca nela, enquanto `LineChart` usa **point**, que põe o ponto na divisa. Com a mesma lista de meses e a mesma largura, o mesmo mês cai em pixels diferentes nos dois painéis: na revisão de `08/03`, **42 px de distância**, e o eixo X impresso embaixo, que os dois painéis compartilham, valia só para a linha.
  * O sintoma é invisível no código e evidente no PNG: a última marca de um painel encosta na borda enquanto a do outro sobra. `syncId` sincroniza a dica, **não a escala**, e não corrige isso.
  * A correção é usar a mesma escala nos dois painéis, dando à linha a escala band com `xAxisId` de mesma configuração (`scale="band"` e `padding` igual), ou desenhando os dois com o mesmo tipo de gráfico. Quem empilha painéis confere no PNG se a marca do primeiro mês nasce na mesma coluna de pixels nos dois, antes de olhar qualquer outra coisa.
  * **O painel marginal cobra três coincidências, não uma** (ampliação de 2026-09-19, medida em `09/08`): mesma escala, **mesmo sentido** e **mesma margem interna**. O sentido é o que mais engana: o eixo de valor de uma dispersão cresce para cima, enquanto o eixo de categoria de um `BarChart` horizontal lista de cima para baixo, então o histograma marginal de Y nasce **de cabeça para baixo** se ninguém o reverter, e a faixa mais cheia aparece exatamente onde o plano está vazio. Na primeira passada de `09/08` os marginais ainda estavam deslocados 60 px em X e 30 px em Y, porque a área interna do gráfico muda com a largura do eixo e com a margem, e cada painel tinha a sua.
  * Prova rápida, antes de qualquer acabamento: escolher o ponto extremo do plano, o mais alto e o mais à direita, e conferir no PNG se a barra marginal correspondente está na mesma linha e na mesma coluna dele. Marginal que contradiz o plano é pior que marginal nenhum, porque o leitor confia na distribuição desenhada ao lado.

### 17.4 Rótulo direto contra legenda

* **ROT-1. Uma série: sem legenda.**
* **ROT-2. Barra: nome ao lado e valor escrito na ponta livre.** Com o valor escrito, sai o eixo de valor e sai a grade. **A âncora do rótulo é a ponta livre da marca, nunca o zero** (emenda de 2026-09-17; substitui a redação anterior, que dizia "na ponta" sem dizer onde é a ponta). Em Recharts, o `x` que o `Rectangle` e o `LabelProps` devolvem é sempre o pixel da **base**, que é o zero, e não o da ponta, inclusive com valor negativo e com eixo revertido. A ponta livre é `x + width`. Ancorar em `x` funciona por acidente enquanto todas as barras crescem para a direita e quebra na primeira que cresce para o outro lado.
  * **O caso divergente e o butterfly.** Na metade esquerda de um butterfly, e em qualquer divergente cuja marca cresce para a esquerda, o retângulo vai da ponta até o zero e `x` cai junto da linha de zero: o rótulo ancorado ali nasce **por cima da própria barra**. Foi o que reprovou as quatro versões de `02/07` em duas rodadas seguidas. A correção é de uma linha, `Number(x) + Number(width)` com `textAnchor="end"` no lado esquerdo, e vale para qualquer sinal, porque resolve a ponta livre sem perguntar a direção.
  * Quem escreve o lado que nasce do zero deixa um comentário de uma linha no render do rótulo dizendo isso. Sem ele, a próxima cópia do padrão repete a armadilha, que é invisível no código e só aparece no PNG.
  * O respiro entre o rótulo e a ponta é o `VALUE_LABEL_GAP = 6` da 17.7. Quando dois rótulos de séries vizinhas podem se aproximar, a versão declara o respiro mínimo entre eles em constante nomeada. **O piso é de 4 px entre a tinta de um rótulo e a do vizinho**, o que com texto de 12 px (tinta de 11,75 px de altura) equivale a **16 px entre as âncoras**, que é a forma útil da constante porque já absorve a altura da tinta (medido em 2026-09-17; **corrige a proposta de 8 px, que pedia 20 px entre âncoras e não se justificou**). Evidência, em pares de barras coladas com passo de 12 a 22 px: **0,25 px** de respiro cola a vírgula de cima na caixa-alta de baixo e o par lê como bloco único; **2,25 px** separa mas ainda lê como bloco; **4,25 px** é o primeiro degrau em que as duas linhas se leem soltas; **6,25 px** é confortável; **8,25 px** e **10,25 px** só acrescentam ar, sem ganho de leitura. O caso que reprovou `02/02 v2` cai abaixo de 4 px.
* **ROT-3. Linha com até 4 séries: rótulo no fim de cada linha,** em `--text-secondary`, com marcador na cor da série.
* **ROT-4. Legenda só quando o rótulo direto não cabe** (waffle, pilha estreita, dispersão densa). Fica acima ou ao lado do gráfico, na ordem visual das marcas (pilha lida de cima para baixo), com amostra na forma da marca (quadrado para célula, vazado para ausência), em até duas linhas e nunca mais alta que 30% do corpo.
* **ROT-5. Legenda com valor** traz percentual e contagem em colunas à direita, com largura fixa e alinhamento à direita.
* **ROT-5b. Régua de tamanho termina no máximo do recorte** (emenda de 2026-09-28). Quando a legenda ensina a ler área ou raio, o último degrau dela é o maior valor **observado**, calculado do dado, nunca uma constante escrita à mão. Constante envelhece no primeiro recorte diferente e deixa a maior marca da tela sem referência: aconteceu de forma independente em `09_dispersao-e-bolhas/09_densidade-2d/v1` e `09_dispersao-e-bolhas/04_bolhas-em-grade-categorica/v1`, as duas pegas por revisão humana e nenhuma pelo `check`.
* **ROT-6. Texto sobre marca colorida** usa `--accent-cyan-contrast` sobre `--chart-1` (10,06:1 no escuro, 6,00:1 no claro). `--text-primary` sobre as categóricas mede de 1,53:1 a 3,37:1 e é proibido.
* **ROT-7. Rótulo que cruza linha de referência ou outra marca leva halo** na cor da superfície: `style={{ paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeWidth: 4 }}` no `<text>`. **O halo é obrigatório, não opcional** (emenda de 2026-09-17), e a decisão se toma sobre o que o dado **pode** produzir, não sobre o que o dado fixo do preview produziu: rótulo que em algum recorte plausível cai sobre marca, contorno ou linha de referência nasce com halo.
  * **Exceção, a barra curta.** O halo é tinta da superfície pintada por baixo do texto, então sobre uma categoria pequena, em que sobra um toco de poucos pixels, ele apaga a marca e **parte a barra em duas**, que foi o que a revisão mediu nas faixas pequenas de `02/07`. Nesse caso o rótulo não entra na marca: sai para fora da ponta livre com o `VALUE_LABEL_GAP` (ROT-2), em `--text-secondary` sobre o cartão, e o halo só volta se ali ele cruzar outra marca ou uma linha. A versão declara o limiar de "cabe dentro" em constante nomeada, comparando a largura estimada do texto com o comprimento livre da barra. **O limiar horizontal é largura do texto mais 16 px, confirmado por medição em 2026-09-17**: a tinta de `R$ 401,3 mil` em 12 px mede **69,00 px de largura** nos dois temas, e numa barra de 20 px o comprimento de 69 mais 16 deixa **8 px de cada lado**, que lê limpo; o degrau abaixo, 69 mais 11, deixa 5,5 px e lê apertado; 69 mais 7 deixa 3,5 px e joga o `R` contra o canto arredondado de 3 px.
  * **O limiar horizontal é necessário e não é suficiente, e esta é a correção que a medição trouxe.** O mesmo teste desenhou um toco de **110 px**, que passa folgado no limiar de 85 px, e o halo mesmo assim **partiu a barra em duas** nas espessuras de 10, 12, 14 e 16 px: em 10 px sobraram apenas dois cotocos, com **49 px de colunas sem nenhuma tinta de marca**; em 12 px, 41 px; em 14 px, 5,5 px; em 16 px, 4,75 px; **em 18 px o corte desaparece** e sobra 2 px de marca acima e abaixo do texto; em 20 px sobram 4 px. O motivo é geométrico: o halo de `strokeWidth: 4` pinta 2 px para fora de cada extremo da tinta, então a faixa apagada vai de 7,50 px acima a 8,25 px abaixo do centro e só cabe em marca de 18 px ou mais. O limiar ganha, portanto, um segundo termo: **o rótulo só entra na marca se a marca tiver ao menos 18 px de espessura**, o mesmo piso da ESP-2. Os dois temas dão o mesmo degrau.
  * **No tema claro o halo apaga também o texto.** `--accent-cyan-contrast` no claro é `#ffffff` e `--surface-raised` no claro é `#ffffff`: o halo da ROT-7 sob o rótulo da ROT-6 mede **1,00:1** contra o próprio texto, e a leitura sobre o toco some inteira. Isso é contraste, não geometria, e não muda o degrau de 18 px.
  * **Exceção da marca fina, medida em 2026-09-19.** O halo de `strokeWidth: 4` pinta 2 px de superfície para fora de cada extremo da tinta, então **apaga por inteiro qualquer marca de traço mais fina que essa faixa**: seta, conector, linha de série e contorno de 1 a 3 px somem sob o rótulo. Na revisão de `09/06`, o halo de um rótulo apagou **41 px** do traço de uma seta e o de outro comeu a própria ponta, e as setas passaram a parecer partidas. A regra que resolve não é mexer no halo: **onde o rótulo cruzaria uma marca de traço, quem sai do lugar é o rótulo**, por posicionamento anticolisão calculado em TypeScript, com linha de chamada se precisar. O halo fica para o que ele foi feito, texto sobre área cheia com 18 px ou mais de espessura (o degrau da ESP-2 já medido acima).
  * **Pendência aberta.** O halo usa `--surface-raised` fixo, então erra a cor se o visual for colado sobre outra superfície do Farol. Não existe token de superfície do pai; é candidata a proposta nova na 17.11, ao lado de P1 a P7, e por ora quem cola decide caso a caso.
* **ROT-7b. Halo e texto vazado na cor da superfície se anulam no tema claro** (emenda de 2026-09-28).
  A matriz de pares medidos diz que, sobre marca categórica ou semântica, **o único texto legível é o
  vazado em `--surface-raised`**; e a `ROT-7` manda halo **na mesma** `--surface-raised`. Seguir as duas
  ao mesmo tempo apaga o texto, porque no tema claro `--surface-raised` é `#ffffff` e os dois viram o
  mesmo branco: o halo mede **1,00:1** contra a letra e come o desenho dela por dentro. As duas regras
  estão certas isoladamente e se destroem juntas, que é a terceira contradição interna deste contrato
  achada por produção em 2026-09-28.
  * **A saída é escolher um dos dois, e o critério é o que a marca faz por baixo.** Texto **sobre marca
    preenchida** usa o vazado **sem halo**, porque a marca já é o segundo fundo e o halo não tem o que
    separar. Texto que **cruza** a borda da marca, entrando e saindo dela, não pode usar o vazado: ali ele
    fica ilegível na metade que cai no cartão, e a saída é `--text-primary` **com** halo, que é a `ROT-7`
    no caso para o qual ela foi escrita. Em dúvida, o teste é de uma pergunta: **o texto tem a marca
    inteira por baixo?** Se tem, vazado e sem halo; se atravessa, cor de texto e com halo.
* **ROT-9. Dois textos nunca dividem a mesma linha sem respiro** (emenda de 2026-09-18). Quando a tinta de um texto encosta na de outro, os dois deixam de ser dois: na revisão de `03_colunas-verticais/05_colunas-positivo-e-negativo`, o rótulo `+R$ 38` parou a **0,46 px** do texto da faixa de referência e passou a **ler como `+R$ 383`**. Isso não é feiura de acabamento, é número errado na tela, e a régua vale para qualquer par de textos do desenho: rótulo de valor, tique de eixo, nota de anotação e texto de referência.
  * **A guarda `COLISAO-TEXTO` do `npm run check` mede isso no `preview.svg`, e a calibração corrigiu duas vezes a premissa de quem a encomendou.** Primeira correção: o defeito que motivou a guarda **não é sobreposição**, as duas tintas nunca chegam a se cobrir, então procurar área sobreposta deixaria passar justamente o único caso já reprovado por olho humano. Segunda: exigir sobreposição maior que zero **acusou uma versão aprovada e correta**, `02_barras-agrupadas/v3`, onde `38` e `41` de linhas vizinhas se cruzam 3,11 px na horizontal e zero na vertical, isto é, se tocam pelo canto e leem soltos. Quem mudou foi a guarda, não a versão.
  * **Reprova** quando as tintas se cruzam nos dois eixos, ou quando dois textos na mesma linha ficam a menos de **1,0 px** um do outro, soma de dois termos medidos: 0,5 px do pixel de dispositivo do render em 2x e 0,5 px do p99 do erro da estimativa de largura nos números. **Avisa** abaixo de 4 px, com o afastamento impresso, porque esse número saiu de rótulo sobre barra e não de texto contra texto. O corredor sustenta o limiar: entre os 2.646 pares na mesma linha do acervo, **o par aprovado mais próximo está a 7,03 px e o defeito estava a 0,46 px**, com 6,5 px de vazio entre os dois mundos.
  * **Dois pontos cegos declarados, para ninguém ler silêncio como aprovação.** A guarda não mede texto desenhado em `foreignObject`, que é toda a família `01_cards-e-kpis`, e diz `texto_em_html` em vez de sair limpa. E o halo da ROT-7 não entra na caixa de tinta, então dois halos que se cobrem passam.
* **ROT-8. Sem sigla nem abreviação inventada** em rótulo, legenda e eixo.
* **ROT-10. Parte de um todo: toda parte se nomeia no desenho parado** (emenda de 2026-09-19). Em pizza, rosca, waffle, pictograma, mosaico e barra 100%, cada parte precisa ter nome e número legíveis **sem interação**, por rótulo direto, por legenda com valor da ROT-5 ou por uma lista de identificação abaixo do gráfico. **A dica não conta**: ela não existe no `preview.svg`, não existe no papel e não existe para quem navega por teclado ou leitor de tela. A ROT-4 dispensa a legenda quando o rótulo direto cabe, e não quando ele não cabe: fatia abaixo do piso angular do rótulo interno fica sem nome nenhum, e foi o que reprovou `06_pizza/01_pizza-simples` na primeira revisão, com uma fatia de 4% muda e os percentuais impressos somando 96 em vez de 100.
  * A régua prática: **o que está impresso na tela soma o todo**. Se a soma dos números escritos não fecha em 100% ou no total declarado, falta parte nomeada.
  * **O que a régua cobra é parte faltando, não aritmética de arredondamento** (precisão de 2026-09-20). Em `12/01`, os valores impressos somam R$ 4,65 mi porque cada um aparece arredondado, enquanto o total verdadeiro é R$ 4,60 mi exatos: nenhuma parte está faltando e a versão está certa. O teste é conferir a soma **dos valores do dado**, não a dos rótulos arredondados. Quando a diferença de arredondamento for grande o bastante para o leitor notar, a versão ganha uma casa a mais ou uma nota curta dizendo que as partes estão arredondadas.
  * **Em visual hierárquico a lista carrega o nível, não só o nome** (precisão de 2026-09-20, medida em `12/06`). A lista de identificação que resolve a marca muda vira uma mentira nova se achatar a hierarquia: sob "Timing da decisão", com 20 ocorrências, a versão imprimiu 20, 13 e 7 em sequência, e os três números leem como irmãos que deveriam somar, quando 13 e 7 são filhos que compõem os 20. Cada linha diz o seu nível, por recuo, por `pai › filho` ou por coluna própria, e o valor do pai nunca aparece na mesma altura visual dos filhos.
  * **Parte que não cabe no encoding também se declara.** Valor zero e valor negativo não têm área nem ângulo, então somem do desenho por construção: eles entram na lista de identificação com marcador vazado e o motivo escrito, como `12/01` fez com a consultoria sem receita no trimestre e com o estorno de contrato cancelado. Sumir por impossibilidade geométrica é igual a sumir por descuido, do ponto de vista de quem lê.
* **ROT-11. Linha de chamada abraça só a parte que ela representa** (emenda de 2026-09-19). Quando um painel detalha uma fatia (pizza com Outros aberto, bar of pie, qualquer recorte ampliado ao lado), o par de linhas que liga a fatia ao painel não pode contornar o resto do desenho: linha que dá a volta no disco diz ao leitor que o painel detalha o disco inteiro, e isso é encoding desonesto, não acabamento. Em `06_pizza/02`, o painel de 51 leads passou a parecer o detalhe dos 390, e a primeira correção só aumentou o raio do arco, o que piorou o abraço.
  * **Resolva pelo ângulo, não pelo raio.** Gire o desenho para a parte destacada ficar de frente para o painel: com `f` a fração da fatia, `startAngle = -180 * f` e `endAngle = startAngle - 360` deixam a fatia simétrica em torno do eixo que aponta para o painel, e as duas chamadas viram retas curtas, da borda de cima ao canto de cima da caixa e da borda de baixo ao canto de baixo. Arco por fora do disco é sinal de que o destaque está no lugar errado.

### 17.5 Anotação

* **ANO-1. Anotar o que muda a leitura:** meta, teto, média, mudança de regra, pico, lacuna. **No máximo duas anotações por visual.**
* **ANO-2. Anotação curta:** até 50 caracteres, 11 px, `--text-muted`, com nome e valor ("média R$ 266,8 mil").
* **ANO-3. Meta, teto e média são `ReferenceLine` com `ifOverflow="extendDomain"`,** traço da 17.2 e rótulo posicionado numa margem reservada, fora das marcas. Sem `extendDomain` a linha some quando passa do maior valor.
* **ANO-4. Faixa de período é `ReferenceArea` com `fill="var(--surface-sunken)"`** e sempre com texto dizendo o que ela marca. `--surface-overlay` é proibido aqui: no tema claro é o mesmo branco do cartão.
* **ANO-5. Linha de leitura:** frase opcional no topo do corpo, **calculada do dado**, com a conclusão (posição, distância, parte do todo). Uma linha, 12 px, `aria-hidden`, porque a frase acessível da raiz já diz o mesmo. Não repete o título nem o subtítulo do `VisualCard`.
* **ANO-6. O Chart não desenha etiqueta de procedência nem aviso de protótipo:** isso é do `VisualCard` e aparece uma vez por cartão (revisão, A11).

### 17.6 Formatação numérica

Complementa a seção 8, que continua valendo inteira.

* **NUM-1. Precisão da decisão.** Cartão e rótulo direto em `formatCurrencyCompact` (`R$ 401,3 mil`); tique em `formatCurrencyAxis`; centavo só em tabela de detalhe. Percentual de composição inteiro. Variação inteira a partir de 10% e com uma casa abaixo disso. Taxa de conversão com uma casa e o volume (`formatRateWithVolume`).
* **NUM-2. Composição com percentual inteiro soma 100,** pelo maior resto. No waffle, o percentual impresso é a contagem de quadrados.
* **NUM-3. Sinal à mão sobre o valor absoluto:** `+` ou `−` (U+2212) seguido de `formatPercent(Math.abs(x))`. **Emenda de 2026-10-02:** a redação original dava como motivo que `formatPercent` de número negativo devolve hífen, e isso deixou de ser verdade: desde o F0.5b ele devolve o U+2212 (`formatPercent(-0.092)` imprime `−9,2%`), como todo formatador de número da seção 8. A regra segue valendo por outro motivo, o de que **nenhum formatador escreve o `+`**: a variação que mostra o sinal dos dois lados continua montando o sinal à mão, e sempre sobre `Math.abs(x)`, porque sinal à mão sobre o valor com sinal imprime dois (`−−9,2%`). Onde só o negativo leva sinal, a saída direta do formatador já está certa. A emenda descreve a biblioteca e não muda o peso da regra nem liga guarda.
* **NUM-4. Toda variação nomeia a base na mesma linha:** "+13% contra R$ 162,9 mil em jul/26". Variação sem base não é publicada.
* **NUM-5. Agregado explícito:** total, média ou último valor, dito no rótulo.
* **NUM-6. Unidade em todo lugar em que o número aparece** (tique, rótulo, dica, anotação); contagem solta leva o substantivo ("153 oportunidades").
* **NUM-7. Ordinal com `º`** ("2º de 8") e data de tela por `formatDate` ou `formatMonthShort`; `YYYY-MM-DD` é formato do dado e do documento, não da tela.

### 17.7 Espaçamento

| Relação | Distância | Classe ou constante |
|---|---|---|
| Número de KPI até a linha de variação | 8 px | `mt-2` |
| Linha de leitura até o gráfico | 8 px | `mb-2` |
| Rótulo de valor até a ponta da barra | 6 px | `VALUE_LABEL_GAP = 6` |
| Amostra até o texto da legenda | 10 px | `gap-2.5` |
| Itens da legenda entre si | 10 px | `space-y-2.5` |
| Gráfico até a legenda lateral | 24 a 28 px | `gap-6` ou `gap-7` |
| Rótulo de anotação até a linha | 6 a 8 px | margem superior reservada em `MARGIN.top` |
| Cartão próprio (moldura `stage`) | padding 16 px, `rounded-lg`, borda `--line-subtle` | `p-4 rounded-lg border border-line-subtle` |

* **ESP-1. Distâncias em múltiplos de 2 px,** e as de grupo em múltiplos de 4 px, sempre por classe do Tailwind ou constante nomeada.
* **ESP-2. Barras respiram, e a espessura tem piso além do teto** (emenda de 2026-09-17; substitui a redação anterior, que fixava só o teto). `barCategoryGap` entre `"30%"` e `"40%"`, `maxBarSize` de no máximo 24 em cartão, nunca o padrão de 10%. Do outro lado, a **espessura efetiva** da marca, a que se mede no PNG e não a que se declara no topo do arquivo, não desce abaixo de **12 px em cartão**, e **nunca abaixo de 18 px quando houver rótulo de 12 px desenhado dentro da marca**, que é o tamanho do texto mais **6 px** (medido em 2026-09-17; substitui a folga de 2 px que a emenda anterior propunha). `maxBarSize` é teto, não promessa: ele só vale se a banda comportar, e enquanto o passo não for derivado (ESP-6) a constante declarada descreve a intenção do autor, não o desenho.
  * **A folga de 2 px foi contraditada pela medição (2026-09-17).** Escada de barras de 10, 12, 14, 16, 18 e 20 px com o rótulo `R$ 401,3 mil` de 12 px por dentro, renderizada nos dois temas e lida pixel a pixel: a tinta do texto mede **11,75 px de altura e não fica centrada na âncora**, porque `dominantBaseline="central"` deixa **5,50 px acima e 6,25 px abaixo** do centro da linha. Degrau a degrau: **10 px** rompe as duas bordas (falta 0,50 px em cima e 1,25 px embaixo, e o traço do `$` aparece sobre o cartão); **12 px**, que é o texto mais 0, sobra 0,50 px em cima mas **corta a descendente em 0,25 px**, então a folga de 2 px do texto (14 px) nem chega a ser o degrau que resolve; **14 px** já contém a tinta, com 1,50 px em cima e **só 0,75 px embaixo**, e a vírgula encosta na borda; **16 px** dá 2,50 e 1,75; **18 px** dá 3,50 e 2,75, o primeiro degrau com 2 px livres dos dois lados; **20 px** dá 4,50 e 3,75 e é o ponto já aprovado. Daí o piso de **18 px** para rótulo interno, que é texto mais 6 px, e não texto mais 2 px.
  * **O piso geral de 12 px não foi medido nesta rodada.** A escada só testa marca com texto por cima; com o rótulo do lado de fora, as barras de 10 e de 12 px desenharam sem defeito nos dois temas. O número segue como escolha de desenho, não como limite fotografado, e quem quiser mexer nele precisa de outra peça de teste. **Por isso a guarda `ESPESSURA-MARCA` do `npm run check` mede o piso geral mas o reporta como aviso, e não como erro** (decisão de 2026-09-18, quando a guarda entrou e acusou 24 das 32 versões medidas, sendo 19 só por este número). Reprovar por regra sem medição derrubaria trabalho correto: o minigráfico de tendência dentro do cartão de KPI tem marca de 5 px porque é a forma certa do sparkline, e o revisor humano o aprovou. O piso do rótulo interno, esse sim medido, continua reprovando. O piso geral sobe a erro no dia em que tiver peça de teste própria, e até lá o aviso serve de inventário.
  * **Quando a densidade de categorias empurra a espessura abaixo do piso, quem cede é a altura do canvas** (decisão do dono da marca, 2026-09-17). Pela ESP-6, espessura, passo, vão e número de séries estão amarrados numa conta só, então, com o número de categorias dado, só há três saídas: subir a altura, afinar a barra ou cortar categoria. **A saída é subir a altura.** Afinar a barra é proibido, porque o piso da ESP-2 é o que se mede no PNG e não admite exceção por falta de espaço; cortar categoria é mudar o que o visual afirma para caber numa moldura, o que nunca é decisão de layout. A conta do passo da ESP-6, invertida, dá a altura mínima: passo pela espessura desejada, vezes o número de categorias, mais `MARGIN.top` e `MARGIN.bottom` e o que o eixo de valor ocupa.
    * **Isso pode levar a peça acima do preset de canvas do catálogo, e nesse caso o desvio é esperado.** Preset é medida padrão, não teto; ranking longo e butterfly de muitas faixas passam do `card` por construção. O desvio então **é declarado**: a versão fixa o canvas por número em `meta.json`, em vez do nome do preset, e as `notes` dizem numa linha que a altura sai da conta da ESP-6 e quantas categorias ela comporta. Desvio de canvas declarado assim não é irregularidade e a revisão não reprova por ele; desvio calado continua sendo irregularidade. **E desde 2026-09-18 o `npm run check` mede isso:** canvas fixado por número com `notes` vazio vira erro, e canvas por número que mede exatamente um preset vira aviso, para a versão chamar o preset pelo nome. A regra existia desde a véspera sem ninguém para medi-la, e as seis versões que passaram caladas nas 64 primeiras apareceram no minuto em que a medida entrou.
  * **O que acontece abaixo do piso: o rótulo sai de dentro da barra.** Medido em `02/01 v3`, barra de **9 px** com nome de **12 px** desenhado dentro: o texto vaza para o cartão por trás, mede **1,00:1 de contraste no tema claro** e a versão foi reprovada. O mesmo em `02/04 v2`, barra de 10 px com caixa interna de 8,5 px contra texto de 12 px, reprovada por ROT-7. Abaixo do piso não existe acabamento que salve: ou a marca engrossa, ou o rótulo vai para fora da ponta livre (ROT-2). Escrever texto de 12 px dentro de barra fina é proibido.
* **ESP-6. Passo derivado, nunca arbitrado** (emenda de 2026-09-17; **fórmula revista no mesmo dia, e a redação abaixo substitui a anterior**). O Recharts desconta o `barCategoryGap` percentual dos **dois lados** da banda **e ainda afasta uma série da outra dentro da mesma banda pelo `barGap`**, que vale **4 px por padrão da biblioteca** e quase nunca aparece declarado no arquivo, então a espessura que se vê não é a que `maxBarSize` diz:

  ```
  espessura = min(maxBarSize, (passo × (1 − 2 × barCategoryGap) − barGap × (séries − 1)) / séries)
  passo     = (espessura desejada × séries + barGap × (séries − 1)) / (1 − 2 × barCategoryGap)
  ```

  **Por que a anterior saiu.** A fórmula antiga não tinha o termo do `barGap`, então subestimava o desconto sempre que a banda tem mais de uma série, e errava tanto mais quanto mais fina a barra, porque o vão entre séries é absoluto em pixels e não encolhe junto. O termo novo tira exatamente `barGap × (séries − 1) / séries` da espessura prevista pela conta antiga; com série única ele é zero e as duas fórmulas coincidem, que é a razão de o erro ter passado despercebido nas duas conferências anteriores, ambas de série única.

  **Conferência em dois pontos medidos.**
  * **Duas séries, `02_barras-horizontais/07_butterfly-piramide` v1:** `barCategoryGap="34%"`, duas séries e nenhum `barGap` declarado, logo os 4 px padrão da biblioteca. O termo que faltava desconta `4 × (2 − 1) / 2 = 2 px`, então a conta antiga previa **5,8 px** e a nova prevê **3,8 px**; o render entrega **4 px**. O erro cai de **45%** para cerca de **5%**.
  * **Série única, `ROW_STEP = 24` com vão de 32%:** `barGap × (1 − 1) / 1 = 0`, a previsão continua em **8,6 px** e a revisão mediu **9 px**. O mesmo vale para `ROW_STEP = 50` com vão de 30%, que rende exatamente os 20 px de `BAR_MAX`. A fórmula nova não mexe em nada que já estava conferido.

  O `passo` é a altura do corpo dividida pelo número de categorias, ou a constante nomeada (`ROW_STEP`, altura por categoria) quando a altura do visual é calculada do dado. Com vão de 30% sobram 40% da banda, com 40% sobram 20%: em série única o passo precisa ser de **2,5 a 5 vezes** a espessura desejada, e com mais de uma série entra ainda o `barGap` de cada emenda, também dividido por esse mesmo fator. A versão declara o passo em constante nomeada, **com a conta escrita em comentário de uma linha**, e **declara o `barGap` explicitamente sempre que houver mais de uma série na banda**, porque o padrão da biblioteca é invisível no código e some no PNG; o catálogo já tem quem faça isso (`BAR_GAP = 1` em `02/02 v3`, `BAR_GAP = 2` em `02/02 v1`). Nunca se copia o passo de um modelo vizinho que tenha outro número de séries, outro vão ou outro `barGap`.
  * **Pendência aberta, registrada sem resolução.** O item 3 da Anatomia do modelo `02/07` afirma que `stackId` diferente é o que garante os dois lados do butterfly centrados na mesma linha. A medição do PNG escuro da `v1` em 2026-09-17 mostra o contrário: o Recharts distribui os dois `Bar` como duas faixas dentro da mesma banda, com **16 px entre os centros** e 7 px de espessura em cada marca. A afirmação fica onde está, porque o desenho ainda não foi revisto, mas quem copiar o padrão precisa saber que a linha única não é entregue; e o mesmo mecanismo é o que empurra a espessura do butterfly para baixo do piso da ESP-2. **O afastamento entre as duas faixas é o `barGap` que a fórmula revista passou a contar**, e as duas leituras de espessura desta versão, os 7 px daquela rodada e os 4 px da medição da fórmula, são de renders de alturas diferentes, porque a espessura cai do passo e o passo cai da altura do corpo: a conferência de fórmula usa sempre o par previsto e medido da mesma rodada.
* **ESP-3. Margem explícita** (`MARGIN` no topo do arquivo) reservando espaço para rótulo e anotação: nada encosta na borda do corpo e o render não acusa conteúdo fora dele.
* **ESP-4. Chart de moldura `card` não desenha moldura própria:** a raiz não tem borda, fundo nem padding, porque vai dentro do `VisualCard`.
* **ESP-5. Espaço separa grupos; borda não.** Borda interna, caixa em volta de legenda e divisória entre itens são proibidas.

### 17.8 Estados vazio e indisponível

* **EST-1. Vazio substitui o gráfico inteiro.** `data` vazio desenha um bloco com `role="status"` no lugar do visual, sem eixo nem grade: ícone lucide `Filter` de 16 px e uma frase de 12 px em `--text-muted` dizendo que o recorte não tem linhas e o que isso significa.
* **EST-1b. Ausência é do tipo, não do `if`** (emenda de 2026-09-28). Toda função que agrega uma lista (mediana, média, quartil, percentil, taxa, percentual de etapa) declara retorno `number | null` e devolve `null` para lista vazia. Nunca `0`. A regra existe porque a EST-2 abaixo governa a **renderização** e calava sobre o cálculo: uma função que devolve `0` passa por todas as guardas do `check` e por todas as perguntas do `CHECKLIST_REVISAO.md`, porque o que se inspeciona é a tela, e a tela de dado completo está certa. Medido: 12 de 15 implementações de mediana do acervo devolviam `0`, e nenhuma revisão por PNG pegou isso em seis peças seguidas. Junto vale o resto da família: a guarda de vazio testa **a lista que alimenta a conta**, nunca a lista vizinha; `Math.min` e `Math.max` sobre lista vazia devolvem infinito, que também não é medida; e onde a guarda cai, o desenho cai junto, com `connectNulls={false}` na referência que atravessaria o vazio.
* **EST-2. Indisponível escreve `formatUnavailable()`** com o ícone `Unplug` em `--text-muted`, no lugar do número, sem moldura vermelha (o mesmo desenho da variante `compact` do `UnavailableState` do Farol). Nunca zero, nunca barra zerada.
* **EST-3. Zero medido é zero:** desenha a marca e escreve 0.
* **EST-4. Comparação sem base se declara:** "sem mês anterior medido para comparar" no lugar da variação.
* **EST-5. Carregando não é do Chart.** O esqueleto com a altura do cartão fica na página; o Chart recebe dado pronto.
* **EST-6. Ao colar no Farol,** o estado inline dá lugar a `EmptyState` ou `UnavailableState` (seção 16, passo 7), mantendo o sentido do texto.

### 17.9 Dica (tooltip)

* **DIC-1. Dica só quando acrescenta** (valor exato, comparação, par volume e taxa). Nada essencial só na dica: o valor que importa já está escrito.
* **DIC-2. Sempre `content={<ChartTooltip valueFormat="..." />}`** com o mesmo formato do rótulo visível; a dica padrão do Recharts é proibida (fundo branco e número cru).
* **DIC-3. Cursor discreto:** barra com `cursor={{ fill: 'var(--line-subtle)' }}`; linha com `cursor={{ stroke: CURSOR_COLOR }}` e `activeDot={{ r: 4 }}`.
* **DIC-4. Dica sem animação e na ordem visual:** `isAnimationActive={false}` e `itemSorter` que segue a pilha ou o valor, nunca a ordem alfabética padrão.
* **DIC-5. Série com `null` não confia na dica para o nulo:** o `ChartTooltip` imprime vazio (proposta P4); até lá, o nulo aparece escrito no próprio visual.

### 17.10 Acessibilidade e contraste AA

* **ACE-1. Frase acessível de 100 a 250 caracteres** na raiz, começando pelo tipo e dizendo a conclusão: "Gráfico de barras com a receita nova de 8 executivos... Lidera Murilo C.... Renan A. está em 2º de 8". Calculada do dado (seção 11).
* **ACE-2. Cor nunca é o único canal:** variação com sinal e ícone; destaque com peso; ausência com forma vazada e palavra; estado com ícone e texto.
* **ACE-3. Pisos:** texto 4,5:1 contra a superfície onde está; marca de dado, contorno e amostra 3:1 contra o fundo adjacente, salvo quando o valor está escrito na marca ou junto dela.
  * **Medido desde 2026-09-18 pela guarda `CONTRASTE-TEXTO`, que reprova**, com o mesmo 4,5:1 da WCAG 2.1 AA. Ela resolve o fundo **pela geometria e não pela vizinhança no documento**: toda forma preenchida entra na ordem de pintura com a cor já composta, o recorte é achatado em polígono e testado por número de voltas, e o halo da ROT-7 passa a ser o fundo quando existe. Erro quando o fundo dominante reprova; aviso quando só a parte minoritária da tinta cai sobre outro fundo, porque a borda é onde a estimativa de tinta erra.
  * **Entre 3:1 e 4,5:1 em texto grande a guarda avisa em vez de reprovar, e o motivo é uma divergência de régua:** a WCAG isenta texto grande e pede 3:1, esta ACE-3 não isenta. Hoje essa faixa está vazia no acervo, então a escolha não muda veredito de ninguém e fica para quem escrever a régua.
  * **O primeiro passivo que a medida encontrou tem uma causa só, e ela vale como aviso de projeto:** 15 versões de 4 modelos escreveram `<XAxis>` e `<YAxis>` sem espalhar `AXIS_PROPS`, então o tique saiu no padrão da biblioteca, `rgb(102, 102, 102)` em 15 px, que **mede 2,97:1 contra `--surface-raised` no tema escuro** e passa no claro. Um `{...AXIS_PROPS}` esquecido quebra duas réguas ao mesmo tempo, a de contraste e a de escala tipográfica, e não deixa vestígio no código que se leia de relance: o valor não está escrito em lugar nenhum, ele é herdado.
  * **Dois pontos cegos declarados.** Texto em `foreignObject` não tem contraste medido, porque falta posição, que depende do fluxo do navegador: são 45 versões inteiras, entre elas as 30 de `01_cards-e-kpis`, e dentro das versões medidas cada trecho de HTML sai contado à parte, de modo que "medida" nunca quer dizer "medida inteira". E o `stroke` de forma não entra no fundo: uma linha de grade atrás do rótulo não muda a cor da maioria da tinta, e é para ela que a ROT-7 pede halo.
* **ACE-4. Opacidade nunca em texto,** e nunca `opacity` no contêiner que tem texto dentro.
* **ACE-6. Traço que carrega a relação é dado, e mede 3:1** (emenda de 2026-09-20). O contrato usa `--line-strong` para dois papéis diferentes e eles não têm o mesmo peso. Linha de **referência** (grade, zero do eixo, faixa de comparação) é pano de fundo: some sem prejuízo da informação e vive bem em `--line-subtle` ou `--line-strong`, ainda que meça 1,79:1 no escuro e 1,83:1 no claro. Já o traço que **carrega a relação**, como a aresta de uma árvore, a ligação de um Sankey, o conector de um antes e depois ou a linha de uma dispersão conectada, é o próprio dado: apagado ele, ninguém sabe quem é filho de quem nem o que virou o quê. Esse traço precisa dos 3:1 da WCAG 1.4.11 e sai de `--line-strong`, que não os alcança, para um token de dado.
  * O teste que separa os dois: **tape o traço e pergunte se a informação ainda está lá.** Se continua, é referência; se some, é dado. Na revisão de `12/07`, as arestas da árvore estavam em `--line-strong` e mediam 1,79:1 e 1,83:1, sem valor escrito que ativasse a isenção da 17.2.

* **ACE-5. Opacidade em marca é perda de contraste medida, não enfeite** (emenda de 2026-09-19). A COR-9 libera `opacity` em marca, e é aí que a conta escapa: `fillOpacity` compõe a cor da marca com a do cartão, e o resultado precisa continuar acima de 3:1 pela WCAG 1.4.11, a mesma régua que vale para a marca opaca. Em `09/04`, `fillOpacity` de 0,55 derrubou a bolha para **2,43:1 no tema claro**, abaixo do piso, enquanto no escuro ainda passava: os dois temas compõem para lados opostos e o claro é quase sempre o que reprova.
  * Quem usa opacidade para resolver sobreposição (nuvem de bolhas, dispersão densa) mede a cor composta nos **dois** temas antes de fechar, ou troca a opacidade por contorno na cor da superfície, que separa as marcas sem mexer no contraste do preenchimento.
  * **Emenda de 2026-09-28: a opacidade mínima é calculável, e duas coisas dela quebram a intuição.**
    Três agentes mediram a mesma cor à mão em peças diferentes, então o número passou a ser gerado no
    dossiê de produção a partir de `tokens.css`, uma linha por cor, arredondado **para cima** em 0,01,
    porque arredondar para baixo faz a peça passar no papel e reprovar na guarda. Os dois achados que
    contrariam o senso comum e que eu mesmo vinha repetindo errado: **o tema claro reprova primeiro em
    todas as cores menos `--negative`**, que reprova primeiro no escuro, então "o claro é sempre o pior"
    é heurística falsa e não substitui medir os dois; e **cinco tokens não admitem opacidade nenhuma**,
    `--line-strong` e `--seq-1` a `--seq-4`, porque não alcançam 3:1 **nem opacos**. Para referência, a
    categórica mais exigente é `--chart-8` com 0,77 e a mais tolerante é `--chart-5` com 0,63.
* **ACE-7. Os dois temas são conferidos:** render com `--tema ambos` e os dois PNGs olhados.
* **ACE-8. Pares medidos.** Usar só os aprovados; os reprovados são proibidos no papel indicado.

**Convenção de arredondamento desta tabela, declarada em 2026-09-28.** Os números compõem a cor com opacidade **arredondando cada canal para inteiro antes de medir**, porque o navegador rasteriza em 8 bits por canal e é isso que chega à tela. Compor em ponto flutuante dá diferença de 0,01 a 0,02 em dois destes pares, e o valor errado é o do ponto flutuante, não o da tabela. A convenção fica escrita porque uma medição independente feita em 2026-09-28 divergiu aqui e a investigação deu razão à tabela; sem a convenção escrita, a próxima medição vai "corrigir" o número certo.

**E os números não se arredondam na exibição.** O texto vazado sobre `--chart-8` mede **4,4986:1** no tema claro e falta 0,0014 para o piso de 4,5:1: uma tabela que mostrasse "4,50" pareceria aprovada. Em tabela que decide aprovação, casa decimal a menos é veredito trocado.

| Par | Escuro | Claro | Veredito |
|---|---|---|---|
| `--text-primary` sobre `--surface-raised` | 14,53 | 17,96 | aprovado |
| `--text-secondary` sobre `--surface-raised` | 8,16 | 8,13 | aprovado |
| `--text-muted` sobre `--surface-raised` | 5,21 | 5,37 | aprovado; é o piso, nada mais claro para texto |
| `--text-muted` sobre `--surface-overlay` | 4,75 | 5,37 | aprovado |
| `--text-muted` sobre `--surface-sunken` | 5,98 | 4,65 | aprovado |
| `--positive` sobre `--surface-raised` | 7,36 | 5,34 | aprovado |
| `--negative` sobre `--surface-raised` | 5,50 | 6,36 | aprovado |
| `--warning` sobre `--surface-raised` | 8,36 | 5,74 | aprovado |
| `--chart-1` a `--chart-6` sobre `--surface-raised` (marca) | 5,90 a 9,50 | 5,34 a 6,25 | aprovado |
| `--chart-8` sobre `--surface-raised` (marca) | 7,28 | 4,50 | aprovado; o mais fraco do claro |
| `--accent-cyan-contrast` sobre `--chart-1` (texto) | 10,06 | 6,00 | aprovado |
| `--text-muted` como contorno de ausência | 5,21 | 5,37 | aprovado |
| `--line-strong` contra `--chart-1` (neutro ao lado do destaque) | 5,32 | 3,27 | aprovado para separar os dois |
| `--positive` sobre `bg-positive/15` | 5,66 | **4,33** | **reprovado** no claro |
| `--negative` sobre `bg-negative/15` | **4,56** | 4,97 | proibido: no limite no escuro, e o selo precisa ser simétrico |
| `--text-primary` sobre `--chart-1` a `--chart-6` | 1,53 a 2,46 | 2,87 a 3,37 | **reprovado** |
| `--line-strong` sobre `--surface-raised` (marca) | 1,79 | 1,83 | só com valor escrito |
| `--seq-1` a `--seq-3` sobre `--surface-raised` (marca) | 1,14 a 2,29 | 1,21 a 1,92 | só com valor escrito |
| `--line-subtle` sobre `--surface-raised` | 1,25 | 1,29 | só grade e borda de cartão |

### 17.11 Tokens e componentes que faltam (propostas)

Nada abaixo existe ainda. Não use no Chart; o check recusa token inexistente. As propostas dizem o requisito, não a cor.

* **P1. `--chart-neutral`** como alias de `--line-strong`, para o papel de dado deixar de dividir nome com o papel de linha.
* **P2. `--positive-soft` e `--negative-soft`:** fundo de selo de variação em que `--positive` e `--negative` passem 4,5:1 nos dois temas, no molde dos `--accent-*-soft` que já existem. Libera o selo tingido de COR-7.
* **P3. `--color-seq-1` a `--color-seq-7` no `@theme`,** para a rampa sequencial ganhar utilitário Tailwind como as categóricas.
* **P4. `ChartTooltip` escrevendo `formatUnavailable()` para `null`** e aceitando `itemSorter`, em vez de imprimir vazio.
* **P5. Rederivar `--chart-7` e `--chart-8`** com mais distância de matiz (revisão, A20, já no backlog de design do Farol); até lá vale o teto de 6.
* **P6. Separar o hex das categóricas do hex semântico e de procedência:** `--chart-2` e `--chart-4` deixam de repetir `--warning` e `--positive`, com distância em deuteranopia de pelo menos 15 contra os vizinhos. Libera a ordem natural de slots e aposenta a COR-8.
* **P7. Token de neutro de dado com 3:1 contra o cartão** nos dois temas e ainda separável de `--chart-1`, para barras de contexto dispensarem o valor escrito. A COR-2 mostra que no claro isso não existe para `--chart-1` atual; a proposta exige rever os dois juntos.

---

## 18. Emendas em estudo

> Registro de 2026-09-17. As candidatas abaixo saem de `_estudo/00_observacoes-acumuladas.md`, a síntese das 64 versões aprovadas de `01_cards-e-kpis` e `02_barras-horizontais`, com o alcance medido versão a versão. **Nada aqui é regra vigente:** a revisão não reprova por esta seção e nenhuma versão nova é obrigada por ela. O registro existe para que a próxima rodada discuta cada uma com o número na mão, em vez de redescobrir o padrão. Duas candidatas da mesma síntese já saíram desta lista e viraram regra: a **E2** (piso e passo de barra, na ESP-2 e na ESP-6) e a **E3** (âncora de rótulo e halo obrigatório, na ROT-2 e na ROT-7).

* **E1. Quatro guardas executáveis no `npm run check`** (nome de empresa real no `data.ts`, número cru interpolado em JSX, literal "indisponível" à mão, comprimento da frase acessível da ACE-1): ao menos 24 versões afetadas, o maior alcance da lista; é mudança de ferramenta e não de redação, então fica fora do alcance de uma emenda de contrato.
* **E4. O que fazer quando o rótulo de segmento não cabe:** ao menos 8 versões, e toda a produção de composição daqui para a frente; a isenção da 17.2 que autoriza `--line-strong` e `--seq-1` a `--seq-3` cai junto com o rótulo suprimido, e hoje o contrato não diz para onde o valor vai.
* **E5. `--line-strong` com um papel só, e amostra de legenda sem isenção:** ao menos 9 versões; a seção 7 e a tabela da 17.2 se contradizem sobre o token, e amostra de legenda não tem valor ao lado por definição, com medidas de 1,14:1 a 1,83:1.
* **E6. Número de prosa vindo de constante, e `meta.json` conferido contra a tela:** ao menos 14 ocorrências de texto nas duas famílias; o check garante a forma do README e nada diz sobre a verdade dele.
* **E7. Cada versão declara os estados que o preview prova** (cheio, vazio, indisponível, zero medido, amostra pequena, parcial): ao menos 10 versões; a divisão de trabalho entre as versões já é praticada, mas fica escondida nas `notes` e deixa ramo de código sem prova visual.
* **E8. Presets de canvas revistos, e desvio declarado deixa de ser desvio:** ao menos 8 versões; faltam o cartão de KPI alto com régua, a tira larga de quatro peças e o ranking muito longo, e sobra faixa vazia quando o preset é maior que a peça.
  * **Parte desta candidata já virou regra em 2026-09-17 e sai daqui:** a ESP-2 passou a mandar subir a altura do canvas quando a densidade de categorias empurraria a espessura abaixo do piso, e a declarar o desvio em `meta.json` e nas `notes` quando a peça passa do preset. O que continua em estudo é o outro lado, o de **rever a lista de presets** para que os casos recorrentes (KPI alto com régua, tira larga de quatro peças, ranking muito longo) tenham nome próprio em vez de virarem desvio declarado um a um, e o da faixa vazia quando o preset é maior que a peça.
