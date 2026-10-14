import { Filter } from 'lucide-react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  type TooltipContentProps,
} from 'recharts';

import { AXIS_PROPS, CURSOR_COLOR, GRID_COLOR, useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { ChartTooltip } from '@/components/visuals/charts/ChartTooltip';
import { formatDate, formatHours, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type FirstContactWeek } from './data';

/**
 * Linha da mediana semanal do tempo até o primeiro contato, sobre uma faixa sombreada que vai do
 * 1º ao 3º quartil da mesma semana. A faixa é dispersão medida, não meta: a nota abaixo do título
 * e a dica nomeiam o método para ninguém ler a sombra como um alvo.
 */
export interface FirstContactBandProps {
  readonly data?: readonly FirstContactWeek[];
  readonly height?: number;
  readonly className?: string;
}

const MARGIN = { top: 8, right: 16, bottom: 0, left: 0 } as const;
const VALUE_AXIS_WIDTH = 40;
const BAND_FILL = 'var(--line-strong)';
const BAND_OPACITY = 0.32;

interface BandRow extends FirstContactWeek {
  readonly band: readonly [number, number];
}

/** A dica reescreve a faixa como "entre X e Y" em vez do par cru que o Recharts devolveria. */
function BandTooltip({ active, label, payload }: Partial<TooltipContentProps>) {
  if (!active || !payload || payload.length === 0) return null;
  const band = payload.find((entry) => entry.dataKey === 'band');
  const median = payload.find((entry) => entry.dataKey === 'medianHours');
  const bandValue = Array.isArray(band?.value) ? band.value : null;
  const rewritten = [
    median && typeof median.value === 'number' ? { ...median, name: 'Mediana' } : null,
    band && bandValue
      ? { ...band, name: 'Faixa (P25 a P75)', value: `entre ${formatHours(Number(bandValue[0]))} e ${formatHours(Number(bandValue[1]))}` }
      : null,
  ].filter((entry): entry is NonNullable<typeof entry> => entry !== null);
  return <ChartTooltip active={active} label={label} labelFormat="date" payload={rewritten} valueFormat="hours" />;
}

export default function FirstContactBand({ data = defaultData, height, className }: FirstContactBandProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma semana neste recorte: não há tempo de primeiro contato para medir.</span>
      </div>
    );
  }

  const rows: readonly BandRow[] = data.map((row) => ({ ...row, band: [row.p25Hours, row.p75Hours] }));
  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  const direction = last.medianHours > first.medianHours ? 'piorou' : last.medianHours < first.medianHours ? 'melhorou' : 'ficou estável';

  const summary = [
    `Gráfico de linha com a mediana semanal do tempo até o primeiro contato em ${String(rows.length)} semanas, com faixa sombreada entre o 1º e o 3º quartil de cada semana.`,
    `Na semana de ${formatDate(last.week)} a mediana é de ${formatHours(last.medianHours)}, contra ${formatHours(first.medianHours)} em ${formatDate(first.week)}: o tempo ${direction}.`,
  ].join(' ');

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="img" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs text-text-muted">
        Faixa sombreada: entre o 1º e o 3º quartil de cada semana.
      </p>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart accessibilityLayer={false} data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="week" tickFormatter={formatMonthShort} tickMargin={8} />
            <YAxis {...AXIS_PROPS} axisLine={false} tickFormatter={(value: number) => formatHours(value)} width={VALUE_AXIS_WIDTH} />
            <Tooltip content={<BandTooltip />} cursor={{ stroke: CURSOR_COLOR }} isAnimationActive={false} />
            <Area
              dataKey="band"
              fill={BAND_FILL}
              fillOpacity={BAND_OPACITY}
              isAnimationActive={animate}
              stroke="none"
            />
            <Line
              activeDot={{ r: 4 }}
              dataKey="medianHours"
              dot={false}
              isAnimationActive={animate}
              stroke="var(--chart-1)"
              strokeWidth={2}
              type="linear"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
