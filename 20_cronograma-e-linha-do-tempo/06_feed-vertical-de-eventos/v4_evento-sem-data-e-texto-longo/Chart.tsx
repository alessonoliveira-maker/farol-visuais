import { CalendarCheck, CircleHelp, Filter, Mail, NotebookPen, Phone, Unplug, type LucideIcon } from 'lucide-react';
import { useId, useState } from 'react';

import { formatDate, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type EventKind, type ImportedEvent, type ImportedHistory } from './data';

/**
 * Feed de eventos de um histórico importado, com os três defeitos que a importação deixa: evento
 * sem data (vai para o fim, sob o rótulo "data desconhecida", fora da ordem cronológica), autor
 * ausente (escrito com `formatUnavailable`, nunca um campo vazio) e anotação longa (resumida em
 * três linhas por `line-clamp-3`, com o texto inteiro no DOM e um botão "ver mais"). Eventos no
 * mesmo minuto mantêm a ordem do id, então a lista nunca troca de lugar entre dois desenhos.
 */
export interface ImportedFeedProps {
  readonly data?: ImportedHistory;
  readonly height?: number;
  readonly className?: string;
}

const KIND_ICON: Record<EventKind, LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: CalendarCheck,
  note: NotebookPen,
};

const MARKER_ICON_SIZE = 14;
/** Anotação acima disso (caracteres) ultrapassa as três linhas da largura do cartão e ganha o botão. */
const LONG_NOTE_MIN_CHARS = 240;

/** Datados do mais recente ao mais antigo, empate pelo id; sem data por último, também pelo id. */
function orderEvents(events: readonly ImportedEvent[]): readonly ImportedEvent[] {
  const dated = events.filter((event) => event.at !== null);
  const undated = events.filter((event) => event.at === null);
  dated.sort((a, b) => ((a.at ?? '') === (b.at ?? '') ? a.id.localeCompare(b.id) : (b.at ?? '').localeCompare(a.at ?? '')));
  undated.sort((a, b) => a.id.localeCompare(b.id));
  return [...dated, ...undated];
}

/** Quantos eventos datados dividem o mesmo minuto com outro; `null` quando não há datado. */
function sharedMinuteCount(events: readonly ImportedEvent[]): number | null {
  const stamps = events.flatMap((event) => (event.at === null ? [] : [event.at]));
  if (stamps.length === 0) return null;
  return stamps.filter((stamp) => stamps.filter((other) => other === stamp).length > 1).length;
}

function longestNote(events: readonly ImportedEvent[]): number | null {
  const lengths = events.flatMap((event) => (event.detail === undefined ? [] : [event.detail.length]));
  if (lengths.length === 0) return null;
  return Math.max(...lengths);
}

export default function ImportedEventFeed({ data = defaultData, height, className }: ImportedFeedProps) {
  const [openIds, setOpenIds] = useState<readonly string[]>([]);
  const baseId = useId();
  const style = height === undefined ? undefined : { height };

  if (data.events.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>{`Nenhum evento importado para ${data.opportunity}.`}</span>
      </div>
    );
  }

  const ordered = orderEvents(data.events);
  const undatedCount = ordered.filter((event) => event.at === null).length;
  const noAuthorCount = ordered.filter((event) => event.author === null).length;
  const sameMinute = sharedMinuteCount(ordered);
  const longest = longestNote(ordered);

  const summary =
    `Linha do tempo vertical com ${formatInt(ordered.length)} eventos importados de ${data.opportunity}, do mais recente ao mais antigo. ` +
    `${formatInt(undatedCount)} ${undatedCount === 1 ? 'não tem data e fica' : 'não têm data e ficam'} no fim, ${formatInt(noAuthorCount)} sem autor registrado` +
    (longest !== null && longest >= LONG_NOTE_MIN_CHARS ? `; a anotação mais longa tem ${formatInt(longest)} caracteres e aparece resumida.` : '.');

  const reading = [
    'Do mais recente para o mais antigo',
    sameMinute !== null && sameMinute > 0 ? `${formatInt(sameMinute)} no mesmo minuto seguem a ordem do registro` : null,
  ]
    .filter((part): part is string => part !== null)
    .join(' · ');

  function toggle(id: string) {
    setOpenIds((current) => (current.includes(id) ? current.filter((openId) => openId !== id) : [...current, id]));
  }

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <p aria-hidden className="mb-3 shrink-0 text-xs font-medium text-text-secondary">
        {data.opportunity}
        <span className="font-normal text-text-muted">{` · ${reading}`}</span>
      </p>
      <ol className="relative ms-3 flex flex-col gap-2 border-s border-line-strong">
        {ordered.map((event) => {
          const Icon = event.at === null ? CircleHelp : KIND_ICON[event.kind];
          const detail = event.detail;
          const isLong = detail !== undefined && detail.length >= LONG_NOTE_MIN_CHARS;
          const isOpen = openIds.includes(event.id);
          const detailId = `${baseId}-detail-${event.id}`;
          return (
            <li className="relative ms-6" key={event.id}>
              <span
                className={cn(
                  'absolute -start-[37px] top-2 flex size-6 items-center justify-center rounded-full text-text-secondary',
                  event.at === null ? 'border border-dashed border-line-strong bg-surface-raised' : 'bg-surface-sunken',
                )}
              >
                <Icon aria-hidden size={MARKER_ICON_SIZE} />
              </span>
              <div className="rounded-md bg-surface-sunken px-3 py-2">
                <div className="flex min-w-0 items-baseline justify-between gap-4">
                  <p className="min-w-0 text-xs font-medium text-text-primary">{event.title}</p>
                  <p className="flex shrink-0 items-center gap-1 text-[0.6875rem] text-text-muted">
                    {event.author === null ? (
                      <>
                        <Unplug aria-hidden className="size-3" />
                        <span>{`autor ${formatUnavailable().toLowerCase()}`}</span>
                      </>
                    ) : (
                      <span className="font-medium text-text-secondary">{event.author}</span>
                    )}
                    <span>{' · '}</span>
                    {event.at === null ? (
                      <span className="font-medium text-text-secondary">data desconhecida</span>
                    ) : (
                      <span className="font-display tabular-nums">{formatDate(event.at)}</span>
                    )}
                  </p>
                </div>
                {detail === undefined ? null : (
                  <>
                    <p className={cn('mt-0.5 text-[0.6875rem] text-text-secondary', isLong && !isOpen && 'line-clamp-3')} id={detailId}>
                      {detail}
                    </p>
                    {isLong ? (
                      <button
                        aria-controls={detailId}
                        aria-expanded={isOpen}
                        className="mt-1 text-[0.6875rem] font-semibold text-text-primary underline decoration-text-muted underline-offset-4"
                        onClick={() => {
                          toggle(event.id);
                        }}
                        type="button"
                      >
                        {isOpen ? 'ver menos' : `ver mais, ${formatInt(detail.length)} caracteres`}
                      </button>
                    ) : null}
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
