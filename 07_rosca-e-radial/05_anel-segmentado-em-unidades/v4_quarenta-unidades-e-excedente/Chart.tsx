import { TrendingUp } from 'lucide-react';
import type { ReactElement } from 'react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, executiveName, metaTrimestral, totalRealizado, type QuarterlyMeetingSlot } from './data';

/**
 * Anel de unidades no teto de legibilidade de 40 segmentos: o valor real pode passar da meta
 * sem que o anel ganhe um 41º gomo. O excedente sai do círculo e vira selo à parte.
 */
export interface QuarterlyMeetingRingProps {
  readonly data?: readonly QuarterlyMeetingSlot[];
  readonly height?: number;
  readonly className?: string;
}

const INNER_RADIUS = '72%';
const OUTER_RADIUS = '92%';

function paddingAngleFor(n: number): number {
  return Math.min(3, 120 / n);
}

interface CenterLabelProps {
  readonly viewBox?: { readonly cx?: number; readonly cy?: number; readonly x?: number; readonly y?: number };
}

export default function QuarterlyMeetingRing({ data = defaultData, height, className }: QuarterlyMeetingRingProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <span>Nenhuma linha neste recorte: não há reunião registrada no trimestre.</span>
      </div>
    );
  }

  const excedente = totalRealizado - metaTrimestral;

  const summary =
    `Anel de unidades no teto de 40 segmentos com as reuniões do trimestre de ${executiveName}. ` +
    `Realizou ${formatInt(totalRealizado)} reuniões contra a meta de ${formatInt(metaTrimestral)}, ` +
    `${formatInt(excedente)} acima; cada segmento vale 1 reunião até o teto, o excedente aparece no selo.`;

  const renderCenter = ({ viewBox }: CenterLabelProps): ReactElement | null => {
    if (viewBox?.cx === undefined || viewBox.cy === undefined) return null;
    return (
      <text textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
        <tspan className="font-display" dy="-0.2em" fill="var(--text-primary)" fontSize={30} fontWeight={600} x={viewBox.cx}>
          {formatInt(totalRealizado)}
        </tspan>
        <tspan className="font-sans" dy="1.6em" fill="var(--text-muted)" fontSize={11} x={viewBox.cx}>
          de {formatInt(metaTrimestral)} reuniões
        </tspan>
      </text>
    );
  };

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col items-center gap-2', className)} role="img" style={style}>
      <div className="flex min-h-0 w-full flex-1 items-center justify-center">
        <div className="aspect-square h-full max-h-full max-w-full">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer={false} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              cx="50%"
              cy="50%"
              data={data}
              dataKey={() => 1}
              endAngle={-270}
              innerRadius={INNER_RADIUS}
              isAnimationActive={animate}
              nameKey="id"
              outerRadius={OUTER_RADIUS}
              paddingAngle={paddingAngleFor(data.length)}
              startAngle={90}
              stroke="var(--surface-raised)"
              strokeWidth={1}
            >
              {data.map((row) => (
                <Cell fill="var(--positive)" key={row.id} />
              ))}
              <Label content={renderCenter} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 rounded-full border border-line-subtle bg-surface-overlay px-2.5 py-1 text-xs">
        <TrendingUp aria-hidden className="size-3.5 text-positive" />
        <span className="kpi-number font-semibold text-positive">+{formatInt(excedente)}</span>
        <span className="text-text-secondary">acima da meta</span>
      </div>
      <p aria-hidden className="shrink-0 text-center text-[0.6875rem] text-text-muted">
        Cada segmento vale <span className="font-display tabular-nums">{formatInt(1)}</span> reunião, até o teto de{' '}
        {formatInt(metaTrimestral)}; o excedente aparece no selo.
      </p>
    </div>
  );
}
