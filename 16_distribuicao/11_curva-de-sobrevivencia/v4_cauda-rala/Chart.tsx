import { Filter } from 'lucide-react';
import type { ReactElement } from 'react';
import { CartesianGrid, ComposedChart, Line, ReferenceLine, ResponsiveContainer, Scatter, XAxis, YAxis } from 'recharts';

import { AXIS_PROPS, GRID_COLOR } from '@/components/visuals/charts/chartTheme';
import { formatDays, formatInt, formatPercent } from '@/lib/format';
import { cn } from '@/lib/utils';
import { AXIS_STEP_DAYS, data as defaultData, DOMAIN_END_DAYS, LATE_DAY, LOW_RISK, type OpportunityCase } from './data';

/**
 * Curva de Kaplan-Meier com a cauda rala assumida no desenho. Cada degrau divide pelos casos ainda em
 * risco, então perto do fim um único caso mexe a curva vários pontos percentuais. A curva fica
 * tracejada a partir do dia em que restam menos de LOW_RISK casos em risco, o eixo X não se estica
 * para a cauda ocupar o gráfico, e a tabela de em risco deixa o número pequeno à vista.
 */
export interface SparseTailSurvivalProps {
  readonly data?: readonly OpportunityCase[];
  readonly height?: number;
  readonly className?: string;
}

interface KmStep {
  readonly days: number;
  readonly survival: number;
  /** Casos ainda em risco no dia, antes dos eventos e das censuras dele. */
  readonly atRisk: number;
}

interface CurveRow {
  readonly days: number;
  readonly solid: number | null;
  readonly tail: number | null;
}

const Y_AXIS_WIDTH = 52;
const MARGIN = { top: 10, right: 24, bottom: 0, left: 8 } as const;
const GUTTER = MARGIN.left + Y_AXIS_WIDTH;
/** EIX-6b: `tickMargin` de 8 mais cerca de 15 px de tinta de 11 px. */
const X_AXIS_HEIGHT = 26;
const CURVE_STROKE = 'var(--chart-1)';
const GUIDE_STROKE = 'var(--line-strong)';
const Y_TICKS = [0, 0.25, 0.5, 0.75, 1] as const;
const CENSOR_HALF_HEIGHT = 4;
const HALO = { paintOrder: 'stroke', stroke: 'var(--surface-raised)', strokeLinejoin: 'round', strokeWidth: 4 } as const;

/** Kaplan-Meier com eventos e censuras agrupados por dia; guarda também quantos casos estavam em risco em cada degrau. */
function kaplanMeier(cases: readonly OpportunityCase[]): KmStep[] {
  const byDay = new Map<number, { events: number; censored: number }>();
  for (const item of cases) {
    const group = byDay.get(item.days) ?? { events: 0, censored: 0 };
    if (item.decided) group.events += 1;
    else group.censored += 1;
    byDay.set(item.days, group);
  }
  let atRisk = cases.length;
  let survival = 1;
  const steps: KmStep[] = [{ days: 0, survival: 1, atRisk }];
  for (const day of [...byDay.keys()].sort((a, b) => a - b)) {
    const group = byDay.get(day);
    if (!group) continue;
    if (group.events > 0) survival *= 1 - group.events / atRisk;
    steps.push({ days: day, survival, atRisk });
    atRisk -= group.events + group.censored;
  }
  return steps;
}

function survivalAt(steps: readonly KmStep[], day: number): number {
  let value = 1;
  for (const step of steps) if (step.days <= day) value = step.survival;
  return value;
}

const renderCensorTick = ({ cx, cy }: { readonly cx?: number; readonly cy?: number }): ReactElement => (
  <line stroke={CURVE_STROKE} strokeWidth={1.5} x1={cx} x2={cx} y1={(cy ?? 0) - CENSOR_HALF_HEIGHT} y2={(cy ?? 0) + CENSOR_HALF_HEIGHT} />
);

export default function SparseTailSurvival({ data = defaultData, height, className }: SparseTailSurvivalProps) {
  const style = height === undefined ? undefined : { height };

  if (data.length === 0) {
    return (
      <div className={cn('flex h-full w-full min-w-0 items-center gap-2 text-xs text-text-muted', className)} role="status" style={style}>
        <Filter aria-hidden className="size-4 shrink-0" />
        <span>Nenhuma oportunidade neste recorte: não há tempo até a decisão para estimar.</span>
      </div>
    );
  }

  const steps = kaplanMeier(data);
  const longest = data.reduce((most, item) => Math.max(most, item.days), 0);
  /** O domínio só passa da constante se o dado passar dela; esticar até o fim da cauda é justamente o que a peça evita. */
  const ceiling = Math.max(DOMAIN_END_DAYS, Math.ceil(longest / AXIS_STEP_DAYS) * AXIS_STEP_DAYS);
  const ticks = Array.from({ length: ceiling / AXIS_STEP_DAYS + 1 }, (_, index) => index * AXIS_STEP_DAYS);
  const riskAt = (day: number): number => data.filter((item) => item.days >= day).length;
  const firstThin = steps.findIndex((step) => step.atRisk < LOW_RISK);
  const tailStart = firstThin <= 0 ? null : (steps[firstThin]?.days ?? null);
  const joinHeight = firstThin <= 0 ? 1 : (steps[firstThin - 1]?.survival ?? 1);

  /** Duas séries com um ponto em comum: o degrau horizontal até o dia da cauda é sólido, e a queda dali em diante é tracejada. */
  const rows: CurveRow[] = steps.map((step, index) => ({
    days: step.days,
    solid: firstThin <= 0 || index < firstThin ? step.survival : null,
    tail: firstThin > 0 && index >= firstThin ? step.survival : null,
  }));
  if (tailStart !== null) rows.splice(firstThin, 0, { days: tailStart, solid: joinHeight, tail: joinHeight });

  const censorDays = [...new Set(data.filter((item) => !item.decided).map((item) => item.days))].sort((a, b) => a - b);
  const censors = censorDays.map((day) => ({ days: day, survival: survivalAt(steps, day) }));
  const open = data.filter((item) => !item.decided).length;
  const lateRisk = riskAt(LATE_DAY);
  const lateShare = survivalAt(steps, LATE_DAY);

  const renderTailLabel = ({ viewBox }: { readonly viewBox?: { readonly x?: number; readonly y?: number } }): ReactElement => (
    <text className="tabular-nums" fill="var(--text-muted)" fontSize={11} style={HALO} textAnchor="end" x={(viewBox?.x ?? 0) - 6} y={(viewBox?.y ?? 0) + 12}>
      {`menos de ${formatInt(LOW_RISK)} em risco: queda não confiável`}
    </text>
  );

  const summary =
    `Curva de sobrevivência de ${formatInt(data.length)} oportunidades até a decisão, com ${formatInt(open)} abertas contadas como censura. ` +
    (tailStart === null
      ? `Nenhum dia tem menos de ${formatInt(LOW_RISK)} casos em risco. `
      : `A curva fica tracejada a partir do dia ${formatInt(tailStart)}, quando restam menos de ${formatInt(LOW_RISK)} em risco. `) +
    `Aos ${formatDays(LATE_DAY)} restam ${formatInt(lateRisk)} em risco e a curva marca ${formatPercent(lateShare, 0)}.`;

  return (
    <figure aria-label={summary} className={cn('m-0 flex h-full w-full min-w-0 flex-col gap-2', className)} role="figure" style={style}>
      <p aria-hidden className="m-0 shrink-0 text-xs leading-4 text-text-secondary">
        {`Depois de ${formatDays(LATE_DAY)} restam só ${formatInt(lateRisk)} oportunidades em risco, de ${formatInt(data.length)}`}
      </p>
      <span aria-hidden className="shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        oportunidades ainda sem decisão, por dia desde a abertura
      </span>

      <div aria-hidden className="min-h-0 flex-1">
        <ResponsiveContainer height="100%" width="100%">
          <ComposedChart data={rows} margin={MARGIN}>
            <CartesianGrid stroke={GRID_COLOR} />
            <XAxis {...AXIS_PROPS} axisLine={false} dataKey="days" domain={[0, ceiling]} height={X_AXIS_HEIGHT} tickFormatter={(value: number) => formatInt(value)} tickLine={false} tickMargin={8} ticks={ticks} type="number" />
            <YAxis {...AXIS_PROPS} axisLine={false} domain={[0, 1]} tickFormatter={(value: number) => formatPercent(value, 0)} tickLine={false} tickMargin={8} ticks={[...Y_TICKS]} type="number" width={Y_AXIS_WIDTH} />
            {tailStart === null ? null : <ReferenceLine ifOverflow="extendDomain" label={renderTailLabel} stroke={GUIDE_STROKE} strokeDasharray="4 3" x={tailStart} />}
            <Line connectNulls={false} dataKey="solid" dot={false} isAnimationActive={false} stroke={CURVE_STROKE} strokeWidth={2} type="stepAfter" />
            <Line connectNulls={false} dataKey="tail" dot={false} isAnimationActive={false} stroke={CURVE_STROKE} strokeDasharray="4 3" strokeWidth={2} type="stepAfter" />
            <Scatter data={censors} dataKey="survival" isAnimationActive={false} legendType="none" shape={renderCensorTick} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* Mesmas margens do gráfico; o número abaixo do piso sai em peso 600 e na cor do texto principal, para a cauda rala ser vista. */}
      <div aria-hidden className="relative h-4 shrink-0 text-[0.6875rem] leading-4 text-text-muted">
        <span className="absolute left-0">em risco</span>
        <div className="absolute inset-y-0" style={{ left: GUTTER, right: MARGIN.right }}>
          {ticks.map((tick) => {
            const count = riskAt(tick);
            return (
              <span className={cn('absolute -translate-x-1/2 tabular-nums', count < LOW_RISK ? 'font-semibold text-text-primary' : 'text-text-secondary')} key={tick} style={{ left: `${String((tick / ceiling) * 100)}%` }}>
                {formatInt(count)}
              </span>
            );
          })}
        </div>
      </div>

      <div aria-hidden className="flex shrink-0 flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] leading-4 text-text-muted">
        <span>{`abaixo de ${formatInt(LOW_RISK)} casos em risco a queda não é confiável: curva tracejada e número em destaque`}</span>
        <span>{`eixo fixo em ${formatDays(DOMAIN_END_DAYS)}; traço vertical na curva: oportunidade ainda aberta`}</span>
      </div>
    </figure>
  );
}
