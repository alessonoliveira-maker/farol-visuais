import { formatCurrencyCompact, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QuarterGoal } from './data';

/**
 * Barra de progresso linear: o realizado do trimestre contra a meta declarada, em HTML com
 * Tailwind, sem Recharts. O domínio do trilho vai até o maior entre valor e meta com folga, para
 * o traço da meta nunca sair do trilho quando o realizado a ultrapassa. A leitura não considera
 * o ritmo esperado do período: por isso a peça declara isso em texto, para "quanto falta" não
 * virar "bom" ou "ruim" ao gosto de quem olha.
 */
export interface QuarterProgressBarProps {
  readonly data?: QuarterGoal;
  readonly className?: string;
}

/** Folga acima do maior entre valor e meta, para o traço da meta ter onde respirar. */
const DOMAIN_SLACK = 1.05;
/** Abaixo deste percentual do trilho a ponta arredondada vira quase reta: rounded-full de 12 px
 * de altura soma uns 6 px de comprimento visual que, em barra curta, é erro de leitura. */
const ROUNDED_FLOOR = 0.04;

export default function QuarterProgressBar({ data = defaultData, className }: QuarterProgressBarProps) {
  const { label, period, value, target } = data;
  const domainMax = Math.max(value, target) * DOMAIN_SLACK;
  const fillRatio = value / domainMax;
  const targetRatio = target / domainMax;
  const remaining = Math.max(0, target - value);
  const percentOfTarget = target > 0 ? value / target : 0;

  const summary = `Barra de progresso linear: ${label} de ${period} em ${formatCurrencyCompact(value)}, ${formatPercent(percentOfTarget)} da meta de ${formatCurrencyCompact(target)}. Faltam ${formatCurrencyCompact(remaining)} para fechar o trimestre. Leitura sem o ritmo esperado do período considerado.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-2', className)}
      role="img"
    >
      <div className="flex items-baseline justify-between gap-3">
        <p className="min-w-0 truncate text-xs font-medium text-text-secondary">
          {label}, {period}
        </p>
        <p className="shrink-0 text-xs text-text-muted">
          meta <span className="kpi-number">{formatCurrencyCompact(target)}</span>
        </p>
      </div>

      <p className="kpi-number text-3xl leading-none font-semibold text-text-primary">{formatCurrencyCompact(value)}</p>

      <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-sunken">
        <div
          className={cn('absolute inset-y-0 left-0 bg-chart-1', fillRatio < ROUNDED_FLOOR ? 'rounded-sm' : 'rounded-full')}
          style={{ width: `${String(fillRatio * 100)}%` }}
        />
        <div
          className="absolute inset-y-[-3px] w-0 border-l border-dashed border-text-muted"
          style={{ left: `${String(targetRatio * 100)}%` }}
        />
      </div>

      <p className="text-xs text-text-muted">
        {formatPercent(percentOfTarget)} da meta; faltam{' '}
        <span className="kpi-number font-semibold text-text-primary">{formatCurrencyCompact(remaining)}</span>{' '}
        para fechar o trimestre. Sem leitura de ritmo esperado.
      </p>
    </div>
  );
}
