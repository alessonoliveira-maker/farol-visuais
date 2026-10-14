import { Clock, Filter, Unplug } from 'lucide-react';

import { formatCurrencyCompact, formatDays, formatHours, formatInt, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QueueLead } from './data';

/**
 * Fila da SDR em quatro caixas de Eisenhower, derivadas por regra de SLA e valor potencial: fazer
 * agora, agendar, redistribuir e descartar. Cada caixa traz a contagem com os vencidos, até seis
 * cartões por vencimento e o resto como +n. Lead sem valor potencial não cai em caixa nenhuma:
 * fica numa faixa própria, para não engordar descartar.
 */
export interface SdrEisenhowerQueueProps {
  readonly data?: readonly QueueLead[];
  readonly height?: number;
  readonly className?: string;
}

/** Urgente é SLA que vence em até 24 h ou que já venceu. */
const URGENT_HOURS = 24;
/** Valor alto é potencial a partir de R$ 50 mil. */
const HIGH_VALUE = 50_000;
const MAX_CARDS = 6;
const GAP = 8;
/** Acima de 48 h o prazo passa a dias, que é como a SDR planeja. */
const DAYS_FROM_HOURS = 48;

type BoxId = 'do' | 'schedule' | 'reassign' | 'drop';

interface BoxSpec {
  readonly id: BoxId;
  readonly verb: string;
  readonly valueLabel: string;
  readonly urgent: boolean;
  readonly high: boolean;
}

/** Ordem de leitura: urgente à esquerda, valor alto em cima, e a caixa melhor no canto de cima à esquerda. */
const BOXES: readonly BoxSpec[] = [
  { id: 'do', verb: 'Fazer agora', valueLabel: 'valor alto', urgent: true, high: true },
  { id: 'schedule', verb: 'Agendar', valueLabel: 'valor alto', urgent: false, high: true },
  { id: 'reassign', verb: 'Redistribuir', valueLabel: 'valor baixo', urgent: true, high: false },
  { id: 'drop', verb: 'Descartar', valueLabel: 'valor baixo', urgent: false, high: false },
];

/** Prazo escrito: "há 3 h" quando venceu, "em 6 h" ou "em 5 dias" quando falta. */
function slaText(hours: number): string {
  const abs = Math.abs(hours);
  const span = abs > DAYS_FROM_HOURS ? formatDays(Math.round(abs / 24)) : formatHours(abs);
  return hours < 0 ? `há ${span}` : `em ${span}`;
}

function plural(count: number, one: string, many: string): string {
  return `${formatInt(count)} ${count === 1 ? one : many}`;
}

/** A caixa nasce da regra: nunca do dado. `null` é lead sem valor, que vai para a faixa própria. */
function boxOf(lead: QueueLead): BoxId | null {
  if (lead.value === null) return null;
  const urgent = lead.slaHours <= URGENT_HOURS;
  const high = lead.value >= HIGH_VALUE;
  if (urgent) return high ? 'do' : 'reassign';
  return high ? 'schedule' : 'drop';
}

const bySla = (a: QueueLead, b: QueueLead): number => a.slaHours - b.slaHours || a.id.localeCompare(b.id);

export default function SdrEisenhowerQueue({ data = defaultData, height, className }: SdrEisenhowerQueueProps) {
  if (data.length === 0) {
    return (
      <div
        className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)}
        role="status"
        style={height === undefined ? undefined : { height }}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhum lead na fila neste recorte: não há o que distribuir.</span>
      </div>
    );
  }

  const groups = BOXES.map((spec) => ({
    spec,
    leads: data.filter((lead) => boxOf(lead) === spec.id).sort(bySla),
  }));
  const unvalued = data.filter((lead) => boxOf(lead) === null).sort(bySla);
  const overdueOf = (leads: readonly QueueLead[]) => leads.filter((lead) => lead.slaHours < 0).length;

  const doNow = groups[0];
  const summary =
    `Fila de ${formatInt(data.length)} leads em quatro caixas por SLA e valor potencial. ` +
    `Fazer agora tem ${plural(doNow?.leads.length ?? 0, 'lead', 'leads')}, ${formatInt(overdueOf(doNow?.leads ?? []))} vencidos. ` +
    `${plural(unvalued.length, 'lead sem valor potencial fica', 'leads sem valor potencial ficam')} fora das caixas.`;

  return (
    <figure
      aria-label={summary}
      className={cn('@container m-0 flex h-full w-full min-w-0 flex-col', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <div className="grid shrink-0 grid-cols-2 pb-1 text-[11px] font-medium text-text-muted" style={{ columnGap: GAP }}>
        <span>Vence em até {formatHours(URGENT_HOURS)} ou já venceu</span>
        <span>Vence depois de {formatHours(URGENT_HOURS)}</span>
      </div>

      <div className="grid min-h-0 flex-1 grid-cols-2 grid-rows-2" style={{ gap: GAP }}>
        {groups.map(({ spec, leads }) => {
          const overdue = overdueOf(leads);
          const shown = leads.slice(0, MAX_CARDS);
          const hidden = leads.length - shown.length;
          return (
            <section
              aria-label={`${spec.verb}, ${spec.valueLabel}: ${plural(leads.length, 'lead', 'leads')}`}
              className="flex min-w-0 flex-col gap-1 bg-surface-sunken px-2 py-1.5"
              key={spec.id}
            >
              <header className="flex flex-col">
                <span className="flex items-baseline justify-between gap-2">
                  <span className="text-xs font-bold text-text-primary">{spec.verb}</span>
                  <span className="text-[11px] text-text-muted">{spec.valueLabel}</span>
                </span>
                <span className="text-[11px] text-text-secondary">
                  {plural(leads.length, 'lead', 'leads')}
                  {overdue > 0 ? `, sendo ${plural(overdue, 'vencido', 'vencidos')}` : ''}
                </span>
              </header>
              {leads.length === 0 ? <span className="text-[11px] text-text-muted">Nenhum lead nesta caixa.</span> : null}
              <ul className="m-0 flex list-none flex-col p-0">
                {shown.map((lead) => (
                  <li className="flex items-center gap-2 py-px text-[11px]" key={lead.id}>
                    <span className="min-w-0 flex-1 whitespace-nowrap text-text-secondary">{lead.name}</span>
                    <span className="font-display tabular-nums text-text-muted">
                      {lead.value === null ? formatUnavailable() : formatCurrencyCompact(lead.value)}
                    </span>
                    <span
                      className={cn(
                        'flex w-[68px] shrink-0 items-center justify-end gap-1 font-display tabular-nums',
                        lead.slaHours < 0 ? 'font-semibold text-text-primary' : 'text-text-muted',
                      )}
                    >
                      {lead.slaHours < 0 ? <Clock aria-label="SLA vencido" className="size-3 shrink-0 text-chart-3" role="img" /> : null}
                      {slaText(lead.slaHours)}
                    </span>
                  </li>
                ))}
              </ul>
              {hidden > 0 ? (
                <span className="font-display text-[11px] tabular-nums text-text-muted">+{formatInt(hidden)} {hidden === 1 ? 'lead' : 'leads'}</span>
              ) : null}
            </section>
          );
        })}
      </div>

      <div
        className="mt-2 flex shrink-0 items-center gap-2 border border-dashed border-line-strong px-2 py-1 text-[11px] text-text-secondary"
        role="group"
        aria-label="Leads sem valor potencial"
      >
        <Unplug aria-hidden className="size-3 shrink-0 text-text-muted" />
        <span>
          {plural(unvalued.length, 'lead sem valor potencial', 'leads sem valor potencial')}
          {overdueOf(unvalued) > 0 ? `, sendo ${plural(overdueOf(unvalued), 'vencido', 'vencidos')}` : ''}: fora das caixas, a estimar.
        </span>
      </div>

      <p aria-hidden className="mt-2 shrink-0 text-[11px] text-text-muted">
        Regra: urgente é SLA em até {formatHours(URGENT_HOURS)}; valor alto, a partir de {formatCurrencyCompact(HIGH_VALUE)}. Por vencimento.
      </p>
    </figure>
  );
}
