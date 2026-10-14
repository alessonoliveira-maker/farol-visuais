import { CalendarCheck, FileText, Filter, Mail, Phone, type LucideIcon } from 'lucide-react';

import { formatDate, formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type EventKind, type OpportunityEvent, type OpportunityHistory } from './data';

/**
 * Feed vertical de eventos de uma oportunidade: trilho à esquerda, um marcador com o ícone do tipo
 * e um cartão com título, autor, data absoluta e data relativa. O evento mais recente fica no topo
 * e a ordem vem escrita na linha de leitura. HTML com Tailwind; a data relativa conta sempre contra
 * a data de referência do dado, a mesma para a lista inteira, e a distância vertical entre os
 * cartões não mede duração.
 */
export interface OpportunityFeedProps {
  readonly data?: OpportunityHistory;
  readonly height?: number;
  readonly className?: string;
}

const KIND_ICON: Record<EventKind, LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: CalendarCheck,
  document: FileText,
};

/** Nome do tipo em minúscula, para entrar no meio da frase acessível sem maiúscula solta. */
const KIND_LABEL: Record<EventKind, string> = {
  call: 'ligação',
  email: 'e-mail',
  meeting: 'reunião',
  document: 'documento',
};

const MARKER_ICON_SIZE = 14;
const MS_PER_DAY = 86_400_000;

function dayNumber(iso: string): number {
  const [year = 0, month = 1, day = 1] = iso.slice(0, 10).split('-').map(Number);
  return Date.UTC(year, month - 1, day) / MS_PER_DAY;
}

function daysBefore(iso: string, referenceDate: string): number {
  return dayNumber(referenceDate) - dayNumber(iso);
}

function relativeLabel(days: number): string {
  if (days === 0) return 'na data de referência';
  return `há ${formatDays(days)}`;
}

/** Mais recente primeiro; empate no mesmo dia se resolve pelo id, para a ordem nunca pular. */
function sortNewestFirst(events: readonly OpportunityEvent[]): readonly OpportunityEvent[] {
  return [...events].sort((a, b) => (a.at === b.at ? a.id.localeCompare(b.id) : b.at.localeCompare(a.at)));
}

/** Dias entre o primeiro e o último evento; `null` com menos de dois eventos. */
function spanDays(sorted: readonly OpportunityEvent[]): number | null {
  const newest = sorted[0];
  const oldest = sorted[sorted.length - 1];
  if (newest === undefined || oldest === undefined || sorted.length < 2) return null;
  return dayNumber(newest.at) - dayNumber(oldest.at);
}

export default function OpportunityFeed({ data = defaultData, height, className }: OpportunityFeedProps) {
  const style = height === undefined ? undefined : { height };

  if (data.events.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>{`Nenhum evento registrado para ${data.opportunity} até agora.`}</span>
      </div>
    );
  }

  const sorted = sortNewestFirst(data.events);
  const newest = sorted[0];
  const oldest = sorted[sorted.length - 1];
  const span = spanDays(sorted);
  const count = formatInt(sorted.length);
  const newestAgo = newest === undefined ? 0 : daysBefore(newest.at, data.referenceDate);
  const oldestAgo = oldest === undefined ? 0 : daysBefore(oldest.at, data.referenceDate);

  const reading =
    span === null
      ? `${count} evento, relativo a ${formatDate(data.referenceDate)}`
      : `${count} eventos em ${formatDays(span)}, relativo a ${formatDate(data.referenceDate)}`;

  const summary =
    `Linha do tempo vertical com ${count} eventos da oportunidade ${data.opportunity}, de ${data.company}, do mais recente ao mais antigo. ` +
    `O último, ${newest === undefined ? '' : KIND_LABEL[newest.kind]}, foi ${relativeLabel(newestAgo)}; ` +
    `o primeiro, ${oldest === undefined ? '' : KIND_LABEL[oldest.kind]}, ${relativeLabel(oldestAgo)}.`;

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <p aria-hidden className="mb-3 shrink-0 text-xs font-medium text-text-secondary">
        Do mais recente ao mais antigo
        <span className="font-normal text-text-muted">{` · ${reading}`}</span>
      </p>
      <ol className="relative ms-3 flex flex-col gap-2 border-s border-line-strong">
        {sorted.map((event, index) => {
          const Icon = KIND_ICON[event.kind];
          const isLatest = index === 0;
          const ago = daysBefore(event.at, data.referenceDate);
          return (
            <li className="relative ms-6" key={event.id}>
              {/* O marcador é absoluto sobre o trilho; o fundo do cartão o separa da linha atrás dele. */}
              <span
                className={cn(
                  'absolute -start-[37px] top-2 flex size-6 items-center justify-center rounded-full',
                  isLatest ? 'bg-chart-1' : 'bg-surface-sunken text-text-secondary',
                )}
                style={isLatest ? { color: 'var(--accent-cyan-contrast)' } : undefined}
              >
                <Icon aria-hidden size={MARKER_ICON_SIZE} />
              </span>
              <div className="rounded-md bg-surface-sunken px-3 py-2">
                <div className="flex min-w-0 items-baseline justify-between gap-4">
                  <p className={cn('min-w-0 text-xs text-text-primary', isLatest ? 'font-semibold' : 'font-medium')}>{event.title}</p>
                  <p className="flex shrink-0 gap-1 text-[0.6875rem] text-text-muted tabular-nums">
                    <span className="font-display">{formatDate(event.at)}</span>
                    <span>{`· ${relativeLabel(ago)}`}</span>
                  </p>
                </div>
                <p className="mt-0.5 flex min-w-0 gap-1 text-[0.6875rem] text-text-secondary">
                  <span className="shrink-0 font-medium">{`${event.author} ·`}</span>
                  <span className="min-w-0">{event.detail}</span>
                </p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
