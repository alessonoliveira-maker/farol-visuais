import { ArrowDownRight, ChevronDown, ChevronRight } from 'lucide-react';

import { formatInt, formatMonthLong, formatMonthShort, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MediaFunnelComparison } from './data';

/**
 * A mesma faixa de cartões do funil de mídia, com cada chip de taxa de passo comparado
 * contra o mês anterior. Só o passo que piorou além do limiar muda de cor; os demais ficam
 * neutros para o destaque não competir. HTML com Tailwind.
 */
export interface MediaFunnelDeltaCardsProps {
  readonly data?: MediaFunnelComparison;
  readonly height?: number;
  readonly className?: string;
}

const MICROBAR_MIN_PX = 2;

interface Passage {
  readonly fromLabel: string;
  readonly toLabel: string;
  readonly currentRate: number;
  readonly previousRate: number;
  readonly deltaPoints: number;
  readonly worsened: boolean;
}

export default function MediaFunnelDeltaCards({ data = defaultData, height, className }: MediaFunnelDeltaCardsProps) {
  const { stages, currentMonth, previousMonth, worsenedThresholdPoints } = data;
  const first = stages[0];

  const passages: (Passage | null)[] = stages.map((stage, index) => {
    const next = stages[index + 1];
    if (!next) return null;
    const currentRate = stage.current > 0 ? next.current / stage.current : 0;
    const previousRate = stage.previous > 0 ? next.previous / stage.previous : 0;
    const deltaPoints = (currentRate - previousRate) * 100;
    return { fromLabel: stage.label, toLabel: next.label, currentRate, previousRate, deltaPoints, worsened: deltaPoints <= -worsenedThresholdPoints };
  });
  const worsenedPassage = passages.find((passage) => passage?.worsened) ?? null;

  const summary = [
    `Funil em cartões comparando ${formatMonthLong(currentMonth)} contra ${formatMonthLong(previousMonth)} em ${String(stages.length)} etapas de mídia paga.`,
    worsenedPassage
      ? `A passagem de ${worsenedPassage.fromLabel} para ${worsenedPassage.toLabel} piorou de ${formatPercent(worsenedPassage.previousRate)} para ${formatPercent(worsenedPassage.currentRate)}, uma queda de ${formatPercent(Math.abs(worsenedPassage.deltaPoints) / 100)}.`
      : `Nenhuma passagem piorou mais que ${formatPercent(worsenedThresholdPoints / 100)} contra o mês anterior.`,
    'As demais passagens seguem dentro do esperado.',
  ].join(' ');

  return (
    <div
      aria-label={summary}
      className={cn('@container flex h-full w-full min-w-0 flex-col justify-center', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <div className="flex flex-col gap-2 @sm:flex-row @sm:items-stretch @sm:gap-1.5">
        {stages.map((stage, index) => {
          const passage = passages[index];
          const pct = first && first.current > 0 ? (stage.current / first.current) * 100 : 0;
          return (
            <div className="contents" key={stage.id}>
              <div className="min-w-0 flex-1 rounded-lg border border-line-subtle bg-surface-raised p-3">
                <p className="text-xs font-medium text-text-secondary">{stage.label}</p>
                <p className="kpi-number mt-1 text-xl leading-none font-semibold text-text-primary">{formatInt(stage.current)}</p>
                <p className="mt-1 text-[0.6875rem] text-text-muted">{stage.unit}</p>
                <div aria-hidden className="mt-2 h-1 rounded-full bg-surface-sunken">
                  <div className="h-1 rounded-full bg-chart-1" style={{ minWidth: MICROBAR_MIN_PX, width: `${String(pct)}%` }} />
                </div>
              </div>
              {passage ? (
                <div className="flex shrink-0 items-center justify-center gap-1 @sm:w-24 @sm:flex-col">
                  <ChevronDown aria-hidden className="size-4 shrink-0 text-text-muted @sm:hidden" />
                  <ChevronRight aria-hidden className="hidden size-4 shrink-0 text-text-muted @sm:block" />
                  {passage.worsened ? (
                    <span className="flex flex-col items-center gap-0.5 text-center">
                      <span className="inline-flex items-center gap-0.5 font-semibold text-negative">
                        <ArrowDownRight aria-hidden className="size-3" strokeWidth={2.5} />
                        <span className="kpi-number text-[0.6875rem]">
                          {formatRateWithVolume(stages[index + 1]?.current ?? 0, stage.current)}
                        </span>
                      </span>
                      <span className="kpi-number text-[0.6875rem] text-text-muted">
                        contra {formatPercent(passage.previousRate)} em {formatMonthShort(previousMonth)}
                      </span>
                    </span>
                  ) : (
                    <span className="kpi-number text-center text-[0.6875rem] font-semibold text-text-secondary">
                      {formatRateWithVolume(stages[index + 1]?.current ?? 0, stage.current)}
                    </span>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
