import { AlertTriangle, Filter, Unplug } from 'lucide-react';

import { formatInt, formatMonthShort, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type QueueCapacityBoard } from './data';

/**
 * Filas de pré-vendas contra o teto de capacidade do mês, com a polaridade invertida da família:
 * a barra cheia até o teto é neutra, não sucesso, e o excedente além do teto vira negativo com
 * ícone. O teto de premissa (ainda sem medição fechada) sai com o traço mais apagado e a palavra
 * escrita no rótulo, nunca com a cor de procedência, que é do VisualCard. Fila sem coleta no mês
 * ganha trilho tracejado e "indisponível" no lugar da barra, nunca zero.
 */
export interface QueueCapacityBoardProps {
  readonly data?: QueueCapacityBoard;
  readonly className?: string;
}

/** Folga acima do maior entre teto e demanda medida, para o estouro caber sem sair do trilho. */
const DOMAIN_SLACK = 1.3;

export default function QueueCapacityChart({ data = defaultData, className }: QueueCapacityBoardProps) {
  const { period, queues } = data;

  if (queues.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status">
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma fila neste recorte: não há demanda nem teto medido para {formatMonthShort(period)}.</span>
      </div>
    );
  }

  const measured = queues.filter(
    (queue): queue is typeof queue & { demand: number } => queue.demand !== null,
  );
  const domainMax = Math.max(...queues.map((queue) => queue.cap), ...measured.map((queue) => queue.demand)) * DOMAIN_SLACK;
  const overflowing = measured.filter((queue) => queue.demand > queue.cap);
  const noData = queues.length - measured.length;

  const summary = `Barras de demanda contra teto de capacidade: ${String(queues.length)} filas de pré-vendas em ${formatMonthShort(period)}. ${String(overflowing.length)} acima do teto do mês, ${String(noData)} sem coleta no período. Leitura de estoque no mês, sem tendência entre meses.`;

  return (
    <div
      aria-label={summary}
      className={cn('flex h-full w-full min-w-0 flex-col justify-center gap-3', className)}
      role="table"
    >
      <p aria-hidden className="text-xs text-text-muted">
        demanda contra teto de capacidade, {formatMonthShort(period)}
      </p>

      <div className="flex flex-col gap-3">
        {queues.map((queue) => {
          const capRatio = queue.cap / domainMax;
          const isOver = queue.demand !== null && queue.demand > queue.cap;
          const baseRatio = queue.demand === null ? 0 : Math.min(queue.demand, queue.cap) / domainMax;
          const overRatio = isOver && queue.demand !== null ? (queue.demand - queue.cap) / domainMax : 0;
          const gap = queue.demand === null ? null : queue.cap - queue.demand;
          const isPremissa = queue.capBasis === 'premissa';

          return (
            <div className="flex min-w-0 flex-col gap-1" key={queue.id}>
              <div className="flex items-baseline justify-between gap-2 text-xs">
                <span className="min-w-0 text-text-secondary">{queue.label}</span>
                <span className="shrink-0 text-text-muted">
                  {queue.demand === null ? null : (
                    <>
                      demanda <span className="kpi-number text-text-secondary">{formatInt(queue.demand)}</span>
                      {' · '}
                    </>
                  )}
                  teto <span className="kpi-number">{formatInt(queue.cap)}</span>
                  {isPremissa ? ' (premissa)' : ''}
                </span>
              </div>

              <div className="relative h-3 w-full overflow-hidden rounded-full bg-surface-sunken">
                {queue.demand === null ? (
                  <div className="absolute inset-0 rounded-full border border-dashed border-line-strong" />
                ) : (
                  <>
                    <div
                      className="absolute inset-y-0 left-0 rounded-full"
                      style={{ width: `${String(baseRatio * 100)}%`, backgroundColor: 'var(--text-muted)' }}
                    />
                    {isOver ? (
                      <div
                        className="absolute inset-y-0 rounded-r-full bg-negative"
                        style={{ left: `${String(capRatio * 100)}%`, width: `${String(overRatio * 100)}%` }}
                      />
                    ) : null}
                  </>
                )}
                <div
                  className={cn(
                    'absolute inset-y-[-3px] w-0 border-l border-dashed border-text-muted',
                    isPremissa ? 'opacity-50' : '',
                  )}
                  style={{ left: `${String(capRatio * 100)}%` }}
                />
              </div>

              <p className="text-xs text-text-muted">
                {queue.demand === null ? (
                  <span className="inline-flex items-center gap-1">
                    <Unplug aria-hidden className="size-3.5" strokeWidth={2} />
                    {formatUnavailable()} no período
                  </span>
                ) : isOver ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-negative">
                    <AlertTriangle aria-hidden className="size-3.5" strokeWidth={2.5} />
                    <span className="kpi-number">{formatInt(Math.abs(gap ?? 0))}</span> acima do teto do mês
                  </span>
                ) : (
                  <>
                    faltam <span className="kpi-number text-text-secondary">{formatInt(gap ?? 0)}</span> para o teto do mês
                  </>
                )}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
