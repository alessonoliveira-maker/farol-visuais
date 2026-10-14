import { Filter } from 'lucide-react';

import { formatDate, formatDays, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, FIRST_DAY, SLA_MINUTES, type DayMinutes } from './data';

/**
 * Faixa de 30 dias do SLA de primeiro contato: um bloco por dia, dentro do SLA, fora dele ou sem
 * coleta. Lê-se quantos dias foram ruins e se estão juntos. O dia sem coleta é um estado próprio,
 * em contorno e fora da conta, e o resumo à direita sai do mesmo array que desenha os blocos.
 */
export interface SlaStripProps {
  readonly data?: readonly DayMinutes[];
  readonly height?: number;
  readonly className?: string;
}

const MS_DAY = 86_400_000;
const NO_DATA_COLOR = 'var(--text-muted)';

type DayState = 'within' | 'over' | 'none';

function stateOf(minutes: DayMinutes): DayState {
  if (minutes === null) return 'none';
  return minutes <= SLA_MINUTES ? 'within' : 'over';
}

/** Data em UTC: o dia nunca vira em outra coluna por causa de fuso. */
function isoAt(offset: number): string {
  const [year, month, day] = FIRST_DAY.split('-').map(Number);
  return new Date(Date.UTC(year ?? 0, (month ?? 1) - 1, day ?? 1) + offset * MS_DAY).toISOString().slice(0, 10);
}

export default function SlaStrip({ data = defaultData, height, className }: SlaStripProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 flex-col items-center justify-center gap-2 text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4" />
        <p className="text-xs">O recorte não tem dias medidos, então não há faixa para desenhar.</p>
      </div>
    );
  }

  const states = data.map(stateOf);
  const within = states.filter((state) => state === 'within').length;
  const over = states.filter((state) => state === 'over').length;
  const none = states.length - within - over;
  const withData = within + over;
  const firstLabel = formatDate(isoAt(0));
  const lastLabel = formatDate(isoAt(data.length - 1));
  const sla = `${formatInt(SLA_MINUTES)} min`;

  const summary =
    `Faixa de ${formatInt(data.length)} dias da fila de entrada, de ${firstLabel} a ${lastLabel}: ` +
    `${formatInt(within)} de ${formatInt(withData)} dias com dado ficaram dentro do SLA de ${sla}, ` +
    `${formatDays(over)} fora e ${formatDays(none)} sem coleta.`;

  return (
    <figure
      aria-label={summary}
      className={cn('m-0 flex h-full w-full min-w-0 flex-col justify-center gap-4', className)}
      role="figure"
      style={height === undefined ? undefined : { height }}
    >
      <div aria-hidden className="flex items-end gap-6">
        <div className="min-w-0 flex-1">
          <div className="flex h-6 items-end gap-px">
            {states.map((state, index) => (
              <span
                className={cn(
                  'min-w-0 flex-1 rounded-sm',
                  state === 'within' && 'h-6 bg-positive',
                  state === 'over' && 'h-3.5 bg-negative',
                  state === 'none' && 'h-6 border border-solid',
                )}
                key={isoAt(index)}
                style={state === 'none' ? { borderColor: NO_DATA_COLOR } : undefined}
              />
            ))}
          </div>
          <div className="mt-2 flex justify-between text-[0.6875rem] leading-4 text-text-muted tabular-nums">
            <span>{firstLabel}</span>
            <span>{lastLabel}</span>
          </div>
        </div>

        <dl className="flex w-44 shrink-0 flex-col gap-2 border-l border-line-subtle pl-4 text-[0.6875rem] leading-4 text-text-muted">
          <div>
            <dd className="font-display text-sm font-semibold tabular-nums text-text-primary">
              {withData === 0 ? formatUnavailable() : `${formatInt(within)} de ${formatInt(withData)}`}
            </dd>
            <dt>dias com dado dentro do SLA</dt>
          </div>
          <div className="tabular-nums">
            <dd className="text-xs text-text-secondary">{`${formatDays(over)} fora do SLA`}</dd>
            <dd className="text-xs text-text-secondary">{`${formatDays(none)} sem coleta, fora da conta`}</dd>
          </div>
        </dl>
      </div>

      <div aria-hidden className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm bg-positive" />
          <span className="tabular-nums">{`dentro do SLA, até ${sla}`}</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2 w-3 rounded-sm bg-negative" />
          <span>fora do SLA, bloco mais baixo</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-sm border border-solid" style={{ borderColor: NO_DATA_COLOR }} />
          <span>sem coleta</span>
        </span>
      </div>
    </figure>
  );
}
