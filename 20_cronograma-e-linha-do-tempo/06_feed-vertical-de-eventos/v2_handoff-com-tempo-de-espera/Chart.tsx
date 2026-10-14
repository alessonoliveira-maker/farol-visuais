import { ArrowRightLeft, CalendarCheck, FileText, Filter, Hourglass, Mail, Phone, TriangleAlert, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

import { formatDate, formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type EventKind, type HandoffEvent, type HandoffFeed } from './data';

/**
 * Feed de eventos com foco nas passagens de dono: cada passagem leva ArrowRightLeft em
 * `--chart-1` (`--warning` fica só no alerta) e, no trilho logo acima do cartão, a espera até o novo dono agir. Espera acima do
 * SLA ganha ícone de alerta e o limite escrito, então a cor nunca é o único canal. Com o filtro de
 * passagens ligado, os demais eventos descem para `text-text-muted` sem sumir do trilho.
 */
export interface HandoffFeedProps {
  readonly data?: HandoffFeed;
  /** Estado inicial do filtro; a partir daí o botão do próprio componente decide. */
  readonly handoffOnly?: boolean;
  readonly height?: number;
  readonly className?: string;
}

const KIND_ICON: Record<EventKind, LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: CalendarCheck,
  document: FileText,
  handoff: ArrowRightLeft,
};

const MARKER_ICON_SIZE = 14;
const MS_PER_DAY = 86_400_000;

interface Wait {
  readonly days: number;
  /** Verdadeiro quando o novo dono ainda não agiu e a conta vai até a data de referência. */
  readonly open: boolean;
}

function dayNumber(iso: string): number {
  const [year = 0, month = 1, day = 1] = iso.slice(0, 10).split('-').map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function sortOldestFirst(events: readonly HandoffEvent[]): readonly HandoffEvent[] {
  return [...events].sort((a, b) => (a.at === b.at ? a.id.localeCompare(b.id) : a.at.localeCompare(b.at)));
}

/** Espera de uma passagem: até o primeiro evento do novo dono depois dela; sem passagem, `null`. */
function waitOf(event: HandoffEvent, chronological: readonly HandoffEvent[], referenceDate: string): Wait | null {
  if (event.kind !== 'handoff' || event.receiver === undefined) return null;
  const resumed = chronological.find((other) => other.at >= event.at && other.id !== event.id && other.author === event.receiver);
  if (resumed === undefined) return { days: dayNumber(referenceDate) - dayNumber(event.at), open: true };
  return { days: dayNumber(resumed.at) - dayNumber(event.at), open: false };
}

/** Maior espera da lista; `null` quando não há nenhuma passagem. */
function longestWait(waits: readonly Wait[]): number | null {
  if (waits.length === 0) return null;
  return waits.reduce((max, wait) => Math.max(max, wait.days), 0);
}

export default function HandoffFeedChart({ data = defaultData, handoffOnly = true, height, className }: HandoffFeedProps) {
  const [filterOn, setFilterOn] = useState(handoffOnly);
  const style = height === undefined ? undefined : { height };

  if (data.events.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>{`Nenhuma passagem de dono registrada para ${data.opportunity}.`}</span>
      </div>
    );
  }

  const chronological = sortOldestFirst(data.events);
  const newestFirst = [...chronological].reverse();
  const waits = new Map(
    chronological.flatMap((event): [string, Wait][] => {
      const wait = waitOf(event, chronological, data.referenceDate);
      return wait === null ? [] : [[event.id, wait]];
    }),
  );
  const waitList = [...waits.values()];
  const overSla = waitList.filter((wait) => wait.days > data.slaDays).length;
  const longest = longestWait(waitList);
  const handoffCount = waitList.length;

  const summary =
    `Linha do tempo vertical com ${formatInt(data.events.length)} eventos de ${data.opportunity}, ${formatInt(handoffCount)} deles passagens de dono. ` +
    `${formatInt(overSla)} esperas passaram do limite de ${formatDays(data.slaDays)}` +
    (longest === null ? '.' : `; a maior ficou sem dono por ${formatDays(longest)}.`);

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <div className="mb-3 flex shrink-0 items-center justify-between gap-4">
        <p aria-hidden className="min-w-0 text-xs font-medium text-text-secondary">
          {`${formatInt(overSla)} de ${formatInt(handoffCount)} esperas acima de ${formatDays(data.slaDays)}`}
          <span className="font-normal text-text-muted">{' · mais recente no topo'}</span>
        </p>
        <button
          aria-pressed={filterOn}
          className={cn(
            'flex shrink-0 items-center gap-1 rounded-md px-2 py-1 text-[0.6875rem] font-medium',
            filterOn ? 'bg-surface-sunken text-text-primary' : 'text-text-muted',
          )}
          onClick={() => {
            setFilterOn((current) => !current);
          }}
          type="button"
        >
          <Filter aria-hidden className="size-3" />
          {filterOn ? 'Destacando passagens' : 'Destacar passagens'}
        </button>
      </div>
      <ol className="relative ms-3 flex flex-col border-s border-line-strong">
        {newestFirst.map((event) => {
          const Icon = KIND_ICON[event.kind];
          const isHandoff = event.kind === 'handoff';
          const muted = filterOn && !isHandoff;
          const wait = waits.get(event.id);
          const over = wait !== undefined && wait.days > data.slaDays;
          return (
            <li className="ms-6 pb-2" key={event.id}>
              {wait === undefined ? null : (
                <p className="mb-1 flex items-center gap-1 text-[0.6875rem] text-text-secondary">
                  {over ? (
                    <TriangleAlert aria-hidden className="size-3.5 shrink-0 text-warning" />
                  ) : (
                    <Hourglass aria-hidden className="size-3.5 shrink-0 text-text-muted" />
                  )}
                  <span className="font-display font-medium tabular-nums">{formatDays(wait.days)}</span>
                  <span className={cn(over && 'text-text-primary')}>
                    {`${wait.open ? 'sem dono até agora' : 'sem dono'}${over ? `, acima do limite de ${formatDays(data.slaDays)}` : ''}`}
                  </span>
                </p>
              )}
              <div className="relative">
                {/* O marcador é absoluto sobre o trilho, alinhado ao topo do cartão e não da espera. */}
                <span
                  className={cn(
                    'absolute -start-[37px] top-2 flex size-6 items-center justify-center rounded-full',
                    isHandoff ? 'bg-chart-1' :'bg-surface-sunken',
                    !isHandoff && (muted ? 'text-text-muted' : 'text-text-secondary'),
                  )}
                  style={isHandoff ? { color: 'var(--accent-cyan-contrast)' } : undefined}
                >
                  <Icon aria-hidden size={MARKER_ICON_SIZE} />
                </span>
                <div className="rounded-md bg-surface-sunken px-3 py-2">
                  <div className="flex min-w-0 items-baseline justify-between gap-4">
                    <p
                      className={cn(
                        'min-w-0 text-xs',
                        isHandoff ? 'font-semibold text-text-primary' : cn('font-medium', muted ? 'text-text-muted' : 'text-text-primary'),
                      )}
                    >
                      {event.title}
                    </p>
                    <p className="shrink-0 font-display text-[0.6875rem] text-text-muted tabular-nums">{formatDate(event.at)}</p>
                  </div>
                  <p className={cn('mt-0.5 text-[0.6875rem]', muted ? 'text-text-muted' : 'text-text-secondary')}>{event.detail}</p>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
