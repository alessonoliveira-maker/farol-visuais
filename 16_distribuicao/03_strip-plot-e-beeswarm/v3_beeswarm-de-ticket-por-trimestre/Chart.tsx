import { Filter } from 'lucide-react';
import {
  CartesianGrid,
  ResponsiveContainer,
  ScatterChart,
  usePlotArea,
  useXAxisScale,
  useYAxisScale,
  XAxis,
  YAxis,
} from 'recharts';

import { AXIS_COLOR, AXIS_PROPS, GRID_COLOR } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatInt, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import {
  data as defaultData,
  HIGHLIGHT_ID,
  VERTICAL_LABELS,
  type Quarter,
  type Vertical,
  type WonDeal,
} from './data';

/**
 * Beeswarm: cada negócio ganho vira um ponto na altura exata do seu ticket, e o deslocamento lateral
 * existe só para dois tickets vizinhos não se cobrirem. O strip simples empilharia os dois no mesmo
 * lugar e a nuvem de 83 negócios de um trimestre viraria um borrão.
 *
 * O deslocamento não é grandeza. Quem responde à pergunta é a altura, e é por isso que a largura da
 * nuvem não ganha eixo nem rótulo.
 *
 * O dodge é guloso e mede em pixel, então ele precisa da área de plotagem e da escala do eixo, que só
 * existem depois que o Recharts desenha. Daí os hooks `usePlotArea`, `useXAxisScale` e `useYAxisScale`
 * em vez de ler a janela: eles recalculam sozinhos quando o cartão muda de largura, sem ouvinte de
 * redimensionamento e sem `window.innerWidth`, que a seção 5 do contrato proíbe.
 */
export interface QuarterTicketBeeswarmProps {
  readonly data?: readonly Quarter[];
  readonly highlightId?: string;
  readonly height?: number;
  readonly className?: string;
}

/** Um negócio já posicionado: `y` é o ticket em pixel, `dx` é o desvio lateral dentro da faixa. */
interface Placed {
  readonly deal: WonDeal;
  readonly dx: number;
  readonly y: number;
}

interface BandLayout {
  readonly id: string;
  readonly cx: number;
  readonly points: readonly Placed[];
  readonly middle: number | null;
}

/** A margem direita guarda o valor da mediana escrito ao lado da última faixa. */
const MARGIN = { top: 16, right: 44, bottom: 0, left: 8 } as const;
/** Largura da faixa do eixo Y, entre 48 e 64 pela EIX-6. O tique mais largo é `R$ 200 mil`. */
const Y_AXIS_W = 64;
/** Altura da faixa do eixo X pela EIX-6b: 8 px de `tickMargin` mais a tinta de uma linha de 11 px. */
const X_AXIS_H = 24;
const TICK_MARGIN = 8;
const TICK_SIZE = 11;
/** Passo do tique de ticket, em reais. Fecha 5 linhas de grade no domínio do conjunto (EIX-4). */
const TICKET_STEP = 50_000;
const DOT_R = 3;
/** Piso do raio. Abaixo de 2 px o ponto deixa de se ver como marca e a nuvem vira sombra. */
const DOT_R_FLOOR = 2;
/** Respiro entre dois pontos vizinhos, em pixel, somado ao diâmetro na busca de lugar livre. */
const DOT_PAD = 1;
/** Vão entre duas faixas vizinhas, para as nuvens de dois trimestres não se encostarem. */
const BAND_GAP = 10;
/** Comprimento de cada traço lateral da mediana, o vão até o ponto mais próximo e a janela de busca. */
const MEDIAN_TICK = 5;
const MEDIAN_GAP = 2;
const MEDIAN_LABEL_REACH = 6;
const MEDIAN_H = 2;
const MEDIAN_COLOR = 'var(--text-primary)';
const SURFACE = 'var(--surface-raised)';
const HALO_EXTRA = 3;
const NOTE_COLOR = 'var(--text-muted)';
const NOTE_SIZE = 11;
const EPS = 0.001;

/**
 * Cor por vertical, na ordem de slot 1 e 3 da COR-8. A cor sozinha não separa as duas: medido nesta
 * sessão, `--chart-1` contra `--chart-3` dá 1,47:1 no tema escuro e 1,03:1 no claro, e isso não é
 * defeito de paleta, é luminância pareada de propósito. Quem separa de fato é a forma, ponto cheio
 * contra anel vazado, e o par contagem mais taxa escrito no rodapé (TOK-9, ACE-2).
 */
const VERTICAL_COLORS: Readonly<Record<Vertical, string>> = {
  A: 'var(--chart-1)',
  B: 'var(--chart-3)',
};

/**
 * Mediana da lista, ou `null` quando ela está vazia. Nunca zero: ticket zero é um valor plausível, e
 * a mediana zerada de um trimestre sem negócio desenharia o traço colado na origem do eixo, isto é,
 * o pior trimestre do ano num recorte em que nada foi ganho (EST-1b).
 */
function median(values: readonly number[]): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const above = sorted[middle];
  if (above === undefined) return null;
  if (sorted.length % 2 === 1) return above;
  const below = sorted[middle - 1];
  if (below === undefined) return null;
  return (below + above) / 2;
}

/**
 * Dodge guloso, na forma do `dodge` do Observable Plot: a ordem de entrada é fixa pelo valor, e cada
 * ponto recebe o menor desvio lateral que não encosta em nenhum dos já colocados.
 *
 * A busca de vizinhos usa janela deslizante. Como a lista chega ordenada por `y`, todo ponto que
 * pode atrapalhar está no fim da lista já colocada, e o início da janela só avança: sem isso a busca
 * é quadrática e refaz 83 comparações por ponto para nada.
 *
 * Os candidatos de desvio são o zero e as bordas dos bloqueios, porque é ali que o ponto encosta sem
 * sobrepor. Testar passos fixos daria pilha em coluna, não colmeia.
 */
function dodge(rows: readonly { readonly deal: WonDeal; readonly y: number }[], diameter: number): readonly Placed[] {
  const out: Placed[] = [];
  let start = 0;
  for (const row of rows) {
    while (start < out.length) {
      const oldest = out[start];
      if (oldest === undefined || row.y - oldest.y < diameter) break;
      start += 1;
    }
    const blocks: { readonly lo: number; readonly hi: number }[] = [];
    for (let k = start; k < out.length; k += 1) {
      const placed = out[k];
      if (placed === undefined) continue;
      const gap = Math.abs(row.y - placed.y);
      if (gap >= diameter) continue;
      const reach = Math.sqrt(diameter * diameter - gap * gap);
      blocks.push({ lo: placed.dx - reach, hi: placed.dx + reach });
    }
    const candidates = [0];
    for (const block of blocks) candidates.push(block.lo, block.hi);
    candidates.sort((a, b) => Math.abs(a) - Math.abs(b) || a - b);
    let chosen = 0;
    for (const candidate of candidates) {
      if (blocks.every((block) => candidate <= block.lo + EPS || candidate >= block.hi - EPS)) {
        chosen = candidate;
        break;
      }
    }
    out.push({ deal: row.deal, dx: chosen, y: row.y });
  }
  return out;
}

/** Quanto a nuvem mais larga pede de meia faixa, já somado o raio. */
function widest(bands: readonly BandLayout[], radius: number): number {
  return bands.reduce(
    (top, band) => band.points.reduce((inner, point) => (Math.abs(point.dx) > inner ? Math.abs(point.dx) : inner), top),
    0,
  ) + radius;
}

/**
 * A mediana fora da nuvem: dois traços curtos, um de cada lado, que começam além do ponto mais
 * afastado da linha da mediana e escrevem o valor ao lado. A mediana de um beeswarm cai por
 * construção na linha mais densa, então um traço por cima partiria os pontos (ROT-7, COR-5).
 */
function MedianMark({
  band,
  half,
  radius,
  y,
}: {
  readonly band: BandLayout;
  readonly half: number;
  readonly radius: number;
  readonly y: number;
}) {
  const reach = band.points
    .filter((point) => Math.abs(point.y - y) <= radius + MEDIAN_LABEL_REACH)
    .reduce((top, point) => Math.max(top, Math.abs(Math.max(-half + radius, Math.min(half - radius, point.dx))) + radius), 0);
  const inner = reach + MEDIAN_GAP;
  const outer = inner + MEDIAN_TICK;
  return (
    <g>
      <rect fill={MEDIAN_COLOR} height={MEDIAN_H} width={MEDIAN_TICK} x={band.cx - outer} y={y - MEDIAN_H / 2} />
      <rect fill={MEDIAN_COLOR} height={MEDIAN_H} width={MEDIAN_TICK} x={band.cx + inner} y={y - MEDIAN_H / 2} />
      <text
        className="tabular-nums"
        dominantBaseline="central"
        fill={MEDIAN_COLOR}
        fontSize={NOTE_SIZE}
        style={{ paintOrder: 'stroke', stroke: SURFACE, strokeWidth: 3 }}
        x={band.cx + outer + 2}
        y={y}
      >
        {band.middle === null ? '' : formatCurrencyCompact(band.middle)}
      </text>
    </g>
  );
}

/**
 * A camada da nuvem. Ela vive dentro do gráfico porque é ali que a área de plotagem e as escalas
 * existem; fora, o desvio lateral seria chute, e chute só aparece no PNG.
 */
function SwarmLayer({
  quarters,
  highlightId,
}: {
  readonly quarters: readonly Quarter[];
  readonly highlightId: string;
}) {
  const plotArea = usePlotArea();
  const xScale = useXAxisScale();
  const yScale = useYAxisScale();
  if (!plotArea || !xScale || !yScale) return null;
  /* Sem faixa não há o que dividir, e a divisão pela contagem logo abaixo devolveria infinito. */
  if (quarters.length === 0) return null;

  const half = plotArea.width / (2 * quarters.length) - BAND_GAP / 2;
  const build = (radius: number): readonly BandLayout[] =>
    quarters.map((quarter, index) => {
      const cx = xScale(index + 0.5);
      const rows = quarter.deals
        .map((deal) => ({ deal, y: yScale(deal.ticket) }))
        .filter((row): row is { deal: WonDeal; y: number } => row.y !== undefined)
        /* Ordem de entrada fixa pelo valor, com desempate por id: sem o desempate dois tickets iguais
           trocam de lugar entre renders e o preview deixa de ser o retrato do componente. */
        .sort((a, b) => a.y - b.y || a.deal.id.localeCompare(b.deal.id));
      return {
        id: quarter.id,
        cx: cx === undefined ? plotArea.x : cx,
        points: dodge(rows, 2 * radius + DOT_PAD),
        middle: median(quarter.deals.map((deal) => deal.ticket)),
      };
    });

  /* O raio cai para o piso quando a nuvem mais larga não cabe na meia faixa. Quem cede é o raio, não
     a posição: deslocar além da faixa faria a nuvem de um trimestre invadir a do vizinho. */
  let radius = DOT_R;
  let bands = build(radius);
  let tight = false;
  if (widest(bands, radius) > half) {
    radius = DOT_R_FLOOR;
    bands = build(radius);
    tight = true;
  }
  const overflow = widest(bands, radius) > half;

  return (
    <g>
      {bands.map((band) => (
        <g key={`nuvem-${band.id}`}>
          {band.points.map((point) => {
            const color = VERTICAL_COLORS[point.deal.vertical];
            const cx = band.cx + Math.max(-half + radius, Math.min(half - radius, point.dx));
            /* Vertical B é anel de miolo na cor do cartão: é a forma, e não a cor, que separa as duas
               (TOK-9). O contorno na cor da superfície faz o mesmo pela vertical A, entre vizinhos
               que se encostam (COR-5, TOK-4). */
            return point.deal.vertical === 'B' ? (
              <circle
                cx={cx}
                cy={point.y}
                fill={SURFACE}
                key={point.deal.id}
                r={radius}
                stroke={color}
                strokeWidth={1.4}
              />
            ) : (
              <circle
                cx={cx}
                cy={point.y}
                fill={color}
                key={point.deal.id}
                r={radius}
                stroke={SURFACE}
                strokeWidth={0.75}
              />
            );
          })}
          {band.middle === null || yScale(band.middle) === undefined ? null : (
            <MedianMark
              band={band}
              half={half}
              radius={radius}
              y={Number(yScale(band.middle))}
            />
          )}
        </g>
      ))}
      {bands.map((band) =>
        band.points.map((point) =>
          point.deal.id !== highlightId ? null : (
            <g key={`destaque-${point.deal.id}`}>
              <circle
                cx={band.cx + point.dx}
                cy={point.y}
                fill="none"
                r={radius + HALO_EXTRA}
                stroke={SURFACE}
                strokeWidth={3}
              />
              <circle
                cx={band.cx + point.dx}
                cy={point.y}
                fill="none"
                r={radius + HALO_EXTRA}
                stroke={MEDIAN_COLOR}
                strokeWidth={1.5}
              />
            </g>
          ),
        ),
      )}
      {!tight ? null : (
        <text fill={NOTE_COLOR} fontSize={NOTE_SIZE} x={plotArea.x + 2} y={plotArea.y + NOTE_SIZE}>
          {overflow ? 'nuvem além da faixa, no piso de raio' : 'raio no piso: a nuvem não cabia'}
        </text>
      )}
    </g>
  );
}

export default function QuarterTicketBeeswarm({
  data = defaultData,
  highlightId = HIGHLIGHT_ID,
  height,
  className,
}: QuarterTicketBeeswarmProps) {
  const style = height === undefined ? undefined : { height };

  const deals = data.flatMap((quarter) => quarter.deals);
  const tickets = deals.map((deal) => deal.ticket);
  /* Domínio calculado sobre o conjunto, não sobre cada trimestre: são quatro faixas para comparar, e
     escala por faixa faria a mediana mais alta parecer igual à mais baixa (EIX-9). */
  const sortedTickets = [...tickets].sort((a, b) => a - b);
  const biggest = sortedTickets[sortedTickets.length - 1];
  const ticketTop = biggest === undefined ? TICKET_STEP : Math.ceil(biggest / TICKET_STEP) * TICKET_STEP;
  const ticks: number[] = [];
  for (let value = 0; value <= ticketTop; value += TICKET_STEP) ticks.push(value);

  const withMedian = data
    .map((quarter) => ({ quarter, middle: median(quarter.deals.map((deal) => deal.ticket)) }))
    .filter((row): row is { quarter: Quarter; middle: number } => row.middle !== null);
  const cheapest = withMedian.reduce<{ quarter: Quarter; middle: number } | null>(
    (best, row) => (best === null || row.middle < best.middle ? row : best),
    null,
  );
  const priciest = withMedian.reduce<{ quarter: Quarter; middle: number } | null>(
    (best, row) => (best === null || row.middle > best.middle ? row : best),
    null,
  );
  const top = deals.reduce<WonDeal | null>((best, deal) => (best === null || deal.ticket > best.ticket ? deal : best), null);
  const topQuarter = data.find((quarter) => quarter.deals.some((deal) => deal.id === top?.id));
  const countA = deals.filter((deal) => deal.vertical === 'A').length;
  const countB = deals.filter((deal) => deal.vertical === 'B').length;

  if (deals.length === 0 || cheapest === null || priciest === null || top === null || topQuarter === undefined) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 flex-col items-start justify-center gap-2', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 text-text-muted" />
        <p className="text-xs text-text-muted">
          O recorte não tem negócio ganho, então não há ticket a distribuir nem mediana de trimestre a
          comparar.
        </p>
      </div>
    );
  }

  const summary =
    `Beeswarm do ticket de ${formatInt(deals.length)} negócios ganhos no ano, um ponto por negócio em ${formatInt(data.length)} trimestres. ` +
    `A mediana vai de ${formatCurrencyCompact(cheapest.middle)} no ${cheapest.quarter.label} a ${formatCurrencyCompact(priciest.middle)} no ${priciest.quarter.label}, ` +
    `e o maior ticket do ano, ${formatCurrencyCompact(top.ticket)}, está no ${topQuarter.label}.`;

  /* O gráfico recebe uma linha por negócio só para os eixos terem de onde tirar o domínio. Nenhuma
     série desenha esse dado: quem desenha é a camada da nuvem, que precisa medir em pixel. */
  const axisRows = data.flatMap((quarter, index) =>
    quarter.deals.map((deal) => ({ slot: index + 0.5, ticket: deal.ticket })),
  );

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)}
      role="figure"
      style={style}
    >
      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} data={axisRows} margin={MARGIN}>
            {/* Grade só na direção da leitura (EIX-3): o valor está no eixo Y, então as linhas úteis
                são as horizontais. A exceção da EIX-3b pede os dois eixos quantitativos e lidos por
                posição, e aqui o eixo X é trimestre: posição em X não mede nada. */}
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              {...AXIS_PROPS}
              /* Depois do espalhamento, porque o `AXIS_PROPS` traz a linha de eixo ligada e com grade
                 no fundo ela é uma régua a mais (EIX-5, REC-30). A ordem é que decide. */
              axisLine={false}
              dataKey="slot"
              domain={[0, data.length]}
              height={X_AXIS_H}
              interval={0}
              /* Eixo numérico com um passo por trimestre, e não eixo de categoria: o dodge posiciona
                 em pixel dentro da faixa, e para isso ele precisa de uma escala que aceite meio
                 passo. O rótulo continua sendo o nome do trimestre. */
              tickFormatter={(value: number) => data[Math.floor(value)]?.label ?? ''}
              tickMargin={TICK_MARGIN}
              ticks={data.map((_, index) => index + 0.5)}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="ticket"
              domain={[0, ticketTop]}
              /* Tique desenhado à mão, e não pelo `<Text>` do Recharts: `R$ 200 mil` mede 52,4 px,
                 cabe nos 56 px úteis da faixa e mesmo assim o componente padrão quebrava em duas
                 linhas, deslocando o grupo do eixo inteiro (REC-2). Quem manda na largura aqui é a
                 tinta medida, não a estimativa da biblioteca. */
              tick={(props: { x?: number | string; y?: number | string; payload?: { value?: number } }) => (
                <text
                  className="tabular-nums"
                  dominantBaseline="central"
                  fill={AXIS_COLOR}
                  fontSize={TICK_SIZE}
                  textAnchor="end"
                  x={Number(props.x ?? 0) - TICK_MARGIN}
                  y={Number(props.y ?? 0)}
                >
                  {formatCurrencyAxis(Number(props.payload?.value ?? 0))}
                </text>
              )}
              ticks={ticks}
              type="number"
              width={Y_AXIS_W}
            />
            <SwarmLayer highlightId={highlightId} quarters={data} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>

      <div
        aria-hidden
        className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted"
      >
        <span className="tabular-nums">
          {`n ${formatInt(deals.length)} negócios ganhos; mediana de ${formatCurrencyCompact(cheapest.middle)} no ${cheapest.quarter.label} a ${formatCurrencyCompact(priciest.middle)} no ${priciest.quarter.label}`}
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ backgroundColor: VERTICAL_COLORS.A }}
          />
          <span>{`${VERTICAL_LABELS.A}, ${formatRateWithVolume(countA, deals.length)}`}</span>
        </span>
        <span className="flex items-center gap-1 tabular-nums">
          <span
            className="size-2 shrink-0 rounded-full"
            style={{ borderColor: VERTICAL_COLORS.B, borderStyle: 'solid', borderWidth: 1.5 }}
          />
          <span>{`${VERTICAL_LABELS.B}, ${formatRateWithVolume(countB, deals.length)}`}</span>
        </span>
        <span className="flex items-center gap-1">
          <span className="h-0.5 w-3 shrink-0" style={{ backgroundColor: MEDIAN_COLOR }} />
          <span>mediana do trimestre</span>
        </span>
        <span className="tabular-nums">
          {`em destaque, o maior ticket do ano: ${top.client}, ${formatCurrencyCompact(top.ticket)}, no ${topQuarter.label}`}
        </span>
      </div>
    </figure>
  );
}
