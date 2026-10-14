import { Filter } from 'lucide-react';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';

import { useAnimateOnce } from '@/components/visuals/charts/chartTheme';
import { formatInt, formatPercent, formatRateWithVolume } from '@/lib/format';
import { cn } from '@/lib/utils';
import { data as defaultData, type ReferralFraction } from './data';

/**
 * Pizza de fração única como glifo de KPI: duas fatias, a parte de indicação em destaque e o
 * restante em neutro, com o número grande ao lado do glifo (nunca dentro da pizza cheia) e o par
 * volume e fração escrito abaixo dele. Cartão próprio em HTML com Tailwind, porque a moldura é
 * `stage`: o `PieChart` fica pequeno, só como glifo decorativo ao lado do texto.
 */
export interface ReferralShareCardProps {
  readonly data?: ReferralFraction;
  readonly height?: number;
  readonly className?: string;
}

/** Ângulo inicial às 12 horas, sentido horário: mesma convenção da família Pizza. */
const START_ANGLE = 90;
const END_ANGLE = -270;

export default function ReferralShareCard({ data = defaultData, height, className }: ReferralShareCardProps) {
  const animate = useAnimateOnce();
  const style = height === undefined ? undefined : { height };
  const { label, periodLabel, total, referrals } = data;

  if (total <= 0) {
    return (
      <div
        className={cn(
          'flex h-full w-full min-w-0 items-center gap-2 rounded-lg border border-line-subtle bg-surface-raised p-4 text-xs text-text-muted',
          className,
        )}
        role="status"
        style={style}
      >
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade ganha neste recorte: sem base para calcular a fração de indicação.</span>
      </div>
    );
  }

  const others = total - referrals;
  const fraction = referrals / total;
  const slices = [
    { id: 'indicacao', value: referrals },
    { id: 'outras-origens', value: others },
  ] as const;

  const summary = `Gráfico de pizza de fração única: ${label.toLowerCase()} no ${periodLabel}. ${formatPercent(fraction, 1)} (${formatInt(referrals)} de ${formatInt(total)}) vieram de indicação; os demais ${formatInt(others)} (${formatPercent(1 - fraction, 1)}) vieram de outras origens.`;

  return (
    <article
      aria-label={summary}
      className={cn(
        'flex h-full w-full min-w-0 flex-col justify-center gap-1 rounded-lg border border-line-subtle bg-surface-raised p-4',
        className,
      )}
      role="group"
      style={style}
    >
      <div className="flex min-w-0 items-center gap-4">
        <div aria-hidden className="size-12 shrink-0">
          <ResponsiveContainer height="100%" width="100%">
            <PieChart accessibilityLayer={false}>
              <Pie
                cx="50%"
                cy="50%"
                data={slices}
                dataKey="value"
                endAngle={END_ANGLE}
                isAnimationActive={animate}
                nameKey="id"
                outerRadius="100%"
                startAngle={START_ANGLE}
                stroke="var(--surface-raised)"
                strokeWidth={2}
              >
                <Cell fill="var(--chart-1)" key="indicacao" />
                {/* Restante é fundo, não categoria (ponto delicado do estudo): pinta em
                    --line-strong, nunca em --surface-overlay, que no tema claro é o mesmo
                    branco do cartão e some o contorno da fatia. */}
                <Cell fill="var(--line-strong)" key="outras-origens" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs leading-none font-medium text-text-secondary">{label}</p>
          <p className="kpi-number mt-0.5 text-3xl leading-none font-semibold text-text-primary">{formatPercent(fraction, 1)}</p>
          <p className="mt-0.5 truncate text-xs leading-none text-text-muted tabular-nums">{formatRateWithVolume(referrals, total)}</p>
        </div>
      </div>
      {/* ROT-10: numa pizza, toda parte precisa de nome e número no desenho parado, para os
          percentuais impressos somarem o todo; o restante não pode ficar mudo. */}
      <p className="text-[0.6875rem] leading-none text-text-muted tabular-nums">
        Demais {formatInt(others)} ({formatPercent(1 - fraction, 1)}) de outras origens
      </p>
    </article>
  );
}
