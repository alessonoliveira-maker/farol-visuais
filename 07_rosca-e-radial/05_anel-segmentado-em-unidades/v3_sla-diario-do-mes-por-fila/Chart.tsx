import type { ReactElement } from 'react';
import { Cell, Label, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type FilaSla, type SlaDayStatus } from './data';

/**
 * Três anéis de unidades, um por fila, cada um com 22 segmentos (um por dia útil do mês) na
 * mesma ordem e no mesmo diâmetro, para o olho comparar fila com fila sem reler o eixo.
 */
export interface FilaSlaRingsProps {
  readonly data?: readonly FilaSla[];
  readonly height?: number;
  readonly className?: string;
}

const INNER_RADIUS = '68%';
const OUTER_RADIUS = '94%';

const LEGEND: readonly { readonly status: SlaDayStatus; readonly label: string }[] = [
  { status: 'cumprido', label: 'Cumprido' },
  { status: 'estourado', label: 'Estourado' },
  { status: 'feriado', label: 'Sem expediente' },
];

function paddingAngleFor(n: number): number {
  return Math.min(3, 120 / n);
}

function fillFor(status: SlaDayStatus): string {
  if (status === 'cumprido') return 'var(--positive)';
  if (status === 'estourado') return 'var(--negative)';
  return 'none';
}

function strokeFor(status: SlaDayStatus): string {
  return status === 'feriado' ? 'var(--text-muted)' : 'var(--surface-raised)';
}

interface CenterLabelProps {
  readonly viewBox?: { readonly cx?: number; readonly cy?: number; readonly x?: number; readonly y?: number };
}

function Ring({ fila, animate }: { readonly fila: FilaSla; readonly animate: boolean }): ReactElement {
  const withExpediente = fila.dias.filter((dia) => dia.status !== 'feriado');
  const cumprido = withExpediente.filter((dia) => dia.status === 'cumprido').length;

  const renderCenter = ({ viewBox }: CenterLabelProps): ReactElement | null => {
    if (viewBox?.cx === undefined || viewBox.cy === undefined) return null;
    return (
      <text textAnchor="middle" x={viewBox.cx} y={viewBox.cy}>
        <tspan className="font-display" dy="-0.1em" fill="var(--text-primary)" fontSize={14} fontWeight={600} x={viewBox.cx}>
          {formatInt(cumprido)} de {formatInt(withExpediente.length)}
        </tspan>
      </text>
    );
  };

  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-0.5">
      <div className="aspect-square w-full max-w-40">
        <ResponsiveContainer height="100%" width="100%">
          <PieChart accessibilityLayer={false} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
            <Pie
              cx="50%"
              cy="50%"
              data={fila.dias}
              dataKey={() => 1}
              endAngle={-270}
              innerRadius={INNER_RADIUS}
              isAnimationActive={animate}
              nameKey="date"
              outerRadius={OUTER_RADIUS}
              paddingAngle={paddingAngleFor(fila.dias.length)}
              startAngle={90}
            >
              {fila.dias.map((dia) => (
                <Cell fill={fillFor(dia.status)} key={dia.date} stroke={strokeFor(dia.status)} />
              ))}
              <Label content={renderCenter} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <span className="shrink-0 text-xs leading-none text-text-secondary">{fila.label}</span>
    </div>
  );
}

export default function FilaSlaRings({ data = defaultData, height, className }: FilaSlaRingsProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <span>Nenhuma linha neste recorte: não há fila com SLA medido no mês.</span>
      </div>
    );
  }

  const resumo = data
    .map((fila) => {
      const comExpediente = fila.dias.filter((dia) => dia.status !== 'feriado');
      const cumprido = comExpediente.filter((dia) => dia.status === 'cumprido').length;
      return `${fila.label} cumpriu ${formatInt(cumprido)} de ${formatInt(comExpediente.length)}`;
    })
    .join('; ');

  const summary =
    `Três anéis de unidades com o SLA diário de ${String(data.length)} filas em ${formatInt(data[0]?.dias.length ?? 0)} ` +
    `dias úteis do mês, com um feriado sem expediente. ${resumo}. Cada segmento do anel vale 1 dia útil.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col gap-1', className)} role="img" style={style}>
      <div className="flex min-h-0 min-w-0 flex-1 items-center justify-center gap-3">
        {data.map((fila) => (
          <Ring animate={animate} fila={fila} key={fila.id} />
        ))}
      </div>
      <div className="flex shrink-0 flex-wrap items-center justify-center gap-x-4 gap-y-1 text-xs" aria-hidden>
        {LEGEND.map((item) => (
          <span className="flex items-center gap-1.5" key={item.status}>
            <span
              className={cn('size-2.5 shrink-0 rounded-full', item.status === 'feriado' && 'border border-text-muted')}
              style={item.status === 'feriado' ? undefined : { backgroundColor: fillFor(item.status) }}
            />
            <span className={item.status === 'feriado' ? 'text-text-muted' : 'text-text-secondary'}>{item.label}</span>
          </span>
        ))}
      </div>
      <p aria-hidden className="shrink-0 text-center text-[0.6875rem] text-text-muted">
        Cada segmento do anel vale <span className="font-display tabular-nums">{formatInt(1)}</span> dia útil.
      </p>
    </div>
  );
}
