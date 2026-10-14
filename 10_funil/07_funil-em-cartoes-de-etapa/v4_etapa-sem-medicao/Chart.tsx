import { Unplug } from 'lucide-react';

import { formatInt, formatMonthLong, formatRateWithVolume, formatUnavailable } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type MediaFunnelWithGap } from './data';

/**
 * A mesma faixa de cartões do funil de mídia, com uma etapa sem evento de conversão
 * configurado: o cartão dela escreve indisponível em vez de zero, sem microbarra, e as duas
 * taxas vizinhas ficam indisponíveis por falta de base, nunca caem para zero. HTML com
 * Tailwind.
 */
export interface MediaFunnelGapCardsProps {
  readonly data?: MediaFunnelWithGap;
  readonly height?: number;
  readonly className?: string;
}

const MICROBAR_MIN_PX = 2;

export default function MediaFunnelGapCards({ data = defaultData, height, className }: MediaFunnelGapCardsProps) {
  const { stages, platform, missingReason } = data;
  const first = stages.find((stage) => stage.value !== null);
  const missingStage = stages.find((stage) => stage.value === null);

  const summary =
    `Funil em cartões de mídia paga da plataforma ${platform} em ${formatMonthLong(data.month)}. ` +
    (missingStage
      ? `A etapa ${missingStage.label} está ${formatUnavailable()}: ${missingReason}. As duas taxas vizinhas também ficam ${formatUnavailable()}, nunca zero.`
      : 'Todas as etapas estão medidas nesta plataforma.');

  return (
    <div
      aria-label={summary}
      className={cn('@container flex h-full w-full min-w-0 flex-col justify-center', className)}
      role="group"
      style={height === undefined ? undefined : { height }}
    >
      <div className="flex flex-col gap-2 @sm:flex-row @sm:items-stretch @sm:gap-1.5">
        {stages.map((stage, index) => {
          const nextStage = stages[index + 1];
          const pct = first && first.value !== null && first.value > 0 && stage.value !== null ? (stage.value / first.value) * 100 : 0;
          const rateAvailable = nextStage && stage.value !== null && nextStage.value !== null;
          return (
            <div className="contents" key={stage.id}>
              <div className="min-w-0 flex-1 rounded-lg border border-line-subtle bg-surface-raised p-3">
                <p className="text-xs font-medium text-text-secondary">{stage.label}</p>
                {stage.value === null ? (
                  <p className="mt-1 flex items-center gap-1.5 text-text-muted">
                    <Unplug aria-hidden className="size-4 shrink-0" />
                    <span className="font-display text-xl leading-none">{formatUnavailable()}</span>
                  </p>
                ) : (
                  <>
                    <p className="kpi-number mt-1 text-xl leading-none font-semibold text-text-primary">{formatInt(stage.value)}</p>
                    <p className="mt-1 text-[0.6875rem] text-text-muted">{stage.unit}</p>
                  </>
                )}
                {stage.value === null ? (
                  <p className="mt-2 text-[0.6875rem] text-text-muted">sem evento configurado</p>
                ) : (
                  <div aria-hidden className="mt-2 h-1 rounded-full bg-surface-sunken">
                    <div className="h-1 rounded-full bg-chart-1" style={{ minWidth: MICROBAR_MIN_PX, width: `${String(pct)}%` }} />
                  </div>
                )}
              </div>
              {nextStage ? (
                <div className="flex shrink-0 items-center justify-center @sm:w-20">
                  <span className="kpi-number text-center text-[0.6875rem] font-semibold text-text-secondary">
                    {rateAvailable && stage.value !== null && nextStage.value !== null
                      ? formatRateWithVolume(nextStage.value, stage.value)
                      : formatUnavailable()}
                  </span>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
