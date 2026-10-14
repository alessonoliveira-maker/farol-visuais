import { Filter, Unplug, User } from 'lucide-react';

import { formatInt, formatMonthLong, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, month as defaultMonth, type LeadsByOrigin } from './data';

/**
 * Pictograma isotype com unidade de dez: cada ícone vale 10 leads, o ícone nunca é fatiado e o número
 * exato fecha a fileira. A unidade sobe sozinha quando uma fileira passaria de 50 ícones.
 */
export interface LeadsPictogramProps {
  readonly data?: readonly LeadsByOrigin[];
  readonly month?: string;
  readonly className?: string;
}

const UNIT_STEPS = [10, 20, 50, 100, 200, 500, 1000] as const;
const MAX_ICONS_PER_ROW = 50;
const ICON_STROKE = 2.5;
const ICON_COLOR = 'var(--chart-1)';

/** Menor unidade da escada em que a maior fileira cabe em até 50 ícones inteiros. */
function pickUnit(maxLeads: number): number {
  const fitted = UNIT_STEPS.find((unit) => Math.floor(maxLeads / unit) <= MAX_ICONS_PER_ROW);
  return fitted ?? UNIT_STEPS[UNIT_STEPS.length - 1] ?? 10;
}

/** Soma só das origens com coleta; `null` quando nenhuma tem, porque 0 de nada não é total (EST-1b). */
function collectedTotal(rows: readonly LeadsByOrigin[]): number | null {
  const values = rows.flatMap((row) => (row.leads === null ? [] : [row.leads]));
  if (values.length === 0) return null;
  return values.reduce((sum, value) => sum + value, 0);
}

/** Maior total primeiro; a origem sem coleta vai por último. */
function orderRows(rows: readonly LeadsByOrigin[]): LeadsByOrigin[] {
  return [...rows].sort((a, b) => (a.leads === null ? 1 : 0) - (b.leads === null ? 1 : 0) || (b.leads ?? 0) - (a.leads ?? 0));
}

export default function LeadsPictogram({ data = defaultData, month = defaultMonth, className }: LeadsPictogramProps) {
  const total = collectedTotal(data);

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma origem neste recorte: a lista não tem fileira para desenhar.</span>
      </div>
    );
  }

  if (total === null) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Unplug aria-hidden className="size-4 shrink-0" />
        <span>{formatUnavailable()}: nenhuma origem tem coleta neste mês.</span>
      </div>
    );
  }
  const rows = orderRows(data);
  const unit = pickUnit(Math.max(1, ...rows.map((row) => row.leads ?? 0)));
  const raised = unit > (UNIT_STEPS[0] ?? 10);
  const leader = rows[0];
  const leaderIcons = Math.floor((leader?.leads ?? 0) / unit);
  const uncollected = rows.filter((row) => row.leads === null).map((row) => row.name.toLowerCase());
  const monthLong = formatMonthLong(month);
  const summary =
    `Pictograma dos leads de ${monthLong} por origem, com 1 ícone para cada ${formatInt(unit)} leads: ` +
    `${leader?.name.toLowerCase() ?? ''} lidera com ${formatInt(leader?.leads ?? 0)} leads em ${formatInt(leaderIcons)} ícones inteiros` +
    (uncollected.length > 0 ? `; ${uncollected.join(' e ')} sem coleta no mês.` : '.');

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col justify-between gap-2', className)} role="figure">
      <ul aria-hidden className="m-0 flex list-none flex-col gap-2 p-0">
        {rows.map((row, rowIndex) => {
          const isLeader = rowIndex === 0;
          const icons = row.leads === null ? 0 : Math.floor(row.leads / unit);
          return (
            <li className="flex flex-col" key={row.id}>
              <span className={cn('text-xs leading-4', isLeader ? 'font-bold text-text-primary' : 'font-medium text-text-secondary')}>
                {row.name}
              </span>
              <span className="grid min-h-4 grid-cols-[minmax(0,1fr)_3rem] items-center gap-x-2">
                {row.leads === null ? (
                  <span className="flex items-center gap-2 text-xs leading-4 text-text-muted">
                    <Unplug aria-hidden className="size-4 shrink-0" strokeWidth={ICON_STROKE} />
                    {formatUnavailable()}
                  </span>
                ) : icons === 0 ? (
                  <span className="text-xs leading-4 text-text-muted">{row.leads === 0 ? 'nenhum lead no mês' : 'menos de um ícone'}</span>
                ) : (
                  <span className="flex flex-wrap">
                    {Array.from({ length: icons }, (_, iconIndex) => (
                      <User aria-hidden className="size-3.5 shrink-0" key={`${row.id}-${String(iconIndex)}`} strokeWidth={ICON_STROKE} style={{ color: ICON_COLOR }} />
                    ))}
                  </span>
                )}
                <span className={cn('font-display text-right text-sm tabular-nums', isLeader ? 'font-bold text-text-primary' : 'font-semibold text-text-secondary')}>
                  {row.leads === null ? '' : formatInt(row.leads)}
                </span>
              </span>
            </li>
          );
        })}
      </ul>

      <p aria-hidden className="m-0 flex items-center gap-2 text-xs leading-5 text-text-muted">
        <User aria-hidden className="size-3.5 shrink-0" strokeWidth={ICON_STROKE} style={{ color: ICON_COLOR }} />
        <span className="tabular-nums">
          {formatInt(1)} ícone = {formatInt(unit)} leads
          {raised ? `, unidade ampliada porque uma fileira passaria de ${formatInt(MAX_ICONS_PER_ROW)} ícones` : ''}
        </span>
        <span className="ml-auto tabular-nums">{formatInt(total)} leads com coleta</span>
      </p>
    </figure>
  );
}
