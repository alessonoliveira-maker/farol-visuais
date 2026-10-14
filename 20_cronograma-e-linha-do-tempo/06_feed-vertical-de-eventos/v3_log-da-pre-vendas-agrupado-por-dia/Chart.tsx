import { CalendarCheck, Filter, Mail, NotebookPen, Phone, type LucideIcon } from 'lucide-react';
import { useState } from 'react';

import { formatDate, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type Activity, type ActivityKind, type ActivityLog } from './data';

/**
 * Log de atividades agrupado por dia, com o dia mais recente no topo. Cada dia tem cabeçalho
 * sticky com a contagem por tipo em chips, mostra as três primeiras atividades do filtro e resume
 * o resto em "mais N". O filtro por tipo nunca esconde que existem outras atividades: a conta das
 * que ficaram de fora vem escrita em cada dia. Para centenas de dias, o log pede janela de itens
 * (por exemplo @tanstack/react-virtual com estimateSize por tipo de item: cabeçalho de dia, linha
 * de atividade e linha de resumo), mas essa biblioteca fica fora da lista de imports do catálogo.
 */
export interface ActivityLogFeedProps {
  readonly data?: ActivityLog;
  /** Filtro do primeiro desenho; a partir daí o estado é do próprio componente. */
  readonly initialFilter?: ActivityKind | 'all';
  readonly height?: number;
  readonly className?: string;
}

const KINDS: readonly ActivityKind[] = ['call', 'email', 'meeting', 'note'];
const KIND_ICON: Record<ActivityKind, LucideIcon> = {
  call: Phone,
  email: Mail,
  meeting: CalendarCheck,
  note: NotebookPen,
};
const KIND_PLURAL: Record<ActivityKind, string> = { call: 'Ligações', email: 'E-mails', meeting: 'Reuniões', note: 'Notas' };

const VISIBLE_PER_DAY = 3;
const WEEKDAY = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'] as const;

interface DayGroup {
  readonly day: string;
  readonly items: readonly Activity[];
}

function weekdayOf(iso: string): string {
  const [year = 0, month = 1, day = 1] = iso.slice(0, 10).split('-').map(Number);
  return WEEKDAY[new Date(Date.UTC(year, month - 1, day)).getUTCDay()] ?? '';
}

/** Dias do mais recente para o mais antigo; dentro do dia, a última atividade registrada primeiro. */
function groupByDay(activities: readonly Activity[]): readonly DayGroup[] {
  const days = [...new Set(activities.map((activity) => activity.day))].sort((a, b) => b.localeCompare(a));
  return days.map((day) => ({
    day,
    items: activities.filter((activity) => activity.day === day).sort((a, b) => b.id.localeCompare(a.id)),
  }));
}

function countOf(items: readonly Activity[], kind: ActivityKind): number {
  return items.filter((item) => item.kind === kind).length;
}

/** Dia com mais atividades; `null` sem nenhum dia. Em empate vale o mais recente. */
function busiestDay(groups: readonly DayGroup[]): DayGroup | null {
  return groups.reduce<DayGroup | null>((best, group) => (best === null || group.items.length > best.items.length ? group : best), null);
}

function activityWord(count: number): string {
  return count === 1 ? 'atividade' : 'atividades';
}

export default function ActivityLogFeed({ data = defaultData, initialFilter = 'all', height, className }: ActivityLogFeedProps) {
  const [filter, setFilter] = useState<ActivityKind | 'all'>(initialFilter);
  const style = height === undefined ? undefined : { height };

  if (data.activities.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma atividade registrada pela pré-vendas neste período.</span>
      </div>
    );
  }

  const groups = groupByDay(data.activities);
  const busiest = busiestDay(groups);
  const total = data.activities.length;
  const period = `${formatDate(data.from)} a ${formatDate(data.to)}`;

  const summary =
    `Log vertical com ${formatInt(total)} atividades da pré-vendas de ${period}, agrupadas em ${formatInt(groups.length)} dias. ` +
    (busiest === null ? '' : `O dia mais cheio foi ${formatDate(busiest.day)}, com ${formatInt(busiest.items.length)}; cada dia mostra ${formatInt(VISIBLE_PER_DAY)} e resume as demais.`);

  return (
    <div aria-label={summary} className={cn('flex h-full w-full min-w-0 flex-col', className)} role="group" style={style}>
      <p aria-hidden className="mb-2 shrink-0 text-xs font-medium text-text-secondary">
        {`${formatInt(total)} atividades de ${period}`}
        <span className="font-normal text-text-muted">{' · dia mais recente no topo'}</span>
      </p>
      <div className="mb-2 flex shrink-0 flex-wrap items-center gap-1" role="group" aria-label="Filtrar por tipo de atividade">
        {(['all', ...KINDS] as const).map((option) => {
          const active = filter === option;
          const Icon = option === 'all' ? Filter : KIND_ICON[option];
          const count = option === 'all' ? total : countOf(data.activities, option);
          return (
            <button
              aria-pressed={active}
              className={cn(
                'flex items-center gap-1 rounded-md px-2 py-1 text-[0.6875rem]',
                active ? 'bg-surface-sunken font-semibold text-text-primary' : 'font-medium text-text-secondary',
              )}
              key={option}
              onClick={() => {
                setFilter(option);
              }}
              type="button"
            >
              <Icon aria-hidden className="size-3" />
              {option === 'all' ? 'Todas' : KIND_PLURAL[option]}
              <span className="font-display tabular-nums">{formatInt(count)}</span>
            </button>
          );
        })}
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto">
        {groups.map((group) => {
          const matching = filter === 'all' ? group.items : group.items.filter((item) => item.kind === filter);
          const shown = matching.slice(0, VISIBLE_PER_DAY);
          const rest = matching.length - shown.length;
          const filteredOut = group.items.length - matching.length;
          return (
            <section className="mb-2" key={group.day}>
              {/* Cabeçalho sticky com fundo do cartão: sem ele a lista rolando passa por baixo do texto. */}
              <header className="sticky top-0 z-10 flex items-center justify-between gap-4 bg-surface-raised py-1">
                <h3 className="text-xs font-semibold text-text-primary">
                  {`${weekdayOf(group.day)}, `}
                  <span className="font-display tabular-nums">{formatDate(group.day)}</span>
                </h3>
                <p className="flex items-center gap-3 text-[0.6875rem] text-text-muted">
                  {KINDS.map((kind) => {
                    const Icon = KIND_ICON[kind];
                    return (
                      <span className="flex items-center gap-1" key={kind}>
                        <Icon aria-hidden className="size-3" />
                        <span className="font-display tabular-nums">{formatInt(countOf(group.items, kind))}</span>
                      </span>
                    );
                  })}
                  <span className="font-display text-text-secondary tabular-nums">{`${formatInt(group.items.length)} ${activityWord(group.items.length)}`}</span>
                </p>
              </header>
              <ul className="ms-3 flex flex-col gap-1 border-s border-line-strong">
                {shown.map((item) => {
                  const Icon = KIND_ICON[item.kind];
                  return (
                    <li className="relative ms-6" key={item.id}>
                      <span className="absolute -start-[34px] top-0.5 flex size-5 items-center justify-center rounded-full bg-surface-sunken text-text-secondary">
                        <Icon aria-hidden className="size-3" />
                      </span>
                      <div className="flex min-w-0 items-baseline justify-between gap-4 rounded-md bg-surface-sunken px-2 py-1">
                        <p className="min-w-0 text-xs font-medium text-text-primary">{item.title}</p>
                        <p className="shrink-0 text-[0.6875rem] text-text-muted">{`${item.queue} · ${item.author}`}</p>
                      </div>
                    </li>
                  );
                })}
                {shown.length === 0 ? (
                  <li className="ms-6 text-[0.6875rem] text-text-muted">Nenhuma atividade deste tipo neste dia.</li>
                ) : null}
                {rest > 0 || filteredOut > 0 ? (
                  <li className="ms-6 text-[0.6875rem] text-text-muted">
                    {rest > 0 ? `mais ${formatInt(rest)} ${activityWord(rest)}` : ''}
                    {rest > 0 && filteredOut > 0 ? ' · ' : ''}
                    {filteredOut > 0 ? `${formatInt(filteredOut)} de outros tipos fora do filtro` : ''}
                  </li>
                ) : null}
              </ul>
            </section>
          );
        })}
      </div>
    </div>
  );
}
