import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { useMemo } from 'react';
import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Scatter, ScatterChart, XAxis, YAxis, type LabelProps } from 'recharts';

import { AXIS_PROPS, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatCurrencyAxis, formatCurrencyCompact, formatDays, formatDecimal, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type WonOpportunity } from './data';

export interface ScatterWithMarginalsProps {
  readonly data?: readonly WonOpportunity[];
  readonly height?: number;
  readonly className?: string;
}

/** Domínio do ticket (eixo horizontal) compartilhado pelo plano e pelo histograma de cima. Os
 * ticks são redondos (EIX-4) e o domínio termina na primeira linha de grade acima do maior
 * valor do dado (R$ 517 mil): 400 mil não cobre, 600 mil cobre. */
const TICKET_DOMAIN: readonly [number, number] = [0, 600_000];
const TICKET_TICKS = [0, 200_000, 400_000, 600_000] as const;
const TICKET_BIN_WIDTH = 100_000;
const TICKET_BIN_COUNT = 6;
/** Domínio do ciclo (eixo vertical); mesma regra da EIX-4, maior valor do dado é 149 dias. */
const CICLO_DOMAIN: readonly [number, number] = [0, 160];
const CICLO_TICKS = [0, 40, 80, 120, 160] as const;
const CICLO_BIN_WIDTH = 20;
const CICLO_BIN_COUNT = 8;

/** Margens do plano central; os dois histogramas repetem o lado que precisa alinhar ao pixel. */
const MARGIN_LEFT = 60;
const MARGIN_RIGHT = 12;
const MARGIN_TOP = 8;
const MARGIN_BOTTOM = 34;
/** Largura que a YAxis do plano reserva além da própria margem (rótulo do ciclo) e altura que a
 * XAxis reserva além da margem (rótulo do ticket). O Recharts soma essas reservas à margem só no
 * plano; os dois marginais têm de somar a mesma reserva no lado que precisa alinhar ao pixel,
 * senão nascem deslocados 60 px (o histograma do topo) ou 30 px (o da direita), ver EIX-12.
 * O marginal de Y também precisa do eixo de categoria revertido (`reversed`): o eixo de valor do
 * plano cresce para cima, mas o `BarChart` vertical lista a categoria de cima para baixo, então
 * sem reverter o bin de 0 a 20 dias nasce no topo, onde o plano mostra 140 a 160. */
const AXIS_WIDTH = 60;
const AXIS_HEIGHT = 30;

/** Vão entre 30% e 40% (ESP-2). Com o corpo de 350×277 px do preset "alto" deste modelo, 6 bins
 * de R$ 100 mil dão passo de 58,3 px e 8 bins de 20 dias dão passo de 34,6 px; no piso do vão,
 * 30%, a espessura fica em 23,3 px e 13,85 px, as duas dentro de 12 a 24 px. */
const BAR_CATEGORY_GAP = '30%';
const BAR_MAX_SIZE = 24;
/** O domínio dos dois eixos de contagem (ocultos) sobra 50% acima do maior bin: o bin mais alto
 * não encosta no limite do corpo (ESP-3) e sobra espaço para o número da contagem ao lado. */
const HIST_AXIS_HEADROOM = 1.5;

const POINT_FILL = 'var(--chart-1)';
const HIST_FILL = 'var(--line-strong)';
const HIST_LABEL_FILL = 'var(--text-muted)';

interface Bin {
  readonly center: number;
  readonly count: number;
}

/** Um bin por faixa fixa do domínio; o bin do valor máximo absorve o que passar do teto. */
function makeBins(values: readonly number[], binWidth: number, binCount: number): Bin[] {
  const counts = new Array<number>(binCount).fill(0);
  for (const value of values) {
    const index = Math.min(binCount - 1, Math.max(0, Math.floor(value / binWidth)));
    counts[index] = (counts[index] ?? 0) + 1;
  }
  return counts.map((count, index) => ({ center: index * binWidth + binWidth / 2, count }));
}

/** Correlação de Pearson entre duas séries do mesmo tamanho; 0 quando não há variação. */
function pearson(xs: readonly number[], ys: readonly number[]): number {
  const n = xs.length;
  const meanX = xs.reduce((sum, x) => sum + x, 0) / n;
  const meanY = ys.reduce((sum, y) => sum + y, 0) / n;
  let covariance = 0;
  let varianceX = 0;
  let varianceY = 0;
  for (let i = 0; i < n; i += 1) {
    const dx = (xs[i] ?? 0) - meanX;
    const dy = (ys[i] ?? 0) - meanY;
    covariance += dx * dy;
    varianceX += dx * dx;
    varianceY += dy * dy;
  }
  const denominator = Math.sqrt(varianceX * varianceY);
  return denominator === 0 ? 0 : covariance / denominator;
}

/** Contagem acima da barra do histograma do topo: sem o número junto, `--line-strong` não tem a
 * isenção de contraste da 17.2 e da ACE-3 (1,79:1 no escuro, 1,83:1 no claro). */
function TopCountLabel({ x, y, width, value }: LabelProps): ReactElement | null {
  if (typeof value !== 'number') return null;
  return (
    <text
      className="font-display"
      fill={HIST_LABEL_FILL}
      fontSize={11}
      textAnchor="middle"
      x={Number(x) + Number(width) / 2}
      y={Number(y) - 4}
    >
      {formatInt(value)}
    </text>
  );
}

/** Contagem à direita da barra do histograma da direita; mesma isenção da TopCountLabel. */
function RightCountLabel({ x, y, width, height, value }: LabelProps): ReactElement | null {
  if (typeof value !== 'number') return null;
  return (
    <text
      className="font-display"
      dominantBaseline="central"
      fill={HIST_LABEL_FILL}
      fontSize={11}
      textAnchor="start"
      x={Number(x) + Number(width) + 4}
      y={Number(y) + Number(height) / 2}
    >
      {formatInt(value)}
    </text>
  );
}

export default function ScatterWithMarginals({ data = defaultData, height, className }: ScatterWithMarginalsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  const ticketBins = useMemo(
    () => makeBins(data.map((row) => row.ticket), TICKET_BIN_WIDTH, TICKET_BIN_COUNT),
    [data],
  );
  const cicloBins = useMemo(() => makeBins(data.map((row) => row.ciclo), CICLO_BIN_WIDTH, CICLO_BIN_COUNT), [data]);
  const maxTicketCount = Math.max(1, ...ticketBins.map((bin) => bin.count));
  const maxCicloCount = Math.max(1, ...cicloBins.map((bin) => bin.count));
  const correlation = data.length > 1 ? pearson(data.map((row) => row.ticket), data.map((row) => row.ciclo)) : 0;

  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4" />
        <span>Nenhuma oportunidade ganha neste recorte: não há pontos para posicionar no plano.</span>
      </div>
    );
  }

  const topTicketBin = ticketBins.reduce((top, bin) => (bin.count > top.count ? bin : top), ticketBins[0] as Bin);
  const topCicloBin = cicloBins.reduce((top, bin) => (bin.count > top.count ? bin : top), cicloBins[0] as Bin);
  const summary = `Dispersão com histogramas marginais: ${String(data.length)} oportunidades ganhas por ticket e ciclo de fechamento. Correlação de ${formatDecimal(correlation, 2)} entre as duas medidas. Ticket concentra perto de ${formatCurrencyCompact(topTicketBin.center)}; ciclo concentra perto de ${formatDays(Math.round(topCicloBin.center))}.`;

  return (
    <div
      aria-label={summary}
      className={cn('grid h-full w-full min-w-0 grid-cols-[1fr_88px] grid-rows-[72px_1fr] gap-1', className)}
      role="img"
      style={style}
    >
      <div className="min-w-0">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            accessibilityLayer={false}
            barCategoryGap={BAR_CATEGORY_GAP}
            data={ticketBins}
            margin={{ top: MARGIN_TOP, right: MARGIN_RIGHT, bottom: 2, left: MARGIN_LEFT + AXIS_WIDTH }}
          >
            <XAxis dataKey="center" domain={TICKET_DOMAIN} hide type="number" />
            <YAxis allowDecimals={false} domain={[0, maxTicketCount * HIST_AXIS_HEADROOM]} hide />
            <Bar dataKey="count" fill={HIST_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX_SIZE} radius={[2, 2, 0, 0]}>
              <LabelList content={TopCountLabel} dataKey="count" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <div aria-hidden className="flex items-end justify-center pb-2 text-center">
        <div>
          <p className="kpi-number text-sm font-semibold text-text-primary">{formatInt(data.length)}</p>
          <p className="text-[11px] text-text-muted">oportunidades</p>
        </div>
      </div>
      <div className="min-w-0">
        <ResponsiveContainer height="100%" width="100%">
          <ScatterChart accessibilityLayer={false} margin={{ top: MARGIN_TOP, right: MARGIN_RIGHT, bottom: MARGIN_BOTTOM, left: MARGIN_LEFT }}>
            <CartesianGrid stroke={GRID_COLOR} strokeDasharray="3 3" />
            <XAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="ticket"
              domain={TICKET_DOMAIN}
              height={AXIS_HEIGHT}
              name="Ticket"
              tickFormatter={formatCurrencyAxis}
              tickMargin={8}
              ticks={[...TICKET_TICKS]}
              type="number"
            />
            <YAxis
              {...AXIS_PROPS}
              axisLine={false}
              dataKey="ciclo"
              domain={CICLO_DOMAIN}
              name="Ciclo"
              tickFormatter={(value: number) => formatDays(value)}
              tickMargin={8}
              ticks={[...CICLO_TICKS]}
              type="number"
              width={AXIS_WIDTH}
            />
            <Scatter data={[...data]} fill={POINT_FILL} isAnimationActive={animate} shape="circle" />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
      <div className="min-w-0">
        <ResponsiveContainer height="100%" width="100%">
          <BarChart
            accessibilityLayer={false}
            barCategoryGap={BAR_CATEGORY_GAP}
            data={cicloBins}
            layout="vertical"
            margin={{ top: MARGIN_TOP, right: 4, bottom: MARGIN_BOTTOM + AXIS_HEIGHT, left: 2 }}
          >
            <XAxis allowDecimals={false} domain={[0, maxCicloCount * HIST_AXIS_HEADROOM]} hide type="number" />
            <YAxis dataKey="center" domain={CICLO_DOMAIN} hide reversed type="number" />
            <Bar dataKey="count" fill={HIST_FILL} isAnimationActive={animate} maxBarSize={BAR_MAX_SIZE} radius={[0, 2, 2, 0]}>
              <LabelList content={RightCountLabel} dataKey="count" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
