import { Circle, CircleDashed, Diamond, Filter, Triangle, type LucideIcon } from 'lucide-react';

import { formatDate, formatDays, formatInt } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type HandoffOpportunity, type HandoffQueue } from './data';

/**
 * Estado do aceite no handoff: uma linha por oportunidade, com ponto de silhueta própria por
 * estado, a palavra do estado e os dias úteis ao lado. A regra de corte vem escrita no cabeçalho
 * e só o estado crítico acende; o restante fica em tom neutro para a minoria aparecer.
 */
export interface HandoffStatusProps {
  readonly data?: HandoffQueue;
  readonly className?: string;
}

type State = 'overdue' | 'pending' | 'undated' | 'accepted';

interface StateSpec {
  readonly Icon: LucideIcon;
  /** Triângulo, losango e círculo cheios; só o anel vazado fica sem preenchimento. */
  readonly filled: boolean;
  readonly word: string;
  readonly plural: string;
  readonly toneClass: string;
}

/** O crítico é o único em --negative (COR-6); os demais ficam em --text-muted. */
const STATE: Record<State, StateSpec> = {
  overdue: { Icon: Triangle, filled: true, word: 'fora do prazo', plural: 'fora do prazo', toneClass: 'text-negative' },
  pending: { Icon: Diamond, filled: true, word: 'no prazo', plural: 'pendentes no prazo', toneClass: 'text-text-muted' },
  undated: { Icon: CircleDashed, filled: false, word: 'sem data', plural: 'sem data de handoff', toneClass: 'text-text-muted' },
  accepted: { Icon: Circle, filled: true, word: 'aceito', plural: 'aceitas', toneClass: 'text-text-muted' },
};
/** Ordem de leitura: o crítico no topo (a mensagem na primeira linha). */
const STATE_ORDER: readonly State[] = ['overdue', 'pending', 'undated', 'accepted'];
const ROW_HEIGHT_CLASS = 'h-5.5';
const DAY_MS = 86_400_000;

/** Dias úteis depois do handoff até o fim, contando sábado e domingo como não úteis. */
function businessDaysBetween(from: string, to: string): number {
  const start = Date.parse(`${from}T00:00:00Z`);
  const end = Date.parse(`${to}T00:00:00Z`);
  let count = 0;
  for (let time = start + DAY_MS; time <= end; time += DAY_MS) {
    const weekday = new Date(time).getUTCDay();
    if (weekday !== 0 && weekday !== 6) count += 1;
  }
  return count;
}

interface Row {
  readonly opportunity: HandoffOpportunity;
  readonly state: State;
  /** Dias úteis até o aceite ou até a data de referência; `null` sem data de handoff. */
  readonly days: number | null;
}

function rowOf(opportunity: HandoffOpportunity, referenceDate: string, overdueAfterDays: number): Row {
  if (opportunity.handoffDate === null) return { opportunity, state: 'undated', days: null };
  const days = businessDaysBetween(opportunity.handoffDate, opportunity.acceptedDate ?? referenceDate);
  if (opportunity.acceptedDate !== null) return { opportunity, state: 'accepted', days };
  return { opportunity, state: days > overdueAfterDays ? 'overdue' : 'pending', days };
}

/** Maior espera entre as fora do prazo; `null` quando nenhuma está (EST-1b). */
function longestWait(rows: readonly Row[]): number | null {
  const waits = rows.flatMap((row) => (row.state === 'overdue' && row.days !== null ? [row.days] : []));
  return waits.length === 0 ? null : Math.max(...waits);
}

function StateGlyph({ state }: { state: State }) {
  const { Icon, filled, toneClass } = STATE[state];
  return <Icon aria-hidden className={cn('size-3.5 shrink-0', toneClass, filled && 'fill-current')} strokeWidth={2} />;
}

export default function HandoffStatus({ data = defaultData, className }: HandoffStatusProps) {
  const rows = data.opportunities
    .map((opportunity) => rowOf(opportunity, data.referenceDate, data.overdueAfterDays))
    .sort((a, b) => STATE_ORDER.indexOf(a.state) - STATE_ORDER.indexOf(b.state) || (b.days ?? 0) - (a.days ?? 0));
  const countOf = (state: State) => rows.filter((row) => row.state === state).length;
  const wait = longestWait(rows);
  const rule = `mais de ${formatDays(data.overdueAfterDays)} úteis sem aceite`;

  const summary = [
    `Lista de ${formatInt(rows.length)} oportunidades passadas da pré-vendas, por estado do aceite: `,
    STATE_ORDER.map((state) => `${formatInt(countOf(state))} ${STATE[state].plural}`).join(', '),
    `. Fora do prazo é ${rule}.`,
    wait === null ? '' : ` A espera mais longa é de ${formatDays(wait)} úteis.`,
  ].join('');

  if (rows.length === 0) {
    return (
      <article
        aria-label="Lista de oportunidades do handoff vazia: o recorte não tem oportunidades passadas para o comercial."
        className={cn('flex h-full w-full min-w-0 items-center justify-center rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
        role="status"
      >
        <p className="inline-flex items-center gap-2 text-xs text-text-muted">
          <Filter aria-hidden className="size-4" />
          Nenhuma oportunidade passada no recorte, então não há aceite a cobrar.
        </p>
      </article>
    );
  }

  return (
    <article
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col rounded-lg border border-line-subtle bg-surface-raised p-4', className)}
      role="group"
    >
      <p className="text-xs font-medium text-text-secondary">
        Fora do prazo é <span className="text-negative">{rule}</span>
      </p>
      <p className="mt-1 flex min-w-0 flex-wrap items-center gap-x-4 gap-y-1 text-xs text-text-muted tabular-nums">
        {STATE_ORDER.map((state) => (
          <span className="inline-flex items-center gap-1.5" key={state}>
            <StateGlyph state={state} />
            <span className={cn('kpi-number', state === 'overdue' && 'font-semibold text-negative')}>{formatInt(countOf(state))}</span>
            {STATE[state].plural}
          </span>
        ))}
      </p>

      <div className="mt-3 flex min-w-0 flex-1 flex-col text-xs">
        <div className="flex h-5 min-w-0 items-center gap-3 text-[0.6875rem] text-text-muted">
          <span className="size-3.5 shrink-0" />
          <span className="min-w-0 flex-1">Oportunidade</span>
          <span className="w-24 shrink-0">Estado</span>
          <span className="w-24 shrink-0 text-right">Dias úteis</span>
        </div>
        {rows.map(({ opportunity, state, days }) => {
          const critical = state === 'overdue';
          return (
            <div className={cn('flex min-w-0 items-center gap-3 tabular-nums', ROW_HEIGHT_CLASS)} key={opportunity.id}>
              <StateGlyph state={state} />
              <span className={cn('min-w-0 flex-1', critical ? 'font-semibold text-text-primary' : 'text-text-muted')}>
                {opportunity.name}
              </span>
              <span className={cn('w-24 shrink-0', critical ? 'font-semibold text-negative' : 'text-text-muted')}>{STATE[state].word}</span>
              <span className={cn('w-24 shrink-0 text-right', critical ? 'font-semibold text-negative' : 'text-text-muted')}>
                {days === null ? 'sem contagem' : formatDays(days)}
              </span>
            </div>
          );
        })}
      </div>

      <p className="mt-2 text-[0.6875rem] text-text-muted tabular-nums">
        dias úteis do handoff até o aceite, ou até {formatDate(data.referenceDate)} se pendente
      </p>
    </article>
  );
}
