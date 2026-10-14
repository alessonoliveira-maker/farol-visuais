import { formatInt, formatMonthShort } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MonthlyPaceGoal } from './data';

/**
 * Barra de progresso com a segunda régua da família: o ritmo esperado até a data de corte. O
 * trilho mostra o realizado sólido, a projeção tracejada como premissa (mesma cor do realizado) e
 * dois marcadores tracejados em texto muted: a meta do mês e o ritmo esperado para hoje. Nenhum
 * relógio no componente: a data de corte e a fração do mês decorrida chegam prontas no dado.
 */
export interface MonthlyPaceBarProps {
  readonly data?: MonthlyPaceGoal;
  readonly className?: string;
}

/** Folga acima do maior entre meta e projeção, para os dois traços terem onde respirar. */
const DOMAIN_SLACK = 1.05;

export default function MonthlyPaceBar({ data = defaultData, className }: MonthlyPaceBarProps) {
  const { label, period, cutoffLabel, value, target, pace, expectedRatio, projected } = data;
  const domainMax = Math.max(target, projected) * DOMAIN_SLACK;
  const realizedRatio = Math.min(value, domainMax) / domainMax;
  const projectedRatio = Math.min(projected, domainMax) / domainMax;
  const targetRatio = target / domainMax;
  const expectedCount = expectedRatio * target;
  const expectedRatioOnTrack = expectedCount / domainMax;
  const gap = value - expectedCount;
  const isBehind = gap < 0;
  const paceLabel = pace === 'linear' ? 'ritmo linear do mês' : 'ritmo pela curva histórica';

  const summary = `Barra de progresso: ${label}, ${formatInt(value)} de ${formatInt(target)} na ${cutoffLabel} de ${formatMonthShort(period)}. Ritmo esperado (${paceLabel}) hoje: ${formatInt(Math.round(expectedCount))}, ${formatInt(Math.round(Math.abs(gap)))} ${isBehind ? 'atrás' : 'à frente'}. Projeção premissa: ${formatInt(projected)}.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-2', className)}
      role="img"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">
          {label}, {formatMonthShort(period)}
        </p>
        <p className="shrink-0 text-xs text-text-muted">{cutoffLabel}</p>
      </div>

      <p className="kpi-number text-3xl leading-none font-semibold text-text-primary">
        {formatInt(value)} <span className="text-sm font-semibold text-text-muted">de {formatInt(target)}</span>
      </p>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-sunken">
        <div className="absolute inset-y-0 left-0 rounded-full bg-chart-1" style={{ width: `${String(realizedRatio * 100)}%` }} />
        <div
          className="absolute inset-y-0 rounded-r-full opacity-70"
          style={{
            left: `${String(realizedRatio * 100)}%`,
            width: `${String(Math.max(0, projectedRatio - realizedRatio) * 100)}%`,
            backgroundImage:
              'repeating-linear-gradient(90deg, var(--chart-1) 0, var(--chart-1) 5px, transparent 5px, transparent 8px)',
          }}
        />
        <div
          className="absolute inset-y-[-3px] w-0 border-l border-dashed border-text-muted"
          style={{ left: `${String(targetRatio * 100)}%` }}
        />
        <div
          className="absolute inset-y-0 w-0 border-l border-dotted border-text-secondary"
          style={{ left: `${String(expectedRatioOnTrack * 100)}%` }}
        />
      </div>

      <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1 text-xs text-text-muted">
        <span>
          meta <span className="kpi-number text-text-secondary">{formatInt(target)}</span>
        </span>
        <span>
          esperado hoje <span className="kpi-number text-text-secondary">{formatInt(Math.round(expectedCount))}</span> ({paceLabel})
        </span>
      </div>

      <p className="text-xs text-text-muted">
        <span className={cn('kpi-number font-bold', isBehind ? 'text-negative' : 'text-positive')}>
          {formatInt(Math.round(Math.abs(gap)))}
        </span>{' '}
        agendas {isBehind ? 'atrás' : 'à frente'} do ritmo esperado. Projeção premissa para o fim do mês:{' '}
        <span className="kpi-number text-text-secondary">{formatInt(projected)}</span>.
      </p>
    </div>
  );
}
